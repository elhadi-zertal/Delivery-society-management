import { connectDB } from '@/lib/db';
import Incident from '@/models/Incident';
import { IncidentStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateIncidentSchema } from '@/lib/validations/schemas';

/**
 * GET /api/incidents/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const incident = await Incident.findById(id)
        .populate('shipment')
        .populate('deliveryTour')
        .populate('vehicle')
        .populate('driver')
        .populate('reportedBy', 'name')
        .populate('resolvedBy', 'name');

    if (!incident) {
        return errorResponse('Incident not found', 404);
    }

    return successResponse(incident);
});

/**
 * PUT /api/incidents/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { user } = await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateIncidentSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If resolving, set resolved info
    if (parsed.data.status === IncidentStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.id;
    }

    const incident = await Incident.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('shipment deliveryTour vehicle driver reportedBy resolvedBy');

    if (!incident) {
        return errorResponse('Incident not found', 404);
    }

    return successResponse(incident, 'Incident updated successfully');
});

/**
 * DELETE /api/incidents/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
        return errorResponse('Incident not found', 404);
    }

    return successResponse(null, 'Incident deleted successfully');
});
