import mongoose, { Schema, Document, Model } from 'mongoose';
import { IClient } from '@/types';

export interface IClientDocument extends Omit<IClient, '_id'>, Document { }

interface IClientModel extends Model<IClientDocument> {
    generateCode(): Promise<string>;
}

const clientSchema = new Schema<IClientDocument>(
    {
        code: {
            type: String,
            unique: true,
            required: true,
        },
        companyName: {
            type: String,
            trim: true,
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
        accountBalance: {
            type: Number,
            default: 0,
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
clientSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (company or full name)
clientSchema.virtual('displayName').get(function () {
    return this.companyName || `${this.firstName} ${this.lastName}`;
});

// Generate unique client code
clientSchema.statics.generateCode = async function (): Promise<string> {
    const prefix = 'CLT';
    const lastClient = await this.findOne({}, {}, { sort: { createdAt: -1 } });

    let nextNumber = 1;
    if (lastClient && lastClient.code) {
        const lastNumber = parseInt(lastClient.code.replace(prefix, ''), 10);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
};

// Pre-validate: generate code if not set
clientSchema.pre('validate', async function () {
    if (!this.code) {
        this.code = await (this.constructor as IClientModel).generateCode();
    }
});

// Indexes
clientSchema.index({ firstName: 'text', lastName: 'text', companyName: 'text' });

const Client: IClientModel =
    (mongoose.models.Client as IClientModel) ||
    mongoose.model<IClientDocument, IClientModel>('Client', clientSchema);

export default Client;
