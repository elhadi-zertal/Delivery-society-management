import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import DeliveryTour from '@/models/DeliveryTour';
import { TourStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateVehicleSchema } from '@/lib/validations/schemas';

/**
 * GET /api/vehicles/[id]
 * Get a single vehicle
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
        return errorResponse('Vehicle not found', 404);
    }

    return successResponse(vehicle);
});

/**
 * PUT /api/vehicles/[id]
 * Update a vehicle
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateVehicleSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!vehicle) {
        return errorResponse('Vehicle not found', 404);
    }

    return successResponse(vehicle, 'Vehicle updated successfully');
});

/**
 * DELETE /api/vehicles/[id]
 * Delete a vehicle
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
        vehicle: id,
        status: { $in: [TourStatus.PLANNED, TourStatus.IN_PROGRESS] },
    });

    if (activeTours > 0) {
        return errorResponse(
            'Cannot delete vehicle with active tours. Complete or cancel tours first.',
            400
        );
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
        return errorResponse('Vehicle not found', 404);
    }

    return successResponse(null, 'Vehicle deleted successfully');
});
