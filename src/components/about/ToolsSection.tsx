import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MonoLabel, Panel, SectionHeader } from "@/components/ui";
import type { ToolGroup } from "@/lib/github";

/** Tools by group, each linked to the systems it was used in. Nothing is rendered without any. */
export function ToolsSection({ groups }: { groups: ToolGroup[] }) {
    if (groups.length === 0) return null;

    return (
        <section aria-labelledby="tools">
            <SectionHeader id="tools" title="Tools attached to real work" />
            <p className="text-ink-2 mt-3 font-mono text-sm">
                No ratings — each tool is linked to the system it was used in.
            </p>

            <ul className="mt-6 grid gap-5 md:grid-cols-2">
                {groups.map((group) => (
                    <li key={group.name}>
                        <Panel className="h-full">
                            <MonoLabel as="h3">{group.name}</MonoLabel>
                            <ul className="divide-line mt-2 divide-y">
                                {group.tools.map((tool) => (
                                    <li
                                        key={tool.name}
                                        className="flex flex-col py-2 sm:flex-row sm:items-baseline sm:gap-x-4"
                                    >
                                        <span className="shrink-0 font-mono font-medium sm:w-32">
                                            {tool.name}
                                        </span>
                                        <span className="flex min-w-0 flex-wrap items-center gap-x-4">
                                            <span className="text-mute text-sm">Used in</span>
                                            {tool.systems.map((system) => (
                                                <Link
                                                    key={system.slug}
                                                    href={`/systems/${system.slug}`}
                                                    className="text-link inline-flex min-h-11 items-center gap-1 text-sm hover:underline"
                                                >
                                                    {system.name}
                                                    <ArrowRight aria-hidden="true" className="size-3.5" />
                                                </Link>
                                            ))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    </li>
                ))}
            </ul>
        </section>
    );
}
