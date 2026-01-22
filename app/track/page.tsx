"use client";

import { useState } from "react";
import { shipmentsApi } from "@/lib/api/shipments";
import { IShipment, ITrackingEntry, ShipmentStatus } from "@/types";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { TrackingTimeline } from "@/components/shipments/tracking-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils/formatting";
import { Search, Package, MapPin, Calendar, Phone, Loader2, AlertCircle } from "lucide-react";

export default function PublicTrackingPage() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ shipment: IShipment; tracking: ITrackingEntry[] } | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await shipmentsApi.trackByNumber(trackingNumber.trim());
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to find shipment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-xl">Track Your Shipment</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">Enter Your Tracking Number</CardTitle>
                        <p className="text-muted-foreground">
                            Track your package in real-time
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTrack} className="flex gap-2">
                            <Input
                                placeholder="e.g., SHP-20260121-ABC123"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="flex-1 text-lg h-12"
                            />
                            <Button type="submit" size="lg" disabled={loading || !trackingNumber.trim()}>
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="h-5 w-5 mr-2" /> Track
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Error State */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-semibold">Tracking Number Not Found</p>
                                    <p className="text-sm">
                                        Please check the tracking number and try again. If you continue to have issues, contact support.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p className="text-blue-100 text-sm uppercase">Tracking Number</p>
                                        <p className="font-mono font-bold text-xl">{result.shipment.shipmentNumber}</p>
                                    </div>
                                    <ShipmentStatusBadge status={result.shipment.status} size="lg" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">From</p>
                                            <p className="font-semibold">{result.shipment.senderAddress.city}</p>
                                            <p className="text-sm text-muted-foreground">{result.shipment.senderAddress.country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">To</p>
                                            <p className="font-semibold">{result.shipment.receiverAddress.city}</p>
                                            <p className="text-sm text-muted-foreground">{result.shipment.receiverAddress.country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Dates */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Shipped On</p>
                                            <p className="font-semibold">{formatDate(result.shipment.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Expected Delivery</p>
                                            <p className="font-semibold">
                                                {result.shipment.estimatedDeliveryDate
                                                    ? formatDate(result.shipment.estimatedDeliveryDate)
                                                    : "Calculating..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TrackingTimeline
                                    entries={result.shipment.trackingHistory || []}
                                    currentStatus={result.shipment.status}
                                />
                            </CardContent>
                        </Card>

                        {/* Contact Support */}
                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Need help?</p>
                                        <p className="text-sm text-muted-foreground">
                                            Contact our support team at support@newsi.com or call +213 xxx xxx xxx
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
