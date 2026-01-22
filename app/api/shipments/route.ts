import { connectDB } from '@/lib/db';
import Shipment from '@/models/Shipment';
import { ShipmentStatus } from '@/types';
import { calculateShipmentPrice, estimateDeliveryDate } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSearchFilter,
    buildSortOptions,
    buildStatusFilter,
    buildDateRangeFilter,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createShipmentSchema } from '@/lib/validations/schemas';

/**
 * GET /api/shipments
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const searchFilter = buildSearchFilter(searchParams, ['shipmentNumber', 'senderName', 'receiverName']);
    const statusFilter = buildStatusFilter(searchParams);
    const dateFilter = buildDateRangeFilter(searchParams);
    const sortOptions = buildSortOptions(searchParams);

    const filter: Record<string, unknown> = {
        ...searchFilter,
        ...statusFilter,
        ...dateFilter,
    };

    const client = searchParams.get('client');
    if (client) {
        filter.client = client;
    }

    const isInvoiced = searchParams.get('isInvoiced');
    if (isInvoiced !== null) {
        filter.isInvoiced = isInvoiced === 'true';
    }

    const [shipments, total] = await Promise.all([
        Shipment.find(filter)
            .populate('client')
            .populate('serviceType')
            .populate('destination')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        Shipment.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(shipments, undefined, pagination);
});

/**
 * POST /api/shipments
 */
export const POST = withErrorHandler(async (request: Request) => {
    const { user } = await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createShipmentSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const data = parsed.data;

    // Calculate price
    const priceResult = await calculateShipmentPrice({
        serviceTypeId: data.serviceType,
        destinationId: data.destination,
        packages: data.packages.map(p => ({
            weight: p.weight,
            volume: p.volume,
            quantity: p.quantity,
        })),
    });

    // Estimate delivery date
    const pickupDate = data.pickupDate || new Date();
    const deliveryEstimate = await estimateDeliveryDate(data.serviceType, pickupDate);

    // Create shipment
    const shipment = new Shipment({
        ...data,
        priceBreakdown: {
            baseAmount: priceResult.baseAmount,
            weightAmount: priceResult.weightAmount,
            volumeAmount: priceResult.volumeAmount,
            additionalFees: 0,
            discount: 0,
        },
        totalAmount: priceResult.totalAmount,
        status: ShipmentStatus.PENDING,
        pickupDate,
        estimatedDeliveryDate: deliveryEstimate.max,
        trackingHistory: [{
            timestamp: new Date(),
            status: ShipmentStatus.PENDING,
            description: 'Shipment created',
            updatedBy: user.id,
        }],
    });

    await shipment.save();
    await shipment.populate('client serviceType destination');

    return createdResponse(shipment, 'Shipment created successfully');
});
