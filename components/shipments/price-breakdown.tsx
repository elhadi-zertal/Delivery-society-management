"use client";

import { formatCurrency } from "@/lib/utils/formatting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceBreakdownProps {
    baseAmount: number;
    weightAmount: number;
    volumeAmount: number;
    additionalFees?: number;
    discount?: number;
    tvaRate?: number; // Default 19%
}

export function PriceBreakdown({
    baseAmount,
    weightAmount,
    volumeAmount,
    additionalFees = 0,
    discount = 0,
    tvaRate = 19,
}: PriceBreakdownProps) {
    const subtotalHT = baseAmount + weightAmount + volumeAmount + additionalFees - discount;
    const tva = subtotalHT * (tvaRate / 100);
    const totalTTC = subtotalHT + tva;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Rate</span>
                    <span>{formatCurrency(baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight Charge</span>
                    <span>{formatCurrency(weightAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Charge</span>
                    <span>{formatCurrency(volumeAmount)}</span>
                </div>
                {additionalFees > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Additional Fees</span>
                        <span>{formatCurrency(additionalFees)}</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                    </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Subtotal (HT)</span>
                    <span>{formatCurrency(subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>TVA ({tvaRate}%)</span>
                    <span>{formatCurrency(tva)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total (TTC)</span>
                    <span className="text-primary">{formatCurrency(totalTTC)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// Compact inline version for lists
export function PriceBreakdownInline({
    baseAmount,
    weightAmount,
    volumeAmount,
    additionalFees = 0,
    discount = 0,
    tvaRate = 19,
}: PriceBreakdownProps) {
    const subtotalHT = baseAmount + weightAmount + volumeAmount + additionalFees - discount;
    const tva = subtotalHT * (tvaRate / 100);
    const totalTTC = subtotalHT + tva;

    return (
        <div className="text-xs text-muted-foreground">
            <p>Base: {formatCurrency(baseAmount)}</p>
            <p>Weight: {formatCurrency(weightAmount)}</p>
            <p>Volume: {formatCurrency(volumeAmount)}</p>
            <p className="font-semibold text-foreground">Total: {formatCurrency(totalTTC)}</p>
        </div>
    );
}
