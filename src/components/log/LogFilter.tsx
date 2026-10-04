"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";

type LogFilterProps = {
    systems: { slug: string; name: string }[];
    /** The selected system's slug, or null for all. */
    selected: string | null;
};

/** "All systems / <each system>", kept in ?system=. Changing it returns to page 1. */
export function LogFilter({ systems, selected }: LogFilterProps) {
    const router = useRouter();
    const id = useId();

    return (
        <div className="flex items-center gap-3">
            <label htmlFor={id} className="text-mute font-mono text-[11px] tracking-[.16em] uppercase">
                System
            </label>
            <select
                id={id}
                value={selected ?? ""}
                onChange={(event) =>
                    router.push(
                        event.target.value
                            ? `/log?system=${encodeURIComponent(event.target.value)}`
                            : "/log"
                    )
                }
                className="border-line-2 bg-panel text-ink h-11 min-w-48 cursor-pointer rounded-lg border px-3 font-mono text-sm"
            >
                <option value="">All systems</option>
                {systems.map((system) => (
                    <option key={system.slug} value={system.slug}>
                        {system.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
