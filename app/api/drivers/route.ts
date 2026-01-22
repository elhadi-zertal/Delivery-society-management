import { connectDB } from '@/lib/db';
import Driver from '@/models/Driver';
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
import { createDriverSchema } from '@/lib/validations/schemas';

/**
 * GET /api/drivers
 * List all drivers with pagination and filters
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const searchFilter = buildSearchFilter(searchParams, ['firstName', 'lastName', 'email']);
    const statusFilter = buildStatusFilter(searchParams);
    const sortOptions = buildSortOptions(searchParams);

    const filter: Record<string, unknown> = { ...searchFilter, ...statusFilter };

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    // Filter available drivers only
    const availableOnly = searchParams.get('available');
    if (availableOnly === 'true') {
        const drivers = await Driver.findAvailable();
        return successResponse(drivers);
    }

    const [drivers, total] = await Promise.all([
        Driver.find(filter).sort(sortOptions).skip(skip).limit(limit),
        Driver.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(drivers, undefined, pagination);
});

/**
 * POST /api/drivers
 * Create a new driver
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createDriverSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const driver = new Driver(parsed.data);
    await driver.save();

    return createdResponse(driver, 'Driver created successfully');
});
