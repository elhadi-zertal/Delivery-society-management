import { connectDB } from '@/lib/db';
import Shipment from '@/models/Shipment';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import Destination from '@/models/Destination';
import { ShipmentStatus, InvoiceStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/analytics/commercial
 * Commercial analytics: revenue, shipment trends, top clients, popular destinations
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Shipment evolution by month
    const shipmentEvolution = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data
    const monthlyData = shipmentEvolution.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count,
        revenue: Math.round(item.revenue * 100) / 100,
    }));

    // Total revenue and shipments
    const totals = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalShipments: { $sum: 1 },
            },
        },
    ]);

    const totalRevenue = totals[0]?.totalRevenue || 0;
    const totalShipments = totals[0]?.totalShipments || 0;

    // Top clients by revenue
    const topClients = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: '$client',
                shipmentCount: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'clients',
                localField: '_id',
                foreignField: '_id',
                as: 'client',
            },
        },
        { $unwind: '$client' },
        {
            $project: {
                client: {
                    _id: '$client._id',
                    code: '$client.code',
                    firstName: '$client.firstName',
                    lastName: '$client.lastName',
                    companyName: '$client.companyName',
                },
                shipmentCount: 1,
                revenue: 1,
            },
        },
    ]);

    // Popular destinations
    const popularDestinations = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: '$destination',
                shipmentCount: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
            },
        },
        { $sort: { shipmentCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'destinations',
                localField: '_id',
                foreignField: '_id',
                as: 'destination',
            },
        },
        { $unwind: '$destination' },
        {
            $project: {
                destination: {
                    _id: '$destination._id',
                    code: '$destination.code',
                    city: '$destination.city',
                    country: '$destination.country',
                    zone: '$destination.zone',
                },
                shipmentCount: 1,
                revenue: 1,
            },
        },
    ]);

    // Service type breakdown
    const serviceTypeBreakdown = await Shipment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: ShipmentStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: '$serviceType',
                count: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'servicetypes',
                localField: '_id',
                foreignField: '_id',
                as: 'serviceType',
            },
        },
        { $unwind: '$serviceType' },
        {
            $project: {
                serviceType: {
                    _id: '$serviceType._id',
                    name: '$serviceType.name',
                    displayName: '$serviceType.displayName',
                },
                count: 1,
                percentage: {
                    $multiply: [{ $divide: ['$count', totalShipments] }, 100],
                },
            },
        },
    ]);

    // Invoice stats
    const invoiceStats = await Invoice.aggregate([
        {
            $match: {
                issueDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                total: { $sum: '$totalTTC' },
            },
        },
    ]);

    return successResponse({
        period: { start: startDate, end: endDate },
        shipmentEvolution: monthlyData,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalShipments,
        averageShipmentValue: totalShipments > 0
            ? Math.round((totalRevenue / totalShipments) * 100) / 100
            : 0,
        topClients,
        popularDestinations,
        serviceTypeBreakdown,
        invoiceStats,
    });
});
