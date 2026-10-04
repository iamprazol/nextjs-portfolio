import "server-only";

import matter from "gray-matter";
import { cache } from "react";
import { z } from "zod";

import { gql } from "./client";
import { getConfig } from "./config";
import { renderMarkdown } from "./markdown";
import { repoFilesQuery, type FileObject, type RepoFilesResponse } from "./queries";
import {
    DiagramSchema,
    ProblemFrontmatterSchema,
    ProfileSchema,
    SystemMetaFileSchema,
    TimelineYearFrontmatterSchema,
    WorkflowSchema,
    type Diagram,
    type Problem,
    type ProfileData,
    type SystemMetaFile,
    type TimelineYearFrontmatter,
    type Workflow
} from "./schemas";
import { toSlug } from "./slug";
import { fetchUser } from "./sources";

// Narrative content written on GitHub: `.portfolio/` inside a system's repo and
// `portfolio/` in the content repo. A file that is missing is fine; a file that
// is invalid is logged and skipped. Neither ever throws.

type RepoRef = { owner: string; name: string };

type FileEntry = { name: string; isFile: boolean; text: string | null };
type FileNode =
    | { kind: "file"; text: string }
    | { kind: "folder"; entries: FileEntry[] }
    | null;

const refOf = (nameWithOwner: string): RepoRef => {
    const [owner, name] = nameWithOwner.split("/");
    return { owner, name };
};
const nameOf = (repo: RepoRef) => `${repo.owner}/${repo.name}`;

function toFileNode(object: FileObject | null | undefined): FileNode {
    if (!object) return null;
    if (object.__typename === "Blob" && "text" in object) {
        return object.text == null || object.isBinary ? null : { kind: "file", text: object.text };
    }
    if (object.__typename === "Tree" && "entries" in object) {
        return {
            kind: "folder",
            entries: object.entries.map((entry) => ({
                name: entry.name,
                isFile: entry.type === "blob",
                text: entry.object?.isBinary ? null : (entry.object?.text ?? null)
            }))
        };
    }
    return null;
}

/** Reads several paths from one repo in a single request. Missing paths are null. */
async function readPaths(repo: RepoRef, paths: string[]): Promise<FileNode[]> {
    const variables = Object.fromEntries(paths.map((path, i) => [`e${i}`, `HEAD:${path}`]));
    const { repository } = await gql<RepoFilesResponse>(repoFilesQuery(paths.length), {
        owner: repo.owner,
        name: repo.name,
        ...variables
    });
    return paths.map((_, i) => toFileNode(repository?.[`f${i}`]));
}

function warnInvalid(source: string, reason: string) {
    console.warn(`[github] skipped invalid file ${source}: ${reason}`);
}

function parseJson<T>(schema: z.ZodType<T>, node: FileNode, source: string): T | null {
    if (node?.kind !== "file") return null;

    let raw: unknown;
    try {
        raw = JSON.parse(node.text);
    } catch (error) {
        warnInvalid(source, `not valid JSON (${(error as Error).message})`);
        return null;
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        warnInvalid(source, z.prettifyError(parsed.error));
        return null;
    }
    return parsed.data;
}

function parseFrontmatter<T>(schema: z.ZodType<T>, text: string, source: string) {
    let file: matter.GrayMatterFile<string>;
    try {
        file = matter(text);
    } catch (error) {
        warnInvalid(source, `frontmatter is not valid YAML (${(error as Error).message})`);
        return null;
    }

    const parsed = schema.safeParse(file.data);
    if (!parsed.success) {
        warnInvalid(source, z.prettifyError(parsed.error));
        return null;
    }
    return { data: parsed.data, body: file.content };
}

const markdownFiles = (node: FileNode) =>
    node?.kind === "folder"
        ? node.entries.filter(
              (entry): entry is FileEntry & { text: string } =>
                  entry.isFile && entry.text !== null && /\.mdx?$/i.test(entry.name)
          )
        : [];

// ---------------------------------------------------------------------------
// Content repo index: profile, the list of system files, timeline notes
// ---------------------------------------------------------------------------

type ContentIndex = {
    profile: FileNode;
    /** portfolio/systems/<slug>.json, parsed. */
    systems: { slug: string; meta: SystemMetaFile }[];
    /** portfolio/timeline/<year>.md, raw. */
    timeline: Map<number, string>;
};

