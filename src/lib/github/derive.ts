import type {
    ContributionsNode,
    EventNode,
    PullRequestByNumberNode,
    PullRequestNode,
    ReleaseNode,
    RepoNode,
    StarEdge
} from "./queries";
import type {
    ActivityItem,
    Experiment,
    LogEntry,
    NowState,
    ProblemEvidence,
    Release,
    Stats,
    System,
    SystemMetaFile,
    SystemStatus,
    TimelineYear,
    ToolUsage
} from "./schemas";
import { toSlug } from "./slug";

// The rules of ARCHITECTURE.md §4 as pure functions. Nothing here fetches or
// reads the clock: callers pass the raw GitHub data and `now`.

const DAY_MS = 86_400_000;

export const SYSTEM_TOPIC = "portfolio-system";
export const LAB_TOPIC = "portfolio-lab";
export const HIDE_LABEL = "portfolio:hide";
export const HIGHLIGHT_LABEL = "portfolio:highlight";

const isPresent = <T>(value: T | null | undefined): value is T => value != null;

const withinDays = (iso: string | null | undefined, now: Date, days: number) =>
    iso != null && now.getTime() - new Date(iso).getTime() <= days * DAY_MS;

// ---------------------------------------------------------------------------
// Repos → systems and experiments
// ---------------------------------------------------------------------------

export function topicsOf(repo: Pick<RepoNode, "repositoryTopics">) {
    return repo.repositoryTopics.nodes.filter(isPresent).map((node) => node.topic.name);
}

function toRelease(node: ReleaseNode, isPrivate: boolean): Release | null {
    if (node.isDraft || !node.publishedAt) return null;
    return {
        tag: node.tagName,
        name: node.name?.trim() || null,
        publishedAt: node.publishedAt,
        url: isPrivate ? null : node.url,
        isPrerelease: node.isPrerelease
    };
}

