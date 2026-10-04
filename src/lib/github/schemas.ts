import { z } from "zod";

// Schemas for the files written on GitHub (ARCHITECTURE.md §3.3), and the
// domain types the UI consumes. No secrets here, so this module is safe to
// import types from anywhere.

/** A key left as "" in a JSON file means "not set". */
const optionalText = z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().optional()
);

const text = z.string().trim().min(1);

export const SystemStatusSchema = z.enum([
    "production",
    "building",
    "active",
    "experiment",
    "maintenance"
]);

export const DiagramSchema = z.object({
    nodes: z.array(
        z.object({
            id: text,
            label: text,
            group: optionalText,
            /** Shown when the node is inspected on the architecture tab. */
            detail: optionalText
        })
    ),
    edges: z.array(z.object({ from: text, to: text }))
});

export const SystemMetaSchema = z.object({
    /** Defaults to the repo name, kebab-cased. */
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a kebab-case slug")
        .optional(),
    name: optionalText,
    /** e.g. "WordPress Product", "AI QA Framework". */
    kind: text,
    role: z.array(text).optional(),
    /** One line: what this system demonstrates. */
    proves: optionalText,
    /** "owner/name" — required in content-repo files. */
    repo: z
        .string()
        .trim()
        .regex(/^[^/\s]+\/[^/\s]+$/, 'Expected "owner/name"')
        .optional(),
    /** Featured order on the home page. */
    order: z.number().optional(),
    /** Overrides the derived status. */
    status: SystemStatusSchema.optional()
});

/**
 * What a single system.json may contain. `kind` is only required of the
 * merged result's author, not of each file: the repo file and the content-repo
 * file fill each other's gaps, and a tagged repo with no file at all is still
 * a system (its `kind` is then simply not shown).
 */
export const SystemMetaFileSchema = SystemMetaSchema.partial();

// YAML turns an unquoted 2024-05-01 into a Date; accept both.
const dateText = z
    .union([z.string().trim().min(1), z.date()])
    .transform((value) =>
        value instanceof Date ? value.toISOString().slice(0, 10) : value
    );

export const ProblemFrontmatterSchema = z.object({
    number: z.number().int().nonnegative(),
    title: text,
    summary: text,
    role: z.array(text).optional(),
    tradeoffs: z.array(text).optional(),
    result: z.array(text).optional(),
    constraints: z.array(text).optional(),
    relatedPRs: z.array(z.number().int().positive()).optional(),
    /** Ids of architecture nodes this problem is about; links it from those nodes. */
    nodes: z.array(text).optional(),
    date: dateText.optional(),
    diagrams: z
        .object({
            before: DiagramSchema.optional(),
            after: DiagramSchema.optional()
        })
        .optional()
});

export const WorkflowSchema = z.object({
    steps: z.array(
        z.object({
            title: text,
            subtitle: text,
            detail: text,
            /** Id of the diagram node this step highlights. */
            node: optionalText
        })
    ),
    nodes: DiagramSchema.shape.nodes,
    edges: DiagramSchema.shape.edges
});

/** An IANA time zone the runtime knows, e.g. "Asia/Kathmandu". */
const timeZone = z
    .string()
    .trim()
    .refine((value) => {
        try {
            new Intl.DateTimeFormat("en", { timeZone: value });
            return true;
        } catch {
            return false;
        }
    }, "Expected an IANA time zone such as Asia/Kathmandu");

