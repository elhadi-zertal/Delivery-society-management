"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IComplaint, IClient, ComplaintStatus, ComplaintNature } from "@/types";
import { complaintsApi, ComplaintFilters } from "@/lib/api/complaints";
import { clientsApi } from "@/lib/api/clients";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ComplaintStatusBadge, ComplaintNatureBadge, PriorityBadge } from "@/components/complaints/complaint-status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";
import {
    Plus,
    FileDown,
    Printer,
    Eye,
    CheckCircle,
    Trash2,
    Filter,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    MessageSquare,
    Clock,
    Search,
    AlertCircle,
} from "lucide-react";

export default function ComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<IComplaint[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<ComplaintFilters>({});
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [complaintsData, clientsData] = await Promise.all([
                complaintsApi.getAll(filters),
                clientsApi.getAll(),
            ]);
            setComplaints(complaintsData);
            setClients(clientsData);
        } catch (error) {
            toast.error("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await complaintsApi.delete(deleteId);
            toast.success("Complaint deleted");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete complaint");
        } finally {
            setDeleteId(null);
        }
    };

    const handleExport = () => {
        const data = complaints.map((c) => {
            const client = c.client as IClient | undefined;
            return {
                "Complaint #": c.complaintNumber,
                Client: client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : "-",
                Type: c.nature,
                Priority: c.priority,
                Status: c.status,
                Description: c.description.substring(0, 100),
                "Created": formatDateTime(c.createdAt),
            };
        });
        exportToExcel(data, "complaints");
    };

    // Stats
    const stats = useMemo(() => {
        const open = complaints.filter((c) => c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CANCELLED).length;
        const resolved = complaints.filter((c) => c.status === ComplaintStatus.RESOLVED).length;
        const urgent = complaints.filter((c) => c.priority === "urgent" || c.priority === "high").length;
        return { total: complaints.length, open, resolved, urgent };
    }, [complaints]);

    const columns: ColumnDef<IComplaint>[] = [
        {
            accessorKey: "complaintNumber",
            header: "Complaint #",
            cell: ({ row }) => (
                <Button
                    variant="link"
                    className="font-mono font-bold p-0 h-auto"
                    onClick={() => router.push(`/agent/complaints/${row.original._id}`)}
                >
                    {row.original.complaintNumber}
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
            accessorKey: "nature",
            header: "Type",
            cell: ({ row }) => <ComplaintNatureBadge nature={row.original.nature} size="sm" />,
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => <PriorityBadge priority={row.original.priority} size="sm" />,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <span className="truncate max-w-[150px] block" title={row.original.description}>
                    {row.original.description.substring(0, 40)}...
                </span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <ComplaintStatusBadge status={row.original.status} size="sm" />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/agent/complaints/${row.original._id}`)}>
                        <Eye className="h-4 w-4" />
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
                    <h1 className="text-3xl font-bold">Customer Complaints</h1>
                    <p className="text-muted-foreground">Manage and resolve customer complaints</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => router.push("/agent/complaints/create")}>
                        <Plus className="h-4 w-4 mr-2" /> Register Complaint
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
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
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className={`text-2xl font-bold ${stats.open > 0 ? "text-orange-600" : ""}`}>{stats.open}</p>
                                <p className="text-xs text-muted-foreground">Open</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                                <p className="text-xs text-muted-foreground">Resolved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className={`text-2xl font-bold ${stats.urgent > 0 ? "text-red-600" : ""}`}>{stats.urgent}</p>
                                <p className="text-xs text-muted-foreground">High Priority</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                value={filters.nature || ""}
                                onValueChange={(v) => setFilters({ ...filters, nature: v as ComplaintNature || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    {Object.values(ComplaintNature).map((n) => (
                                        <SelectItem key={n} value={n}>{n.replace(/_/g, " ").toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.priority || ""}
                                onValueChange={(v) => setFilters({ ...filters, priority: v || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status?.[0] || ""}
                                onValueChange={(v) => setFilters({ ...filters, status: v ? [v as ComplaintStatus] : undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.values(ComplaintStatus).map((s) => (
                                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={loadData} className="flex-1">
                                    <Search className="h-4 w-4 mr-2" /> Apply
                                </Button>
                                <Button variant="outline" onClick={() => { setFilters({}); loadData(); }}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={complaints}
                searchKey="complaintNumber"
                loading={loading}
            />

            {/* Modals */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Complaint"
                description="Are you sure you want to delete this complaint?"
                variant="destructive"
            />
        </div>
    );
}
