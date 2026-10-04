import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Octokit } from "@octokit/rest";

import { env } from "@/env";

type Variables = Record<string, unknown>;

/** What actually answers a request: the GitHub API, the fixtures, or a test double. */
export type Transport = {
    graphql: (query: string, variables: Variables) => Promise<unknown>;
    rest: (route: string, params: Variables) => Promise<unknown>;
};

export const retry = { retries: 2, baseDelayMs: 500 };

const RATE_LIMIT_WARN_BELOW = 500;

export function fixturesDir() {
    return path.resolve(process.cwd(), env.GITHUB_FIXTURES_DIR);
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, v]) => v !== undefined)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => [k, sortKeys(v)])
        );
    }
    return value;
}

/** Stable file name for a request: whitespace and key order do not matter. */
export function fixtureKey(
    kind: "graphql" | "rest",
    document: string,
    variables: Variables
) {
    const normalized = document.replace(/\s+/g, " ").trim();
    return createHash("sha256")
        .update(JSON.stringify([kind, normalized, sortKeys(variables)]))
        .digest("hex")
        .slice(0, 16);
}

function describe(kind: string, document: string) {
    return kind === "graphql"
        ? (document.match(/\b(?:query|mutation)\s+(\w+)/)?.[1] ?? "anonymous")
        : document;
}

type Fixture = {
    request: { kind: string; name: string; variables: unknown };
    response: unknown;
};

async function readFixture(
    kind: "graphql" | "rest",
    document: string,
    variables: Variables
) {
    const key = fixtureKey(kind, document, variables);
    const file = path.join(fixturesDir(), `${key}.json`);

    try {
        const fixture = JSON.parse(await readFile(file, "utf8")) as Fixture;
        return fixture.response;
    } catch {
        throw new Error(
            `No fixture for ${kind} ${describe(kind, document)} ` +
                `${JSON.stringify(sortKeys(variables))} (expected ${file}). ` +
                "Run `npm run fixtures:demo` to regenerate fixtures."
        );
    }
}

const mockTransport: Transport = {
    graphql: (query, variables) => readFixture("graphql", query, variables),
    rest: (route, params) => readFixture("rest", route, params)
};

function isRetryable(error: unknown) {
    if (!error || typeof error !== "object") return false;
    const { status, message, response } = error as {
        status?: number;
        message?: string;
        response?: { headers?: Record<string, string> };
    };

    if (typeof status === "number" && status >= 500) return true;
    if (status === 403 || status === 429) {
        return (
            /secondary rate limit/i.test(message ?? "") ||
            response?.headers?.["retry-after"] !== undefined
        );
    }
    return false;
}

function retryDelay(error: unknown, attempt: number) {
    const after = Number(
        (error as { response?: { headers?: Record<string, string> } }).response
            ?.headers?.["retry-after"]
    );
    // Honor Retry-After, but never stall a page render for more than 10s.
    if (Number.isFinite(after) && after > 0) return Math.min(after, 10) * 1000;
    return retry.baseDelayMs * 2 ** attempt;
}

/** Retries on 5xx and secondary rate limits, with exponential backoff. */
export async function withRetry<T>(run: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try {
            return await run();
        } catch (error) {
            if (attempt >= retry.retries || !isRetryable(error)) throw error;
            await new Promise((resolve) =>
                setTimeout(resolve, retryDelay(error, attempt))
            );
        }
    }
}

let octokit: Octokit | undefined;

function getOctokit() {
    if (octokit) return octokit;
    if (!env.GITHUB_TOKEN) {
        throw new Error(
            "GITHUB_TOKEN is not set. Add it to .env.local, or set GITHUB_MOCK=1 to use fixtures."
        );
    }

    octokit = new Octokit({ auth: env.GITHUB_TOKEN });
    octokit.hook.after("request", (response) => {
        const remaining = Number(response.headers["x-ratelimit-remaining"]);
        if (Number.isFinite(remaining) && remaining < RATE_LIMIT_WARN_BELOW) {
            console.warn(
                `[github] rate limit low: ${remaining} requests left ` +
                    `(${response.headers["x-ratelimit-resource"] ?? "core"})`
            );
        }
    });
    return octokit;
}

const liveTransport: Transport = {
    graphql: (query, variables) =>
        withRetry(() => getOctokit().graphql(query, variables)),
    rest: (route, params) =>
        withRetry(async () => (await getOctokit().request(route, params)).data)
};

let transport: Transport = env.GITHUB_MOCK ? mockTransport : liveTransport;

/** Replaces the transport. For scripts and tests only. */
export function setTransport(next: Transport) {
    transport = next;
}

/**
 * Wraps a transport so every response is also written to `dir` as a fixture.
 * Only the request name, its variables and the response body are stored —
 * never headers, so no token can end up on disk.
 */
export function recordingTransport(inner: Transport, dir: string): Transport {
    const save = async (
        kind: "graphql" | "rest",
        document: string,
        variables: Variables,
        response: unknown
    ) => {
        const fixture: Fixture = {
            request: {
                kind,
                name: describe(kind, document),
                variables: sortKeys(variables)
            },
            response
        };
        await mkdir(dir, { recursive: true });
        await writeFile(
            path.join(dir, `${fixtureKey(kind, document, variables)}.json`),
            JSON.stringify(fixture, null, 2) + "\n"
        );
        return response;
    };

    return {
        graphql: async (query, variables) =>
            save("graphql", query, variables, await inner.graphql(query, variables)),
        rest: async (route, params) =>
            save("rest", route, params, await inner.rest(route, params))
    };
}

export { liveTransport };

/** Runs a GraphQL query against GitHub (or the fixtures in mock mode). */
export function gql<T>(query: string, variables: Variables = {}): Promise<T> {
    return transport.graphql(query, variables) as Promise<T>;
}

/** Calls a REST route such as "GET /users/{username}/events/public". */
export function rest<T>(route: string, params: Variables = {}): Promise<T> {
    return transport.rest(route, params) as Promise<T>;
}
