import { connectDB } from '@/lib/db';
import Client from '@/models/Client';
import Shipment from '@/models/Shipment';
import Invoice from '@/models/Invoice';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateClientSchema } from '@/lib/validations/schemas';

/**
 * GET /api/clients/[id]
 * Get a single client
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const client = await Client.findById(id);

    if (!client) {
        return errorResponse('Client not found', 404);
    }

    return successResponse(client);
});

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const client = await Client.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!client) {
        return errorResponse('Client not found', 404);
    }

    return successResponse(client, 'Client updated successfully');
});

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    // Check for related records
    const [shipmentCount, invoiceCount] = await Promise.all([
        Shipment.countDocuments({ client: id }),
        Invoice.countDocuments({ client: id }),
    ]);

    if (shipmentCount > 0 || invoiceCount > 0) {
        return errorResponse(
            'Cannot delete client with existing shipments or invoices. Deactivate instead.',
            400
        );
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
        return errorResponse('Client not found', 404);
    }

    return successResponse(null, 'Client deleted successfully');
});
