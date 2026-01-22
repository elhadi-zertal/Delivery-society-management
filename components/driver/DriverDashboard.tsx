"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { IDeliveryTour, TourStatus } from "@/types";
import { 
    Truck, 
    Calendar, 
    MapPin, 
    Package, 
    ChevronRight, 
    LogOut, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatting";
import Link from "next/link";
import { toast } from "sonner";

export function DriverDashboardContent({ session }: { session: any }) {
    const [tours, setTours] = useState<IDeliveryTour[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response: any = await apiClient.driver.getTours();
                setTours(response.data || []);
            } catch (error) {
                toast.error("Failed to load your tours");
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const getStatusIcon = (status: TourStatus) => {
        switch (status) {
            case TourStatus.PLANNED: return <Clock className="h-4 w-4 text-blue-400" />;
            case TourStatus.IN_PROGRESS: return <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />;
            case TourStatus.COMPLETED: return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case TourStatus.CANCELLED: return <AlertCircle className="h-4 w-4 text-red-400" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: TourStatus) => {
        switch (status) {
            case TourStatus.PLANNED: return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Planned</Badge>;
            case TourStatus.IN_PROGRESS: return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>;
            case TourStatus.COMPLETED: return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Completed</Badge>;
            case TourStatus.CANCELLED: return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Cancelled</Badge>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-8 font-sans selection:bg-green-500/30">
            {/* Header */}
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                        <LayoutDashboard className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Driver Hub</h1>
                        <p className="text-sm text-zinc-500">{session?.user?.name || session?.user?.email}</p>
                    </div>
                </div>
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-full transition-all"
                    onClick={() => signOut({ redirectTo: "/signin-up" })}
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {/* Stats Overview (Static for now) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#111111] border-zinc-800/50 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Total Tours</p>
                                <p className="text-3xl font-bold text-zinc-100">{tours.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Truck className="h-6 w-6 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-zinc-800/50 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Active Now</p>
                                <p className="text-3xl font-bold text-green-500">{tours.filter(t => t.status === TourStatus.IN_PROGRESS).length}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                                <MapPin className="h-6 w-6 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-zinc-800/50 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Shipments</p>
                                <p className="text-3xl font-bold text-zinc-100">{tours.reduce((acc, t) => acc + (t.shipments?.length || 0), 0)}</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <Package className="h-6 w-6 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tours Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                             Your Assignments 
                            <span className="text-sm font-normal text-zinc-500 ml-2">({tours.length})</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="h-10 w-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                            <p className="text-zinc-500 animate-pulse">Scanning routes...</p>
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="bg-[#111111] border border-dashed border-zinc-800 rounded-3xl p-12 text-center space-y-4">
                            <div className="bg-zinc-900/50 p-4 rounded-full w-fit mx-auto">
                                <Truck className="h-10 w-10 text-zinc-700" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-zinc-200">No tours assigned</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">Check back later or contact your supervisor for new route assignments.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {tours.map((tour) => (
                                <Link 
                                    key={tour._id.toString()} 
                                    href={`/driver/tours/${tour._id}`}
                                    className="group block"
                                >
                                    <div className="bg-[#111111] hover:bg-[#161616] border border-zinc-800/50 hover:border-green-500/30 transition-all duration-300 p-5 rounded-3xl relative overflow-hidden">
                                        {/* Hover Gradient Effect */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-green-500/10 transition-colors" />
                                        
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                                            <div className="flex gap-5 items-start">
                                                <div className={`p-4 rounded-2xl ${
                                                    tour.status === TourStatus.IN_PROGRESS 
                                                        ? 'bg-green-500/20 text-green-500 border border-green-500/20' 
                                                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                                }`}>
                                                    <Truck className="h-7 w-7" />
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono text-zinc-500 tracking-wider">#{tour.tourNumber}</span>
                                                        {getStatusBadge(tour.status)}
                                                    </div>
                                                    <h3 className="text-lg font-bold group-hover:text-green-400 transition-colors">
                                                        {tour.plannedRoute.startLocation} → {tour.plannedRoute.endLocation}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {formatDate(tour.date)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 uppercase font-mono tracking-tighter text-xs">
                                                            <Truck className="h-3.5 w-3.5" />
                                                            {(tour.vehicle as any)?.registrationNumber || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Package className="h-3.5 w-3.5" />
                                                            {tour.shipments?.length || 0} shipments
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0">
                                                <div className="text-right hidden md:block px-4 border-r border-zinc-800">
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Progress</p>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-lg font-bold text-zinc-200">
                                                            {tour.deliveriesCompleted} / {tour.shipments?.length || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-zinc-900 group-hover:bg-green-500 group-hover:text-white rounded-full transition-all duration-300">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
