import Link from "next/link";

import { Tag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { LogEntry } from "@/lib/github";

type LogEntryListProps = {
    entries: LogEntry[];
    /** Hide the system tag when every entry belongs to the same system. */
    showSystem?: boolean;
};

/** Log entries as a bordered list: number or REL, title, summary, tag and date. */
export function LogEntryList({ entries, showSystem = true }: LogEntryListProps) {
    return (
        <ol className="border-line-2 bg-panel shadow-card divide-line divide-y rounded-xl border">
            {entries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-4 p-5">
                    {/* PRs carry their log number; releases are marked REL. */}
                    <span className="text-link w-14 shrink-0 font-mono text-sm">
                        {entry.number !== null ? `#${entry.number}` : "REL"}
                    </span>
                    <span className="min-w-0 flex-1">
                        {entry.number !== null ? (
                            <Link
                                href={`/log/${entry.number}`}
                                className="hover:text-link block font-medium hover:underline"
                            >
                                {entry.title}
                            </Link>
                        ) : (
                            <span className="block font-medium">{entry.title}</span>
                        )}
                        {entry.summary && (
                            <span className="text-ink-2 mt-1 line-clamp-2 block text-sm">
                                {entry.summary}
                            </span>
                        )}
                        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {showSystem && <Tag>{entry.systemName}</Tag>}
                            <time dateTime={entry.date} className="text-mute font-mono text-xs">
                                {formatDate(entry.date)}
                            </time>
                        </span>
                    </span>
                </li>
            ))}
        </ol>
    );
}
