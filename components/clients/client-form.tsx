"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientSchema } from "@/lib/validations/schemas";
import { IClient } from "@/types";
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
import { useEffect } from "react";

// Extend schema for frontend if needed, or use as is. 
// We might need to handle 'isActive' which is in update schema but maybe not create? 
// Let's assume we can merge them or just handle it.
// Address is nested.

const formSchema = createClientSchema.extend({
    isActive: z.boolean().default(true).optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClientFormValues) => Promise<void>;
    initialData?: IClient | null;
    loading?: boolean;
}

export function ClientForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: ClientFormProps) {
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            isActive: true,
            address: {
                street: "",
                city: "",
                postalCode: "",
                country: "",
            },
            companyName: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                // Ensure address structure matches
                address: initialData.address || { street: "", city: "", postalCode: "", country: "" }
            });
        } else {
            form.reset({
                isActive: true,
                address: { street: "", city: "", postalCode: "", country: "" },
                companyName: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                notes: "",
            });
        }
    }, [initialData, form, isOpen]);

    return (
        <FormModal
            title={initialData ? "Edit Client" : "Add Client"}
            description={initialData ? "Edit client details below." : "Enter new client details."}
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

                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                    <Textarea disabled={loading} placeholder="Additional notes..." {...field} />
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
                            {initialData ? "Save Changes" : "Create Client"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormModal>
    );
}
