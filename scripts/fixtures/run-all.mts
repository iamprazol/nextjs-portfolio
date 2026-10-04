import { gql } from "../../src/lib/github/client";

/**
 * Every request the data layer makes, so the recorder can capture each one.
 * Later M02 steps replace this probe with the real queries.
 */
export async function runAll() {
    const { rateLimit } = await gql<{ rateLimit: { remaining: number } }>(
        /* GraphQL */ `
            query RateLimit {
                rateLimit {
                    remaining
                }
            }
        `
    );
    console.log(`rate limit remaining: ${rateLimit.remaining}`);
}
