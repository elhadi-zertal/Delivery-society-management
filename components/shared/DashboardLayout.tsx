
"use client";

import { Sidebar, MobileNav } from "@/components/shared/Navigation";
import { AppErrorBoundary } from "@/components/shared/ErrorBoundary";
import { KeyboardShortcuts } from "@/components/shared/KeyboardShortcuts";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/20">
            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300",
                isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                <MobileNav />
                {/* Top Header for Desktop */}
                <header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-background sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
                    <div className="flex items-center gap-4 w-1/3">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <Link href="/profile">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <AppErrorBoundary>
                        {children}
                    </AppErrorBoundary>
                </main>

                <KeyboardShortcuts />
            </div>
        </div>
    );
}
