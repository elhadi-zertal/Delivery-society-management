import { connectDB } from '@/lib/db';
import ServiceType from '@/models/ServiceType';
import Pricing from '@/models/Pricing';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateServiceTypeSchema } from '@/lib/validations/schemas';

/**
 * GET /api/service-types/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const serviceType = await ServiceType.findById(id);

    if (!serviceType) {
        return errorResponse('Service type not found', 404);
    }

    return successResponse(serviceType);
});

/**
 * PUT /api/service-types/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateServiceTypeSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const serviceType = await ServiceType.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!serviceType) {
        return errorResponse('Service type not found', 404);
    }

    return successResponse(serviceType, 'Service type updated successfully');
});

/**
 * DELETE /api/service-types/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const pricingCount = await Pricing.countDocuments({ serviceType: id });

    if (pricingCount > 0) {
        return errorResponse(
            'Cannot delete service type with existing pricing rules. Deactivate instead.',
            400
        );
    }

    const serviceType = await ServiceType.findByIdAndDelete(id);

    if (!serviceType) {
        return errorResponse('Service type not found', 404);
    }

    return successResponse(null, 'Service type deleted successfully');
});
