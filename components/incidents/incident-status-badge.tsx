"use client";

import { IncidentType, IncidentStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
    Clock,
    AlertTriangle,
    Wrench,
    Package,
    SearchX,
    Car,
    CloudRain,
    User,
    Cpu,
    XCircle,
    Info,
    Search,
    CheckCircle,
    Eye,
} from "lucide-react";

interface IncidentStatusBadgeProps {
    status: IncidentStatus;
    size?: "sm" | "md" | "lg";
}

const statusConfig: Record<IncidentStatus, { label: string; color: string; icon: React.ElementType }> = {
    [IncidentStatus.REPORTED]: {
        label: "Reported",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Info,
    },
    [IncidentStatus.UNDER_INVESTIGATION]: {
        label: "Investigating",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Search,
    },
    [IncidentStatus.RESOLVED]: {
        label: "Resolved",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
    },
    [IncidentStatus.CLOSED]: {
        label: "Closed",
        color: "bg-gray-100 text-gray-600 border-gray-300",
        icon: Eye,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function IncidentStatusBadge({ status, size = "md" }: IncidentStatusBadgeProps) {
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
            <Icon className={cn("h-3.5 w-3.5", size === "lg" && "h-4 w-4")} />
            {config.label}
        </span>
    );
}

// Type Badge
interface IncidentTypeBadgeProps {
    type: IncidentType;
    size?: "sm" | "md";
}

const typeConfig: Record<IncidentType, { label: string; color: string; icon: React.ElementType }> = {
    [IncidentType.DELAY]: {
        label: "Delay",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
    },
    [IncidentType.LOSS]: {
        label: "Package Lost",
        color: "bg-red-100 text-red-800",
        icon: SearchX,
    },
    [IncidentType.DAMAGE]: {
        label: "Damage",
        color: "bg-orange-100 text-orange-800",
        icon: Package,
    },
    [IncidentType.TECHNICAL_ISSUE]: {
        label: "Technical",
        color: "bg-purple-100 text-purple-800",
        icon: Cpu,
    },
    [IncidentType.ACCIDENT]: {
        label: "Accident",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
    },
    [IncidentType.OTHER]: {
        label: "Other",
        color: "bg-gray-100 text-gray-800",
        icon: Info,
    },
};

export function IncidentTypeBadge({ type, size = "md" }: IncidentTypeBadgeProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 font-medium rounded",
                config.color,
                size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}
