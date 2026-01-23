"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, MoreHorizontal, Printer, Cog } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IServiceType } from "@/types";
import { serviceTypesApi } from "@/lib/api/service-types";
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
import { ServiceTypeForm } from "@/components/service-types/service-type-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { exportToExcel, printTable } from "@/lib/utils/export";

export default function ServiceTypesPage() {
    const [data, setData] = useState<IServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingServiceType, setEditingServiceType] = useState<IServiceType | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [serviceTypeToDelete, setServiceTypeToDelete] = useState<IServiceType | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const serviceTypes = await serviceTypesApi.getAll();
            setData(serviceTypes);
        } catch (error) {
            toast.error("Failed to fetch service types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreate = () => {
        setEditingServiceType(null);
        setOpen(true);
    };

    const onEdit = (serviceType: IServiceType) => {
        setEditingServiceType(serviceType);
        setOpen(true);
    };

    const onDelete = (serviceType: IServiceType) => {
        setServiceTypeToDelete(serviceType);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceTypeToDelete) return;
        try {
            await serviceTypesApi.delete(serviceTypeToDelete._id.toString());
            toast.success("Service type deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete service type");
        } finally {
            setConfirmOpen(false);
            setServiceTypeToDelete(null);
        }
    };

    const onBulkDelete = async (selectedServiceTypes: IServiceType[]) => {
        if (!confirm("Are you sure you want to delete selected service types?")) return;
        try {
            await Promise.all(selectedServiceTypes.map(s => serviceTypesApi.delete(s._id.toString())));
            toast.success("Service types deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some service types");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingServiceType) {
                await serviceTypesApi.update(editingServiceType._id.toString(), values);
                toast.success("Service type updated successfully");
            } else {
                await serviceTypesApi.create(values);
                toast.success("Service type created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const columns: ColumnDef<IServiceType>[] = [
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
            accessorKey: "displayName",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <Cog className="h-4 w-4 text-muted-foreground" />
                    {row.original.displayName}
                </div>
            )
        },
        {
            accessorKey: "name",
            header: "Code",
            cell: ({ row }) => <span className="uppercase text-xs font-mono bg-muted px-1 rounded">{row.original.name}</span>
        },
        {
            accessorKey: "estimatedDeliveryDays",
            header: "Est. Delivery",
            cell: ({ row }) => `${row.original.estimatedDeliveryDays.min}-${row.original.estimatedDeliveryDays.max} days`
        },
        {
            accessorKey: "multiplier",
            header: "Multiplier",
            cell: ({ row }) => `x${row.original.multiplier.toFixed(2)}`
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
                const serviceType = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(serviceType._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(serviceType)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(serviceType)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleExport = (rows: IServiceType[]) => {
        exportToExcel(rows.map(r => ({
            Name: r.displayName,
            Code: r.name,
            "Min Days": r.estimatedDeliveryDays.min,
            "Max Days": r.estimatedDeliveryDays.max,
            Multiplier: r.multiplier,
            Status: r.isActive ? 'Active' : 'Inactive'
        })), 'service_types_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Service Types</h2>
                    <p className="text-muted-foreground">
                        Configure different service levels and multipliers.
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
                searchKey="displayName"
                searchPlaceholder="Search service types..."
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <ServiceTypeForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingServiceType}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Service Type"
                description={`Are you sure you want to delete ${serviceTypeToDelete?.displayName}?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
