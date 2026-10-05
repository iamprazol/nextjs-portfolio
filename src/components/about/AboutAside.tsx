import Link from "next/link";

import { MonoLabel, Panel, Tag } from "@/components/ui";
import type { Interest, NowState, ProfileData, System } from "@/lib/github";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="px-5 py-4">
            <MonoLabel as="h2">{label}</MonoLabel>
            <div className="mt-2">{children}</div>
        </div>
    );
}

type AboutAsideProps = {
    profile: ProfileData;
    now: NowState;
    systems: System[];
    interests: Interest[];
};

/** Based in / Currently / Interests. A group with no data is omitted. */
export function AboutAside({ profile, now, systems, interests }: AboutAsideProps) {
    const { building, learning } = now;
    const currently = building !== null || learning.length > 0;
    if (!profile.location && !currently && interests.length === 0) return null;

    // Systems have their own page; experiments live on /lab.
    const isSystem = building && systems.some((system) => system.slug === building.slug);

    return (
        <Panel as="aside" padding="none" aria-label="At a glance" className="divide-line divide-y">
            {profile.location && (
                <Group label="Based in">
                    <p className="text-base font-medium">{profile.location.label}</p>
                </Group>
            )}
            {currently && (
                <Group label="Currently">
                    {building && (
                        <p>
                            <span className="text-ink-2">Building </span>
                            <Link
                                href={isSystem ? `/systems/${building.slug}` : "/lab"}
                                className="text-link font-medium hover:underline"
                            >
                                {building.name}
                            </Link>
                        </p>
                    )}
                    {learning.length > 0 && (
                        <p className={building ? "mt-1" : undefined}>
                            <span className="text-ink-2">Learning </span>
                            <span className="font-medium">{learning.join(", ")}</span>
                        </p>
                    )}
                </Group>
            )}
            {interests.length > 0 && (
                <Group label="Interests">
                    <ul className="flex flex-wrap gap-2 pt-1">
                        {interests.map((interest) => (
                            <li key={interest.topic}>
                                <Tag>{interest.topic}</Tag>
                            </li>
                        ))}
                    </ul>
                </Group>
            )}
        </Panel>
    );
}
