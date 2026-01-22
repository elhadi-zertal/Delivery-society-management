"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    height?: number | string;
}

export function ChartContainer({
    title,
    description,
    children,
    className,
    action,
    height = 350
}: ChartContainerProps) {
    return (
        <Card className={cn("col-span-1", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                        {action}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height }} className="w-full">
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}