/** Published releases, newest first, without duplicates. */
export function deriveReleases(repo: RepoNode): Release[] {
    const byTag = new Map<string, Release>();
    for (const node of [repo.latestRelease, ...repo.releases.nodes]) {
        const release = node && toRelease(node, repo.isPrivate);
        if (release) byTag.set(release.tag, release);
    }
    return [...byTag.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * archived → null (hidden). Then, first match wins: an explicit override,
 * `portfolio-lab` → experiment, a stable release in the last 12 months →
 * production, pushed in the last 30 days → building, in the last 120 → active,
 * otherwise maintenance.
 */
export function deriveStatus(
    repo: RepoNode,
    now: Date,
    override?: SystemStatus
): SystemStatus | null {
    if (repo.isArchived) return null;
    if (override) return override;
    if (topicsOf(repo).includes(LAB_TOPIC)) return "experiment";

    const stable = deriveReleases(repo).find((release) => !release.isPrerelease);
    if (stable && withinDays(stable.publishedAt, now, 365)) return "production";
    if (withinDays(repo.pushedAt, now, 30)) return "building";
    if (withinDays(repo.pushedAt, now, 120)) return "active";
    return "maintenance";
}

/** Languages by share of bytes (0–1), largest first. */
export function deriveLanguages(repo: RepoNode) {
    const edges = (repo.languages?.edges ?? []).filter(isPresent);
    const total = repo.languages?.totalSize || edges.reduce((sum, edge) => sum + edge.size, 0);
    if (total <= 0) return [];

    return edges
        .map((edge) => ({ name: edge.node.name, share: edge.size / total }))
        .sort((a, b) => b.share - a.share);
}

const isPortfolioTopic = (topic: string) => topic.startsWith("portfolio-");

/** Top 4 languages by bytes, then the repo's topics except `portfolio-*`. */
export function deriveStack(repo: RepoNode): string[] {
    const stack: string[] = [];
    const seen = new Set<string>();

    const candidates = [
        ...deriveLanguages(repo)
            .slice(0, 4)
            .map((language) => language.name),
        ...topicsOf(repo).filter((topic) => !isPortfolioTopic(topic))
    ];
    for (const item of candidates) {
        const key = item.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            stack.push(item);
        }
    }
    return stack;
}

type SystemExtras = { problemCount: number; hasArchitecture: boolean; hasWorkflow: boolean };

/** A System, or null when the repo is archived. */
export function deriveSystem(
    repo: RepoNode,
    meta: SystemMetaFile & { slug: string },
    now: Date,
    extras: SystemExtras
): System | null {
    const status = deriveStatus(repo, now, meta.status);
    if (!status) return null;

    return {
        slug: meta.slug,
        name: meta.name ?? repo.name,
        repo: repo.nameWithOwner,
        description: repo.description?.trim() || null,
        url: repo.isPrivate ? null : repo.url,
        homepageUrl: repo.homepageUrl?.trim() || null,
        isPrivate: repo.isPrivate,
        kind: meta.kind ?? null,
        role: meta.role ?? [],
        proves: meta.proves ?? null,
        order: meta.order ?? null,
        status,
        stack: deriveStack(repo),
        languages: deriveLanguages(repo),
        topics: topicsOf(repo).filter((topic) => !isPortfolioTopic(topic)),
        stars: repo.stargazerCount,
        pushedAt: repo.pushedAt ?? repo.createdAt,
        createdAt: repo.createdAt,
        latestRelease: deriveReleases(repo).find((release) => !release.isPrerelease) ?? null,
        ...extras
    };
}

/** Featured order first (lowest number first), then most recently pushed. */
export function sortSystems<T extends Pick<System, "order" | "pushedAt" | "slug">>(systems: T[]) {
    return [...systems].sort(
        (a, b) =>
            (a.order ?? Infinity) - (b.order ?? Infinity) ||
            b.pushedAt.localeCompare(a.pushedAt) ||
            a.slug.localeCompare(b.slug)
    );
}

/** An Experiment, or null when the repo is archived. */
export function deriveExperiment(repo: RepoNode): Experiment | null {
    if (repo.isArchived) return null;

    return {
        slug: toSlug(repo.name),
        name: repo.name,
        repo: repo.nameWithOwner,
        description: repo.description?.trim() || null,
        url: repo.isPrivate ? null : repo.url,
        homepageUrl: repo.homepageUrl?.trim() || null,
        isPrivate: repo.isPrivate,
        stack: deriveStack(repo),
        stars: repo.stargazerCount,
        pushedAt: repo.pushedAt ?? repo.createdAt,
        createdAt: repo.createdAt
    };
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

type YearContributions = { year: number; contributions: ContributionsNode };

export function deriveStats(input: {
    years: YearContributions[];
    systems: number;
    developersLed: number | null;
    prsMerged: number | null;
    now: Date;
}): Stats {
    const active = input.years
        .filter((entry) => entry.contributions.contributionCalendar.totalContributions > 0)
        .map((entry) => entry.year);
    const firstYear = active.length > 0 ? Math.min(...active) : null;

    return {
        yearsOfEngineering: firstYear === null ? null : input.now.getUTCFullYear() - firstYear,
        firstYear,
        products: input.systems,
        developersLed: input.developersLed,
        prsMerged: input.prsMerged
    };
}

// ---------------------------------------------------------------------------
// Engineering log
// ---------------------------------------------------------------------------

const SUMMARY_MAX = 200;

function stripInlineMarkdown(text: string) {
    return text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
        .replace(/<[^>]+>/g, "") // inline html
        .replace(/`([^`]*)`/g, "$1")
        .replace(/(\*\*|__)(.+?)\1/g, "$2")
        .replace(/(\*|_)(.+?)\1/g, "$2")
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * The first real paragraph of a PR body as plain text, at most 200 characters.
 * Template scaffolding is skipped: comments, headings, checklists, code
 * fences, tables, rules and image-only lines. Returns null if nothing is left.
 */
export function extractSummary(body: string | null | undefined): string | null {
    if (!body) return null;

    const blocks = body
        .replace(/\r\n/g, "\n")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/```[\s\S]*?(```|$)/g, "\n\n")
        .split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            // headings, checklist items, table rows, rules, quotes of nothing
            .filter((line) => !/^(#{1,6}\s|[-*+]\s*\[[ xX]\]|\||[-*_]{3,}$)/.test(line))
            .map((line) => line.replace(/^(>\s*|[-*+]\s+|\d+[.)]\s+)/, ""));

        const text = stripInlineMarkdown(lines.join(" "));
        if (!text) continue;
        if (text.length <= SUMMARY_MAX) return text;

        const cut = text.slice(0, SUMMARY_MAX - 1);
        const atWord = cut.lastIndexOf(" ");
        return `${(atWord > SUMMARY_MAX * 0.6 ? cut.slice(0, atWord) : cut).trimEnd()}…`;
    }
    return null;
}

export const BODY_EXCERPT_MAX = 1200;

/**
 * The first part of a PR description, as markdown, for the log's expanded
 * view: at most `max` characters, cut at a paragraph break where there is one
 * in the last 40%, and without template comments. null if nothing is left.
 */
export function excerptBody(
    body: string | null | undefined,
    max = BODY_EXCERPT_MAX
): { markdown: string; truncated: boolean } | null {
    const text = (body ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim();
    if (!text) return null;
    if (text.length <= max) return { markdown: text, truncated: false };

    const cut = text.slice(0, max);
    const paragraph = cut.lastIndexOf("\n\n");
    return {
        markdown: (paragraph > max * 0.6 ? cut.slice(0, paragraph) : cut).trimEnd(),
        truncated: true
    };
}

/** A repo whose PRs and releases appear in the log: a system or an experiment. */
export type LogSource = {
    repo: string;
    slug: string;
    name: string;
    isPrivate: boolean;
    releases: Release[];
};

/**
 * Merged PRs and stable releases as log entries: pinned first, then newest.
 *
 * `prs` must be the newest merged PRs and `total` the count of all of them, so
 * the newest PR is #total and numbers stay stable as older PRs fall out of the
 * fetched window. A hidden PR keeps its number; it is just not listed.
 */
export function deriveLog(input: {
    prs: PullRequestNode[];
    total: number;
    sources: LogSource[];
}): LogEntry[] {
    const sources = new Map(input.sources.map((source) => [source.repo.toLowerCase(), source]));
    const entries: LogEntry[] = [];

    [...input.prs]
        .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
        .forEach((pr, index) => {
            const source = sources.get(pr.repository.nameWithOwner.toLowerCase());
            const labels = (pr.labels?.nodes ?? []).filter(isPresent).map((label) => label.name);
            if (!source || labels.includes(HIDE_LABEL)) return;

            entries.push({
                id: `pr:${source.repo}#${pr.number}`,
                type: "pr",
                number: input.total - index,
                title: pr.title.trim(),
                summary: extractSummary(pr.body),
                date: pr.mergedAt,
                url: source.isPrivate ? null : pr.url,
                repo: source.repo,
                systemSlug: source.slug,
                systemName: source.name,
                pinned: labels.includes(HIGHLIGHT_LABEL),
                pr: {
                    number: pr.number,
                    additions: pr.additions,
                    deletions: pr.deletions,
                    changedFiles: pr.changedFiles
                },
                releaseTag: null,
                body: null,
                problems: []
            });
        });

    for (const source of input.sources) {
        for (const release of source.releases) {
            if (release.isPrerelease) continue;
            entries.push({
                id: `release:${source.repo}@${release.tag}`,
                type: "release",
                number: null,
                title: release.name ?? release.tag,
                summary: null,
                date: release.publishedAt,
                url: release.url,
                repo: source.repo,
                systemSlug: source.slug,
                systemName: source.name,
                pinned: false,
                pr: null,
                releaseTag: release.tag,
                body: null,
                problems: []
            });
        }
    }

    return entries.sort(
        (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            b.date.localeCompare(a.date) ||
            a.id.localeCompare(b.id)
    );
}

