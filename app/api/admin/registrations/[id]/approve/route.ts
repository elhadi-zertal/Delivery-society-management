import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import RegistrationDemand from "@/models/RegistrationDemand";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params are async in Next.js 15+
) {
    try {
        const session = await auth();

        // 1. Verify Admin Role
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        // 2. Find Demand
        const demand = await RegistrationDemand.findById(id).select('+password');
        if (!demand) {
            return NextResponse.json({ message: "Demand not found" }, { status: 404 });
        }

        // 3. Create User directly (bypass Mongoose middleware to avoid double hashing)
        // Since demand.password is already hashed, normal User.create would re-hash it.
        await User.collection.insertOne({
            name: demand.name,
            email: demand.email,
            password: demand.password,
            role: demand.role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        // 4. Delete Demand
        await RegistrationDemand.findByIdAndDelete(id);

        return NextResponse.json({ message: "User approved successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error approving user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
