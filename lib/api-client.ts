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
    // Add other API groups here as needed
};
