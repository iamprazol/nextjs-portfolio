import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/cn";

const paddings = {
    none: "",
    md: "p-5",
    lg: "p-6 sm:p-8"
};

type PanelProps<T extends ElementType> = {
    as?: T;
    padding?: keyof typeof paddings;
    /** Inset surface (--panel-2) with no shadow, for areas inside a card. */
    inset?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Panel<T extends ElementType = "div">({
    as,
    padding = "md",
    inset = false,
    className,
    ...props
}: PanelProps<T>) {
    const Component: ElementType = as ?? "div";

    return (
        <Component
            className={cn(
                "rounded-xl border",
                inset
                    ? "border-line bg-panel-2"
                    : "border-line-2 bg-panel shadow-card",
                paddings[padding],
                className
            )}
            {...props}
        />
    );
}
