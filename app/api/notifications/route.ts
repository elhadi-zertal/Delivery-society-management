import { connectDB } from '@/lib/db';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import mongoose, { Schema, Document } from 'mongoose';

// Notification Model Schema
interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export const GET = withErrorHandler(async (req: Request) => {
    const { user } = await requireAuth();
    await connectDB();
    const notifications = await Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(50);
    return successResponse(notifications);
});

export const PUT = withErrorHandler(async (req: Request) => {
    const { user } = await requireAuth();
    await connectDB();
    // Mark all as read
    await Notification.updateMany({ userId: user.id, read: false }, { read: true });
    return successResponse(null, 'All notifications marked as read');
});
