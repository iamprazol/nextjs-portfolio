import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type IconTileProps = {
    /** A lucide icon, or leave empty and pass `monogram`. */
    icon?: LucideIcon;
    /** One or two characters, shown when there is no icon. */
    monogram?: string;
    className?: string;
};

// Decorative: the tile sits beside a visible name, so it is hidden from AT.
export function IconTile({ icon: Icon, monogram, className }: IconTileProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "border-line bg-panel-2 text-ink inline-flex size-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-medium",
                className
            )}
        >
            {Icon ? <Icon className="size-5" /> : monogram?.slice(0, 2)}
        </span>
    );
}
