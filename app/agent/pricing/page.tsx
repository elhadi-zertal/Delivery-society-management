"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, Eye, MoreHorizontal, Printer, Banknote } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { IPricing, IDestination, IServiceType } from "@/types";
import { pricingApi } from "@/lib/api/pricing";
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
import { PricingForm } from "@/components/pricing/pricing-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { exportToExcel, printTable } from "@/lib/utils/export";

export default function PricingPage() {
    const [data, setData] = useState<IPricing[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingPricing, setEditingPricing] = useState<IPricing | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pricingToDelete, setPricingToDelete] = useState<IPricing | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const pricing = await pricingApi.getAll();
            setData(pricing);
        } catch (error) {
            toast.error("Failed to fetch pricing");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreate = () => {
        setEditingPricing(null);
        setOpen(true);
    };

    const onEdit = (pricing: IPricing) => {
        setEditingPricing(pricing);
        setOpen(true);
    };

    const onDelete = (pricing: IPricing) => {
        setPricingToDelete(pricing);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!pricingToDelete) return;
        try {
            await pricingApi.delete(pricingToDelete._id.toString());
            toast.success("Pricing deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete pricing");
        } finally {
            setConfirmOpen(false);
            setPricingToDelete(null);
        }
    };

    const onBulkDelete = async (selectedPricing: IPricing[]) => {
        if (!confirm("Are you sure you want to delete selected pricing rules?")) return;
        try {
            await Promise.all(selectedPricing.map(p => pricingApi.delete(p._id.toString())));
            toast.success("Pricing rules deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete some pricing rules");
        }
    }

    const onSubmit = async (values: any) => {
        try {
            if (editingPricing) {
                await pricingApi.update(editingPricing._id.toString(), values);
                toast.success("Pricing rule updated successfully");
            } else {
                await pricingApi.create(values);
                toast.success("Pricing rule created successfully");
            }
            setOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const columns: ColumnDef<IPricing>[] = [
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
            accessorKey: "serviceType",
            header: "Service",
            cell: ({ row }) => {
                const service = row.original.serviceType as IServiceType;
                return service?.displayName || "Unknown";
            }
        },
        {
            accessorKey: "destination",
            header: "Destination",
            cell: ({ row }) => {
                const dest = row.original.destination as IDestination;
                return dest ? `${dest.city} (${dest.zone})` : "Unknown";
            }
        },
        {
            accessorKey: "rates",
            header: "Rates (Base/Kg/Vol/Min)",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs text-muted-foreground whitespace-nowrap">
                    <span>Base: {formatCurrency(row.original.baseRate)}</span>
                    <span>Kg: {formatCurrency(row.original.weightRate)}</span>
                    <span>Vol: {formatCurrency(row.original.volumeRate)}</span>
                    <span>Min: {formatCurrency(row.original.minCharge)}</span>
                </div>
            )
        },
        {
            accessorKey: "effectiveFrom",
            header: "Effective",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span>From: {formatDate(row.original.effectiveFrom)}</span>
                    {row.original.effectiveTo ? (
                        <span>To: {formatDate(row.original.effectiveTo)}</span>
                    ) : (
                        <span className="text-muted-foreground">Indefinite</span>
                    )}
                </div>
            )
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
                const pricing = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(pricing._id.toString())}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(pricing)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(pricing)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Flatten data for export
    const handleExport = (rows: IPricing[]) => {
        exportToExcel(rows.map(r => ({
            Service: (r.serviceType as IServiceType)?.displayName,
            Destination: `${(r.destination as IDestination)?.city} - ${(r.destination as IDestination)?.zone}`,
            BaseRate: r.baseRate,
            WeightRate: r.weightRate,
            VolumeRate: r.volumeRate,
            MinCharge: r.minCharge,
            EffectiveFrom: formatDate(r.effectiveFrom),
            Status: r.isActive ? 'Active' : 'Inactive'
        })), 'pricing_export');
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pricing Rules</h2>
                    <p className="text-muted-foreground">
                        Manage tariff rates for different routes and services.
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
                searchKey="baseRate"
                searchPlaceholder="Search pricing..."
                loading={loading}
                onDeleteSelected={onBulkDelete}
                onExport={handleExport}
            />

            <PricingForm
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                initialData={editingPricing}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Pricing Rule"
                description={`Are you sure you want to delete this pricing rule?`}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    );
}
