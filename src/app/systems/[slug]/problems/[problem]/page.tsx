import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BeforeAfter } from "@/components/problem/BeforeAfter";
import { ProblemAside } from "@/components/problem/ProblemAside";
import { ProblemNav } from "@/components/problem/ProblemNav";
import { ProblemArticle } from "@/components/problem/ProblemArticle";
import { getProblem, getProblemEvidence, getSystem, getSystems } from "@/lib/github";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string; problem: string }> };

// Every known case study is prerendered. One added later is rendered on its
// first request; an unknown slug reaches notFound() and gets a real 404.
export async function generateStaticParams() {
    const systems = await Promise.all(
        (await getSystems()).map((system) => getSystem(system.slug))
    );
    return systems.flatMap((system) =>
        (system?.problems ?? []).map((problem) => ({ slug: system!.slug, problem: problem.slug }))
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, problem: problemSlug } = await params;
    const [system, problem] = await Promise.all([getSystem(slug), getProblem(slug, problemSlug)]);
    if (!system || !problem) return {};

    return {
        title: `${problem.title} · ${system.name}`,
        description: problem.summary
    };
}

export default async function ProblemPage({ params }: Props) {
    const { slug, problem: problemSlug } = await params;
    const [system, problem, evidence] = await Promise.all([
        getSystem(slug),
        getProblem(slug, problemSlug),
        getProblemEvidence(slug, problemSlug)
    ]);
    if (!system || !problem) notFound();

    // system.problems is ordered by number.
    const index = system.problems.findIndex((item) => item.slug === problem.slug);

    const hasAside =
        evidence.length > 0 ||
        [problem.role, problem.constraints, problem.tradeoffs, problem.result].some(
            (items) => items?.length
        );

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex flex-wrap items-start gap-x-10 gap-y-10">
                <div className="min-w-0 flex-[999_1_640px]">
                    <ProblemArticle problem={problem} system={system}>
                        <BeforeAfter
                            before={problem.diagrams?.before}
                            after={problem.diagrams?.after}
                        />
                    </ProblemArticle>
                    <ProblemNav
                        systemSlug={system.slug}
                        previous={system.problems[index - 1]}
                        next={system.problems[index + 1]}
                    />
                </div>
                {hasAside && (
                    <aside
                        aria-label="About this problem"
                        className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 lg:sticky lg:top-24"
                    >
                        <ProblemAside problem={problem} evidence={evidence} />
                    </aside>
                )}
            </div>
        </div>
    );
}
