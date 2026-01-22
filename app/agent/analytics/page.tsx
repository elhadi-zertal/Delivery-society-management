"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    PieChart, BarChart, TrendingUp, CreditCard, Activity,
    ArrowRight, Map, Settings
} from "lucide-react";

const dashboards = [
    {
        title: "Commercial Analytics",
        description: "Revenue, shipments, clients, and destinations analysis",
        href: "/agent/analytics/commercial",
        icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
        color: "bg-blue-50"
    },
    {
        title: "Operational Analytics",
        description: "Fleet, drivers, tours, and delivery success metrics",
        href: "/agent/analytics/operational",
        icon: <Activity className="h-8 w-8 text-green-500" />,
        color: "bg-green-50"
    },
    {
        title: "Financial Reports",
        description: "Cash flow, aging, payments, and profitability",
        href: "/agent/analytics/financial",
        icon: <CreditCard className="h-8 w-8 text-purple-500" />,
        color: "bg-purple-50"
    }
];

export default function AnalyticsHubPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight">Business Intelligence Hub</h1>
                <p className="text-xl text-muted-foreground">
                    Comprehensive insights into your transport operations to drive data-driven decisions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {dashboards.map((dash) => (
                    <Card key={dash.title} className="hover:shadow-lg transition-shadow cursor-pointer border-t-4"
                        onClick={() => router.push(dash.href)}
                    >
                        <CardHeader className="space-y-4">
                            <div className={`w-16 h-16 rounded-2xl ${dash.color} flex items-center justify-center`}>
                                {dash.icon}
                            </div>
                            <CardTitle className="text-xl">{dash.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CardDescription className="text-base">{dash.description}</CardDescription>
                            <Button variant="ghost" className="w-full justify-between group">
                                View Dashboard
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Custom Reporting</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Need a specific report? Use our custom report builder to generate tailored datasets and visualizations.
                </p>
                <Button onClick={() => router.push('/agent/analytics/custom')} variant="outline" size="lg">
                    <Settings className="h-4 w-4 mr-2" />
                    Open Report Builder
                </Button>
            </div>
        </div>
    );
}
