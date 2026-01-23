import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import { TourStatus, DriverStatus, VehicleStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * PATCH /api/tours/[id]/start
 * Mark a delivery tour as in progress
 */
export const PATCH = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const tour = await DeliveryTour.findById(id);

    if (!tour) {
        return errorResponse('Delivery tour not found', 404);
    }

    if (tour.status !== TourStatus.PLANNED) {
        return errorResponse(`Cannot start a tour that is in ${tour.status} status`, 400);
    }

    // Update tour status
    const updatedTour = await DeliveryTour.findByIdAndUpdate(
        id,
        {
            $set: {
                status: TourStatus.IN_PROGRESS,
                'actualRoute.startTime': new Date(),
            }
        },
        { new: true }
    ).populate('driver vehicle shipments');

    // Update driver and vehicle status
    await Driver.findByIdAndUpdate(tour.driver, { status: DriverStatus.ON_TOUR });
    await Vehicle.findByIdAndUpdate(tour.vehicle, { status: VehicleStatus.IN_USE });

    return successResponse(updatedTour, 'Delivery tour started successfully');
});
