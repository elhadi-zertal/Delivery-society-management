import { connectDB } from '@/lib/db';
import Driver from '@/models/Driver';
import DeliveryTour from '@/models/DeliveryTour';
import { TourStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateDriverSchema } from '@/lib/validations/schemas';

/**
 * GET /api/drivers/[id]
 * Get a single driver
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const driver = await Driver.findById(id);

    if (!driver) {
        return errorResponse('Driver not found', 404);
    }

    return successResponse(driver);
});

/**
 * PUT /api/drivers/[id]
 * Update a driver
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateDriverSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const driver = await Driver.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!driver) {
        return errorResponse('Driver not found', 404);
    }

    return successResponse(driver, 'Driver updated successfully');
});

/**
 * DELETE /api/drivers/[id]
 * Delete a driver
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    // Check for active tours
    const activeTours = await DeliveryTour.countDocuments({
        driver: id,
        status: { $in: [TourStatus.PLANNED, TourStatus.IN_PROGRESS] },
    });

    if (activeTours > 0) {
        return errorResponse(
            'Cannot delete driver with active tours. Complete or cancel tours first.',
            400
        );
    }

    const driver = await Driver.findByIdAndDelete(id);

    if (!driver) {
        return errorResponse('Driver not found', 404);
    }

    return successResponse(null, 'Driver deleted successfully');
});
