import type { Metadata } from "next";

import type { TerminalData } from "@/components/lab/commands";
import { ExperimentGroupCard } from "@/components/lab/ExperimentGroupCard";
import { LearningCard } from "@/components/lab/LearningCard";
import { Terminal } from "@/components/lab/Terminal";
import {
    getExperiments,
    getLog,
    getNow,
    getProfile,
    getSystems,
    getToolUsage,
    type Experiment
} from "@/lib/github";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Experiments",
    description: "The lab: small repositories for trying tools, workflows and ideas, grouped by topic."
};

const STACK_SIZE = 6;
const LOG_SIZE = 5;

// "https://github.com/demo-dev" → "github.com/demo-dev"
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default async function LabPage() {
    const [experiments, now, systems, fullLog, tools, profile] = await Promise.all([
        getExperiments(),
        getNow(),
        getSystems(),
        getLog(),
        getToolUsage(),
        getProfile()
    ]);

    // Experiments arrive most recently pushed first, so groups are in that
    // order too. Those without a topic go last.
    const groups = new Map<string | null, Experiment[]>();
    for (const experiment of experiments) {
        groups.set(experiment.group, [...(groups.get(experiment.group) ?? []), experiment]);
    }
    const cards = [...groups].sort((a, b) => Number(a[0] === null) - Number(b[0] === null));

    // getLog() lists pinned entries first; the terminal's `log` is the newest five.
    const log = [...fullLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, LOG_SIZE);

    const { links } = profile;
    const terminal: TerminalData = {
        projects: systems.map(({ slug, name, status }) => ({ slug, name, status })),
        experiments: experiments.map((experiment) => ({
            name: experiment.name,
            description: experiment.description,
            href: experiment.url ?? experiment.homepageUrl
        })),
        log: log.map((entry) => ({
            label: entry.number !== null ? `#${entry.number}` : (entry.releaseTag ?? "release"),
            title: entry.title,
            systemName: entry.systemName,
            // Only PRs have their own page.
            href: entry.number !== null ? `/log/${entry.number}` : "/log"
        })),
        now: {
            building: now.building?.name ?? null,
            learning: now.learning,
            exploring: now.exploring
        },
        stack: tools
            .filter((tool) => tool.kind === "language")
            .slice(0, STACK_SIZE)
            .map((tool) => tool.name),
        contact: [
            { label: "github", value: bare(links.github), href: links.github },
            ...(links.linkedin ? [{ label: "linkedin", value: bare(links.linkedin), href: links.linkedin }] : []),
            ...(links.x ? [{ label: "x", value: bare(links.x), href: links.x }] : []),
            ...(links.website ? [{ label: "website", value: bare(links.website), href: links.website }] : []),
            ...(links.email ? [{ label: "email", value: links.email, href: `mailto:${links.email}` }] : [])
        ]
    };

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

            <div className="mt-12 max-w-[860px]">
                <Terminal
                    // "Demo Developer" → "demo"
                    name={profile.name.trim().split(/\s+/)[0].toLowerCase()}
                    data={terminal}
                />
            </div>
        </div>
    );
}
