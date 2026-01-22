import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import { ComplaintStatus } from '@/types';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateComplaintSchema } from '@/lib/validations/schemas';

/**
 * GET /api/complaints/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const complaint = await Complaint.findById(id)
        .populate('client')
        .populate('shipments')
        .populate('invoice')
        .populate('assignedTo', 'name')
        .populate('resolvedBy', 'name');

    if (!complaint) {
        return errorResponse('Complaint not found', 404);
    }

    return successResponse(complaint);
});

/**
 * PUT /api/complaints/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { user } = await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateComplaintSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If resolving, set resolved info
    if (parsed.data.status === ComplaintStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.id;
    }

    const complaint = await Complaint.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('client shipments invoice assignedTo resolvedBy');

    if (!complaint) {
        return errorResponse('Complaint not found', 404);
    }

    return successResponse(complaint, 'Complaint updated successfully');
});

/**
 * DELETE /api/complaints/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
        return errorResponse('Complaint not found', 404);
    }

    return successResponse(null, 'Complaint deleted successfully');
});
