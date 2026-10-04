import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type IconTileProps = {
    /** A lucide icon, or leave empty and pass `monogram`. */
    icon?: LucideIcon;
    /** One or two characters, shown when there is no icon. */
    monogram?: string;
    /** "sm" for dense lists; "lg" is the round 56px tile used in page headers. */
    size?: "sm" | "md" | "lg";
    className?: string;
};

// Decorative: the tile sits beside a visible name, so it is hidden from AT.
export function IconTile({ icon: Icon, monogram, size = "md", className }: IconTileProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "border-line bg-panel-2 text-ink inline-flex shrink-0 items-center justify-center border font-mono font-medium",
                {
                    sm: "size-9 rounded-lg text-xs",
                    md: "size-11 rounded-lg text-sm",
                    lg: "size-14 rounded-full text-base"
                }[size],
                className
            )}
        >
            {Icon ? <Icon className="size-5" /> : monogram?.slice(0, 2)}
        </span>
    );
}