export const ProfileSchema = z.object({
    name: text,
    headline: text,
    intro: text,
    location: z.object({
        label: text,
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        /** Optional. Enables the local-time clock; without it the clock is hidden. */
        timezone: z.preprocess(
            (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
            timeZone.optional()
        )
    }),
    links: z.object({
        github: text,
        linkedin: optionalText,
        x: optionalText,
        email: optionalText
    }),
    howIWork: z.array(text),
    /** Shown only if present — GitHub cannot know it. */
    leadership: z
        .object({
            developersLed: z.number().int().positive().optional(),
            since: optionalText
        })
        .optional()
});

/** Optional narrative for a year; the numbers always come from GitHub. */
export const TimelineYearFrontmatterSchema = z.object({
    title: optionalText,
    summary: optionalText
});

export type SystemStatus = z.infer<typeof SystemStatusSchema>;
export type Diagram = z.infer<typeof DiagramSchema>;
export type DiagramNodeData = Diagram["nodes"][number];
export type DiagramEdgeData = Diagram["edges"][number];
export type SystemMeta = z.infer<typeof SystemMetaSchema>;
export type SystemMetaFile = z.infer<typeof SystemMetaFileSchema>;
export type ProblemFrontmatter = z.infer<typeof ProblemFrontmatterSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type TimelineYearFrontmatter = z.infer<typeof TimelineYearFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Domain types returned by src/lib/github/index.ts.
//
// Everything is JSON-serializable (dates are ISO strings) because results are
// stored by unstable_cache. `null` means "GitHub could not tell us": the UI
// hides that element instead of showing a placeholder.
// ---------------------------------------------------------------------------

/**
 * The site owner. Comes from portfolio/profile.json; without that file it is
 * built from the GitHub user and most narrative fields are null.
 */
export type ProfileData = {
    name: string;
    headline: string | null;
    intro: string | null;
    location: {
        label: string;
        lat: number | null;
        lng: number | null;
        timezone: string | null;
    } | null;
    links: {
        github: string;
        linkedin: string | null;
        x: string | null;
        email: string | null;
        website: string | null;
    };
    howIWork: string[];
    leadership: { developersLed: number | null; since: string | null } | null;
    avatarUrl: string | null;
    /** Which source the narrative fields came from. */
    source: "content" | "github";
};

export type Release = {
    tag: string;
    name: string | null;
    publishedAt: string;
    /** null for private repos. */
    url: string | null;
    isPrerelease: boolean;
};

export type System = {
    slug: string;
    name: string;
    /** "owner/name". */
    repo: string;
    description: string | null;
    /** Repo URL; null when the repo is private. */
    url: string | null;
    homepageUrl: string | null;
    isPrivate: boolean;
    kind: string | null;
    role: string[];
    proves: string | null;
    order: number | null;
    status: SystemStatus;
    /** Top languages + topics, for tags. */
    stack: string[];
    /** Languages by share of bytes (0–1), largest first. */
    languages: { name: string; share: number }[];
    topics: string[];
    stars: number;
    pushedAt: string;
    createdAt: string;
    latestRelease: Release | null;
    problemCount: number;
    hasArchitecture: boolean;
    hasWorkflow: boolean;
};

export type Heading = { id: string; text: string; depth: number };

export type Problem = ProblemFrontmatter & {
    slug: string;
    systemSlug: string;
    /** Sanitized HTML of the markdown body. */
    html: string;
    headings: Heading[];
};

/** A merged PR cited by a case study's `relatedPRs`. */
export type ProblemEvidence = {
    number: number;
    title: string;
    additions: number;
    deletions: number;
    mergedAt: string;
    /** null for private repos. */
    url: string | null;
    /** The PR's number in the engineering log, when it is listed there. */
    logNumber: number | null;
};

/** A problem without its body, for lists. */
export type ProblemSummary = Omit<Problem, "html" | "headings" | "diagrams">;

/** A section lifted from the repo's README, rendered to sanitized HTML. */
export type SystemNote = { title: string; html: string };

export type SystemDetail = System & {
    releases: Release[];
    /** README sections with the headings listed in content.ts; empty if none exist. */
    notes: SystemNote[];
    architecture: Diagram | null;
    workflow: Workflow | null;
    problems: ProblemSummary[];
};

export type LogEntry = {
    /** Stable id: "pr:owner/name#12" or "release:owner/name@v1.2.0". */
    id: string;
    type: "pr" | "release";
    /** Log number (#N by merge order across all repos). PRs only. */
    number: number | null;
    title: string;
    summary: string | null;
    /** mergedAt for PRs, publishedAt for releases. */
    date: string;
    /** null for private repos. */
    url: string | null;
    repo: string;
    systemSlug: string;
    /** The entry's tag: the system (or experiment) name. */
    systemName: string;
    pinned: boolean;
    pr: { number: number; additions: number; deletions: number; changedFiles: number } | null;
    releaseTag: string | null;
    /**
     * The start of the PR description as sanitized HTML. `truncated` means the
     * description continues on GitHub. null when there is no description.
     */
    body: { html: string; truncated: boolean } | null;
    /** Case studies whose relatedPRs cite this PR. */
    problems: { slug: string; title: string }[];
};

export type TimelineYear = {
    year: number;
    totalContributions: number;
    commits: number;
    pullRequests: number;
    reviews: number;
    reposContributedTo: number;
    reposCreated: number;
    /** Releases published that year in System and Lab repos. */
    releasesShipped: number;
    topLanguages: string[];
    /** From timeline/<year>.md, else the repo with most commits, else null. */
    title: string | null;
    summary: string | null;
    /** Sanitized HTML of timeline/<year>.md, if it exists. */
    html: string | null;
};

export type NowState = {
    /** System or experiment with most commits by the owner in the last 14 days. */
    building: { slug: string; name: string; repo: string; commits: number } | null;
    learning: string[];
    exploring: string[];
    asOf: string;
};

export type ActivityItem = {
    type: "push" | "pr" | "release";
    repo: string;
    url: string;
    at: string;
    /** Commit message, PR title or release name — null if GitHub omits it. */
    message: string | null;
    /** Events of this kind folded into the item. */
    count: number;
};

export type Experiment = {
    slug: string;
    name: string;
    repo: string;
    description: string | null;
    url: string | null;
    homepageUrl: string | null;
    isPrivate: boolean;
    stack: string[];
    stars: number;
    pushedAt: string;
    createdAt: string;
};

export type ToolUsage = {
    name: string;
    kind: "language" | "topic";
    systems: { slug: string; name: string }[];
};

export type Stats = {
    /** Current year − first year with contributions. */
    yearsOfEngineering: number | null;
    firstYear: number | null;
    /** Number of systems. */
    products: number;
    /** From profile.leadership only. */
    developersLed: number | null;
    /** Merged PRs authored by the owner in System repos. */
    prsMerged: number | null;
};
