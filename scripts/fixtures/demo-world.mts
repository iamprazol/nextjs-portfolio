/**
 * A small, entirely fictional GitHub account used to generate the committed
 * fixtures. Nothing here describes real work: the owner, repos, PRs and
 * numbers are invented so mock mode has every kind of case to render —
 * each status, a private repo, an archived repo, hidden and pinned PRs,
 * a content-repo-only system, experiments, and a quiet year.
 *
 * Mock mode exists for local development and tests only; env.ts rejects it
 * in a production deploy.
 */
import type { Transport } from "../../src/lib/github/client";
import {
    COMMITS_ROUTE,
    EVENTS_ROUTE,
    type ContributionsNode,
    type EventNode,
    type PullRequestNode,
    type ReleaseNode,
    type RepoNode,
    type StarEdge,
    type UserNode
} from "../../src/lib/github/queries";
import { resolveRepoFiles } from "../../src/lib/github/testing/fake-files";

export const DEMO_NOW = new Date("2026-10-01T12:00:00Z");
export const DEMO_CONFIG = {
    login: "demo-dev",
    owners: ["demo-dev", "demo-labs"],
    contentRepo: { owner: "demo-dev", name: "demo-dev" }
};

const DAY = 86_400_000;
const ago = (days: number, hour = 9) => {
    const date = new Date(DEMO_NOW.getTime() - days * DAY);
    date.setUTCHours(hour, 0, 0, 0);
    return date.toISOString();
};

const user: UserNode = {
    login: "demo-dev",
    name: "Demo Developer",
    bio: "Fictional account for local development",
    location: "Example City",
    websiteUrl: "https://demo-dev.example",
    avatarUrl: "https://avatars.githubusercontent.com/u/0?v=4",
    url: "https://github.com/demo-dev",
    createdAt: "2019-04-02T08:00:00Z"
};

const release = (repo: string, tagName: string, days: number, extra: Partial<ReleaseNode> = {}): ReleaseNode => ({
    tagName,
    name: null,
    publishedAt: ago(days, 14),
    isPrerelease: false,
    isDraft: false,
    url: `https://github.com/${repo}/releases/tag/${tagName}`,
    ...extra
});

function repo(
    nameWithOwner: string,
    options: {
        description: string | null;
        topics: string[];
        languages: [string, number][];
        pushedDaysAgo: number;
        createdAt: string;
        stars?: number;
        homepageUrl?: string;
        isPrivate?: boolean;
        isArchived?: boolean;
        releases?: ReleaseNode[];
    }
): RepoNode {
    const releases = options.releases ?? [];
    const stable = releases
        .filter((item) => !item.isPrerelease && !item.isDraft)
        .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))[0];

    return {
        nameWithOwner,
        name: nameWithOwner.split("/")[1],
        description: options.description,
        url: `https://github.com/${nameWithOwner}`,
        homepageUrl: options.homepageUrl ?? null,
        isArchived: options.isArchived ?? false,
        isPrivate: options.isPrivate ?? false,
        pushedAt: ago(options.pushedDaysAgo, 16),
        createdAt: options.createdAt,
        stargazerCount: options.stars ?? 0,
        repositoryTopics: { nodes: options.topics.map((name) => ({ topic: { name } })) },
        languages: {
            totalSize: options.languages.reduce((sum, [, size]) => sum + size, 0),
            edges: options.languages.map(([name, size]) => ({ size, node: { name } }))
        },
        latestRelease: stable ?? null,
        releases: { nodes: [...releases].sort((a, b) => a.publishedAt!.localeCompare(b.publishedAt!)) }
    };
}

const ATLAS = "demo-labs/atlas-membership";
const RELAY = "demo-dev/relay-qa";
const DOCSMITH = "demo-labs/docsmith";
const FORMKIT = "demo-dev/formkit-legacy";
const IMPORTER = "demo-dev/old-importer";
const VECTOR = "demo-dev/vector-notes";
const SHELL = "demo-dev/tiny-shell";
const CONTENT = "demo-dev/demo-dev";

