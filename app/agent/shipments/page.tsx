"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IShipment, ShipmentStatus, IClient, IDestination, IServiceType } from "@/types";
import { shipmentsApi, ShipmentFilters } from "@/lib/api/shipments";
import { clientsApi } from "@/lib/api/clients";
import { destinationsApi } from "@/lib/api/destinations";
import { serviceTypesApi } from "@/lib/api/service-types";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { UpdateStatusModal } from "@/components/shipments/update-status-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";
import {
    Plus,
    Search,
    FileDown,
    Printer,
    Eye,
    Pencil,
    Trash2,
    Navigation,
    Filter,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Package,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";

import { Suspense } from "react";

function ShipmentsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [destinations, setDestinations] = useState<IDestination[]>([]);
    const [serviceTypes, setServiceTypes] = useState<IServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState<ShipmentFilters>({});
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{ shipmentId: string; status: ShipmentStatus } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [shipmentsData, clientsData, destinationsData, serviceTypesData] = await Promise.all([
                shipmentsApi.getAll(filters),
                clientsApi.getAll(),
                destinationsApi.getAll(),
                serviceTypesApi.getAll(),
            ]);
            setShipments(shipmentsData);
            setClients(clientsData);
            setDestinations(destinationsData);
            setServiceTypes(serviceTypesData);
        } catch (error) {
            toast.error("Failed to load shipments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        if (searchParams.get("add") === "true") {
            router.push("/agent/shipments/create");
        }
    }, [searchParams]);

    const handleApplyFilters = () => {
        loadData();
    };

    const handleResetFilters = () => {
        setFilters({});
        setSearchQuery("");
        loadData();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await shipmentsApi.delete(deleteId);
            toast.success("Shipment deleted");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete shipment");
        } finally {
            setDeleteId(null);
        }
    };

    const handleExport = () => {
        const data = shipments.map((s) => {
            const client = s.client as IClient | undefined;
            const destination = s.destination as IDestination | undefined;
            const serviceType = s.serviceType as IServiceType | undefined;
            return {
                "Tracking #": s.shipmentNumber,
                Client: client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : "-",
                Destination: destination?.city && destination?.country ? `${destination.city}, ${destination.country}` : "-",
                Service: serviceType?.displayName || "-",
                "Weight (kg)": s.totalWeight,
                "Volume (m³)": s.totalVolume,
                Amount: s.totalAmount,
                Status: s.status,
                "Created Date": formatDate(s.createdAt),
            };
        });
        exportToExcel(data, "shipments");
    };

    // Stats calculations
    const stats = useMemo(() => {
        const pending = shipments.filter((s) => s.status === ShipmentStatus.PENDING).length;
        const inTransit = shipments.filter((s) => [ShipmentStatus.IN_TRANSIT, ShipmentStatus.PICKED_UP, ShipmentStatus.AT_SORTING_CENTER].includes(s.status)).length;
        const delivered = shipments.filter((s) => s.status === ShipmentStatus.DELIVERED).length;
        const failed = shipments.filter((s) => s.status === ShipmentStatus.FAILED_DELIVERY).length;
        return { total: shipments.length, pending, inTransit, delivered, failed };
    }, [shipments]);

    const columns: ColumnDef<IShipment>[] = [
        {
            accessorKey: "shipmentNumber",
            header: "Tracking #",
            cell: ({ row }) => (
                <Button
                    variant="link"
                    className="font-mono font-bold p-0 h-auto"
                    onClick={() => router.push(`/agent/shipments/${row.original._id}`)}
                >
                    {row.original.shipmentNumber}
                </Button>
            ),
        },
        {
            accessorKey: "client",
            header: "Client",
            cell: ({ row }) => {
                const client = row.original.client as IClient;
                return client ? `${client.firstName} ${client.lastName}` : "-";
            },
        },
        {
            accessorKey: "destination",
            header: "Destination",
            cell: ({ row }) => {
                const dest = row.original.destination as IDestination;
                return dest ? `${dest.city}, ${dest.country}` : "-";
            },
        },
        {
            accessorKey: "serviceType",
            header: "Service",
            cell: ({ row }) => {
                const st = row.original.serviceType as IServiceType;
                return st ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                        {st.displayName}
                    </span>
                ) : "-";
            },
        },
        {
            accessorKey: "totalWeight",
            header: "Weight",
            cell: ({ row }) => `${row.original.totalWeight} kg`,
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => formatCurrency(row.original.totalAmount),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} size="sm" />,
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/agent/shipments/${row.original._id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setStatusModal({ shipmentId: row.original._id.toString(), status: row.original.status })}>
                        <Navigation className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(row.original._id.toString())}>
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
                    <h1 className="text-3xl font-bold">Shipments Management</h1>
                    <p className="text-muted-foreground">Track and manage all package deliveries</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => router.push("/agent/shipments/create")}>
                        <Plus className="h-4 w-4 mr-2" /> Create Shipment
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
                            <Package className="h-5 w-5 text-muted-foreground" />
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
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.inTransit}</p>
                                <p className="text-xs text-muted-foreground">In Transit</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.delivered}</p>
                                <p className="text-xs text-muted-foreground">Delivered</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.failed}</p>
                                <p className="text-xs text-muted-foreground">Failed</p>
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
                                placeholder="Search tracking #..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setFilters({ ...filters, trackingNumber: e.target.value });
                                }}
                            />
                            <Select
                                value={filters.clientId || ""}
                                onValueChange={(v) => setFilters({ ...filters, clientId: v || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Clients" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Clients</SelectItem>
                                    {clients.map((c) => (
                                        <SelectItem key={c._id.toString()} value={c._id.toString()}>
                                            {c.firstName} {c.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.destinationId || ""}
                                onValueChange={(v) => setFilters({ ...filters, destinationId: v || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Destinations" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Destinations</SelectItem>
                                    {destinations.map((d) => (
                                        <SelectItem key={d._id.toString()} value={d._id.toString()}>
                                            {d.city}, {d.country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status?.[0] || ""}
                                onValueChange={(v) => setFilters({ ...filters, status: v ? [v as ShipmentStatus] : undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.values(ShipmentStatus).map((s) => (
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
            <div id="shipments-table">
                <DataTable
                    columns={columns}
                    data={shipments}
                    searchKey="shipmentNumber"
                    loading={loading}
                />
            </div>

            {/* Modals */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Shipment"
                description="Are you sure you want to delete this shipment? This action cannot be undone."
                variant="destructive"
            />

            {statusModal && (
                <UpdateStatusModal
                    isOpen={true}
                    onClose={() => setStatusModal(null)}
                    shipmentId={statusModal.shipmentId}
                    currentStatus={statusModal.status}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}

export default function ShipmentsPage() {
    return (
        <Suspense fallback={<div>Loading shipments...</div>}>
            <ShipmentsContent />
        </Suspense>
    );
}
