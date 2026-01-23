import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IShipment, ShipmentStatus, ITrackingEntry, IPackageDetails } from '@/types';

export interface IShipmentDocument extends Omit<IShipment, '_id' | 'client' | 'serviceType' | 'destination' | 'deliveryTour' | 'invoice'>, Document {
    client: Types.ObjectId;
    serviceType: Types.ObjectId;
    destination: Types.ObjectId;
    deliveryTour?: Types.ObjectId;
    invoice?: Types.ObjectId;
}

interface IShipmentModel extends Model<IShipmentDocument> {
    generateShipmentNumber(): Promise<string>;
    findByClient(clientId: Types.ObjectId | string): Promise<IShipmentDocument[]>;
    findPendingInvoice(clientId: Types.ObjectId | string): Promise<IShipmentDocument[]>;
}

const trackingEntrySchema = new Schema<ITrackingEntry>(
    {
        timestamp: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: Object.values(ShipmentStatus),
            required: true,
        },
        location: String,
        description: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { _id: false }
);

const packageDetailsSchema = new Schema<IPackageDetails>(
    {
        description: {
            type: String,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
        },
        volume: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        declaredValue: Number,
    },
    { _id: false }
);

const shipmentSchema = new Schema<IShipmentDocument>(
    {
        shipmentNumber: {
            type: String,
            unique: true,
            required: true,
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client is required'],
        },
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

        // Sender info
        senderName: {
            type: String,
            required: [true, 'Sender name is required'],
        },
        senderPhone: {
            type: String,
            required: [true, 'Sender phone is required'],
        },
        senderAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },

        // Receiver info
        receiverName: {
            type: String,
            required: [true, 'Receiver name is required'],
        },
        receiverPhone: {
            type: String,
            required: [true, 'Receiver phone is required'],
        },
        receiverAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },

        // Package details
        packages: {
            type: [packageDetailsSchema],
            required: true,
            validate: [(val: IPackageDetails[]) => val.length > 0, 'At least one package is required'],
        },
        totalWeight: {
            type: Number,
            required: true,
            min: 0,
        },
        totalVolume: {
            type: Number,
            required: true,
            min: 0,
        },

        // Pricing
        priceBreakdown: {
            baseAmount: { type: Number, default: 0 },
            weightAmount: { type: Number, default: 0 },
            volumeAmount: { type: Number, default: 0 },
            additionalFees: { type: Number, default: 0 },
            discount: { type: Number, default: 0 },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Status & Tracking
        status: {
            type: String,
            enum: Object.values(ShipmentStatus),
            default: ShipmentStatus.PENDING,
        },
        trackingHistory: {
            type: [trackingEntrySchema],
            default: [],
        },

        // Dates
        pickupDate: Date,
        estimatedDeliveryDate: Date,
        actualDeliveryDate: Date,

        // References
        deliveryTour: {
            type: Schema.Types.ObjectId,
            ref: 'DeliveryTour',
        },
        invoice: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
        },

        notes: String,
        isInvoiced: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Generate unique shipment number
shipmentSchema.statics.generateShipmentNumber = async function (): Promise<string> {
    const prefix = 'SHP';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    // Count shipments for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return `${prefix}-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
};

// Find shipments by client
shipmentSchema.statics.findByClient = function (clientId: Types.ObjectId | string) {
    return this.find({ client: clientId })
        .populate('serviceType')
        .populate('destination')
        .sort({ createdAt: -1 });
};

// Find shipments pending invoice for a client
shipmentSchema.statics.findPendingInvoice = function (clientId: Types.ObjectId | string) {
    return this.find({
        client: clientId,
        isInvoiced: false,
        status: { $in: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED] },
    }).populate('serviceType destination');
};

// Pre-save: generate shipment number, calculate totals
shipmentSchema.pre('save', async function () {
    if (!this.shipmentNumber) {
        this.shipmentNumber = await (this.constructor as IShipmentModel).generateShipmentNumber();
    }

    // Calculate total weight and volume from packages
    this.totalWeight = this.packages.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
    this.totalVolume = this.packages.reduce((sum, pkg) => sum + (pkg.volume * pkg.quantity), 0);

    // Add initial tracking entry if new
    if (this.isNew && this.trackingHistory.length === 0) {
        this.trackingHistory.push({
            timestamp: new Date(),
            status: ShipmentStatus.PENDING,
            description: 'Shipment created',
        });
    }
});

// Indexes
shipmentSchema.index({ client: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ isInvoiced: 1 });
shipmentSchema.index({ deliveryTour: 1 });

const Shipment: IShipmentModel =
    (mongoose.models.Shipment as IShipmentModel) ||
    mongoose.model<IShipmentDocument, IShipmentModel>('Shipment', shipmentSchema);

export default Shipment;
