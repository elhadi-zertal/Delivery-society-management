import { connectDB } from '@/lib/db';
import Shipment from '@/models/Shipment';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateShipmentSchema } from '@/lib/validations/schemas';

/**
 * GET /api/shipments/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const shipment = await Shipment.findById(id)
        .populate('client')
        .populate('serviceType')
        .populate('destination')
        .populate('deliveryTour')
        .populate('invoice');

    if (!shipment) {
        return errorResponse('Shipment not found', 404);
    }

    return successResponse(shipment);
});

/**
 * PUT /api/shipments/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateShipmentSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const shipment = await Shipment.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    ).populate('client serviceType destination');

    if (!shipment) {
        return errorResponse('Shipment not found', 404);
    }

    return successResponse(shipment, 'Shipment updated successfully');
});

/**
 * DELETE /api/shipments/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const shipment = await Shipment.findById(id);

    if (!shipment) {
        return errorResponse('Shipment not found', 404);
    }

    if (shipment.isInvoiced) {
        return errorResponse('Cannot delete an invoiced shipment', 400);
    }

    if (shipment.deliveryTour) {
        return errorResponse('Cannot delete shipment assigned to a tour', 400);
    }

    await Shipment.findByIdAndDelete(id);

    return successResponse(null, 'Shipment deleted successfully');
});
