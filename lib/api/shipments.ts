import { IShipment, ITrackingEntry, ShipmentStatus } from "@/types";

const API_URL = '/api/shipments';

export interface ShipmentFilters {
    clientId?: string;
    destinationId?: string;
    serviceTypeId?: string;
    status?: ShipmentStatus[];
    dateFrom?: Date;
    dateTo?: Date;
    trackingNumber?: string;
}

export interface PriceCalculationParams {
    serviceTypeId: string;
    destinationId: string;
    packages: { weight: number; volume: number; quantity: number }[];
}

export interface PriceBreakdown {
    baseAmount: number;
    weightAmount: number;
    volumeAmount: number;
    additionalFees: number;
    discount: number;
    subtotalHT: number;
    tva: number;
    totalTTC: number;
}

export interface StatusUpdateData {
    status: ShipmentStatus;
    location?: string;
    description: string;
}

export const shipmentsApi = {
    getAll: async (filters?: ShipmentFilters): Promise<IShipment[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.clientId) params.append('client', filters.clientId);
            if (filters.destinationId) params.append('destination', filters.destinationId);
            if (filters.serviceTypeId) params.append('serviceType', filters.serviceTypeId);
            if (filters.status?.length) params.append('status', filters.status.join(','));
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
            if (filters.trackingNumber) params.append('search', filters.trackingNumber);
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch shipments");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IShipment> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch shipment");
        const json = await res.json();
        return json.data;
    },

    create: async (data: Partial<IShipment>): Promise<IShipment> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create shipment");
        }
        const json = await res.json();
        return json.data;
    },

    update: async (id: string, data: Partial<IShipment>): Promise<IShipment> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update shipment");
        }
        const json = await res.json();
        return json.data;
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete shipment");
        }
    },

    calculatePrice: async (params: PriceCalculationParams): Promise<PriceBreakdown> => {
        const res = await fetch(`${API_URL}/calculate-price`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to calculate price");
        }
        const json = await res.json();
        return json.data;
    },

    updateStatus: async (id: string, data: StatusUpdateData): Promise<IShipment> => {
        const res = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update status");
        }
        const json = await res.json();
        return json.data;
    },

    trackByNumber: async (trackingNumber: string): Promise<{ shipment: IShipment; tracking: ITrackingEntry[] }> => {
        const res = await fetch(`${API_URL}/tracking/${trackingNumber}`);
        if (!res.ok) {
            if (res.status === 404) throw new Error("Tracking number not found");
            throw new Error("Failed to track shipment");
        }
        const json = await res.json();
        return json.data;
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
        await Promise.all(ids.map(id => shipmentsApi.delete(id)));
    },
};
