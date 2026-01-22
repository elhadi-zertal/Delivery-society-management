"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IClient, IShipment, ShipmentStatus } from "@/types";
import { invoicesApi, GenerateInvoiceInput } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { shipmentsApi } from "@/lib/api/shipments";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    ArrowLeft,
    ArrowRight,
    User,
    Package,
    FileText,
    Check,
    Loader2,
    AlertTriangle,
} from "lucide-react";

type Step = 1 | 2 | 3;

export default function GenerateInvoicePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [clients, setClients] = useState<IClient[]>([]);
    const [shipments, setShipments] = useState<IShipment[]>([]);

    // Form state
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
    const [dueInDays, setDueInDays] = useState(30);
    const [notes, setNotes] = useState("Thank you for your business!");

    // Load clients on mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await clientsApi.getAll();
                setClients(data);
            } catch (error) {
                toast.error("Failed to load clients");
            }
        };
        loadClients();
    }, []);

    // Load shipments when client is selected
    useEffect(() => {
        if (!selectedClientId) {
            setShipments([]);
            return;
        }

        const loadShipments = async () => {
            setLoading(true);
            try {
                const all = await shipmentsApi.getAll({ clientId: selectedClientId });
                // Filter uninvoiced, delivered shipments
                const uninvoiced = all.filter(
                    (s) => !s.isInvoiced && s.status === ShipmentStatus.DELIVERED
                );
                setShipments(uninvoiced);
            } catch (error) {
                toast.error("Failed to load shipments");
            } finally {
                setLoading(false);
            }
        };
        loadShipments();
    }, [selectedClientId]);

    // Calculate totals
    const totals = useMemo(() => {
        const selected = shipments.filter((s) => selectedShipmentIds.has(s._id.toString()));
        const amountHT = selected.reduce((sum, s) => sum + (s.priceBreakdown?.baseAmount || 0) + (s.priceBreakdown?.weightAmount || 0) + (s.priceBreakdown?.volumeAmount || 0), 0);
        const tva = amountHT * 0.19;
        const totalTTC = amountHT + tva;
        return { count: selected.length, amountHT, tva, totalTTC };
    }, [shipments, selectedShipmentIds]);

    const selectedClient = clients.find((c) => c._id.toString() === selectedClientId);

    const toggleShipment = (id: string) => {
        const newSet = new Set(selectedShipmentIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedShipmentIds(newSet);
    };

    const selectAll = () => {
        setSelectedShipmentIds(new Set(shipments.map((s) => s._id.toString())));
    };

    const deselectAll = () => {
        setSelectedShipmentIds(new Set());
    };

    const handleSubmit = async () => {
        if (selectedShipmentIds.size === 0) {
            toast.error("Please select at least one shipment");
            return;
        }

        setSubmitting(true);
        try {
            const data: GenerateInvoiceInput = {
                clientId: selectedClientId,
                shipmentIds: Array.from(selectedShipmentIds),
                dueInDays,
                notes,
            };
            const invoice = await invoicesApi.generate(data);
            toast.success(`Invoice ${invoice.invoiceNumber} generated!`);
            router.push(`/agent/invoices/${invoice._id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to generate invoice");
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return !!selectedClientId;
        if (step === 2) return selectedShipmentIds.size > 0;
        return true;
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Generate Invoice</h1>
                    <p className="text-muted-foreground">Create an invoice from delivered shipments</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                                    ? "bg-primary text-primary-foreground"
                                    : step > s
                                        ? "bg-green-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s ? <Check className="h-4 w-4" /> : s}
                        </div>
                        <span className={step === s ? "font-medium" : "text-muted-foreground"}>
                            {s === 1 ? "Select Client" : s === 2 ? "Select Shipments" : "Confirm"}
                        </span>
                        {s < 3 && <div className="w-12 h-0.5 bg-muted" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Client */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Select Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a client..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client._id.toString()} value={client._id.toString()}>
                                        {client.firstName} {client.lastName}
                                        {client.companyName && ` (${client.companyName})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedClient && (
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Email</p>
                                            <p>{selectedClient.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Phone</p>
                                            <p>{selectedClient.phone}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Select Shipments */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" /> Select Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : shipments.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                <p className="text-lg font-medium">No uninvoiced shipments</p>
                                <p className="text-muted-foreground">This client has no delivered shipments pending invoicing.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {shipments.length} shipments available
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={selectAll}>
                                            Select All
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={deselectAll}>
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                    {shipments.map((shipment) => (
                                        <div
                                            key={shipment._id.toString()}
                                            className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => toggleShipment(shipment._id.toString())}
                                        >
                                            <Checkbox
                                                checked={selectedShipmentIds.has(shipment._id.toString())}
                                                onCheckedChange={() => toggleShipment(shipment._id.toString())}
                                            />
                                            <div className="flex-1">
                                                <p className="font-mono text-sm font-medium">{shipment.shipmentNumber}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {shipment.receiverAddress?.city} • {formatDate(shipment.actualDeliveryDate || shipment.createdAt)}
                                                </p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(shipment.totalAmount)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Selection Summary */}
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Selected Shipments:</span>
                                            <span className="font-medium">{totals.count}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal (HT):</span>
                                            <span>{formatCurrency(totals.amountHT)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>TVA (19%):</span>
                                            <span>{formatCurrency(totals.tva)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                                            <span>Total TTC:</span>
                                            <span className="text-primary">{formatCurrency(totals.totalTTC)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Invoice Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Payment Terms</label>
                                <Select value={dueInDays.toString()} onValueChange={(v) => setDueInDays(parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Due on Receipt</SelectItem>
                                        <SelectItem value="15">Net 15 Days</SelectItem>
                                        <SelectItem value="30">Net 30 Days</SelectItem>
                                        <SelectItem value="60">Net 60 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Due Date</label>
                                <Input
                                    type="text"
                                    value={formatDate(new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000))}
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Invoice notes..."
                                rows={3}
                            />
                        </div>

                        {/* Final Summary */}
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-4">
                                <h3 className="font-semibold mb-3">Invoice Summary</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p className="text-muted-foreground">Client:</p>
                                    <p>{selectedClient?.firstName} {selectedClient?.lastName}</p>
                                    <p className="text-muted-foreground">Shipments:</p>
                                    <p>{totals.count} shipments</p>
                                    <p className="text-muted-foreground">Amount HT:</p>
                                    <p>{formatCurrency(totals.amountHT)}</p>
                                    <p className="text-muted-foreground">TVA (19%):</p>
                                    <p>{formatCurrency(totals.tva)}</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t mt-3 pt-3">
                                    <span>Total TTC:</span>
                                    <span className="text-green-600">{formatCurrency(totals.totalTTC)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    disabled={step === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                {step < 3 ? (
                    <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canProceed()}>
                        Next <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Generate Invoice
                    </Button>
                )}
            </div>
        </div>
    );
}
