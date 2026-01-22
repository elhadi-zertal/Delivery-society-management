"use client";

import { useState, useEffect, useMemo } from "react";
import { IIncident, IComplaint, IncidentType, ComplaintNature } from "@/types";
import { incidentsApi } from "@/lib/api/incidents";
import { complaintsApi } from "@/lib/api/complaints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";
import {
    Activity,
    AlertTriangle,
    MessageSquare,
    CheckCircle,
    Clock,
    TrendingUp,
    Download
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/formatting";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function SupportAnalyticsPage() {
    const [incidents, setIncidents] = useState<IIncident[]>([]);
    const [complaints, setComplaints] = useState<IComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30"); // days

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Calculate date range
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - parseInt(range));

                const [incidentsData, complaintsData] = await Promise.all([
                    incidentsApi.getAll({ dateFrom: startDate }),
                    complaintsApi.getAll({ dateFrom: startDate })
                ]);

                setIncidents(incidentsData);
                setComplaints(complaintsData);
            } catch (error) {
                toast.error("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [range]);

    // Data Processing
    const stats = useMemo(() => {
        const totalIncidents = incidents.length;
        const totalComplaints = complaints.length;
        const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

        // Avg Resolution Time (Incidents) in hours
        const incidentResolutionTimes = incidents
            .filter(i => i.status === 'resolved' && i.resolvedAt && i.createdAt)
            .map(i => (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60));

        const avgIncidentResolution = incidentResolutionTimes.length > 0
            ? incidentResolutionTimes.reduce((a, b) => a + b, 0) / incidentResolutionTimes.length
            : 0;

        return {
            totalIncidents,
            totalComplaints,
            incidentResolutionRate: totalIncidents ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
            complaintResolutionRate: totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
            avgIncidentResolution: Math.round(avgIncidentResolution * 10) / 10
        };
    }, [incidents, complaints]);

    // Charts Data
    const incidentsByType = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(IncidentType).forEach(t => counts[t] = 0);
        incidents.forEach(i => {
            counts[i.type] = (counts[i.type] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
            .filter(item => item.value > 0);
    }, [incidents]);

    const complaintsByNature = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(ComplaintNature).forEach(n => counts[n] = 0);
        complaints.forEach(c => {
            counts[c.nature] = (counts[c.nature] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
            .filter(item => item.value > 0);
    }, [complaints]);

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Support Analytics</h1>
                    <p className="text-muted-foreground">Operational insights and performance metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalIncidents}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.incidentResolutionRate}% resolution rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalComplaints}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.complaintResolutionRate}% resolution rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgIncidentResolution}h</div>
                        <p className="text-xs text-muted-foreground">
                            For incidents
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalIncidents + stats.totalComplaints - (Math.round((stats.totalIncidents * stats.incidentResolutionRate) / 100) + Math.round((stats.totalComplaints * stats.complaintResolutionRate) / 100))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active items
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Incidents by Type</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incidentsByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {incidentsByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Complaints by Nature</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complaintsByNature}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8">
                                    {complaintsByNature.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
