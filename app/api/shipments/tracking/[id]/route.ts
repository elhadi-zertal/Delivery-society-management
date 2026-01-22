import { connectDB } from '@/lib/db';
import Shipment from '@/models/Shipment';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/shipments/tracking/[id]
 * Get detailed tracking history for a shipment
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const shipment = await Shipment.findById(id)
        .select('shipmentNumber status trackingHistory estimatedDeliveryDate actualDeliveryDate')
        .populate('trackingHistory.updatedBy', 'name');

    if (!shipment) {
        return errorResponse('Shipment not found', 404);
    }

    return successResponse({
        shipmentNumber: shipment.shipmentNumber,
        currentStatus: shipment.status,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        trackingHistory: shipment.trackingHistory.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    });
});
