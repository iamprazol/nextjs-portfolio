import { SectionHeader, Tag } from "@/components/ui";
import type { ActivityItem, LogEntry } from "@/lib/github";

import { RecentActivity } from "./RecentActivity";

const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
});

type LogSectionProps = {
    eyebrow: string;
    log: LogEntry[];
    activity: ActivityItem[];
    githubUrl: string;
};

/** The three latest log entries beside the GitHub activity panel. */
export function LogSection({ eyebrow, log, activity, githubUrl }: LogSectionProps) {
    return (
        <section>
            <SectionHeader
                eyebrow={eyebrow}
                title="Notes from the work."
                link={log.length > 0 ? { href: "/log", label: "VIEW LOG" } : undefined}
            />

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                {log.length > 0 && (
                    <ol className="border-line-2 bg-panel shadow-card divide-line divide-y rounded-xl border">
                        {log.map((entry) => (
                            <li key={entry.id} className="flex items-start gap-4 p-5">
                                {/* PRs carry their log number; releases their tag. */}
                                <span className="text-link w-14 shrink-0 font-mono text-sm">
                                    {entry.number !== null ? `#${entry.number}` : "REL"}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium">{entry.title}</span>
                                    {entry.summary && (
                                        <span className="text-ink-2 mt-1 line-clamp-2 block text-sm">
                                            {entry.summary}
                                        </span>
                                    )}
                                    <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <Tag>{entry.systemName}</Tag>
                                        <time
                                            dateTime={entry.date}
                                            className="text-mute font-mono text-xs"
                                        >
                                            {date.format(new Date(entry.date))}
                                        </time>
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
                {activity.length > 0 && (
                    <RecentActivity activity={activity} githubUrl={githubUrl} />
                )}
            </div>
        </section>
    );
}
