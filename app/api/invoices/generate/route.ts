import { connectDB } from '@/lib/db';
import { generateInvoice } from '@/lib/business';
import {
    withErrorHandler,
    createdResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { generateInvoiceSchema } from '@/lib/validations/schemas';

/**
 * POST /api/invoices/generate
 * Generate an invoice from shipments
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = generateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    try {
        const invoice = await generateInvoice({
            clientId: parsed.data.clientId,
            shipmentIds: parsed.data.shipmentIds,
            dueInDays: parsed.data.dueInDays,
            notes: parsed.data.notes,
        });

        await invoice.populate('client shipments');

        return createdResponse(invoice, 'Invoice generated successfully');
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }
        throw error;
    }
});
