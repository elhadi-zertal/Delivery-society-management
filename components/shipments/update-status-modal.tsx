"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShipmentStatus } from "@/types";
import { shipmentsApi } from "@/lib/api/shipments";
import { ShipmentStatusBadge, getValidStatusTransitions } from "./shipment-status-badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const updateStatusSchema = z.object({
    status: z.nativeEnum(ShipmentStatus),
    location: z.string().optional(),
    description: z.string().min(1, "Description is required"),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface UpdateStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipmentId: string;
    currentStatus: ShipmentStatus;
    onSuccess?: () => void;
}

export function UpdateStatusModal({
    isOpen,
    onClose,
    shipmentId,
    currentStatus,
    onSuccess,
}: UpdateStatusModalProps) {
    const [loading, setLoading] = useState(false);
    const validTransitions = getValidStatusTransitions(currentStatus);

    const form = useForm<UpdateStatusFormValues>({
        resolver: zodResolver(updateStatusSchema) as any,
        defaultValues: {
            status: validTransitions[0] || currentStatus,
            location: "",
            description: "",
        },
    });

    const onSubmit = async (data: UpdateStatusFormValues) => {
        setLoading(true);
        try {
            await shipmentsApi.updateStatus(shipmentId, data);
            toast.success("Status updated successfully");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    if (validTransitions.length === 0) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Status</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <ShipmentStatusBadge status={currentStatus} size="lg" />
                        <p className="mt-4 text-muted-foreground">
                            This shipment has reached a final status and cannot be updated.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Shipment Status</DialogTitle>
                    <DialogDescription>
                        Change the status of this shipment.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center gap-3 py-2">
                    <ShipmentStatusBadge status={currentStatus} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">New Status</span>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Status *</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {validTransitions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        <div className="flex items-center gap-2">
                                                            <ShipmentStatusBadge status={status} size="sm" />
                                                        </div>
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
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Algiers Sorting Center"
                                            disabled={loading}
                                            {...field}
                                        />
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
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the status change..."
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                Update Status
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
