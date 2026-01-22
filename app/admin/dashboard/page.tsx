"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    Users,
    Server,
    Activity,
    AlertTriangle,
    Shield,
    Settings,
    UserPlus,
    Database
} from "lucide-react";

import { fetcher } from "@/lib/api/swr-fetcher";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/skeletons/CardSkeleton";
import PageLoader from "@/components/shared/PageLoader";
import RegistrationDemands from "@/components/admin/RegistrationDemands";

export default function AdminDashboardPage() {
    const router = useRouter();

    // In production, these should be real endpoints
    const { data: stats, error, isLoading } = useSWR('/api/admin/stats', fetcher, {
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    if (error) return <div className="p-8 text-center text-destructive">Failed to load dashboard data. Please try again later.</div>;
    if (isLoading && !stats) return <PageLoader />;

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">System overview and management control center</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/settings')}>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                    <Button onClick={() => router.push('/admin/users/create')}>
                        <UserPlus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                </div>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.users.active} active, {stats?.users.pending} pending
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                        <Server className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.system.uptime}</div>
                        <p className="text-xs text-muted-foreground">Last restart: 14 days ago</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.system.responseTime}</div>
                        <p className="text-xs text-muted-foreground text-green-600">Optimal performance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Error Rate (24h)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.system.errors}</div>
                        <p className="text-xs text-muted-foreground">Low priority warnings</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Registration Demands - Occupies 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <RegistrationDemands />

                    {/* Recent Activity Feed */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest system events and audit logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.activity.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Shield className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{item.action}</p>
                                                <p className="text-xs text-muted-foreground">by {item.user}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(item.time, { addSuffix: true })}
                                        </span>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2" onClick={() => router.push('/admin/audit-logs')}>
                                    View Full Log
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Stats - Occupies 1 column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Administrative tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users')}>
                                <Users className="mr-2 h-4 w-4" /> Manage Users
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users/create')}>
                                <UserPlus className="mr-2 h-4 w-4" /> Add New User
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/audit-logs')}>
                                <Shield className="mr-2 h-4 w-4" /> Audit Logs
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/settings')}>
                                <Settings className="mr-2 h-4 w-4" /> System Settings
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/api/admin/backup')}>
                                <Database className="mr-2 h-4 w-4" /> Backup Database
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Storage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Database</span>
                                    <span className="font-medium">{stats?.system.dbSize}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[15%]" />
                                </div>
                                <div className="flex justify-between text-sm mt-4">
                                    <span className="text-muted-foreground">Assets</span>
                                    <span className="font-medium">4.5 GB</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[45%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
