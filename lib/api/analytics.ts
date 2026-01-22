import { CommercialAnalytics, OperationalAnalytics, FinancialAnalytics, AnalyticsParams } from "@/types/analytics";

const BASE_URL = '/api/analytics';

export const analyticsApi = {
    getCommercial: async (params?: AnalyticsParams): Promise<CommercialAnalytics> => {
        const query = new URLSearchParams();
        if (params?.months) query.append('months', params.months.toString());

        const res = await fetch(`${BASE_URL}/commercial?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch commercial analytics");
        const json = await res.json();
        return json.data;
    },

    getOperational: async (params?: AnalyticsParams): Promise<OperationalAnalytics> => {
        const query = new URLSearchParams();
        if (params?.months) query.append('months', params.months.toString());

        const res = await fetch(`${BASE_URL}/operational?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch operational analytics");
        const json = await res.json();
        return json.data;
    },

    getFinancial: async (params?: AnalyticsParams): Promise<FinancialAnalytics> => {
        const query = new URLSearchParams();
        if (params?.months) query.append('months', params.months.toString());

        const res = await fetch(`${BASE_URL}/financial?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch financial analytics");
        const json = await res.json();
        return json.data;
    }
};
