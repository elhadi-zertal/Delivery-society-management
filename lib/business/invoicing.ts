import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Shipment from '@/models/Shipment';
import Client from '@/models/Client';
import { InvoiceStatus, ShipmentStatus } from '@/types';

const TVA_RATE = 0.19; // 19%

export interface GenerateInvoiceParams {
    clientId: string | Types.ObjectId;
    shipmentIds: (string | Types.ObjectId)[];
    dueInDays?: number;
    notes?: string;
}

export interface InvoiceCalculation {
    amountHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
}

/**
 * Calculate invoice totals from amount HT
 */
export function calculateInvoiceTotals(amountHT: number): InvoiceCalculation {
    const tvaAmount = Math.round(amountHT * TVA_RATE * 100) / 100;
    const totalTTC = Math.round((amountHT + tvaAmount) * 100) / 100;

    return {
        amountHT: Math.round(amountHT * 100) / 100,
        tvaRate: TVA_RATE,
        tvaAmount,
        totalTTC,
    };
}

/**
 * Generate an invoice from shipments
 */
export async function generateInvoice(params: GenerateInvoiceParams) {
    await connectDB();

    const { clientId, shipmentIds, dueInDays = 30, notes } = params;

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
        throw new Error('Client not found');
    }

    // Get shipments and validate they belong to the client and are not invoiced
    const shipments = await Shipment.find({
        _id: { $in: shipmentIds },
        client: clientId,
        isInvoiced: false,
        status: { $in: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED] },
    });

    if (shipments.length === 0) {
        throw new Error('No valid shipments found for invoicing');
    }

    if (shipments.length !== shipmentIds.length) {
        const foundIds = shipments.map(s => s._id.toString());
        const missingIds = shipmentIds.filter(id => !foundIds.includes(id.toString()));
        throw new Error(`Some shipments are invalid or already invoiced: ${missingIds.join(', ')}`);
    }

    // Calculate total amount HT from shipments
    const amountHT = shipments.reduce((sum, shipment) => sum + shipment.totalAmount, 0);

    // Calculate invoice totals
    const totals = calculateInvoiceTotals(amountHT);

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueInDays);

    // Create invoice
    const invoice = new Invoice({
        client: clientId,
        shipments: shipmentIds,
        amountHT: totals.amountHT,
        tvaRate: totals.tvaRate,
        tvaAmount: totals.tvaAmount,
        totalTTC: totals.totalTTC,
        amountPaid: 0,
        amountDue: totals.totalTTC,
        status: InvoiceStatus.PENDING,
        issueDate: new Date(),
        dueDate,
        notes,
    });

    await invoice.save();

    // Mark shipments as invoiced
    await Shipment.updateMany(
        { _id: { $in: shipmentIds } },
        { $set: { isInvoiced: true, invoice: invoice._id } }
    );

    return invoice;
}

/**
 * Cancel an invoice and update related shipments
 */
export async function cancelInvoice(invoiceId: string | Types.ObjectId) {
    await connectDB();

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Cannot cancel a paid invoice');
    }

    // If there were partial payments, we need to handle them
    if (invoice.amountPaid > 0) {
        // Update client balance (refund the payments)
        await Client.findByIdAndUpdate(invoice.client, {
            $inc: { accountBalance: -invoice.amountPaid },
        });
    }

    // Mark invoice as cancelled
    invoice.status = InvoiceStatus.CANCELLED;
    await invoice.save();

    // Mark shipments as not invoiced
    await Shipment.updateMany(
        { _id: { $in: invoice.shipments } },
        { $set: { isInvoiced: false }, $unset: { invoice: 1 } }
    );

    return invoice;
}

/**
 * Get invoice with populated references
 */
export async function getInvoiceDetails(invoiceId: string | Types.ObjectId) {
    await connectDB();

    const invoice = await Invoice.findById(invoiceId)
        .populate('client')
        .populate({
            path: 'shipments',
            populate: [
                { path: 'serviceType' },
                { path: 'destination' },
            ],
        });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    return invoice;
}
