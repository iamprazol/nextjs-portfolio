import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setTransport } from "./client";
import { setConfig } from "./config";
import { resolveRepoFiles } from "./testing/fake-files";

const CONTENT = "demo-dev/demo-dev";
const REPO = "demo-labs/Atlas_Membership";

const USER = {
    login: "demo-dev",
    name: "Demo Dev",
    bio: "Writes plugins",
    location: "Somewhere",
    websiteUrl: "https://demo.example",
    avatarUrl: "https://avatars.example/demo.png",
    url: "https://github.com/demo-dev",
    createdAt: "2019-03-01T00:00:00Z"
};

const PROFILE = {
    name: "Demo Developer",
    headline: "Software Engineer",
    intro: "I build things.",
    location: { label: "Kathmandu, NP", lat: 27.7, lng: 85.3, timezone: "Asia/Kathmandu" },
    links: { github: "https://github.com/demo-dev", linkedin: "", x: "", email: "me@demo.example" },
    howIWork: ["Understand first"],
    leadership: { developersLed: 4 }
};

const problem = (number: number, title: string, body = "## The Problem\n\nText.") =>
    `---\nnumber: ${number}\ntitle: ${title}\nsummary: A summary.\n---\n${body}\n`;

let files: Record<string, string>;
let warn: ReturnType<typeof vi.spyOn>;

// content.ts keeps per-request caches, so each test loads a fresh copy.
async function load() {
    vi.resetModules();
    const client = await import("./client");
    const config = await import("./config");
    config.setConfig({
        login: "demo-dev",
        owners: ["demo-dev", "demo-labs"],
        contentRepo: { owner: "demo-dev", name: "demo-dev" },
        now: () => new Date("2026-06-15T12:00:00Z")
    });
    client.setTransport({
        graphql: async (query, variables) => {
            if (query.includes("query UserProfile")) return { user: USER };
            if (query.includes("query RepoFiles")) {
                return { repository: resolveRepoFiles(files, variables, [CONTENT, REPO]) };
            }
            throw new Error("unexpected query");
        },
        rest: async () => {
            throw new Error("unexpected rest call");
        }
    });
    return import("./content");
}

beforeEach(() => {
    files = {};
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
    warn.mockRestore();
});

// Keep the statically imported modules quiet if anything touches them.
setConfig({
    login: "demo-dev",
    owners: ["demo-dev"],
    contentRepo: { owner: "demo-dev", name: "demo-dev" },
    now: () => new Date("2026-06-15T12:00:00Z")
});
setTransport({
    graphql: async () => {
        throw new Error("static client used");
    },
    rest: async () => {
        throw new Error("static client used");
    }
});

describe("loadProfile", () => {
    it("uses portfolio/profile.json when it is valid", async () => {
        files[`${CONTENT}:portfolio/profile.json`] = JSON.stringify(PROFILE);
        const { loadProfile } = await load();

        expect(await loadProfile()).toEqual({
            name: "Demo Developer",
            headline: "Software Engineer",
            intro: "I build things.",
            location: { label: "Kathmandu, NP", lat: 27.7, lng: 85.3, timezone: "Asia/Kathmandu" },
            links: {
                github: "https://github.com/demo-dev",
                linkedin: null,
                x: null,
                email: "me@demo.example",
                website: "https://demo.example"
            },
            howIWork: ["Understand first"],
            leadership: { developersLed: 4, since: null },
            avatarUrl: "https://avatars.example/demo.png",
            source: "content"
        });
        expect(warn).not.toHaveBeenCalled();
    });

    it("builds a minimal profile from the GitHub user when the file is missing", async () => {
        const { loadProfile } = await load();
        const profile = await loadProfile();

        expect(profile).toMatchObject({
            name: "Demo Dev",
            headline: "Writes plugins",
            intro: null,
            location: { label: "Somewhere", lat: null, lng: null, timezone: null },
            howIWork: [],
            leadership: null,
            source: "github"
        });
        expect(profile.links).toEqual({
            github: "https://github.com/demo-dev",
            linkedin: null,
            x: null,
            email: null,
            website: "https://demo.example"
        });
        expect(warn).not.toHaveBeenCalled();
    });

    it.each([
        ["broken JSON", "{ not json", /not valid JSON/],
        ["a schema violation", JSON.stringify({ ...PROFILE, howIWork: "nope" }), /howIWork/],
        [
            "an unknown time zone",
            JSON.stringify({ ...PROFILE, location: { ...PROFILE.location, timezone: "Mars/Olympus" } }),
            /IANA time zone/
        ]
    ])("falls back and warns on %s", async (_label, text, message) => {
        files[`${CONTENT}:portfolio/profile.json`] = text;
        const { loadProfile } = await load();

        expect((await loadProfile()).source).toBe("github");
        expect(warn).toHaveBeenCalledWith(
            expect.stringMatching(/skipped invalid file demo-dev\/demo-dev:portfolio\/profile\.json/)
        );
        expect(warn.mock.calls[0][0]).toMatch(message);
    });
});

