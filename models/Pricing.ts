import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IPricing } from '@/types';

export interface IPricingDocument extends Omit<IPricing, '_id' | 'serviceType' | 'destination'>, Document {
    serviceType: Types.ObjectId;
    destination: Types.ObjectId;
}

interface IPricingModel extends Model<IPricingDocument> {
    findActiveForRoute(
        serviceTypeId: Types.ObjectId | string,
        destinationId: Types.ObjectId | string
    ): Promise<IPricingDocument | null>;
}

const pricingSchema = new Schema<IPricingDocument>(
    {
        serviceType: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceType',
            required: [true, 'Service type is required'],
        },
        destination: {
            type: Schema.Types.ObjectId,
            ref: 'Destination',
            required: [true, 'Destination is required'],
        },
        baseRate: {
            type: Number,
            required: [true, 'Base rate is required'],
            min: 0,
        },
        weightRate: {
            type: Number,
            required: [true, 'Weight rate is required'],
            min: 0,
        },
        volumeRate: {
            type: Number,
            required: [true, 'Volume rate is required'],
            min: 0,
        },
        minCharge: {
            type: Number,
            required: [true, 'Minimum charge is required'],
            min: 0,
        },
        effectiveFrom: {
            type: Date,
            required: [true, 'Effective from date is required'],
        },
        effectiveTo: {
            type: Date,
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

// Virtual: check if currently effective
pricingSchema.virtual('isEffective').get(function () {
    const now = new Date();
    const isAfterStart = this.effectiveFrom <= now;
    const isBeforeEnd = !this.effectiveTo || this.effectiveTo >= now;
    return this.isActive && isAfterStart && isBeforeEnd;
});

// Find active pricing for a service type + destination combination
pricingSchema.statics.findActiveForRoute = function (
    serviceTypeId: Types.ObjectId | string,
    destinationId: Types.ObjectId | string
) {
    const now = new Date();
    return this.findOne({
        serviceType: serviceTypeId,
        destination: destinationId,
        isActive: true,
        effectiveFrom: { $lte: now },
        $or: [
            { effectiveTo: { $exists: false } },
            { effectiveTo: null },
            { effectiveTo: { $gte: now } },
        ],
    })
        .populate('serviceType')
        .populate('destination');
};

// Ensure no overlapping pricing for the same route
pricingSchema.pre('save', async function () {
    if (this.isNew || this.isModified('effectiveFrom') || this.isModified('effectiveTo')) {
        const overlap = await (this.constructor as IPricingModel).findOne({
            _id: { $ne: this._id },
            serviceType: this.serviceType,
            destination: this.destination,
            isActive: true,
            effectiveFrom: { $lte: this.effectiveTo || new Date('2099-12-31') },
            $or: [
                { effectiveTo: { $exists: false } },
                { effectiveTo: null },
                { effectiveTo: { $gte: this.effectiveFrom } },
            ],
        });

        if (overlap) {
            throw new Error('Overlapping pricing exists for this route');
        }
    }
});

// Compound index for unique active pricing per route
pricingSchema.index({ serviceType: 1, destination: 1 });
pricingSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
pricingSchema.index({ isActive: 1 });

const Pricing: IPricingModel =
    (mongoose.models.Pricing as IPricingModel) ||
    mongoose.model<IPricingDocument, IPricingModel>('Pricing', pricingSchema);

export default Pricing;
