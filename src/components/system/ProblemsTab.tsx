import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MonoLabel } from "@/components/ui";
import type { ProblemSummary } from "@/lib/github";

type ProblemsTabProps = { systemSlug: string; problems: ProblemSummary[] };

/** Case-study cards, in the order the data layer gives them (by number). */
export function ProblemsTab({ systemSlug, problems }: ProblemsTabProps) {
    return (
        <ul className="grid gap-5 md:grid-cols-2">
            {problems.map((problem) => (
                <li key={problem.slug}>
                    <article className="border-line-2 bg-panel shadow-card hover:border-acc-line relative flex h-full flex-col rounded-xl border p-5 transition-colors sm:p-6">
                        <MonoLabel>
                            Engineering problem #{String(problem.number).padStart(2, "0")}
                        </MonoLabel>
                        <h2 className="mt-3 text-[22px] leading-tight font-semibold">
                            {problem.title}
                        </h2>
                        <p className="text-ink-2 mt-2 text-[15px] leading-relaxed">
                            {problem.summary}
                        </p>
                        {/* The link's ::after covers the card. */}
                        <Link
                            href={`/systems/${systemSlug}/problems/${problem.slug}`}
                            className="text-link mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-4 font-mono text-sm after:absolute after:inset-0 after:rounded-xl hover:underline"
                        >
                            Read problem
                            <span className="sr-only">: {problem.title}</span>
                            <ArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                    </article>
                </li>
            ))}
        </ul>
    );
}
