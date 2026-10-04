import { notFound } from "next/navigation";

import { BeforeAfter } from "@/components/problem/BeforeAfter";
import { ProblemArticle } from "@/components/problem/ProblemArticle";
import { getProblem, getSystem, getSystems } from "@/lib/github";

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

export default async function ProblemPage({ params }: Props) {
    const { slug, problem: problemSlug } = await params;
    const [system, problem] = await Promise.all([getSystem(slug), getProblem(slug, problemSlug)]);
    if (!system || !problem) notFound();

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
                </div>
            </div>
        </div>
    );
}
