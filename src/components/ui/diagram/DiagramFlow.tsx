import { cn } from "@/lib/cn";

import { DiagramNode } from "./DiagramNode";
import { EdgeList } from "./EdgeList";
import { layoutDiagram } from "./layout";
import type { Diagram } from "./types";

type DiagramFlowProps = {
    diagram: Diagram;
    /** Accessible name, e.g. "Request flow before the fix". */
    label: string;
    selectedId?: string;
    /** Pass from a client component to make nodes selectable. */
    onSelect?: (id: string) => void;
    className?: string;
};

/**
 * Vertical flow: one step per row with ↓ between rows. Steps that share a
 * rank (same distance from the start) sit side by side as a parallel row.
 */
export function DiagramFlow({
    diagram,
    label,
    selectedId,
    onSelect,
    className
}: DiagramFlowProps) {
    const { rows, edges } = layoutDiagram(diagram);

    return (
        <div role="group" aria-label={label} className={className}>
            <ol className="flex flex-col items-stretch">
                {rows.map((row, rowIndex) => (
                    <li key={rowIndex} className="flex flex-col items-center">
                        {rowIndex > 0 && (
                            <span
                                aria-hidden="true"
                                className="text-wire py-1 font-mono text-base leading-none"
                            >
                                ↓
                            </span>
                        )}
                        <div
                            className={cn(
                                "flex w-full gap-3",
                                row.length === 1 && "max-w-xs"
                            )}
                        >
                            {row.map((cell) => (
                                <DiagramNode
                                    key={cell.node.id}
                                    node={cell.node}
                                    selected={cell.node.id === selectedId}
                                    onSelect={onSelect}
                                    className="min-w-0 flex-1"
                                />
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
            <EdgeList diagram={diagram} edges={edges} />
        </div>
    );
}
