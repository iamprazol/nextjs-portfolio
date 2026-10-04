import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { MonoLabel, Panel } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Problem, ProblemEvidence } from "@/lib/github";

function ListPanel({ title, items }: { title: string; items?: string[] }) {
    if (!items?.length) return null;

    return (
        <Panel as="section">
            <MonoLabel as="h2">{title}</MonoLabel>
            <ul className="mt-3 space-y-2 text-[15px]">
                {items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                        <span aria-hidden="true" className="bg-acc mt-2 size-1.5 shrink-0 rounded-full" />
                        {item}
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

type ProblemAsideProps = { problem: Problem; evidence: ProblemEvidence[] };

/** Frontmatter panels and the PRs that back the case study. Empty panels are not rendered. */
export function ProblemAside({ problem, evidence }: ProblemAsideProps) {
    return (
        <>
            <ListPanel title="My role" items={problem.role} />
            <ListPanel title="Constraints" items={problem.constraints} />
            <ListPanel title="Trade-offs" items={problem.tradeoffs} />
            <ListPanel title="Result" items={problem.result} />

            {evidence.length > 0 && (
                <Panel as="section" padding="none">
                    <MonoLabel as="h2" className="block px-5 pt-5">
                        Evidence
                    </MonoLabel>
                    <ul className="divide-line mt-2 divide-y">
                        {evidence.map((pr) => (
                            <li key={pr.number} className="px-5 py-4">
                                <p className="text-[15px] font-medium">{pr.title}</p>
                                <p className="text-mute mt-1 font-mono text-xs">
                                    <span className="text-ink-2">
                                        +{pr.additions} −{pr.deletions}
                                    </span>
                                    {" · merged "}
                                    <time dateTime={pr.mergedAt}>{formatDate(pr.mergedAt)}</time>
                                </p>
                                <p className="mt-1 flex flex-wrap gap-x-5">
                                    {pr.logNumber !== null && (
                                        <Link
                                            href={`/log/${pr.logNumber}`}
                                            className="text-link inline-flex min-h-11 items-center gap-1 font-mono text-xs hover:underline"
                                        >
                                            Log #{pr.logNumber}
                                            <ArrowRight aria-hidden="true" className="size-3.5" />
                                        </Link>
                                    )}
                                    {pr.url && (
                                        <a
                                            href={pr.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-link inline-flex min-h-11 items-center gap-1 font-mono text-xs hover:underline"
                                        >
                                            PR #{pr.number}
                                            <ArrowUpRight aria-hidden="true" className="size-3.5" />
                                        </a>
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}
        </>
    );
}
