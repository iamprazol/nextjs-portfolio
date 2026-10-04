"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import type { LogEntry } from "@/lib/github";

import { LogEntryDetails } from "./LogEntryDetails";
import { LogEntryMeta } from "./LogEntryMeta";

/** One log entry. Its title is a disclosure button that reveals the details. */
export function LogEntryDisclosure({ entry }: { entry: LogEntry }) {
    const [open, setOpen] = useState(false);
    const panelId = useId();
    // A private-repo release with no notes has nothing more to show.
    const expandable = Boolean(entry.body || entry.pr || entry.url || entry.problems.length);

    return (
        <li className="flex items-start gap-4 p-5 sm:gap-6 sm:p-6">
            <span className="w-14 shrink-0 pt-2.5 font-mono text-sm font-bold sm:w-16">
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
                <h2 className="text-lg leading-snug font-semibold">
                    {expandable ? (
                        <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={panelId}
                            onClick={() => setOpen((current) => !current)}
                            className="hover:text-link flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 text-left"
                        >
                            {entry.title}
                            <ChevronDown
                                aria-hidden="true"
                                className={cn(
                                    "text-mute size-5 shrink-0 transition-transform",
                                    open && "rotate-180"
                                )}
                            />
                        </button>
                    ) : (
                        <span className="flex min-h-11 items-center">{entry.title}</span>
                    )}
                </h2>
                {entry.summary && !open && (
                    <p className="text-ink-2 text-[15px] leading-relaxed">{entry.summary}</p>
                )}
                <div className="mt-3">
                    <LogEntryMeta entry={entry} />
                </div>

                {expandable && (
                    <div id={panelId} hidden={!open} className="border-line mt-5 border-t pt-5">
                        <LogEntryDetails entry={entry} />
                    </div>
                )}
            </div>
        </li>
    );
}
