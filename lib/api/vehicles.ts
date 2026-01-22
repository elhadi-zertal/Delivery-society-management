import { IVehicle } from "@/types";

const API_URL = '/api/vehicles';

export const vehiclesApi = {
    getAll: async (): Promise<IVehicle[]> => {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const json = await res.json();
        return json.data || [];
    },
    getById: async (id: string): Promise<IVehicle> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch vehicle");
        const json = await res.json();
        return json.data;
    },
    create: async (data: Partial<IVehicle>): Promise<IVehicle> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create vehicle");
        }
        const json = await res.json();
        return json.data;
    },
    update: async (id: string, data: Partial<IVehicle>): Promise<IVehicle> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update vehicle");
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
            throw new Error(error.message || "Failed to delete vehicle");
        }
    }
};
