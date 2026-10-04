import Link from "next/link";

import { Panel } from "@/components/ui";
import type { Experiment, NowState, System } from "@/lib/github";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="px-5 py-4">
            {/* --link, not --acc: accent orange is too light for small text. */}
            <h2 className="text-link flex items-center gap-2 font-mono text-[11px] tracking-[.16em] uppercase">
                <span aria-hidden="true" className="bg-acc size-1.5 rounded-full" />
                {label}
            </h2>
            <div className="mt-2">{children}</div>
        </div>
    );
}

const itemLink = "hover:text-link inline-flex min-h-11 items-center font-mono text-sm";

type NowCardProps = {
    now: NowState;
    systems: System[];
    experiments: Experiment[];
};

/** Currently building / learning / exploring. A group with no data is omitted. */
export function NowCard({ now, systems, experiments }: NowCardProps) {
    const { building } = now;
    const system = building && systems.find((item) => item.slug === building.slug);
    const experiment = building && experiments.find((item) => item.slug === building.slug);
    const description = system?.description ?? experiment?.description;

    const learning = now.learning.slice(0, 2);
    const exploring = now.exploring.slice(0, 2);
    if (!building && learning.length === 0 && exploring.length === 0) return null;

    return (
        <Panel as="section" padding="none" aria-label="Now" className="divide-line divide-y">
            {building && (
                <Group label="Currently building">
                    <Link
                        // Systems have their own page; experiments live on /lab.
                        href={system ? `/systems/${building.slug}` : "/lab"}
                        className="hover:text-link block rounded-sm py-1"
                    >
                        <span className="block text-base font-medium">{building.name}</span>
                        {description && (
                            <span className="text-ink-2 mt-1 block text-sm">{description}</span>
                        )}
                    </Link>
                </Group>
            )}
            {learning.length > 0 && (
                <Group label="Currently learning">
                    <ul className="flex flex-wrap gap-x-5">
                        {learning.map((language) => (
                            <li key={language}>
                                <Link href="/lab" className={itemLink}>
                                    {language}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Group>
            )}
            {exploring.length > 0 && (
                <Group label="Currently exploring">
                    <ul className="flex flex-wrap gap-x-5 gap-y-1 py-2 font-mono text-sm">
                        {exploring.map((topic) => (
                            <li key={topic}>{topic}</li>
                        ))}
                    </ul>
                </Group>
            )}
        </Panel>
    );
}
