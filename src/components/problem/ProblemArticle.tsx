import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { MonoLabel } from "@/components/ui";
import type { Problem } from "@/lib/github";

type ProblemArticleProps = {
    problem: Problem;
    system: { slug: string; name: string };
    /** Rendered between the section chips and the body, e.g. the before/after diagrams. */
    children?: React.ReactNode;
};

export function ProblemArticle({ problem, system, children }: ProblemArticleProps) {
    // Chips jump to the body's top-level sections.
    const top = Math.min(...problem.headings.map((heading) => heading.depth));
    const sections = problem.headings.filter((heading) => heading.depth === top);

    return (
        <article>
            <Link
                href={`/systems/${system.slug}?tab=problems`}
                className="text-ink-2 hover:text-ink -ml-1 inline-flex min-h-11 items-center gap-1.5 font-mono text-sm"
            >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to {system.name}
            </Link>

            <MonoLabel as="p" className="mt-4">
                Engineering Problem #{String(problem.number).padStart(2, "0")}
            </MonoLabel>
            <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-[40px]">
                {problem.title}
            </h1>
            <p className="text-link mt-4 text-lg sm:text-xl">{problem.summary}</p>

            {sections.length > 1 && (
                <nav aria-label="Sections" className="mt-6">
                    <ul className="flex flex-wrap gap-2">
                        {sections.map((heading) => (
                            <li key={heading.id}>
                                <a
                                    href={`#${heading.id}`}
                                    className="border-line-2 text-ink-2 hover:border-acc-line hover:text-ink inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-xs transition-colors"
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {children}

            {/* Sanitized by rehype-sanitize in the data layer. */}
            <div
                className="prose prose-lab text-ink-2 mt-10 max-w-[72ch]"
                dangerouslySetInnerHTML={{ __html: problem.html }}
            />
        </article>
    );
}
