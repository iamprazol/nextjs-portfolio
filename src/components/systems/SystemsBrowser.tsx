"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { statusLabel, type SystemStatus } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { System } from "@/lib/github";

import { SystemListCard } from "./SystemListCard";

// Display order of the pills; only statuses that some system has are shown.
const ORDER: SystemStatus[] = ["production", "building", "active", "experiment", "maintenance"];

const statusesOf = (systems: System[]) =>
    ORDER.filter((status) => systems.some((system) => system.status === status));

type SystemsViewProps = {
    systems: System[];
    selected: SystemStatus | null;
    onSelect?: (status: SystemStatus | null) => void;
};

/** The filter pills and the grid, for a given selection. */
export function SystemsView({ systems, selected, onSelect }: SystemsViewProps) {
    const visible = selected ? systems.filter((system) => system.status === selected) : systems;

    const pills: { status: SystemStatus | null; label: string; count: number }[] = [
        { status: null, label: "All", count: systems.length },
        ...statusesOf(systems).map((status) => ({
            status,
            label: statusLabel[status],
            count: systems.filter((system) => system.status === status).length
        }))
    ];

    return (
        <>
            <div role="group" aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2">
                {pills.map((pill) => {
                    const pressed = pill.status === selected;
                    return (
                        <button
                            key={pill.label}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => onSelect?.(pill.status)}
                            className={cn(
                                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-mono text-sm transition-colors",
                                pressed
                                    ? "border-ink bg-ink text-bg"
                                    : "border-line-2 text-ink-2 hover:border-acc-line hover:text-ink"
                            )}
                        >
                            {pill.label}
                            <span className={cn("text-xs", pressed ? "opacity-70" : "text-mute")}>
                                {pill.count}
                            </span>
                        </button>
                    );
                })}
            </div>
            <p aria-live="polite" className="sr-only">
                Showing {visible.length} of {systems.length} systems
            </p>
            <ul className="mt-8 grid gap-5 min-[900px]:grid-cols-2">
                {visible.map((system) => (
                    <li key={system.slug}>
                        <SystemListCard system={system} />
                    </li>
                ))}
            </ul>
        </>
    );
}

/**
 * SystemsView driven by ?status= in the URL, so a filtered view can be shared.
 * Filtering happens in the browser, which keeps the page itself static.
 */
export function SystemsBrowser({ systems }: { systems: System[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // An unknown or absent value means "All".
    const requested = params.get("status");
    const selected = statusesOf(systems).find((status) => status === requested) ?? null;

    const select = (status: SystemStatus | null) => {
        const next = new URLSearchParams(params);
        if (status) next.set("status", status);
        else next.delete("status");
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    return <SystemsView systems={systems} selected={selected} onSelect={select} />;
}
