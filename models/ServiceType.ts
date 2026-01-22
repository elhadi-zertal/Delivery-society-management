import mongoose, { Schema, Document, Model } from 'mongoose';
import { IServiceType, ServiceTypeName } from '@/types';

export interface IServiceTypeDocument extends Omit<IServiceType, '_id'>, Document { }

interface IServiceTypeModel extends Model<IServiceTypeDocument> {
    findByName(name: ServiceTypeName): Promise<IServiceTypeDocument | null>;
}

const serviceTypeSchema = new Schema<IServiceTypeDocument>(
    {
        code: {
            type: String,
            unique: true,
            required: true,
            uppercase: true,
        },
        name: {
            type: String,
            enum: Object.values(ServiceTypeName),
            required: [true, 'Service type name is required'],
            unique: true,
        },
        displayName: {
            type: String,
            required: [true, 'Display name is required'],
            trim: true,
        },
        description: {
            type: String,
        },
        estimatedDeliveryDays: {
            min: {
                type: Number,
                required: true,
                min: 1,
            },
            max: {
                type: Number,
                required: true,
                min: 1,
            },
        },
        multiplier: {
            type: Number,
            required: [true, 'Multiplier is required'],
            min: 0,
            default: 1,
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

// Virtual for delivery time display
serviceTypeSchema.virtual('deliveryTimeDisplay').get(function () {
    if (this.estimatedDeliveryDays.min === this.estimatedDeliveryDays.max) {
        return `${this.estimatedDeliveryDays.min} day(s)`;
    }
    return `${this.estimatedDeliveryDays.min}-${this.estimatedDeliveryDays.max} days`;
});

// Find service type by name
serviceTypeSchema.statics.findByName = function (name: ServiceTypeName) {
    return this.findOne({ name, isActive: true });
};

// Pre-save: generate code from name
serviceTypeSchema.pre('save', async function () {
    if (!this.code) {
        this.code = this.name.toUpperCase().substring(0, 3);
    }
});

// Validate min <= max
serviceTypeSchema.pre('save', function () {
    if (this.estimatedDeliveryDays.min > this.estimatedDeliveryDays.max) {
        throw new Error('Minimum delivery days cannot exceed maximum');
    }
});

// Indexes

const ServiceType: IServiceTypeModel =
    (mongoose.models.ServiceType as IServiceTypeModel) ||
    mongoose.model<IServiceTypeDocument, IServiceTypeModel>('ServiceType', serviceTypeSchema);

export default ServiceType;
