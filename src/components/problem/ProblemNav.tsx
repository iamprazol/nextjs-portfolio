import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { MonoLabel } from "@/components/ui";
import type { ProblemSummary } from "@/lib/github";

type ProblemNavProps = {
    systemSlug: string;
    previous?: ProblemSummary;
    next?: ProblemSummary;
};

const card =
    "border-line-2 bg-panel hover:border-acc-line flex min-h-11 flex-1 basis-64 flex-col rounded-xl border p-5 transition-colors";

/** Links to the neighbouring case studies of the same system, by number. */
export function ProblemNav({ systemSlug, previous, next }: ProblemNavProps) {
    if (!previous && !next) return null;

    return (
        <nav aria-label="More problems" className="border-line mt-14 flex flex-wrap gap-4 border-t pt-8">
            {previous && (
                <Link href={`/systems/${systemSlug}/problems/${previous.slug}`} className={card}>
                    <MonoLabel className="flex items-center gap-1.5">
                        <ArrowLeft aria-hidden="true" className="size-3.5" />
                        Previous problem
                    </MonoLabel>
                    <span className="mt-2 font-medium">{previous.title}</span>
                </Link>
            )}
            {next && (
                <Link
                    href={`/systems/${systemSlug}/problems/${next.slug}`}
                    className={`${card} sm:items-end sm:text-right`}
                >
                    <MonoLabel className="flex items-center gap-1.5">
                        Next problem
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                    </MonoLabel>
                    <span className="mt-2 font-medium">{next.title}</span>
                </Link>
            )}
        </nav>
    );
}
