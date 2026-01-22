import { connectDB } from '@/lib/db';
import { calculateShipmentPrice } from '@/lib/business';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { calculatePriceSchema } from '@/lib/validations/schemas';

/**
 * POST /api/shipments/calculate-price
 * Calculate shipment price before creating
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = calculatePriceSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const { serviceTypeId, destinationId, packages } = parsed.data;

    try {
        const result = await calculateShipmentPrice({
            serviceTypeId,
            destinationId,
            packages,
        });

        return successResponse(result);
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }
        throw error;
    }
});
