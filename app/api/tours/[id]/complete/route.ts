import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import Shipment from '@/models/Shipment';
import { TourStatus, DriverStatus, VehicleStatus, ShipmentStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { completeTourSchema } from '@/lib/validations/schemas';

/**
 * PATCH /api/tours/[id]/complete
 * Mark a delivery tour as complete
 */
export const PATCH = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = completeTourSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const tour = await DeliveryTour.findById(id);

    if (!tour) {
        return errorResponse('Delivery tour not found', 404);
    }

    if (tour.status === TourStatus.COMPLETED) {
        return errorResponse('Tour is already completed', 400);
    }

    if (tour.status === TourStatus.CANCELLED) {
        return errorResponse('Cannot complete a cancelled tour', 400);
    }

    const { actualRoute, deliveriesCompleted, deliveriesFailed, notes } = parsed.data;

    // Update tour
    tour.status = TourStatus.COMPLETED;
    tour.actualRoute = actualRoute;
    tour.deliveriesCompleted = deliveriesCompleted;
    tour.deliveriesFailed = deliveriesFailed;
    if (notes) tour.notes = notes;

    await tour.save();

    // Restore driver and vehicle status
    await Driver.findByIdAndUpdate(tour.driver, { status: DriverStatus.AVAILABLE });
    await Vehicle.findByIdAndUpdate(tour.vehicle, {
        status: VehicleStatus.AVAILABLE,
        $inc: { mileage: actualRoute.actualDistance || 0 },
    });

    // Update shipments that were delivered
    const shipmentsToUpdate = await Shipment.find({
        deliveryTour: tour._id,
        status: { $ne: ShipmentStatus.DELIVERED },
    });

    for (const shipment of shipmentsToUpdate) {
        // Mark remaining shipments based on delivery success
        const newStatus = shipment.status === ShipmentStatus.OUT_FOR_DELIVERY
            ? ShipmentStatus.DELIVERED
            : ShipmentStatus.FAILED_DELIVERY;

        shipment.status = newStatus;
        if (newStatus === ShipmentStatus.DELIVERED) {
            shipment.actualDeliveryDate = new Date();
        }

        shipment.trackingHistory.push({
            timestamp: new Date(),
            status: newStatus,
            description: newStatus === ShipmentStatus.DELIVERED
                ? 'Delivered successfully'
                : 'Delivery failed',
        });

        await shipment.save();
    }

    await tour.populate('driver vehicle shipments');

    return successResponse(tour, 'Delivery tour completed successfully');
});
