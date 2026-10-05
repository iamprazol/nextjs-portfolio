import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

const HOUR = 3_600_000;

describe("createRateLimiter", () => {
    it("allows `limit` hits per key in the window, then says when to retry", () => {
        const check = createRateLimiter({ limit: 5, windowMs: HOUR });
        for (let i = 0; i < 5; i++) expect(check("a", i * 1000)).toEqual({ allowed: true });

        // The oldest hit was at t=0, so the next slot opens one hour after it.
        expect(check("a", 10_000)).toEqual({ allowed: false, retryAfterSeconds: 3590 });
        // A refused hit does not extend the wait.
        expect(check("a", 20_000)).toEqual({ allowed: false, retryAfterSeconds: 3580 });
    });

    it("counts each key separately", () => {
        const check = createRateLimiter({ limit: 1, windowMs: HOUR });
        expect(check("a", 0).allowed).toBe(true);
        expect(check("b", 0).allowed).toBe(true);
        expect(check("a", 1).allowed).toBe(false);
    });

    it("lets hits through again as old ones leave the window", () => {
        const check = createRateLimiter({ limit: 2, windowMs: HOUR });
        check("a", 0);
        check("a", 1000);
        expect(check("a", HOUR - 1).allowed).toBe(false);
        expect(check("a", HOUR).allowed).toBe(true);
        expect(check("a", HOUR + 500).allowed).toBe(false);
        expect(check("a", HOUR + 1000).allowed).toBe(true);
    });
});
