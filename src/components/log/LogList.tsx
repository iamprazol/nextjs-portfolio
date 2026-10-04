import type { LogEntry } from "@/lib/github";

import { LogEntryMeta } from "./LogEntryMeta";

/** The log page's list: number, title, summary and facts for each entry. */
export function LogList({ entries }: { entries: LogEntry[] }) {
    return (
        <ol className="border-line-2 bg-panel shadow-card divide-line divide-y rounded-xl border">
            {entries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-4 p-5 sm:gap-6 sm:p-6">
                    <span className="w-14 shrink-0 font-mono text-sm font-bold sm:w-16">
                        {entry.number !== null ? `#${entry.number}` : "REL"}
                        {entry.pinned && (
                            // Accent dot = highlighted with the portfolio:highlight label.
                            <span className="mt-2 flex items-center gap-1.5 font-normal">
                                <span aria-hidden="true" className="bg-acc size-2 rounded-full" />
                                <span className="sr-only">Highlighted</span>
                            </span>
                        )}
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg leading-snug font-semibold">{entry.title}</h2>
                        {entry.summary && (
                            <p className="text-ink-2 mt-1.5 text-[15px] leading-relaxed">
                                {entry.summary}
                            </p>
                        )}
                        <div className="mt-3">
                            <LogEntryMeta entry={entry} />
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    );
}
