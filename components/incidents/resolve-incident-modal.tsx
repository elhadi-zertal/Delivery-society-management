"use client";

import { useState } from "react";
import { IIncident, IncidentStatus } from "@/types";
import { incidentsApi } from "@/lib/api/incidents";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

interface ResolveIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    incident: IIncident;
    onSuccess?: () => void;
}

export function ResolveIncidentModal({ isOpen, onClose, incident, onSuccess }: ResolveIncidentModalProps) {
    const [resolution, setResolution] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolution.trim()) {
            toast.error("Resolution details are required");
            return;
        }

        setLoading(true);
        try {
            await incidentsApi.resolve(incident._id.toString(), { resolution });
            toast.success("Incident resolved successfully");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to resolve incident");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Resolve Incident
                    </DialogTitle>
                    <DialogDescription>
                        {incident.incidentNumber}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="resolution">Resolution Details *</Label>
                        <Textarea
                            id="resolution"
                            placeholder="Describe how the incident was resolved..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Include actions taken, root cause if identified, and any preventive measures.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Mark as Resolved
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
