import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { getExperiments, getSystems } from "@/lib/github";
import { getConfig } from "@/lib/github/config";
import {
    ALL_TAGS,
    tagsForEvent,
    verifyBearer,
    verifySignature
} from "@/lib/github/revalidation";

// GitHub webhook receiver (ARCHITECTURE.md §6): a push, pull request, release
// or repository event marks the matching cache tags stale, so the next visit
// refetches from GitHub instead of waiting out the hour. GET is the daily
// cron fallback, for data that changes without any webhook (activity, "now").

/** Systems and experiments, to recognise which repo an event is about. */
async function loadSources() {
    const [systems, experiments] = await Promise.all([getSystems(), getExperiments()]);
    return [...systems, ...experiments].map(({ repo, slug }) => ({ repo, slug }));
}

export async function POST(req: Request) {
    if (!env.GITHUB_WEBHOOK_SECRET) {
        return NextResponse.json({ message: "Webhook secret is not configured" }, { status: 503 });
    }

    // The signature covers the exact bytes GitHub sent, so read the body as text.
    const body = await req.text();
    if (!verifySignature(env.GITHUB_WEBHOOK_SECRET, body, req.headers.get("x-hub-signature-256"))) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    let repo: string | null = null;
    try {
        const payload = JSON.parse(body) as { repository?: { full_name?: unknown } };
        if (typeof payload.repository?.full_name === "string") repo = payload.repository.full_name;
    } catch {
        return NextResponse.json({ message: "Body is not JSON" }, { status: 400 });
    }

    const event = req.headers.get("x-github-event") ?? "";
    // From the data layer's config, not env: in mock mode the content repo is
    // the fixtures' one.
    const { contentRepo } = getConfig();
    let stale: string[];
    try {
        stale = tagsForEvent({
            event,
            repo,
            contentRepo: `${contentRepo.owner}/${contentRepo.name}`,
            sources: await loadSources()
        });
    } catch {
        // The list of systems could not be loaded, so the repo cannot be
        // matched. Refreshing everything is slower but never leaves stale data.
        stale = repo ? ALL_TAGS : [];
    }

    for (const tag of stale) revalidateTag(tag);
    return NextResponse.json({ event, repo, revalidated: stale }, { status: 202 });
}

/**
 * `GET /api/revalidate?all=1` with `Authorization: Bearer <CRON_SECRET>`:
 * marks every tag stale. Vercel cron sends that header by itself when the
 * CRON_SECRET environment variable is set (see vercel.json).
 */
export async function GET(req: Request) {
    if (!env.CRON_SECRET) {
        return NextResponse.json({ message: "Cron secret is not configured" }, { status: 503 });
    }
    if (!verifyBearer(env.CRON_SECRET, req.headers.get("authorization"))) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (new URL(req.url).searchParams.get("all") !== "1") {
        return NextResponse.json({ message: "Nothing to do: pass ?all=1" }, { status: 400 });
    }

    // Per-system entries are tagged gh:systems as well, so this covers them.
    for (const tag of ALL_TAGS) revalidateTag(tag);
    return NextResponse.json({ revalidated: ALL_TAGS }, { status: 202 });
}
