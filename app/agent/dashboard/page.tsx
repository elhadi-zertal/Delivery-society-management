"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
    Package, 
    Truck, 
    FileText, 
    TrendingUp, 
    Plus, 
    ChevronRight,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/formatting";

interface Stats {
    shipments: {
        total: number;
        pending: number;
        deliveredToday: number;
    };
    tours: {
        active: number;
    };
    invoices: {
        pending: number;
        totalRevenue: number;
    };
}

export default function AgentDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/agent/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const quickActions = [
        { label: "New Shipment", href: "/agent/shipments/create", icon: Package, color: "bg-blue-500" },
        { label: "Create Tour", href: "/agent/tours/create", icon: Truck, color: "bg-green-500" },
        { label: "Add Vehicle", href: "/agent/vehicles?add=true", icon: Truck, color: "bg-orange-500" },
        { label: "New Invoice", href: "/agent/invoices/create", icon: FileText, color: "bg-purple-500" },
    ];

    if (loading) {
        return (
            <div className="space-y-8 p-8 max-w-7xl mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64 text-blue-500" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-64 lg:col-span-2" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-blue-500 mb-2">
                        Welcome back, {session?.user?.name || "Agent"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Here's what's happening with your operations today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Clock className="h-4 w-4" /> Schedule
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Quick Action
                    </Button>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.label} href={action.href}>
                        <Card className="hover:border-blue-500/50 hover:bg-blue-50/5 dark:hover:bg-blue-900/10 transition-all cursor-pointer group border-2">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                                <div className={`p-3 rounded-2xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <span className="font-semibold">{action.label}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Shipments</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats?.shipments.pending || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span>+{stats?.shipments.deliveredToday || 0} delivered today</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Truck className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Tours</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats?.tours.active || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={75} className="h-1.5 mt-2" />
                        <p className="text-[10px] text-muted-foreground mt-1 text-right">75% completion rate</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription>Unpaid Invoices</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats?.invoices.pending || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            <span>Requires urgent attention</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-3xl font-bold">{formatCurrency(stats?.invoices.totalRevenue || 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-muted-foreground gap-1 text-green-500">
                            <CheckCircle2 className="h-3 w-3 " />
                            <span>15% increase from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Placeholder */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest operational updates</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-500">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { title: "Tour #TOR-20240122-001 started", time: "10 mins ago", icon: Truck, color: "text-blue-500", bg: "bg-blue-50" },
                            { title: "Shipment #SHP-98321 delivered", time: "25 mins ago", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
                            { title: "Invoice #INV-4562 created", time: "1 hour ago", icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
                            { title: "Vehicle #MD-456-XY in maintenance", time: "3 hours ago", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={`p-2 rounded-full ${item.bg}`}>
                                    <item.icon className={`h-4 w-4 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Operations Health */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Real-time status monitor</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Fleet Availability</span>
                                <span className="font-bold">92%</span>
                            </div>
                            <Progress value={92} className="h-2 bg-muted transition-all" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>On-time Delivery</span>
                                <span className="font-bold">88%</span>
                            </div>
                            <Progress value={88} className="h-2 bg-muted transition-all" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Warehouse Capacity</span>
                                <span className="font-bold">64%</span>
                            </div>
                            <Progress value={64} className="h-2 bg-muted transition-all" />
                        </div>
                        
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                All systems operational
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
