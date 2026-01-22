import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IPayment, PaymentMethod } from '@/types';

export interface IPaymentDocument extends Omit<IPayment, '_id' | 'invoice' | 'client'>, Document {
    invoice: Types.ObjectId;
    client: Types.ObjectId;
}

interface IPaymentModel extends Model<IPaymentDocument> {
    generatePaymentNumber(): Promise<string>;
    findByInvoice(invoiceId: Types.ObjectId | string): Promise<IPaymentDocument[]>;
    findByClient(clientId: Types.ObjectId | string): Promise<IPaymentDocument[]>;
    getTotalPaidForInvoice(invoiceId: Types.ObjectId | string): Promise<number>;
}

const paymentSchema = new Schema<IPaymentDocument>(
    {
        paymentNumber: {
            type: String,
            unique: true,
            required: true,
        },
        invoice: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: [true, 'Invoice is required'],
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client is required'],
        },

        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be positive'],
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            required: [true, 'Payment method is required'],
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },

        reference: String,
        notes: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Generate unique payment number
paymentSchema.statics.generatePaymentNumber = async function (): Promise<string> {
    const prefix = 'PAY';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return `${prefix}-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
};

// Find payments by invoice
paymentSchema.statics.findByInvoice = function (invoiceId: Types.ObjectId | string) {
    return this.find({ invoice: invoiceId })
        .sort({ paymentDate: -1 });
};

// Find payments by client
paymentSchema.statics.findByClient = function (clientId: Types.ObjectId | string) {
    return this.find({ client: clientId })
        .populate('invoice')
        .sort({ paymentDate: -1 });
};

// Get total paid amount for an invoice
paymentSchema.statics.getTotalPaidForInvoice = async function (
    invoiceId: Types.ObjectId | string
): Promise<number> {
    const result = await this.aggregate([
        { $match: { invoice: new Types.ObjectId(invoiceId.toString()) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
};

// Pre-save: generate payment number
paymentSchema.pre('save', async function () {
    if (!this.paymentNumber) {
        this.paymentNumber = await (this.constructor as IPaymentModel).generatePaymentNumber();
    }
});

// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment: IPaymentModel =
    (mongoose.models.Payment as IPaymentModel) ||
    mongoose.model<IPaymentDocument, IPaymentModel>('Payment', paymentSchema);

export default Payment;
