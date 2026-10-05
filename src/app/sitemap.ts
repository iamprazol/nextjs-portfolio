import type { MetadataRoute } from "next";

import { env } from "@/env";
import { getLog, getSystem, getSystems } from "@/lib/github";

export const revalidate = 3600;

// Every page the site has: the fixed routes, then each system, each of its
// case studies and each log entry that has a page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [systems, log] = await Promise.all([getSystems(), getLog()]);
    const details = await Promise.all(systems.map((system) => getSystem(system.slug)));
    const url = (path: string) => `${env.SITE_URL}${path}`;

    const newest = log.map((entry) => entry.date).sort().at(-1);

    return [
        { url: url("/"), lastModified: newest, priority: 1 },
        { url: url("/systems"), priority: 0.9 },
        { url: url("/log"), lastModified: newest, priority: 0.8 },
        { url: url("/timeline"), priority: 0.7 },
        { url: url("/lab"), priority: 0.6 },
        { url: url("/about"), priority: 0.7 },
        { url: url("/resume"), priority: 0.7 },
        ...systems.map((system) => ({
            url: url(`/systems/${system.slug}`),
            lastModified: system.pushedAt,
            priority: 0.8
        })),
        ...details.flatMap((system) =>
            (system?.problems ?? []).map((problem) => ({
                url: url(`/systems/${problem.systemSlug}/problems/${problem.slug}`),
                // A case study's date is optional and written by hand: skip one that is not a date.
                lastModified:
                    problem.date && !Number.isNaN(Date.parse(problem.date)) ? problem.date : undefined,
                priority: 0.7
            }))
        ),
        ...log
            .filter((entry) => entry.number !== null)
            .map((entry) => ({
                url: url(`/log/${entry.number}`),
                lastModified: entry.date,
                priority: 0.4
            }))
    ];
}
