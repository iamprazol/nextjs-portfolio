"use client";

import { useState } from "react";

import { MonoLabel, Panel } from "@/components/ui";
import { DiagramFlow } from "@/components/ui/diagram";
import { cn } from "@/lib/cn";
import type { SystemNote, Workflow } from "@/lib/github";

type WorkflowViewProps = {
    workflow: Workflow;
    systemName: string;
    /** README sections ("Why I built it", …); the column is omitted when empty. */
    notes: SystemNote[];
};

/**
 * Step list · flow diagram · notes. Selecting a step shows its detail and
 * highlights the diagram node it maps to.
 */
export function WorkflowView({ workflow, systemName, notes }: WorkflowViewProps) {
    const [selected, setSelected] = useState(0);
    const step = workflow.steps[selected];

    return (
        <div
            className={cn(
                "grid items-start gap-6",
                notes.length > 0
                    ? "lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,22rem)]"
                    : "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
            )}
        >
            <section aria-labelledby="workflow-steps">
                <MonoLabel as="h2" id="workflow-steps">
                    Steps
                </MonoLabel>
                <ol className="mt-4 space-y-2">
                    {workflow.steps.map((item, index) => {
                        const active = index === selected;
                        return (
                            <li key={item.title}>
                                <button
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setSelected(index)}
                                    className={cn(
                                        "flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                                        active
                                            ? "border-acc-line bg-acc-soft"
                                            : "border-line-2 bg-panel hover:border-acc-line"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "font-mono text-sm",
                                            active ? "text-acc-ink" : "text-mute"
                                        )}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-medium">{item.title}</span>
                                        <span className="text-ink-2 block text-sm">
                                            {item.subtitle}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </section>

            <Panel as="section" aria-label={`Workflow of ${systemName}`} className="min-w-0">
                {workflow.nodes.length > 0 && (
                    <DiagramFlow
                        diagram={{ nodes: workflow.nodes, edges: workflow.edges }}
                        label={`Workflow of ${systemName}`}
                        selectedId={step?.node}
                    />
                )}
                {step && (
                    <div aria-live="polite" className="border-line mt-6 border-t pt-5">
                        <MonoLabel as="h3">
                            Step {String(selected + 1).padStart(2, "0")} · {step.title}
                        </MonoLabel>
                        <p className="mt-2 text-[15px] leading-relaxed">{step.detail}</p>
                    </div>
                )}
            </Panel>

            {notes.length > 0 && (
                <div className="space-y-6 lg:col-span-2 xl:col-span-1">
                    {notes.map((note) => (
                        <section key={note.title}>
                            <MonoLabel as="h2">{note.title}</MonoLabel>
                            {/* Sanitized by rehype-sanitize in the data layer. */}
                            <div
                                className="prose text-ink-2 mt-3 text-[15px]"
                                dangerouslySetInnerHTML={{ __html: note.html }}
                            />
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
