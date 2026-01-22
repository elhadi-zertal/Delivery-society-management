"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, Eye, MoreHorizontal, Printer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IDriver, DriverStatus } from "@/types";
import { driversApi } from "@/lib/api/drivers";
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
import { DriverForm } from "@/components/drivers/driver-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";

export default function DriversPage() {
    const [data, setData] = useState<IDriver[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<IDriver | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<IDriver | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const drivers = await driversApi.getAll();
            setData(drivers);
        } catch (error) {
            toast.error("Failed to fetch drivers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreate = () => {
        setEditingDriver(null);
        setOpen(true);
    };

    const onEdit = (driver: IDriver) => {
        setEditingDriver(driver);
        setOpen(true);
    };

    const onDelete = (driver: IDriver) => {
        setDriverToDelete(driver);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!driverToDelete) return;
        try {
            await driversApi.delete(driverToDelete._id.toString());
            toast.success("Driver deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete driver");
        } finally {
            setConfirmOpen(false);
            setDriverToDelete(null);
        }
    };

    const onBulkDelete = async (selectedDrivers: IDriver[]) => {
        if (!confirm("Are you sure you want to delete selected drivers?")) return;
        try {
            await Promise.all(selectedDrivers.map(d => driversApi.delete(d._id.toString())));
            toast.success("Drivers deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some drivers");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingDriver) {
                await driversApi.update(editingDriver._id.toString(), values);
                toast.success("Driver updated successfully");
            } else {
                await driversApi.create(values);
                toast.success("Driver created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const isLicenseExpiringSoon = (date: Date | string) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    // Status Badge Color Map
    const getStatusColor = (status: DriverStatus) => {
        switch (status) {
            case DriverStatus.AVAILABLE: return "bg-green-100 text-green-800";
            case DriverStatus.ON_TOUR: return "bg-blue-100 text-blue-800";
            case DriverStatus.OFF_DUTY: return "bg-gray-100 text-gray-800";
            case DriverStatus.ON_LEAVE: return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    const columns: ColumnDef<IDriver>[] = [
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
            accessorKey: "firstName",
            header: "Full Name",
            cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
        },
        {
            accessorKey: "email",
            header: "Contact",
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">{row.original.email}</span>
                    <span className="text-muted-foreground">{row.original.phone}</span>
                </div>
            )
        },
        {
            accessorKey: "licenseNumber",
            header: "License",
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">{row.original.licenseNumber}</span>
                    <span className="text-muted-foreground">Class {row.original.licenseType}</span>
                </div>
            )
        },
        {
            accessorKey: "licenseExpiry",
            header: "Expiry",
            cell: ({ row }) => {
                const expiry = row.original.licenseExpiry;
                const isExpiring = isLicenseExpiringSoon(expiry);
                return (
                    <div className={`flex items-center gap-2 ${isExpiring ? "text-orange-600 font-bold" : ""}`}>
                        {formatDate(expiry)}
                        {isExpiring && <AlertTriangle className="h-4 w-4" />}
                    </div>
                )
            }
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
            accessorKey: "totalToursCompleted",
            header: "Tours",
            cell: ({ row }) => row.original.totalToursCompleted || 0,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const driver = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(driver)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(driver)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleExport = (rows: IDriver[]) => {
        exportToExcel(rows.map(r => ({
            Name: `${r.firstName} ${r.lastName}`,
            Email: r.email,
            Phone: r.phone,
            License: r.licenseNumber,
            Expiry: formatDate(r.licenseExpiry),
            Status: r.status,
            Tours: r.totalToursCompleted || 0
        })), 'drivers_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                    <p className="text-muted-foreground">
                        Manage your fleet drivers and their licenses.
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
                searchKey="lastName"
                searchPlaceholder="Search by name..."
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <DriverForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingDriver}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Driver"
                description={`Are you sure you want to delete ${driverToDelete?.firstName} ${driverToDelete?.lastName}?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
