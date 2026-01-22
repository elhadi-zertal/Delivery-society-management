"use client";

import { useState, useEffect } from "react";
import { CommercialAnalytics } from "@/types/analytics";
import { analyticsApi } from "@/lib/api/analytics";
import { KPICard } from "@/components/analytics/kpi-card";
import { ChartContainer } from "@/components/analytics/chart-container";
import { ExportButton } from "@/components/analytics/export-button";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { formatCurrency, formatNumber, chartColors } from "@/lib/utils/chart-config";
import { DollarSign, Package, Users, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CommercialAnalyticsPage() {
    const [data, setData] = useState<CommercialAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState("12");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await analyticsApi.getCommercial({ months: parseInt(months) });
                setData(res);
            } catch (error) {
                toast.error("Failed to load commercial analytics");
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

    // Prepare export data
    const shipmentExport = data.shipmentEvolution.map(item => ({
        Month: item.month,
        Shipments: item.count,
        Revenue: item.revenue
    }));

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Commercial Analytics</h1>
                    <p className="text-muted-foreground">Sales performance, client acquisition, and market trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangePicker value={months} onChange={setMonths} />
                    <ExportButton
                        data={shipmentExport}
                        filename="commercial_report"
                        title="Commercial Analytics Report"
                    />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(data.totalRevenue)}
                    icon={<DollarSign className="h-4 w-4" />}
                    trend="up"
                    change={12.5} // Mock change for demo as history API is simple
                    description="vs previous period"
                />
                <KPICard
                    title="Total Shipments"
                    value={formatNumber(data.totalShipments)}
                    icon={<Package className="h-4 w-4" />}
                    change={8.2}
                    description="vs previous period"
                />
                <KPICard
                    title="Avg Shipment Value"
                    value={formatCurrency(data.averageShipmentValue)}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <KPICard
                    title="Top Client Share"
                    value={data.topClients.length > 0 ? formatNumber(data.topClients[0].shipmentCount) : "0"}
                    description={data.topClients.length > 0 ? `Lead: ${data.topClients[0].client.companyName}` : "No clients"}
                    icon={<Users className="h-4 w-4" />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Revenue Evolution">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.shipmentEvolution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={chartColors.primary} activeDot={{ r: 8 }} name="Revenue" />
                            <Line yAxisId="right" type="monotone" dataKey="count" stroke={chartColors.success} name="Shipments" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Service Type Breakdown">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.serviceTypeBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {data.serviceTypeBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors.palette[index % chartColors.palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Top Clients" height="auto">
                    <div className="space-y-4">
                        {data.topClients.map((client, index) => (
                            <div key={client.client._id} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{client.client.companyName || `${client.client.firstName} ${client.client.lastName}`}</p>
                                        <p className="text-xs text-muted-foreground">{client.shipmentCount} shipments</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{formatCurrency(client.revenue)}</p>
                                    <p className="text-xs text-green-600">Top Tier</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartContainer>

                <ChartContainer title="Top Destinations" height="auto">
                    <div className="space-y-4">
                        {data.popularDestinations.map((dest, index) => (
                            <div key={dest.destination._id} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-semibold">{dest.destination.city}, {dest.destination.country}</p>
                                        <p className="text-xs text-muted-foreground">Zone {dest.destination.zone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{dest.shipmentCount}</p>
                                    <p className="text-xs text-muted-foreground">Shipments</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
}
