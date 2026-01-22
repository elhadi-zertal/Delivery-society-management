"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IDeliveryTour, IShipment, IDriver, IVehicle, TourStatus } from "@/types";
import { toursApi } from "@/lib/api/tours";
import { TourStatusBadge } from "@/components/tours/tour-status-badge";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatting";
import { 
    ChevronLeft, 
    Truck, 
    User, 
    Package, 
    MapPin, 
    Calendar,
    Clock,
    FileText,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function TourDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tour, setTour] = useState<IDeliveryTour | null>(null);
    const [loading, setLoading] = useState(true);

    const loadTour = async () => {
        setLoading(true);
        try {
            const data = await toursApi.getById(id as string);
            setTour(data);
        } catch (error) {
            toast.error("Failed to load tour details");
            router.push("/agent/tours");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadTour();
    }, [id]);

    const shipmentColumns: ColumnDef<IShipment>[] = [
        {
            accessorKey: "shipmentNumber",
            header: "Tracking #",
            cell: ({ row }) => (
                <Button 
                    variant="link" 
                    className="p-0 h-auto font-mono font-bold"
                    onClick={() => router.push(`/agent/shipments/${row.original._id}`)}
                >
                    {row.original.shipmentNumber}
                </Button>
            ),
        },
        {
            accessorKey: "receiverName",
            header: "Receiver",
        },
        {
            accessorKey: "receiverAddress",
            header: "Destination",
            cell: ({ row }) => {
                const addr = row.original.receiverAddress as any;
                return `${addr.city}, ${addr.country}`;
            },
        },
        {
            accessorKey: "totalWeight",
            header: "Weight (kg)",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} size="sm" />,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tour) return null;

    const driver = tour.driver as IDriver;
    const vehicle = tour.vehicle as IVehicle;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/agent/tours")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{tour.tourNumber}</h1>
                            <TourStatusBadge status={tour.status} />
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> {formatDate(tour.date)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        Print Manifest
                    </Button>
                    {tour.status === TourStatus.PLANNED && (
                        <Button>Start Tour</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Driver & Vehicle */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Driver</p>
                                    <p className="text-sm text-muted-foreground">
                                        {driver.firstName} {driver.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Vehicle</p>
                                    <p className="text-sm text-muted-foreground">
                                        {vehicle.registrationNumber} ({vehicle.model})
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Route Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Planned Route</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">From</p>
                                    <p className="text-sm text-muted-foreground">{tour.plannedRoute.startLocation}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">To</p>
                                    <p className="text-sm text-muted-foreground">{tour.plannedRoute.endLocation}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Distance</p>
                                    <p className="text-sm text-muted-foreground">{tour.plannedRoute.estimatedDistance} km</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-sm text-muted-foreground">{tour.plannedRoute.estimatedDuration} min</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {tour.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">{tour.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Shipments */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Shipments ({tour.shipments?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable 
                                columns={shipmentColumns} 
                                data={tour.shipments as IShipment[]} 
                                searchKey="shipmentNumber"
                            />
                        </CardContent>
                    </Card>

                    {/* Performance metrics (if completed) */}
                    {tour.status === TourStatus.COMPLETED && tour.actualRoute && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tour Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Actual Distance</p>
                                    <p className="text-xl font-bold">{tour.actualRoute.actualDistance} km</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Actual Duration</p>
                                    <p className="text-xl font-bold">{tour.actualRoute.actualDuration} min</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Deliveries</p>
                                    <p className="text-xl font-bold text-green-600">{tour.deliveriesCompleted}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                    <p className="text-xl font-bold text-red-600">{tour.deliveriesFailed}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
