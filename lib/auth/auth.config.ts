import type { NextAuthConfig } from 'next-auth';
import { UserRole } from '@/types';

/**
 * Edge-compatible auth configuration (no database access)
 * Used by middleware for route protection
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnApi = nextUrl.pathname.startsWith('/api');
            const isAuthApi = nextUrl.pathname.startsWith('/api/auth');

            // Allow auth API routes
            if (isAuthApi) {
                return true;
            }

            const role = auth?.user?.role;

            // Protect dashboard routes
            if (isOnDashboard) {
                if (isLoggedIn) {
                    // Redirect to specific dashboard based on role
                    // If they are strictly on /dashboard, move them to their role-specific dashboard
                    if (nextUrl.pathname === '/dashboard') {
                        if (role === 'admin') return Response.redirect(new URL('/admin/dashboard', nextUrl));
                        if (role === 'agent') return Response.redirect(new URL('/agent/dashboard', nextUrl));
                        if (role === 'driver') return Response.redirect(new URL('/driver/dashboard', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect to login
            }

            // Protect Role Specific Routes
            if (nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            if (nextUrl.pathname.startsWith('/agent') && role !== 'agent' && role !== 'admin') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            if (nextUrl.pathname.startsWith('/driver') && role !== 'driver') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }


            // API routes are handled by the route handlers themselves
            if (isOnApi) {
                return true;
            }

            // If logged in and trying to access login page or root, redirect to dashboard
            if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signin-up' || nextUrl.pathname === '/')) {
                if (role === 'admin') return Response.redirect(new URL('/admin/dashboard', nextUrl));
                if (role === 'agent') return Response.redirect(new URL('/agent/dashboard', nextUrl));
                if (role === 'driver') return Response.redirect(new URL('/driver/dashboard', nextUrl));
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role as UserRole;
                token.name = user.name;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    providers: [], // Providers are added in auth.ts
};
