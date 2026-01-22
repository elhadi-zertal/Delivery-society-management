import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IFavorite } from '@/types';

export interface IFavoriteDocument extends Omit<IFavorite, '_id' | 'user'>, Document {
    user: Types.ObjectId;
}

interface IFavoriteModel extends Model<IFavoriteDocument> {
    findByUser(userId: Types.ObjectId | string): Promise<IFavoriteDocument[]>;
    reorder(userId: Types.ObjectId | string, favorites: { id: string; order: number }[]): Promise<void>;
}

const favoriteSchema = new Schema<IFavoriteDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        featureType: {
            type: String,
            enum: ['menu', 'report', 'client', 'shipment', 'custom'],
            required: [true, 'Feature type is required'],
        },
        featureId: {
            type: String,
            required: [true, 'Feature ID is required'],
        },
        label: {
            type: String,
            required: [true, 'Label is required'],
        },
        path: String,
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound unique index: one favorite per user per feature
favoriteSchema.index({ user: 1, featureType: 1, featureId: 1 }, { unique: true });

// Find favorites by user
favoriteSchema.statics.findByUser = function (userId: Types.ObjectId | string) {
    return this.find({ user: userId }).sort({ order: 1, createdAt: 1 });
};

// Reorder favorites
favoriteSchema.statics.reorder = async function (
    userId: Types.ObjectId | string,
    favorites: { id: string; order: number }[]
): Promise<void> {
    const bulkOps = favorites.map((fav) => ({
        updateOne: {
            filter: { _id: fav.id, user: userId },
            update: { $set: { order: fav.order } },
        },
    }));

    await this.bulkWrite(bulkOps);
};

// Indexes
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ order: 1 });

const Favorite: IFavoriteModel =
    (mongoose.models.Favorite as IFavoriteModel) ||
    mongoose.model<IFavoriteDocument, IFavoriteModel>('Favorite', favoriteSchema);

export default Favorite;
