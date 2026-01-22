import { connectDB } from '@/lib/db';
import Destination from '@/models/Destination';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSearchFilter,
    buildSortOptions,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createDestinationSchema, updateDestinationSchema } from '@/lib/validations/schemas';

/**
 * GET /api/destinations
 * List all destinations with pagination and filters
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const searchFilter = buildSearchFilter(searchParams, ['city', 'country', 'zone']);
    const sortOptions = buildSortOptions(searchParams, 'country');

    const filter: Record<string, unknown> = { ...searchFilter };

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const zone = searchParams.get('zone');
    if (zone) {
        filter.zone = zone;
    }

    const country = searchParams.get('country');
    if (country) {
        filter.country = country;
    }

    const [destinations, total] = await Promise.all([
        Destination.find(filter).sort(sortOptions).skip(skip).limit(limit),
        Destination.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(destinations, undefined, pagination);
});

/**
 * POST /api/destinations
 * Create a new destination
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createDestinationSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const destination = new Destination(parsed.data);
    await destination.save();

    return createdResponse(destination, 'Destination created successfully');
});
