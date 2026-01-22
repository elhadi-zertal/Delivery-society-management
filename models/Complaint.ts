import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IComplaint, ComplaintStatus, ComplaintNature } from '@/types';

export interface IComplaintDocument extends Omit<IComplaint, '_id' | 'client' | 'shipments' | 'invoice' | 'resolvedBy' | 'assignedTo' | 'deliveryTour'>, Document {
    client?: Types.ObjectId;
    shipments?: Types.ObjectId[];
    invoice?: Types.ObjectId;
    deliveryTour?: Types.ObjectId;
    resolvedBy?: Types.ObjectId;
    assignedTo?: Types.ObjectId;
}

interface IComplaintModel extends Model<IComplaintDocument> {
    generateComplaintNumber(): Promise<string>;
    findByClient(clientId: Types.ObjectId | string): Promise<IComplaintDocument[]>;
    findPending(): Promise<IComplaintDocument[]>;
    findByPriority(priority: string): Promise<IComplaintDocument[]>;
}

const complaintSchema = new Schema<IComplaintDocument>(
    {
        complaintNumber: {
            type: String,
            unique: true,
            required: true,
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: false,
        },
        deliveryTour: {
            type: Schema.Types.ObjectId,
            ref: 'DeliveryTour',
            required: false,
        },

        // Related entities
        shipments: [{
            type: Schema.Types.ObjectId,
            ref: 'Shipment',
        }],
        invoice: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
        },

        nature: {
            type: String,
            enum: Object.values(ComplaintNature),
            required: [true, 'Nature of complaint is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },

        status: {
            type: String,
            enum: Object.values(ComplaintStatus),
            default: ComplaintStatus.PENDING,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },

        // Resolution
        resolution: String,
        resolvedAt: Date,
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

        // Attachments
        attachments: [{
            type: String,
        }],

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: is resolved
complaintSchema.virtual('isResolved').get(function () {
    return this.status === ComplaintStatus.RESOLVED || this.status === ComplaintStatus.CANCELLED;
});

// Virtual: age in days
complaintSchema.virtual('ageInDays').get(function () {
    const diffMs = new Date().getTime() - this.createdAt.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
});

// Virtual: time to resolution
complaintSchema.virtual('resolutionTime').get(function () {
    if (!this.resolvedAt) return null;
    const diffMs = this.resolvedAt.getTime() - this.createdAt.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24)); // days
});

// Generate unique complaint number
complaintSchema.statics.generateComplaintNumber = async function (): Promise<string> {
    const prefix = 'CMP';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = await this.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    return `${prefix}-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
};

// Find complaints by client
complaintSchema.statics.findByClient = function (clientId: Types.ObjectId | string) {
    return this.find({ client: clientId })
        .populate('shipments invoice assignedTo')
        .sort({ createdAt: -1 });
};

// Find pending complaints
complaintSchema.statics.findPending = function () {
    return this.find({
        status: { $in: [ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS] },
    })
        .populate('client shipments invoice assignedTo')
        .sort({ priority: -1, createdAt: 1 });
};

// Find complaints by priority
complaintSchema.statics.findByPriority = function (priority: string) {
    return this.find({
        priority,
        status: { $in: [ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS] },
    })
        .populate('client shipments invoice assignedTo')
        .sort({ createdAt: 1 });
};

// Pre-save: generate complaint number
complaintSchema.pre('save', async function () {
    if (!this.complaintNumber) {
        this.complaintNumber = await (this.constructor as IComplaintModel).generateComplaintNumber();
    }
});

// Indexes
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ client: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint: IComplaintModel =
    (mongoose.models.Complaint as IComplaintModel) ||
    mongoose.model<IComplaintDocument, IComplaintModel>('Complaint', complaintSchema);

export default Complaint;
