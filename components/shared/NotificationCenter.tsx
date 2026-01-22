"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationsApi } from "@/lib/api/admin";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Setup polling every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsApi.getNotifications();
            if (res.data) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter((n: any) => !n.read).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAllRead = async () => {
        try {
            await notificationsApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch (e) {
            toast.error("Failed to update notifications");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <Button variant="ghost" size="sm" className="h-auto text-xs" onClick={markAllRead}>
                        Mark all read
                    </Button>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem key={notification._id} className="cursor-pointer flex flex-col items-start gap-1 p-3">
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                    <span className="font-medium text-sm flex-1">{notification.title}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground pl-4 line-clamp-2">
                                    {notification.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center bg-muted/50 cursor-pointer" onClick={() => router.push('/notifications')}>
                    View All Notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
