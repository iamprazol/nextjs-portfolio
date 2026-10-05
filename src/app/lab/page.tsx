import type { Metadata } from "next";

import { ExperimentGroupCard } from "@/components/lab/ExperimentGroupCard";
import { LearningCard } from "@/components/lab/LearningCard";
import { getExperiments, getNow, type Experiment } from "@/lib/github";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Experiments",
    description: "The lab: small repositories for trying tools, workflows and ideas, grouped by topic."
};

export default async function LabPage() {
    const [experiments, now] = await Promise.all([getExperiments(), getNow()]);

    // Experiments arrive most recently pushed first, so groups are in that
    // order too. Those without a topic go last.
    const groups = new Map<string | null, Experiment[]>();
    for (const experiment of experiments) {
        groups.set(experiment.group, [...(groups.get(experiment.group) ?? []), experiment]);
    }
    const cards = [...groups].sort((a, b) => Number(a[0] === null) - Number(b[0] === null));

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Experiments</h1>
            <p className="text-ink-2 mt-3 font-mono text-sm sm:text-base">
                Exploring new tools, workflows and ideas.
            </p>

            {cards.length === 0 && now.learning.length === 0 ? (
                <p className="text-ink-2 border-line mt-10 border-t pt-8">
                    No experiments are published yet.
                </p>
            ) : (
                <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map(([group, items]) => (
                        <li key={group ?? ""}>
                            <ExperimentGroupCard group={group} experiments={items} />
                        </li>
                    ))}
                    {now.learning.length > 0 && (
                        <li>
                            <LearningCard languages={now.learning} />
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
