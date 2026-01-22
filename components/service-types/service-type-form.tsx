"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createServiceTypeSchema } from "@/lib/validations/schemas";
import { IServiceType, ServiceTypeName } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const formSchema = createServiceTypeSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type ServiceTypeFormValues = z.infer<typeof formSchema>;

interface ServiceTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ServiceTypeFormValues) => Promise<void>;
    initialData?: IServiceType | null;
    loading?: boolean;
}

export function ServiceTypeForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: ServiceTypeFormProps) {
    const form = useForm<ServiceTypeFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            name: ServiceTypeName.STANDARD,
            displayName: "",
            description: "",
            estimatedDeliveryDays: {
                min: 1,
                max: 3,
            },
            multiplier: 1.0,
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                estimatedDeliveryDays: initialData.estimatedDeliveryDays || { min: 1, max: 3 }
            } as ServiceTypeFormValues);
        } else {
            form.reset({
                isActive: true,
                name: ServiceTypeName.STANDARD,
                displayName: "",
                description: "",
                estimatedDeliveryDays: {
                    min: 1,
                    max: 3,
                },
                multiplier: 1.0,
            });
        }
    }, [initialData, form, isOpen]);

    return (
        <FormModal
            title={initialData ? "Edit Service Type" : "Add Service Type"}
            description={initialData ? "Edit service type details below." : "Enter new service type details."}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type Code *</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ServiceTypeName).map((type) => (
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

                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name *</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Standard Delivery" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea disabled={loading} placeholder="Description..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="estimatedDeliveryDays.min"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Min Days *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            disabled={loading}
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="estimatedDeliveryDays.max"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Max Days *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            disabled={loading}
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="multiplier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Price Multiplier *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
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
                                        Active
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
                            {initialData ? "Save Changes" : "Create Service Type"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
