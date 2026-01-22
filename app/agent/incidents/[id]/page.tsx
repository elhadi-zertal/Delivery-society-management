"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IIncident, IncidentStatus, IShipment, IDriver, IVehicle, IDeliveryTour, IUser } from "@/types";
import { incidentsApi } from "@/lib/api/incidents";
import { IncidentStatusBadge, IncidentTypeBadge } from "@/components/incidents/incident-status-badge";
import { ResolveIncidentModal } from "@/components/incidents/resolve-incident-modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDateTime, formatDate } from "@/lib/utils/formatting";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    MapPin,
    Calendar,
    User,
    Truck,
    Package,
    FileText,
    Image,
    Loader2,
} from "lucide-react";

export default function IncidentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const incidentId = params.id as string;

    const [incident, setIncident] = useState<IIncident | null>(null);
    const [loading, setLoading] = useState(true);
    const [resolveModal, setResolveModal] = useState(false);
    const [closeDialog, setCloseDialog] = useState(false);

    const loadIncident = async () => {
        setLoading(true);
        try {
            const data = await incidentsApi.getById(incidentId);
            setIncident(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load incident");
            router.push("/agent/incidents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (incidentId) loadIncident();
    }, [incidentId]);

    const handleClose = async () => {
        try {
            await incidentsApi.close(incidentId);
            toast.success("Incident closed");
            loadIncident();
        } catch (error: any) {
            toast.error(error.message || "Failed to close incident");
        } finally {
            setCloseDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="container mx-auto py-6 text-center">
                <p>Incident not found</p>
                <Button className="mt-4" onClick={() => router.push("/agent/incidents")}>
                    Back to Incidents
                </Button>
            </div>
        );
    }

    const shipment = incident.shipment as IShipment | undefined;
    const driver = incident.driver as IDriver | undefined;
    const vehicle = incident.vehicle as IVehicle | undefined;
    const tour = incident.deliveryTour as IDeliveryTour | undefined;
    const reporter = incident.reportedBy as IUser | undefined;
    const resolver = incident.resolvedBy as IUser | undefined;

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
                            <h1 className="text-2xl font-bold font-mono">{incident.incidentNumber}</h1>
                            <IncidentTypeBadge type={incident.type} />
                            <IncidentStatusBadge status={incident.status} />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Reported {formatDateTime(incident.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {incident.status !== IncidentStatus.RESOLVED && incident.status !== IncidentStatus.CLOSED && (
                        <Button onClick={() => setResolveModal(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                        </Button>
                    )}
                    {incident.status === IncidentStatus.RESOLVED && (
                        <Button variant="outline" onClick={() => setCloseDialog(true)}>
                            <XCircle className="h-4 w-4 mr-2" /> Close
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Occurred At</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDateTime(incident.occurredAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Location</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {incident.location || "Not specified"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Description</p>
                                <p className="text-sm bg-muted p-3 rounded">{incident.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Entities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Related Entities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {shipment && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <Package className="h-3 w-3" /> Shipment
                                        </p>
                                        <p className="font-mono font-medium">{shipment.shipmentNumber}</p>
                                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push(`/agent/shipments/${shipment._id}`)}>
                                            View Shipment →
                                        </Button>
                                    </div>
                                )}
                                {driver && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <User className="h-3 w-3" /> Driver
                                        </p>
                                        <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{driver.phone}</p>
                                    </div>
                                )}
                                {vehicle && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <Truck className="h-3 w-3" /> Vehicle
                                        </p>
                                        <p className="font-mono font-medium">{vehicle.registrationNumber}</p>
                                        <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                                    </div>
                                )}
                                {tour && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Tour</p>
                                        <p className="font-mono font-medium">{tour.tourNumber}</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(tour.date)}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence */}
                    {(incident.photos?.length > 0 || incident.documents?.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> Evidence
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {incident.photos?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                            <Image className="h-4 w-4" /> Photos ({incident.photos.length})
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {incident.photos.map((photo, idx) => (
                                                <a key={idx} href={photo} target="_blank" rel="noopener noreferrer">
                                                    <img src={photo} alt={`Evidence ${idx + 1}`} className="h-20 w-20 object-cover rounded border" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {incident.documents?.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Documents ({incident.documents.length})</p>
                                        {incident.documents.map((doc, idx) => (
                                            <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                                <FileText className="h-4 w-4" /> Document {idx + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Reporter */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" /> Reported By
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reporter ? (
                                <div>
                                    <p className="font-medium">{reporter.name}</p>
                                    <p className="text-sm text-muted-foreground">{reporter.email}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(incident.createdAt)}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Unknown</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resolution */}
                    {incident.resolution && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" /> Resolution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-green-800">{incident.resolution}</p>
                                {resolver && (
                                    <p className="text-xs text-green-600 mt-2">
                                        Resolved by {resolver.name} on {formatDateTime(incident.resolvedAt!)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Status Timeline */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <CheckCircle className="h-3 w-3" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Reported</p>
                                        <p className="text-xs text-muted-foreground">{formatDateTime(incident.createdAt)}</p>
                                    </div>
                                </div>
                                {incident.resolvedAt && (
                                    <div className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <CheckCircle className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Resolved</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTime(incident.resolvedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {incident.status === IncidentStatus.CLOSED && (
                                    <div className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-white">
                                            <XCircle className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Closed</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTime(incident.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {resolveModal && incident && (
                <ResolveIncidentModal
                    isOpen={true}
                    onClose={() => setResolveModal(false)}
                    incident={incident}
                    onSuccess={loadIncident}
                />
            )}

            <ConfirmDialog
                open={closeDialog}
                onOpenChange={() => setCloseDialog(false)}
                onConfirm={handleClose}
                title="Close Incident"
                description="Are you sure you want to close this incident? This marks it as complete."
            />
        </div>
    );
}
