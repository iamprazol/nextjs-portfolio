"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";

import { useUrlState } from "@/components/shell/url-state";
import { MonoLabel, Panel } from "@/components/ui";
import { DiagramTree } from "@/components/ui/diagram";
import { layoutDiagram } from "@/components/ui/diagram/layout";
import type { Diagram, ProblemSummary } from "@/lib/github";

type ArchitectureExplorerProps = {
    diagram: Diagram;
    systemSlug: string;
    systemName: string;
    problems: Pick<ProblemSummary, "slug" | "number" | "title" | "nodes">[];
};

/**
 * The architecture diagram with selectable nodes. Selecting one shows its
 * detail and the case studies that name it. The selection lives in ?node=.
 * Arrow keys move focus between nodes; Enter or Space selects.
 */
export function ArchitectureExplorer({
    diagram,
    systemSlug,
    systemName,
    problems
}: ArchitectureExplorerProps) {
    const url = useUrlState();
    const container = useRef<HTMLDivElement>(null);

    const selected = diagram.nodes.find((node) => node.id === url.get("node")) ?? null;
    const related = selected
        ? problems.filter((problem) => problem.nodes?.includes(selected.id))
        : [];

    const onKeyDown = (event: KeyboardEvent) => {
        const id = (event.target as HTMLElement).closest<HTMLElement>("[data-node-id]")?.dataset
            .nodeId;
        if (!id) return;

        const { rows } = layoutDiagram(diagram);
        const row = rows.findIndex((cells) => cells.some((cell) => cell.node.id === id));
        const column = rows[row].findIndex((cell) => cell.node.id === id);

        const target = {
            ArrowLeft: rows[row][column - 1],
            ArrowRight: rows[row][column + 1],
            // Moving between rows keeps the column where the next row is long enough.
            ArrowUp: rows[row - 1]?.[Math.min(column, rows[row - 1].length - 1)],
            ArrowDown: rows[row + 1]?.[Math.min(column, rows[row + 1].length - 1)]
        }[event.key];

        if (!target) return;
        event.preventDefault();
        container.current
            ?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(target.node.id)}"]`)
            ?.focus();
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <Panel className="min-w-0">
                <div ref={container} onKeyDown={onKeyDown}>
                    <DiagramTree
                        diagram={diagram}
                        label={`Architecture of ${systemName}. Use the arrow keys to move between nodes.`}
                        selectedId={selected?.id}
                        onSelect={(id) => url.set({ node: id === selected?.id ? null : id })}
                    />
                </div>
            </Panel>

            <div aria-live="polite">
                {selected ? (
                    <section
                        aria-labelledby="inspecting"
                        className="border-acc-line bg-acc-soft rounded-xl border p-5"
                    >
                        <MonoLabel as="h2" id="inspecting" className="text-acc-ink">
                            Inspecting · {selected.label}
                        </MonoLabel>
                        {selected.detail && <p className="mt-3 text-[15px]">{selected.detail}</p>}

                        {related.length > 0 && (
                            <>
                                <MonoLabel as="h3" className="text-acc-ink mt-5 block">
                                    Engineering problems
                                </MonoLabel>
                                <ul className="mt-1">
                                    {related.map((problem) => (
                                        <li key={problem.slug}>
                                            <Link
                                                href={`/systems/${systemSlug}/problems/${problem.slug}`}
                                                className="text-link inline-flex min-h-11 items-center gap-1.5 text-sm hover:underline"
                                            >
                                                {problem.title}
                                                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {!selected.detail && related.length === 0 && (
                            <p className="text-ink-2 mt-3 text-sm">No notes for this node yet.</p>
                        )}
                    </section>
                ) : (
                    <p className="border-line-2 text-ink-2 rounded-xl border border-dashed p-5 text-sm">
                        Select a node to inspect it.
                    </p>
                )}
            </div>
        </div>
    );
}
