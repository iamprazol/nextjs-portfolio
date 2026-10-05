import { describe, expect, it } from "vitest";

import { COMMANDS, runCommand, type TerminalData } from "./commands";

const data: TerminalData = {
    projects: [
        { slug: "atlas", name: "Atlas Membership", status: "production" },
        { slug: "relay-qa", name: "Relay QA", status: "building" }
    ],
    experiments: [
        { name: "tiny-shell", description: "A shell", href: "https://github.com/demo-dev/tiny-shell" },
        { name: "secret-lab", description: null, href: null }
    ],
    log: [{ label: "#24", title: "Retry once", systemName: "Relay QA", href: "/log/24" }],
    now: { building: "Relay QA", learning: ["Rust", "Python"], exploring: [] },
    stack: ["PHP", "TypeScript"],
    contact: [{ label: "github", value: "github.com/demo-dev", href: "https://github.com/demo-dev" }]
};
const empty: TerminalData = {
    projects: [],
    experiments: [],
    log: [],
    now: { building: null, learning: [], exploring: [] },
    stack: [],
    contact: []
};

describe("runCommand", () => {
    it("lists every command in help", () => {
        expect(runCommand("help", data).lines.map((line) => line.text)).toEqual(COMMANDS.map((command) => command.name));
    });

    it("prints projects with their status, linked to their pages", () => {
        expect(runCommand("projects", data).lines).toEqual([
            { text: "atlas", href: "/systems/atlas", note: "Atlas Membership · Production" },
            { text: "relay-qa", href: "/systems/relay-qa", note: "Relay QA · Building" }
        ]);
    });

    it("prints experiments, log, stack and contact from the data", () => {
        expect(runCommand("experiments", data).lines).toEqual([
            { text: "tiny-shell", href: "https://github.com/demo-dev/tiny-shell", note: "A shell" },
            { text: "secret-lab", href: undefined, note: undefined }
        ]);
        expect(runCommand("log", data).lines).toEqual([{ text: "#24 Retry once", href: "/log/24", note: "Relay QA" }]);
        expect(runCommand("stack", data).lines).toEqual([{ text: "PHP · TypeScript" }]);
        expect(runCommand("contact", data).lines).toEqual([
            { text: "github.com/demo-dev", href: "https://github.com/demo-dev", note: "github" }
        ]);
    });

    it("leaves out the parts of now that GitHub cannot provide", () => {
        expect(runCommand("now", data).lines.map((line) => [line.text.trim(), line.note])).toEqual([
            ["building", "Relay QA"],
            ["learning", "Rust, Python"]
        ]);
        expect(runCommand("now", empty).lines).toEqual([{ text: "nothing to report right now" }]);
    });

    it("says so when there is nothing to list", () => {
        for (const [command, what] of [["projects", "systems"], ["experiments", "experiments"], ["log", "log entries"], ["stack", "languages"]]) {
            expect(runCommand(command, empty).lines).toEqual([{ text: `no ${what} yet` }]);
        }
    });

    it("opens a system by slug or name, whatever the case", () => {
        const effect = { type: "navigate", href: "/systems/relay-qa" };
        expect(runCommand("open relay-qa", data).effect).toEqual(effect);
        expect(runCommand("  OPEN   Relay QA ", data).effect).toEqual(effect);
        expect(runCommand("open nope", data)).toEqual({ lines: [{ text: "open: no system named nope — try projects" }] });
        expect(runCommand("open", data).effect).toBeUndefined();
    });

    it("returns effects for theme and clear, and nothing for an empty line", () => {
        expect(runCommand("theme", data)).toEqual({ lines: [], effect: { type: "theme" } });
        expect(runCommand("clear", data)).toEqual({ lines: [], effect: { type: "clear" } });
        expect(runCommand("   ", data)).toEqual({ lines: [] });
    });

    it("reports an unknown command", () => {
        expect(runCommand("sudo rm -rf", data).lines).toEqual([{ text: "command not found: sudo — try help" }]);
    });
});
