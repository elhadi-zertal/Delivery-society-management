"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchApi } from "@/lib/api/admin";
import { Loader2, Search as SearchIcon, Package, Users, Truck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await searchApi.globalSearch(q);
            setResults(res.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold">Advanced Search</h1>

            <form onSubmit={onSubmit} className="flex gap-4">
                <Input
                    placeholder="Search for shipments, clients, drivers, tours..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="max-w-xl"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />}
                    Search
                </Button>
            </form>

            {results && (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All Results ({results.total})</TabsTrigger>
                        <TabsTrigger value="shipments">Shipments ({results.shipments?.length || 0})</TabsTrigger>
                        <TabsTrigger value="clients">Clients ({results.clients?.length || 0})</TabsTrigger>
                        <TabsTrigger value="users">Users ({results.users?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-6">
                        {results.total === 0 && <div className="text-center py-10 text-muted-foreground">No results found</div>}

                        {/* Display simplified results for 'All' tab */}
                        {results.shipments?.length > 0 && <ResultsSection title="Shipments" icon={<Package />} items={results.shipments} type="shipment" router={router} />}
                        {results.clients?.length > 0 && <ResultsSection title="Clients" icon={<Users />} items={results.clients} type="client" router={router} />}
                    </TabsContent>

                    <TabsContent value="shipments">
                        <ResultsList items={results.shipments} type="shipment" router={router} />
                    </TabsContent>

                    <TabsContent value="clients">
                        <ResultsList items={results.clients} type="client" router={router} />
                    </TabsContent>

                    <TabsContent value="users">
                        <ResultsList items={results.users} type="user" router={router} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

import { Suspense } from "react";

export default function AdvancedSearchPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
            <SearchPageContent />
        </Suspense>
    );
}

function ResultsSection({ title, icon, items, type, router }: any) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.slice(0, 3).map((item: any) => (
                        <ResultItem key={item._id} item={item} type={type} router={router} />
                    ))}
                    {items.length > 3 && (
                        <Button variant="link" className="px-0">View all {items.length} {title}</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ResultsList({ items, type, router }: any) {
    if (!items?.length) return <div className="text-center py-10 text-muted-foreground">No items found</div>;

    return (
        <div className="grid gap-4">
            {items.map((item: any) => (
                <Card key={item._id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToItem(router, type, item._id)}>
                    <CardContent className="p-4">
                        <ResultItem item={item} type={type} router={router} noLink />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function ResultItem({ item, type, router, noLink }: any) {
    const handleClick = () => {
        if (!noLink) navigateToItem(router, type, item._id);
    };

    if (type === 'shipment') {
        return (
            <div className="flex justify-between items-center" onClick={handleClick}>
                <div>
                    <div className="font-medium">{item.trackingNumber}</div>
                    <div className="text-sm text-muted-foreground">To: {item.recipient?.name}</div>
                </div>
                <Badge variant="outline">{item.status}</Badge>
            </div>
        );
    }

    if (type === 'client') {
        return (
            <div className="flex justify-between items-center" onClick={handleClick}>
                <div>
                    <div className="font-medium">{item.firstName} {item.lastName}</div>
                    <div className="text-sm text-muted-foreground">{item.companyName}</div>
                </div>
                <div className="text-sm">{item.email}</div>
            </div>
        );
    }

    if (type === 'user') {
        return (
            <div className="flex justify-between items-center" onClick={handleClick}>
                <div>
                    <div className="font-medium">{item.firstName} {item.lastName}</div>
                    <div className="text-sm text-muted-foreground">{item.email}</div>
                </div>
                <div className="text-sm capitalize">{item.role}</div>
            </div>
        );
    }

    return <div>Unknown Item</div>;
}

function navigateToItem(router: any, type: string, id: string) {
    if (type === 'shipment') router.push(`/agent/shipments/${id}`);
    if (type === 'client') router.push(`/agent/clients/${id}`);
    if (type === 'user') router.push(`/admin/users/${id}`);
}