/**
 * The merged PRs behind a case study, newest first. A cited PR that was never
 * merged is not evidence and is dropped. `entries` are the system's log
 * entries, used to point each PR at its place in the log.
 */
export function deriveEvidence(
    prs: PullRequestByNumberNode[],
    entries: LogEntry[],
    isPrivate: boolean
): ProblemEvidence[] {
    const logNumbers = new Map(
        entries.flatMap((entry) => (entry.pr ? [[entry.pr.number, entry.number] as const] : []))
    );

    return prs
        .filter((pr): pr is PullRequestByNumberNode & { mergedAt: string } => pr.mergedAt !== null)
        .map((pr) => ({
            number: pr.number,
            title: pr.title.trim(),
            additions: pr.additions,
            deletions: pr.deletions,
            mergedAt: pr.mergedAt,
            url: isPrivate ? null : pr.url,
            logNumber: logNumbers.get(pr.number) ?? null
        }))
        .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

export type ReleaseNotes = { release: Release; changes: LogEntry[] };

/**
 * Each release with the PRs merged since the release before it, newest
 * release first. The oldest release collects every earlier PR in `entries`.
 * Only PRs present in `entries` can be listed, so a release older than the
 * fetched log window simply has no changes shown.
 */
export function deriveReleaseNotes(releases: Release[], entries: LogEntry[]): ReleaseNotes[] {
    const ordered = [...releases].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const prs = entries
        .filter((entry) => entry.type === "pr")
        .sort((a, b) => b.date.localeCompare(a.date));

    return ordered.map((release, index) => {
        const previous = ordered[index + 1]?.publishedAt;
        return {
            release,
            changes: prs.filter(
                (pr) => pr.date <= release.publishedAt && (!previous || pr.date > previous)
            )
        };
    });
}

// ---------------------------------------------------------------------------
// Now: building / learning / exploring
// ---------------------------------------------------------------------------

/** Share of commits per primary language (0–1). */
function languageShares(contributions: ContributionsNode) {
    const commits = new Map<string, number>();
    let total = 0;

    for (const entry of contributions.commitContributionsByRepository) {
        const language = entry.repository.primaryLanguage?.name;
        const count = entry.contributions.totalCount;
        if (!language || count <= 0) continue;
        commits.set(language, (commits.get(language) ?? 0) + count);
        total += count;
    }
    return new Map([...commits].map(([language, count]) => [language, count / total]));
}

const LEARNING_BASELINE_SHARE = 0.05;
const EXPLORING_DAYS = 60;

export function deriveNow(input: {
    /** Commits by the owner per repo over the last 14 days. */
    commitCounts: { repo: string; commits: number }[];
    sources: Pick<LogSource, "repo" | "slug" | "name">[];
    /** Contributions of the last 90 days… */
    recent: ContributionsNode;
    /** …and of the 365 days before them. */
    baseline: ContributionsNode;
    stars: StarEdge[];
    now: Date;
}): NowState {
    const sources = new Map(input.sources.map((source) => [source.repo.toLowerCase(), source]));

    const busiest = input.commitCounts
        .filter((entry) => entry.commits > 0 && sources.has(entry.repo.toLowerCase()))
        .sort((a, b) => b.commits - a.commits || a.repo.localeCompare(b.repo))[0];
    const building = busiest && sources.get(busiest.repo.toLowerCase());

    const before = languageShares(input.baseline);
    const learning = [...languageShares(input.recent)]
        .filter(([language]) => (before.get(language) ?? 0) < LEARNING_BASELINE_SHARE)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([language]) => language);

    const topicCounts = new Map<string, number>();
    for (const star of input.stars) {
        if (!withinDays(star.starredAt, input.now, EXPLORING_DAYS)) continue;
        for (const topic of topicsOf(star.node)) {
            if (!isPortfolioTopic(topic)) topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
        }
    }
    const exploring = [...topicCounts]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 2)
        .map(([topic]) => topic);

    return {
        building: building
            ? {
                  slug: building.slug,
                  name: building.name,
                  repo: building.repo,
                  commits: busiest.commits
              }
            : null,
        learning,
        exploring,
        asOf: input.now.toISOString()
    };
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

