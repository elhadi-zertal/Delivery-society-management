import { connectDB } from '@/lib/db';
import { withErrorHandler, successResponse, errorResponse, createdResponse } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import mongoose, { Schema, Document, Model } from 'mongoose';

// Minimal Favorite Model Schema
interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    featureName: string;
    featureRoute: string;
    order: number;
}

const favoriteSchema = new Schema<IFavorite>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    featureName: { type: String, required: true },
    featureRoute: { type: String, required: true },
    order: { type: Number, default: 0 }
});

const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);

export const GET = withErrorHandler(async (req: Request) => {
    const { user } = await requireAuth();
    await connectDB();
    const favorites = await Favorite.find({ userId: user.id }).sort({ order: 1 });
    return successResponse(favorites);
});

export const POST = withErrorHandler(async (req: Request) => {
    const { user } = await requireAuth();
    await connectDB();
    const body = await req.json();

    const count = await Favorite.countDocuments({ userId: user.id });
    const favorite = await Favorite.create({
        ...body,
        userId: user.id,
        order: count
    });

    return createdResponse(favorite);
});
