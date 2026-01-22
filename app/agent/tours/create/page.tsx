"use client";

import { useRouter } from "next/navigation";
import { TourForm } from "@/components/tours/tour-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function CreateTourPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create Delivery Tour</h1>
                    <p className="text-muted-foreground">Plan a new route and assign a driver and shipments</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <TourForm 
                    onSuccess={(id) => router.push(`/agent/tours/${id}`)}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}
