import "server-only";

import { cache } from "react";

import { gql, rest } from "./client";
import { daysAgo, getConfig } from "./config";
import {
    COMMITS_ROUTE,
    CONTRIBUTIONS,
    EVENTS_ROUTE,
    MERGED_PR_COUNT,
    MERGED_PRS,
    RECENT_STARS,
    REPO_BY_NAME,
    REPOS_BY_TOPIC,
    USER_PROFILE,
    prSearchQuery,
    pullRequestsQuery,
    topicSearchQuery,
    type ContributionsNode,
    type ContributionsResponse,
    type EventNode,
    type MergedPrCountResponse,
    type MergedPrsResponse,
    type PullRequestByNumberNode,
    type PullRequestNode,
    type PullRequestsByNumberResponse,
    type RecentStarsResponse,
    type RepoByNameResponse,
    type RepoNode,
    type ReposByTopicResponse,
    type StarEdge,
    type UserNode,
    type UserProfileResponse
} from "./queries";

// Raw GitHub data, one function per source. Each is wrapped in React cache()
// so several getters in one request share a single round trip.

const isPresent = <T>(value: T | null | undefined): value is T => value != null;

export { LAB_TOPIC, SYSTEM_TOPIC } from "./derive";

/** The log shows at most this many PRs; see fetchMergedPrs. */
export const MAX_LOG_PRS = 300;
const LOG_WINDOWS_DAYS = [730, 365, 180, 90, 30];
const REPOS_PER_SEARCH = 8;

export const fetchUser = cache(async (): Promise<UserNode> => {
    const { login } = getConfig();
    const { user } = await gql<UserProfileResponse>(USER_PROFILE, { login });
    if (!user) throw new Error(`GitHub user "${login}" not found`);
    return user;
});

export const fetchTopicRepos = cache(async (topic: string): Promise<RepoNode[]> => {
    const q = topicSearchQuery(topic, getConfig().owners);
    const repos: RepoNode[] = [];

    for (let after: string | null = null; ; ) {
        const { search }: ReposByTopicResponse = await gql(REPOS_BY_TOPIC, { q, after });
        repos.push(...search.nodes.filter(isPresent));
        if (!search.pageInfo.hasNextPage) break;
        after = search.pageInfo.endCursor;
    }
    return repos;
});

/** A repo by "owner/name", or null if it does not exist or the token cannot read it. */
export const fetchRepo = cache(async (nameWithOwner: string): Promise<RepoNode | null> => {
    const [owner, name] = nameWithOwner.split("/");
    const { repository } = await gql<RepoByNameResponse>(REPO_BY_NAME, { owner, name });
    if (!repository) {
        console.warn(`[github] repo ${nameWithOwner} is missing or not readable`);
    }
    return repository;
});

export type MergedPrs = {
    /** Newest first by merge date. */
    prs: PullRequestNode[];
    /** All merged PRs by the owner in these repos, including ones not fetched. */
    total: number;
};

function chunk<T>(items: T[], size: number) {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    return chunks;
}

const isPullRequest = (node: Partial<PullRequestNode> | null): node is PullRequestNode =>
    node != null && typeof node.number === "number" && typeof node.mergedAt === "string";

/**
 * Merged PRs authored by the owner in `repos`.
 *
 * `total` always counts every PR. The PRs themselves are fetched in full when
 * there are at most MAX_LOG_PRS; otherwise only those merged inside the widest
 * recent window that fits. Either way the list is exactly the newest PRs by
 * merge date, which is what lets the log number entries as total − index
 * without downloading the whole history.
 */
export async function fetchMergedPrs(repos: string[]): Promise<MergedPrs> {
    if (repos.length === 0) return { prs: [], total: 0 };

    const { login, now } = getConfig();
    const groups = chunk([...repos].sort(), REPOS_PER_SEARCH);
    let unreadable = 0;

    const firstPages = (since?: Date) =>
        Promise.all(
            groups.map(async (group) => {
                const q = prSearchQuery(login, group, since);
                const { search } = await gql<MergedPrsResponse>(MERGED_PRS, { q, after: null });
                return { q, search };
            })
        );
    const count = (pages: Awaited<ReturnType<typeof firstPages>>) =>
        pages.reduce((sum, page) => sum + page.search.issueCount, 0);

    const allTime = await firstPages();
    const total = count(allTime);

    let pages = allTime;
    if (total > MAX_LOG_PRS) {
        for (const days of LOG_WINDOWS_DAYS) {
            pages = await firstPages(daysAgo(now(), days));
            if (count(pages) <= MAX_LOG_PRS) break;
        }
    }

    const prs = (
        await Promise.all(
            pages.map(async ({ q, search }) => {
                const nodes = [...search.nodes];
                let { hasNextPage, endCursor } = search.pageInfo;

                // Search returns at most 1000 results; 20 pages of 50 reaches that.
                for (let page = 1; hasNextPage && page < 20; page++) {
                    const next = await gql<MergedPrsResponse>(MERGED_PRS, { q, after: endCursor });
                    nodes.push(...next.search.nodes);
                    ({ hasNextPage, endCursor } = next.search.pageInfo);
                }
                unreadable += nodes.filter((node) => node === null).length;
                return nodes.filter(isPullRequest);
            })
        )
    )
        .flat()
        .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
        .slice(0, MAX_LOG_PRS);

    // PRs the token cannot read are counted by search but cannot be shown.
    return { prs, total: Math.max(prs.length, total - unreadable) };
}

