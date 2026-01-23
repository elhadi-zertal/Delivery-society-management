"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, Eye, MoreHorizontal, Printer, Truck } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IVehicle, VehicleStatus, VehicleType } from "@/types";
import { vehiclesApi } from "@/lib/api/vehicles";
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
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VehiclesContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<IVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<IVehicle | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const vehicles = await vehiclesApi.getAll();
            setData(vehicles);
        } catch (error) {
            toast.error("Failed to fetch vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (searchParams.get("add") === "true") {
            setOpen(true);
        }
    }, [searchParams]);

    const onCreate = () => {
        setEditingVehicle(null);
        setOpen(true);
    };

    const onEdit = (vehicle: IVehicle) => {
        setEditingVehicle(vehicle);
        setOpen(true);
    };

    const onDelete = (vehicle: IVehicle) => {
        setVehicleToDelete(vehicle);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;
        try {
            await vehiclesApi.delete(vehicleToDelete._id.toString());
            toast.success("Vehicle deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete vehicle");
        } finally {
            setConfirmOpen(false);
            setVehicleToDelete(null);
        }
    };

    const onBulkDelete = async (selectedVehicles: IVehicle[]) => {
        if (!confirm("Are you sure you want to delete selected vehicles?")) return;
        try {
            await Promise.all(selectedVehicles.map(v => vehiclesApi.delete(v._id.toString())));
            toast.success("Vehicles deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some vehicles");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingVehicle) {
                await vehiclesApi.update(editingVehicle._id.toString(), values);
                toast.success("Vehicle updated successfully");
            } else {
                await vehiclesApi.create(values);
                toast.success("Vehicle created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    // Status Badge Color Map
    const getStatusColor = (status: VehicleStatus) => {
        switch (status) {
            case VehicleStatus.AVAILABLE: return "bg-green-100 text-green-800";
            case VehicleStatus.IN_USE: return "bg-blue-100 text-blue-800";
            case VehicleStatus.MAINTENANCE: return "bg-orange-100 text-orange-800";
            case VehicleStatus.OUT_OF_SERVICE: return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    const columns: ColumnDef<IVehicle>[] = [
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
            accessorKey: "registrationNumber",
            header: "Reg. Number",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    {row.original.registrationNumber}
                </div>
            )
        },
        {
            accessorKey: "brand",
            header: "Make/Model",
            cell: ({ row }) => `${row.original.brand} ${row.original.model} (${row.original.year})`,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => <span className="uppercase text-xs">{row.original.type}</span>
        },
        {
            accessorKey: "capacity",
            header: "Capacity",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs text-muted-foreground">
                    <span>{row.original.capacity.weight} kg</span>
                    <span>{row.original.capacity.volume} m³</span>
                </div>
            )
        },
        {
            accessorKey: "mileage",
            header: "Mileage",
            cell: ({ row }) => `${row.original.mileage.toLocaleString()} km`
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(row.original.status)}`}>
                    {row.original.status?.replace('_', ' ')}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const vehicle = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(vehicle._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(vehicle)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleExport = (rows: IVehicle[]) => {
        exportToExcel(rows.map(r => ({
            Registration: r.registrationNumber,
            Make: `${r.brand} ${r.model}`,
            Year: r.year,
            Type: r.type,
            Weight: r.capacity.weight,
            Volume: r.capacity.volume,
            Status: r.status,
            Mileage: r.mileage
        })), 'vehicles_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
                    <p className="text-muted-foreground">
                        Manage your fleet vehicles and their maintenance.
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
                searchKey="registrationNumber"
                searchPlaceholder="Search by reg number..."
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <VehicleForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingVehicle}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Vehicle"
                description={`Are you sure you want to delete ${vehicleToDelete?.brand} ${vehicleToDelete?.model} (${vehicleToDelete?.registrationNumber})?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}

export default function VehiclesPage() {
    return (
        <Suspense fallback={<div>Loading vehicles...</div>}>
            <VehiclesContent />
        </Suspense>
    );
}
