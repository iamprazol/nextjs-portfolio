import Link from "next/link";

import { IconTile, MonoLabel, Panel, StatusDot, statusLabel } from "@/components/ui";
import type { System } from "@/lib/github";

/** "Atlas Membership" → "AM", "relay-qa" → "RQ". */
export function monogram(name: string) {
    const words = name.split(/[\s\-_]+/).filter(Boolean);
    const letters = words.length > 1 ? words.slice(0, 2).map((word) => word[0]) : [name.slice(0, 2)];
    return letters.join("").toUpperCase();
}

export function SystemStatusCard({ systems }: { systems: System[] }) {
    return (
        <Panel as="section" padding="none" aria-labelledby="system-status">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
                <MonoLabel as="h2" id="system-status">
                    System status
                </MonoLabel>
                <span className="bg-ok-soft text-ink-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] tracking-[.12em] uppercase">
                    <span aria-hidden="true" className="bg-ok size-1.5 rounded-full" />
                    Online
                </span>
            </div>

            <ul className="divide-line mt-3 divide-y px-2 pb-2">
                {systems.map((system) => (
                    <li key={system.slug}>
                        <Link
                            href={`/systems/${system.slug}`}
                            className="hover:bg-panel-2 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors focus-visible:-outline-offset-2"
                        >
                            <IconTile monogram={monogram(system.name)} className="size-9 text-xs" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                    {system.name}
                                </span>
                                <span className="text-mute mt-0.5 flex items-center gap-1.5 text-xs">
                                    <StatusDot status={system.status} />
                                    <span className="text-ink-2 shrink-0 font-mono text-[11px] tracking-[.08em] uppercase">
                                        {statusLabel[system.status]}
                                    </span>
                                    {system.kind && (
                                        <span className="truncate">· {system.kind}</span>
                                    )}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}
