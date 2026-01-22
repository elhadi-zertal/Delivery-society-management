"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createShipmentSchema, addressSchema } from "@/lib/validations/schemas";
import { IClient, IServiceType, IDestination } from "@/types";
import { shipmentsApi, PriceBreakdown as IPriceBreakdown } from "@/lib/api/shipments";
import { clientsApi } from "@/lib/api/clients";
import { serviceTypesApi } from "@/lib/api/service-types";
import { destinationsApi } from "@/lib/api/destinations";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceBreakdown } from "./price-breakdown";
import { toast } from "sonner";
import { Loader2, Package, Truck, MapPin, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatting";
import { useDebounce } from "@/lib/hooks/useDebounce";

// Frontend form schema
const shipmentFormSchema = z.object({
    client: z.string().min(1, "Client is required"),
    serviceType: z.string().min(1, "Service type is required"),
    destination: z.string().min(1, "Destination is required"),
    senderName: z.string().min(1, "Sender name is required"),
    senderPhone: z.string().min(1, "Sender phone is required"),
    senderAddress: addressSchema,
    receiverName: z.string().min(1, "Receiver name is required"),
    receiverPhone: z.string().min(1, "Receiver phone is required"),
    receiverAddress: addressSchema,
    packages: z.array(z.object({
        description: z.string().min(1, "Description is required"),
        weight: z.number().positive("Weight must be positive"),
        volume: z.number().positive("Volume must be positive"),
        quantity: z.number().int().positive().default(1),
        declaredValue: z.number().nonnegative().optional(),
    })).min(1),
    pickupDate: z.coerce.date().optional(),
    notes: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

interface ShipmentFormProps {
    onSuccess?: (shipmentId: string, trackingNumber: string) => void;
    onCancel?: () => void;
}

export function ShipmentForm({ onSuccess, onCancel }: ShipmentFormProps) {
    const [clients, setClients] = useState<IClient[]>([]);
    const [serviceTypes, setServiceTypes] = useState<IServiceType[]>([]);
    const [destinations, setDestinations] = useState<IDestination[]>([]);
    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [priceBreakdown, setPriceBreakdown] = useState<IPriceBreakdown | null>(null);

    const form = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentFormSchema) as any,
        defaultValues: {
            client: "",
            serviceType: "",
            destination: "",
            senderName: "",
            senderPhone: "",
            senderAddress: { street: "", city: "", postalCode: "", country: "" },
            receiverName: "",
            receiverPhone: "",
            receiverAddress: { street: "", city: "", postalCode: "", country: "" },
            packages: [{ description: "", weight: 0, volume: 0, quantity: 1 }],
            notes: "",
        },
    });

    const watchServiceType = form.watch("serviceType");
    const watchDestination = form.watch("destination");
    const watchPackages = form.watch("packages");

    // Debounce values for price calculation
    const debouncedServiceType = useDebounce(watchServiceType, 500);
    const debouncedDestination = useDebounce(watchDestination, 500);
    const debouncedPackages = useDebounce(watchPackages, 500);

    // Load resources on mount
    useEffect(() => {
        const loadResources = async () => {
            setLoadingResources(true);
            try {
                const [clientsData, serviceTypesData, destinationsData] = await Promise.all([
                    clientsApi.getAll(),
                    serviceTypesApi.getAll(),
                    destinationsApi.getAll(),
                ]);
                setClients(clientsData);
                setServiceTypes(serviceTypesData);
                setDestinations(destinationsData);
            } catch (error) {
                toast.error("Failed to load resources");
            } finally {
                setLoadingResources(false);
            }
        };
        loadResources();
    }, []);

    // Calculate price when relevant fields change
    const calculatePrice = useCallback(async () => {
        if (!debouncedServiceType || !debouncedDestination) return;

        const validPackages = debouncedPackages?.filter(
            (p) => p.weight > 0 && p.volume > 0
        );
        if (!validPackages?.length) return;

        setCalculatingPrice(true);
        try {
            const result = await shipmentsApi.calculatePrice({
                serviceTypeId: debouncedServiceType,
                destinationId: debouncedDestination,
                packages: validPackages.map((p) => ({
                    weight: p.weight,
                    volume: p.volume,
                    quantity: p.quantity || 1,
                })),
            });
            setPriceBreakdown(result);
        } catch (error) {
            // Silently fail - price will just not show
            setPriceBreakdown(null);
        } finally {
            setCalculatingPrice(false);
        }
    }, [debouncedServiceType, debouncedDestination, debouncedPackages]);

    useEffect(() => {
        calculatePrice();
    }, [calculatePrice]);

    const onSubmit = async (data: ShipmentFormValues) => {
        if (!priceBreakdown) {
            toast.error("Please wait for price calculation to complete");
            return;
        }

        setSubmitting(true);
        try {
            const result = await shipmentsApi.create(data as any);
            toast.success(`Shipment created! Tracking: ${result.shipmentNumber}`);
            onSuccess?.(result._id.toString(), result.shipmentNumber);
        } catch (error: any) {
            toast.error(error.message || "Failed to create shipment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingResources) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Section 1: Client & Service */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Truck className="h-5 w-5" />
                            Client & Service Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="client"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select client" />
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="serviceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Type *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select service" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {serviceTypes.map((st) => (
                                                        <SelectItem key={st._id.toString()} value={st._id.toString()}>
                                                            {st.displayName} ({st.estimatedDeliveryDays.min}-{st.estimatedDeliveryDays.max} days)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {destinations.map((dest) => (
                                                        <SelectItem key={dest._id.toString()} value={dest._id.toString()}>
                                                            {dest.city}, {dest.country} ({dest.zone})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Sender & Receiver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Sender Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name="senderName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="senderPhone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="senderAddress.street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street *</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-3 gap-2">
                                <FormField control={form.control} name="senderAddress.city" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="City" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="senderAddress.postalCode" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="ZIP" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="senderAddress.country" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Country" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Receiver Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name="receiverName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="receiverPhone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="receiverAddress.street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street *</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-3 gap-2">
                                <FormField control={form.control} name="receiverAddress.city" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="City" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="receiverAddress.postalCode" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="ZIP" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="receiverAddress.country" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Country" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 3: Package Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5" />
                            Package Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.watch("packages").map((_, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md">
                                <FormField control={form.control} name={`packages.${index}.description`} render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl><Input placeholder="Package contents" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`packages.${index}.weight`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`packages.${index}.volume`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Volume (m³) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`packages.${index}.quantity`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qty</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        ))}

                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl><Textarea placeholder="Special instructions..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Section 4: Price Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        {/* Spacer or additional info */}
                    </div>
                    <div>
                        {calculatingPrice ? (
                            <Card>
                                <CardContent className="flex items-center justify-center p-6">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Calculating price...
                                </CardContent>
                            </Card>
                        ) : priceBreakdown ? (
                            <PriceBreakdown
                                baseAmount={priceBreakdown.baseAmount}
                                weightAmount={priceBreakdown.weightAmount}
                                volumeAmount={priceBreakdown.volumeAmount}
                                additionalFees={priceBreakdown.additionalFees}
                                discount={priceBreakdown.discount}
                            />
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
                                    <Calculator className="h-5 w-5 mr-2" />
                                    Select service, destination, and package details to see pricing
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={submitting || !priceBreakdown}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Shipment
                    </Button>
                </div>
            </form>
        </Form>
    );
}
