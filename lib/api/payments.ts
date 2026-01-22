import { IPayment, PaymentMethod } from "@/types";

const API_URL = '/api/payments';

export interface PaymentFilters {
    clientId?: string;
    invoiceId?: string;
    paymentMethod?: PaymentMethod;
    dateFrom?: Date;
    dateTo?: Date;
}

export const paymentsApi = {
    getAll: async (filters?: PaymentFilters): Promise<IPayment[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.clientId) params.append('client', filters.clientId);
            if (filters.invoiceId) params.append('invoice', filters.invoiceId);
            if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch payments");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IPayment> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch payment");
        const json = await res.json();
        return json.data;
    },

    void: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to void payment");
        }
    },
};
