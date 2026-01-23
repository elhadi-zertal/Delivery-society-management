"use client";

import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { favoritesApi } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Star, X, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Feature list available to add
const AVAILABLE_FEATURES = [
    { name: "Create Shipment", route: "/agent/shipments/create", icon: "box" },
    { name: "Track Shipment", route: "/track", icon: "search" },
    { name: "Invoices", route: "/agent/invoices", icon: "file-text" },
    { name: "Analytics", route: "/agent/analytics", icon: "bar-chart" },
    { name: "Clients", route: "/agent/clients", icon: "users" },
    { name: "Drivers", route: "/agent/drivers", icon: "truck" },
];

export default function FavoritesPage() {
    return (
        <DndProvider backend={HTML5Backend}>
            <FavoritesContent />
        </DndProvider>
    );
}

function FavoritesContent() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const res = await favoritesApi.getFavorites();
            setFavorites(res.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (feature: any) => {
        try {
            await favoritesApi.addFavorite({
                featureName: feature.name,
                featureRoute: feature.route,
                icon: feature.icon
            });
            await loadFavorites();
            toast.success("Added to favorites");
        } catch (error) {
            toast.error("Failed to add favorite");
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Favorites</h1>
                    <p className="text-muted-foreground">Customize your quick access dashboard</p>
                </div>
                <Button variant={editMode ? "secondary" : "outline"} onClick={() => setEditMode(!editMode)}>
                    {editMode ? "Done Editing" : "Edit Favorites"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Favorites Area */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Star className="fill-yellow-400 text-yellow-400 h-5 w-5" /> Your Shortcuts
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.length === 0 ? (
                            <div className="col-span-full border-dashed border-2 rounded-lg p-8 text-center text-muted-foreground bg-muted/20">
                                You don't have any favorites yet. Add some from the list!
                            </div>
                        ) : (
                            favorites.map((fav, index) => (
                                <Card key={fav._id} className={cn("relative group transition-all", !editMode && "hover:shadow-md cursor-pointer hover:border-primary/50")}>
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2 h-32" onClick={() => !editMode && router.push(fav.featureRoute)}>
                                        {editMode && <GripVertical className="absolute top-2 left-2 text-muted-foreground cursor-grab opacity-50" />}
                                        {editMode && (
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => { e.stopPropagation(); /* Implement remove */ }}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {fav.featureName[0]}
                                        </div>
                                        <span className="font-medium">{fav.featureName}</span>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Available Features Panel */}
                {editMode && (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                        <h2 className="text-xl font-semibold">Available Features</h2>
                        <div className="space-y-2">
                            {AVAILABLE_FEATURES.filter(f => !favorites.some(fav => fav.featureRoute === f.route)).map((feature) => (
                                <div key={feature.route} className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm">
                                    <span className="font-medium">{feature.name}</span>
                                    <Button size="sm" variant="ghost" onClick={() => addToFavorites(feature)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {AVAILABLE_FEATURES.every(f => favorites.some(fav => fav.featureRoute === f.route)) && (
                                <div className="text-sm text-muted-foreground text-center py-4">All features added</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
