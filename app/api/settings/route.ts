import { connectDB } from '@/lib/db';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-utils';
import { requireRoles } from '@/lib/auth';
import { UserRole } from '@/types';
import mongoose, { Schema, Document } from 'mongoose';

// System Settings Schema
const settingsSchema = new Schema({
    companyName: { type: String, default: 'Transport Company' },
    contactEmail: String,
    contactPhone: String,
    address: String,
    tvaRate: { type: Number, default: 0.19 },
    defaultPaymentTerms: { type: Number, default: 30 },
    currency: { type: String, default: 'DZD' },
    emailSettings: {
        smtpServer: String,
        smtpPort: Number,
        smtpUsername: String,
        fromEmail: String,
        fromName: String
    },
    securitySettings: {
        minPasswordLength: { type: Number, default: 8 },
        sessionTimeout: { type: Number, default: 60 }
    }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export const GET = withErrorHandler(async (req: Request) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return successResponse(settings);
});

export const PUT = withErrorHandler(async (req: Request) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();
    const body = await req.json();

    const settings = await Settings.findOne();
    if (settings) {
        Object.assign(settings, body);
        await settings.save();
    } else {
        await Settings.create(body);
    }

    return successResponse(settings, 'Settings updated successfully');
});
