import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import RegistrationDemand from "@/models/RegistrationDemand";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        // 1. Verify Admin Role
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 2. Fetch Demands
        const demands = await RegistrationDemand.find().sort({ createdAt: -1 });

        return NextResponse.json(demands, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
