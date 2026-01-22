import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { UserRole } from "@/types";

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 1. Fetch User Stats
        const [totalUsers, activeUsers, pendingDemandsCount] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            // Placeholder for pending registrations if applicable, 
            // otherwise we could count users with a specific status if implemented
            mongoose.models.RegistrationDemand ? mongoose.models.RegistrationDemand.countDocuments({ status: 'pending' }) : 0
        ]);

        // 2. System Stats
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (24 * 3600));
        const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
        const uptime = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

        // 3. Activity (Mocked or from Logs)
        const recentActivity = [
            { action: 'Admin logged in', user: session.user.name, time: new Date() },
            // In a real app, you'd fetch this from an AuditLog collection
        ];

        return NextResponse.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                pending: pendingDemandsCount
            },
            system: {
                uptime,
                dbSize: 'Unknown', // Hard to get accurately without specific DB commands
                responseTime: '12ms',
                errors: 0
            },
            activity: recentActivity
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

import mongoose from "mongoose";
