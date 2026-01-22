"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IPayment, IInvoice, IClient, PaymentMethod } from "@/types";
import { paymentsApi, PaymentFilters } from "@/lib/api/payments";
import { clientsApi } from "@/lib/api/clients";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";
import {
    FileDown,
    Printer,
    Eye,
    Filter,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    DollarSign,
    CreditCard,
    Banknote,
    Building,
    Calendar,
    Search,
} from "lucide-react";

const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
    [PaymentMethod.CASH]: Banknote,
    [PaymentMethod.BANK_TRANSFER]: Building,
    [PaymentMethod.CHECK]: CreditCard,
    [PaymentMethod.CARD]: CreditCard,
};

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<PaymentFilters>({});

    const loadData = async () => {
        setLoading(true);
        try {
            const [paymentsData, clientsData] = await Promise.all([
                paymentsApi.getAll(filters),
                clientsApi.getAll(),
            ]);
            setPayments(paymentsData);
            setClients(clientsData);
        } catch (error) {
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExport = () => {
        const data = payments.map((p) => {
            const client = p.client as IClient | undefined;
            const invoice = p.invoice as IInvoice | undefined;
            return {
                "Receipt #": p.paymentNumber,
                Date: formatDate(p.paymentDate),
                Client: client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : "-",
                Invoice: invoice?.invoiceNumber || "-",
                Amount: p.amount,
                Method: p.paymentMethod.replace(/_/g, " "),
                Reference: p.reference || "-",
            };
        });
        exportToExcel(data, "payments");
    };

    // Stats
    const stats = useMemo(() => {
        const thisMonth = payments.filter(
            (p) => new Date(p.paymentDate).getMonth() === new Date().getMonth()
        );
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        const today = payments.filter(
            (p) => new Date(p.paymentDate).toDateString() === new Date().toDateString()
        );
        const todayTotal = today.reduce((sum, p) => sum + p.amount, 0);
        const avg = payments.length > 0 ? total / payments.length : 0;
        return { count: thisMonth.length, total, todayTotal, avg };
    }, [payments]);

    const columns: ColumnDef<IPayment>[] = [
        {
            accessorKey: "paymentNumber",
            header: "Receipt #",
            cell: ({ row }) => (
                <span className="font-mono font-medium">{row.original.paymentNumber}</span>
            ),
        },
        {
            accessorKey: "paymentDate",
            header: "Date",
            cell: ({ row }) => formatDate(row.original.paymentDate),
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
            accessorKey: "invoice",
            header: "Invoice",
            cell: ({ row }) => {
                const invoice = row.original.invoice as IInvoice;
                return invoice ? (
                    <Button
                        variant="link"
                        className="p-0 h-auto font-mono"
                        onClick={() => router.push(`/agent/invoices/${invoice._id}`)}
                    >
                        {invoice.invoiceNumber}
                    </Button>
                ) : "-";
            },
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <span className="font-bold text-green-600">{formatCurrency(row.original.amount)}</span>
            ),
        },
        {
            accessorKey: "paymentMethod",
            header: "Method",
            cell: ({ row }) => {
                const Icon = paymentMethodIcons[row.original.paymentMethod];
                return (
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Icon className="h-4 w-4" />
                        {row.original.paymentMethod.replace(/_/g, " ")}
                    </span>
                );
            },
        },
        {
            accessorKey: "reference",
            header: "Reference",
            cell: ({ row }) => row.original.reference || "-",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const invoice = row.original.invoice as IInvoice;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => invoice && router.push(`/agent/invoices/${invoice._id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Payments Journal</h1>
                    <p className="text-muted-foreground">Track all payment transactions</p>
                </div>
                <div className="flex gap-2 flex-wrap">
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
                            <Calendar className="h-5 w-5 text-blue-500" />
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
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total)}</p>
                                <p className="text-xs text-muted-foreground">Total Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(stats.todayTotal)}</p>
                                <p className="text-xs text-muted-foreground">Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(stats.avg)}</p>
                                <p className="text-xs text-muted-foreground">Average</p>
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
                                value={filters.paymentMethod || ""}
                                onValueChange={(v) => setFilters({ ...filters, paymentMethod: v as PaymentMethod || undefined })}
                            >
                                <SelectTrigger><SelectValue placeholder="All Methods" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Methods</SelectItem>
                                    {Object.values(PaymentMethod).map((m) => (
                                        <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                placeholder="From date"
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                            />
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
                data={payments}
                searchKey="paymentNumber"
                loading={loading}
            />
        </div>
    );
}