const repos: RepoNode[] = [
    repo(ATLAS, {
        description: "Membership and access control plugin (demo data)",
        topics: ["portfolio-system", "wordpress", "membership", "rest-api"],
        languages: [["PHP", 620_000], ["JavaScript", 210_000], ["SCSS", 60_000], ["HTML", 20_000], ["Shell", 5_000]],
        pushedDaysAgo: 2,
        createdAt: "2020-02-10T10:00:00Z",
        stars: 184,
        homepageUrl: "https://atlas.example",
        releases: [
            release(ATLAS, "v4.0.0", 210, { name: "4.0 — multi-membership" }),
            release(ATLAS, "v4.1.0", 95),
            release(ATLAS, "v4.2.0", 20, { name: "4.2 — faster checkout" }),
            release(ATLAS, "v4.3.0-beta.1", 5, { isPrerelease: true })
        ]
    }),
    repo(RELAY, {
        description: "Browser test runner that repairs its own selectors (demo data)",
        topics: ["portfolio-system", "playwright", "testing", "ai"],
        languages: [["TypeScript", 300_000], ["JavaScript", 20_000]],
        pushedDaysAgo: 1,
        createdAt: "2025-11-03T10:00:00Z",
        stars: 27
    }),
    // No topic: this one is a system only because the content repo declares it. Private.
    repo(DOCSMITH, {
        description: "Docs site generator for plugin teams (demo data)",
        topics: ["documentation", "mdx"],
        languages: [["TypeScript", 140_000], ["MDX", 60_000], ["CSS", 12_000]],
        pushedDaysAgo: 70,
        createdAt: "2023-06-20T10:00:00Z",
        isPrivate: true,
        releases: [release(DOCSMITH, "v1.0.0", 500)]
    }),
    // Tagged, but with no metadata files at all.
    repo(FORMKIT, {
        description: null,
        topics: ["portfolio-system", "forms"],
        languages: [["PHP", 90_000], ["JavaScript", 30_000]],
        pushedDaysAgo: 300,
        createdAt: "2019-08-15T10:00:00Z",
        stars: 12,
        releases: [release(FORMKIT, "v2.0.0-rc.1", 320, { isPrerelease: true })]
    }),
    repo(IMPORTER, {
        description: "Archived importer (demo data)",
        topics: ["portfolio-system"],
        languages: [["PHP", 10_000]],
        pushedDaysAgo: 900,
        createdAt: "2019-05-01T10:00:00Z",
        isArchived: true
    }),
    repo(VECTOR, {
        description: "Local semantic search over markdown notes (demo data)",
        topics: ["portfolio-lab", "embeddings", "sqlite"],
        languages: [["Python", 40_000], ["Shell", 2_000]],
        pushedDaysAgo: 9,
        createdAt: "2026-07-12T10:00:00Z",
        stars: 5
    }),
    repo(SHELL, {
        description: "A shell in 500 lines (demo data)",
        topics: ["portfolio-lab", "cli"],
        languages: [["Rust", 18_000]],
        pushedDaysAgo: 45,
        createdAt: "2026-05-02T10:00:00Z",
        stars: 2,
        releases: [release(SHELL, "v0.1.0", 40)]
    })
];

const diagram = (nodes: [string, string][], edges: [string, string][]) => ({
    nodes: nodes.map(([id, label]) => ({ id, label })),
    edges: edges.map(([from, to]) => ({ from, to }))
});

