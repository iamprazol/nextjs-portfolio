"use client";

import { useState } from "react";

import { DiagramFlow, DiagramTree, type Diagram } from "@/components/ui/diagram";

// Test objects for the dev gallery only — real diagrams come from GitHub (M02).
const urmTree: Diagram = {
    nodes: [
        { id: "urm", label: "URM" },
        { id: "membership", label: "Membership" },
        { id: "payments", label: "Payments" },
        { id: "users", label: "Users" },
        { id: "core", label: "WordPress Core" },
        { id: "db", label: "Database" }
    ],
    edges: [
        { from: "urm", to: "membership" },
        { from: "urm", to: "payments" },
        { from: "urm", to: "users" },
        { from: "membership", to: "core" },
        { from: "payments", to: "core" },
        { from: "users", to: "core" },
        { from: "core", to: "db" },
        { from: "db", to: "core" }
    ]
};

const flow: Diagram = {
    nodes: [
        { id: "a", label: "Request" },
        { id: "b", label: "Validate" },
        { id: "c", label: "Write cache" },
        { id: "d", label: "Write database" },
        { id: "e", label: "Respond" }
    ],
    edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "b", to: "d" },
        { from: "c", to: "e" },
        { from: "d", to: "e" }
    ]
};

export function DiagramDemo() {
    const [selected, setSelected] = useState<string>();
    const toggle = (id: string) =>
        setSelected((current) => (current === id ? undefined : id));

    return (
        <div className="w-full min-w-0 space-y-8">
            <div className="border-line-2 bg-panel rounded-xl border p-4">
                <DiagramTree
                    diagram={urmTree}
                    label="Example architecture tree"
                    selectedId={selected}
                    onSelect={toggle}
                />
                <p className="text-mute mt-3 font-mono text-xs" aria-live="polite">
                    selected: {selected ?? "none"}
                </p>
            </div>
            <div className="border-line-2 bg-panel rounded-xl border p-4">
                <DiagramFlow diagram={flow} label="Example flow (static)" />
            </div>
        </div>
    );
}
