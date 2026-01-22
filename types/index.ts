import { Types } from 'mongoose';

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
    ADMIN = 'admin',
    AGENT = 'agent',
    DRIVER = 'driver',
}

export enum DriverStatus {
    AVAILABLE = 'available',
    ON_TOUR = 'on_tour',
    OFF_DUTY = 'off_duty',
    ON_LEAVE = 'on_leave',
}

export enum VehicleStatus {
    AVAILABLE = 'available',
    IN_USE = 'in_use',
    MAINTENANCE = 'maintenance',
    OUT_OF_SERVICE = 'out_of_service',
}

export enum VehicleType {
    VAN = 'van',
    TRUCK = 'truck',
    MOTORCYCLE = 'motorcycle',
    CAR = 'car',
}

export enum ServiceTypeName {
    STANDARD = 'standard',
    EXPRESS = 'express',
    INTERNATIONAL = 'international',
}

export enum ShipmentStatus {
    PENDING = 'pending',
    PICKED_UP = 'picked_up',
    IN_TRANSIT = 'in_transit',
    AT_SORTING_CENTER = 'at_sorting_center',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    FAILED_DELIVERY = 'failed_delivery',
    RETURNED = 'returned',
    CANCELLED = 'cancelled',
}

export enum TourStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PARTIALLY_PAID = 'partially_paid',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    CHECK = 'check',
    CARD = 'card',
}

export enum IncidentType {
    DELAY = 'delay',
    LOSS = 'loss',
    DAMAGE = 'damage',
    TECHNICAL_ISSUE = 'technical_issue',
    ACCIDENT = 'accident',
    OTHER = 'other',
}

export enum IncidentStatus {
    REPORTED = 'reported',
    UNDER_INVESTIGATION = 'under_investigation',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum ComplaintStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CANCELLED = 'cancelled',
}

export enum ComplaintNature {
    DELAY = 'delay',
    DAMAGE = 'damage',
    LOSS = 'loss',
    BILLING = 'billing',
    SERVICE_QUALITY = 'service_quality',
    DRIVER_BEHAVIOR = 'driver_behavior',
    OTHER = 'other',
}

// ============================================================================
// Base Interfaces
// ============================================================================

export interface BaseDocument {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Address {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

// ============================================================================
// User & Authentication
// ============================================================================

export interface IUser extends BaseDocument {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    photoUrl?: string;
    lastLogin?: Date;
}

export interface IUserPublic extends Omit<IUser, 'password'> { }

// ============================================================================
// Client
// ============================================================================

export interface IClient extends BaseDocument {
    code: string;
    companyName?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: Address;
    accountBalance: number;
    notes?: string;
    isActive: boolean;
}

// ============================================================================
// Driver
// ============================================================================

export interface IDriver extends BaseDocument {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: Address;
    licenseNumber: string;
    licenseExpiry: Date;
    licenseType: string;
    status: DriverStatus;
    hireDate: Date;
    rating?: number;
    totalToursCompleted?: number;
    notes?: string;
    isActive: boolean;
}

// ============================================================================
// Vehicle
// ============================================================================

export interface IVehicle extends BaseDocument {
    registrationNumber: string;
    type: VehicleType;
    brand: string;
    model: string;
    year: number;
    capacity: {
        weight: number; // in kg
        volume: number; // in m³
    };
    fuelType: string;
    fuelConsumption: number; // liters per 100km
    status: VehicleStatus;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    mileage: number;
    notes?: string;
    isActive: boolean;
}

// ============================================================================
// Destination
// ============================================================================

export interface IDestination extends BaseDocument {
    code: string;
    city: string;
    country: string;
    zone: string;
    postalCodeRange?: {
        from: string;
        to: string;
    };
    baseRate: number;
    isActive: boolean;
}

// ============================================================================
// Service Type
// ============================================================================

export interface IServiceType extends BaseDocument {
    code: string;
    name: ServiceTypeName;
    displayName: string;
    description?: string;
    estimatedDeliveryDays: {
        min: number;
        max: number;
    };
    multiplier: number; // Price multiplier
    isActive: boolean;
}

// ============================================================================
// Pricing
// ============================================================================

export interface IPricing extends BaseDocument {
    serviceType: Types.ObjectId | string | IServiceType;
    destination: Types.ObjectId | string | IDestination;
    baseRate: number;
    weightRate: number; // per kg
    volumeRate: number; // per m³
    minCharge: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive: boolean;
}

// ============================================================================
// Shipment
// ============================================================================

export interface ITrackingEntry {
    timestamp: Date;
    status: ShipmentStatus;
    location?: string;
    description: string;
    updatedBy?: Types.ObjectId;
}

export interface IPackageDetails {
    description: string;
    weight: number; // in kg
    volume: number; // in m³
    quantity: number;
    declaredValue?: number;
}

export interface IShipment extends BaseDocument {
    shipmentNumber: string; // Auto-generated
    client: Types.ObjectId | string | IClient;
    serviceType: Types.ObjectId | string | IServiceType;
    destination: Types.ObjectId | string | IDestination;

