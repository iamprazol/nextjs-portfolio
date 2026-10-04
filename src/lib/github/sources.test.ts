import { afterEach, describe, expect, it } from "vitest";

import { setTransport, type Transport } from "./client";
import { setConfig } from "./config";
import { prSearchQuery, topicSearchQuery, type PullRequestNode } from "./queries";
import { MAX_LOG_PRS, fetchMergedPrs, fetchCommitCounts } from "./sources";

const NOW = new Date("2026-06-15T12:00:00Z");
const DAY = 86_400_000;

setConfig({
    login: "demo-dev",
    owners: ["demo-dev"],
    contentRepo: { owner: "demo-dev", name: "demo-dev" },
    now: () => NOW
});

/** `count` PRs in one repo, one merged every `everyDays` days back from NOW. */
function makePrs(count: number, everyDays: number, repo = "demo-dev/a"): PullRequestNode[] {
    return Array.from({ length: count }, (_, i) => ({
        number: count - i,
        title: `PR ${count - i}`,
        body: "",
        mergedAt: new Date(NOW.getTime() - (i * everyDays + 1) * DAY).toISOString(),
        url: `https://github.com/${repo}/pull/${count - i}`,
        additions: 1,
        deletions: 1,
        labels: { nodes: [] },
        repository: { nameWithOwner: repo }
    }));
}

/** A fake search endpoint that understands repo: and merged:>= and pages by 50. */
function searchTransport(all: (PullRequestNode | null)[], seen: string[] = []): Transport {
    return {
        graphql: async (_query, variables) => {
            const q = String(variables.q);
            seen.push(q);
            const repos = [...q.matchAll(/repo:(\S+)/g)].map((match) => match[1]);
            const since = q.match(/merged:>=(\S+)/)?.[1];

            const matching = all.filter(
                (pr) =>
                    pr === null ||
                    (repos.includes(pr.repository.nameWithOwner) &&
                        (!since || pr.mergedAt.slice(0, 10) >= since))
            );
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
        },
        rest: async () => {
            throw new Error("unexpected rest call");
        }
    };
}

afterEach(() => {
    setTransport({
        graphql: async () => {
            throw new Error("no transport");
        },
        rest: async () => {
            throw new Error("no transport");
        }
    });
});

describe("search query builders", () => {
    it("builds the topic search across owners", () => {
        expect(topicSearchQuery("portfolio-system", ["a", "b"])).toBe(
            "topic:portfolio-system user:a user:b fork:true"
        );
    });

    it("builds the PR search with and without a merge cutoff", () => {
        expect(prSearchQuery("me", ["o/a", "o/b"])).toBe(
            "is:pr is:merged author:me repo:o/a repo:o/b sort:created-desc"
        );
        expect(prSearchQuery("me", ["o/a"], new Date("2026-01-02T10:00:00Z"))).toBe(
            "is:pr is:merged author:me repo:o/a merged:>=2026-01-02 sort:created-desc"
        );
    });
});

describe("fetchMergedPrs", () => {
    it("returns nothing without asking when there are no repos", async () => {
        await expect(fetchMergedPrs([])).resolves.toEqual({ prs: [], total: 0 });
    });

    it("pages through everything when the history is small", async () => {
        setTransport(searchTransport(makePrs(120, 3)));

        const { prs, total } = await fetchMergedPrs(["demo-dev/a"]);
        expect(total).toBe(120);
        expect(prs).toHaveLength(120);
        expect(prs[0].number).toBe(120);
        expect(prs.at(-1)?.number).toBe(1);
    });

    it("narrows to the widest window that fits when the history is large", async () => {
        // 1000 PRs, one per day: 730d and 365d windows are too big, 180d fits.
        const seen: string[] = [];
        setTransport(searchTransport(makePrs(1000, 1), seen));

        const { prs, total } = await fetchMergedPrs(["demo-dev/a"]);
        expect(total).toBe(1000);
        expect(prs.length).toBeLessThanOrEqual(MAX_LOG_PRS);
        expect(prs.length).toBeGreaterThan(170);
        // Exactly the newest ones, so numbering by total − index stays right.
        expect(prs.map((pr) => pr.number)).toEqual(
            Array.from({ length: prs.length }, (_, i) => 1000 - i)
        );
        expect(seen.some((q) => q.includes("merged:>=2025-12-17"))).toBe(true);
    });

    it("merges repos split across several searches, newest first", async () => {
        const repos = Array.from({ length: 10 }, (_, i) => `demo-dev/r${i}`);
        const all = repos.flatMap((repo, i) => makePrs(3, i + 1, repo));
        const seen: string[] = [];
        setTransport(searchTransport(all, seen));

        const { prs, total } = await fetchMergedPrs(repos);
        expect(total).toBe(30);
        expect(prs).toHaveLength(30);
        expect(new Set(seen).size).toBe(2);
        const dates = prs.map((pr) => pr.mergedAt);
        expect(dates).toEqual([...dates].sort().reverse());
    });

    it("drops PRs the token cannot read and leaves them out of the total", async () => {
        setTransport(searchTransport([null, ...makePrs(2, 1), null]));

        const { prs, total } = await fetchMergedPrs(["demo-dev/a"]);
        expect(prs).toHaveLength(2);
        expect(total).toBe(2);
    });
});

describe("fetchCommitCounts", () => {
    it("counts commits per repo and treats empty or unreadable repos as zero", async () => {
        setTransport({
            graphql: async () => {
                throw new Error("unexpected graphql call");
            },
            rest: async (_route, params) => {
                expect(params.author).toBe("demo-dev");
                expect(params.since).toBe("2026-06-01T00:00:00.000Z");
                if (params.repo === "empty") throw Object.assign(new Error("empty"), { status: 409 });
                if (params.repo === "gone") throw Object.assign(new Error("gone"), { status: 404 });
                return [{}, {}, {}];
            }
        });

        await expect(
            fetchCommitCounts(["demo-dev/busy", "demo-dev/empty", "demo-dev/gone"])
        ).resolves.toEqual([
            { repo: "demo-dev/busy", commits: 3 },
            { repo: "demo-dev/empty", commits: 0 },
            { repo: "demo-dev/gone", commits: 0 }
        ]);
    });

    it("rethrows other failures", async () => {
        setTransport({
            graphql: async () => ({}),
            rest: async () => {
                throw Object.assign(new Error("boom"), { status: 500 });
            }
        });

        await expect(fetchCommitCounts(["demo-dev/busy"])).rejects.toThrow("boom");
    });
});
