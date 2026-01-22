export interface AnalyticsParams {
    startDate?: Date;
    endDate?: Date;
    compareWithPrevious?: boolean;
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    months?: number; // legacy support for simple timeframe
}

export interface CommercialAnalytics {
    period: { start: string; end: string };
    shipmentEvolution: { month: string; count: number; revenue: number }[];
    totalRevenue: number;
    totalShipments: number;
    averageShipmentValue: number;
    topClients: {
        client: {
            _id: string;
            firstName: string;
            lastName: string;
            companyName?: string;
        };
        shipmentCount: number;
        revenue: number;
    }[];
    popularDestinations: {
        destination: {
            _id: string;
            city: string;
            country: string;
            zone: string;
        };
        shipmentCount: number;
        revenue: number;
    }[];
    serviceTypeBreakdown: {
        serviceType: {
            name: string;
            displayName: string;
        };
        count: number;
        percentage: number;
    }[];
}

export interface OperationalAnalytics {
    period: { start: string; end: string };
    tourEvolution: { month: string; count: number; averageDeliveries: number }[];
    totalTours: number;
    totalDeliveries: number;
    deliverySuccessRate: number;
    averageDeliveriesPerTour: number;
    totalDistance: number;
    totalFuel: number;
    topDrivers: {
        driver: {
            firstName: string;
            lastName: string;
            employeeId: string;
        };
        tourCount: number;
        deliveryCount: number;
        successRate: number;
    }[];
    incidentZones: {
        zone: string;
        incidentCount: number;
        typeBreakdown: Record<string, number>;
    }[];
    peakPeriods: {
        dayOfWeek: string;
        hourRange: string;
        averageShipments: number;
    }[];
    vehicleUtilization: {
        vehicle: {
            registrationNumber: string;
            brand: string;
            model: string;
        };
        tourCount: number;
        totalDistance: number;
        totalFuel: number;
    }[];
}

export interface FinancialAnalytics {
    period: { start: string; end: string };
    revenueTrend: { month: string; revenue: number; collections: number; outstanding: number }[];
    totalRevenue: number;
    totalCollections: number;
    outstandingAmount: number;
    collectionEfficiency: number;
    revenueByMethod: { method: string; amount: number; percentage: number }[];
    invoiceAging: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90: number;
    };
    profitability?: {
        revenue: number;
        costs: number;
        profit: number;
        margin: number;
    };
}
