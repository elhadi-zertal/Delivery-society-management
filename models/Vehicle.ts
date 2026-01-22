import mongoose, { Schema, Document, Model } from 'mongoose';
import { IVehicle, VehicleStatus, VehicleType } from '@/types';

export interface IVehicleDocument extends Omit<IVehicle, '_id'>, Omit<Document, 'model'> { }

interface IVehicleModel extends Model<IVehicleDocument> {
    findAvailable(): Promise<IVehicleDocument[]>;
    findByCapacity(weight: number, volume: number): Promise<IVehicleDocument[]>;
}

const vehicleSchema = new Schema<IVehicleDocument>(
    {
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(VehicleType),
            required: [true, 'Vehicle type is required'],
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            trim: true,
        },
        model: {
            type: String,
            required: [true, 'Model is required'],
            trim: true,
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: 1900,
            max: new Date().getFullYear() + 1,
        },
        capacity: {
            weight: {
                type: Number,
                required: [true, 'Weight capacity is required'],
                min: 0,
            },
            volume: {
                type: Number,
                required: [true, 'Volume capacity is required'],
                min: 0,
            },
        },
        fuelType: {
            type: String,
            required: [true, 'Fuel type is required'],
        },
        fuelConsumption: {
            type: Number,
            required: [true, 'Fuel consumption is required'],
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(VehicleStatus),
            default: VehicleStatus.AVAILABLE,
        },
        lastMaintenanceDate: {
            type: Date,
        },
        nextMaintenanceDate: {
            type: Date,
        },
        mileage: {
            type: Number,
            default: 0,
            min: 0,
        },
        notes: {
            type: String,
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
vehicleSchema.virtual('displayName').get(function () {
    return `${this.brand} ${this.model} (${this.registrationNumber})`;
});

// Virtual for maintenance due
vehicleSchema.virtual('isMaintenanceDue').get(function () {
    if (!this.nextMaintenanceDate) return false;
    return this.nextMaintenanceDate <= new Date();
});

// Find available vehicles
vehicleSchema.statics.findAvailable = function () {
    return this.find({
        status: VehicleStatus.AVAILABLE,
        isActive: true,
    });
};

// Find vehicles that can handle the given capacity
vehicleSchema.statics.findByCapacity = function (weight: number, volume: number) {
    return this.find({
        status: VehicleStatus.AVAILABLE,
        isActive: true,
        'capacity.weight': { $gte: weight },
        'capacity.volume': { $gte: volume },
    });
};

// Indexes
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ 'capacity.weight': 1, 'capacity.volume': 1 });

const Vehicle: IVehicleModel =
    (mongoose.models.Vehicle as IVehicleModel) ||
    mongoose.model<IVehicleDocument, IVehicleModel>('Vehicle', vehicleSchema);

export default Vehicle;
