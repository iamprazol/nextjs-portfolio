import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getHealth, logEvent, recordFetch, recordRevalidation, resetHealth } from "./observe";

beforeEach(resetHealth);
afterEach(() => vi.restoreAllMocks());

describe("logEvent", () => {
    it("prints one JSON line with the scope and a timestamp", () => {
        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        logEvent("github", { call: "Systems", ms: 12, remaining: 4999 });

        expect(info).toHaveBeenCalledTimes(1);
        const line = JSON.parse(info.mock.calls[0][0] as string);
        expect(line).toMatchObject({ scope: "github", call: "Systems", ms: 12, remaining: 4999 });
        expect(Number.isNaN(Date.parse(line.at))).toBe(false);
    });
});

describe("getHealth", () => {
    it("lists every fixed tag, with no times before anything happened", () => {
        expect(getHealth()).toEqual(
            ["gh:profile", "gh:systems", "gh:log", "gh:timeline", "gh:activity", "gh:now"].map((tag) => ({
                tag,
                fetchedAt: null,
                revalidatedAt: null
            }))
        );
    });

    it("remembers the latest fetch and revalidation per tag", () => {
        recordFetch(["gh:log", "gh:systems"], new Date("2026-10-01T10:00:00Z"));
        recordFetch(["gh:log"], new Date("2026-10-01T11:00:00Z"));
        recordRevalidation(["gh:log"], new Date("2026-10-01T10:30:00Z"));

        const health = Object.fromEntries(getHealth().map((item) => [item.tag, item]));
        expect(health["gh:log"]).toMatchObject({
            fetchedAt: "2026-10-01T11:00:00.000Z",
            revalidatedAt: "2026-10-01T10:30:00.000Z"
        });
        expect(health["gh:systems"]).toMatchObject({ fetchedAt: "2026-10-01T10:00:00.000Z", revalidatedAt: null });
        expect(health["gh:profile"].fetchedAt).toBeNull();
    });

    it("adds per-system tags after the fixed ones, sorted", () => {
        recordFetch(["gh:system:relay-qa"]);
        recordRevalidation(["gh:system:atlas"]);
        expect(getHealth().map((item) => item.tag).slice(-2)).toEqual(["gh:system:atlas", "gh:system:relay-qa"]);
    });
});
