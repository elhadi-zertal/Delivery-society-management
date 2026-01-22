import { connectDB } from '@/lib/db';
import ServiceType from '@/models/ServiceType';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSortOptions,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createServiceTypeSchema, updateServiceTypeSchema } from '@/lib/validations/schemas';

/**
 * GET /api/service-types
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortOptions = buildSortOptions(searchParams, 'name');

    const filter: Record<string, unknown> = {};

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const [serviceTypes, total] = await Promise.all([
        ServiceType.find(filter).sort(sortOptions).skip(skip).limit(limit),
        ServiceType.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(serviceTypes, undefined, pagination);
});

/**
 * POST /api/service-types
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createServiceTypeSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const serviceType = new ServiceType(parsed.data);
    await serviceType.save();

    return createdResponse(serviceType, 'Service type created successfully');
});
