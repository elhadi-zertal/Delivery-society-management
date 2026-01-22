"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IComplaint, ComplaintStatus, IClient, IShipment, IInvoice, IUser } from "@/types";
import { complaintsApi } from "@/lib/api/complaints";
import { ComplaintStatusBadge, ComplaintNatureBadge, PriorityBadge } from "@/components/complaints/complaint-status-badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDateTime, formatDate } from "@/lib/utils/formatting";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    User,
    Package,
    FileText,
    Loader2,
    Clock,
} from "lucide-react";

export default function ComplaintDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const complaintId = params.id as string;

    const [complaint, setComplaint] = useState<IComplaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [resolveMode, setResolveMode] = useState(false);
    const [resolution, setResolution] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadComplaint = async () => {
        setLoading(true);
        try {
            const data = await complaintsApi.getById(complaintId);
            setComplaint(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load complaint");
            router.push("/agent/complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (complaintId) loadComplaint();
    }, [complaintId]);

    const handleResolve = async () => {
        if (!resolution.trim()) {
            toast.error("Resolution details are required");
            return;
        }
        setSubmitting(true);
        try {
            await complaintsApi.resolve(complaintId, { resolution });
            toast.success("Complaint resolved");
            setResolveMode(false);
            loadComplaint();
        } catch (error: any) {
            toast.error(error.message || "Failed to resolve complaint");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (status: ComplaintStatus) => {
        try {
            await complaintsApi.updateStatus(complaintId, status);
            toast.success("Status updated");
            loadComplaint();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="container mx-auto py-6 text-center">
                <p>Complaint not found</p>
                <Button className="mt-4" onClick={() => router.push("/agent/complaints")}>
                    Back to Complaints
                </Button>
            </div>
        );
    }

    const client = complaint.client as IClient | undefined;
    const shipments = (complaint.shipments || []) as IShipment[];
    const invoice = complaint.invoice as IInvoice | undefined;
    const resolver = complaint.resolvedBy as IUser | undefined;
    const assignee = complaint.assignedTo as IUser | undefined;

    const daysOpen = Math.ceil((Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));

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
                            <h1 className="text-2xl font-bold font-mono">{complaint.complaintNumber}</h1>
                            <ComplaintNatureBadge nature={complaint.nature} />
                            <PriorityBadge priority={complaint.priority} />
                            <ComplaintStatusBadge status={complaint.status} />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Opened {formatDateTime(complaint.createdAt)} • {daysOpen} day{daysOpen !== 1 ? "s" : ""} open
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {complaint.status === ComplaintStatus.PENDING && (
                        <Button variant="outline" onClick={() => handleUpdateStatus(ComplaintStatus.IN_PROGRESS)}>
                            <Clock className="h-4 w-4 mr-2" /> Mark In Progress
                        </Button>
                    )}
                    {complaint.status !== ComplaintStatus.RESOLVED && complaint.status !== ComplaintStatus.CANCELLED && (
                        <Button onClick={() => setResolveMode(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Complaint Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="whitespace-pre-wrap">{complaint.description}</p>
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
                                {shipments.length > 0 && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <Package className="h-3 w-3" /> Shipments
                                        </p>
                                        {shipments.map((s) => (
                                            <p key={s._id.toString()} className="font-mono text-sm">{s.shipmentNumber}</p>
                                        ))}
                                    </div>
                                )}
                                {invoice && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> Invoice
                                        </p>
                                        <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resolve Form */}
                    {resolveMode && (
                        <Card className="border-green-300">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" /> Resolve Complaint
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resolution">Resolution Details *</Label>
                                    <Textarea
                                        id="resolution"
                                        placeholder="Describe how the complaint was resolved..."
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setResolveMode(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleResolve} disabled={submitting}>
                                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Mark as Resolved
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" /> Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client ? (
                                <div className="space-y-1">
                                    <p className="font-semibold">{client.firstName} {client.lastName}</p>
                                    {client.companyName && <p className="text-sm">{client.companyName}</p>}
                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push(`/agent/clients/${client._id}`)}>
                                        View Client →
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Unknown</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assigned To */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Assigned To</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignee ? (
                                <div>
                                    <p className="font-medium">{assignee.name}</p>
                                    <p className="text-sm text-muted-foreground">{assignee.email}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resolution */}
                    {complaint.resolution && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" /> Resolution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-green-800">{complaint.resolution}</p>
                                {resolver && (
                                    <p className="text-xs text-green-600 mt-2">
                                        Resolved by {resolver.name} on {formatDateTime(complaint.resolvedAt!)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
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
                                        <p className="text-sm font-medium">Complaint Registered</p>
                                        <p className="text-xs text-muted-foreground">{formatDateTime(complaint.createdAt)}</p>
                                    </div>
                                </div>
                                {complaint.resolvedAt && (
                                    <div className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <CheckCircle className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Resolved</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTime(complaint.resolvedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
