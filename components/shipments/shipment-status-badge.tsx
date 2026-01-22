"use client";

import { ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
    Clock,
    Truck,
    Package,
    MapPin,
    CheckCircle,
    XCircle,
    Ban,
    CornerDownRight
} from "lucide-react";

interface ShipmentStatusBadgeProps {
    status: ShipmentStatus;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
}

const statusConfig: Record<ShipmentStatus, { label: string; color: string; icon: React.ElementType }> = {
    [ShipmentStatus.PENDING]: {
        label: "Pending",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Clock,
    },
    [ShipmentStatus.PICKED_UP]: {
        label: "Picked Up",
        color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        icon: CornerDownRight,
    },
    [ShipmentStatus.IN_TRANSIT]: {
        label: "In Transit",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Truck,
    },
    [ShipmentStatus.AT_SORTING_CENTER]: {
        label: "At Sorting Center",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Package,
    },
    [ShipmentStatus.OUT_FOR_DELIVERY]: {
        label: "Out for Delivery",
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: MapPin,
    },
    [ShipmentStatus.DELIVERED]: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
    },
    [ShipmentStatus.FAILED_DELIVERY]: {
        label: "Failed Delivery",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
    },
    [ShipmentStatus.RETURNED]: {
        label: "Returned",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: CornerDownRight,
    },
    [ShipmentStatus.CANCELLED]: {
        label: "Cancelled",
        color: "bg-gray-100 text-gray-500 border-gray-300",
        icon: Ban,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function ShipmentStatusBadge({
    status,
    size = "md",
    showIcon = true
}: ShipmentStatusBadgeProps) {
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

// Helper to get valid next statuses
export function getValidStatusTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
    const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
        [ShipmentStatus.PENDING]: [ShipmentStatus.PICKED_UP, ShipmentStatus.CANCELLED],
        [ShipmentStatus.PICKED_UP]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
        [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.AT_SORTING_CENTER, ShipmentStatus.OUT_FOR_DELIVERY],
        [ShipmentStatus.AT_SORTING_CENTER]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY],
        [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_DELIVERY],
        [ShipmentStatus.DELIVERED]: [],
        [ShipmentStatus.FAILED_DELIVERY]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.RETURNED, ShipmentStatus.CANCELLED],
        [ShipmentStatus.RETURNED]: [],
        [ShipmentStatus.CANCELLED]: [],
    };
    return transitions[currentStatus] || [];
}
