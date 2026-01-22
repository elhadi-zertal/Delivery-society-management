"use client";

import { ITrackingEntry, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/formatting";
import { Check, Circle, Dot } from "lucide-react";

interface TrackingTimelineProps {
    entries: ITrackingEntry[];
    currentStatus: ShipmentStatus;
}

// Define the expected order of statuses for rendering
const statusOrder: ShipmentStatus[] = [
    ShipmentStatus.PENDING,
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.AT_SORTING_CENTER,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.DELIVERED,
];

const statusLabels: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: "Shipment Created",
    [ShipmentStatus.PICKED_UP]: "Picked Up",
    [ShipmentStatus.IN_TRANSIT]: "In Transit",
    [ShipmentStatus.AT_SORTING_CENTER]: "At Sorting Center",
    [ShipmentStatus.OUT_FOR_DELIVERY]: "Out for Delivery",
    [ShipmentStatus.DELIVERED]: "Delivered",
    [ShipmentStatus.FAILED_DELIVERY]: "Failed Delivery",
    [ShipmentStatus.RETURNED]: "Returned",
    [ShipmentStatus.CANCELLED]: "Cancelled",
};

export function TrackingTimeline({ entries, currentStatus }: TrackingTimelineProps) {
    // Create a map of status to entry for quick lookup
    const entryMap = new Map<ShipmentStatus, ITrackingEntry>();
    entries.forEach((entry) => {
        entryMap.set(entry.status, entry);
    });

    // Determine which statuses to show based on the current status
    // If cancelled/returned/failed, show only actual history
    const isFinalNegative = [
        ShipmentStatus.CANCELLED,
        ShipmentStatus.RETURNED,
        ShipmentStatus.FAILED_DELIVERY,
    ].includes(currentStatus);

    const timelineStatuses = isFinalNegative
        ? entries.map((e) => e.status)
        : statusOrder;

    const currentIndex = timelineStatuses.indexOf(currentStatus);

    return (
        <div className="space-y-0">
            {timelineStatuses.map((status, index) => {
                const entry = entryMap.get(status);
                const isCompleted = index < currentIndex || (entry && status !== currentStatus);
                const isCurrent = status === currentStatus;
                const isFuture = index > currentIndex && !entry;

                return (
                    <div key={status} className="relative flex gap-4">
                        {/* Vertical Line */}
                        {index < timelineStatuses.length - 1 && (
                            <div
                                className={cn(
                                    "absolute left-[11px] top-6 w-0.5 h-full -translate-x-1/2",
                                    isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-200 border-dashed"
                                )}
                            />
                        )}

                        {/* Icon */}
                        <div
                            className={cn(
                                "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2",
                                isCompleted && "bg-green-500 border-green-500 text-white",
                                isCurrent && "bg-blue-500 border-blue-500 text-white animate-pulse",
                                isFuture && "bg-white border-gray-300 text-gray-400"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : isCurrent ? (
                                <Dot className="h-4 w-4" />
                            ) : (
                                <Circle className="h-3 w-3" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                            <p
                                className={cn(
                                    "font-medium",
                                    isCompleted && "text-green-700",
                                    isCurrent && "text-blue-700",
                                    isFuture && "text-gray-400"
                                )}
                            >
                                {statusLabels[status]}
                            </p>
                            {entry && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    <p>{formatDateTime(entry.timestamp)}</p>
                                    {entry.location && <p>Location: {entry.location}</p>}
                                    {entry.description && <p>{entry.description}</p>}
                                </div>
                            )}
                            {isFuture && !entry && (
                                <p className="text-xs text-gray-400 mt-0.5">Pending</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
