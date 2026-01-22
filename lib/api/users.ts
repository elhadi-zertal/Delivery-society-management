import { IUser, UserRole } from "@/types";

const API_URL = '/api/users';

export interface UserFilters {
    role?: UserRole;
    search?: string;
}

export const usersApi = {
    getAll: async (filters?: UserFilters): Promise<IUser[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.role) params.append('role', filters.role);
            if (filters.search) params.append('search', filters.search);
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IUser> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const json = await res.json();
        return json.data;
    },

    getAgents: async (): Promise<IUser[]> => {
        return usersApi.getAll({ role: UserRole.AGENT });
    },
};
