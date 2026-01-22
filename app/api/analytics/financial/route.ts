import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import { InvoiceStatus, PaymentMethod } from '@/types';
import {
    withErrorHandler,
    successResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/analytics/financial
 * Financial analytics: revenue, collections, aging, payment methods
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // 1. Revenue Trend (Invoices issued per month)
    const revenueTrend = await Invoice.aggregate([
        {
            $match: {
                issueDate: { $gte: startDate, $lte: endDate },
                status: { $ne: InvoiceStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$issueDate' },
                    month: { $month: '$issueDate' },
                },
                revenue: { $sum: '$totalTTC' },
                outstanding: { $sum: '$amountDue' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 2. Collections Trend (Payments received per month)
    const collectionsTrend = await Payment.aggregate([
        {
            $match: {
                paymentDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$paymentDate' },
                    month: { $month: '$paymentDate' },
                },
                collections: { $sum: '$amount' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Merge Revenue and Collections trends
    const trendMap = new Map<string, any>();

    revenueTrend.forEach((item) => {
        const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
        if (!trendMap.has(key)) trendMap.set(key, { month: key, revenue: 0, collections: 0, outstanding: 0 });
        const entry = trendMap.get(key);
        entry.revenue = item.revenue;
        entry.outstanding = item.outstanding;
    });

    collectionsTrend.forEach((item) => {
        const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
        if (!trendMap.has(key)) trendMap.set(key, { month: key, revenue: 0, collections: 0, outstanding: 0 });
        const entry = trendMap.get(key);
        entry.collections = item.collections;
    });

    const combinedTrend = Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // 3. Totals
    const totalRevenue = combinedTrend.reduce((sum, item) => sum + item.revenue, 0);
    const totalCollections = combinedTrend.reduce((sum, item) => sum + item.collections, 0);
    const outstandingAmount = combinedTrend.reduce((sum, item) => sum + item.outstanding, 0);

    // 4. Revenue by Payment Method
    const revenueByMethod = await Payment.aggregate([
        {
            $match: {
                paymentDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$paymentMethod',
                amount: { $sum: '$amount' },
            },
        },
    ]);

    const methodStats = revenueByMethod.map((item) => ({
        method: item._id,
        amount: item.amount,
        percentage: totalCollections > 0 ? (item.amount / totalCollections) * 100 : 0,
    }));

    // 5. Invoice Aging Report (based on current date)
    const now = new Date();
    const agingStats = await Invoice.aggregate([
        {
            $match: {
                status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
            },
        },
        {
            $project: {
                amountDue: 1,
                daysOverdue: {
                    $divide: [{ $subtract: [now, '$dueDate'] }, 1000 * 60 * 60 * 24],
                },
            },
        },
        {
            $group: {
                _id: null,
                current: {
                    $sum: {
                        $cond: [{ $lte: ['$daysOverdue', 0] }, '$amountDue', 0],
                    },
                },
                overdue30: {
                    $sum: {
                        $cond: [{ $and: [{ $gt: ['$daysOverdue', 0] }, { $lte: ['$daysOverdue', 30] }] }, '$amountDue', 0],
                    },
                },
                overdue60: {
                    $sum: {
                        $cond: [{ $and: [{ $gt: ['$daysOverdue', 30] }, { $lte: ['$daysOverdue', 60] }] }, '$amountDue', 0],
                    },
                },
                overdue90: {
                    $sum: {
                        $cond: [{ $gt: ['$daysOverdue', 60] }, '$amountDue', 0],
                    },
                },
            },
        },
    ]);

    const aging = agingStats[0] || { current: 0, overdue30: 0, overdue60: 0, overdue90: 0 };

    return successResponse({
        period: { start: startDate, end: endDate },
        revenueTrend: combinedTrend,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCollections: Math.round(totalCollections * 100) / 100,
        outstandingAmount: Math.round(outstandingAmount * 100) / 100,
        collectionEfficiency: totalRevenue > 0 ? Math.round((totalCollections / totalRevenue) * 100) : 0,
        revenueByMethod: methodStats,
        invoiceAging: {
            current: Math.round(aging.current * 100) / 100,
            overdue30: Math.round(aging.overdue30 * 100) / 100,
            overdue60: Math.round(aging.overdue60 * 100) / 100,
            overdue90: Math.round(aging.overdue90 * 100) / 100,
        },
    });
});
