import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/cn";

type MonoLabelProps<T extends ElementType> = {
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function MonoLabel<T extends ElementType = "span">({
    as,
    className,
    ...props
}: MonoLabelProps<T>) {
    const Component: ElementType = as ?? "span";

    return (
        <Component
            className={cn(
                "text-mute font-mono text-[11px] leading-4 tracking-[.16em] uppercase",
                className
            )}
            {...props}
        />
    );
}
