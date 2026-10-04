import { describe, expect, it } from "vitest";

import {
    deriveActivity,
    deriveExperiment,
    deriveLanguages,
    deriveLog,
    deriveNow,
    deriveReleases,
    deriveStack,
    deriveStats,
    deriveStatus,
    deriveSystem,
    deriveTimeline,
    deriveToolUsage,
    extractSummary,
    sortSystems,
    type LogSource
} from "./derive";
import type {
    ContributionsNode,
    EventNode,
    PullRequestNode,
    ReleaseNode,
    RepoNode,
    StarEdge
} from "./queries";

const NOW = new Date("2026-06-15T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

const release = (tagName: string, days: number, extra: Partial<ReleaseNode> = {}): ReleaseNode => ({
    tagName,
    name: `Release ${tagName}`,
    publishedAt: daysAgo(days),
    isPrerelease: false,
    isDraft: false,
    url: `https://github.com/o/r/releases/tag/${tagName}`,
    ...extra
});

const repo = (extra: Partial<RepoNode> & { topics?: string[]; langs?: [string, number][] } = {}): RepoNode => {
    const { topics = ["portfolio-system"], langs = [], ...rest } = extra;
    return {
        nameWithOwner: "demo-dev/atlas",
        name: "atlas",
        description: "A demo",
        url: "https://github.com/demo-dev/atlas",
        homepageUrl: null,
        isArchived: false,
        isPrivate: false,
        pushedAt: daysAgo(400),
        createdAt: daysAgo(900),
        stargazerCount: 3,
        repositoryTopics: { nodes: topics.map((name) => ({ topic: { name } })) },
        languages: {
            totalSize: langs.reduce((sum, [, size]) => sum + size, 0),
            edges: langs.map(([name, size]) => ({ size, node: { name } }))
        },
        latestRelease: null,
        releases: { nodes: [] },
        ...rest
    };
};

const contributions = (
    byRepo: [repo: string, language: string | null, commits: number, isPrivate?: boolean][] = [],
    extra: Partial<ContributionsNode> = {}
): ContributionsNode => {
    const commits = byRepo.reduce((sum, entry) => sum + entry[2], 0);
    return {
        totalCommitContributions: commits,
        totalPullRequestContributions: 0,
        totalPullRequestReviewContributions: 0,
        totalRepositoryContributions: 0,
        totalRepositoriesWithContributedCommits: byRepo.length,
        commitContributionsByRepository: byRepo.map(([nameWithOwner, language, count, isPrivate]) => ({
            repository: {
                nameWithOwner,
                isPrivate: isPrivate ?? false,
                primaryLanguage: language ? { name: language } : null
            },
            contributions: { totalCount: count }
        })),
        contributionCalendar: { totalContributions: commits },
        ...extra
    };
};

const pr = (number: number, days: number, extra: Partial<PullRequestNode> & { labelNames?: string[] } = {}): PullRequestNode => {
    const { labelNames = [], ...rest } = extra;
    return {
        number,
        title: `PR ${number}`,
        body: `Body of ${number}.`,
        mergedAt: daysAgo(days),
        url: `https://github.com/demo-dev/atlas/pull/${number}`,
        additions: 10,
        deletions: 2,
        labels: { nodes: labelNames.map((name) => ({ name })) },
        repository: { nameWithOwner: "demo-dev/atlas" },
        ...rest
    };
};

describe("deriveStatus", () => {
    it.each<[string, Partial<Parameters<typeof repo>[0]>, ReturnType<typeof deriveStatus>]>([
        ["archived repo is hidden", { isArchived: true, pushedAt: daysAgo(1) }, null],
        ["portfolio-lab topic", { topics: ["portfolio-lab"], pushedAt: daysAgo(1) }, "experiment"],
        ["stable release 11 months ago", { latestRelease: release("v1", 330) }, "production"],
        ["stable release 13 months ago, quiet", { latestRelease: release("v1", 400) }, "maintenance"],
        [
            "stable release only in releases list",
            { releases: { nodes: [release("v0.9", 500), release("v1", 20), null] } },
            "production"
        ],
        [
            "prerelease only, pushed last week",
            { releases: { nodes: [release("v1-beta", 3, { isPrerelease: true })] }, pushedAt: daysAgo(7) },
            "building"
        ],
        [
            "draft release does not count",
            { releases: { nodes: [release("v1", 3, { isDraft: true })] }, pushedAt: daysAgo(60) },
            "active"
        ],
        ["pushed 29 days ago", { pushedAt: daysAgo(29) }, "building"],
        ["pushed 31 days ago", { pushedAt: daysAgo(31) }, "active"],
        ["pushed 119 days ago", { pushedAt: daysAgo(119) }, "active"],
        ["pushed 121 days ago", { pushedAt: daysAgo(121) }, "maintenance"],
        ["never pushed", { pushedAt: null }, "maintenance"]
    ])("%s", (_label, overrides, expected) => {
        expect(deriveStatus(repo(overrides), NOW)).toBe(expected);
    });

    it("lets system.json override the derived status, but never un-hides an archived repo", () => {
        expect(deriveStatus(repo({ pushedAt: daysAgo(1) }), NOW, "maintenance")).toBe("maintenance");
        expect(deriveStatus(repo({ topics: ["portfolio-lab"] }), NOW, "production")).toBe("production");
        expect(deriveStatus(repo({ isArchived: true }), NOW, "production")).toBeNull();
    });
});

describe("deriveReleases", () => {
    it("lists published releases newest first without duplicates or drafts", () => {
        const releases = deriveReleases(
            repo({
                latestRelease: release("v2", 10),
                releases: {
                    nodes: [
                        release("v1", 100),
                        release("v2", 10),
                        release("v3-rc", 5, { isPrerelease: true, name: "  " }),
                        release("draft", 1, { isDraft: true }),
                        release("unpublished", 1, { publishedAt: null })
                    ]
                }
            })
        );
        expect(releases.map((item) => item.tag)).toEqual(["v3-rc", "v2", "v1"]);
        expect(releases[0]).toMatchObject({ name: null, isPrerelease: true });
    });

    it("hides release URLs of private repos", () => {
        const [item] = deriveReleases(repo({ isPrivate: true, latestRelease: release("v1", 1) }));
        expect(item.url).toBeNull();
    });
});

describe("deriveLanguages / deriveStack", () => {
    it("computes shares, largest first", () => {
        expect(deriveLanguages(repo({ langs: [["CSS", 100], ["PHP", 300]] }))).toEqual([
            { name: "PHP", share: 0.75 },
            { name: "CSS", share: 0.25 }
        ]);
    });

    it("handles repos with no languages", () => {
        expect(deriveLanguages(repo({ languages: null }))).toEqual([]);
        expect(deriveLanguages(repo({ langs: [] }))).toEqual([]);
    });

    it("falls back to summing sizes when totalSize is missing", () => {
        const item = repo({ langs: [["PHP", 50], ["JS", 50]] });
        item.languages!.totalSize = 0;
        expect(deriveLanguages(item).map((language) => language.share)).toEqual([0.5, 0.5]);
    });

    it.each<[string, [string, number][], string[], string[]]>([
        ["top 4 languages then topics", [["PHP", 50], ["JavaScript", 30], ["SCSS", 10], ["HTML", 6], ["Shell", 4]], ["wordpress", "membership"], ["PHP", "JavaScript", "SCSS", "HTML", "wordpress", "membership"]],
        ["drops portfolio-* topics", [["Go", 1]], ["portfolio-system", "portfolio-lab", "cli"], ["Go", "cli"]],
        ["dedupes a topic that repeats a language", [["PHP", 1]], ["php", "rest-api"], ["PHP", "rest-api"]],
        ["no languages, no topics", [], [], []]
    ])("%s", (_label, langs, topics, expected) => {
        expect(deriveStack(repo({ langs, topics }))).toEqual(expected);
    });
});

describe("deriveSystem / deriveExperiment / sortSystems", () => {
    const extras = { problemCount: 2, hasArchitecture: true, hasWorkflow: false };

    it("builds a system from the repo, falling back when metadata is absent", () => {
        const system = deriveSystem(
            repo({ description: "  ", homepageUrl: "", pushedAt: daysAgo(5), langs: [["PHP", 1]], topics: ["portfolio-system", "wordpress"] }),
            { slug: "atlas" },
            NOW,
            extras
        );
        expect(system).toMatchObject({
            slug: "atlas",
            name: "atlas",
            repo: "demo-dev/atlas",
            description: null,
            homepageUrl: null,
            url: "https://github.com/demo-dev/atlas",
            kind: null,
            role: [],
            proves: null,
            order: null,
            status: "building",
            stack: ["PHP", "wordpress"],
            topics: ["wordpress"],
            latestRelease: null,
            problemCount: 2,
            hasArchitecture: true,
            hasWorkflow: false
        });
    });

    it("uses metadata and hides the URL of a private repo", () => {
        const system = deriveSystem(
            repo({ isPrivate: true, pushedAt: null, latestRelease: release("v1", 10) }),
            { slug: "atlas", name: "Atlas", kind: "Plugin", role: ["Architecture"], proves: "It scales", order: 1, status: "active" },
            NOW,
            extras
        );
        expect(system).toMatchObject({
            name: "Atlas",
            kind: "Plugin",
            role: ["Architecture"],
            proves: "It scales",
            order: 1,
            status: "active",
            url: null,
            isPrivate: true
        });
        expect(system?.latestRelease).toMatchObject({ tag: "v1", url: null });
        expect(system?.pushedAt).toBe(system?.createdAt);
    });

    it("returns null for archived repos", () => {
        expect(deriveSystem(repo({ isArchived: true }), { slug: "x" }, NOW, extras)).toBeNull();
        expect(deriveExperiment(repo({ isArchived: true }))).toBeNull();
    });

    it("builds an experiment", () => {
        expect(
            deriveExperiment(repo({ name: "Tiny_Shell", topics: ["portfolio-lab", "rust"], langs: [["Rust", 1]] }))
        ).toMatchObject({ slug: "tiny-shell", name: "Tiny_Shell", stack: ["Rust", "rust"].slice(0, 1), stars: 3 });
        expect(deriveExperiment(repo({ isPrivate: true, pushedAt: null }))).toMatchObject({
            url: null,
            pushedAt: daysAgo(900)
        });
    });

    it("sorts by order, then most recently pushed, then slug", () => {
        const sorted = sortSystems([
            { slug: "c", order: null, pushedAt: "2026-01-01" },
            { slug: "b", order: 2, pushedAt: "2020-01-01" },
            { slug: "a", order: null, pushedAt: "2026-05-01" },
            { slug: "d", order: 1, pushedAt: "2019-01-01" },
            { slug: "e", order: null, pushedAt: "2026-01-01" }
        ]);
        expect(sorted.map((item) => item.slug)).toEqual(["d", "b", "a", "c", "e"]);
    });
});

describe("deriveStats", () => {
    const years = (totals: [number, number][]) =>
        totals.map(([year, commits]) => ({
            year,
            contributions: contributions(commits ? [["o/r", "PHP", commits]] : [])
        }));

    it.each<[string, [number, number][], number | null, number | null]>([
        ["counts from the earliest non-zero year", [[2019, 0], [2020, 12], [2021, 0], [2026, 4]], 2020, 6],
        ["first year is this year", [[2026, 1]], 2026, 0],
        ["no contributions at all", [[2024, 0], [2025, 0]], null, null],
        ["no years", [], null, null]
    ])("%s", (_label, totals, firstYear, yearsOfEngineering) => {
        expect(
            deriveStats({ years: years(totals), systems: 3, developersLed: null, prsMerged: 41, now: NOW })
        ).toEqual({ yearsOfEngineering, firstYear, products: 3, developersLed: null, prsMerged: 41 });
    });

    it("passes developersLed through only when the profile has it", () => {
        expect(
            deriveStats({ years: [], systems: 0, developersLed: 15, prsMerged: null, now: NOW })
        ).toMatchObject({ developersLed: 15, prsMerged: null, products: 0 });
    });
});

describe("extractSummary", () => {
    it.each<[string, string | null | undefined, string | null]>([
        ["no body", "", null],
        ["null body", null, null],
        ["undefined body", undefined, null],
        ["whitespace only", "  \n\n ", null],
        ["plain paragraph", "Fixes the cache key.\n\nMore detail below.", "Fixes the cache key."],
        ["joins wrapped lines", "Fixes the\ncache key.", "Fixes the cache key."],
        ["skips a heading-only block", "## Description\n\nAdds multi-membership.", "Adds multi-membership."],
        ["skips a heading inside the paragraph block", "### What\nAdds multi-membership.", "Adds multi-membership."],
        ["skips html comments", "<!-- describe your change -->\n\nReal text.", "Real text."],
        ["skips checklists", "- [x] Tested\n- [ ] Docs\n\nReal text.", "Real text."],
        ["skips code fences", "```php\necho 1;\n```\n\nReal text.", "Real text."],
        ["skips an unclosed code fence", "Real text.\n\n```\nnever closed", "Real text."],
        ["skips tables and rules", "| a | b |\n|---|---|\n\n---\n\nReal text.", "Real text."],
        ["skips image-only blocks", "![screenshot](https://x/y.png)\n\nReal text.", "Real text."],
        ["strips links and emphasis", "Use **bold**, _em_, ~~old~~, `code` and [a link](https://x).", "Use bold, em, old, code and a link."],
        ["strips inline html", "Adds <kbd>Ctrl</kbd> support.", "Adds Ctrl support."],
        ["unwraps list items and quotes", "- First point\n- Second point", "First point Second point"],
        ["unwraps numbered lists and quotes", "> 1. Quoted step", "1. Quoted step"],
        ["template with nothing real", "## Description\n\n<!-- todo -->\n\n- [ ] Tested", null],
        ["windows line endings", "First.\r\n\r\nSecond.", "First."]
    ])("%s", (_label, body, expected) => {
        expect(extractSummary(body)).toBe(expected);
    });

    it("truncates at a word boundary to at most 200 characters", () => {
        const summary = extractSummary("word ".repeat(80))!;
        expect(summary.length).toBeLessThanOrEqual(200);
        expect(summary.endsWith("word…")).toBe(true);
    });

    it("hard-cuts a single very long word", () => {
        const summary = extractSummary("x".repeat(500))!;
        expect(summary).toHaveLength(200);
        expect(summary.endsWith("…")).toBe(true);
    });
});

describe("deriveLog", () => {
    const sources: LogSource[] = [
        {
            repo: "demo-dev/atlas",
            slug: "atlas",
            name: "Atlas",
            isPrivate: false,
            releases: [
                { tag: "v2.0.0", name: "Atlas 2", publishedAt: daysAgo(4), url: "https://r/v2", isPrerelease: false },
                { tag: "v2.1.0-beta", name: null, publishedAt: daysAgo(1), url: "https://r/b", isPrerelease: true },
                { tag: "v1.9.0", name: null, publishedAt: daysAgo(90), url: "https://r/v19", isPrerelease: false }
            ]
        },
        { repo: "demo-dev/secret", slug: "secret", name: "Secret", isPrivate: true, releases: [] }
    ];

    const log = deriveLog({
        total: 120,
        prs: [
            pr(11, 30, { labelNames: ["portfolio:highlight"], title: "  Pinned one " }),
            pr(14, 2),
            pr(13, 3, { labelNames: ["portfolio:hide", "bug"] }),
            pr(12, 5, { body: "" }),
            pr(7, 6, { repository: { nameWithOwner: "Demo-Dev/Secret" }, url: "https://github.com/demo-dev/secret/pull/7" }),
            pr(99, 7, { repository: { nameWithOwner: "someone/else" } }),
            pr(10, 40, { labels: null })
        ],
        sources
    });

    it("puts pinned entries first, then orders by date", () => {
        expect(log.map((entry) => entry.id)).toEqual([
            "pr:demo-dev/atlas#11",
            "pr:demo-dev/atlas#14",
            "release:demo-dev/atlas@v2.0.0",
            "pr:demo-dev/atlas#12",
            "pr:demo-dev/secret#7",
            "pr:demo-dev/atlas#10",
            "release:demo-dev/atlas@v1.9.0"
        ]);
    });

    it("numbers PRs by merge order across repos, counting hidden and unlisted ones", () => {
        const numbers = Object.fromEntries(log.filter((e) => e.type === "pr").map((e) => [e.pr!.number, e.number]));
        // merge order, newest first: 14, 13 (hidden), 12, 7, 99 (not a source), 11, 10
        expect(numbers).toEqual({ 14: 120, 12: 118, 7: 117, 11: 115, 10: 114 });
    });

    it("excludes portfolio:hide and repos that are not sources", () => {
        expect(log.some((entry) => entry.pr?.number === 13)).toBe(false);
        expect(log.some((entry) => entry.pr?.number === 99)).toBe(false);
    });

    it("fills PR entries", () => {
        expect(log[0]).toEqual({
            id: "pr:demo-dev/atlas#11",
            type: "pr",
            number: 115,
            title: "Pinned one",
            summary: "Body of 11.",
            date: daysAgo(30),
            url: "https://github.com/demo-dev/atlas/pull/11",
            repo: "demo-dev/atlas",
            systemSlug: "atlas",
            systemName: "Atlas",
            pinned: true,
            pr: { number: 11, additions: 10, deletions: 2 },
            releaseTag: null
        });
    });

    it("leaves the summary null when the PR has no body", () => {
        expect(log.find((entry) => entry.pr?.number === 12)?.summary).toBeNull();
    });

    it("hides URLs of private repos", () => {
        expect(log.find((entry) => entry.pr?.number === 7)).toMatchObject({ url: null, systemName: "Secret" });
    });

    it("adds stable releases as unnumbered entries and skips prereleases", () => {
        const releases = log.filter((entry) => entry.type === "release");
        expect(releases.map((entry) => [entry.title, entry.releaseTag, entry.number, entry.pr])).toEqual([
            ["Atlas 2", "v2.0.0", null, null],
            ["v1.9.0", "v1.9.0", null, null]
        ]);
    });

    it("returns an empty log for no input", () => {
        expect(deriveLog({ prs: [], total: 0, sources: [] })).toEqual([]);
    });
});

describe("deriveNow", () => {
    const sources = [
        { repo: "demo-dev/atlas", slug: "atlas", name: "Atlas" },
        { repo: "demo-dev/relay", slug: "relay", name: "Relay" }
    ];
    const star = (days: number, topics: string[]): StarEdge => ({
        starredAt: daysAgo(days),
        node: { nameWithOwner: "x/y", repositoryTopics: { nodes: [...topics.map((name) => ({ topic: { name } })), null] } }
    });
    const base = { sources, recent: contributions(), baseline: contributions(), stars: [], now: NOW };

    it.each<[string, { repo: string; commits: number }[], string | null, number | null]>([
        ["most commits wins", [{ repo: "demo-dev/atlas", commits: 3 }, { repo: "Demo-Dev/Relay", commits: 9 }], "relay", 9],
        ["tie goes to the first repo by name", [{ repo: "demo-dev/relay", commits: 4 }, { repo: "demo-dev/atlas", commits: 4 }], "atlas", 4],
        ["no commits in 14 days", [{ repo: "demo-dev/atlas", commits: 0 }], null, null],
        ["unknown repo is ignored", [{ repo: "other/thing", commits: 50 }], null, null],
        ["no repos", [], null, null]
    ])("building: %s", (_label, commitCounts, slug, commits) => {
        const { building } = deriveNow({ ...base, commitCounts });
        expect(building?.slug ?? null).toBe(slug);
        expect(building?.commits ?? null).toBe(commits);
    });

    it("learning: languages recently used that were under 5% before", () => {
        const { learning } = deriveNow({
            ...base,
            commitCounts: [],
            recent: contributions([
                ["a/rust", "Rust", 10],
                ["a/go", "Go", 20],
                ["a/php", "PHP", 60],
                ["a/ts", "TypeScript", 10],
                ["a/none", null, 30],
                ["a/zero", "Zig", 0]
            ]),
            baseline: contributions([
                ["a/php", "PHP", 90],
                ["a/ts", "TypeScript", 6],
                ["a/go", "Go", 4]
            ])
        });
        // Rust is new (0%), Go was 4%; TypeScript was 6% and PHP 90% — not new.
        expect(learning).toEqual(["Go", "Rust"]);
    });

    it("learning: empty when there are no recent commits", () => {
        expect(deriveNow({ ...base, commitCounts: [], baseline: contributions([["a/php", "PHP", 5]]) }).learning).toEqual([]);
    });

    it("exploring: top 2 topics among repos starred in the last 60 days", () => {
        const { exploring } = deriveNow({
            ...base,
            commitCounts: [],
            stars: [
                star(1, ["ai", "agents", "portfolio-lab"]),
                star(20, ["ai", "rust"]),
                star(59, ["agents"]),
                star(61, ["old", "old-too"]),
                star(200, ["rust", "rust"])
            ]
        });
        expect(exploring).toEqual(["agents", "ai"]);
    });

    it("exploring: empty with no stars, and asOf is the injected clock", () => {
        const state = deriveNow({ ...base, commitCounts: [] });
        expect(state.exploring).toEqual([]);
        expect(state.asOf).toBe(NOW.toISOString());
    });
});

describe("deriveTimeline", () => {
    const years = [
        { year: 2023, contributions: contributions() },
        {
            year: 2024,
            contributions: contributions(
                [
                    ["corp/secret", "Go", 500, true],
                    ["demo-dev/atlas", "PHP", 120],
                    ["demo-dev/site", "TypeScript", 40],
                    ["demo-dev/css", "CSS", 40],
                    ["demo-dev/sh", "Shell", 1]
                ],
                { totalPullRequestContributions: 31, totalPullRequestReviewContributions: 12, totalRepositoryContributions: 2 }
            )
        },
        { year: 2025, contributions: contributions([["corp/secret", "Go", 10, true]]) },
        { year: 2026, contributions: contributions([["demo-labs/private-system", "PHP", 9, true], ["demo-dev/atlas", "PHP", 2]]) }
    ];
    const timeline = deriveTimeline({
        years,
        notes: new Map([[2025, { title: "The quiet year", summary: "Mostly review.", html: "<p>Note</p>" }]]),
        releases: [{ publishedAt: "2024-03-01T00:00:00Z" }, { publishedAt: "2024-12-31T23:00:00Z" }, { publishedAt: "2026-01-05T00:00:00Z" }],
        namedRepos: new Map([["demo-labs/private-system", "Private System"]])
    });

    it("has one entry per year with contributions, newest first", () => {
        expect(timeline.map((entry) => entry.year)).toEqual([2026, 2025, 2024]);
    });

    it("carries the year's numbers", () => {
        expect(timeline[2]).toMatchObject({
            year: 2024,
            totalContributions: 701,
            commits: 701,
            pullRequests: 31,
            reviews: 12,
            reposContributedTo: 5,
            reposCreated: 2,
            releasesShipped: 2,
            topLanguages: ["Go", "PHP", "CSS"]
        });
        expect(timeline[0].releasesShipped).toBe(1);
        expect(timeline[1].releasesShipped).toBe(0);
    });

    it("titles a year by its busiest repo, never naming an unpublished private repo", () => {
        expect(timeline[2]).toMatchObject({ title: "atlas", summary: null, html: null });
    });

    it("names a private repo only when it is a published system", () => {
        expect(timeline[0].title).toBe("Private System");
    });

    it("prefers the year's note, and has no title when only private repos exist", () => {
        expect(timeline[1]).toMatchObject({ title: "The quiet year", summary: "Mostly review.", html: "<p>Note</p>" });
        const [bare] = deriveTimeline({ years: [years[2]], notes: new Map(), releases: [], namedRepos: new Map() });
        expect(bare.title).toBeNull();
    });
});

describe("deriveActivity", () => {
    const event = (id: string, type: string | null, repoName: string, minutes: number, payload: EventNode["payload"] = {}): EventNode => ({
        id,
        type,
        created_at: new Date(NOW.getTime() - minutes * 60_000).toISOString(),
        repo: { name: repoName },
        payload
    });

    it("keeps push/PR/release events, one item per repo, newest first", () => {
        const items = deriveActivity([
            event("1", "PushEvent", "demo-dev/atlas", 50, { commits: [{ message: "first" }, { message: "fix: cache key\n\nbody" }] }),
            event("2", "WatchEvent", "x/y", 1),
            event("3", "PushEvent", "demo-dev/atlas", 10, {}),
            event("4", "PullRequestEvent", "demo-dev/relay", 20, { pull_request: { title: "Add retries", html_url: "https://github.com/demo-dev/relay/pull/4" } }),
            event("5", "ReleaseEvent", "demo-dev/docs", 30, { release: { name: null, tag_name: "v1.2.0", html_url: "https://github.com/demo-dev/docs/releases/tag/v1.2.0" } }),
            event("6", "CreateEvent", "demo-dev/new", 5),
            { ...event("7", "PushEvent", "demo-dev/broken", 1), created_at: null }
        ]);

        expect(items).toEqual([
            { type: "push", repo: "demo-dev/atlas", url: "https://github.com/demo-dev/atlas", at: expect.any(String), message: null, count: 2 },
            { type: "pr", repo: "demo-dev/relay", url: "https://github.com/demo-dev/relay/pull/4", at: expect.any(String), message: "Add retries", count: 1 },
            { type: "release", repo: "demo-dev/docs", url: "https://github.com/demo-dev/docs/releases/tag/v1.2.0", at: expect.any(String), message: "v1.2.0", count: 1 }
        ]);
    });

    it("uses the last commit's first line when the payload has commits", () => {
        const [item] = deriveActivity([
            event("1", "PushEvent", "demo-dev/atlas", 5, { commits: [{ message: "first" }, { message: "fix: cache key\n\nbody" }] })
        ]);
        expect(item.message).toBe("fix: cache key");
    });

    it("falls back to the repo URL and a null message when the payload is bare", () => {
        expect(
            deriveActivity([event("1", "PullRequestEvent", "a/b", 1), event("2", "ReleaseEvent", "c/d", 2, { release: { name: "Big one" } })])
        ).toMatchObject([
            { type: "pr", url: "https://github.com/a/b", message: null },
            { type: "release", url: "https://github.com/c/d", message: "Big one" }
        ]);
    });

    it("limits to 5 repos by default and to `limit` when given", () => {
        const events = Array.from({ length: 8 }, (_, i) => event(String(i), "PushEvent", `demo-dev/r${i}`, i));
        expect(deriveActivity(events)).toHaveLength(5);
        expect(deriveActivity(events, 2).map((item) => item.repo)).toEqual(["demo-dev/r0", "demo-dev/r1"]);
        expect(deriveActivity([])).toEqual([]);
    });
});

describe("deriveToolUsage", () => {
    it("links each language and topic to the systems that use it, most used first", () => {
        const tools = deriveToolUsage([
            { slug: "atlas", name: "Atlas", languages: [{ name: "PHP", share: 0.8 }, { name: "JavaScript", share: 0.2 }], topics: ["wordpress", "php"] },
            { slug: "relay", name: "Relay", languages: [{ name: "TypeScript", share: 1 }], topics: ["wordpress", "typescript"] },
            { slug: "forms", name: "Forms", languages: [{ name: "PHP", share: 1 }], topics: [] }
        ]);

        expect(tools).toEqual([
            { name: "PHP", kind: "language", systems: [{ slug: "atlas", name: "Atlas" }, { slug: "forms", name: "Forms" }] },
            { name: "wordpress", kind: "topic", systems: [{ slug: "atlas", name: "Atlas" }, { slug: "relay", name: "Relay" }] },
            { name: "JavaScript", kind: "language", systems: [{ slug: "atlas", name: "Atlas" }] },
            { name: "TypeScript", kind: "language", systems: [{ slug: "relay", name: "Relay" }] }
        ]);
    });

    it("upgrades a topic to a language when a later system has the language", () => {
        const tools = deriveToolUsage([
            { slug: "a", name: "A", languages: [], topics: ["rust"] },
            { slug: "b", name: "B", languages: [{ name: "Rust", share: 1 }], topics: [] }
        ]);
        expect(tools).toEqual([
            { name: "Rust", kind: "language", systems: [{ slug: "a", name: "A" }, { slug: "b", name: "B" }] }
        ]);
    });

    it("returns nothing for no systems", () => {
        expect(deriveToolUsage([])).toEqual([]);
    });
});
