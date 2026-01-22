import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import { cancelInvoice, getInvoiceDetails } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateInvoiceSchema } from '@/lib/validations/schemas';

/**
 * GET /api/invoices/[id]
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
        return successResponse(invoice);
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 404);
        }
        throw error;
    }
});

/**
 * PUT /api/invoices/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const invoice = await Invoice.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    ).populate('client shipments');

    if (!invoice) {
        return errorResponse('Invoice not found', 404);
    }

    return successResponse(invoice, 'Invoice updated successfully');
});

/**
 * DELETE /api/invoices/[id]
 * Cancel and delete an invoice
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    try {
        await cancelInvoice(id);
        return successResponse(null, 'Invoice cancelled successfully');
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }
        throw error;
    }
});
