import { cn } from "@/lib/cn";

import { statusLabel, type SystemStatus } from "./status";
import { StatusDot } from "./StatusDot";

export function StatusBadge({
    status,
    className
}: {
    status: SystemStatus;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "border-line-2 bg-panel-2 text-ink-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] leading-4 tracking-[.12em] uppercase",
                className
            )}
        >
            <StatusDot status={status} />
            {statusLabel[status]}
        </span>
    );
}
