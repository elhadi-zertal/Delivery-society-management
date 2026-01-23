import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import Shipment from '@/models/Shipment';
import Client from '@/models/Client';
import Destination from '@/models/Destination';
import Incident from '@/models/Incident';
import { TourStatus, DriverStatus, VehicleStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateTourSchema } from '@/lib/validations/schemas';

/**
 * GET /api/tours/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const tour = await DeliveryTour.findById(id)
        .populate('driver')
        .populate('vehicle')
        .populate({
            path: 'shipments',
            populate: ['client', 'destination'],
        })
        .populate('incidents');

    if (!tour) {
        return errorResponse('Delivery tour not found', 404);
    }

    return successResponse(tour);
});

/**
 * PUT /api/tours/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateTourSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const tour = await DeliveryTour.findById(id);
    if (!tour) {
        return errorResponse('Delivery tour not found', 404);
    }

    // Only allow updates for planned tours
    if (tour.status !== TourStatus.PLANNED) {
        return errorResponse('Cannot update a tour that is already in progress or completed', 400);
    }

    const updated = await DeliveryTour.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    ).populate('driver vehicle shipments');

    return successResponse(updated, 'Delivery tour updated successfully');
});

/**
 * DELETE /api/tours/[id]
 */
export const DELETE = withErrorHandler(async (
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

    if (tour.status === TourStatus.IN_PROGRESS) {
        return errorResponse('Cannot delete a tour in progress', 400);
    }

    // Restore driver and vehicle status
    await Driver.findByIdAndUpdate(tour.driver, { status: DriverStatus.AVAILABLE });
    await Vehicle.findByIdAndUpdate(tour.vehicle, { status: VehicleStatus.AVAILABLE });

    await DeliveryTour.findByIdAndDelete(id);

    return successResponse(null, 'Delivery tour deleted successfully');
});
