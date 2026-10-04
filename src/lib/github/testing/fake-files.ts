import type { FileObject } from "../queries";

/**
 * Answers a git expression ("HEAD:path") from an in-memory file map keyed
 * "owner/name:path". A path that is a prefix of other keys is a folder.
 * Shared by the tests and the demo fixture generator.
 */
export function resolveFile(
    files: Record<string, string>,
    repo: string,
    expression: string
): FileObject | null {
    const path = expression.replace(/^HEAD:/, "");
    const key = `${repo}:${path}`;

    if (key in files) return { __typename: "Blob", text: files[key], isBinary: false };

    const prefix = `${key}/`;
    // name → file text, or null for a sub-folder
    const children = new Map<string, string | null>();
    for (const [name, text] of Object.entries(files)) {
        if (!name.startsWith(prefix)) continue;
        const [first, ...rest] = name.slice(prefix.length).split("/");
        if (!children.has(first)) children.set(first, rest.length === 0 ? text : null);
    }
    if (children.size === 0) return null;

    return {
        __typename: "Tree",
        entries: [...children].map(([name, text]) => ({
            name,
            type: text === null ? "tree" : "blob",
            object: text === null ? null : { text, isBinary: false }
        }))
    };
}

/** The `repository` part of a RepoFiles response; null if the repo has no files at all. */
export function resolveRepoFiles(
    files: Record<string, string>,
    variables: Record<string, unknown>,
    knownRepos: string[] = []
) {
    const repo = `${variables.owner}/${variables.name}`;
    const exists =
        knownRepos.includes(repo) || Object.keys(files).some((key) => key.startsWith(`${repo}:`));
    if (!exists) return null;

    return Object.fromEntries(
        Object.entries(variables)
            .filter(([key]) => /^e\d+$/.test(key))
            .map(([key, expression]) => [
                key.replace("e", "f"),
                resolveFile(files, repo, String(expression))
            ])
    );
}