const files: Record<string, string> = {
    [`${CONTENT}:README.md`]: "# demo-dev\n",
    [`${CONTENT}:portfolio/profile.json`]: JSON.stringify({
        name: "Demo Developer",
        headline: "Software Engineer / Product Builder",
        intro: "Fictional profile used for local development. Real content comes from the content repo.",
        location: { label: "Example City, EX", lat: 27.7172, lng: 85.324, timezone: "Asia/Kathmandu" },
        links: { github: "https://github.com/demo-dev", linkedin: "", x: "", email: "demo@demo-dev.example" },
        howIWork: [
            "Understand the system before changing it",
            "Find the real constraint",
            "Ship the smallest change that proves the idea",
            "Leave the code easier to change than I found it"
        ],
        leadership: { developersLed: 6, since: "2022" }
    }),
    [`${CONTENT}:portfolio/systems/docsmith.json`]: JSON.stringify({
        repo: DOCSMITH,
        name: "DocSmith",
        kind: "Documentation Tool",
        role: ["Product Engineering"],
        proves: "A docs pipeline a whole team can run without a build engineer",
        order: 3
    }),
    [`${CONTENT}:portfolio/systems/relay-qa/problems/flaky-selectors.md`]: [
        "---",
        "number: 1",
        "title: Tests that broke every time the markup changed",
        "summary: Selectors were tied to class names, so harmless refactors failed the suite.",
        "role: [Designed the repair loop, Built the selector scorer]",
        "tradeoffs: [Slower first run, Needs a snapshot store]",
        "result: [Refactors no longer fail unrelated tests]",
        "relatedPRs: [51, 55]",
        "date: 2026-09-10",
        "---",
        "## The Problem",
        "",
        "Every markup refactor broke tests that had nothing to do with the change.",
        "",
        "## The Approach",
        "",
        "Score candidate selectors by stability, then **repair** a failing one from the last good snapshot.",
        "",
        "| Selector kind | Survived refactors |",
        "| --- | --- |",
        "| class name | rarely |",
        "| role + name | usually |",
        ""
    ].join("\n"),
    [`${CONTENT}:portfolio/timeline/2024.md`]: [
        "---",
        "title: The multi-membership rewrite",
        "summary: Most of the year went into replacing the single-membership data model.",
        "---",
        "Planned the migration in the spring and shipped it behind a flag in the autumn.",
        ""
    ].join("\n"),

    [`${ATLAS}:.portfolio/system.json`]: JSON.stringify({
        name: "Atlas Membership",
        kind: "WordPress Product",
        role: ["Product Engineering", "Architecture"],
        proves: "Evolving a legacy data model without breaking existing sites",
        order: 1
    }),
    [`${ATLAS}:.portfolio/architecture.json`]: JSON.stringify(
        diagram(
            [["atlas", "Atlas"], ["membership", "Membership"], ["payments", "Payments"], ["users", "Users"], ["core", "WordPress Core"], ["db", "Database"]],
            [["atlas", "membership"], ["atlas", "payments"], ["atlas", "users"], ["membership", "core"], ["payments", "core"], ["users", "core"], ["core", "db"], ["db", "core"]]
        )
    ),
    [`${ATLAS}:.portfolio/problems/multi-membership.md`]: [
        "---",
        "number: 1",
        "title: Moving from single-membership to multi-membership",
        "summary: The original model assumed one membership per user.",
        "role: [Designed the new data model, Wrote the migration]",
        "tradeoffs: [More complex queries, Larger test matrix]",
        "result: [Users can hold several memberships, No breaking changes for existing sites]",
        "constraints: [Existing sites must keep working, No downtime during migration]",
        "relatedPRs: [380, 398]",
        "date: 2026-03-05",
        "diagrams:",
        "  before:",
        "    nodes: [{ id: user, label: User }, { id: plan, label: Membership }]",
        "    edges: [{ from: user, to: plan }]",
        "  after:",
        "    nodes: [{ id: user, label: User }, { id: link, label: Subscription }, { id: a, label: Membership A }, { id: b, label: Membership B }]",
        "    edges: [{ from: user, to: link }, { from: link, to: a }, { from: link, to: b }]",
        "---",
        "## The Problem",
        "",
        "A user row stored a single membership id, and dozens of checks read it directly.",
        "",
        "## The Decision",
        "",
        "Introduce a subscription table and keep the old column as a read-only mirror for one major version.",
        ""
    ].join("\n"),
    [`${ATLAS}:.portfolio/problems/checkout-race.md`]: [
        "---",
        "number: 2",
        "title: Double charges under concurrent checkout",
        "summary: Two webhook deliveries could both activate the same order.",
        "relatedPRs: [409]",
        "---",
        "## The Problem",
        "",
        "Payment webhooks are delivered at least once, and the handler was not idempotent.",
        ""
    ].join("\n"),

    [`${RELAY}:.portfolio/system.json`]: JSON.stringify({
        name: "Relay QA",
        kind: "AI QA Framework",
        role: ["Design", "Engineering"],
        proves: "Test suites can survive refactors",
        order: 2
    }),
    [`${RELAY}:.portfolio/workflow.json`]: JSON.stringify({
        steps: [
            { title: "Record", subtitle: "Capture the flow", detail: "Run the flow once and store a DOM snapshot per step.", node: "record" },
            { title: "Run", subtitle: "Replay in CI", detail: "Replay the steps against the current build.", node: "run" },
            { title: "Repair", subtitle: "Fix broken selectors", detail: "When a selector fails, pick the best match from the snapshot and propose a patch.", node: "repair" }
        ],
        ...diagram(
            [["record", "Recorder"], ["run", "Runner"], ["repair", "Repair loop"], ["store", "Snapshot store"]],
            [["record", "run"], ["run", "repair"], ["repair", "store"], ["store", "repair"]]
        )
    })
};

