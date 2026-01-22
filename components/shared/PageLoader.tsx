
import { Loader2 } from "lucide-react";

export default function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading...</p>
        </div>
    );
}
