import { cn } from "@/lib/cn";

import { statusDotClass, type SystemStatus } from "./status";

// Decorative: always pair it with text (StatusBadge does), never color alone.
export function StatusDot({
    status,
    className
}: {
    status: SystemStatus;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-block size-2 shrink-0 rounded-full",
                statusDotClass[status],
                className
            )}
        />
    );
}
