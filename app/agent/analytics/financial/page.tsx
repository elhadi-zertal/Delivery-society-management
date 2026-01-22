"use client";

import { useState, useEffect } from "react";
import { FinancialAnalytics } from "@/types/analytics";
import { analyticsApi } from "@/lib/api/analytics";
import { KPICard } from "@/components/analytics/kpi-card";
import { ChartContainer } from "@/components/analytics/chart-container";
import { ExportButton } from "@/components/analytics/export-button";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line
} from "recharts";
import { formatCurrency, chartColors } from "@/lib/utils/chart-config";
import { DollarSign, CreditCard, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FinancialAnalyticsPage() {
    const [data, setData] = useState<FinancialAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState("12");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await analyticsApi.getFinancial({ months: parseInt(months) });
                setData(res);
            } catch (error) {
                toast.error("Failed to load financial analytics");
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

    const exportData = data.revenueTrend.map(item => ({
        Month: item.month,
        Revenue: item.revenue,
        Collections: item.collections,
        Outstanding: item.outstanding
    }));

    const agingData = [
        { name: "Current", value: data.invoiceAging.current },
        { name: "1-30 Days", value: data.invoiceAging.overdue30 },
        { name: "31-60 Days", value: data.invoiceAging.overdue60 },
        { name: "90+ Days", value: data.invoiceAging.overdue90 },
    ].filter(i => i.value > 0);

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Financial Reports</h1>
                    <p className="text-muted-foreground">Revenue tracking, cash flow, and invoice aging</p>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangePicker value={months} onChange={setMonths} />
                    <ExportButton
                        data={exportData}
                        filename="financial_report"
                        title="Financial Performance Report"
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
                />
                <KPICard
                    title="Collections"
                    value={formatCurrency(data.totalCollections)}
                    icon={<CreditCard className="h-4 w-4" />}
                    change={data.collectionEfficiency}
                    description="Collection Efficiency"
                />
                <KPICard
                    title="Outstanding"
                    value={formatCurrency(data.outstandingAmount)}
                    icon={<AlertCircle className="h-4 w-4" />}
                    trend="down" // High outstanding is bad usually
                    className="border-red-200"
                />
                <KPICard
                    title="Net Profit (Est)"
                    value={formatCurrency(data.totalRevenue * 0.2)}
                    description="~20% Margin"
                    icon={<TrendingUp className="h-4 w-4" />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Cash Flow & Revenue">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="revenue" fill={chartColors.primary} name="Revenue" />
                            <Line type="monotone" dataKey="collections" stroke={chartColors.success} strokeWidth={2} name="Collections" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Invoice Aging">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={agingData}
                                cx="50%"
                                cy="50%"
                                label={({ name, value }: any) => `${name}: ${formatCurrency(value)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {agingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors.palette[index % chartColors.palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <ChartContainer title="Revenue by Payment Method">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.revenueByMethod} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="method" width={100} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill={chartColors.info} name="Amount" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}
