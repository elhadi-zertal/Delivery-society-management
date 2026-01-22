"use client";

import { useState } from "react";
import { IIncident, IncidentStatus, IComplaint, ComplaintStatus } from "@/types";
import { incidentsApi } from "@/lib/api/incidents";
import { complaintsApi } from "@/lib/api/complaints";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

type ItemType = 'incident' | 'complaint';

interface QuickUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: IIncident | IComplaint;
    type: ItemType;
    onSuccess?: () => void;
}

export function QuickUpdateModal({ isOpen, onClose, item, type, onSuccess }: QuickUpdateModalProps) {
    const [status, setStatus] = useState<string>(item.status);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'incident') {
                await incidentsApi.updateStatus((item as IIncident)._id.toString(), status as IncidentStatus);
            } else {
                await complaintsApi.updateStatus((item as IComplaint)._id.toString(), status as ComplaintStatus);
            }
            toast.success("Status updated successfully");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = type === 'incident'
        ? Object.values(IncidentStatus)
        : Object.values(ComplaintStatus);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        Update Status
                    </DialogTitle>
                    <DialogDescription>
                        Change status for {type === 'incident' ? (item as IIncident).incidentNumber : (item as IComplaint).complaintNumber}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">New Status *</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s.replace(/_/g, " ").toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Update Note (Optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Add a reason for this update..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Update
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
