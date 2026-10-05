import { ALL_TAGS } from "./revalidation";

// Observability for the data layer: one structured log line per GitHub call
// and per revalidation, and a record of when each cache tag was last fetched
// or marked stale (shown on the dev-only /_data/health page).

/** One JSON line on stdout, e.g. {"scope":"github","call":"Systems","ms":412,…}. */
export function logEvent(scope: "github" | "revalidate", fields: Record<string, unknown>) {
    console.info(JSON.stringify({ scope, at: new Date().toISOString(), ...fields }));
}

type Times = { fetched: Map<string, string>; revalidated: Map<string, string> };

// On globalThis because Next can load this module more than once (per route
// bundle, and again after a hot reload) and they must all see the same record.
const store = globalThis as typeof globalThis & { __githubHealth?: Times };
const times = (): Times => (store.__githubHealth ??= { fetched: new Map(), revalidated: new Map() });

/** A cached getter carrying these tags just ran its loader (a cache miss). */
export function recordFetch(tags: string[], now = new Date()) {
    for (const tag of tags) times().fetched.set(tag, now.toISOString());
}

/** These tags were just marked stale. */
export function recordRevalidation(tags: string[], now = new Date()) {
    for (const tag of tags) times().revalidated.set(tag, now.toISOString());
}

export type TagHealth = { tag: string; fetchedAt: string | null; revalidatedAt: string | null };

/**
 * Every known tag with when it was last fetched and last revalidated. Kept in
 * memory, so it only covers this server process since it started.
 */
export function getHealth(): TagHealth[] {
    const { fetched, revalidated } = times();
    const perSystem = [...new Set([...fetched.keys(), ...revalidated.keys()])]
        .filter((tag) => !ALL_TAGS.includes(tag))
        .sort();

    return [...ALL_TAGS, ...perSystem].map((tag) => ({
        tag,
        fetchedAt: fetched.get(tag) ?? null,
        revalidatedAt: revalidated.get(tag) ?? null
    }));
}

/** Forgets everything. For tests. */
export function resetHealth() {
    delete store.__githubHealth;
}
