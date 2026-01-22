"use client";

import { InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";
import { FileText, Send, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
    [InvoiceStatus.DRAFT]: {
        label: "Draft",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: FileText,
    },
    [InvoiceStatus.PENDING]: {
        label: "Sent",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Send,
    },
    [InvoiceStatus.PAID]: {
        label: "Paid",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
    },
    [InvoiceStatus.PARTIALLY_PAID]: {
        label: "Partial",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
    },
    [InvoiceStatus.OVERDUE]: {
        label: "Overdue",
        color: "bg-red-100 text-red-800 border-red-300 animate-pulse",
        icon: AlertTriangle,
    },
    [InvoiceStatus.CANCELLED]: {
        label: "Cancelled",
        color: "bg-gray-100 text-gray-500 border-gray-300",
        icon: XCircle,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function InvoiceStatusBadge({ status, size = "md", showIcon = true }: InvoiceStatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 font-semibold rounded-full border",
                config.color,
                sizeClasses[size]
            )}
        >
            {showIcon && <Icon className={cn("h-3.5 w-3.5", size === "lg" && "h-4 w-4")} />}
            {config.label}
        </span>
    );
}
