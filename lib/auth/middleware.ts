import { NextResponse } from 'next/server';
import { auth } from './auth';
import { UserRole } from '@/types';
import { errorResponse } from '@/lib/api-utils';

export interface AuthSession {
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    };
}

/**
 * Get the authenticated user from the current request
 */
export async function getAuthUser(): Promise<AuthSession | null> {
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    return session as AuthSession;
}

/**
 * Require authentication for an API route
 */
export async function requireAuth(): Promise<AuthSession> {
    const session = await getAuthUser();

    if (!session) {
        throw new AuthError('Authentication required', 401);
    }

    return session;
}

/**
 * Require specific roles for an API route
 */
export async function requireRoles(...roles: UserRole[]): Promise<AuthSession> {
    const session = await requireAuth();

    if (!roles.includes(session.user.role)) {
        throw new AuthError('Insufficient permissions', 403);
    }

    return session;
}

/**
 * Check if user has one of the specified roles
 */
export function hasRole(session: AuthSession, ...roles: UserRole[]): boolean {
    return roles.includes(session.user.role);
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
    status: number;

    constructor(message: string, status: number = 401) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

/**
 * Higher-order function to wrap API handlers with authentication
 */
export function withAuth<T extends unknown[]>(
    handler: (session: AuthSession, ...args: T) => Promise<NextResponse>,
    options: { roles?: UserRole[] } = {}
) {
    return async (...args: T): Promise<NextResponse> => {
        try {
            let session: AuthSession;

            if (options.roles && options.roles.length > 0) {
                session = await requireRoles(...options.roles);
            } else {
                session = await requireAuth();
            }

            return await handler(session, ...args);
        } catch (error) {
            if (error instanceof AuthError) {
                return errorResponse(error.message, error.status);
            }
            throw error;
        }
    };
}

/**
 * Higher-order function for protected API routes with role checking
 */
export function protectedRoute(
    roles: UserRole[] = []
): (
    handler: (
        request: Request,
        context: { params: Promise<Record<string, string>> },
        session: AuthSession
    ) => Promise<NextResponse>
) => (
    request: Request,
    context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse> {
    return (handler) => {
        return async (request, context) => {
            try {
                let session: AuthSession;

                if (roles.length > 0) {
                    session = await requireRoles(...roles);
                } else {
                    session = await requireAuth();
                }

                return await handler(request, context, session);
            } catch (error) {
                if (error instanceof AuthError) {
                    return errorResponse(error.message, error.status);
                }
                throw error;
            }
        };
    };
}
