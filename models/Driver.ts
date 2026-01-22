import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDriver, DriverStatus } from '@/types';

export interface IDriverDocument extends Omit<IDriver, '_id'>, Document { }

interface IDriverModel extends Model<IDriverDocument> {
    generateEmployeeId(): Promise<string>;
    findAvailable(): Promise<IDriverDocument[]>;
}

const driverSchema = new Schema<IDriverDocument>(
    {
        employeeId: {
            type: String,
            unique: true,
            required: true,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            trim: true,
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            unique: true,
        },
        licenseExpiry: {
            type: Date,
            required: [true, 'License expiry date is required'],
        },
        licenseType: {
            type: String,
            required: [true, 'License type is required'],
        },
        status: {
            type: String,
            enum: Object.values(DriverStatus),
            default: DriverStatus.AVAILABLE,
        },
        hireDate: {
            type: Date,
            required: [true, 'Hire date is required'],
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

// Virtual for full name
driverSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for license validity
driverSchema.virtual('isLicenseValid').get(function () {
    return this.licenseExpiry > new Date();
});

// Generate unique employee ID
driverSchema.statics.generateEmployeeId = async function (): Promise<string> {
    const prefix = 'DRV';
    const lastDriver = await this.findOne({}, {}, { sort: { createdAt: -1 } });

    let nextNumber = 1;
    if (lastDriver && lastDriver.employeeId) {
        const lastNumber = parseInt(lastDriver.employeeId.replace(prefix, ''), 10);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// Find available drivers
driverSchema.statics.findAvailable = function () {
    return this.find({
        status: DriverStatus.AVAILABLE,
        isActive: true,
        licenseExpiry: { $gt: new Date() },
    });
};

// Pre-save: generate employee ID if not set
driverSchema.pre('save', async function () {
    if (!this.employeeId) {
        this.employeeId = await (this.constructor as IDriverModel).generateEmployeeId();
    }
});

// Indexes
driverSchema.index({ status: 1 });
driverSchema.index({ licenseExpiry: 1 });
driverSchema.index({ firstName: 'text', lastName: 'text' });

const Driver: IDriverModel =
    (mongoose.models.Driver as IDriverModel) ||
    mongoose.model<IDriverDocument, IDriverModel>('Driver', driverSchema);

export default Driver;
