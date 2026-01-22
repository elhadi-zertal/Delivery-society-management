import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';
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
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createVehicleSchema } from '@/lib/validations/schemas';

/**
 * GET /api/vehicles
 * List all vehicles with pagination and filters
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const searchFilter = buildSearchFilter(searchParams, ['registrationNumber', 'brand', 'model']);
    const statusFilter = buildStatusFilter(searchParams);
    const sortOptions = buildSortOptions(searchParams);

    const filter: Record<string, unknown> = { ...searchFilter, ...statusFilter };

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const type = searchParams.get('type');
    if (type) {
        filter.type = type;
    }

    // Filter available vehicles
    const availableOnly = searchParams.get('available');
    if (availableOnly === 'true') {
        const vehicles = await Vehicle.findAvailable();
        return successResponse(vehicles);
    }

    // Filter by capacity
    const minWeight = searchParams.get('minWeight');
    const minVolume = searchParams.get('minVolume');
    if (minWeight || minVolume) {
        const weight = parseFloat(minWeight || '0');
        const volume = parseFloat(minVolume || '0');
        const vehicles = await Vehicle.findByCapacity(weight, volume);
        return successResponse(vehicles);
    }

    const [vehicles, total] = await Promise.all([
        Vehicle.find(filter).sort(sortOptions).skip(skip).limit(limit),
        Vehicle.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(vehicles, undefined, pagination);
});

/**
 * POST /api/vehicles
 * Create a new vehicle
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createVehicleSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const vehicle = new Vehicle(parsed.data);
    await vehicle.save();

    return createdResponse(vehicle, 'Vehicle created successfully');
});
