"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, Eye, MoreHorizontal, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IClient } from "@/types";
import { clientsApi } from "@/lib/api/clients";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientForm } from "@/components/clients/client-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";

export default function ClientsPage() {
    const [data, setData] = useState<IClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<IClient | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<IClient | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const clients = await clientsApi.getAll();
            setData(clients);
        } catch (error) {
            toast.error("Failed to fetch clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreate = () => {
        setEditingClient(null);
        setOpen(true);
    };

    const onEdit = (client: IClient) => {
        setEditingClient(client);
        setOpen(true);
    };

    const onDelete = (client: IClient) => {
        setClientToDelete(client);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await clientsApi.delete(clientToDelete._id.toString());
            toast.success("Client deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete client");
        } finally {
            setConfirmOpen(false);
            setClientToDelete(null);
        }
    };

    const onBulkDelete = async (selectedClients: IClient[]) => {
        if (!confirm("Are you sure you want to delete selected clients?")) return;
        try {
            await Promise.all(selectedClients.map(c => clientsApi.delete(c._id.toString())));
            toast.success("Clients deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some clients");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingClient) {
                await clientsApi.update(editingClient._id.toString(), values);
                toast.success("Client updated successfully");
            } else {
                await clientsApi.create(values);
                toast.success("Client created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const columns: ColumnDef<IClient>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => row.original.code || (row.original._id ? row.original._id.toString().substring(0, 6).toUpperCase() : "-"),
        },
        {
            accessorKey: "firstName",
            header: "Full Name",
            cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "accountBalance",
            header: "Balance",
            cell: ({ row }) => {
                const balance = parseFloat(row.getValue("accountBalance") || "0");
                return (
                    <span className={balance > 0 ? "text-red-500 font-bold" : "text-green-600"}>
                        {formatCurrency(balance)}
                    </span>
                );
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {row.original.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => formatDate(row.getValue("createdAt")),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const client = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(client)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleExport = (rows: IClient[]) => {
        exportToExcel(rows.map(r => ({
            Code: r.code,
            Name: `${r.firstName} ${r.lastName}`,
            Email: r.email,
            Phone: r.phone,
            Balance: r.accountBalance,
            Status: r.isActive ? 'Active' : 'Inactive'
        })), 'clients_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                    <p className="text-muted-foreground">
                        Manage your clients and their account details.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => printTable()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={onCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                searchKey="email"
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <ClientForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingClient}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Client"
                description={`Are you sure you want to delete ${clientToDelete?.firstName} ${clientToDelete?.lastName}?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
