import { connectDB } from '@/lib/db';
import Destination from '@/models/Destination';
import Pricing from '@/models/Pricing';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateDestinationSchema } from '@/lib/validations/schemas';

/**
 * GET /api/destinations/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const destination = await Destination.findById(id);

    if (!destination) {
        return errorResponse('Destination not found', 404);
    }

    return successResponse(destination);
});

/**
 * PUT /api/destinations/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateDestinationSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const destination = await Destination.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!destination) {
        return errorResponse('Destination not found', 404);
    }

    return successResponse(destination, 'Destination updated successfully');
});

/**
 * DELETE /api/destinations/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    // Check for related pricing
    const pricingCount = await Pricing.countDocuments({ destination: id });

    if (pricingCount > 0) {
        return errorResponse(
            'Cannot delete destination with existing pricing rules. Deactivate instead.',
            400
        );
    }

    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
        return errorResponse('Destination not found', 404);
    }

    return successResponse(null, 'Destination deleted successfully');
});
