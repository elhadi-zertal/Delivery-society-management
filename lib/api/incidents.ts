import { IIncident, IncidentType, IncidentStatus } from "@/types";

const API_URL = '/api/incidents';

export interface IncidentFilters {
    type?: IncidentType;
    status?: IncidentStatus[];
    shipmentId?: string;
    tourId?: string;
    driverId?: string;
    vehicleId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface CreateIncidentInput {
    type: IncidentType;
    description: string;
    location?: string;
    occurredAt: Date;
    shipmentId?: string;
    tourId?: string;
    driverId?: string;
    vehicleId?: string;
    photos?: string[];
    documents?: string[];
}

export interface ResolveIncidentInput {
    resolution: string;
}

export const incidentsApi = {
    getAll: async (filters?: IncidentFilters): Promise<IIncident[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.type) params.append('type', filters.type);
            if (filters.status?.length) params.append('status', filters.status.join(','));
            if (filters.shipmentId) params.append('shipment', filters.shipmentId);
            if (filters.tourId) params.append('tour', filters.tourId);
            if (filters.driverId) params.append('driver', filters.driverId);
            if (filters.vehicleId) params.append('vehicle', filters.vehicleId);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch incidents");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IIncident> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch incident");
        const json = await res.json();
        return json.data;
    },

    create: async (data: CreateIncidentInput): Promise<IIncident> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create incident");
        }
        const json = await res.json();
        return json.data;
    },

    update: async (id: string, data: Partial<IIncident>): Promise<IIncident> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update incident");
        }
        const json = await res.json();
        return json.data;
    },

    updateStatus: async (id: string, status: IncidentStatus): Promise<IIncident> => {
        return incidentsApi.update(id, { status });
    },

    resolve: async (id: string, data: ResolveIncidentInput): Promise<IIncident> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: IncidentStatus.RESOLVED,
                resolution: data.resolution,
                resolvedAt: new Date(),
            }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to resolve incident");
        }
        const json = await res.json();
        return json.data;
    },

    close: async (id: string): Promise<IIncident> => {
        return incidentsApi.update(id, { status: IncidentStatus.CLOSED });
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete incident");
        }
    },
};
