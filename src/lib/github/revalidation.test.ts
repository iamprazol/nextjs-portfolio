import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { ALL_TAGS, tagsForEvent, verifyBearer, verifySignature } from "./revalidation";

const SECRET = "s3cret";
const BODY = JSON.stringify({ repository: { full_name: "demo-dev/atlas" } });
const sign = (body: string, secret = SECRET) =>
    `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

describe("verifySignature", () => {
    it("accepts the HMAC-SHA256 of the raw body", () => {
        expect(verifySignature(SECRET, BODY, sign(BODY))).toBe(true);
    });

    it("rejects a changed body, a wrong secret and a malformed or missing header", () => {
        expect(verifySignature(SECRET, BODY + " ", sign(BODY))).toBe(false);
        expect(verifySignature(SECRET, BODY, sign(BODY, "other"))).toBe(false);
        expect(verifySignature(SECRET, BODY, sign(BODY).replace("sha256=", "sha1="))).toBe(false);
        expect(verifySignature(SECRET, BODY, "sha256=abc")).toBe(false);
        expect(verifySignature(SECRET, BODY, "")).toBe(false);
        expect(verifySignature(SECRET, BODY, null)).toBe(false);
    });

    it("never accepts anything when no secret is configured", () => {
        expect(verifySignature("", BODY, sign(BODY, ""))).toBe(false);
    });
});

describe("verifyBearer", () => {
    it("accepts only the exact bearer token", () => {
        expect(verifyBearer(SECRET, `Bearer ${SECRET}`)).toBe(true);
        expect(verifyBearer(SECRET, `Bearer ${SECRET}x`)).toBe(false);
        expect(verifyBearer(SECRET, SECRET)).toBe(false);
        expect(verifyBearer(SECRET, null)).toBe(false);
        expect(verifyBearer("", "Bearer ")).toBe(false);
    });
});

describe("tagsForEvent", () => {
    const base = {
        contentRepo: "demo-dev/demo-dev",
        sources: [
            { repo: "demo-labs/atlas-membership", slug: "atlas-membership" },
            { repo: "demo-dev/tiny-shell", slug: "tiny-shell" }
        ]
    };
    const tagsFor = (event: string, repo: string | null) => tagsForEvent({ ...base, event, repo }).sort();

    it.each([
        ["push", "demo-labs/atlas-membership", ["gh:activity", "gh:log", "gh:now", "gh:system:atlas-membership", "gh:systems"]],
        ["pull_request", "Demo-Labs/Atlas-Membership", ["gh:activity", "gh:log", "gh:now", "gh:system:atlas-membership", "gh:systems"]],
        ["release", "demo-labs/atlas-membership", ["gh:activity", "gh:log", "gh:now", "gh:system:atlas-membership", "gh:systems", "gh:timeline"]],
        ["push", "demo-dev/tiny-shell", ["gh:activity", "gh:log", "gh:now", "gh:system:tiny-shell", "gh:systems"]],
        ["push", "demo-dev/demo-dev", ["gh:profile", "gh:systems", "gh:timeline"]],
        // A repo that just gained the portfolio-system topic is not a known source yet.
        ["repository", "demo-dev/brand-new", ["gh:systems"]],
        ["repository", "demo-labs/atlas-membership", ["gh:activity", "gh:log", "gh:now", "gh:system:atlas-membership", "gh:systems"]],
        ["push", "someone/else", []],
        ["release", "someone/else", []],
        ["ping", null, []]
    ])("%s on %s", (event, repo, expected) => {
        expect(tagsFor(event, repo)).toEqual(expected);
    });

    it("unions the tags when the content repo is also a system", () => {
        const found = tagsForEvent({
            event: "push",
            repo: "demo-dev/demo-dev",
            contentRepo: "demo-dev/demo-dev",
            sources: [{ repo: "demo-dev/demo-dev", slug: "demo-dev" }]
        });
        expect(found).toHaveLength(new Set(found).size);
        expect(found).toEqual(expect.arrayContaining(["gh:profile", "gh:timeline", "gh:system:demo-dev", "gh:log"]));
    });

    it("ALL_TAGS covers every tag that is not per-system", () => {
        expect(ALL_TAGS).toEqual(["gh:profile", "gh:systems", "gh:log", "gh:timeline", "gh:activity", "gh:now"]);
    });
});