function pr(
    repoName: string,
    number: number,
    days: number,
    title: string,
    body: string,
    labels: string[] = [],
    size: [number, number] = [120, 30]
): PullRequestNode {
    return {
        number,
        title,
        body,
        mergedAt: ago(days, 11),
        url: `https://github.com/${repoName}/pull/${number}`,
        additions: size[0],
        deletions: size[1],
        labels: { nodes: labels.map((name) => ({ name })) },
        repository: { nameWithOwner: repoName }
    };
}

const TEMPLATE = "<!-- Describe your change -->\n\n## Description\n\n";

const prs: PullRequestNode[] = [
    pr(RELAY, 58, 1, "Retry a repaired selector once before failing", `${TEMPLATE}A repaired selector is now retried once, so a single slow render no longer fails the run.\n\n## Checklist\n\n- [x] Tests added`, [], [86, 12]),
    pr(ATLAS, 412, 3, "Make webhook activation idempotent", `${TEMPLATE}Order activation now takes a row lock and records the webhook id, so a redelivered event is a no-op.\n\n- [x] Tested with duplicate deliveries`, ["portfolio:highlight", "bug"], [240, 61]),
    pr(RELAY, 55, 4, "Score selectors by stability", "Ranks role and label selectors above class names when choosing a replacement.", [], [310, 44]),
    pr(ATLAS, 409, 6, "Lock the order row during checkout", "Prevents two checkout requests from activating the same order.", [], [95, 20]),
    pr(VECTOR, 4, 9, "Chunk notes by heading before embedding", "Splits each note at its headings so results point at a section, not a whole file.", [], [140, 15]),
    pr(ATLAS, 405, 12, "Bump dev dependencies", "", ["portfolio:hide"], [8, 8]),
    pr(RELAY, 51, 15, "Store a DOM snapshot per step", "Each recorded step now keeps the DOM it ran against, which the repair loop reads later.", [], [420, 30]),
    pr(ATLAS, 398, 25, "Migrate existing users to subscriptions", "", [], [530, 210]),
    pr(SHELL, 2, 45, "Add pipes", "Supports `a | b` by wiring stdout to stdin between two child processes.", [], [160, 22]),
    pr(RELAY, 40, 50, "First working recorder", "Records clicks and typing into a replayable script.", [], [900, 0]),
    pr(ATLAS, 380, 60, "Add the subscriptions table", "Introduces the table that lets one user hold several memberships. The old column stays as a mirror.", ["portfolio:highlight"], [340, 12]),
    pr(DOCSMITH, 23, 72, "Build search index at compile time", "Moves search indexing out of the browser.", [], [210, 95]),
    pr(ATLAS, 371, 100, "Cache membership checks per request", "Avoids repeating the same access query for every block on a page.", [], [70, 18]),
    pr(FORMKIT, 9, 310, "Fix file upload on multisite", "Uses the site's own upload directory instead of the network's.", [], [24, 6]),
    pr(IMPORTER, 3, 950, "Last change before archiving", "Final cleanup.", [], [5, 40])
];

type RepoCommits = [repo: string, language: string | null, commits: number, isPrivate?: boolean];

