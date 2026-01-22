import { connectDB } from '@/lib/db';
import User from '@/models/User';
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireRoles } from '@/lib/auth';
import { UserRole } from '@/types';
import { updateUserSchema } from '@/lib/validations/schemas';

/**
 * GET /api/users/[id]
 */
export const GET = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const { id } = await context!.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
        return errorResponse('User not found', 404);
    }

    return successResponse(user);
});

/**
 * PUT /api/users/[id]
 */
export const PUT = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const user = await User.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User updated successfully');
});

/**
 * DELETE /api/users/[id]
 */
export const DELETE = withErrorHandler(async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const { id } = await context!.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return errorResponse('User not found', 404);
    }

    return successResponse(null, 'User deleted successfully');
});
