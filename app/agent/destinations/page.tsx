"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, Eye, MoreHorizontal, Printer, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IDestination } from "@/types";
import { destinationsApi } from "@/lib/api/destinations";
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
import { DestinationForm } from "@/components/destinations/destination-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";

export default function DestinationsPage() {
    const [data, setData] = useState<IDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingDestination, setEditingDestination] = useState<IDestination | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [destinationToDelete, setDestinationToDelete] = useState<IDestination | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const destinations = await destinationsApi.getAll();
            setData(destinations);
        } catch (error) {
            toast.error("Failed to fetch destinations");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreate = () => {
        setEditingDestination(null);
        setOpen(true);
    };

    const onEdit = (destination: IDestination) => {
        setEditingDestination(destination);
        setOpen(true);
    };

    const onDelete = (destination: IDestination) => {
        setDestinationToDelete(destination);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!destinationToDelete) return;
        try {
            await destinationsApi.delete(destinationToDelete._id.toString());
            toast.success("Destination deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete destination");
        } finally {
            setConfirmOpen(false);
            setDestinationToDelete(null);
        }
    };

    const onBulkDelete = async (selectedDestinations: IDestination[]) => {
        if (!confirm("Are you sure you want to delete selected destinations?")) return;
        try {
            await Promise.all(selectedDestinations.map(d => destinationsApi.delete(d._id.toString())));
            toast.success("Destinations deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some destinations");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingDestination) {
                await destinationsApi.update(editingDestination._id.toString(), values);
                toast.success("Destination updated successfully");
            } else {
                await destinationsApi.create(values);
                toast.success("Destination created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const columns: ColumnDef<IDestination>[] = [
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
            cell: ({ row }) => row.original.code || "-",
        },
        {
            accessorKey: "city",
            header: "City",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {row.original.city}, {row.original.country}
                </div>
            )
        },
        {
            accessorKey: "zone",
            header: "Zone",
        },
        {
            accessorKey: "postalCodeRange",
            header: "PC Range",
            cell: ({ row }) => {
                const range = row.original.postalCodeRange;
                if (!range || (!range.from && !range.to)) return <span className="text-muted-foreground text-xs">N/A</span>;
                return <span className="text-xs">{range.from} - {range.to}</span>
            }
        },
        {
            accessorKey: "baseRate",
            header: "Base Rate",
            cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.baseRate)}</span>
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
            id: "actions",
            cell: ({ row }) => {
                const destination = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(destination._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(destination)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(destination)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleExport = (rows: IDestination[]) => {
        exportToExcel(rows.map(r => ({
            Code: r.code,
            City: r.city,
            Country: r.country,
            Zone: r.zone,
            "PC Range": r.postalCodeRange ? `${r.postalCodeRange.from}-${r.postalCodeRange.to}` : '',
            "Base Rate": r.baseRate,
            Status: r.isActive ? 'Active' : 'Inactive'
        })), 'destinations_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Destinations</h2>
                    <p className="text-muted-foreground">
                        Manage shipping destinations and zones.
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
                searchKey="city"
                searchPlaceholder="Search city..."
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <DestinationForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingDestination}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Destination"
                description={`Are you sure you want to delete ${destinationToDelete?.city} (${destinationToDelete?.zone})?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
