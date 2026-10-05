type Result = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * A sliding-window limiter kept in memory: at most `limit` hits per key in any
 * `windowMs`. It lives in one server process, so on serverless hosting each
 * warm instance counts separately — enough to blunt a burst, not a guarantee.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
    const hits = new Map<string, number[]>();

    return function check(key: string, now = Date.now()): Result {
        // Forget keys whose hits have all expired, so the map cannot grow forever.
        for (const [other, times] of hits) {
            if (times.every((time) => now - time >= windowMs)) hits.delete(other);
        }

        const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
        if (recent.length >= limit) {
            hits.set(key, recent);
            return {
                allowed: false,
                retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000))
            };
        }

        hits.set(key, [...recent, now]);
        return { allowed: true };
    };
}
