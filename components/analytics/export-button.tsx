"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "sonner";

interface ExportButtonProps {
    data: any[];
    filename?: string;
    columns?: { header: string; key: string }[];
    title?: string;
}

export function ExportButton({ data, filename = "export", columns, title }: ExportButtonProps) {
    const handleExcelExport = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, `${filename}.xlsx`);
            toast.success("Excel exported successfully");
        } catch (error) {
            toast.error("Failed to export Excel");
        }
    };

    const handlePDFExport = () => {
        try {
            const doc = new jsPDF();
            if (title) {
                doc.setFontSize(16);
                doc.text(title, 14, 15);
            }

            const tableColumn = columns ? columns.map(c => c.header) : Object.keys(data[0] || {});
            const tableRows = data.map(row =>
                columns ? columns.map(c => row[c.key]) : Object.values(row)
            );

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: title ? 25 : 15,
            });

            doc.save(`${filename}.pdf`);
            toast.success("PDF exported successfully");
        } catch (error) {
            toast.error("Failed to export PDF");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExcelExport}>
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePDFExport}>
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
