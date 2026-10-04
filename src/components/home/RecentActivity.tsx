import { ArrowRight } from "lucide-react";

import { RelativeTime } from "@/components/ui";
import type { ActivityItem } from "@/lib/github";

// What happened, when the event itself carries no message. GitHub's feed no
// longer includes commit messages for pushes.
const fallback: Record<ActivityItem["type"], (count: number) => string> = {
    push: (count) => (count === 1 ? "1 push" : `${count} pushes`),
    pr: () => "Pull request",
    release: () => "Release"
};

type RecentActivityProps = { activity: ActivityItem[]; githubUrl: string };

/** Latest public GitHub activity. Uses the terminal colors, dark in both themes. */
export function RecentActivity({ activity, githubUrl }: RecentActivityProps) {
    return (
        <section
            aria-labelledby="recent-activity"
            className="bg-term text-term-ink border-line-2 rounded-xl border p-5"
        >
            <div className="flex items-center justify-between gap-4">
                <h3
                    id="recent-activity"
                    className="text-term-mute font-mono text-[11px] tracking-[.16em] uppercase"
                >
                    GitHub activity
                </h3>
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-term-ink -my-3 inline-flex min-h-11 items-center gap-1 font-mono text-xs hover:underline"
                >
                    View
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                </a>
            </div>

            <ul className="mt-3 space-y-4">
                {activity.map((item) => (
                    <li key={`${item.repo}:${item.at}`} className="flex items-start gap-3">
                        <span aria-hidden="true" className="text-term-mute font-mono text-sm">
                            ▸
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-sm">{item.repo}</span>
                            <span className="text-term-mute block truncate text-sm">
                                {item.message ?? fallback[item.type](item.count)}
                            </span>
                        </span>
                        <RelativeTime
                            iso={item.at}
                            className="text-term-mute shrink-0 font-mono text-xs"
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