    // Sender info
    senderName: string;
    senderPhone: string;
    senderAddress: Address;

    // Receiver info
    receiverName: string;
    receiverPhone: string;
    receiverAddress: Address;

    // Package details
    packages: IPackageDetails[];
    totalWeight: number;
    totalVolume: number;

    // Pricing
    priceBreakdown: {
        baseAmount: number;
        weightAmount: number;
        volumeAmount: number;
        additionalFees: number;
        discount: number;
    };
    totalAmount: number;

    // Status & Tracking
    status: ShipmentStatus;
    trackingHistory: ITrackingEntry[];

    // Dates
    pickupDate?: Date;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;

    // References
    deliveryTour?: Types.ObjectId | string | IDeliveryTour;
    invoice?: Types.ObjectId | string | IInvoice;

    notes?: string;
    isInvoiced: boolean;
}

// ============================================================================
// Delivery Tour
// ============================================================================

export interface IDeliveryTour extends BaseDocument {
    tourNumber: string;
    date: Date;
    driver: Types.ObjectId | string | IDriver;
    vehicle: Types.ObjectId | string | IVehicle;
    shipments: Types.ObjectId[] | string[] | IShipment[];

    status: TourStatus;

    // Route planning
    plannedRoute: {
        startLocation: string;
        endLocation: string;
        estimatedDistance: number; // km
        estimatedDuration: number; // minutes
    };

    // Actual route data (filled on completion)
    actualRoute?: {
        startTime?: Date;
        endTime?: Date;
        actualDistance?: number;
        actualDuration?: number;
        fuelConsumed?: number;
    };

    // Statistics
    deliveriesCompleted: number;
    deliveriesFailed: number;

    incidents?: Types.ObjectId[];
    notes?: string;
}

// ============================================================================
// Invoice
// ============================================================================

export interface IInvoice extends BaseDocument {
    invoiceNumber: string;
    client: Types.ObjectId | string | IClient;
    shipments: Types.ObjectId[] | string[] | IShipment[];

    // Amounts
    amountHT: number; // Before tax
    tvaRate: number; // 19%
    tvaAmount: number;
    totalTTC: number; // After tax

    // Payment tracking
    amountPaid: number;
    amountDue: number;

    status: InvoiceStatus;

    issueDate: Date;
    dueDate: Date;

    notes?: string;
}

// ============================================================================
// Payment
// ============================================================================

export interface IPayment extends BaseDocument {
    paymentNumber: string;
    invoice: Types.ObjectId | string | IInvoice;
    client: Types.ObjectId | string | IClient;

    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;

    reference?: string; // Check number, transfer reference, etc.
    notes?: string;
}

// ============================================================================
// Incident
// ============================================================================

export interface IIncident extends BaseDocument {
    incidentNumber: string;
    type: IncidentType;

    // Related entities (at least one required)
    shipment?: Types.ObjectId | string | IShipment;
    deliveryTour?: Types.ObjectId | string | IDeliveryTour;
    vehicle?: Types.ObjectId | string | IVehicle;
    driver?: Types.ObjectId | string | IDriver;

    description: string;
    location?: string;
    occurredAt: Date;

    // Evidence (Cloudinary URLs)
    documents: string[];
    photos: string[];

    status: IncidentStatus;
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId | string | IUser;

    reportedBy: Types.ObjectId | string | IUser;
}

// ============================================================================
// Complaint
// ============================================================================

export interface IComplaint extends BaseDocument {
    complaintNumber: string;
    client?: Types.ObjectId | string | IClient;

