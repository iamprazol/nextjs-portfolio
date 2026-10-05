import { statusLabel, type SystemStatus } from "@/components/ui/status";

// What the terminal's commands print. Everything here is plain data in, lines
// out: the Terminal component draws the lines and carries out the effect.

export type TerminalData = {
    projects: { slug: string; name: string; status: SystemStatus }[];
    experiments: { name: string; description: string | null; href: string | null }[];
    /** The latest log entries, newest first. `label` is "#24" or a release tag. */
    log: { label: string; title: string; systemName: string; href: string }[];
    now: { building: string | null; learning: string[]; exploring: string[] };
    /** Top languages across systems. */
    stack: string[];
    contact: { label: string; value: string; href: string }[];
};

export type TerminalLine = {
    text: string;
    /** Makes `text` a link. */
    href?: string;
    /** Dimmed text after `text`. */
    note?: string;
};

export type TerminalEffect =
    | { type: "clear" }
    | { type: "theme" }
    | { type: "navigate"; href: string };

export type TerminalResult = { lines: TerminalLine[]; effect?: TerminalEffect };

export const COMMANDS: { name: string; description: string }[] = [
    { name: "projects", description: "systems and their status" },
    { name: "experiments", description: "what is in the lab" },
    { name: "log", description: "the last 5 log entries" },
    { name: "now", description: "currently building, learning, exploring" },
    { name: "stack", description: "top languages" },
    { name: "contact", description: "where to reach me" },
    { name: "open <system>", description: "go to a system's page" },
    { name: "theme", description: "switch light / dark" },
    { name: "clear", description: "clear the screen" },
    { name: "help", description: "this list" }
];

const none = (what: string): TerminalLine[] => [{ text: `no ${what} yet` }];

function open(target: string, data: TerminalData): TerminalResult {
    if (!target) return { lines: [{ text: "usage: open <system>", note: "try projects" }] };

    const wanted = target.toLowerCase();
    const system = data.projects.find(
        (project) => project.slug === wanted || project.name.toLowerCase() === wanted
    );
    if (!system) return { lines: [{ text: `open: no system named ${target} — try projects` }] };

    return {
        lines: [{ text: `opening ${system.name}…` }],
        effect: { type: "navigate", href: `/systems/${system.slug}` }
    };
}

/** Resolves one line of input. An empty line prints nothing. */
export function runCommand(input: string, data: TerminalData): TerminalResult {
    const [name = "", ...rest] = input.trim().split(/\s+/);
    const argument = rest.join(" ");

    switch (name.toLowerCase()) {
        case "":
            return { lines: [] };
        case "help":
            return {
                lines: COMMANDS.map((command) => ({
                    text: command.name,
                    note: command.description
                }))
            };
        case "projects":
            return {
                lines:
                    data.projects.length > 0
                        ? data.projects.map((project) => ({
                              text: project.slug,
                              href: `/systems/${project.slug}`,
                              note: `${project.name} · ${statusLabel[project.status]}`
                          }))
                        : none("systems")
            };
        case "experiments":
            return {
                lines:
                    data.experiments.length > 0
                        ? data.experiments.map((experiment) => ({
                              text: experiment.name,
                              href: experiment.href ?? undefined,
                              note: experiment.description ?? undefined
                          }))
                        : none("experiments")
            };
        case "log":
            return {
                lines:
                    data.log.length > 0
                        ? data.log.map((entry) => ({
                              text: `${entry.label} ${entry.title}`,
                              href: entry.href,
                              note: entry.systemName
                          }))
                        : none("log entries")
            };
        case "now": {
            const rows: [string, string | null][] = [
                ["building", data.now.building],
                ["learning", data.now.learning.join(", ") || null],
                ["exploring", data.now.exploring.join(", ") || null]
            ];
            const lines = rows.flatMap(([label, value]) =>
                value ? [{ text: label.padEnd(10), note: value }] : []
            );
            return { lines: lines.length > 0 ? lines : [{ text: "nothing to report right now" }] };
        }
        case "stack":
            return {
                lines: data.stack.length > 0 ? [{ text: data.stack.join(" · ") }] : none("languages")
            };
        case "contact":
            return {
                lines: data.contact.map((item) => ({
                    text: item.value,
                    href: item.href,
                    note: item.label
                }))
            };
        case "theme":
            return { lines: [], effect: { type: "theme" } };
        case "clear":
            return { lines: [], effect: { type: "clear" } };
        case "open":
            return open(argument, data);
        default:
            return { lines: [{ text: `command not found: ${name} — try help` }] };
    }
}
