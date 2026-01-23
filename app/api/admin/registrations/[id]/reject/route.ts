import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import RegistrationDemand from "@/models/RegistrationDemand";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // 1. Verify Admin Role
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        // 2. Delete Demand
        const deletedDemand = await RegistrationDemand.findByIdAndDelete(id);

        if (!deletedDemand) {
            return NextResponse.json({ message: "Demand not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Request rejected successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
