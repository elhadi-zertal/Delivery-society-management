
"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Command, ExternalLink, Search, Save, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function KeyboardShortcuts() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const shortcuts = [
        { key: "⌘ K", description: "Open Global Search", icon: Search },
        { key: "⌘ S", description: "Save Changes", icon: Save },
        { key: "⌘ /", description: "Toggle Shortcuts", icon: Command },
        { key: "Esc", description: "Close Modals", icon: X },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Command className="h-5 w-5" /> Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Maximize your productivity with these shortcuts.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {shortcuts.map((shortcut) => (
                        <div key={shortcut.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md">
                                    <shortcut.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">{shortcut.description}</span>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                                {shortcut.key}
                            </Badge>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center text-xs text-muted-foreground mt-2">
                    Press <span className="font-mono bg-muted px-1 rounded mx-1">⌘ ?</span> to toggle this menu
                </div>
            </DialogContent>
        </Dialog>
    );
}
