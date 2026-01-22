"use client";

import { useState, useEffect } from "react";
import { OperationalAnalytics } from "@/types/analytics";
import { analyticsApi } from "@/lib/api/analytics";
import { KPICard } from "@/components/analytics/kpi-card";
import { ChartContainer } from "@/components/analytics/chart-container";
import { ExportButton } from "@/components/analytics/export-button";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from "recharts";
import { formatNumber, chartColors } from "@/lib/utils/chart-config";
import { Truck, CheckCircle, AlertTriangle, Fuel, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OperationalAnalyticsPage() {
    const [data, setData] = useState<OperationalAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState("3");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await analyticsApi.getOperational({ months: parseInt(months) });
                setData(res);
            } catch (error) {
                toast.error("Failed to load operational analytics");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [months]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data) return null;

    const tourExport = data.tourEvolution.map(item => ({
        Month: item.month,
        Tours: item.count,
        "Avg Deliveries": item.averageDeliveries
    }));

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Operational Analytics</h1>
                    <p className="text-muted-foreground">Fleet efficiency, driver performance, and delivery metrics</p>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangePicker value={months} onChange={setMonths} />
                    <ExportButton
                        data={tourExport}
                        filename="operational_report"
                        title="Operational Analytics Report"
                    />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Success Rate"
                    value={`${data.deliverySuccessRate}%`}
                    icon={<CheckCircle className="h-4 w-4" />}
                    trend={data.deliverySuccessRate >= 95 ? "up" : "down"}
                    change={0.5}
                />
                <KPICard
                    title="Total Tours"
                    value={formatNumber(data.totalTours)}
                    icon={<Truck className="h-4 w-4" />}
                />
                <KPICard
                    title="Avg Drop/Tour"
                    value={data.averageDeliveriesPerTour}
                    icon={<Truck className="h-4 w-4" />}
                />
                <KPICard
                    title="Fuel Consumed"
                    value={`${formatNumber(data.totalFuel)} L`}
                    icon={<Fuel className="h-4 w-4" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Tour Evolution">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.tourEvolution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="count" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} name="Tours" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Peak Periods">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.peakPeriods}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dayOfWeek" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageShipments" fill={chartColors.warning} name="Shipments" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Drivers & Vehicles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Top Drivers" height="auto">
                    <div className="space-y-4">
                        {data.topDrivers.map((driver, index) => (
                            <div key={driver.driver.employeeId} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{driver.driver.firstName} {driver.driver.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{driver.tourCount} tours</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">{driver.successRate}%</p>
                                    <p className="text-xs text-muted-foreground">Success Rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartContainer>

                <ChartContainer title="Incident Zones" height="auto">
                    <div className="space-y-4">
                        {data.incidentZones.map((zone, index) => (
                            <div key={zone.zone} className="flex items-center justify-between p-2 border rounded-lg bg-red-50">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <p className="font-semibold">{zone.zone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600">{zone.incidentCount}</p>
                                    <p className="text-xs text-muted-foreground">Incidents</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
}
