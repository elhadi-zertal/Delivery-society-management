"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createDestinationSchema } from "@/lib/validations/schemas";
import { IDestination } from "@/types";
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
import { useEffect } from "react";

const formSchema = createDestinationSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type DestinationFormValues = z.infer<typeof formSchema>;

interface DestinationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DestinationFormValues) => Promise<void>;
    initialData?: IDestination | null;
    loading?: boolean;
}

export function DestinationForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: DestinationFormProps) {
    const form = useForm<DestinationFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            city: "",
            country: "",
            zone: "",
            baseRate: 0,
            postalCodeRange: {
                from: "",
                to: "",
            },
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                postalCodeRange: initialData.postalCodeRange || { from: "", to: "" },
            } as DestinationFormValues);
        } else {
            form.reset({
                isActive: true,
                city: "",
                country: "",
                zone: "",
                baseRate: 0,
                postalCodeRange: {
                    from: "",
                    to: "",
                },
            });
        }
    }, [initialData, form, isOpen]);

    return (
        <FormModal
            title={initialData ? "Edit Destination" : "Add Destination"}
            description={initialData ? "Edit destination details below." : "Enter new destination details."}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Paris" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="France" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="zone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zone *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Zone A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="baseRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Rate *</FormLabel>
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
                        <FormLabel className="font-semibold">Postal Code Range</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="postalCodeRange.from"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">From</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="75000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postalCodeRange.to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">To</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="75999" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                        Active Destination
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
                            {initialData ? "Save Changes" : "Create Destination"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
