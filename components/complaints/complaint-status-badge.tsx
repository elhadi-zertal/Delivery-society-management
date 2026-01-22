"use client";

import { ComplaintStatus, ComplaintNature } from "@/types";
import { cn } from "@/lib/utils";
import {
    Clock,
    AlertTriangle,
    Package,
    DollarSign,
    Star,
    User,
    MessageCircle,
    Info,
    CheckCircle,
    XCircle,
    Eye,
    Loader,
} from "lucide-react";

interface ComplaintStatusBadgeProps {
    status: ComplaintStatus;
    size?: "sm" | "md" | "lg";
}

const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: React.ElementType }> = {
    [ComplaintStatus.PENDING]: {
        label: "Pending",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Clock,
    },
    [ComplaintStatus.IN_PROGRESS]: {
        label: "In Progress",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Loader,
    },
    [ComplaintStatus.RESOLVED]: {
        label: "Resolved",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
    },
    [ComplaintStatus.CANCELLED]: {
        label: "Cancelled",
        color: "bg-gray-100 text-gray-600 border-gray-300",
        icon: XCircle,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function ComplaintStatusBadge({ status, size = "md" }: ComplaintStatusBadgeProps) {
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

// Priority Badge
interface PriorityBadgeProps {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    size?: "sm" | "md";
}

const priorityConfig = {
    low: { label: "Low", color: "bg-gray-100 text-gray-700" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    high: { label: "High", color: "bg-orange-100 text-orange-800" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-800 animate-pulse" },
};

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
    const config = priorityConfig[priority];

    return (
        <span
            className={cn(
                "inline-flex items-center font-semibold rounded",
                config.color,
                size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
            )}
        >
            {config.label}
        </span>
    );
}

// Nature Badge
interface ComplaintNatureBadgeProps {
    nature: ComplaintNature;
    size?: "sm" | "md";
}

const natureConfig: Record<ComplaintNature, { label: string; color: string; icon: React.ElementType }> = {
    [ComplaintNature.DELAY]: {
        label: "Delay",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
    },
    [ComplaintNature.DAMAGE]: {
        label: "Damage",
        color: "bg-orange-100 text-orange-800",
        icon: Package,
    },
    [ComplaintNature.LOSS]: {
        label: "Loss",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
    },
    [ComplaintNature.BILLING]: {
        label: "Billing",
        color: "bg-purple-100 text-purple-800",
        icon: DollarSign,
    },
    [ComplaintNature.SERVICE_QUALITY]: {
        label: "Service",
        color: "bg-blue-100 text-blue-800",
        icon: Star,
    },
    [ComplaintNature.DRIVER_BEHAVIOR]: {
        label: "Driver",
        color: "bg-pink-100 text-pink-800",
        icon: User,
    },
    [ComplaintNature.OTHER]: {
        label: "Other",
        color: "bg-gray-100 text-gray-800",
        icon: Info,
    },
};

export function ComplaintNatureBadge({ nature, size = "md" }: ComplaintNatureBadgeProps) {
    const config = natureConfig[nature];
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
