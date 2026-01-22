"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createVehicleSchema } from "@/lib/validations/schemas";
import { IVehicle, VehicleStatus, VehicleType } from "@/types";
import { FormModal } from "@/components/shared/FormModal";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

// Extend schema for edit (isActive) if needed, though updateVehicleSchema exists, we often mix for form usage.
const formSchema = createVehicleSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: VehicleFormValues) => Promise<void>;
    initialData?: IVehicle | null;
    loading?: boolean;
}

export function VehicleForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: VehicleFormProps) {
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            status: VehicleStatus.AVAILABLE,
            registrationNumber: "",
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            type: VehicleType.VAN,
            fuelType: "diesel", // Default common
            fuelConsumption: 0,
            mileage: 0,
            capacity: {
                weight: 0,
                volume: 0,
            },
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                type: initialData.type as VehicleType,
                status: initialData.status as VehicleStatus,
                lastMaintenanceDate: initialData.lastMaintenanceDate ? new Date(initialData.lastMaintenanceDate) : undefined,
                nextMaintenanceDate: initialData.nextMaintenanceDate ? new Date(initialData.nextMaintenanceDate) : undefined,
                capacity: initialData.capacity || { weight: 0, volume: 0 },
            } as VehicleFormValues);
        } else {
            form.reset({
                isActive: true,
                status: VehicleStatus.AVAILABLE,
                registrationNumber: "",
                brand: "",
                model: "",
                year: new Date().getFullYear(),
                type: VehicleType.VAN,
                fuelType: "diesel",
                fuelConsumption: 0,
                mileage: 0,
                capacity: {
                    weight: 0,
                    volume: 0,
                },
                notes: "",
            });
        }
    }, [initialData, form, isOpen]);

    const formatDateForInput = (date: Date | any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    return (
        <FormModal
            title={initialData ? "Edit Vehicle" : "Add Vehicle"}
            description={initialData ? "Edit vehicle details below." : "Enter new vehicle details."}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="registrationNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reg. Number *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="AA-123-BB" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type *</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(VehicleType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.toUpperCase()}
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

                    <div className="grid grid-cols-3 gap-2">
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Mercedes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Sprinter" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Year *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            disabled={loading}
                                            placeholder="2023"
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 border p-3 rounded-md">
                            <FormLabel className="font-semibold">Capacity</FormLabel>
                            <FormField
                                control={form.control}
                                name="capacity.weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Weight (kg) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity.volume"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Volume (m³) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2 border p-3 rounded-md">
                            <FormLabel className="font-semibold">Fuel & Mileage</FormLabel>
                            <FormField
                                control={form.control}
                                name="fuelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Fuel Type *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="diesel">Diesel</SelectItem>
                                                    <SelectItem value="gasoline">Gasoline</SelectItem>
                                                    <SelectItem value="electric">Electric</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fuelConsumption"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">L/100km *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mileage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Mileage (km)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(VehicleStatus).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status.replace('_', ' ').toUpperCase()}
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
                            name="lastMaintenanceDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Maintenance</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            disabled={loading}
                                            value={formatDateForInput(field.value)}
                                            onChange={(e) => field.onChange(new Date(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea disabled={loading} placeholder="Notes..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Active Vehicle
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {initialData ? "Save Changes" : "Create Vehicle"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
