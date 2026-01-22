import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IInvoice, InvoiceStatus } from '@/types';

export interface IInvoiceDocument extends Omit<IInvoice, '_id' | 'client' | 'shipments'>, Document {
    client: Types.ObjectId;
    shipments: Types.ObjectId[];
}

interface IInvoiceModel extends Model<IInvoiceDocument> {
    generateInvoiceNumber(): Promise<string>;
    findByClient(clientId: Types.ObjectId | string): Promise<IInvoiceDocument[]>;
    findPending(): Promise<IInvoiceDocument[]>;
    findOverdue(): Promise<IInvoiceDocument[]>;
}

const TVA_RATE = 0.19; // 19% TVA

const invoiceSchema = new Schema<IInvoiceDocument>(
    {
        invoiceNumber: {
            type: String,
            unique: true,
            required: true,
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client is required'],
        },
        shipments: [{
            type: Schema.Types.ObjectId,
            ref: 'Shipment',
            required: true,
        }],

        // Amounts
        amountHT: {
            type: Number,
            required: true,
            min: 0,
        },
        tvaRate: {
            type: Number,
            default: TVA_RATE,
        },
        tvaAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalTTC: {
            type: Number,
            required: true,
            min: 0,
        },

        // Payment tracking
        amountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        amountDue: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.PENDING,
        },

        issueDate: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },

        notes: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: is overdue
invoiceSchema.virtual('isOverdue').get(function () {
    return this.status !== InvoiceStatus.PAID &&
        this.status !== InvoiceStatus.CANCELLED &&
        this.dueDate < new Date();
});

// Virtual: payment progress
invoiceSchema.virtual('paymentProgress').get(function () {
    if (this.totalTTC === 0) return 100;
    return Math.round((this.amountPaid / this.totalTTC) * 100);
});

// Generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function (): Promise<string> {
    const prefix = 'INV';
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = await this.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    return `${prefix}-${yearMonth}-${(count + 1).toString().padStart(4, '0')}`;
};

// Find invoices by client
invoiceSchema.statics.findByClient = function (clientId: Types.ObjectId | string) {
    return this.find({ client: clientId })
        .populate('shipments')
        .sort({ issueDate: -1 });
};

// Find pending invoices
invoiceSchema.statics.findPending = function () {
    return this.find({
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID] },
    })
        .populate('client shipments')
        .sort({ dueDate: 1 });
};

// Find overdue invoices
invoiceSchema.statics.findOverdue = function () {
    return this.find({
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { $lt: new Date() },
    })
        .populate('client shipments')
        .sort({ dueDate: 1 });
};

// Pre-save: calculate amounts and update status
invoiceSchema.pre('save', function () {
    // Calculate TVA and TTC
    this.tvaAmount = Math.round(this.amountHT * this.tvaRate * 100) / 100;
    this.totalTTC = Math.round((this.amountHT + this.tvaAmount) * 100) / 100;
    this.amountDue = Math.round((this.totalTTC - this.amountPaid) * 100) / 100;

    // Update status based on payment
    if (this.amountPaid >= this.totalTTC) {
        this.status = InvoiceStatus.PAID;
        this.amountDue = 0;
    } else if (this.amountPaid > 0) {
        this.status = InvoiceStatus.PARTIALLY_PAID;
    }
});

// Method to check and update overdue status
invoiceSchema.methods.checkOverdue = function () {
    if (
        this.status !== InvoiceStatus.PAID &&
        this.status !== InvoiceStatus.CANCELLED &&
        this.dueDate < new Date()
    ) {
        this.status = InvoiceStatus.OVERDUE;
        return true;
    }
    return false;
};

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ issueDate: -1 });

const Invoice: IInvoiceModel =
    (mongoose.models.Invoice as IInvoiceModel) ||
    mongoose.model<IInvoiceDocument, IInvoiceModel>('Invoice', invoiceSchema);

export default Invoice;