const loadContentIndex = cache(async (): Promise<ContentIndex> => {
    const { contentRepo } = getConfig();
    const [profile, systems, timeline] = await readPaths(contentRepo, [
        "portfolio/profile.json",
        "portfolio/systems",
        "portfolio/timeline"
    ]);

    const systemFiles =
        systems?.kind === "folder"
            ? systems.entries.filter((entry) => entry.isFile && entry.name.endsWith(".json"))
            : [];

    return {
        profile,
        systems: systemFiles.flatMap((entry) => {
            const source = `${nameOf(contentRepo)}:portfolio/systems/${entry.name}`;
            const meta = parseJson(
                SystemMetaFileSchema,
                entry.text === null ? null : { kind: "file", text: entry.text },
                source
            );
            return meta ? [{ slug: toSlug(entry.name.replace(/\.json$/, "")), meta }] : [];
        }),
        timeline: new Map(
            markdownFiles(timeline).flatMap((entry) => {
                const year = Number(/^(\d{4})\.mdx?$/i.exec(entry.name)?.[1]);
                return Number.isInteger(year) ? [[year, entry.text] as const] : [];
            })
        )
    };
});

/**
 * Systems declared in the content repo with a `repo` — the way to list a repo
 * you cannot add a topic or files to.
 */
export async function loadDeclaredSystemRepos(): Promise<string[]> {
    const { systems } = await loadContentIndex();
    return systems.flatMap(({ meta }) => (meta.repo ? [meta.repo] : []));
}

/**
 * portfolio/profile.json from the content repo. Without a valid file, a
 * minimal profile is built from the GitHub user: fields GitHub does not have
 * stay null, nothing is made up.
 */
export async function loadProfile(): Promise<ProfileData> {
    const { contentRepo } = getConfig();
    const [user, index] = await Promise.all([fetchUser(), loadContentIndex()]);
    const file = parseJson(
        ProfileSchema,
        index.profile,
        `${nameOf(contentRepo)}:portfolio/profile.json`
    );

    if (!file) {
        return {
            name: user.name ?? user.login,
            headline: user.bio,
            intro: null,
            location: user.location
                ? { label: user.location, lat: null, lng: null, timezone: null }
                : null,
            links: {
                github: user.url,
                linkedin: null,
                x: null,
                email: null,
                website: user.websiteUrl || null
            },
            howIWork: [],
            leadership: null,
            avatarUrl: user.avatarUrl,
            source: "github"
        };
    }

    return {
        name: file.name,
        headline: file.headline,
        intro: file.intro,
        location: { ...file.location, timezone: file.location.timezone ?? null },
        links: {
            github: file.links.github,
            linkedin: file.links.linkedin ?? null,
            x: file.links.x ?? null,
            email: file.links.email ?? null,
            website: user.websiteUrl || null
        },
        howIWork: file.howIWork,
        leadership: file.leadership
            ? {
                  developersLed: file.leadership.developersLed ?? null,
                  since: file.leadership.since ?? null
              }
            : null,
        avatarUrl: user.avatarUrl,
        source: "content"
    };
}

// ---------------------------------------------------------------------------
// Per-system content: one request to the system's repo, one to the content repo
// ---------------------------------------------------------------------------

const loadRepoFolder = cache(async (repo: string) => {
    const [system, architecture, workflow, problems] = await readPaths(refOf(repo), [
        ".portfolio/system.json",
        ".portfolio/architecture.json",
        ".portfolio/workflow.json",
        ".portfolio/problems"
    ]);
    return { system, architecture, workflow, problems };
});

const loadContentFolder = cache(async (contentSlug: string) => {
    const base = `portfolio/systems/${contentSlug}`;
    const [architecture, workflow, problems] = await readPaths(getConfig().contentRepo, [
        `${base}/architecture.json`,
        `${base}/workflow.json`,
        `${base}/problems`
    ]);
    return { architecture, workflow, problems };
});

export type ResolvedSystemMeta = SystemMetaFile & {
    slug: string;
    /** Folder name under portfolio/systems/ in the content repo. */
    contentSlug: string;
};

/**
 * `.portfolio/system.json` in the repo merged with `portfolio/systems/<slug>.json`
 * in the content repo. The repo file wins; the content file fills missing keys.
 */
