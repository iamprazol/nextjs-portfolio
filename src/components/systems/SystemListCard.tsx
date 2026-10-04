import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { IconTile, MonoLabel, StatusBadge, Tag } from "@/components/ui";
import type { System } from "@/lib/github";

import { monogram } from "./monogram";

/** The full card on the systems index: everything GitHub knows about a system at a glance. */
export function SystemListCard({ system }: { system: System }) {
    const role = system.role.join(" · ");
    const hasFooter = Boolean(role || system.proves);

    return (
        <article className="border-line-2 bg-panel shadow-card hover:border-acc-line relative flex h-full flex-col rounded-xl border transition-colors">
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <IconTile monogram={monogram(system.name)} />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-[22px] leading-tight font-semibold break-words">
                            {system.name}
                        </h2>
                        {system.kind && (
                            <p className="text-mute mt-1 font-mono text-xs">{system.kind}</p>
                        )}
                    </div>
                    <StatusBadge status={system.status} className="shrink-0" />
                </div>

                {system.description && (
                    <p className="text-ink-2 mt-4 text-[15px] leading-relaxed">
                        {system.description}
                    </p>
                )}

                {system.stack.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
                        {system.stack.map((item) => (
                            <li key={item} className="flex">
                                <Tag>{item}</Tag>
                            </li>
                        ))}
                    </ul>
                )}

                {/* The link's ::after covers the card, so the whole card is one click target. */}
                <Link
                    href={`/systems/${system.slug}`}
                    className="text-link mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-4 font-mono text-sm after:absolute after:inset-0 after:rounded-xl hover:underline"
                >
                    Open system profile
                    <span className="sr-only">: {system.name}</span>
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            </div>

            {hasFooter && (
                <dl className="border-line divide-line grid divide-y border-t sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0">
                    {role && (
                        <div className="p-5 sm:px-6">
                            <dt>
                                <MonoLabel>My role</MonoLabel>
                            </dt>
                            <dd className="mt-1.5 text-sm">{role}</dd>
                        </div>
                    )}
                    {system.proves && (
                        <div className="p-5 sm:px-6">
                            <dt>
                                <MonoLabel>Proves</MonoLabel>
                            </dt>
                            <dd className="mt-1.5 text-sm">{system.proves}</dd>
                        </div>
                    )}
                </dl>
            )}
        </article>
    );
}
