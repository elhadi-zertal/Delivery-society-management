import { IClient } from "@/types";

const API_URL = '/api/clients';

export const clientsApi = {
    getAll: async (): Promise<IClient[]> => {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch clients");
        const json = await res.json();
        return json.data || [];
    },
    getById: async (id: string): Promise<IClient> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch client");
        const json = await res.json();
        return json.data;
    },
    create: async (data: Partial<IClient>): Promise<IClient> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create client");
        }
        const json = await res.json();
        return json.data;
    },
    update: async (id: string, data: Partial<IClient>): Promise<IClient> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update client");
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
            throw new Error(error.message || "Failed to delete client");
        }
    }
};
