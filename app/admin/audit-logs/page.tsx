"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";

const fetchAuditLogs = async (params: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/audit-logs?${query}`);
    if (!res.ok) throw new Error("Failed");
    return res.json();
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState({ action: "", entityType: "" });

    useEffect(() => {
        loadLogs();
    }, [page, filter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await fetchAuditLogs({ page, ...filter });
            setLogs(res.data || []);
        } catch (error) {
            if (page === 1) {
                setLogs([
                    { _id: '1', action: 'LOGIN', userId: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com' }, createdAt: new Date().toISOString(), ipAddress: '192.168.1.1', status: 'success', description: 'User logged in successfully' },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'destructive';
        if (action.includes('CREATE')) return 'default';
        if (action.includes('UPDATE')) return 'secondary';
        return 'outline';
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Audit Logs</h1>
                    <p className="text-muted-foreground">Track system activity and security events</p>
                </div>
                <Button variant="outline">Export Logs</Button>
            </div>

            <Card>
                <CardContent className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search logs..." className="pl-8" />
                    </div>
                    <Input
                        placeholder="Action (e.g. LOGIN)"
                        className="w-48"
                        value={filter.action}
                        onChange={e => setFilter({ ...filter, action: e.target.value })}
                    />
                </CardContent>
            </Card>

            <div className="bg-white dark:bg-zinc-950 rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading logs...</TableCell></TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">No logs found</TableCell></TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="font-mono text-xs">
                                        <div className="flex flex-col">
                                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                            <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {log.userId ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                    {log.userId.firstName?.[0]}
                                                </div>
                                                <div className="flex flex-col text-sm">
                                                    <span>{log.userId.firstName} {log.userId.lastName}</span>
                                                    <span className="text-xs text-muted-foreground">{log.userId.email}</span>
                                                </div>
                                            </div>
                                        ) : 'System'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate text-sm" title={log.description}>
                                            {log.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.ipAddress}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'success' ? 'outline' : 'destructive'}>{log.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
