"use client";

import { useState, useEffect } from "react";
import { notificationsApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Trash2, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsApi.getNotifications();
            setNotifications(res.data);
        } catch (error) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("Marked all as read");
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Bell className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <Badge variant="secondary" className="ml-2">
                        {notifications.filter(n => !n.read).length} Unread
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleMarkAllRead}>
                        <Check className="mr-2 h-4 w-4" /> Mark all read
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : notifications.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        You're all caught up! No notifications.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card key={notification._id} className={notification.read ? "opacity-70" : "border-l-4 border-l-blue-500"}>
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold">{notification.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
