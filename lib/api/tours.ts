import { IDeliveryTour, TourStatus } from "@/types";

export interface TourFilters {
    status?: TourStatus[];
    startDate?: string;
    endDate?: string;
    driver?: string;
    vehicle?: string;
    page?: number;
    limit?: number;
}

export const toursApi = {
    getAll: async (filters: TourFilters = {}): Promise<IDeliveryTour[]> => {
        const query = new URLSearchParams();
        if (filters.status?.length) {
            filters.status.forEach(s => query.append('status', s));
        }
        if (filters.startDate) query.append('startDate', filters.startDate);
        if (filters.endDate) query.append('endDate', filters.endDate);
        if (filters.driver) query.append('driver', filters.driver);
        if (filters.vehicle) query.append('vehicle', filters.vehicle);
        if (filters.page) query.append('page', filters.page.toString());
        if (filters.limit) query.append('limit', filters.limit.toString());

        const response = await fetch(`/api/tours?${query.toString()}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch tours');
        return data.data;
    },

    getById: async (id: string): Promise<IDeliveryTour> => {
        const response = await fetch(`/api/tours/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch tour');
        return data.data;
    },

    create: async (tourData: Partial<IDeliveryTour>): Promise<IDeliveryTour> => {
        const response = await fetch('/api/tours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create tour');
        return data.data;
    },

    update: async (id: string, tourData: Partial<IDeliveryTour>): Promise<IDeliveryTour> => {
        const response = await fetch(`/api/tours/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update tour');
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`/api/tours/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete tour');
        }
    },

    getPerformance: async (tourId: string): Promise<any> => {
        const response = await fetch(`/api/tours/${tourId}/performance`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch tour performance');
        return data.data;
    }
};