/** How many merged PRs the owner has in `repos`, without downloading them. */
export async function countMergedPrs(repos: string[]): Promise<number> {
    if (repos.length === 0) return 0;
    const { login } = getConfig();

    const counts = await Promise.all(
        chunk([...repos].sort(), REPOS_PER_SEARCH).map(async (group) => {
            const q = prSearchQuery(login, group);
            return (await gql<MergedPrCountResponse>(MERGED_PR_COUNT, { q })).search.issueCount;
        })
    );
    return counts.reduce((sum, count) => sum + count, 0);
}

/** Pull requests of `repo` by number; numbers that do not exist are left out. */
export async function fetchPullRequests(
    repo: string,
    numbers: number[]
): Promise<PullRequestByNumberNode[]> {
    const unique = [...new Set(numbers)];
    if (unique.length === 0) return [];

    const [owner, name] = repo.split("/");
    const variables = Object.fromEntries(unique.map((number, i) => [`n${i}`, number]));
    const { repository } = await gql<PullRequestsByNumberResponse>(
        pullRequestsQuery(unique.length),
        { owner, name, ...variables }
    );
    return unique.map((_, i) => repository?.[`p${i}`]).filter(isPresent);
}

async function fetchContributions(from: Date, to: Date): Promise<ContributionsNode> {
    const { login } = getConfig();
    const { user } = await gql<ContributionsResponse>(CONTRIBUTIONS, {
        login,
        from: from.toISOString(),
        to: to.toISOString()
    });
    if (!user) throw new Error(`GitHub user "${login}" not found`);
    return user.contributionsCollection;
}

export type YearContributions = { year: number; contributions: ContributionsNode };

/** One entry per calendar year from account creation to now, oldest first. */
export const fetchYearlyContributions = cache(async (): Promise<YearContributions[]> => {
    const first = new Date((await fetchUser()).createdAt).getUTCFullYear();
    const last = getConfig().now().getUTCFullYear();
    const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);

    return Promise.all(
        years.map(async (year) => ({
            year,
            contributions: await fetchContributions(
                new Date(Date.UTC(year, 0, 1)),
                new Date(Date.UTC(year, 11, 31, 23, 59, 59))
            )
        }))
    );
});

export const RECENT_DAYS = 90;
export const BASELINE_DAYS = 365;

/** The last 90 days, and the 365 days before them — for "currently learning". */
export const fetchRecentContributions = cache(async () => {
    const now = getConfig().now();
    const recentStart = daysAgo(now, RECENT_DAYS);

    const [recent, baseline] = await Promise.all([
        fetchContributions(recentStart, daysAgo(now, -1)),
        fetchContributions(daysAgo(now, RECENT_DAYS + BASELINE_DAYS), recentStart)
    ]);
    return { recent, baseline };
});

export const fetchStars = cache(async (): Promise<StarEdge[]> => {
    const { login } = getConfig();
    const { user } = await gql<RecentStarsResponse>(RECENT_STARS, { login });
    return (user?.starredRepositories.edges ?? []).filter(isPresent);
});

export const fetchEvents = cache(async (): Promise<EventNode[]> => {
    const { login } = getConfig();
    return rest<EventNode[]>(EVENTS_ROUTE, { username: login, per_page: 50 });
});

export const BUILDING_DAYS = 14;

export type CommitCount = { repo: string; commits: number };

/** Commits by the owner in each repo over the last 14 days (capped at 100 per repo). */
export async function fetchCommitCounts(repos: string[]): Promise<CommitCount[]> {
    const { login, now } = getConfig();
    const since = daysAgo(now(), BUILDING_DAYS).toISOString();

    return Promise.all(
        repos.map(async (nameWithOwner) => {
            const [owner, repo] = nameWithOwner.split("/");
            try {
                const commits = await rest<unknown[]>(COMMITS_ROUTE, {
                    owner,
                    repo,
                    author: login,
                    since,
                    per_page: 100
                });
                return { repo: nameWithOwner, commits: commits.length };
            } catch (error) {
                // 409 = empty repository, 404 = not readable. Neither is "building".
                const status = (error as { status?: number }).status;
                if (status === 409 || status === 404) return { repo: nameWithOwner, commits: 0 };
                throw error;
            }
        })
    );
}