describe("loadSystemMeta", () => {
    it("defaults the slug to the kebab-cased repo name when no file exists", async () => {
        const { loadSystemMeta } = await load();

        expect(await loadSystemMeta(REPO)).toEqual({
            slug: "atlas-membership",
            contentSlug: "atlas-membership"
        });
    });

    it("lets the repo file win and the content file fill the gaps", async () => {
        files[`${REPO}:.portfolio/system.json`] = JSON.stringify({
            kind: "WordPress Product",
            role: ["Architecture"]
        });
        files[`${CONTENT}:portfolio/systems/atlas.json`] = JSON.stringify({
            repo: "demo-labs/atlas_membership",
            kind: "Plugin",
            proves: "Scales a legacy data model",
            order: 2
        });
        const { loadSystemMeta } = await load();

        expect(await loadSystemMeta(REPO)).toEqual({
            repo: "demo-labs/atlas_membership",
            kind: "WordPress Product",
            role: ["Architecture"],
            proves: "Scales a legacy data model",
            order: 2,
            slug: "atlas",
            contentSlug: "atlas"
        });
    });

    it("matches a content file without `repo` by its file name", async () => {
        files[`${CONTENT}:portfolio/systems/atlas-membership.json`] = JSON.stringify({
            kind: "Plugin"
        });
        const { loadSystemMeta } = await load();

        expect(await loadSystemMeta(REPO)).toMatchObject({ kind: "Plugin", slug: "atlas-membership" });
    });

    it("skips an invalid repo file but still uses the content file", async () => {
        files[`${REPO}:.portfolio/system.json`] = JSON.stringify({ status: "shipping" });
        files[`${CONTENT}:portfolio/systems/atlas.json`] = JSON.stringify({
            repo: REPO,
            kind: "Plugin"
        });
        files[`${CONTENT}:portfolio/systems/broken.json`] = "nope";
        const { loadSystemMeta, loadDeclaredSystemRepos } = await load();

        expect(await loadSystemMeta(REPO)).toMatchObject({ kind: "Plugin", slug: "atlas" });
        expect(await loadDeclaredSystemRepos()).toEqual([REPO]);
        // React cache() only dedupes inside a request, so a warning can repeat here.
        const warnings = new Set(warn.mock.calls.map((call: unknown[]) => String(call[0])));
        expect([...warnings]).toEqual([
            expect.stringContaining("portfolio/systems/broken.json"),
            expect.stringContaining(`${REPO}:.portfolio/system.json`)
        ]);
    });
});

