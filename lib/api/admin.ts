import { SystemSettings, SearchResults, Favorite, Notification } from "@/types";

const BASE_URL = '/api';

export const adminApi = {
    // Users
    getUsers: async (filters: any) => {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${BASE_URL}/users?${query}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    createUser: async (data: any) => {
        const res = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    // Settings
    getSettings: async (): Promise<{ data: SystemSettings }> => {
        const res = await fetch(`${BASE_URL}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    updateSettings: async (settings: Partial<SystemSettings>) => {
        const res = await fetch(`${BASE_URL}/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    }
};

export const favoritesApi = {
    getFavorites: async (): Promise<{ data: Favorite[] }> => {
        const res = await fetch(`${BASE_URL}/favorites`);
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    },

    addFavorite: async (data: any) => {
        const res = await fetch(`${BASE_URL}/favorites`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add favorite');
        return res.json();
    }
};

export const notificationsApi = {
    getNotifications: async (): Promise<{ data: Notification[] }> => {
        const res = await fetch(`${BASE_URL}/notifications`);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
    },

    markAllRead: async () => {
        const res = await fetch(`${BASE_URL}/notifications`, {
            method: 'PUT'
        });
        if (!res.ok) throw new Error('Failed to mark notifications read');
        return res.json();
    }
};

export const searchApi = {
    globalSearch: async (query: string): Promise<{ data: SearchResults }> => {
        const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        return res.json();
    }
};
