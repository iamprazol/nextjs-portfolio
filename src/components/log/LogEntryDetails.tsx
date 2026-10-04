import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { LogEntry } from "@/lib/github";

const link = "text-link inline-flex min-h-11 items-center gap-1 font-mono text-sm hover:underline";

/** What an entry reveals when opened: description, size, and where to read more. */
export function LogEntryDetails({ entry }: { entry: LogEntry }) {
    return (
        <>
            {entry.body && (
                <>
                    {/* Sanitized by rehype-sanitize in the data layer. */}
                    <div
                        className="prose prose-compact text-ink-2 text-[15px]"
                        dangerouslySetInnerHTML={{ __html: entry.body.html }}
                    />
                    {entry.body.truncated && (
                        <p className="text-mute mt-3 text-sm">
                            The description continues on GitHub.
                        </p>
                    )}
                </>
            )}

            {entry.pr && (
                <p className="text-ink-2 mt-4 font-mono text-xs">
                    {entry.pr.changedFiles} {entry.pr.changedFiles === 1 ? "file" : "files"} changed
                    · +{entry.pr.additions} −{entry.pr.deletions}
                </p>
            )}

            {(entry.url || entry.problems.length > 0) && (
                <ul className="mt-2 flex flex-wrap gap-x-6">
                    {entry.problems.map((problem) => (
                        <li key={problem.slug}>
                            <Link
                                href={`/systems/${entry.systemSlug}/problems/${problem.slug}`}
                                className={link}
                            >
                                Case study: {problem.title}
                                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                            </Link>
                        </li>
                    ))}
                    {entry.url && (
                        <li>
                            <a href={entry.url} target="_blank" rel="noreferrer" className={link}>
                                {entry.pr
                                    ? `Pull request #${entry.pr.number} on GitHub`
                                    : `Release ${entry.releaseTag} on GitHub`}
                                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                            </a>
                        </li>
                    )}
                </ul>
            )}
        </>
    );
}
