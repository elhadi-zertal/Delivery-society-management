import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Shipment from '@/models/Shipment';
import Incident from '@/models/Incident';
import { TourStatus, ShipmentStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/analytics/operational
 * Operational analytics: tour metrics, delivery success, driver performance, incidents
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Tour evolution by month
    const tourEvolution = await DeliveryTour.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: TourStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                },
                count: { $sum: 1 },
                totalDeliveries: { $sum: { $add: ['$deliveriesCompleted', '$deliveriesFailed'] } },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyTours = tourEvolution.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count,
        averageDeliveries: item.count > 0 ? Math.round(item.totalDeliveries / item.count) : 0,
    }));

    // Overall tour stats
    const tourStats = await DeliveryTour.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: TourStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: null,
                totalTours: { $sum: 1 },
                totalDelivered: { $sum: '$deliveriesCompleted' },
                totalFailed: { $sum: '$deliveriesFailed' },
                totalDistance: { $sum: '$actualRoute.actualDistance' },
                totalFuel: { $sum: '$actualRoute.fuelConsumed' },
            },
        },
    ]);

    const stats = tourStats[0] || {
        totalTours: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalDistance: 0,
        totalFuel: 0,
    };

    const totalDeliveries = stats.totalDelivered + stats.totalFailed;
    const successRate = totalDeliveries > 0
        ? Math.round((stats.totalDelivered / totalDeliveries) * 100)
        : 0;

    // Top drivers by performance
    const topDrivers = await DeliveryTour.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: TourStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: '$driver',
                tourCount: { $sum: 1 },
                deliveryCount: { $sum: { $add: ['$deliveriesCompleted', '$deliveriesFailed'] } },
                successfulDeliveries: { $sum: '$deliveriesCompleted' },
            },
        },
        {
            $addFields: {
                successRate: {
                    $cond: [
                        { $gt: ['$deliveryCount', 0] },
                        { $multiply: [{ $divide: ['$successfulDeliveries', '$deliveryCount'] }, 100] },
                        0,
                    ],
                },
            },
        },
        { $sort: { successRate: -1, deliveryCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'drivers',
                localField: '_id',
                foreignField: '_id',
                as: 'driver',
            },
        },
        { $unwind: '$driver' },
        {
            $project: {
                driver: {
                    _id: '$driver._id',
                    employeeId: '$driver.employeeId',
                    firstName: '$driver.firstName',
                    lastName: '$driver.lastName',
                },
                tourCount: 1,
                deliveryCount: 1,
                successRate: { $round: ['$successRate', 1] },
            },
        },
    ]);

    // Incident zones
    const incidentZones = await Incident.aggregate([
        {
            $match: {
                occurredAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$location',
                incidentCount: { $sum: 1 },
                types: { $push: '$type' },
            },
        },
        { $sort: { incidentCount: -1 } },
        { $limit: 10 },
        {
            $project: {
                zone: '$_id',
                incidentCount: 1,
                typeBreakdown: {
                    $reduce: {
                        input: '$types',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                { $literal: { '$$this': 1 } },
                            ],
                        },
                    },
                },
            },
        },
    ]);

    // Peak periods by day of week and hour
    const peakPeriods = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: {
                    dayOfWeek: { $dayOfWeek: '$createdAt' },
                    hour: { $hour: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedPeakPeriods = peakPeriods.map((p) => ({
        dayOfWeek: dayNames[p._id.dayOfWeek - 1],
        hourRange: `${p._id.hour}:00 - ${p._id.hour + 1}:00`,
        averageShipments: p.count,
    }));

    // Vehicle utilization
    const vehicleUtilization = await DeliveryTour.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: TourStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: '$vehicle',
                tourCount: { $sum: 1 },
                totalDistance: { $sum: '$actualRoute.actualDistance' },
                totalFuel: { $sum: '$actualRoute.fuelConsumed' },
            },
        },
        { $sort: { tourCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'vehicles',
                localField: '_id',
                foreignField: '_id',
                as: 'vehicle',
            },
        },
        { $unwind: '$vehicle' },
        {
            $project: {
                vehicle: {
                    _id: '$vehicle._id',
                    registrationNumber: '$vehicle.registrationNumber',
                    brand: '$vehicle.brand',
                    model: '$vehicle.model',
                    type: '$vehicle.type',
                },
                tourCount: 1,
                totalDistance: { $round: ['$totalDistance', 1] },
                totalFuel: { $round: ['$totalFuel', 1] },
            },
        },
    ]);

    return successResponse({
        period: { start: startDate, end: endDate },
        tourEvolution: monthlyTours,
        totalTours: stats.totalTours,
        totalDeliveries,
        deliverySuccessRate: successRate,
        averageDeliveriesPerTour: stats.totalTours > 0
            ? Math.round(totalDeliveries / stats.totalTours)
            : 0,
        totalDistance: Math.round(stats.totalDistance || 0),
        totalFuel: Math.round((stats.totalFuel || 0) * 100) / 100,
        topDrivers,
        incidentZones,
        peakPeriods: formattedPeakPeriods,
        vehicleUtilization,
    });
});
