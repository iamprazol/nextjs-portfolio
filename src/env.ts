import "server-only";
import { z } from "zod";

// A key left blank in .env.local arrives as "", which should behave like unset.
const blankToUndefined = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
    blankToUndefined,
    z.string().trim().optional()
);

const schema = z
    .object({
        GITHUB_LOGIN: z.preprocess(
            blankToUndefined,
            z.string({ error: "GITHUB_LOGIN is required" }).trim()
        ),
        GITHUB_TOKEN: optionalString,
        GITHUB_CONTENT_REPO: z.preprocess(
            blankToUndefined,
            z
                .string()
                .trim()
                .regex(/^[^/\s]+\/[^/\s]+$/, 'Expected "owner/name"')
                .default("iamprazol/iamprazol")
        ),
        GITHUB_SYSTEM_OWNERS: z.preprocess(
            blankToUndefined,
            z
                .string()
                .default("")
                .transform((list) =>
                    list
                        .split(",")
                        .map((owner) => owner.trim())
                        .filter(Boolean)
                )
        ),
        GITHUB_WEBHOOK_SECRET: optionalString,
        CRON_SECRET: optionalString,
        GITHUB_MOCK: z.preprocess(
            blankToUndefined,
            z
                .enum(["1", "true", "0", "false"])
                .default("0")
                .transform((flag) => flag === "1" || flag === "true")
        ),
        WP_API_KEY: optionalString
    })
    .superRefine((value, ctx) => {
        // Fixtures must never ship: a real production deploy cannot run mocked.
        if (value.GITHUB_MOCK && process.env.VERCEL_ENV === "production") {
            ctx.addIssue({
                code: "custom",
                path: ["GITHUB_MOCK"],
                message: "GITHUB_MOCK cannot be enabled in a production deploy"
            });
        }

        if (
            process.env.NODE_ENV === "production" &&
            !value.GITHUB_TOKEN &&
            !value.GITHUB_MOCK
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["GITHUB_TOKEN"],
                message: "GITHUB_TOKEN is required in production"
            });
        }
    });

const parsed = schema.safeParse({
    GITHUB_LOGIN: process.env.GITHUB_LOGIN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_CONTENT_REPO: process.env.GITHUB_CONTENT_REPO,
    GITHUB_SYSTEM_OWNERS: process.env.GITHUB_SYSTEM_OWNERS,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    GITHUB_MOCK: process.env.GITHUB_MOCK,
    WP_API_KEY: process.env.WP_API_KEY
});

if (!parsed.success) {
    throw new Error(
        `Invalid environment variables:\n${z.prettifyError(parsed.error)}`
    );
}

export const env = {
    ...parsed.data,
    // With no owners listed, systems are searched under the site owner only.
    GITHUB_SYSTEM_OWNERS: parsed.data.GITHUB_SYSTEM_OWNERS.length
        ? parsed.data.GITHUB_SYSTEM_OWNERS
        : [parsed.data.GITHUB_LOGIN]
};

export type Env = typeof env;
