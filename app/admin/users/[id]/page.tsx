"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User, Mail, Phone, Calendar, Shield, MapPin, Truck, AlertTriangle,
    MoreHorizontal, Loader2, ArrowLeft, UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchUser(params.id as string);
        }
    }, [params.id]);

    const fetchUser = async (id: string) => {
        try {
            // Note: need to implement getUser in adminApi or use existing
            // For now using a direct fetch or assuming existing hook
            const res = await fetch(`/api/users/${id}`);
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            setUser(data.data); // Assuming standarized API response format
        } catch (error) {
            console.error(error);
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">User Profile</h1>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="flex-1 w-full">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.photoUrl} />
                                <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                    <Badge variant={user.isActive ? "default" : "destructive"}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> {user.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> {user.phone}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                    <Calendar className="h-3 w-3" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline">Edit Profile</Button>
                                <Button variant="destructive" size="icon">
                                    <UserX className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {user.role === 'driver' && <TabsTrigger value="performance">Performance</TabsTrigger>}
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">User Role</span>
                                    <span className="font-medium capitalize">{user.role}</span>
                                </div>
                                {user.role === 'driver' && (
                                    <>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-muted-foreground">License Number</span>
                                            <span className="font-medium">{user.licenseNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-muted-foreground">License Type</span>
                                            <span className="font-medium">{user.licenseType || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Last Login</span>
                                    <span className="font-medium">
                                        {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions & Access</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Standard system access</span>
                                    </div>
                                    {user.role === 'admin' && (
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">User management</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">View analytics</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Actions performed by {user.firstName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                No recent activity found.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
