"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ComplaintNature, IClient } from "@/types";
import { complaintsApi, CreateComplaintInput } from "@/lib/api/complaints";
import { clientsApi } from "@/lib/api/clients";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User, AlertCircle } from "lucide-react";

const complaintSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    nature: z.nativeEnum(ComplaintNature),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    description: z.string().min(20, "Description must be at least 20 characters"),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function CreateComplaintPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<IClient[]>([]);

    const form = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema) as any,
        defaultValues: {
            clientId: "",
            nature: ComplaintNature.OTHER,
            priority: "medium",
            description: "",
        },
    });

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

    const onSubmit = async (data: ComplaintFormValues) => {
        setLoading(true);
        try {
            const complaint = await complaintsApi.create(data as CreateComplaintInput);
            toast.success(`Complaint ${complaint.complaintNumber} registered`);
            router.push(`/agent/complaints/${complaint._id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to register complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Register Complaint</h1>
                    <p className="text-muted-foreground">Document a customer complaint</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Client Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" /> Client Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a client..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients.map((c) => (
                                                        <SelectItem key={c._id.toString()} value={c._id.toString()}>
                                                            {c.firstName} {c.lastName}
                                                            {c.companyName && ` (${c.companyName})`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Complaint Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" /> Complaint Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nature"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type *</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(ComplaintNature).map((n) => (
                                                            <SelectItem key={n} value={n}>
                                                                {n.replace(/_/g, " ").toUpperCase()}
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
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority *</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                placeholder="Describe the complaint in detail..."
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Register Complaint
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
