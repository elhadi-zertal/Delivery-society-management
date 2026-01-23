import { toast } from 'sonner';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

async function fetcher<T>(url: string, method: HttpMethod, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const config: RequestInit = {
        method,
        headers,
        ...options,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Something went wrong');
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred');
    }
}

export const apiClient = {
    auth: {
        signUp: async (data: unknown) => {
            return fetcher('/api/auth/signup', 'POST', data);
        },
    },
    driver: {
        getTours: async () => {
            return fetcher<any[]>('/api/driver/tours', 'GET');
        },
    },
    tours: {
        getById: async (id: string) => {
            return fetcher<any>(`/api/tours/${id}`, 'GET');
        },
        reorderShipments: async (id: string, shipmentIds: string[]) => {
            return fetcher<any>(`/api/tours/${id}/reorder`, 'PATCH', { shipmentIds });
        },
        start: async (id: string) => {
            return fetcher<any>(`/api/tours/${id}/start`, 'PATCH');
        },
        complete: async (id: string, data: any) => {
            return fetcher<any>(`/api/tours/${id}/complete`, 'PATCH', data);
        },
    },
    shipments: {
        updateStatus: async (id: string, data: any) => {
            return fetcher<any>(`/api/shipments/${id}/status`, 'PATCH', data);
        },
    },
    incidents: {
        create: async (data: unknown) => {
            return fetcher<any>('/api/incidents', 'POST', data);
        },
    },
    complaints: {
        create: async (data: unknown) => {
            return fetcher<any>('/api/complaints', 'POST', data);
        },
    },
    upload: {
        file: async (base64: string, folder?: string) => {
            return fetcher<any>('/api/upload', 'POST', { file: base64, folder });
        },
    },
};
