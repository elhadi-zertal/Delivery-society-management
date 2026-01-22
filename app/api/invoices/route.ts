import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSortOptions,
    buildStatusFilter,
    buildDateRangeFilter,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/invoices
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const statusFilter = buildStatusFilter(searchParams);
    const dateFilter = buildDateRangeFilter(searchParams, 'issueDate');
    const sortOptions = buildSortOptions(searchParams, '-issueDate');

    const filter: Record<string, unknown> = { ...statusFilter, ...dateFilter };

    const client = searchParams.get('client');
    if (client) {
        filter.client = client;
    }

    const overdue = searchParams.get('overdue');
    if (overdue === 'true') {
        const invoices = await Invoice.findOverdue();
        return successResponse(invoices);
    }

    const pending = searchParams.get('pending');
    if (pending === 'true') {
        const invoices = await Invoice.findPending();
        return successResponse(invoices);
    }

    const [invoices, total] = await Promise.all([
        Invoice.find(filter)
            .populate('client')
            .populate('shipments')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        Invoice.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(invoices, undefined, pagination);
});
