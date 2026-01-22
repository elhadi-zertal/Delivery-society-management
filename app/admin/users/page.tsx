"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Mail,
    Phone,
    Shield,
    MoreHorizontal,
    Filter,
    Download
} from "lucide-react";
import { toast } from "sonner";

import { fetcher } from "@/lib/api/swr-fetcher";
import { DataTable } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    photoUrl?: string;
    createdAt: string;
}

export default function UserManagementPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const { data: usersData, error, isLoading, mutate } = useSWR<{ data: User[] }>(
        `/api/users?role=${roleFilter === 'all' ? '' : roleFilter}&status=${statusFilter === 'all' ? '' : statusFilter}`,
        fetcher
    );

    const users = usersData?.data || [];

    const filteredUsers = users.filter((u: User) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase())
    );

    const handleSearch = () => {
        mutate();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Admin</Badge>;
            case 'agent': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Agent</Badge>;
            case 'driver': return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Driver</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getStatusBadge = (user: User) => {
        if (!user.isActive) return <Badge variant="outline" className="text-gray-500 border-gray-500">Inactive</Badge>;
        return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Active</Badge>;
    };

    const handleBulkAction = (action: string) => {
        toast.info(`Bulk ${action} for ${selectedUsers.length} users (Not implemented)`);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) setSelectedUsers([]);
        else setSelectedUsers(users.map((u: User) => u._id));
    };

    const toggleSelectUser = (id: string) => {
        if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        else setSelectedUsers([...selectedUsers, id]);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage system access and roles</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export Users</Button>
                    <Button onClick={() => router.push('/admin/users/create')}>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{users.filter((u: User) => u.isActive).length}</div>
                        <p className="text-xs text-muted-foreground">Active Users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{users.filter((u: User) => u.role === 'agent').length}</div>
                        <p className="text-xs text-muted-foreground">Agents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{users.filter((u: User) => u.role === 'driver').length}</div>
                        <p className="text-xs text-muted-foreground">Drivers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Users Table */}
            {isLoading ? (
                <TableSkeleton columnCount={5} rowCount={8} />
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    title="No users found"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={{
                        label: "Clear Filters",
                        onClick: () => {
                            setSearch("");
                            setRoleFilter("all");
                            setStatusFilter("all");
                        }
                    }}
                />
            ) : (
                <DataTable
                    data={filteredUsers}
                    columns={[
                        {
                            header: "User", accessorKey: "email", cell: ({ row }) => {
                                const user = row.original;
                                return (
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.photoUrl} />
                                            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                );
                            }
                        },
                        { header: "Role", accessorKey: "role", cell: ({ row }) => getRoleBadge(row.original.role) },
                        { header: "Status", accessorKey: "isActive", cell: ({ row }) => getStatusBadge(row.original) },
                        { header: "Joined", accessorKey: "createdAt", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
                    ]}
                    onRowClick={(user: User) => router.push(`/admin/users/${user._id}`)}
                    mobileRenderer={(user: User) => (
                        <div className="flex flex-col gap-2 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                {getRoleBadge(user.role)}
                            </div>
                            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge(user)}
                            </div>
                        </div>
                    )}
                />
            )}
        </div>
    );
}
