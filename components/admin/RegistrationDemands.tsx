"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { fetcher } from "@/lib/api/swr-fetcher";
import { toast } from "sonner";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Demand {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function RegistrationDemands() {
    const { data: demands, error, isLoading, mutate } = useSWR<Demand[]>("/api/admin/registrations", fetcher);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const response = await fetch(`/api/admin/registrations/${id}/approve`, {
                method: "POST",
            });
            if (response.ok) {
                toast.success("Registration approved");
                mutate();
            } else {
                toast.error("Failed to approve request");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        setProcessingId(id);
        try {
            const response = await fetch(`/api/admin/registrations/${id}/reject`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast.success("Registration rejected");
                mutate();
            } else {
                toast.error("Failed to reject request");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return (
        <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>Could not load registration requests.</span>
        </div>
    );

    return (
        <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-6">Pending Registrations</h2>

            {!demands || demands.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">No pending requests.</p>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {demands.map((demand) => (
                            <motion.div
                                key={demand._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-muted/30 p-4 rounded-lg border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold">{demand.name}</h3>
                                        <Badge variant="outline" className="capitalize text-[10px] px-1.5 h-4">{demand.role}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex flex-col sm:flex-row gap-1 sm:gap-3 mt-1">
                                        <span>{demand.email}</span>
                                        <span className="hidden sm:inline opacity-30">•</span>
                                        <span>{new Date(demand.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReject(demand._id)}
                                        disabled={!!processingId}
                                        className="flex-1 md:flex-none text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="mr-2 h-3 w-3" /> Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(demand._id)}
                                        disabled={!!processingId}
                                        loading={processingId === demand._id}
                                        className="flex-1 md:flex-none"
                                    >
                                        <Check className="mr-2 h-3 w-3" /> Approve
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
