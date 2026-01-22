"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IDeliveryTour, TourStatus, IDriver, IVehicle } from "@/types";
import { toursApi, TourFilters } from "@/lib/api/tours";
import { driversApi } from "@/lib/api/drivers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { DataTable } from "@/components/shared/DataTable";
import { TourStatusBadge } from "@/components/tours/tour-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";
import {
    Plus,
    Search,
    FileDown,
    Printer,
    Eye,
    Trash2,
    Filter,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    PlayCircle,
} from "lucide-react";

export default function ToursPage() {
    const router = useRouter();
    const [tours, setTours] = useState<IDeliveryTour[]>([]);
    const [drivers, setDrivers] = useState<IDriver[]>([]);
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState<TourFilters>({});
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [toursData, driversData, vehiclesData] = await Promise.all([
                toursApi.getAll(filters),
                driversApi.getAll(),
                vehiclesApi.getAll(),
            ]);
            setTours(toursData);
            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (error) {
            toast.error("Failed to load tours");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApplyFilters = () => {
        loadData();
    };

    const handleResetFilters = () => {
        setFilters({});
        setSearchQuery("");
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this tour?")) return;
        try {
            await toursApi.delete(id);
            toast.success("Tour deleted");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete tour");
        }
    };

    const handleExport = () => {
        const data = tours.map((t) => {
            const driver = t.driver as IDriver | undefined;
            const vehicle = t.vehicle as IVehicle | undefined;
            return {
                "Tour #": t.tourNumber,
                Date: formatDate(t.date),
                Driver: driver ? `${driver.firstName} ${driver.lastName}` : "-",
                Vehicle: vehicle ? `${vehicle.registrationNumber} (${vehicle.model})` : "-",
                Status: t.status,
                "Deliveries Completed": t.deliveriesCompleted,
                "Deliveries Failed": t.deliveriesFailed,
                "Shipments Count": t.shipments?.length || 0,
            };
        });
        exportToExcel(data, "tours");
    };

    // Stats calculations
    const stats = useMemo(() => {
        const planned = tours.filter((t) => t.status === TourStatus.PLANNED).length;
        const inProgress = tours.filter((t) => t.status === TourStatus.IN_PROGRESS).length;
        const completed = tours.filter((t) => t.status === TourStatus.COMPLETED).length;
        const cancelled = tours.filter((t) => t.status === TourStatus.CANCELLED).length;
        return { total: tours.length, planned, inProgress, completed, cancelled };
    }, [tours]);

    const columns: ColumnDef<IDeliveryTour>[] = [
        {
            accessorKey: "tourNumber",
            header: "Tour #",
            cell: ({ row }) => (
                <Button
                    variant="link"
                    className="font-mono font-bold p-0 h-auto"
                    onClick={() => router.push(`/agent/tours/${row.original._id}`)}
                >
                    {row.original.tourNumber}
                </Button>
            ),
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => formatDate(row.original.date),
        },
        {
            accessorKey: "driver",
            header: "Driver",
            cell: ({ row }) => {
                const driver = row.original.driver as IDriver;
                return driver ? `${driver.firstName} ${driver.lastName}` : "-";
            },
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle",
            cell: ({ row }) => {
                const vehicle = row.original.vehicle as IVehicle;
                return vehicle ? `${vehicle.registrationNumber}` : "-";
            },
        },
        {
            accessorKey: "shipments",
            header: "Shipments",
            cell: ({ row }) => row.original.shipments?.length || 0,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <TourStatusBadge status={row.original.status} size="sm" />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/agent/tours/${row.original._id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(row.original._id.toString())}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Tours Management</h1>
                    <p className="text-muted-foreground">Plan and track delivery tours</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => router.push("/agent/tours/create")}>
                        <Plus className="h-4 w-4 mr-2" /> Create Tour
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <FileDown className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button variant="outline" onClick={() => printTable()}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.planned}</p>
                                <p className="text-xs text-muted-foreground">Planned</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.inProgress}</p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.cancelled}</p>
                                <p className="text-xs text-muted-foreground">Cancelled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-2">
                    <button
                        className="flex items-center justify-between w-full"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                        {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </CardHeader>
                {filtersOpen && (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Search tour #..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    // You can add more complex filtering here if needed
                                }}
                            />
                            <Select
                                value={filters.driver || ""}
                                onValueChange={(v) => setFilters({ ...filters, driver: v || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Drivers" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Drivers</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d._id.toString()} value={d._id.toString()}>
                                            {d.firstName} {d.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.vehicle || ""}
                                onValueChange={(v) => setFilters({ ...filters, vehicle: v || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Vehicles" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Vehicles</SelectItem>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v._id.toString()} value={v._id.toString()}>
                                            {v.registrationNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status?.[0] || ""}
                                onValueChange={(v) => setFilters({ ...filters, status: v ? [v as TourStatus] : undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.values(TourStatus).map((s) => (
                                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleApplyFilters}>
                                <Search className="h-4 w-4 mr-2" /> Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleResetFilters}>
                                <RefreshCw className="h-4 w-4 mr-2" /> Reset
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>


            {/* Data Table */}
            <div id="tours-table">
                <DataTable
                    columns={columns}
                    data={tours}
                    searchKey="tourNumber"
                    loading={loading}
                />
            </div>
        </div>
    );
}
