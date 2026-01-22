import { connectDB } from '@/lib/db';
import { recordPayment, getInvoicePayments } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { recordPaymentSchema } from '@/lib/validations/schemas';

/**
 * GET /api/invoices/[id]/payments
 * Get payment history for an invoice
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const result = await getInvoicePayments(id);

    return successResponse(result);
});

/**
 * POST /api/invoices/[id]/payments
 * Record a payment for an invoice
 */
export const POST = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = recordPaymentSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    try {
        const result = await recordPayment({
            invoiceId: id,
            amount: parsed.data.amount,
            paymentMethod: parsed.data.paymentMethod,
            paymentDate: parsed.data.paymentDate,
            reference: parsed.data.reference,
            notes: parsed.data.notes,
        });

        return createdResponse(result, 'Payment recorded successfully');
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }
        throw error;
    }
});