function contributions(
    byRepo: RepoCommits[],
    extra: { prs: number; reviews: number; reposCreated: number; other?: number }
): ContributionsNode {
    const commits = byRepo.reduce((sum, entry) => sum + entry[2], 0);
    return {
        totalCommitContributions: commits,
        totalPullRequestContributions: extra.prs,
        totalPullRequestReviewContributions: extra.reviews,
        totalRepositoryContributions: extra.reposCreated,
        totalRepositoriesWithContributedCommits: byRepo.length,
        commitContributionsByRepository: byRepo.map(([nameWithOwner, language, count, isPrivate]) => ({
            repository: {
                nameWithOwner,
                isPrivate: isPrivate ?? false,
                primaryLanguage: language ? { name: language } : null
            },
            contributions: { totalCount: count }
        })),
        contributionCalendar: { totalContributions: commits + extra.prs + extra.reviews + (extra.other ?? 0) }
    };
}

const EMPTY = contributions([], { prs: 0, reviews: 0, reposCreated: 0 });

const yearly: Record<number, ContributionsNode> = {
    2019: contributions([[FORMKIT, "PHP", 140], [IMPORTER, "PHP", 60]], { prs: 12, reviews: 2, reposCreated: 2 }),
    2020: contributions([[ATLAS, "PHP", 410], [FORMKIT, "PHP", 90]], { prs: 48, reviews: 15, reposCreated: 1 }),
    // A year with no contributions: it must not appear in the timeline.
    2021: EMPTY,
    2022: contributions([[ATLAS, "PHP", 520], ["demo-labs/internal-billing", "PHP", 700, true]], { prs: 96, reviews: 140, reposCreated: 0 }),
    2023: contributions([[ATLAS, "PHP", 380], [DOCSMITH, "TypeScript", 260, true]], { prs: 71, reviews: 190, reposCreated: 1 }),
    2024: contributions([[ATLAS, "PHP", 640], [DOCSMITH, "TypeScript", 120, true], [FORMKIT, "PHP", 30]], { prs: 110, reviews: 230, reposCreated: 0 }),
    2025: contributions([[ATLAS, "PHP", 450], [RELAY, "TypeScript", 90], [FORMKIT, "PHP", 12]], { prs: 84, reviews: 260, reposCreated: 1 }),
    2026: contributions([[RELAY, "TypeScript", 310], [ATLAS, "PHP", 280], [VECTOR, "Python", 22], [SHELL, "Rust", 31]], { prs: 67, reviews: 175, reposCreated: 2 })
};

const recent = contributions([[RELAY, "TypeScript", 80], [ATLAS, "PHP", 60], [SHELL, "Rust", 14], [VECTOR, "Python", 9]], { prs: 14, reviews: 40, reposCreated: 1 });
const baseline = contributions([[ATLAS, "PHP", 400], [RELAY, "TypeScript", 150], [DOCSMITH, "TypeScript", 30, true], [FORMKIT, "PHP", 20], [VECTOR, "Python", 10]], { prs: 80, reviews: 220, reposCreated: 2 });

const star = (name: string, days: number, topics: string[]): StarEdge => ({
    starredAt: ago(days),
    node: { nameWithOwner: name, repositoryTopics: { nodes: topics.map((topic) => ({ topic: { name: topic } })) } }
});

const stars: StarEdge[] = [
    star("example/agent-kit", 3, ["agents", "llm"]),
    star("example/evals", 11, ["llm", "evaluation"]),
    star("example/browser-agent", 24, ["agents", "playwright"]),
    star("example/sqlite-vec", 48, ["sqlite", "embeddings"]),
    star("example/old-favorite", 140, ["php"]),
    star("example/untagged", 200, [])
];

const event = (id: number, type: string, repoName: string, hours: number, payload: EventNode["payload"] = {}): EventNode => ({
    id: String(id),
    type,
    created_at: new Date(DEMO_NOW.getTime() - hours * 3_600_000).toISOString(),
    repo: { name: repoName },
    payload
});

