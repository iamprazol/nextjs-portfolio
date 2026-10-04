import { LogEntryList } from "@/components/log/LogEntryList";
import { SectionHeader } from "@/components/ui";
import type { ActivityItem, LogEntry } from "@/lib/github";

import { RecentActivity } from "./RecentActivity";

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
                {log.length > 0 && <LogEntryList entries={log} />}
                {activity.length > 0 && (
                    <RecentActivity activity={activity} githubUrl={githubUrl} />
                )}
            </div>
        </section>
    );
}
