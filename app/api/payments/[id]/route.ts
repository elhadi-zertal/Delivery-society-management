import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import { cancelPayment } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/payments/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const payment = await Payment.findById(id)
        .populate('invoice')
        .populate('client');

    if (!payment) {
        return errorResponse('Payment not found', 404);
    }

    return successResponse(payment);
});

/**
 * DELETE /api/payments/[id]
 * Cancel a payment
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    try {
        const invoice = await cancelPayment(id);
        return successResponse({ invoice }, 'Payment cancelled successfully');
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }
        throw error;
    }
});