const events: EventNode[] = [
    event(9007, "PushEvent", RELAY, 3, { ref: "refs/heads/main" }),
    event(9006, "PullRequestEvent", RELAY, 20, { action: "closed", pull_request: { title: "Retry a repaired selector once before failing", html_url: `https://github.com/${RELAY}/pull/58`, merged: true, number: 58 } }),
    event(9005, "WatchEvent", "example/agent-kit", 30),
    event(9004, "PushEvent", ATLAS, 50, { ref: "refs/heads/develop" }),
    event(9003, "PullRequestEvent", ATLAS, 70, { action: "closed", pull_request: { title: "Make webhook activation idempotent", html_url: `https://github.com/${ATLAS}/pull/412`, merged: true, number: 412 } }),
    event(9002, "ReleaseEvent", ATLAS, 480, { action: "published", release: { name: "4.2 — faster checkout", tag_name: "v4.2.0", html_url: `https://github.com/${ATLAS}/releases/tag/v4.2.0` } }),
    event(9001, "PushEvent", VECTOR, 216, { ref: "refs/heads/main" }),
    event(9000, "CreateEvent", VECTOR, 1900, { ref: "main" })
];

/** Commits by the owner in the last 14 days. */
const recentCommits: Record<string, number> = { [RELAY]: 23, [ATLAS]: 11, [VECTOR]: 4 };

const operation = (query: string) => query.match(/\bquery\s+(\w+)/)?.[1];
const lower = (value: string) => value.toLowerCase();

function searchPrs(q: string) {
    const names = [...q.matchAll(/repo:(\S+)/g)].map((match) => lower(match[1]));
    const since = q.match(/merged:>=(\S+)/)?.[1];
    return prs
        .filter((item) => names.includes(lower(item.repository.nameWithOwner)))
        .filter((item) => !since || item.mergedAt.slice(0, 10) >= since)
        .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

function contributionsFor(from: string, to: string) {
    const start = new Date(from);
    const end = new Date(to);
    const calendarYear =
        start.getUTCMonth() === 0 && start.getUTCDate() === 1 && end.getUTCMonth() === 11 && end.getUTCDate() === 31;
    if (calendarYear) return yearly[start.getUTCFullYear()] ?? EMPTY;
    return end.getTime() - start.getTime() < 120 * DAY ? recent : baseline;
}

export const demoTransport: Transport = {
    graphql: async (query, variables) => {
        switch (operation(query)) {
            case "UserProfile":
                return { user: variables.login === user.login ? user : null };

            case "ReposByTopic": {
                const q = String(variables.q);
                const topic = q.match(/topic:(\S+)/)![1];
                const owners = [...q.matchAll(/user:(\S+)/g)].map((match) => lower(match[1]));
                const nodes = repos.filter(
                    (item) =>
                        owners.includes(lower(item.nameWithOwner.split("/")[0])) &&
                        item.repositoryTopics.nodes.some((node) => node?.topic.name === topic)
                );
                return {
                    search: {
                        repositoryCount: nodes.length,
                        pageInfo: { hasNextPage: false, endCursor: null },
                        nodes
                    }
                };
            }

            case "RepoByName": {
                const name = lower(`${variables.owner}/${variables.name}`);
                return { repository: repos.find((item) => lower(item.nameWithOwner) === name) ?? null };
            }

            case "RepoFiles":
                return {
                    repository: resolveRepoFiles(files, variables, [CONTENT, ...repos.map((item) => item.nameWithOwner)])
                };

            case "MergedPrs": {
                const matching = searchPrs(String(variables.q));
                const start = Number(variables.after ?? 0);
                const end = start + 50;
                return {
                    search: {
                        issueCount: matching.length,
                        pageInfo: {
                            hasNextPage: end < matching.length,
                            endCursor: end < matching.length ? String(end) : null
                        },
                        nodes: matching.slice(start, end)
                    }
                };
            }

            case "MergedPrCount":
                return { search: { issueCount: searchPrs(String(variables.q)).length } };

            case "Contributions":
                return {
                    user: {
                        contributionsCollection: contributionsFor(String(variables.from), String(variables.to))
                    }
                };

            case "RecentStars":
                return { user: { starredRepositories: { edges: stars } } };

            default:
                throw new Error(`demo world: unhandled query ${operation(query)}`);
        }
    },

    rest: async (route, params) => {
        if (route === EVENTS_ROUTE) return events;
        if (route === COMMITS_ROUTE) {
            const count = recentCommits[`${params.owner}/${params.repo}`] ?? 0;
            return Array.from({ length: count }, (_, i) => ({ sha: `demo${i}` }));
        }
        throw new Error(`demo world: unhandled route ${route}`);
    }
};
