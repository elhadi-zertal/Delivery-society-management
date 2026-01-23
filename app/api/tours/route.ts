import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import Shipment from '@/models/Shipment';
import Client from '@/models/Client';
import Destination from '@/models/Destination';
import Incident from '@/models/Incident';
import { TourStatus, DriverStatus, VehicleStatus, ShipmentStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSortOptions,
    buildStatusFilter,
    buildDateRangeFilter,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createTourSchema } from '@/lib/validations/schemas';

/**
 * GET /api/tours
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const statusFilter = buildStatusFilter(searchParams);
    const dateFilter = buildDateRangeFilter(searchParams, 'date');
    const sortOptions = buildSortOptions(searchParams, '-date');

    const filter: Record<string, unknown> = { ...statusFilter, ...dateFilter };

    const driver = searchParams.get('driver');
    if (driver) {
        filter.driver = driver;
    }

    const vehicle = searchParams.get('vehicle');
    if (vehicle) {
        filter.vehicle = vehicle;
    }

    const [tours, total] = await Promise.all([
        DeliveryTour.find(filter)
            .populate('driver')
            .populate('vehicle')
            .populate('shipments')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        DeliveryTour.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(tours, undefined, pagination);
});

/**
 * POST /api/tours
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createTourSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const data = parsed.data;

    // Validate driver availability
    const driver = await Driver.findById(data.driver);
    if (!driver) {
        return errorResponse('Driver not found', 404);
    }
    if (driver.status !== DriverStatus.AVAILABLE) {
        return errorResponse('Driver is not available', 400);
    }
    if (!driver.isActive) {
        return errorResponse('Driver is not active', 400);
    }

    // Validate vehicle availability
    const vehicle = await Vehicle.findById(data.vehicle);
    if (!vehicle) {
        return errorResponse('Vehicle not found', 404);
    }
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
        return errorResponse('Vehicle is not available', 400);
    }
    if (!vehicle.isActive) {
        return errorResponse('Vehicle is not active', 400);
    }

    // Validate shipments
    const shipments = await Shipment.find({
        _id: { $in: data.shipments },
        deliveryTour: { $exists: false },
        status: { $in: [ShipmentStatus.PENDING, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT] },
    });

    if (shipments.length !== data.shipments.length) {
        return errorResponse('Some shipments are invalid or already assigned to a tour', 400);
    }

    // Create tour
    const tour = new DeliveryTour({
        ...data,
        status: TourStatus.PLANNED,
    });

    await tour.save();

    // Update driver and vehicle status
    await Driver.findByIdAndUpdate(data.driver, { status: DriverStatus.ON_TOUR });
    await Vehicle.findByIdAndUpdate(data.vehicle, { status: VehicleStatus.IN_USE });

    // Assign shipments to tour
    await Shipment.updateMany(
        { _id: { $in: data.shipments } },
        {
            $set: {
                deliveryTour: tour._id,
                status: ShipmentStatus.IN_TRANSIT,
            },
            $push: {
                trackingHistory: {
                    timestamp: new Date(),
                    status: ShipmentStatus.IN_TRANSIT,
                    description: `Assigned to delivery tour ${tour.tourNumber}`,
                },
            },
        }
    );

    await tour.populate('driver vehicle shipments');

    return createdResponse(tour, 'Delivery tour created successfully');
});
