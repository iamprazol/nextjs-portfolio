import { cn } from "@/lib/cn";

import type { DiagramNodeData } from "@/lib/github/schemas";

type DiagramNodeProps = {
    node: DiagramNodeData;
    selected?: boolean;
    /** Makes the node a toggle button. Without it the node is static text. */
    onSelect?: (id: string) => void;
    className?: string;
};

export function DiagramNode({
    node,
    selected = false,
    onSelect,
    className
}: DiagramNodeProps) {
    const classes = cn(
        // min-h-11 = 44px touch target
        "flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-center font-mono text-sm leading-snug transition-colors",
        selected
            ? "border-acc bg-acc-soft text-acc-ink"
            : "border-line-2 bg-panel text-ink",
        className
    );

    if (!onSelect) {
        return (
            <div data-group={node.group} className={classes}>
                {node.label}
            </div>
        );
    }

    return (
        <button
            type="button"
            data-group={node.group}
            aria-pressed={selected}
            onClick={() => onSelect(node.id)}
            className={cn(classes, "hover:border-acc-line cursor-pointer")}
        >
            {node.label}
        </button>
    );
}
