import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import { cancelPayment } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSortOptions,
    buildDateRangeFilter,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/payments
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const dateFilter = buildDateRangeFilter(searchParams, 'paymentDate');
    const sortOptions = buildSortOptions(searchParams, '-paymentDate');

    const filter: Record<string, unknown> = { ...dateFilter };

    const client = searchParams.get('client');
    if (client) {
        filter.client = client;
    }

    const invoice = searchParams.get('invoice');
    if (invoice) {
        filter.invoice = invoice;
    }

    const paymentMethod = searchParams.get('paymentMethod');
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    const [payments, total] = await Promise.all([
        Payment.find(filter)
            .populate('invoice')
            .populate('client')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        Payment.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(payments, undefined, pagination);
});
