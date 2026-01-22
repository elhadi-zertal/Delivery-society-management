"use client";

import { useRouter } from "next/navigation";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateShipmentPage() {
    const router = useRouter();

    const handleSuccess = (shipmentId: string, trackingNumber: string) => {
        router.push(`/agent/shipments/${shipmentId}`);
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Create New Shipment</h1>
                    <p className="text-muted-foreground">Fill in the details below to create a new shipment</p>
                </div>
            </div>

            {/* Form */}
            <ShipmentForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
    );
}