type YearNote = { title?: string; summary?: string; html: string | null };

/**
 * One entry per year with contributions, newest first. Numbers come from
 * GitHub; title, summary and narrative come from the year's note if there is
 * one. Without a note the title is the repo with most commits that year —
 * private repos are never named unless they are listed in `namedRepos`
 * (the systems and experiments the owner chose to publish).
 */
export function deriveTimeline(input: {
    years: YearContributions[];
    notes: Map<number, YearNote>;
    /** Releases of every system and experiment. */
    releases: Pick<Release, "publishedAt">[];
    namedRepos: Map<string, string>;
}): TimelineYear[] {
    return input.years
        .filter((entry) => entry.contributions.contributionCalendar.totalContributions > 0)
        .map(({ year, contributions }) => {
            const note = input.notes.get(year);
            const repos = [...contributions.commitContributionsByRepository].sort(
                (a, b) => b.contributions.totalCount - a.contributions.totalCount
            );
            const topRepo = repos.find(
                (entry) =>
                    entry.contributions.totalCount > 0 &&
                    (!entry.repository.isPrivate ||
                        input.namedRepos.has(entry.repository.nameWithOwner.toLowerCase()))
            )?.repository.nameWithOwner;

            return {
                year,
                totalContributions: contributions.contributionCalendar.totalContributions,
                commits: contributions.totalCommitContributions,
                pullRequests: contributions.totalPullRequestContributions,
                reviews: contributions.totalPullRequestReviewContributions,
                reposContributedTo: contributions.totalRepositoriesWithContributedCommits,
                reposCreated: contributions.totalRepositoryContributions,
                releasesShipped: input.releases.filter(
                    (release) => new Date(release.publishedAt).getUTCFullYear() === year
                ).length,
                topLanguages: [...languageShares(contributions)]
                    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                    .slice(0, 3)
                    .map(([language]) => language),
                title:
                    note?.title ??
                    (topRepo
                        ? (input.namedRepos.get(topRepo.toLowerCase()) ?? topRepo.split("/")[1])
                        : null),
                summary: note?.summary ?? null,
                html: note?.html ?? null
            };
        })
        .sort((a, b) => b.year - a.year);
}

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

