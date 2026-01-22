export { auth, handlers, signIn, signOut, getServerSession } from './auth';
export { authConfig } from './auth.config';
export {
    getAuthUser,
    requireAuth,
    requireRoles,
    hasRole,
    withAuth,
    protectedRoute,
    AuthError,
    type AuthSession,
} from './middleware';
