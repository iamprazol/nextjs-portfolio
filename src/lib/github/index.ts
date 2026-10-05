import "server-only";

import { unstable_cache } from "next/cache";

import { env } from "@/env";

import * as data from "./data";
import { recordFetch } from "./observe";
import { tags } from "./revalidation";
import type { LogEntry } from "./schemas";

// The public data API. Every page reads GitHub through these functions.
// Results are cached for an hour and tagged so /api/revalidate can refresh
// them when a webhook arrives (ARCHITECTURE.md §5–6).

export const REVALIDATE_SECONDS = 3600;

export { tags };

// The data cache persists on disk between runs, so the key carries which
// account the data came from.
const SOURCE = `${env.GITHUB_LOGIN}:${env.GITHUB_CONTENT_REPO}:${env.GITHUB_SYSTEM_OWNERS.join(",")}`;

// Mock mode reads local files, so there is nothing to save by caching — and a
// cached copy would keep serving old fixtures after they are regenerated, or
// serve fixture data as live data on the next run.
const cached = <T>(load: () => Promise<T>, key: string[], cacheTags: string[]) => {
    // The loader only runs on a cache miss: note when, for /_data/health.
    const tracked = async () => {
        const value = await load();
        recordFetch(cacheTags);
        return value;
    };

    return env.GITHUB_MOCK
        ? tracked
        : unstable_cache(tracked, [SOURCE, ...key], {
              revalidate: REVALIDATE_SECONDS,
              tags: cacheTags
          });
};

export const getProfile = cached(data.getProfile, ["gh:profile"], [tags.profile]);

export const getSystems = cached(data.getSystems, ["gh:systems"], [tags.systems]);

export const getSystem = (slug: string) =>
    cached(() => data.getSystem(slug), ["gh:system", slug], [tags.systems, tags.system(slug)])();

export const getProblem = (slug: string, problem: string) =>
    cached(
        () => data.getProblem(slug, problem),
        ["gh:problem", slug, problem],
        [tags.systems, tags.system(slug)]
    )();

/** The merged PRs a case study cites. */
export const getProblemEvidence = (slug: string, problem: string) =>
    cached(
        () => data.getProblemEvidence(slug, problem),
        ["gh:problem-evidence", slug, problem],
        [tags.systems, tags.system(slug), tags.log]
    )();

// The log is cached once; filtering and slicing happen outside the cache so
// every combination of options shares one entry.
const getFullLog = cached(data.getFullLog, ["gh:log"], [tags.log, tags.systems]);

export async function getLog(options: { limit?: number; system?: string } = {}): Promise<LogEntry[]> {
    const log = await getFullLog();
    const filtered = options.system
        ? log.filter((entry) => entry.systemSlug === options.system)
        : log;
    return options.limit === undefined ? filtered : filtered.slice(0, options.limit);
}

/** The PR entry numbered #n, or null (hidden, not a PR, or older than the fetched window). */
export async function getLogEntry(n: number): Promise<LogEntry | null> {
    return (await getFullLog()).find((entry) => entry.number === n) ?? null;
}

/** A system's releases with the PRs merged since the one before each. */
export const getReleaseNotes = (slug: string) =>
    cached(
        () => data.getReleaseNotes(slug),
        ["gh:release-notes", slug],
        [tags.systems, tags.system(slug), tags.log]
    )();

export const getTimeline = cached(data.getTimeline, ["gh:timeline"], [tags.timeline, tags.systems]);

export const getNow = cached(data.getNow, ["gh:now"], [tags.now, tags.activity, tags.systems]);

export const getInterests = cached(data.getInterests, ["gh:interests"], [tags.activity, tags.systems]);

export const getActivity = cached(data.getActivity, ["gh:activity"], [tags.activity]);

export const getExperiments = cached(data.getExperiments, ["gh:experiments"], [tags.systems]);

export const getToolUsage = cached(data.getToolUsage, ["gh:tools"], [tags.systems]);

export const getStats = cached(
    data.getStats,
    ["gh:stats"],
    [tags.systems, tags.timeline, tags.log, tags.profile]
);

export { groupTools, type ToolGroup } from "./tool-groups";
export type { ReleaseNotes } from "./derive";
export type * from "./schemas";
