import { connectDB } from '@/lib/db';
import Pricing from '@/models/Pricing';
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
import { createPricingSchema, updatePricingSchema } from '@/lib/validations/schemas';

/**
 * GET /api/pricing
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortOptions = buildSortOptions(searchParams, '-effectiveFrom');

    const filter: Record<string, unknown> = {};

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const serviceType = searchParams.get('serviceType');
    if (serviceType) {
        filter.serviceType = serviceType;
    }

    const destination = searchParams.get('destination');
    if (destination) {
        filter.destination = destination;
    }

    const [pricingList, total] = await Promise.all([
        Pricing.find(filter)
            .populate('serviceType')
            .populate('destination')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        Pricing.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(pricingList, undefined, pagination);
});

/**
 * POST /api/pricing
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createPricingSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const pricing = new Pricing(parsed.data);
    await pricing.save();

    // Populate references
    await pricing.populate('serviceType destination');

    return createdResponse(pricing, 'Pricing created successfully');
});
