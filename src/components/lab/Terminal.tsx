"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { runCommand, type TerminalData, type TerminalLine } from "./commands";

const QUICK = ["help", "projects", "experiments", "log", "now", "stack", "contact", "theme", "clear"];

type Entry = { id: number; command: string | null; lines: TerminalLine[] };

const WELCOME: Entry = {
    id: 0,
    command: null,
    lines: [{ text: "Type a command, or pick one below.", note: "help lists them all" }]
};

// The terminal is dark in both themes, so focus rings use its own ink.
const focus = "focus-visible:outline-term-ink";

function Line({ line }: { line: TerminalLine }) {
    const external = line.href && !line.href.startsWith("/");
    const linkClass = `underline underline-offset-4 ${focus}`;

    return (
        <p className="break-words whitespace-pre-wrap">
            {!line.href ? (
                line.text
            ) : external ? (
                <a href={line.href} target="_blank" rel="noreferrer" className={linkClass}>
                    {line.text}
                </a>
            ) : (
                <Link href={line.href} className={linkClass}>
                    {line.text}
                </Link>
            )}
            {line.note && <span className="text-term-mute"> {line.note}</span>}
        </p>
    );
}

type TerminalProps = {
    /** Shown in the title bar as "~/<name>". */
    name: string;
    data: TerminalData;
};

/**
 * A small terminal over the portfolio's data. Commands are resolved in
 * commands.ts from `data`, which the server fetched from GitHub.
 */
export function Terminal({ name, data }: TerminalProps) {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const headingId = useId();
    const inputId = useId();

    const [entries, setEntries] = useState<Entry[]>([WELCOME]);
    const [value, setValue] = useState("");
    // Commands already run, oldest first; `cursor` is where ↑/↓ are in it
    // (history.length = the line being typed).
    const [history, setHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(0);
    const nextId = useRef(1);
    const output = useRef<HTMLDivElement>(null);

    // Keep the newest output in view. Only the output pane scrolls.
    useEffect(() => {
        const pane = output.current;
        if (pane) pane.scrollTop = pane.scrollHeight;
    }, [entries]);

    const run = (input: string) => {
        const command = input.trim();
        const result = runCommand(command, data);
        const lines = [...result.lines];

        if (result.effect?.type === "theme") {
            const next = resolvedTheme === "dark" ? "light" : "dark";
            setTheme(next);
            lines.push({ text: `theme: ${next}` });
        }
        if (result.effect?.type === "navigate") router.push(result.effect.href);

        if (result.effect?.type === "clear") setEntries([]);
        else setEntries((current) => [...current, { id: nextId.current++, command, lines }]);

        if (command) {
            const updated = [...history, command];
            setHistory(updated);
            setCursor(updated.length);
        }
        setValue("");
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        run(value);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const next = Math.max(0, Math.min(history.length, cursor + (event.key === "ArrowUp" ? -1 : 1)));
        setCursor(next);
        setValue(history[next] ?? "");
    };

    return (
        <section
            aria-labelledby={headingId}
            className="bg-term text-term-ink border-line-2 overflow-hidden rounded-xl border font-mono text-sm"
        >
            <div className="border-term-ink/15 flex items-center gap-3 border-b px-4 py-3">
                <span aria-hidden="true" className="flex gap-1.5">
                    <span className="bg-term-ink/25 size-2.5 rounded-full" />
                    <span className="bg-term-ink/25 size-2.5 rounded-full" />
                    <span className="bg-term-ink/25 size-2.5 rounded-full" />
                </span>
                <h2 id={headingId} className="text-term-mute text-xs">
                    ~/{name} — try a command
                </h2>
            </div>

            <div
                ref={output}
                role="log"
                aria-live="polite"
                aria-label="Terminal output"
                tabIndex={0}
                className={`h-72 space-y-3 overflow-y-auto px-4 py-4 leading-6 focus-visible:-outline-offset-2 ${focus}`}
            >
                {entries.map((entry) => (
                    <div key={entry.id}>
                        {entry.command !== null && (
                            <p className="break-words">
                                <span aria-hidden="true" className="text-acc">
                                    ${" "}
                                </span>
                                <span className="sr-only">Command: </span>
                                {entry.command}
                            </p>
                        )}
                        {entry.lines.map((line, index) => (
                            <Line key={index} line={line} />
                        ))}
                    </div>
                ))}
            </div>

            <form
                onSubmit={onSubmit}
                className="border-term-ink/15 focus-within:bg-term-ink/5 flex items-center gap-2 border-t px-4 focus-within:shadow-[inset_2px_0_0_var(--acc)]"
            >
                <span aria-hidden="true" className="text-acc">
                    $
                </span>
                <label htmlFor={inputId} className="sr-only">
                    Command
                </label>
                <input
                    id={inputId}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="help"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    // 16px on phones: anything smaller makes iOS zoom the page on focus.
                    // The form shows the focus (an accent bar), so the field itself has no ring.
                    className="placeholder:text-term-mute h-12 min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm"
                />
            </form>

            <ul aria-label="Quick commands" className="border-term-ink/15 flex flex-wrap gap-2 border-t p-4">
                {QUICK.map((command) => (
                    <li key={command}>
                        <button
                            type="button"
                            onClick={() => run(command)}
                            className={`border-term-ink/25 text-term-ink hover:border-term-ink/60 min-h-11 cursor-pointer rounded-lg border px-3 transition-colors ${focus}`}
                        >
                            {command}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