function toActivity(event: EventNode): Omit<ActivityItem, "count"> | null {
    if (!event.created_at) return null;
    const repoUrl = `https://github.com/${event.repo.name}`;
    const base = { repo: event.repo.name, at: event.created_at };
    const firstLine = (text: string | null | undefined) => text?.split("\n")[0].trim() || null;

    switch (event.type) {
        case "PushEvent":
            // Newer API versions no longer include commits in the payload.
            return {
                ...base,
                type: "push",
                url: repoUrl,
                message: firstLine(event.payload.commits?.at(-1)?.message)
            };
        case "PullRequestEvent":
            return {
                ...base,
                type: "pr",
                url: event.payload.pull_request?.html_url ?? repoUrl,
                message: firstLine(event.payload.pull_request?.title)
            };
        case "ReleaseEvent":
            return {
                ...base,
                type: "release",
                url: event.payload.release?.html_url ?? repoUrl,
                message: firstLine(event.payload.release?.name ?? event.payload.release?.tag_name)
            };
        default:
            return null;
    }
}

/**
 * The latest push / PR / release events, one item per repo: the newest event
 * for that repo, with `count` = how many such events it had in the feed.
 */
export function deriveActivity(events: EventNode[], limit = 5): ActivityItem[] {
    const byRepo = new Map<string, ActivityItem>();

    const items = events
        .map(toActivity)
        .filter(isPresent)
        .sort((a, b) => b.at.localeCompare(a.at));

    for (const item of items) {
        const existing = byRepo.get(item.repo);
        if (existing) existing.count++;
        else byRepo.set(item.repo, { ...item, count: 1 });
    }
    return [...byRepo.values()].slice(0, limit);
}

// ---------------------------------------------------------------------------
// Tools tied to work
// ---------------------------------------------------------------------------

/** Each language and topic used by a system, with the systems that use it. */
export function deriveToolUsage(
    systems: Pick<System, "slug" | "name" | "languages" | "topics">[]
): ToolUsage[] {
    const tools = new Map<string, ToolUsage>();

    const add = (name: string, kind: ToolUsage["kind"], system: { slug: string; name: string }) => {
        const key = name.toLowerCase();
        // A language wins over a topic of the same name ("PHP" vs "php").
        const tool = tools.get(key) ?? { name, kind, systems: [] };
        if (kind === "language" && tool.kind === "topic") {
            tool.kind = "language";
            tool.name = name;
        }
        if (!tool.systems.some((item) => item.slug === system.slug)) tool.systems.push(system);
        tools.set(key, tool);
    };

    for (const system of systems) {
        const ref = { slug: system.slug, name: system.name };
        for (const language of system.languages) add(language.name, "language", ref);
        for (const topic of system.topics) add(topic, "topic", ref);
    }

    return [...tools.values()].sort(
        (a, b) => b.systems.length - a.systems.length || a.name.localeCompare(b.name)
    );
}
