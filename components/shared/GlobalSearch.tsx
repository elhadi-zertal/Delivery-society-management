"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Search, Package, Command } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { searchApi } from "@/lib/api/admin";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<any>({ shipments: [], clients: [], users: [] });
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (query.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const res = await searchApi.globalSearch(query);
                    setResults(res.data);
                } catch (e) {
                    console.error(e);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen} className="bg-popover border shadow-2xl">
                <CommandInput placeholder="Type a command or search..." value={query} onValueChange={setQuery} />
                <CommandList className="bg-popover border-t">
                    <CommandEmpty>No results found.</CommandEmpty>

                    {/* Navigation Shortcuts */}
                    {!query && (
                        <CommandGroup heading="Suggestions">
                            <CommandItem onSelect={() => runCommand(() => router.push("/agent/dashboard"))}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/agent/shipments"))}>
                                <Package className="mr-2 h-4 w-4" />
                                <span>Shipments</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/agent/settings"))}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </CommandItem>
                        </CommandGroup>
                    )}

                    {/* Search Results */}
                    {results.shipments?.length > 0 && (
                        <CommandGroup heading="Shipments">
                            {results.shipments.map((s: any) => (
                                <CommandItem key={s._id} onSelect={() => runCommand(() => router.push(`/agent/shipments/${s._id}`))}>
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>{s.trackingNumber}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.clients?.length > 0 && (
                        <CommandGroup heading="Clients">
                            {results.clients.map((c: any) => (
                                <CommandItem key={c._id} onSelect={() => runCommand(() => router.push(`/agent/clients/${c._id}`))}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>{c.firstName} {c.lastName}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />
                    <CommandGroup heading="Global">
                        <CommandItem onSelect={() => runCommand(() => router.push(`/search?q=${query}`))}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Advanced Search for "{query}"</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
