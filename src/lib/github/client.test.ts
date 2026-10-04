import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const QUERY = /* GraphQL */ `
    query Example($login: String!) {
        user(login: $login) {
            name
        }
    }
`;
const ROUTE = "GET /users/{username}/events/public";

let requests = 0;
let graphqlHandler: () => Response = () => HttpResponse.error();

// Any request that leaves the process lands here and is counted.
const server = setupServer(
    http.post("https://api.github.com/graphql", () => {
        requests++;
        return graphqlHandler();
    }),
    http.all("*", () => {
        requests++;
        return HttpResponse.error();
    })
);

let dir: string;

beforeAll(async () => {
    server.listen({ onUnhandledRequest: "error" });
    dir = await mkdtemp(path.join(os.tmpdir(), "gh-fixtures-"));
});

afterEach(() => {
    requests = 0;
    vi.unstubAllEnvs();
    vi.resetModules();
});

afterAll(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
});

async function loadClient(envVars: Record<string, string>) {
    vi.resetModules();
    for (const [key, value] of Object.entries(envVars)) vi.stubEnv(key, value);
    return import("./client");
}

describe("mock mode", () => {
    const mockEnv = () => ({ GITHUB_MOCK: "1", GITHUB_FIXTURES_DIR: dir });

    it("answers graphql and rest from fixtures without touching the network", async () => {
        const client = await loadClient(mockEnv());
        const write = (key: string, response: unknown) =>
            writeFile(
                path.join(dir, `${key}.json`),
                JSON.stringify({ request: {}, response })
            );

        await write(
            client.fixtureKey("graphql", QUERY, { login: "demo-dev" }),
            { user: { name: "Demo" } }
        );
        await write(
            client.fixtureKey("rest", ROUTE, { username: "demo-dev" }),
            [{ type: "PushEvent" }]
        );

        await expect(client.gql(QUERY, { login: "demo-dev" })).resolves.toEqual({
            user: { name: "Demo" }
        });
        await expect(client.rest(ROUTE, { username: "demo-dev" })).resolves.toEqual([
            { type: "PushEvent" }
        ]);
        expect(requests).toBe(0);
    });

    it("fails loudly on a missing fixture instead of calling GitHub", async () => {
        const client = await loadClient(mockEnv());

        await expect(client.gql(QUERY, { login: "nobody" })).rejects.toThrow(
            /No fixture for graphql Example/
        );
        await expect(client.rest(ROUTE, { username: "nobody" })).rejects.toThrow(
            /No fixture for rest/
        );
        expect(requests).toBe(0);
    });

    it("ignores a token when mock mode is on", async () => {
        const client = await loadClient({ ...mockEnv(), GITHUB_TOKEN: "secret" });

        await expect(client.gql(QUERY, { login: "nobody" })).rejects.toThrow(
            /No fixture/
        );
        expect(requests).toBe(0);
    });
});

describe("fixtureKey", () => {
    it("ignores whitespace and variable order, but not values", async () => {
        const { fixtureKey } = await loadClient({ GITHUB_MOCK: "1" });

        expect(fixtureKey("graphql", "query A { a }", { x: 1, y: 2 })).toBe(
            fixtureKey("graphql", "query   A {\n a }", { y: 2, x: 1 })
        );
        expect(fixtureKey("graphql", "query A { a }", { x: 1 })).not.toBe(
            fixtureKey("graphql", "query A { a }", { x: 2 })
        );
        expect(fixtureKey("graphql", "x", {})).not.toBe(fixtureKey("rest", "x", {}));
    });
});

describe("live mode", () => {
    const liveEnv = { GITHUB_MOCK: "0", GITHUB_TOKEN: "test-token" };

    it("retries twice on 5xx, then succeeds", async () => {
        const client = await loadClient(liveEnv);
        client.retry.baseDelayMs = 1;

        let calls = 0;
        graphqlHandler = () =>
            ++calls < 3
                ? new HttpResponse(null, { status: 502 })
                : HttpResponse.json({ data: { user: { name: "Live" } } });

        await expect(client.gql(QUERY, { login: "x" })).resolves.toEqual({
            user: { name: "Live" }
        });
        expect(requests).toBe(3);
    });

    it("gives up after two retries", async () => {
        const client = await loadClient(liveEnv);
        client.retry.baseDelayMs = 1;
        graphqlHandler = () => new HttpResponse(null, { status: 503 });

        await expect(client.gql(QUERY, { login: "x" })).rejects.toThrow();
        expect(requests).toBe(3);
    });

    it("does not retry client errors", async () => {
        const client = await loadClient(liveEnv);
        client.retry.baseDelayMs = 1;
        graphqlHandler = () => new HttpResponse(null, { status: 401 });

        await expect(client.gql(QUERY, { login: "x" })).rejects.toThrow();
        expect(requests).toBe(1);
    });

    it("warns when the rate limit is nearly used up", async () => {
        const client = await loadClient(liveEnv);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        graphqlHandler = () =>
            HttpResponse.json(
                { data: { user: null } },
                { headers: { "x-ratelimit-remaining": "42" } }
            );

        await client.gql(QUERY, { login: "x" });
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("42 requests left"));
        warn.mockRestore();
    });

    it("returns partial data when only inaccessible nodes failed", async () => {
        const client = await loadClient(liveEnv);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        graphqlHandler = () =>
            HttpResponse.json({
                data: { search: { nodes: [null, { number: 7 }] } },
                errors: [{ type: "FORBIDDEN", message: "org forbids this token" }]
            });

        await expect(client.gql(QUERY, { login: "x" })).resolves.toEqual({
            search: { nodes: [null, { number: 7 }] }
        });
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining("org forbids this token")
        );
        warn.mockRestore();
    });

    it("still throws on other graphql errors", async () => {
        const client = await loadClient(liveEnv);
        graphqlHandler = () =>
            HttpResponse.json({
                data: { user: null },
                errors: [{ type: "INVALID", message: "bad query" }]
            });

        await expect(client.gql(QUERY, { login: "x" })).rejects.toThrow(/bad query/);
    });

    it("refuses to call GitHub without a token", async () => {
        const client = await loadClient({ GITHUB_MOCK: "0", GITHUB_TOKEN: "" });

        await expect(client.gql(QUERY, { login: "x" })).rejects.toThrow(
            /GITHUB_TOKEN is not set/
        );
        expect(requests).toBe(0);
    });
});
