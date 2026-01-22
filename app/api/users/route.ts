import { connectDB } from '@/lib/db';
import User from '@/models/User';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
} from '@/lib/api-utils';
import { requireRoles } from '@/lib/auth';
import { UserRole } from '@/types';
import { createUserSchema, updateUserSchema } from '@/lib/validations/schemas';

/**
 * GET /api/users
 * List users (admin only)
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const filter: Record<string, unknown> = {};

    const role = searchParams.get('role');
    if (role) {
        filter.role = role;
    }

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
        User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(users, undefined, pagination);
});

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existingUser) {
        return errorResponse('Email already in use', 400);
    }

    const user = new User(parsed.data);
    await user.save();

    // Return without password
    const userObject = (user.toObject ? user.toObject() : user) as unknown as Record<string, unknown>;
    const { password: _, ...userWithoutPassword } = userObject;

    return createdResponse(userWithoutPassword, 'User created successfully');
});
