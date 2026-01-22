
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    imageSrc?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, imageSrc }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed rounded-lg bg-muted/20">
            {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt="Empty state" className="mb-6 h-48 w-48 object-contain opacity-80" />
            ) : Icon ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
            ) : null}

            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>

            {action && (
                <Button onClick={action.onClick} variant="default">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