export async function loadSystemMeta(repo: string): Promise<ResolvedSystemMeta> {
    const [folder, index] = await Promise.all([loadRepoFolder(repo), loadContentIndex()]);
    const fromRepo =
        parseJson(SystemMetaFileSchema, folder.system, `${repo}:.portfolio/system.json`) ?? {};

    const defaultSlug = toSlug(refOf(repo).name);
    const declared =
        index.systems.find((file) => file.meta.repo?.toLowerCase() === repo.toLowerCase()) ??
        index.systems.find((file) => !file.meta.repo && file.slug === defaultSlug);

    const defined = Object.fromEntries(
        Object.entries(fromRepo).filter(([, value]) => value !== undefined)
    );
    const merged: SystemMetaFile = { ...declared?.meta, ...defined };
    const slug = merged.slug ?? declared?.slug ?? defaultSlug;

    return { ...merged, slug, contentSlug: declared?.slug ?? slug };
}

async function parseProblem(
    file: { name: string; text: string },
    systemSlug: string,
    source: string
): Promise<Problem | null> {
    const parsed = parseFrontmatter(ProblemFrontmatterSchema, file.text, source);
    if (!parsed) return null;

    const { html, headings } = await renderMarkdown(parsed.body);
    return {
        ...parsed.data,
        slug: toSlug(file.name.replace(/\.mdx?$/i, "")),
        systemSlug,
        html,
        headings
    };
}

/**
 * Case studies from `.portfolio/problems/` in the repo and
 * `portfolio/systems/<slug>/problems/` in the content repo, ordered by `number`.
 * When both have the same file name, the repo's version is used.
 */
export async function loadProblems(repo: string, meta: ResolvedSystemMeta): Promise<Problem[]> {
    const { contentRepo } = getConfig();
    const [repoFolder, contentFolder] = await Promise.all([
        loadRepoFolder(repo),
        loadContentFolder(meta.contentSlug)
    ]);

    const sources = [
        { files: markdownFiles(repoFolder.problems), base: `${repo}:.portfolio/problems` },
        {
            files: markdownFiles(contentFolder.problems),
            base: `${nameOf(contentRepo)}:portfolio/systems/${meta.contentSlug}/problems`
        }
    ];

    const bySlug = new Map<string, Problem>();
    for (const { files, base } of sources) {
        const problems = await Promise.all(
            files.map((file) => parseProblem(file, meta.slug, `${base}/${file.name}`))
        );
        for (const problem of problems) {
            if (problem && !bySlug.has(problem.slug)) bySlug.set(problem.slug, problem);
        }
    }

    return [...bySlug.values()].sort(
        (a, b) => a.number - b.number || a.slug.localeCompare(b.slug)
    );
}

/** architecture.json: the repo's file, else the content repo's. */
export async function loadArchitecture(
    repo: string,
    meta: ResolvedSystemMeta
): Promise<Diagram | null> {
    const [repoFolder, contentFolder] = await Promise.all([
        loadRepoFolder(repo),
        loadContentFolder(meta.contentSlug)
    ]);
    return (
        parseJson(DiagramSchema, repoFolder.architecture, `${repo}:.portfolio/architecture.json`) ??
        parseJson(
            DiagramSchema,
            contentFolder.architecture,
            `${nameOf(getConfig().contentRepo)}:portfolio/systems/${meta.contentSlug}/architecture.json`
        )
    );
}

/** workflow.json: the repo's file, else the content repo's. */
export async function loadWorkflow(
    repo: string,
    meta: ResolvedSystemMeta
): Promise<Workflow | null> {
    const [repoFolder, contentFolder] = await Promise.all([
        loadRepoFolder(repo),
        loadContentFolder(meta.contentSlug)
    ]);
    return (
        parseJson(WorkflowSchema, repoFolder.workflow, `${repo}:.portfolio/workflow.json`) ??
        parseJson(
            WorkflowSchema,
            contentFolder.workflow,
            `${nameOf(getConfig().contentRepo)}:portfolio/systems/${meta.contentSlug}/workflow.json`
        )
    );
}

export type TimelineNote = TimelineYearFrontmatter & { html: string | null };

/** portfolio/timeline/<year>.md: optional title, summary and narrative for a year. */
export async function loadTimelineNote(year: number): Promise<TimelineNote | null> {
    const { contentRepo } = getConfig();
    const text = (await loadContentIndex()).timeline.get(year);
    if (text === undefined) return null;

    const parsed = parseFrontmatter(
        TimelineYearFrontmatterSchema,
        text,
        `${nameOf(contentRepo)}:portfolio/timeline/${year}.md`
    );
    if (!parsed) return null;

    const body = parsed.body.trim();
    return { ...parsed.data, html: body ? (await renderMarkdown(body)).html : null };
}
