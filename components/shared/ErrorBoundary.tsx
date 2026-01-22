
"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { ReactNode } from "react";
import { toast } from "sonner";

function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 rounded-lg border bg-destructive/5 text-destructive">
            <div className="p-3 bg-white rounded-full shadow-sm">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-sm opacity-90 max-w-md">{error.message || "An unexpected error occurred."}</p>
            </div>
            <Button variant="outline" onClick={resetErrorBoundary} className="gap-2 bg-white">
                <RefreshCcw className="h-4 w-4" /> Try again
            </Button>
        </div>
    );
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // reset the state of your app so the error doesn't happen again
                window.location.reload();
            }}
            onError={(error) => {
                console.error("ErrorBoundary caught an error:", error);
                // Log to service if available
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

export const handleApiError = (error: any) => {
    console.error("API Error:", error);

    // Check for axios/fetch response error structure
    const status = error.response?.status || error.status;
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";

    // Handle specific status codes
    switch (status) {
        case 400:
            toast.error(message || 'Invalid request');
            break;
        case 401:
            toast.error('Session expired. Please login again.');
            // Ideally redirect to login here
            break;
        case 403:
            toast.error('You do not have permission for this action');
            break;
        case 404:
            toast.error('Resource not found');
            break;
        case 429:
            toast.error('Too many requests. Please try again later.');
            break;
        case 500:
            toast.error('Server error. Please try again later.');
            break;
        default:
            // Network errors
            if (error.code === 'ECONNABORTED' || message.includes('Network Error')) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error(message);
            }
    }
};
