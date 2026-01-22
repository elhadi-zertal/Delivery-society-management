import { IInvoice, IPayment, InvoiceStatus, PaymentMethod } from "@/types";

const API_URL = '/api/invoices';

export interface InvoiceFilters {
    clientId?: string;
    status?: InvoiceStatus[];
    dateFrom?: Date;
    dateTo?: Date;
    invoiceNumber?: string;
    overdue?: boolean;
}

export interface GenerateInvoiceInput {
    clientId: string;
    shipmentIds: string[];
    dueInDays?: number;
    notes?: string;
    discount?: { type: 'percentage' | 'fixed'; value: number };
}

export interface RecordPaymentInput {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date;
    reference?: string;
    notes?: string;
}

export const invoicesApi = {
    getAll: async (filters?: InvoiceFilters): Promise<IInvoice[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.clientId) params.append('client', filters.clientId);
            if (filters.status?.length) params.append('status', filters.status.join(','));
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
            if (filters.invoiceNumber) params.append('search', filters.invoiceNumber);
            if (filters.overdue) params.append('overdue', 'true');
        }
        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch invoices");
        const json = await res.json();
        return json.data || [];
    },

    getById: async (id: string): Promise<IInvoice> => {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const json = await res.json();
        return json.data;
    },

    getByClient: async (clientId: string): Promise<IInvoice[]> => {
        const res = await fetch(`${API_URL}?client=${clientId}`);
        if (!res.ok) throw new Error("Failed to fetch client invoices");
        const json = await res.json();
        return json.data || [];
    },

    generate: async (data: GenerateInvoiceInput): Promise<IInvoice> => {
        const res = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to generate invoice");
        }
        const json = await res.json();
        return json.data;
    },

    create: async (data: Partial<IInvoice>): Promise<IInvoice> => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create invoice");
        }
        const json = await res.json();
        return json.data;
    },

    update: async (id: string, data: Partial<IInvoice>): Promise<IInvoice> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update invoice");
        }
        const json = await res.json();
        return json.data;
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete invoice");
        }
    },

    recordPayment: async (invoiceId: string, payment: RecordPaymentInput): Promise<IPayment> => {
        const res = await fetch(`${API_URL}/${invoiceId}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to record payment");
        }
        const json = await res.json();
        return json.data;
    },

    getPayments: async (invoiceId: string): Promise<IPayment[]> => {
        const res = await fetch(`${API_URL}/${invoiceId}/payments`);
        if (!res.ok) throw new Error("Failed to fetch payments");
        const json = await res.json();
        return json.data || [];
    },

    downloadPDF: async (id: string): Promise<Blob> => {
        const res = await fetch(`${API_URL}/${id}/pdf`);
        if (!res.ok) throw new Error("Failed to download PDF");
        return res.blob();
    },

    cancel: async (id: string): Promise<IInvoice> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to cancel invoice");
        }
        const json = await res.json();
        return json.data;
    },
};
