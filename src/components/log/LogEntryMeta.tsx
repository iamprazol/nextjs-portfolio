import { GitPullRequest, Package } from "lucide-react";

import { Tag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { LogEntry } from "@/lib/github";

/** One line of facts about an entry: type, date, system and size. */
export function LogEntryMeta({ entry }: { entry: LogEntry }) {
    const Icon = entry.type === "pr" ? GitPullRequest : Package;

    return (
        <span className="text-mute flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs">
            <span className="text-ink-2 inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" className="size-3.5" />
                {entry.type === "pr" ? "Pull request" : `Release ${entry.releaseTag}`}
            </span>
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            <Tag>{entry.systemName}</Tag>
            {entry.pr && (
                <span>
                    <span className="sr-only">Lines added and removed: </span>+{entry.pr.additions} −
                    {entry.pr.deletions}
                </span>
            )}
        </span>
    );
}
