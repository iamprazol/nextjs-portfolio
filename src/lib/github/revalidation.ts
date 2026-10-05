import { createHmac, timingSafeEqual } from "node:crypto";

// What a GitHub webhook delivery means for the cache: is it really from
// GitHub, and which cache tags does it make stale. Pure functions; the route
// in src/app/api/revalidate does the I/O.

export const tags = {
    profile: "gh:profile",
    systems: "gh:systems",
    system: (slug: string) => `gh:system:${slug}`,
    log: "gh:log",
    timeline: "gh:timeline",
    activity: "gh:activity",
    now: "gh:now"
} as const;

/** Every tag that is not per-system. Each per-system entry also carries gh:systems. */
export const ALL_TAGS = [
    tags.profile,
    tags.systems,
    tags.log,
    tags.timeline,
    tags.activity,
    tags.now
];

function safeEqual(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    // timingSafeEqual throws on different lengths; a length mismatch is simply "no".
    return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Checks GitHub's X-Hub-Signature-256 header ("sha256=<hex>") against the
 * HMAC-SHA256 of the raw request body. Compared in constant time.
 */
export function verifySignature(secret: string, body: string, header: string | null) {
    if (!secret || !header?.startsWith("sha256=")) return false;
    const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    return safeEqual(expected, header);
}

/** Checks an "Authorization: Bearer <secret>" header in constant time. */
export function verifyBearer(secret: string, header: string | null) {
    return Boolean(secret) && header !== null && safeEqual(`Bearer ${secret}`, header);
}

/**
 * The cache tags a webhook delivery makes stale.
 *
 * - A system or experiment repo: its own page, the systems list, the log and
 *   the activity / "now" data.
 * - The content repo: profile, systems (their narrative lives there too) and
 *   timeline notes.
 * - A `release` event also changes the timeline; a `repository` event (a repo
 *   was created, renamed, archived or had its topics edited) may add or
 *   remove a system, whatever repo it is about.
 *
 * Anything else — a push to an unrelated repo, GitHub's `ping` — is nothing.
 */
export function tagsForEvent(input: {
    /** The X-GitHub-Event header. */
    event: string;
    /** `repository.full_name` from the payload, if it has one. */
    repo: string | null;
    contentRepo: string;
    /** Systems and experiments: the repos the site is built from. */
    sources: { repo: string; slug: string }[];
}): string[] {
    const repo = input.repo?.toLowerCase();
    if (!repo) return [];

    const found = new Set<string>();
    const add = (...list: string[]) => list.forEach((tag) => found.add(tag));

    const source = input.sources.find((item) => item.repo.toLowerCase() === repo);
    if (source) {
        add(tags.systems, tags.system(source.slug), tags.log, tags.activity, tags.now);
        if (input.event === "release") add(tags.timeline);
    }
    if (repo === input.contentRepo.toLowerCase()) add(tags.profile, tags.systems, tags.timeline);
    if (input.event === "repository") add(tags.systems);

    return [...found];
}
