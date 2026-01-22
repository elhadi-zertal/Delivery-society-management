import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IDeliveryTour, TourStatus } from '@/types';

export interface IDeliveryTourDocument extends Omit<IDeliveryTour, '_id' | 'driver' | 'vehicle' | 'shipments' | 'incidents'>, Document {
    driver: Types.ObjectId;
    vehicle: Types.ObjectId;
    shipments: Types.ObjectId[];
    incidents?: Types.ObjectId[];
}

interface IDeliveryTourModel extends Model<IDeliveryTourDocument> {
    generateTourNumber(): Promise<string>;
    findByDriver(driverId: Types.ObjectId | string): Promise<IDeliveryTourDocument[]>;
    findByDate(date: Date): Promise<IDeliveryTourDocument[]>;
}

const deliveryTourSchema = new Schema<IDeliveryTourDocument>(
    {
        tourNumber: {
            type: String,
            unique: true,
            // Auto-generated in pre-save hook
        },
        date: {
            type: Date,
            required: [true, 'Tour date is required'],
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'Driver',
            required: [true, 'Driver is required'],
        },
        vehicle: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required'],
        },
        shipments: [{
            type: Schema.Types.ObjectId,
            ref: 'Shipment',
        }],

        status: {
            type: String,
            enum: Object.values(TourStatus),
            default: TourStatus.PLANNED,
        },

        // Route planning
        plannedRoute: {
            startLocation: { type: String, required: true },
            endLocation: { type: String, required: true },
            estimatedDistance: { type: Number, required: true }, // km
            estimatedDuration: { type: Number, required: true }, // minutes
        },

        // Actual route data
        actualRoute: {
            startTime: Date,
            endTime: Date,
            actualDistance: Number,
            actualDuration: Number,
            fuelConsumed: Number,
        },

        // Statistics
        deliveriesCompleted: {
            type: Number,
            default: 0,
        },
        deliveriesFailed: {
            type: Number,
            default: 0,
        },

        incidents: [{
            type: Schema.Types.ObjectId,
            ref: 'Incident',
        }],

        notes: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: total deliveries
deliveryTourSchema.virtual('totalDeliveries').get(function () {
    return this.shipments?.length || 0;
});

// Virtual: success rate
deliveryTourSchema.virtual('successRate').get(function () {
    const total = this.deliveriesCompleted + this.deliveriesFailed;
    if (total === 0) return 0;
    return Math.round((this.deliveriesCompleted / total) * 100);
});

// Virtual: efficiency (actual vs planned duration)
deliveryTourSchema.virtual('efficiency').get(function () {
    if (!this.actualRoute?.actualDuration || !this.plannedRoute?.estimatedDuration) {
        return null;
    }
    return Math.round((this.plannedRoute.estimatedDuration / this.actualRoute.actualDuration) * 100);
});

// Generate unique tour number
deliveryTourSchema.statics.generateTourNumber = async function (): Promise<string> {
    const prefix = 'TOR';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return `${prefix}-${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
};

// Find tours by driver
deliveryTourSchema.statics.findByDriver = function (driverId: Types.ObjectId | string) {
    return this.find({ driver: driverId })
        .populate('vehicle')
        .populate('shipments')
        .sort({ date: -1 });
};

// Find tours by date
deliveryTourSchema.statics.findByDate = function (date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.find({
        date: { $gte: startOfDay, $lte: endOfDay },
    })
        .populate('driver vehicle shipments')
        .sort({ createdAt: 1 });
};

// Pre-save: generate tour number
deliveryTourSchema.pre('save', async function () {
    if (!this.tourNumber) {
        this.tourNumber = await (this.constructor as IDeliveryTourModel).generateTourNumber();
    }
});

// Indexes
deliveryTourSchema.index({ date: 1 });
deliveryTourSchema.index({ driver: 1 });
deliveryTourSchema.index({ vehicle: 1 });
deliveryTourSchema.index({ status: 1 });

const DeliveryTour: IDeliveryTourModel =
    (mongoose.models.DeliveryTour as IDeliveryTourModel) ||
    mongoose.model<IDeliveryTourDocument, IDeliveryTourModel>('DeliveryTour', deliveryTourSchema);

export default DeliveryTour;
