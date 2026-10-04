import Link from "next/link";

import { MonoLabel, StatusBadge, Tag } from "@/components/ui";
import type { System } from "@/lib/github";

const MAX_TAGS = 5;

type SystemCardProps = {
    system: System;
    /** Position in the ordered list, shown as SYS-01, SYS-02, … */
    index: number;
};

export function SystemCard({ system, index }: SystemCardProps) {
    const hidden = system.stack.length - MAX_TAGS;

    return (
        <Link
            href={`/systems/${system.slug}`}
            className="border-line-2 bg-panel shadow-card hover:border-acc-line flex h-full flex-col rounded-xl border p-5 transition-colors"
        >
            <span className="flex items-center justify-between gap-3">
                <MonoLabel>SYS-{String(index + 1).padStart(2, "0")}</MonoLabel>
                <StatusBadge status={system.status} />
            </span>
            <span className="mt-5 block text-[22px] leading-tight font-semibold">{system.name}</span>
            {system.description && (
                <span className="text-ink-2 mt-2 line-clamp-3 block text-sm">
                    {system.description}
                </span>
            )}
            {system.stack.length > 0 && (
                <span className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {system.stack.slice(0, MAX_TAGS).map((item) => (
                        <Tag key={item}>{item}</Tag>
                    ))}
                    {hidden > 0 && <Tag aria-label={`and ${hidden} more`}>+{hidden}</Tag>}
                </span>
            )}
        </Link>
    );
}
