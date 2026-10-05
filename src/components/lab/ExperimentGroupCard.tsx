import {
    Bot,
    Database,
    FlaskConical,
    Globe,
    Sparkles,
    Terminal,
    Wrench,
    type LucideIcon
} from "lucide-react";
import { useId } from "react";

import { IconTile, Panel, RelativeTime } from "@/components/ui";
import type { Experiment } from "@/lib/github";

// Icons for common topics; any other group gets the flask.
const icons: Record<string, LucideIcon> = {
    ai: Sparkles,
    llm: Sparkles,
    agents: Bot,
    cli: Terminal,
    "developer-tools": Wrench,
    tooling: Wrench,
    web: Globe,
    database: Database,
    sqlite: Database
};

type ExperimentGroupCardProps = {
    /** The topic the experiments share; null for experiments without one. */
    group: string | null;
    experiments: Experiment[];
};

/** One topic's experiments: each with its description and when it was last pushed. */
export function ExperimentGroupCard({ group, experiments }: ExperimentGroupCardProps) {
    const headingId = useId();

    return (
        <Panel as="section" aria-labelledby={headingId} className="h-full">
            <div className="flex items-center gap-3">
                <IconTile icon={(group && icons[group]) || FlaskConical} />
                <h2 id={headingId} className="font-mono text-lg font-medium">
                    {group ? group.replace(/-/g, " ") : "Other"}
                </h2>
            </div>
            <ul className="divide-line mt-2 divide-y">
                {experiments.map((experiment) => {
                    // A private experiment has no repo link; it may still have a homepage.
                    const href = experiment.url ?? experiment.homepageUrl;
                    return (
                        <li key={experiment.slug} className="py-3 last:pb-0">
                            {href ? (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-link inline-flex min-h-11 items-center font-medium hover:underline"
                                >
                                    {experiment.name}
                                </a>
                            ) : (
                                <span className="inline-flex min-h-11 items-center font-medium">
                                    {experiment.name}
                                </span>
                            )}
                            {experiment.description && (
                                <p className="text-ink-2 text-sm">{experiment.description}</p>
                            )}
                            <p className="text-mute mt-2 font-mono text-xs">
                                Pushed <RelativeTime iso={experiment.pushedAt} />
                            </p>
                        </li>
                    );
                })}
            </ul>
        </Panel>
    );
}