    // Related entities
    deliveryTour?: Types.ObjectId | string | IDeliveryTour;
    shipments?: Types.ObjectId[] | string[] | IShipment[];
    invoice?: Types.ObjectId | string | IInvoice;

    nature: ComplaintNature;
    description: string;

    status: ComplaintStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';

    // Resolution
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId | IUser;

    // Communication
    attachments?: string[]; // Cloudinary URLs

    assignedTo?: Types.ObjectId | string | IUser;
}

// ============================================================================
// Favorite
// ============================================================================

export interface IFavorite extends BaseDocument {
    user: Types.ObjectId | IUser;
    featureType: 'menu' | 'report' | 'client' | 'shipment' | 'custom';
    featureId: string;
    label: string;
    path?: string;
    order: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface SearchResults {
    shipments: any[];
    clients: any[];
    tours: any[];
    drivers: any[];
    vehicles: any[];
    total: number;
}

export interface CreateUserInput {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface PriceCalculationInput {
    serviceTypeId: string;
    destinationId: string;
    packages: {
        weight: number;
        volume: number;
        quantity: number;
    }[];
}

export interface PriceCalculationResult {
    baseAmount: number;
    weightAmount: number;
    volumeAmount: number;
    totalAmount: number;
    breakdown: {
        baseRate: number;
        weightRate: number;
        volumeRate: number;
        totalWeight: number;
        totalVolume: number;
    };
}

export interface GenerateInvoiceInput {
    clientId: string;
    shipmentIds: string[];
    dueInDays?: number;
    notes?: string;
}

export interface RecordPaymentInput {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date;
    reference?: string;
    notes?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface CommercialAnalytics {
    period: {
        start: Date;
        end: Date;
    };
    shipmentEvolution: {
        month: string;
        count: number;
        revenue: number;
    }[];
    totalRevenue: number;
    totalShipments: number;
    averageShipmentValue: number;
    topClients: {
        client: IClient;
        shipmentCount: number;
        revenue: number;
    }[];
    popularDestinations: {
        destination: IDestination;
        shipmentCount: number;
        revenue: number;
    }[];
    serviceTypeBreakdown: {
        serviceType: IServiceType;
        count: number;
        percentage: number;
    }[];
}

export interface OperationalAnalytics {
    period: {
        start: Date;
        end: Date;
    };
    tourEvolution: {
        month: string;
        count: number;
        averageDeliveries: number;
    }[];
    totalTours: number;
    totalDeliveries: number;
    deliverySuccessRate: number;
    averageDeliveriesPerTour: number;
    topDrivers: {
        driver: IDriver;
        tourCount: number;
        deliveryCount: number;
        successRate: number;
    }[];
    incidentZones: {
        zone: string;
        incidentCount: number;
        types: Record<IncidentType, number>;
    }[];
    peakPeriods: {
        dayOfWeek: string;
        hourRange: string;
        averageShipments: number;
    }[];
    vehicleUtilization: {
        vehicle: IVehicle;
        tourCount: number;
        totalDistance: number;
        totalFuel: number;
    }[];
}

// ============================================================================
// Admin & Advanced Features Types
// ============================================================================

export interface UserPreferences {
    language: 'en' | 'fr' | 'ar';
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    theme: 'light' | 'dark' | 'auto';
    emailNotifications: boolean;
    smsNotifications: boolean;
    itemsPerPage: number;
}

export interface Favorite {
    _id: string;
    userId: string;
    featureName: string;
    featureRoute: string;
    icon?: string;
    order: number;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'system' | 'task' | 'alert' | 'payment' | 'approval' | 'message';
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    read: boolean;
    createdAt: string;
}

export interface AuditLog {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    changes?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed';
    timestamp: string;
}

export interface SystemSettings {
    companyName: string;
    companyLogo?: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    taxId: string;
    tvaRate: number;
    defaultPaymentTerms: number;
    currency: string;
    distanceUnit: 'km' | 'mi';
    weightUnit: 'kg' | 'lb';
    volumeUnit: 'm3' | 'ft3';
    emailSettings: {
        smtpServer: string;
        smtpPort: number;
        smtpUsername: string;
        smtpPassword?: string; // Optional on client
        fromEmail: string;
        fromName: string;
    };
    securitySettings: {
        minPasswordLength: number;
        requireUppercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        passwordExpiry: number;
        sessionTimeout: number;
        maxLoginAttempts: number;
        twoFactorEnabled: boolean;
    };
}
