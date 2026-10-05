import type { ToolUsage } from "./schemas";

// Which group a language or topic belongs to on the About page. This is a
// classification table, not content: the tools themselves, and the systems
// they are linked to, still come from GitHub (deriveToolUsage).

export const TOOL_GROUPS = ["Backend", "Frontend", "Engineering", "AI / Automation"] as const;

export type ToolGroupName = (typeof TOOL_GROUPS)[number];

export type ToolGroup = { name: ToolGroupName; tools: ToolUsage[] };

const MEMBERS: Record<ToolGroupName, string[]> = {
    Backend: [
        "php", "python", "go", "rust", "java", "kotlin", "ruby", "c", "c++", "c#", "elixir",
        "sql", "plpgsql", "tsql", "node", "nodejs", "express", "django", "laravel", "rails",
        "wordpress", "wordpress-plugin", "woocommerce", "mysql", "mariadb", "postgres",
        "postgresql", "sqlite", "redis", "database", "api", "rest-api", "graphql"
    ],
    Frontend: [
        "javascript", "typescript", "html", "css", "scss", "sass", "less", "mdx", "vue",
        "svelte", "astro", "react", "nextjs", "next-js", "gutenberg", "tailwind", "tailwindcss"
    ],
    Engineering: [
        "shell", "powershell", "dockerfile", "makefile", "hcl", "nix", "docker", "kubernetes",
        "terraform", "devops", "ci", "ci-cd", "github-actions", "testing", "e2e", "playwright",
        "phpunit", "jest", "vitest", "cli", "developer-tools", "documentation", "performance",
        "architecture"
    ],
    "AI / Automation": [
        "ai", "llm", "agents", "ml", "machine-learning", "openai", "anthropic", "claude",
        "embeddings", "rag", "mcp", "automation", "prompt-engineering", "jupyter notebook"
    ]
};

const GROUP_OF = new Map(
    TOOL_GROUPS.flatMap((group) => MEMBERS[group].map((name) => [name, group] as const))
);

/** A language the table does not know is still a tool: it is filed here. */
const UNKNOWN_LANGUAGE: ToolGroupName = "Engineering";

/**
 * Tools sorted into the fixed groups, keeping their order (most systems
 * first). A topic the table does not know is left out — topics also name
 * domains ("membership", "forms"), which are not tools. Empty groups are
 * dropped.
 */
export function groupTools(tools: ToolUsage[]): ToolGroup[] {
    const groups = new Map<ToolGroupName, ToolUsage[]>(TOOL_GROUPS.map((name) => [name, []]));

    for (const tool of tools) {
        const group =
            GROUP_OF.get(tool.name.toLowerCase()) ??
            (tool.kind === "language" ? UNKNOWN_LANGUAGE : null);
        if (group) groups.get(group)!.push(tool);
    }

    return TOOL_GROUPS.map((name) => ({ name, tools: groups.get(name)! })).filter(
        (group) => group.tools.length > 0
    );
}
