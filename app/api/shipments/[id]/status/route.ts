import { connectDB } from '@/lib/db';
import Link from 'next/link';
import mongoose from 'mongoose';
import Shipment from '@/models/Shipment';
import Incident from '@/models/Incident';
import { ShipmentStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateShipmentStatusSchema } from '@/lib/validations/schemas';

/**
 * PATCH /api/shipments/[id]/status
 * Update shipment status with tracking history
 */
export const PATCH = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { user } = await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateShipmentStatusSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const { status, location, description } = parsed.data;

    const shipment = await Shipment.findById(id);

    if (!shipment) {
        return errorResponse('Shipment not found', 404);
    }

    // Add tracking entry
    shipment.trackingHistory.push({
        timestamp: new Date(),
        status,
        // Convert location string to ObjectId if it exists, otherwise keep it as is (or undefined)
        ...(location && { location }),
        description,
        updatedBy: new mongoose.Types.ObjectId(user.id),
    });

    // Update status
    shipment.status = status;

    // Update delivery date if delivered
    if (status === ShipmentStatus.DELIVERED) {
        shipment.actualDeliveryDate = new Date();
    }

    await shipment.save();
    await shipment.populate('client serviceType destination');

    return successResponse(shipment, 'Shipment status updated successfully');
});
