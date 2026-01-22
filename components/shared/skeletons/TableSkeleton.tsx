
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
    columnCount?: number;
    rowCount?: number;
}

export function TableSkeleton({ columnCount = 5, rowCount = 8 }: TableSkeletonProps) {
    return (
        <div className="w-full border rounded-md p-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-8 w-[100px]" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columnCount }).map((_, i) => (
                                <TableHead key={i}><Skeleton className="h-6 w-full max-w-[100px]" /></TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rowCount }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: columnCount }).map((_, j) => (
                                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
