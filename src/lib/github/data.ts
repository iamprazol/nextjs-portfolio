import "server-only";

import { cache } from "react";

import { getConfig } from "./config";
import {
    loadArchitecture,
    loadDeclaredSystemRepos,
    loadProblems,
    loadProfile,
    loadSystemMeta,
    loadTimelineNote,
    loadWorkflow
} from "./content";
import {
    LAB_TOPIC,
    SYSTEM_TOPIC,
    deriveActivity,
    deriveExperiment,
    deriveLog,
    deriveNow,
    deriveReleaseNotes,
    deriveReleases,
    deriveStats,
    deriveSystem,
    deriveTimeline,
    deriveToolUsage,
    sortSystems,
    topicsOf,
    type LogSource,
    type ReleaseNotes
} from "./derive";
import type { RepoNode } from "./queries";
import type {
    ActivityItem,
    Experiment,
    LogEntry,
    NowState,
    Problem,
    ProfileData,
    Stats,
    System,
    SystemDetail,
    TimelineYear,
    ToolUsage
} from "./schemas";
import {
    countMergedPrs,
    fetchCommitCounts,
    fetchEvents,
    fetchMergedPrs,
    fetchRecentContributions,
    fetchRepo,
    fetchStars,
    fetchTopicRepos,
    fetchYearlyContributions
} from "./sources";

// The data layer without the Next cache: sources → content → derive.
// index.ts wraps these in unstable_cache; scripts and tests call them directly.

const isPresent = <T>(value: T | null | undefined): value is T => value != null;
const key = (repo: string) => repo.toLowerCase();

type World = {
    systems: SystemDetail[];
    /** Full problems (with HTML) per system slug. */
    problems: Map<string, Problem[]>;
    experiments: Experiment[];
    /** Every repo whose PRs and releases feed the log. */
    sources: LogSource[];
    systemRepos: string[];
};

async function loadSystem(repo: RepoNode, now: Date) {
    const meta = await loadSystemMeta(repo.nameWithOwner);
    const [problems, architecture, workflow] = await Promise.all([
        loadProblems(repo.nameWithOwner, meta),
        loadArchitecture(repo.nameWithOwner, meta),
        loadWorkflow(repo.nameWithOwner, meta)
    ]);

    const system = deriveSystem(repo, meta, now, {
        problemCount: problems.length,
        hasArchitecture: architecture !== null,
        hasWorkflow: workflow !== null
    });
    if (!system) return null;

    const detail: SystemDetail = {
        ...system,
        releases: deriveReleases(repo),
        architecture,
        workflow,
        problems: problems.map((problem) => ({
            number: problem.number,
            title: problem.title,
            summary: problem.summary,
            role: problem.role,
            tradeoffs: problem.tradeoffs,
            result: problem.result,
            constraints: problem.constraints,
            relatedPRs: problem.relatedPRs,
            nodes: problem.nodes,
            date: problem.date,
            slug: problem.slug,
            systemSlug: problem.systemSlug
        }))
    };
    return { detail, problems };
}

/** Systems, experiments and their content — the base of nearly every getter. */
const loadWorld = cache(async (): Promise<World> => {
    const now = getConfig().now();
    const [tagged, labs, declared] = await Promise.all([
        fetchTopicRepos(SYSTEM_TOPIC),
        fetchTopicRepos(LAB_TOPIC),
        loadDeclaredSystemRepos()
    ]);

    // Systems are tagged repos plus repos declared in the content repo.
    const known = new Set(tagged.map((repo) => key(repo.nameWithOwner)));
    const extra = await Promise.all(
        [...new Set(declared.map(key))].filter((repo) => !known.has(repo)).map(fetchRepo)
    );
    // A repo tagged portfolio-lab is an experiment, whatever else it carries.
    const candidates = [...tagged, ...extra.filter(isPresent)].filter(
        (repo) => !topicsOf(repo).includes(LAB_TOPIC)
    );

    const loaded = (await Promise.all(candidates.map((repo) => loadSystem(repo, now)))).filter(
        isPresent
    );

    const systems: SystemDetail[] = [];
    const problems = new Map<string, Problem[]>();
    for (const item of sortSystems(loaded.map((entry) => entry.detail))) {
        if (problems.has(item.slug)) {
            console.warn(`[github] duplicate system slug "${item.slug}" (${item.repo}) skipped`);
            continue;
        }
        systems.push(item);
        problems.set(item.slug, loaded.find((entry) => entry.detail === item)!.problems);
    }

    const labRepos = labs.filter((repo) => !repo.isArchived);
    const experiments = labRepos
        .map(deriveExperiment)
        .filter(isPresent)
        .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

    return {
        systems,
        problems,
        experiments,
        systemRepos: systems.map((system) => system.repo),
        sources: [
            ...systems.map((system) => ({
                repo: system.repo,
                slug: system.slug,
                name: system.name,
                isPrivate: system.isPrivate,
                releases: system.releases
            })),
            ...labRepos.map((repo) => ({
                repo: repo.nameWithOwner,
                slug: deriveExperiment(repo)!.slug,
                name: repo.name,
                isPrivate: repo.isPrivate,
                releases: deriveReleases(repo)
            }))
        ]
    };
});

