"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPricingSchema } from "@/lib/validations/schemas";
import { IPricing, IDestination, IServiceType } from "@/types";
import { FormModal } from "@/components/shared/FormModal";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { destinationsApi } from "@/lib/api/destinations";
import { serviceTypesApi } from "@/lib/api/service-types";

// Schema helper: Zod objectIdSchema validation is basically a string regex
const formSchema = createPricingSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type PricingFormValues = z.infer<typeof formSchema>;

interface PricingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PricingFormValues) => Promise<void>;
    initialData?: IPricing | null;
    loading?: boolean;
}

export function PricingForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: PricingFormProps) {
    const [destinations, setDestinations] = useState<IDestination[]>([]);
    const [serviceTypes, setServiceTypes] = useState<IServiceType[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    const form = useForm<PricingFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            serviceType: "",
            destination: "",
            baseRate: 0,
            weightRate: 0,
            volumeRate: 0,
            minCharge: 0,
            effectiveFrom: new Date(),
        },
    });

    useEffect(() => {
        const fetchResources = async () => {
            setLoadingResources(true);
            try {
                const [dests, types] = await Promise.all([
                    destinationsApi.getAll(),
                    serviceTypesApi.getAll(),
                ]);
                setDestinations(dests);
                setServiceTypes(types);
            } catch (err) {
                console.error("Failed to load resources", err);
            } finally {
                setLoadingResources(false);
            }
        };

        if (isOpen) {
            fetchResources();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                serviceType: (initialData.serviceType as any)._id || initialData.serviceType,
                destination: (initialData.destination as any)._id || initialData.destination,
                effectiveFrom: initialData.effectiveFrom ? new Date(initialData.effectiveFrom) : new Date(),
                effectiveTo: initialData.effectiveTo ? new Date(initialData.effectiveTo) : undefined,
            } as any);
        } else {
            form.reset({
                isActive: true,
                serviceType: "",
                destination: "",
                baseRate: 0,
                weightRate: 0,
                volumeRate: 0,
                minCharge: 0,
                effectiveFrom: new Date(),
            });
        }
    }, [initialData, form, isOpen]);

    // Helper to format date for input type="date"
    const formatDateForInput = (date: Date | any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    return (
        <FormModal
            title={initialData ? "Edit Pricing" : "Add Pricing Rule"}
            description={initialData ? "Edit pricing details below." : "Enter new pricing details."}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Type *</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={loadingResources || loading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceTypes.map((type) => (
                                                    <SelectItem key={type._id.toString()} value={type._id.toString()}>
                                                        {type.displayName}
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
                                        <Select onValueChange={field.onChange} value={field.value} disabled={loadingResources || loading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Destination" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinations.map((dest) => (
                                                    <SelectItem key={dest._id.toString()} value={dest._id.toString()}>
                                                        {dest.city} ({dest.zone})
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

                    <div className="grid grid-cols-4 gap-2">
                        <FormField
                            control={form.control}
                            name="baseRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Base *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
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
                            name="weightRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Per Kg *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
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
                            name="volumeRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Per m³ *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
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
                            name="minCharge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Min *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
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

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="effectiveFrom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effective From</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="effectiveTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effective To (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            disabled={loading}
                                            value={formatDateForInput(field.value)}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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
                                        Active Rule
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
                            {initialData ? "Save Changes" : "Create Pricing"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
