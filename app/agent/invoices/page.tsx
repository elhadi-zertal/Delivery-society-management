"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IInvoice, IClient, InvoiceStatus } from "@/types";
import { invoicesApi, InvoiceFilters } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
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
    FileDown,
    Printer,
    Eye,
    CreditCard,
    Trash2,
    Filter,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    FileText,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Search,
} from "lucide-react";

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<IInvoice | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [invoicesData, clientsData] = await Promise.all([
                invoicesApi.getAll(filters),
                clientsApi.getAll(),
            ]);
            setInvoices(invoicesData);
            setClients(clientsData);
        } catch (error) {
            toast.error("Failed to load invoices");
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
            await invoicesApi.delete(deleteId);
            toast.success("Invoice deleted");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete invoice");
        } finally {
            setDeleteId(null);
        }
    };

    const handleExport = () => {
        const data = invoices.map((inv) => {
            const client = inv.client as IClient | undefined;
            return {
                "Invoice #": inv.invoiceNumber,
                Client: client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : "-",
                "Issue Date": formatDate(inv.issueDate),
                "Due Date": formatDate(inv.dueDate),
                "Amount HT": inv.amountHT,
                "TVA": inv.tvaAmount,
                "Total TTC": inv.totalTTC,
                "Paid": inv.amountPaid,
                "Balance": inv.amountDue,
                Status: inv.status,
            };
        });
        exportToExcel(data, "invoices");
    };

    // Stats
    const stats = useMemo(() => {
        const thisMonth = invoices.filter(
            (inv) => new Date(inv.issueDate).getMonth() === new Date().getMonth()
        );
        const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const outstanding = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
        return { count: thisMonth.length, totalBilled, totalPaid, outstanding };
    }, [invoices]);

    const columns: ColumnDef<IInvoice>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice #",
            cell: ({ row }) => (
                <Button
                    variant="link"
                    className="font-mono font-bold p-0 h-auto"
                    onClick={() => router.push(`/agent/invoices/${row.original._id}`)}
                >
                    {row.original.invoiceNumber}
                </Button>
            ),
        },
        {
            accessorKey: "issueDate",
            header: "Issue Date",
            cell: ({ row }) => formatDate(row.original.issueDate),
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => {
                const isOverdue = new Date(row.original.dueDate) < new Date() && row.original.amountDue > 0;
                return (
                    <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        {formatDate(row.original.dueDate)}
                    </span>
                );
            },
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
            accessorKey: "totalTTC",
            header: "Total",
            cell: ({ row }) => (
                <span className="font-semibold">{formatCurrency(row.original.totalTTC)}</span>
            ),
        },
        {
            accessorKey: "amountPaid",
            header: "Paid",
            cell: ({ row }) => (
                <span className="text-green-600">{formatCurrency(row.original.amountPaid)}</span>
            ),
        },
        {
            accessorKey: "amountDue",
            header: "Balance",
            cell: ({ row }) => (
                <span className={row.original.amountDue > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                    {formatCurrency(row.original.amountDue)}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} size="sm" />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/agent/invoices/${row.original._id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    {row.original.amountDue > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => setPaymentInvoice(row.original)}>
                            <CreditCard className="h-4 w-4" />
                        </Button>
                    )}
                    {row.original.status === InvoiceStatus.DRAFT && (
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(row.original._id.toString())}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Invoices Management</h1>
                    <p className="text-muted-foreground">Generate and manage client invoices</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => router.push("/agent/invoices/generate")}>
                        <Plus className="h-4 w-4 mr-2" /> Generate Invoice
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
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.count}</p>
                                <p className="text-xs text-muted-foreground">This Month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalBilled)}</p>
                                <p className="text-xs text-muted-foreground">Total Billed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                                <p className="text-xs text-muted-foreground">Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.outstanding)}</p>
                                <p className="text-xs text-muted-foreground">Outstanding</p>
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
                                placeholder="Search invoice #..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setFilters({ ...filters, invoiceNumber: e.target.value });
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
                                value={filters.status?.[0] || ""}
                                onValueChange={(v) => setFilters({ ...filters, status: v ? [v as InvoiceStatus] : undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.values(InvoiceStatus).map((s) => (
                                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={loadData} className="flex-1">
                                    <Search className="h-4 w-4 mr-2" /> Apply
                                </Button>
                                <Button variant="outline" onClick={() => { setFilters({}); setSearchQuery(""); loadData(); }}>
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
                data={invoices}
                searchKey="invoiceNumber"
                loading={loading}
            />

            {/* Modals */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Invoice"
                description="Are you sure you want to delete this draft invoice?"
                variant="destructive"
            />

            {paymentInvoice && (
                <RecordPaymentModal
                    isOpen={true}
                    onClose={() => setPaymentInvoice(null)}
                    invoice={paymentInvoice}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}
