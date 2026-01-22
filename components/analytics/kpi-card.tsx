"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number; // percentage
    description?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function KPICard({ title, value, change, description, icon, trend, className }: KPICardProps) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    // Default trend logic if not provided
    const trendDirection = trend || (isPositive ? 'up' : isNegative ? 'down' : 'neutral');

    // Color logic: usually up is green (good), but for costs/incidents up is bad.
    // We'll stick to Green = Up, Red = Down for now unless driven by prop.
    // Actually, usually Green = Good. 
    // Let's assume standard behavior: Up/Green, Down/Red. 
    // If caller needs inverse, they can pass negative change or handle visually.

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon && <div className="text-muted-foreground ml-2">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold truncate" title={String(value)}>{value}</div>
                {(change !== undefined || description) && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {change !== undefined && (
                            <span className={cn(
                                "flex items-center font-medium mr-2",
                                change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"
                            )}>
                                {change > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : change < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                                {Math.abs(change)}%
                            </span>
                        )}
                        {description && <span className="truncate">{description}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
