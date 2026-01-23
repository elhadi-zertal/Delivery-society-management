"use client";

import { useState, useEffect } from "react";
import { IComplaint, IUser } from "@/types";
import { complaintsApi } from "@/lib/api/complaints";
import { usersApi } from "@/lib/api/users";
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
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

interface AssignComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaint: IComplaint;
    onSuccess?: () => void;
}

export function AssignComplaintModal({ isOpen, onClose, complaint, onSuccess }: AssignComplaintModalProps) {
    const [userId, setUserId] = useState<string>(
        typeof complaint.assignedTo === 'object' ? (complaint.assignedTo as IUser)._id.toString() : (complaint.assignedTo as unknown as string) || ""
    );
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<IUser[]>([]);

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const data = await usersApi.getAgents();
                setAgents(data);
            } catch (error) {
            }
        };
        if (isOpen) loadAgents();
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            toast.error("Please select an agent");
            return;
        }

        setLoading(true);
        try {
            await complaintsApi.assign(complaint._id.toString(), userId);
            toast.success("Complaint assigned successfully");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to assign complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                        Assign Complaint
                    </DialogTitle>
                    <DialogDescription>
                        Assign {complaint.complaintNumber} to an agent
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="agent">Select Agent *</Label>
                        <Select value={userId} onValueChange={setUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an agent..." />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map((agent) => (
                                    <SelectItem key={agent._id.toString()} value={agent._id.toString()}>
                                        {agent.name} {agent.email && `(${agent.email})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Assign
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
