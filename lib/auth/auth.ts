import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { UserRole } from '@/types';
import { loginSchema } from '@/lib/validations/schemas';

declare module 'next-auth' {
    interface User {
        id: string;
        role: UserRole;
        name: string;
        email: string;
        image?: string | null;
    }

    interface Session {
        user: {
            id: string;
            role: UserRole;
            name: string;
            email: string;
            image?: string | null;
        };
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        name: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    // Validate input
                    const parsed = loginSchema.safeParse(credentials);
                    if (!parsed.success) {
                        return null;
                    }

                    const { email, password } = parsed.data;

                    // Connect to database
                    await connectDB();

                    // Find user with password
                    const user = await User.findByEmail(email);
                    if (!user) {
                        return null;
                    }

                    // Check if user is active
                    if (!user.isActive) {
                        return null;
                    }

                    // Verify password
                    const isValid = await user.comparePassword(password);
                    if (!isValid) {
                        return null;
                    }

                    // Update last login
                    user.lastLogin = new Date();
                    await user.save();

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.photoUrl || null,
                    };
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
});

/**
 * Get the current session on the server
 */
export async function getServerSession() {
    return await auth();
}
