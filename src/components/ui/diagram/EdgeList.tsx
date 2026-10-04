import type { DiagramLayout } from "./layout";
import type { Diagram } from "@/lib/github/schemas";

// Screen-reader text for the connector lines, which are drawn with CSS only.
export function EdgeList({
    diagram,
    edges
}: {
    diagram: Diagram;
    edges: DiagramLayout["edges"];
}) {
    if (edges.length === 0) return null;

    const label = (id: string) =>
        diagram.nodes.find((node) => node.id === id)?.label ?? id;

    return (
        <ul className="sr-only">
            {edges.map((edge) => (
                <li key={`${edge.from}>${edge.to}`}>
                    {label(edge.from)}{" "}
                    {edge.bidirectional ? "connects both ways with" : "connects to"}{" "}
                    {label(edge.to)}
                </li>
            ))}
        </ul>
    );
}