/** A system without its heavy fields, for list views. */
function toSystem(detail: SystemDetail): System {
    const system: Partial<SystemDetail> = { ...detail };
    delete system.releases;
    delete system.architecture;
    delete system.workflow;
    delete system.problems;
    return system as System;
}

export function getProfile(): Promise<ProfileData> {
    return loadProfile();
}

export async function getSystems(): Promise<System[]> {
    return (await loadWorld()).systems.map(toSystem);
}

export async function getSystem(slug: string): Promise<SystemDetail | null> {
    return (await loadWorld()).systems.find((system) => system.slug === slug) ?? null;
}

export async function getProblem(slug: string, problem: string): Promise<Problem | null> {
    const problems = (await loadWorld()).problems.get(slug) ?? [];
    return problems.find((item) => item.slug === problem) ?? null;
}

type MergedPrsOfSources = { total: number; log: LogEntry[] };

const loadLog = cache(async (): Promise<MergedPrsOfSources> => {
    const { sources } = await loadWorld();
    const { prs, total } = await fetchMergedPrs(sources.map((source) => source.repo));
    return { total, log: deriveLog({ prs, total, sources }) };
});

/** The whole log: pinned entries first, then newest. */
export async function getFullLog(): Promise<LogEntry[]> {
    return (await loadLog()).log;
}

/** A system's releases, each with the PRs merged since the one before. Null for an unknown slug. */
export async function getReleaseNotes(slug: string): Promise<ReleaseNotes[] | null> {
    const [world, { log }] = await Promise.all([loadWorld(), loadLog()]);
    const system = world.systems.find((item) => item.slug === slug);
    if (!system) return null;

    return deriveReleaseNotes(
        system.releases,
        log.filter((entry) => entry.systemSlug === slug)
    );
}

export async function getTimeline(): Promise<TimelineYear[]> {
    const [years, { sources }] = await Promise.all([fetchYearlyContributions(), loadWorld()]);
    const notes = await Promise.all(
        years.map(async ({ year }) => [year, await loadTimelineNote(year)] as const)
    );

    return deriveTimeline({
        years,
        notes: new Map(notes.flatMap(([year, note]) => (note ? [[year, note] as const] : []))),
        // Prereleases are not "shipped", matching the log.
        releases: sources.flatMap((source) =>
            source.releases.filter((release) => !release.isPrerelease)
        ),
        namedRepos: new Map(sources.map((source) => [key(source.repo), source.name]))
    });
}

export async function getNow(): Promise<NowState> {
    const { sources } = await loadWorld();
    const [commitCounts, { recent, baseline }, stars] = await Promise.all([
        fetchCommitCounts(sources.map((source) => source.repo)),
        fetchRecentContributions(),
        fetchStars()
    ]);

    return deriveNow({ commitCounts, sources, recent, baseline, stars, now: getConfig().now() });
}

export async function getActivity(): Promise<ActivityItem[]> {
    return deriveActivity(await fetchEvents());
}

export async function getExperiments(): Promise<Experiment[]> {
    return (await loadWorld()).experiments;
}

export async function getToolUsage(): Promise<ToolUsage[]> {
    return deriveToolUsage((await loadWorld()).systems);
}

export async function getStats(): Promise<Stats> {
    const [years, world, profile] = await Promise.all([
        fetchYearlyContributions(),
        loadWorld(),
        loadProfile()
    ]);

    return deriveStats({
        years,
        systems: world.systems.length,
        developersLed: profile.leadership?.developersLed ?? null,
        // With no systems there is nothing to count: hide the stat rather than show 0.
        prsMerged: world.systemRepos.length > 0 ? await countMergedPrs(world.systemRepos) : null,
        now: getConfig().now()
    });
}
