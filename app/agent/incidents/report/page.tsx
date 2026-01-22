"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IncidentType, IShipment, IDriver, IVehicle, IDeliveryTour } from "@/types";
import { incidentsApi, CreateIncidentInput } from "@/lib/api/incidents";
import { shipmentsApi } from "@/lib/api/shipments";
import { driversApi } from "@/lib/api/drivers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle, Clock, Package, Wrench, SearchX, Car, Info } from "lucide-react";

const incidentSchema = z.object({
    type: z.nativeEnum(IncidentType),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    occurredAt: z.coerce.date(),
    shipmentId: z.string().optional(),
    driverId: z.string().optional(),
    vehicleId: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

const typeIcons: Record<IncidentType, React.ElementType> = {
    [IncidentType.DELAY]: Clock,
    [IncidentType.LOSS]: SearchX,
    [IncidentType.DAMAGE]: Package,
    [IncidentType.TECHNICAL_ISSUE]: Wrench,
    [IncidentType.ACCIDENT]: AlertTriangle,
    [IncidentType.OTHER]: Info,
};

export default function ReportIncidentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [drivers, setDrivers] = useState<IDriver[]>([]);
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);

    const form = useForm<IncidentFormValues>({
        resolver: zodResolver(incidentSchema) as any,
        defaultValues: {
            type: IncidentType.OTHER,
            description: "",
            location: "",
            occurredAt: new Date(),
        },
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [shipmentsData, driversData, vehiclesData] = await Promise.all([
                    shipmentsApi.getAll(),
                    driversApi.getAll(),
                    vehiclesApi.getAll(),
                ]);
                setShipments(shipmentsData);
                setDrivers(driversData);
                setVehicles(vehiclesData);
            } catch (error) {
                console.error("Failed to load reference data");
            }
        };
        loadData();
    }, []);

    const onSubmit = async (data: IncidentFormValues) => {
        setLoading(true);
        try {
            const incident = await incidentsApi.create(data as CreateIncidentInput);
            toast.success(`Incident ${incident.incidentNumber} reported`);
            router.push(`/agent/incidents/${incident._id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to report incident");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Report Incident</h1>
                    <p className="text-muted-foreground">Document an operational incident</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Incident Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {Object.values(IncidentType).map((type) => {
                                                    const Icon = typeIcons[type];
                                                    const isSelected = field.value === type;
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => field.onChange(type)}
                                                            className={`p-4 border rounded-lg text-left transition-all ${isSelected
                                                                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                                                                    : "hover:border-gray-400"
                                                                }`}
                                                        >
                                                            <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                                            <p className="font-medium text-sm">{type.replace(/_/g, " ").toUpperCase()}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="occurredAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>When did it occur? *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Where did it happen?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what happened in detail..."
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Related Entities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Related Entities (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="shipmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Shipment</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a shipment..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    {shipments.slice(0, 50).map((s) => (
                                                        <SelectItem key={s._id.toString()} value={s._id.toString()}>
                                                            {s.shipmentNumber}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="driverId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select driver..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">None</SelectItem>
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
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select vehicle..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">None</SelectItem>
                                                        {vehicles.map((v) => (
                                                            <SelectItem key={v._id.toString()} value={v._id.toString()}>
                                                                {v.registrationNumber}
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

                    {/* Submit */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Report Incident
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
