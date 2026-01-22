import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getInvoiceDetails } from '@/lib/business';
import { withErrorHandler, errorResponse } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/invoices/[id]/pdf
 * Generate PDF for an invoice
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    try {
        const invoice = await getInvoiceDetails(id);

        // Return invoice data for client-side PDF generation
        // The actual PDF is generated client-side using jsPDF
        const pdfData = {
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            client: {
                code: ((invoice.client as unknown) as Record<string, unknown>).code,
                name: `${((invoice.client as unknown) as Record<string, unknown>).firstName} ${((invoice.client as unknown) as Record<string, unknown>).lastName}`,
                companyName: ((invoice.client as unknown) as Record<string, unknown>).companyName,
                email: ((invoice.client as unknown) as Record<string, unknown>).email,
                phone: ((invoice.client as unknown) as Record<string, unknown>).phone,
                address: ((invoice.client as unknown) as Record<string, unknown>).address,
            },
            shipments: (invoice.shipments as unknown as Array<Record<string, unknown>>).map((s) => ({
                shipmentNumber: s.shipmentNumber,
                description: `${s.receiverName} - ${((s.destination as unknown) as Record<string, unknown>).city}`,
                amount: s.totalAmount,
            })),
            amountHT: invoice.amountHT,
            tvaRate: invoice.tvaRate,
            tvaAmount: invoice.tvaAmount,
            totalTTC: invoice.totalTTC,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            notes: invoice.notes,
        };

        return NextResponse.json({
            success: true,
            data: pdfData,
        });
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 404);
        }
        throw error;
    }
});
