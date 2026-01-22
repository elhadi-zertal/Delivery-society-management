import { connectDB } from '@/lib/db';
import Favorite from '@/models/Favorite';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { updateFavoriteSchema } from '@/lib/validations/schemas';

/**
 * PUT /api/favorites/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { user } = await requireAuth();
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateFavoriteSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const favorite = await Favorite.findOneAndUpdate(
        { _id: id, user: user.id },
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!favorite) {
        return errorResponse('Favorite not found', 404);
    }

    return successResponse(favorite, 'Favorite updated successfully');
});

/**
 * DELETE /api/favorites/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { user } = await requireAuth();
    await connectDB();

    const { id } = await context!.params;

    const favorite = await Favorite.findOneAndDelete({
        _id: id,
        user: user.id,
    });

    if (!favorite) {
        return errorResponse('Favorite not found', 404);
    }

    return successResponse(null, 'Favorite removed successfully');
});
