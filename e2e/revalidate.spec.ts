import { createHmac } from "node:crypto";

import { expect, test, type APIRequestContext } from "@playwright/test";

// The secrets are set for the test server in playwright.config.ts. Mock
// fixtures: demo-labs/atlas-membership is a system, demo-dev/tiny-shell an
// experiment and demo-dev/demo-dev the content repo.

const WEBHOOK_SECRET = "e2e-webhook-secret";

function deliver(request: APIRequestContext, event: string, payload: unknown, secret = WEBHOOK_SECRET) {
    const body = JSON.stringify(payload);
    return request.post("/api/revalidate", {
        headers: {
            "content-type": "application/json",
            "x-github-event": event,
            "x-hub-signature-256": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
        },
        data: body
    });
}

const repository = (full_name: string) => ({ repository: { full_name } });

test.describe("webhook", () => {
    test("revalidates a system's tags on a push", async ({ request }) => {
        const response = await deliver(request, "push", repository("demo-labs/atlas-membership"));
        expect(response.status()).toBe(202);
        expect(await response.json()).toEqual({
            event: "push",
            repo: "demo-labs/atlas-membership",
            revalidated: ["gh:systems", "gh:system:atlas-membership", "gh:log", "gh:activity", "gh:now"]
        });
    });

    test("adds the timeline on a release, and knows the content repo", async ({ request }) => {
        const release = await deliver(request, "release", repository("demo-labs/atlas-membership"));
        expect((await release.json()).revalidated).toContain("gh:timeline");

        const content = await deliver(request, "push", repository("demo-dev/demo-dev"));
        expect((await content.json()).revalidated).toEqual(["gh:profile", "gh:systems", "gh:timeline"]);
    });

    test("accepts events it has nothing to do for", async ({ request }) => {
        const ping = await deliver(request, "ping", { zen: "Keep it logically awesome." });
        expect(ping.status()).toBe(202);
        expect((await ping.json()).revalidated).toEqual([]);

        const other = await deliver(request, "push", repository("someone/else"));
        expect((await other.json()).revalidated).toEqual([]);
    });

    test("rejects a missing, wrong or mismatched signature with 401", async ({ request }) => {
        const body = JSON.stringify(repository("demo-labs/atlas-membership"));
        const headers = { "content-type": "application/json", "x-github-event": "push" };

        expect((await request.post("/api/revalidate", { headers, data: body })).status()).toBe(401);
        expect((await deliver(request, "push", repository("demo-labs/atlas-membership"), "wrong")).status()).toBe(401);

        // A valid signature for a different body.
        const signature = `sha256=${createHmac("sha256", WEBHOOK_SECRET).update("{}").digest("hex")}`;
        const tampered = await request.post("/api/revalidate", {
            headers: { ...headers, "x-hub-signature-256": signature },
            data: body
        });
        expect(tampered.status()).toBe(401);
    });
});

test.describe("cron", () => {
    const authorization = "Bearer e2e-cron-secret";

    test("revalidates every tag with the cron secret", async ({ request }) => {
        const response = await request.get("/api/revalidate?all=1", { headers: { authorization } });
        expect(response.status()).toBe(202);
        expect(await response.json()).toEqual({
            revalidated: ["gh:profile", "gh:systems", "gh:log", "gh:timeline", "gh:activity", "gh:now"]
        });
    });

    test("needs the secret, and all=1", async ({ request }) => {
        expect((await request.get("/api/revalidate?all=1")).status()).toBe(401);
        expect(
            (await request.get("/api/revalidate?all=1", { headers: { authorization: "Bearer nope" } })).status()
        ).toBe(401);
        // The webhook secret is not the cron secret.
        expect(
            (await request.get("/api/revalidate?all=1", { headers: { authorization: "Bearer e2e-webhook-secret" } })).status()
        ).toBe(401);
        expect((await request.get("/api/revalidate", { headers: { authorization } })).status()).toBe(400);
    });
});
