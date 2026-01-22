import { IComplaint, ComplaintStatus, ComplaintNature } from "@/types";

const API_URL = '/api/complaints';

export interface ComplaintFilters {
    clientId?: string;
    nature?: ComplaintNature;
    status?: ComplaintStatus[];
    priority?: string;
    assignedTo?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface CreateComplaintInput {
    clientId: string;
    nature: ComplaintNature;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    shipmentIds?: string[];
    invoiceId?: string;
    attachments?: string[];
}

export interface ResolveComplaintInput {
    resolution: string;
}

export const complaintsApi = {
    getAll: async (filters?: ComplaintFilters): Promise<IComplaint[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.clientId) params.append('client', filters.clientId);
            if (filters.nature) params.append('nature', filters.nature);
            if (filters.status?.length) params.append('status', filters.status.join(','));
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch complaints");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IComplaint> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch complaint");
        const json = await res.json();
        return json.data;
    },

    create: async (data: CreateComplaintInput): Promise<IComplaint> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create complaint");
        }
        const json = await res.json();
        return json.data;
    },

    update: async (id: string, data: Partial<IComplaint>): Promise<IComplaint> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update complaint");
        }
        const json = await res.json();
        return json.data;
    },

    assign: async (id: string, userId: string): Promise<IComplaint> => {
        return complaintsApi.update(id, { assignedTo: userId as any });
    },

    updateStatus: async (id: string, status: ComplaintStatus): Promise<IComplaint> => {
        return complaintsApi.update(id, { status });
    },

    resolve: async (id: string, data: ResolveComplaintInput): Promise<IComplaint> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: ComplaintStatus.RESOLVED,
                resolution: data.resolution,
                resolvedAt: new Date(),
            }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to resolve complaint");
        }
        const json = await res.json();
        return json.data;
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete complaint");
        }
    },
};
