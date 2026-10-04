import { cn } from "@/lib/cn";

import { DiagramNode } from "./DiagramNode";
import { EdgeList } from "./EdgeList";
import { busHalves, layoutDiagram } from "./layout";
import type { Diagram } from "@/lib/github/schemas";

type DiagramTreeProps = {
    diagram: Diagram;
    /** Accessible name, e.g. "Architecture of <system>". */
    label: string;
    selectedId?: string;
    /** Pass from a client component to make nodes selectable. */
    onSelect?: (id: string) => void;
    className?: string;
};

const wire = "bg-wire pointer-events-none absolute";

/**
 * Renders a graph as centered rows joined by CSS lines — no canvas or SVG.
 *
 * Between two rows the connectors form a shared bus: a stub leaves every
 * parent, a stub enters every child, and one horizontal line joins them. That
 * reads correctly for trees and fan-in/fan-out; it does not show which parent
 * feeds which child when both rows have several, and edges that skip a row are
 * not drawn. Wide diagrams scroll inside this box.
 */
export function DiagramTree({
    diagram,
    label,
    selectedId,
    onSelect,
    className
}: DiagramTreeProps) {
    const { rows, edges } = layoutDiagram(diagram);

    return (
        <div
            role="group"
            aria-label={label}
            // A static diagram has nothing focusable inside, so the scrolling
            // box itself must be reachable by keyboard.
            tabIndex={onSelect ? undefined : 0}
            className={cn("overflow-x-auto", className)}
        >
            <div className="mx-auto flex w-max min-w-full flex-col items-center p-1">
                {rows.map((row, rowIndex) => {
                    const withParent = row.flatMap((cell, i) =>
                        cell.hasParent ? [i] : []
                    );
                    const withChild = row.flatMap((cell, i) =>
                        cell.hasChild ? [i] : []
                    );
                    const hasTop = withParent.length > 0;
                    const hasBottom = withChild.length > 0;

                    return (
                        <div
                            key={rowIndex}
                            // -mt-px overlaps this row's top line with the bottom line above
                            className={cn("flex", rowIndex > 0 && "-mt-px")}
                        >
                            {row.map((cell, index) => {
                                const top = busHalves(index, row.length, withParent);
                                const bottom = busHalves(index, row.length, withChild);

                                return (
                                    <div
                                        key={cell.node.id}
                                        className={cn(
                                            "relative w-44 shrink-0 px-3",
                                            hasTop && "pt-5",
                                            hasBottom && "pb-5"
                                        )}
                                    >
                                        {top.left && (
                                            <span className={cn(wire, "top-0 left-0 h-px w-1/2")} />
                                        )}
                                        {top.right && (
                                            <span className={cn(wire, "top-0 right-0 h-px w-1/2")} />
                                        )}
                                        {cell.hasParent && (
                                            <span className={cn(wire, "top-0 left-1/2 h-5 w-px")} />
                                        )}
                                        {bottom.left && (
                                            <span className={cn(wire, "bottom-0 left-0 h-px w-1/2")} />
                                        )}
                                        {bottom.right && (
                                            <span className={cn(wire, "right-0 bottom-0 h-px w-1/2")} />
                                        )}
                                        {cell.hasChild && (
                                            <span className={cn(wire, "bottom-0 left-1/2 h-5 w-px")} />
                                        )}

                                        <div className="relative">
                                            {cell.peerOf && (
                                                <span
                                                    aria-hidden="true"
                                                    className="text-wire absolute top-1/2 right-full w-6 -translate-y-1/2 text-center font-mono text-sm leading-none"
                                                >
                                                    ↔
                                                </span>
                                            )}
                                            <DiagramNode
                                                node={cell.node}
                                                selected={cell.node.id === selectedId}
                                                onSelect={onSelect}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <EdgeList diagram={diagram} edges={edges} />
        </div>
    );
}
