"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { IDeliveryTour, IShipment, TourStatus, ShipmentStatus } from "@/types";
import { 
    ChevronLeft, 
    MapPin, 
    Package, 
    AlertTriangle, 
    MessageSquare, 
    GripVertical, 
    Navigation, 
    Phone,
    CheckCircle2,
    Clock,
    Truck,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatting";
import { TourShipmentList } from "./TourShipmentList";
import { IncidentReportModal } from "./IncidentReportModal";
import { ComplaintModal } from "./ComplaintModal";
import { ShipmentActionModal } from "./ShipmentActionModal";

export function DriverTourDetail() {
    const params = useParams();
    const router = useRouter();
    const [tour, setTour] = useState<IDeliveryTour | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null);

    const fetchTour = async () => {
        try {
            const response: any = await apiClient.tours.getById(params.id as string);
            setTour(response.data);
        } catch (error) {
            toast.error("Failed to load tour details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchTour();
    }, [params.id]);

    const handleReorder = (newShipments: IShipment[]) => {
        if (tour) {
            setTour({ ...tour, shipments: newShipments });
        }
    };

    const handleStartTour = async () => {
        if (!tour) return;
        try {
            const response: any = await apiClient.tours.start(tour._id.toString());
            setTour(response.data);
            toast.success("Tour started! You are now online.");
        } catch (error) {
            toast.error("Failed to start tour");
        }
    };

    const handleFinishTour = async () => {
        if (!tour) return;
        
        const shipments = tour.shipments as unknown as IShipment[];
        const deliveriesCompleted = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
        const deliveriesFailed = shipments.filter(s => s.status === ShipmentStatus.FAILED_DELIVERY).length;
        const remaining = shipments.filter(s => s.status === ShipmentStatus.PENDING).length;
        
        if (remaining > 0) {
            if (!confirm(`You still have ${remaining} pending shipments. Are you sure you want to finish and close the tour?`)) {
                return;
            }
        }

        try {
            const response: any = await apiClient.tours.complete(tour._id.toString(), {
                actualRoute: {
                    startTime: tour.actualRoute?.startTime || new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    actualDistance: tour.plannedRoute.estimatedDistance, // Use planned as fallback
                    actualDuration: tour.plannedRoute.estimatedDuration, // Use planned as fallback
                    fuelConsumed: 1, // Placeholder
                },
                deliveriesCompleted,
                deliveriesFailed,
                notes: `Tour completed with ${deliveriesCompleted} successful and ${deliveriesFailed} failed deliveries.`
            });
            setTour(response.data);
            toast.success("Tour completed and closed!");
            router.push('/driver/dashboard');
        } catch (error) {
            toast.error("Failed to finish tour");
        }
    };

    const handleShipmentAction = (shipment: IShipment) => {
        setSelectedShipment(shipment);
        setIsShipmentModalOpen(true);
    };

    const handleShipmentUpdate = (updatedShipment: IShipment) => {
        if (tour) {
            const shipments = tour.shipments as unknown as IShipment[];
            const newShipments = shipments.map(s => 
                s._id.toString() === updatedShipment._id.toString() ? updatedShipment : s
            );
            setTour({ ...tour, shipments: newShipments });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
                <p className="text-zinc-500">Tour not found</p>
                <Button variant="outline" onClick={() => router.push('/driver/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    const isPlanned = tour.status === TourStatus.PLANNED;
    const isInProgress = tour.status === TourStatus.IN_PROGRESS;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full hover:bg-zinc-800 h-10 w-10"
                        onClick={() => router.push('/driver/dashboard')}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Tour Assignment</span>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] py-0 h-4">#{tour.tourNumber}</Badge>
                        </div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-100">Manifest Summary</h1>
                    </div>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#111111] p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Vehicle</p>
                        <div className="flex items-center gap-2">
                            <Truck className="h-3.5 w-3.5 text-zinc-500" />
                            <p className="font-mono text-sm font-bold">{(tour.vehicle as any)?.registrationNumber || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-[#111111] p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Schedule</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            <p className="text-sm font-bold">{formatDate(tour.date)}</p>
                        </div>
                    </div>
                    <div className="bg-[#111111] p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Route Est.</p>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-green-500" />
                            <p className="text-sm font-bold font-mono">{tour.plannedRoute.estimatedDistance} <span className="text-[10px] text-zinc-500">KM</span></p>
                        </div>
                    </div>
                    <div className="bg-[#111111] p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Total Payload</p>
                        <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-purple-500" />
                            <p className="text-sm font-bold font-mono">{tour.shipments?.length || 0} <span className="text-[10px] text-zinc-500">STOPS</span></p>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="flex flex-wrap gap-3">
                    {isPlanned ? (
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 px-8 shadow-2xl shadow-green-600/20 text-md font-bold transition-all hover:scale-[1.02]"
                            onClick={handleStartTour}
                        >
                            <Navigation className="h-5 w-5 mr-3" />
                            Go Online / Start Route
                        </Button>
                    ) : isInProgress ? (
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-8 shadow-2xl shadow-blue-600/20 text-md font-bold transition-all hover:scale-[1.02]"
                            onClick={handleFinishTour}
                        >
                            <CheckCircle2 className="h-5 w-5 mr-3" />
                            Finish & Close Tour
                        </Button>
                    ) : (
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 h-14 px-8 rounded-2xl text-md font-bold">
                            Tour {tour.status.replace('_', ' ')}
                        </Badge>
                    )}
                    <Button 
                        variant="outline" 
                        className="border-zinc-800 bg-[#111111]/50 hover:bg-red-950/20 hover:border-red-500/30 rounded-2xl h-14 px-6 text-zinc-400 hover:text-red-400 transition-all"
                        onClick={() => setIsIncidentModalOpen(true)}
                    >
                        <AlertTriangle className="h-5 w-5 mr-3" />
                        Report Incident
                    </Button>
                    <Button 
                        variant="outline" 
                        className="border-zinc-800 bg-[#111111]/50 hover:bg-zinc-800 rounded-2xl h-14 px-6 text-zinc-400 transition-all"
                        onClick={() => setIsComplaintModalOpen(true)}
                    >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Submit Complaint
                    </Button>
                </div>

                <div className="h-px bg-zinc-900 w-full my-4" />

                {/* Shipments List */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <Package className="h-6 w-6 text-green-500" />
                                Sequence Flow
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">
                                {isPlanned ? "Optimize your delivery order by dragging stops" : "Deliveries in progress"}
                            </p>
                        </div>
                        {isPlanned && <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[10px] py-1">Manual Sort Enabled</Badge>}
                    </div>

                    <TourShipmentList 
                        shipments={tour.shipments as IShipment[]} 
                        tourId={tour._id.toString()}
                        onReorder={handleReorder}
                        onAction={handleShipmentAction}
                        isDraggable={isPlanned}
                    />
                </section>
            </div>

            {/* Modals */}
            <IncidentReportModal 
                isOpen={isIncidentModalOpen} 
                onClose={() => setIsIncidentModalOpen(false)}
                tourId={tour._id.toString()}
                vehicleId={typeof tour.vehicle === 'object' ? tour.vehicle._id.toString() : tour.vehicle}
            />
            <ComplaintModal 
                isOpen={isComplaintModalOpen} 
                onClose={() => setIsComplaintModalOpen(false)}
                tourId={tour._id.toString()}
            />
            <ShipmentActionModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                shipment={selectedShipment}
                onUpdate={handleShipmentUpdate}
            />
        </div>
    );
}
