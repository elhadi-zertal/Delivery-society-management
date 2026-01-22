import { connectDB } from '@/lib/db';
import Pricing from '@/models/Pricing';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updatePricingSchema } from '@/lib/validations/schemas';

/**
 * GET /api/pricing/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const pricing = await Pricing.findById(id)
        .populate('serviceType')
        .populate('destination');

    if (!pricing) {
        return errorResponse('Pricing not found', 404);
    }

    return successResponse(pricing);
});

/**
 * PUT /api/pricing/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updatePricingSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const pricing = await Pricing.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    ).populate('serviceType destination');

    if (!pricing) {
        return errorResponse('Pricing not found', 404);
    }

    return successResponse(pricing, 'Pricing updated successfully');
});

/**
 * DELETE /api/pricing/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const pricing = await Pricing.findByIdAndDelete(id);

    if (!pricing) {
        return errorResponse('Pricing not found', 404);
    }

    return successResponse(null, 'Pricing deleted successfully');
});
