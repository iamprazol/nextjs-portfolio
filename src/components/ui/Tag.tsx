import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export function Tag({ className, ...props }: ComponentPropsWithoutRef<"span">) {
    return (
        <span
            className={cn(
                "bg-chip text-ink-2 inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs leading-5",
                className
            )}
            {...props}
        />
    );
}
