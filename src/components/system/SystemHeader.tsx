import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { monogram } from "@/components/systems/monogram";
import { IconTile, StatusBadge } from "@/components/ui";
import type { System } from "@/lib/github";

const external =
    "text-link inline-flex min-h-11 items-center gap-1 font-mono text-sm hover:underline";

export function SystemHeader({ system }: { system: System }) {
    return (
        <header>
            <Link
                href="/systems"
                className="text-ink-2 hover:text-ink -ml-1 inline-flex min-h-11 items-center gap-1.5 font-mono text-sm"
            >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to Systems
            </Link>

            <div className="mt-4 flex flex-wrap items-start gap-x-5 gap-y-4">
                <IconTile monogram={monogram(system.name)} size="lg" />
                <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight break-words sm:text-[40px] sm:leading-tight">
                            {system.name}
                        </h1>
                        <StatusBadge status={system.status} />
                    </div>
                    {system.kind && (
                        <p className="text-mute mt-1 font-mono text-sm">{system.kind}</p>
                    )}
                    {system.description && (
                        <p className="text-ink-2 mt-3 max-w-2xl text-base sm:text-[17px]">
                            {system.description}
                        </p>
                    )}
                    {(system.url || system.homepageUrl) && (
                        <p className="mt-2 flex flex-wrap gap-x-6">
                            {system.url && (
                                <a href={system.url} target="_blank" rel="noreferrer" className={external}>
                                    {system.repo}
                                    <ArrowUpRight aria-hidden="true" className="size-4" />
                                </a>
                            )}
                            {system.homepageUrl && (
                                <a
                                    href={system.homepageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={external}
                                >
                                    {system.homepageUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                    <ArrowUpRight aria-hidden="true" className="size-4" />
                                </a>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
}
