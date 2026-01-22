"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createTourSchema } from "@/lib/validations/schemas";
import { IDriver, IVehicle, IShipment, DriverStatus, VehicleStatus, ShipmentStatus } from "@/types";
import { toursApi } from "@/lib/api/tours";
import { driversApi } from "@/lib/api/drivers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { shipmentsApi } from "@/lib/api/shipments";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Truck, User, MapPin, Package, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

const tourFormSchema = createTourSchema;

type TourFormValues = z.infer<typeof tourFormSchema>;

interface TourFormProps {
    onSuccess?: (tourId: string) => void;
    onCancel?: () => void;
}

export function TourForm({ onSuccess, onCancel }: TourFormProps) {
    const [drivers, setDrivers] = useState<IDriver[]>([]);
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<TourFormValues>({
        resolver: zodResolver(tourFormSchema) as any,
        defaultValues: {
            date: new Date(),
            driver: "",
            vehicle: "",
            shipments: [],
            plannedRoute: {
                startLocation: "Main Warehouse",
                endLocation: "Main Warehouse",
                estimatedDistance: 0,
                estimatedDuration: 0,
            },
            notes: "",
        },
    });

    useEffect(() => {
        const loadResources = async () => {
            setLoadingResources(true);
            try {
                const [driversData, vehiclesData, shipmentsData] = await Promise.all([
                    driversApi.getAll(),
                    vehiclesApi.getAll(),
                    shipmentsApi.getAll({ status: [ShipmentStatus.PENDING] }),
                ]);

                // Only show available drivers and vehicles
                setDrivers(driversData.filter(d => d.status === DriverStatus.AVAILABLE && d.isActive));
                setVehicles(vehiclesData.filter(v => v.status === VehicleStatus.AVAILABLE && v.isActive));
                setShipments(shipmentsData);
            } catch (error) {
                toast.error("Failed to load resources");
            } finally {
                setLoadingResources(false);
            }
        };
        loadResources();
    }, []);

    const onSubmit = async (data: TourFormValues) => {
        setSubmitting(true);
        try {
            const result = await toursApi.create(data);
            toast.success("Delivery tour created successfully!");
            onSuccess?.(result._id.toString());
        } catch (error: any) {
            toast.error(error.message || "Failed to create tour");
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Tour Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Date *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date" 
                                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="driver"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver *</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select driver" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {drivers.map((d) => (
                                                            <SelectItem key={d._id.toString()} value={d._id.toString()}>
                                                                {d.firstName} {d.lastName}
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
                                    name="vehicle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle *</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select vehicle" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {vehicles.map((v) => (
                                                            <SelectItem key={v._id.toString()} value={v._id.toString()}>
                                                                {v.registrationNumber} ({v.model})
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

                    {/* Route Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5" />
                                Route Planning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="plannedRoute.startLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Location *</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plannedRoute.endLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Location *</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="plannedRoute.estimatedDistance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Est. Distance (km) *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.1" 
                                                    {...field} 
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plannedRoute.estimatedDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Est. Duration (min) *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    {...field} 
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shipments Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5" />
                            Select Shipments
                        </CardTitle>
                        <FormDescription>Choose pending shipments to include in this tour.</FormDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="shipments"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 border rounded-md">
                                        {shipments.length === 0 ? (
                                            <div className="col-span-full py-8 text-center text-muted-foreground">
                                                No pending shipments available.
                                            </div>
                                        ) : (
                                            shipments.map((shipment) => (
                                                <div 
                                                    key={shipment._id.toString()} 
                                                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                                        field.value.includes(shipment._id.toString()) 
                                                            ? "bg-primary/5 border-primary" 
                                                            : "hover:bg-muted"
                                                    }`}
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value.includes(shipment._id.toString())}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, shipment._id.toString()])
                                                                    : field.onChange(field.value.filter((id) => id !== shipment._id.toString()));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <p className="text-sm font-medium">{shipment.shipmentNumber}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            To: {(shipment.receiverAddress as any).city}, {(shipment.receiverAddress as any).country}
                                                        </p>
                                                        <p className="text-xs font-mono">{shipment.totalWeight}kg | {shipment.totalVolume}m³</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Any specific instructions for the driver..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={submitting || shipments.length === 0}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Tour
                    </Button>
                </div>
            </form>
        </Form>
    );
}
