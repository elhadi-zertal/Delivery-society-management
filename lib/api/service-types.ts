import { IServiceType } from "@/types";

const API_URL = '/api/service-types';

export const serviceTypesApi = {
    getAll: async (): Promise<IServiceType[]> => {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch service types");
        const json = await res.json();
        return json.data || [];
    },
    getById: async (id: string): Promise<IServiceType> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch service type");
        const json = await res.json();
        return json.data;
    },
    create: async (data: Partial<IServiceType>): Promise<IServiceType> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create service type");
        }
        const json = await res.json();
        return json.data;
    },
    update: async (id: string, data: Partial<IServiceType>): Promise<IServiceType> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update service type");
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
            throw new Error(error.message || "Failed to delete service type");
        }
    }
};
