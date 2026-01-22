import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDestination } from '@/types';

export interface IDestinationDocument extends Omit<IDestination, '_id'>, Document { }

interface IDestinationModel extends Model<IDestinationDocument> {
    generateCode(city: string, country: string): Promise<string>;
    findByZone(zone: string): Promise<IDestinationDocument[]>;
}

const destinationSchema = new Schema<IDestinationDocument>(
    {
        code: {
            type: String,
            unique: true,
            required: true,
            uppercase: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
        },
        zone: {
            type: String,
            required: [true, 'Zone is required'],
            trim: true,
        },
        postalCodeRange: {
            from: { type: String },
            to: { type: String },
        },
        baseRate: {
            type: Number,
            required: [true, 'Base rate is required'],
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for display name
destinationSchema.virtual('displayName').get(function () {
    return `${this.city}, ${this.country}`;
});

// Generate unique destination code from city and country
destinationSchema.statics.generateCode = async function (
    city: string,
    country: string
): Promise<string> {
    const cityCode = city.substring(0, 3).toUpperCase();
    const countryCode = country.substring(0, 2).toUpperCase();
    const baseCode = `${countryCode}-${cityCode}`;

    // Check for existing codes with this prefix
    const existingCount = await this.countDocuments({
        code: { $regex: `^${baseCode}` },
    });

    if (existingCount === 0) {
        return baseCode;
    }

    return `${baseCode}-${existingCount + 1}`;
};

// Find destinations by zone
destinationSchema.statics.findByZone = function (zone: string) {
    return this.find({ zone, isActive: true });
};

// Pre-save: generate code if not set
destinationSchema.pre('save', async function () {
    if (!this.code) {
        this.code = await (this.constructor as IDestinationModel).generateCode(
            this.city,
            this.country
        );
    }
});

// Indexes
destinationSchema.index({ zone: 1 });
destinationSchema.index({ country: 1, city: 1 });
destinationSchema.index({ city: 'text', country: 'text' });

const Destination: IDestinationModel =
    (mongoose.models.Destination as IDestinationModel) ||
    mongoose.model<IDestinationDocument, IDestinationModel>('Destination', destinationSchema);

export default Destination;
