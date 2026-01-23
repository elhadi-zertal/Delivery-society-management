import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/validations/schemas";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import RegistrationDemand from "@/models/RegistrationDemand";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = signUpSchema.safeParse(body); // Renamed parsed to validation

        if (!validation.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, email, password, role } = validation.data; // Changed parsed.data to validation.data

        await connectDB();

        // 1. Check if User already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "Account with this email already exists" }, // Modified message
                { status: 409 }
            );
        }

        // 2. Check if Demand already exists (Spam prevention queue)
        const existingDemand = await RegistrationDemand.findOne({ email });
        if (existingDemand) {
            return NextResponse.json({ message: "A registration request for this email is already pending approval." }, { status: 409 });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create Registration Demand
        await RegistrationDemand.create({ // Changed from User.create to RegistrationDemand.create
            name,
            email,
            password: hashedPassword,
            role,
        });

        return NextResponse.json({
            message: "Registration request submitted successfully. Please wait for Admin approval."
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
