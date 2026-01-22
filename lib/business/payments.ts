import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { InvoiceStatus, PaymentMethod } from '@/types';

export interface RecordPaymentParams {
    invoiceId: string | Types.ObjectId;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date;
    reference?: string;
    notes?: string;
}

/**
 * Record a payment for an invoice and update client balance
 */
export async function recordPayment(params: RecordPaymentParams) {
    await connectDB();

    const {
        invoiceId,
        amount,
        paymentMethod,
        paymentDate = new Date(),
        reference,
        notes,
    } = params;

    // Get invoice
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new Error('Cannot record payment for a cancelled invoice');
    }

    if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Invoice is already fully paid');
    }

    // Validate payment amount
    if (amount <= 0) {
        throw new Error('Payment amount must be positive');
    }

    if (amount > invoice.amountDue) {
        throw new Error(`Payment amount (${amount}) exceeds amount due (${invoice.amountDue})`);
    }

    // Create payment record
    const payment = new Payment({
        invoice: invoiceId,
        client: invoice.client,
        amount,
        paymentMethod,
        paymentDate,
        reference,
        notes,
    });

    await payment.save();

    // Update invoice
    invoice.amountPaid += amount;
    invoice.amountDue = Math.round((invoice.totalTTC - invoice.amountPaid) * 100) / 100;

    if (invoice.amountDue <= 0) {
        invoice.status = InvoiceStatus.PAID;
        invoice.amountDue = 0;
    } else {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();

    // Update client account balance (positive balance = credit)
    await Client.findByIdAndUpdate(invoice.client, {
        $inc: { accountBalance: amount },
    });

    return { payment, invoice };
}

/**
 * Cancel a payment and reverse the balance updates
 */
export async function cancelPayment(paymentId: string | Types.ObjectId) {
    await connectDB();

    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error('Payment not found');
    }

    // Get invoice
    const invoice = await Invoice.findById(payment.invoice);

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    // Reverse invoice amounts
    invoice.amountPaid -= payment.amount;
    invoice.amountDue = Math.round((invoice.totalTTC - invoice.amountPaid) * 100) / 100;

    if (invoice.amountPaid <= 0) {
        invoice.status = InvoiceStatus.PENDING;
        invoice.amountPaid = 0;
    } else {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();

    // Reverse client balance
    await Client.findByIdAndUpdate(payment.client, {
        $inc: { accountBalance: -payment.amount },
    });

    // Delete payment
    await Payment.findByIdAndDelete(paymentId);

    return invoice;
}

/**
 * Get payment history for an invoice
 */
export async function getInvoicePayments(invoiceId: string | Types.ObjectId) {
    await connectDB();

    const payments = await Payment.findByInvoice(invoiceId);
    const total = await Payment.getTotalPaidForInvoice(invoiceId);

    return { payments, total };
}

/**
 * Get payment history for a client
 */
export async function getClientPayments(clientId: string | Types.ObjectId) {
    await connectDB();

    const payments = await Payment.findByClient(clientId);

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return { payments, total };
}

/**
 * Get client balance summary
 */
export async function getClientBalanceSummary(clientId: string | Types.ObjectId) {
    await connectDB();

    const client = await Client.findById(clientId);

    if (!client) {
        throw new Error('Client not found');
    }

    // Get pending invoices
    const pendingInvoices = await Invoice.find({
        client: clientId,
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
    });

    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);

    return {
        accountBalance: client.accountBalance,
        totalPending,
        pendingInvoicesCount: pendingInvoices.length,
    };
}
