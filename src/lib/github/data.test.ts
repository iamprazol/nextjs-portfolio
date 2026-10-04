import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as data from "./data";

// End to end over the committed demo fixtures (GITHUB_MOCK=1 from the vitest
// config): sources → content → derive, with the network closed.

let requests = 0;
const server = setupServer(
    http.all("*", () => {
        requests++;
        return HttpResponse.error();
    })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => {
    server.close();
    expect(requests).toBe(0);
});

describe("data layer in mock mode", () => {
    it("getProfile reads the content repo profile", async () => {
        const profile = await data.getProfile();
        expect(profile).toMatchObject({
            name: "Demo Developer",
            source: "content",
            location: { label: "Example City, EX", timezone: "Asia/Kathmandu" },
            leadership: { developersLed: 6, since: "2022" }
        });
        expect(profile.links.linkedin).toBeNull();
    });

    it("getSystems derives every status and orders by `order`", async () => {
        const systems = await data.getSystems();
        expect(systems.map((system) => [system.slug, system.status])).toEqual([
            ["atlas-membership", "production"],
            ["relay-qa", "building"],
            ["docsmith", "active"],
            ["formkit-legacy", "maintenance"]
        ]);
        // archived repo is hidden; lab repos are not systems
        expect(systems.some((system) => /importer|vector|shell/.test(system.slug))).toBe(false);
        expect(systems[0]).not.toHaveProperty("architecture");
        expect(systems[0]).not.toHaveProperty("notes");
    });

    it("merges repo and content-repo metadata, and hides what is unknown", async () => {
        const [atlas, relay, docsmith, formkit] = await data.getSystems();

        expect(atlas).toMatchObject({
            name: "Atlas Membership",
            kind: "WordPress Product",
            stack: ["PHP", "JavaScript", "SCSS", "HTML", "wordpress", "membership", "rest-api"],
            problemCount: 2,
            hasArchitecture: true,
            hasWorkflow: false
        });
        expect(atlas.latestRelease?.tag).toBe("v4.2.0");
        expect(relay).toMatchObject({ problemCount: 1, hasWorkflow: true, latestRelease: null });
        // declared only in the content repo, and private: no links
        expect(docsmith).toMatchObject({ name: "DocSmith", kind: "Documentation Tool", isPrivate: true, url: null });
        // tagged with no metadata files
        expect(formkit).toMatchObject({ name: "formkit-legacy", kind: null, role: [], proves: null, description: null });
    });

    it("getSystem returns detail, and null for unknown or archived slugs", async () => {
        const atlas = await data.getSystem("atlas-membership");
        expect(atlas?.architecture?.nodes).toHaveLength(6);
        expect(atlas?.releases.map((release) => release.tag)).toEqual([
            "v4.3.0-beta.1",
            "v4.2.0",
            "v4.1.0",
            "v4.0.0"
        ]);
        expect(atlas?.problems.map((problem) => problem.slug)).toEqual(["multi-membership", "checkout-race"]);
        expect(atlas?.problems[0]).not.toHaveProperty("html");

        const relay = await data.getSystem("relay-qa");
        expect(relay?.workflow?.steps).toHaveLength(3);
        // README sections, in display order; "Install" and "License" are not lifted
        expect(relay?.notes.map((note) => note.title)).toEqual([
            "Why I built it",
            "What works",
            "What doesn't (yet)",
            "Lessons"
        ]);
        expect(relay?.notes[2].html).toContain("Known gaps");
        expect(atlas?.notes).toEqual([]);
        expect(await data.getSystem("old-importer")).toBeNull();
        expect(await data.getSystem("nope")).toBeNull();
    });

    it("getProblem returns rendered case studies from either location", async () => {
        const inRepo = await data.getProblem("atlas-membership", "multi-membership");
        expect(inRepo).toMatchObject({ number: 1, date: "2026-03-05", relatedPRs: [380, 398] });
        expect(inRepo?.diagrams?.after?.nodes).toHaveLength(4);
        expect(inRepo?.headings.map((heading) => heading.id)).toEqual([
            "the-problem",
            "the-decision",
            "the-result"
        ]);

        const inContentRepo = await data.getProblem("relay-qa", "flaky-selectors");
        expect(inContentRepo?.html).toContain('<table tabindex="0">');
        expect(await data.getProblem("relay-qa", "nope")).toBeNull();
        expect(await data.getProblem("nope", "nope")).toBeNull();
    });

    it("getProblemEvidence returns the cited PRs that were merged", async () => {
        const evidence = await data.getProblemEvidence("atlas-membership", "checkout-race");
        // #9999 is cited but does not exist; newest first
        expect(evidence.map((item) => [item.number, item.logNumber])).toEqual([
            [412, 23],
            [409, 21]
        ]);
        expect(evidence[0]).toMatchObject({
            title: "Make webhook activation idempotent",
            additions: 240,
            deletions: 61,
            url: "https://github.com/demo-labs/atlas-membership/pull/412"
        });

        expect(await data.getProblemEvidence("relay-qa", "nope")).toEqual([]);
        expect(await data.getProblemEvidence("nope", "nope")).toEqual([]);
    });

    it("getReleaseNotes groups a system's PRs by release", async () => {
        const notes = await data.getReleaseNotes("atlas-membership");
        expect(notes?.map((item) => [item.release.tag, item.changes.map((c) => c.pr?.number)])).toEqual([
            ["v4.3.0-beta.1", [409]],
            ["v4.2.0", [398, 380]],
            ["v4.1.0", [371]],
            ["v4.0.0", []]
        ]);
        expect(await data.getReleaseNotes("nope")).toBeNull();
    });

    it("getFullLog pins highlights, numbers PRs and includes releases", async () => {
        const log = await data.getFullLog();

        expect(log.slice(0, 2).map((entry) => [entry.pinned, entry.pr?.number])).toEqual([
            [true, 412],
            [true, 380]
        ]);
        expect(log.some((entry) => entry.pr?.number === 405)).toBe(false);

        const numbered = log.filter((entry) => entry.type === "pr").sort((a, b) => b.number! - a.number!);
        expect(numbered[0]).toMatchObject({ number: 24, systemSlug: "relay-qa", pr: { number: 58 } });
        expect(numbered.at(-1)).toMatchObject({ number: 1, systemSlug: "formkit-legacy" });
        // the hidden PR (#405, sixth newest) still owns number 19
        expect(numbered.map((entry) => entry.number)).not.toContain(19);

        expect(log.find((entry) => entry.pr?.number === 412)?.summary).toBe(
            "Order activation now takes a row lock and records the webhook id, so a redelivered event is a no-op."
        );
        expect(log.find((entry) => entry.pr?.number === 398)?.summary).toBeNull();
        expect(log.find((entry) => entry.systemSlug === "docsmith" && entry.type === "pr")?.url).toBeNull();

        // the expanded view: rendered description, size, and the case studies that cite the PR
        const highlighted = log.find((entry) => entry.pr?.number === 412);
        expect(highlighted?.pr?.changedFiles).toBeGreaterThan(0);
        expect(highlighted?.body).toMatchObject({ truncated: false });
        expect(highlighted?.body?.html).toContain("<h2");
        expect(highlighted?.body?.html).not.toContain("Describe your change");
        expect(highlighted?.problems).toEqual([
            { slug: "checkout-race", title: "Double charges under concurrent checkout" }
        ]);
        expect(log.find((entry) => entry.pr?.number === 398)?.body).toBeNull();
        expect(log.find((entry) => entry.pr?.number === 58)?.problems).toEqual([]);

        const releases = log.filter((entry) => entry.type === "release");
        expect(releases.map((entry) => entry.releaseTag).sort()).toEqual([
            "v0.1.0",
            "v1.0.0",
            "v4.0.0",
            "v4.1.0",
            "v4.2.0"
        ]);
        expect(log.find((entry) => entry.systemSlug === "vector-notes")?.systemName).toBe("vector-notes");
    });

    it("getTimeline skips the empty year and uses the note when there is one", async () => {
        const timeline = await data.getTimeline();
        expect(timeline.map((year) => year.year)).toEqual([2026, 2025, 2024, 2023, 2022, 2020, 2019]);

        const byYear = Object.fromEntries(timeline.map((year) => [year.year, year]));
        expect(byYear[2024]).toMatchObject({ title: "The multi-membership rewrite", commits: 790 });
        expect(byYear[2024].html).toContain("<p>Planned the migration");
        expect(byYear[2026]).toMatchObject({ title: "Relay QA", topLanguages: ["TypeScript", "PHP", "Rust"], releasesShipped: 4 });
        // v4.3.0-beta.1 is a prerelease and is not counted
        // the busiest repo of 2022 is private and not a system, so the next one is named
        expect(byYear[2022].title).toBe("Atlas Membership");
    });

    it("getNow, getActivity, getExperiments, getToolUsage and getStats return data", async () => {
        expect(await data.getNow()).toEqual({
            building: { slug: "relay-qa", name: "Relay QA", repo: "demo-dev/relay-qa", commits: 23 },
            learning: ["Rust", "Python"],
            exploring: ["agents", "llm"],
            asOf: "2026-10-01T12:00:00.000Z"
        });

        const activity = await data.getActivity();
        expect(activity.map((item) => [item.repo, item.type, item.count, item.message])).toEqual([
            ["demo-dev/relay-qa", "push", 2, null],
            ["demo-labs/atlas-membership", "push", 3, null],
            ["demo-dev/vector-notes", "push", 1, null]
        ]);

        expect((await data.getExperiments()).map((item) => item.slug)).toEqual(["vector-notes", "tiny-shell"]);

        const tools = await data.getToolUsage();
        expect(tools[0]).toMatchObject({ name: "JavaScript", kind: "language" });
        expect(tools.find((tool) => tool.name === "PHP")?.systems.map((system) => system.slug)).toEqual([
            "atlas-membership",
            "formkit-legacy"
        ]);

        expect(await data.getStats()).toEqual({
            yearsOfEngineering: 7,
            firstYear: 2019,
            products: 4,
            developersLed: 6,
            prsMerged: 12
        });
    });
});
