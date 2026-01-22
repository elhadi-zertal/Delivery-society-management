"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IShipment, IClient, IServiceType, IDestination, ShipmentStatus } from "@/types";
import { shipmentsApi } from "@/lib/api/shipments";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { TrackingTimeline } from "@/components/shipments/tracking-timeline";
import { PriceBreakdown } from "@/components/shipments/price-breakdown";
import { UpdateStatusModal } from "@/components/shipments/update-status-modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils/formatting";
import {
    ArrowLeft,
    Copy,
    Pencil,
    Navigation,
    Printer,
    Trash2,
    User,
    MapPin,
    Package,
    Truck,
    Calendar,
    Phone,
    Mail,
    Loader2,
} from "lucide-react";

export default function ShipmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const shipmentId = params.id as string;

    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusModal, setStatusModal] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const loadShipment = async () => {
        setLoading(true);
        try {
            const data = await shipmentsApi.getById(shipmentId);
            setShipment(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load shipment");
            router.push("/agent/shipments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shipmentId) loadShipment();
    }, [shipmentId]);

    const handleCopyTracking = () => {
        if (shipment) {
            navigator.clipboard.writeText(shipment.shipmentNumber);
            toast.success("Tracking number copied!");
        }
    };

    const handleDelete = async () => {
        try {
            await shipmentsApi.delete(shipmentId);
            toast.success("Shipment deleted");
            router.push("/agent/shipments");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete shipment");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="container mx-auto py-6 text-center">
                <p>Shipment not found</p>
                <Button className="mt-4" onClick={() => router.push("/agent/shipments")}>
                    Back to Shipments
                </Button>
            </div>
        );
    }

    const client = shipment.client as IClient;
    const serviceType = shipment.serviceType as IServiceType;
    const destination = shipment.destination as IDestination;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{shipment.shipmentNumber}</h1>
                            <Button variant="ghost" size="icon" onClick={handleCopyTracking}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <ShipmentStatusBadge status={shipment.status} size="md" />
                            <span className="text-muted-foreground text-sm">
                                Created {formatDate(shipment.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {shipment.status === ShipmentStatus.PENDING && (
                        <Button variant="outline">
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setStatusModal(true)}>
                        <Navigation className="h-4 w-4 mr-2" /> Update Status
                    </Button>
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> Print Label
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Addresses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" /> Client & Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">{client.firstName} {client.lastName}</p>
                                    {client.companyName && <p className="text-sm text-muted-foreground">{client.companyName}</p>}
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
                                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 border rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Sender</p>
                                    <p className="font-semibold">{shipment.senderName}</p>
                                    <p className="text-sm">{shipment.senderPhone}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {shipment.senderAddress.street}, {shipment.senderAddress.city}, {shipment.senderAddress.postalCode}
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Receiver</p>
                                    <p className="font-semibold">{shipment.receiverName}</p>
                                    <p className="text-sm">{shipment.receiverPhone}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {shipment.receiverAddress.street}, {shipment.receiverAddress.city}, {shipment.receiverAddress.postalCode}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Package Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Package className="h-5 w-5" /> Package Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Service</p>
                                    <p className="font-semibold">{serviceType?.displayName || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Destination</p>
                                    <p className="font-semibold">{destination ? `${destination.city}, ${destination.country}` : "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Weight</p>
                                    <p className="font-semibold">{shipment.totalWeight} kg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Volume</p>
                                    <p className="font-semibold">{shipment.totalVolume} m³</p>
                                </div>
                            </div>

                            {shipment.packages?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Packages ({shipment.packages.length})</p>
                                    {shipment.packages.map((pkg, idx) => (
                                        <div key={idx} className="p-2 bg-muted rounded text-sm">
                                            <p>{pkg.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {pkg.weight}kg × {pkg.volume}m³ × {pkg.quantity} units
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {shipment.notes && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-800">Notes</p>
                                    <p className="text-sm text-yellow-700">{shipment.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" /> Delivery Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Created</p>
                                    <p className="font-semibold">{formatDateTime(shipment.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Expected Delivery</p>
                                    <p className="font-semibold">
                                        {shipment.estimatedDeliveryDate ? formatDate(shipment.estimatedDeliveryDate) : "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Actual Delivery</p>
                                    <p className="font-semibold">
                                        {shipment.actualDeliveryDate ? formatDateTime(shipment.actualDeliveryDate) : "-"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Timeline & Pricing */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <PriceBreakdown
                        baseAmount={shipment.priceBreakdown?.baseAmount || 0}
                        weightAmount={shipment.priceBreakdown?.weightAmount || 0}
                        volumeAmount={shipment.priceBreakdown?.volumeAmount || 0}
                        additionalFees={shipment.priceBreakdown?.additionalFees || 0}
                        discount={shipment.priceBreakdown?.discount || 0}
                    />

                    {/* Tracking Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Truck className="h-5 w-5" /> Tracking History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrackingTimeline
                                entries={shipment.trackingHistory || []}
                                currentStatus={shipment.status}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <UpdateStatusModal
                isOpen={statusModal}
                onClose={() => setStatusModal(false)}
                shipmentId={shipmentId}
                currentStatus={shipment.status}
                onSuccess={loadShipment}
            />

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Shipment"
                description="Are you sure you want to delete this shipment? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}
