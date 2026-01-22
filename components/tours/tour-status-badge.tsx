"use client";

import { TourStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    Play
} from "lucide-react";

interface TourStatusBadgeProps {
    status: TourStatus;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
}

const statusConfig: Record<TourStatus, { label: string; color: string; icon: React.ElementType }> = {
    [TourStatus.PLANNED]: {
        label: "Planned",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Clock,
    },
    [TourStatus.IN_PROGRESS]: {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Play,
    },
    [TourStatus.COMPLETED]: {
        label: "Completed",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
    },
    [TourStatus.CANCELLED]: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function TourStatusBadge({
    status,
    size = "md",
    showIcon = true
}: TourStatusBadgeProps) {
    const config = statusConfig[status];
    if (!config) return null;
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