describe("loadProblems", () => {
    it("merges both locations, prefers the repo, sorts by number and skips invalid files", async () => {
        files[`${REPO}:.portfolio/problems/multi-membership.md`] = problem(2, "From the repo");
        files[`${REPO}:.portfolio/problems/no-title.md`] = "---\nnumber: 9\n---\nBody";
        files[`${REPO}:.portfolio/problems/notes.txt`] = "ignored";
        files[`${CONTENT}:portfolio/systems/atlas-membership/problems/multi-membership.md`] =
            problem(2, "From the content repo");
        files[`${CONTENT}:portfolio/systems/atlas-membership/problems/caching.md`] = problem(
            1,
            "Caching"
        );
        const { loadProblems, loadSystemMeta } = await load();

        const problems = await loadProblems(REPO, await loadSystemMeta(REPO));
        expect(problems.map((item) => [item.number, item.slug, item.title])).toEqual([
            [1, "caching", "Caching"],
            [2, "multi-membership", "From the repo"]
        ]);
        expect(problems[0].systemSlug).toBe("atlas-membership");
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toMatch(/problems\/no-title\.md/);
    });

    it("renders sanitized HTML with heading ids", async () => {
        files[`${REPO}:.portfolio/problems/x.md`] = problem(
            1,
            "X",
            [
                "## The Problem",
                "",
                "Text with a [link](https://example.com) and `code`.",
                "",
                '<script>alert("x")</script>',
                "",
                '<a href="javascript:alert(1)">bad</a>',
                "",
                "## The Problem",
                "",
                "| a | b |",
                "| - | - |",
                "| 1 | 2 |"
            ].join("\n")
        );
        const { loadProblems, loadSystemMeta } = await load();

        const [item] = await loadProblems(REPO, await loadSystemMeta(REPO));
        expect(item.headings).toEqual([
            { id: "the-problem", text: "The Problem", depth: 2 },
            { id: "the-problem-2", text: "The Problem", depth: 2 }
        ]);
        expect(item.html).toContain('<h2 id="the-problem">The Problem</h2>');
        expect(item.html).toContain('<a href="https://example.com">link</a>');
        expect(item.html).toContain("<table>");
        expect(item.html).not.toMatch(/<script|javascript:/);
    });

    it("returns an empty list when neither location has problems", async () => {
        const { loadProblems, loadSystemMeta } = await load();
        expect(await loadProblems(REPO, await loadSystemMeta(REPO))).toEqual([]);
    });
});

describe("loadArchitecture / loadWorkflow", () => {
    const diagram = { nodes: [{ id: "a", label: "A" }], edges: [] };

    it("returns null when missing", async () => {
        const { loadArchitecture, loadWorkflow, loadSystemMeta } = await load();
        const meta = await loadSystemMeta(REPO);

        expect(await loadArchitecture(REPO, meta)).toBeNull();
        expect(await loadWorkflow(REPO, meta)).toBeNull();
    });

    it("falls back to the content repo when the repo file is invalid", async () => {
        files[`${REPO}:.portfolio/architecture.json`] = JSON.stringify({ nodes: "x" });
        files[`${CONTENT}:portfolio/systems/atlas-membership/architecture.json`] =
            JSON.stringify(diagram);
        files[`${REPO}:.portfolio/workflow.json`] = JSON.stringify({
            steps: [{ title: "Plan", subtitle: "First", detail: "Think" }],
            ...diagram
        });
        const { loadArchitecture, loadWorkflow, loadSystemMeta } = await load();
        const meta = await loadSystemMeta(REPO);

        expect(await loadArchitecture(REPO, meta)).toEqual(diagram);
        expect((await loadWorkflow(REPO, meta))?.steps).toHaveLength(1);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe("loadTimelineNote", () => {
    it("parses frontmatter and body, and returns null for other years", async () => {
        files[`${CONTENT}:portfolio/timeline/2024.md`] =
            "---\ntitle: The rewrite year\n---\nShipped **a lot**.";
        files[`${CONTENT}:portfolio/timeline/2023.md`] = "---\nsummary: Quiet.\n---\n";
        files[`${CONTENT}:portfolio/timeline/notes.md`] = "not a year";
        const { loadTimelineNote } = await load();

        expect(await loadTimelineNote(2024)).toEqual({
            title: "The rewrite year",
            html: "<p>Shipped <strong>a lot</strong>.</p>"
        });
        expect(await loadTimelineNote(2023)).toEqual({ summary: "Quiet.", html: null });
        expect(await loadTimelineNote(2022)).toBeNull();
    });

    it("skips a note with broken frontmatter", async () => {
        files[`${CONTENT}:portfolio/timeline/2024.md`] = "---\ntitle: [unclosed\n---\nBody";
        const { loadTimelineNote } = await load();

        expect(await loadTimelineNote(2024)).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("portfolio/timeline/2024.md"));
    });
});
