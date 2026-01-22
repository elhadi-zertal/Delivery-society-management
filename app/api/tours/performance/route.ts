import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import { TourStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/tours/performance
 * Get tour performance metrics
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: Record<string, unknown> = {};
    if (startDate) {
        dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
        dateFilter.$lte = new Date(endDate);
    }

    const matchStage: Record<string, unknown> = {
        status: TourStatus.COMPLETED,
    };

    if (Object.keys(dateFilter).length > 0) {
        matchStage.date = dateFilter;
    }

    const [metrics] = await DeliveryTour.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalTours: { $sum: 1 },
                totalDeliveries: { $sum: { $add: ['$deliveriesCompleted', '$deliveriesFailed'] } },
                successfulDeliveries: { $sum: '$deliveriesCompleted' },
                failedDeliveries: { $sum: '$deliveriesFailed' },
                totalDistance: { $sum: '$actualRoute.actualDistance' },
                totalDuration: { $sum: '$actualRoute.actualDuration' },
                totalFuel: { $sum: '$actualRoute.fuelConsumed' },
                avgDeliveriesPerTour: { $avg: { $add: ['$deliveriesCompleted', '$deliveriesFailed'] } },
            },
        },
    ]);

    const result = metrics || {
        totalTours: 0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalFuel: 0,
        avgDeliveriesPerTour: 0,
    };

    // Calculate success rate
    const successRate = result.totalDeliveries > 0
        ? Math.round((result.successfulDeliveries / result.totalDeliveries) * 100)
        : 0;

    return successResponse({
        ...result,
        successRate,
        avgDistance: result.totalTours > 0 ? Math.round(result.totalDistance / result.totalTours) : 0,
        avgDuration: result.totalTours > 0 ? Math.round(result.totalDuration / result.totalTours) : 0,
        avgFuel: result.totalTours > 0 ? Math.round(result.totalFuel / result.totalTours * 100) / 100 : 0,
    });
});
