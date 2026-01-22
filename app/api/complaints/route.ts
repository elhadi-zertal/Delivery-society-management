import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSortOptions,
    buildStatusFilter,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createComplaintSchema } from '@/lib/validations/schemas';

/**
 * GET /api/complaints
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const statusFilter = buildStatusFilter(searchParams);
    const sortOptions = buildSortOptions(searchParams, '-createdAt');

    const filter: Record<string, unknown> = { ...statusFilter };

    const client = searchParams.get('client');
    if (client) {
        filter.client = client;
    }

    const priority = searchParams.get('priority');
    if (priority) {
        filter.priority = priority;
    }

    const nature = searchParams.get('nature');
    if (nature) {
        filter.nature = nature;
    }

    const pending = searchParams.get('pending');
    if (pending === 'true') {
        const complaints = await Complaint.findPending();
        return successResponse(complaints);
    }

    const [complaints, total] = await Promise.all([
        Complaint.find(filter)
            .populate('client')
            .populate('shipments')
            .populate('invoice')
            .populate('assignedTo', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        Complaint.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(complaints, undefined, pagination);
});

/**
 * POST /api/complaints
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createComplaintSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const complaint = new Complaint(parsed.data);
    await complaint.save();
    await complaint.populate('client shipments invoice');

    return createdResponse(complaint, 'Complaint created successfully');
});
