"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createDriverSchema } from "@/lib/validations/schemas";
import { IDriver, DriverStatus } from "@/types";
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

// Extend with ID if needed or mapping adjustments
const formSchema = createDriverSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type DriverFormValues = z.infer<typeof formSchema>;

interface DriverFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DriverFormValues) => Promise<void>;
    initialData?: IDriver | null;
    loading?: boolean;
}

export function DriverForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: DriverFormProps) {
    const form = useForm<DriverFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            status: DriverStatus.AVAILABLE,
            address: {
                street: "",
                city: "",
                postalCode: "",
                country: "",
            },
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            licenseNumber: "",
            licenseType: "",
            notes: "",
            hireDate: new Date(),
            licenseExpiry: new Date(),
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                hireDate: initialData.hireDate ? new Date(initialData.hireDate) : new Date(),
                licenseExpiry: initialData.licenseExpiry ? new Date(initialData.licenseExpiry) : new Date(),
                address: initialData.address || { street: "", city: "", postalCode: "", country: "" }
            });
        } else {
            form.reset({
                isActive: true,
                status: DriverStatus.AVAILABLE,
                address: { street: "", city: "", postalCode: "", country: "" },
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                licenseNumber: "",
                licenseType: "",
                notes: "",
                hireDate: new Date(),
                licenseExpiry: new Date(),
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
            title={initialData ? "Edit Driver" : "Add Driver"}
            description={initialData ? "Edit driver details below." : "Enter new driver details."}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone *</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="+123456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <FormLabel>License Details</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Number *</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="LIC-123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="licenseType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Type *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="B">Class B</SelectItem>
                                                    <SelectItem value="C">Class C</SelectItem>
                                                    <SelectItem value="D">Class D</SelectItem>
                                                    <SelectItem value="E">Class E</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="licenseExpiry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Expiry *</FormLabel>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="hireDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hire Date</FormLabel>
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
                                                {Object.values(DriverStatus).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
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

                    <div className="space-y-2">
                        <FormLabel>Address</FormLabel>
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Street Address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="ZIP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                        Active Account
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
                            {initialData ? "Save Changes" : "Create Driver"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
