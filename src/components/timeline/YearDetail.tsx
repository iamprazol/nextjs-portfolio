import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useId, type ReactNode } from "react";

import { MonoLabel, Panel, Tag } from "@/components/ui";
import { formatCount, formatDate } from "@/lib/format";
import type { TimelineYear } from "@/lib/github";

import { ContributionHeatmap } from "./ContributionHeatmap";

function Block({ title, children }: { title: string; children: ReactNode }) {
    const id = useId();

    return (
        <Panel as="section" inset aria-labelledby={id}>
            <MonoLabel as="h3" id={id}>
                {title}
            </MonoLabel>
            <div className="mt-4">{children}</div>
        </Panel>
    );
}

/** One year: its title and narrative, the contribution calendar, and four blocks of facts. */
export function YearDetail({ entry }: { entry: TimelineYear }) {
    const headingId = useId();
    const release = entry.notableRelease;

    const numbers = [
        { label: "Commits", value: entry.commits },
        { label: "Pull requests", value: entry.pullRequests },
        { label: "Reviews", value: entry.reviews },
        { label: "Repos contributed to", value: entry.reposContributedTo }
    ];

    return (
        <Panel as="section" padding="lg" aria-labelledby={headingId}>
            {entry.title ? (
                <>
                    <p className="text-link font-mono text-sm">
                        {entry.year}
                        {entry.inProgress && " · in progress"}
                    </p>
                    <h2
                        id={headingId}
                        className="mt-2 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl"
                    >
                        {entry.title}
                    </h2>
                </>
            ) : (
                <h2 id={headingId} className="text-link font-mono text-2xl sm:text-3xl">
                    {entry.year}
                </h2>
            )}
            {entry.summary && <p className="text-ink-2 mt-3 text-lg">{entry.summary}</p>}
            {entry.html && (
                <div
                    className="prose text-ink-2 mt-5 max-w-[72ch]"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                />
            )}

            {entry.calendar && (
                <div className="mt-8">
                    <ContributionHeatmap
                        year={entry.year}
                        weeks={entry.calendar}
                        total={entry.totalContributions}
                        inProgress={entry.inProgress}
                    />
                </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {entry.keyWork.length > 0 && (
                    <Block title="Key work">
                        <ul className="space-y-1">
                            {entry.keyWork.map((work) => (
                                <li
                                    key={work.name}
                                    className="flex min-h-8 items-center justify-between gap-4"
                                >
                                    {work.systemSlug ? (
                                        <Link
                                            href={`/systems/${work.systemSlug}`}
                                            className="text-link truncate font-medium hover:underline"
                                        >
                                            {work.name}
                                        </Link>
                                    ) : (
                                        <span className="text-ink truncate font-medium">
                                            {work.name}
                                        </span>
                                    )}
                                    <span className="text-mute shrink-0 font-mono text-xs">
                                        {formatCount(work.commits)}{" "}
                                        {work.commits === 1 ? "commit" : "commits"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Block>
                )}

                {entry.topLanguages.length > 0 && (
                    <Block title="Technologies">
                        <ul className="flex flex-wrap gap-2">
                            {entry.topLanguages.map((language) => (
                                <li key={language}>
                                    <Tag>{language}</Tag>
                                </li>
                            ))}
                        </ul>
                    </Block>
                )}

                <Block title="Numbers">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {numbers.map((item) => (
                            <div key={item.label} className="flex flex-col-reverse justify-end">
                                <dt className="text-mute text-sm">{item.label}</dt>
                                <dd className="text-ink font-mono text-2xl">
                                    {formatCount(item.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Block>

                {release && (
                    <Block title="Notable release">
                        <p className="text-ink font-mono text-2xl">{release.tag}</p>
                        {release.name && <p className="text-ink-2 mt-1">{release.name}</p>}
                        <p className="text-mute mt-3 text-sm">
                            <Link
                                href={`/systems/${release.systemSlug}`}
                                className="text-link hover:underline"
                            >
                                {release.systemName}
                            </Link>
                            {" · "}
                            <time dateTime={release.publishedAt}>
                                {formatDate(release.publishedAt)}
                            </time>
                        </p>
                        {release.url && (
                            <a
                                href={release.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-link mt-2 inline-flex min-h-11 items-center gap-1 font-mono text-sm hover:underline"
                            >
                                Release notes on GitHub
                                <ArrowUpRight aria-hidden="true" className="size-4" />
                            </a>
                        )}
                    </Block>
                )}
            </div>
        </Panel>
    );
}
