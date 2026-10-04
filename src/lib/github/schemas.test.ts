import { describe, expect, it } from "vitest";

import {
    ProblemFrontmatterSchema,
    ProfileSchema,
    SystemMetaFileSchema,
    SystemMetaSchema,
    WorkflowSchema
} from "./schemas";

describe("ProfileSchema", () => {
    const profile = {
        name: "Demo Dev",
        headline: "Engineer",
        intro: "Builds things.",
        location: { label: "Somewhere", lat: 1, lng: 2 },
        links: { github: "https://github.com/demo-dev", linkedin: "", x: "", email: "" },
        howIWork: ["Read first"]
    };

    it("treats empty link strings as unset", () => {
        const parsed = ProfileSchema.parse(profile);
        expect(parsed.links).toEqual({ github: "https://github.com/demo-dev" });
        expect(parsed.leadership).toBeUndefined();
    });

    it("rejects a profile without a name or with bad coordinates", () => {
        expect(ProfileSchema.safeParse({ ...profile, name: "" }).success).toBe(false);
        expect(
            ProfileSchema.safeParse({
                ...profile,
                location: { label: "x", lat: 123, lng: 0 }
            }).success
        ).toBe(false);
    });
});

describe("SystemMeta", () => {
    it("requires kind in the full schema but not in a single file", () => {
        expect(SystemMetaSchema.safeParse({ role: ["Architecture"] }).success).toBe(false);
        expect(SystemMetaFileSchema.safeParse({ role: ["Architecture"] }).success).toBe(true);
    });

    it("rejects unknown statuses, bad slugs and bad repo names", () => {
        expect(SystemMetaFileSchema.safeParse({ status: "shipping" }).success).toBe(false);
        expect(SystemMetaFileSchema.safeParse({ slug: "Not A Slug" }).success).toBe(false);
        expect(SystemMetaFileSchema.safeParse({ repo: "no-owner" }).success).toBe(false);
    });
});

describe("ProblemFrontmatterSchema", () => {
    it("accepts a YAML date object and turns it into a date string", () => {
        const parsed = ProblemFrontmatterSchema.parse({
            number: 1,
            title: "T",
            summary: "S",
            date: new Date("2024-05-01T00:00:00Z")
        });
        expect(parsed.date).toBe("2024-05-01");
    });

    it("rejects a missing title and a malformed diagram", () => {
        expect(ProblemFrontmatterSchema.safeParse({ number: 1, summary: "S" }).success).toBe(false);
        expect(
            ProblemFrontmatterSchema.safeParse({
                number: 1,
                title: "T",
                summary: "S",
                diagrams: { before: { nodes: [{ id: "a" }], edges: [] } }
            }).success
        ).toBe(false);
    });
});

describe("WorkflowSchema", () => {
    it("parses steps with nodes and edges", () => {
        const parsed = WorkflowSchema.parse({
            steps: [{ title: "Plan", subtitle: "First", detail: "Think.", node: "a" }],
            nodes: [{ id: "a", label: "A" }],
            edges: []
        });
        expect(parsed.steps[0].node).toBe("a");
    });
});
