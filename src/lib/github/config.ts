import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { env } from "@/env";

import { fixturesDir } from "./client";

export type GithubConfig = {
    /** The site owner's GitHub login. */
    login: string;
    /** Owners searched for the portfolio topics. */
    owners: string[];
    contentRepo: { owner: string; name: string };
    /** The data layer's clock. Frozen in mock mode so fixtures keep matching. */
    now: () => Date;
};

/** Written next to the fixtures: who and when they were recorded for. */
export type FixtureMeta = {
    recordedAt: string;
    login: string;
    owners: string[];
    contentRepo: string;
};

function splitRepo(repo: string) {
    const [owner, name] = repo.split("/");
    return { owner, name };
}

function fromFixtures(): GithubConfig {
    const file = path.join(fixturesDir(), "meta.json");
    let meta: FixtureMeta;

    try {
        meta = JSON.parse(readFileSync(file, "utf8")) as FixtureMeta;
    } catch {
        throw new Error(
            `GITHUB_MOCK is on but ${file} is missing. Run \`npm run fixtures:demo\`.`
        );
    }

    // Requests are matched by their variables, so mock mode has to ask for the
    // same login, owners and dates the fixtures were recorded with.
    return {
        login: meta.login,
        owners: meta.owners,
        contentRepo: splitRepo(meta.contentRepo),
        now: () => new Date(meta.recordedAt)
    };
}

function fromEnv(): GithubConfig {
    return {
        login: env.GITHUB_LOGIN,
        owners: env.GITHUB_SYSTEM_OWNERS,
        contentRepo: splitRepo(env.GITHUB_CONTENT_REPO),
        now: () => new Date()
    };
}

let config: GithubConfig | undefined;

export function getConfig(): GithubConfig {
    config ??= env.GITHUB_MOCK ? fromFixtures() : fromEnv();
    return config;
}

/** Replaces the config. For scripts and tests only. */
export function setConfig(next: GithubConfig) {
    config = next;
}

/** Midnight UTC, `days` ago. Day precision keeps request variables stable within a day. */
export function daysAgo(now: Date, days: number) {
    const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    date.setUTCDate(date.getUTCDate() - days);
    return date;
}
