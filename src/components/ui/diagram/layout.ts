import type { Diagram, DiagramEdgeData, DiagramNodeData } from "@/lib/github/schemas";

export type DiagramCell = {
    node: DiagramNodeData;
    /** Set when this node sits beside a peer (a ↔ b) instead of in the tree. */
    peerOf?: string;
    /** Has an edge from the row above. */
    hasParent: boolean;
    /** Has an edge to the row below. */
    hasChild: boolean;
};

export type DiagramLayout = {
    rows: DiagramCell[][];
    /** Edges that survived validation, for the text alternative. */
    edges: (DiagramEdgeData & { bidirectional: boolean })[];
};

/**
 * Turns a {nodes, edges} graph into rows.
 *
 * - A node's row is its longest path from a root, so parents sit above children.
 * - A two-way edge (a → b and b → a) makes b a "peer" drawn beside a, when b
 *   has no other place in the tree.
 * - Edges to unknown nodes and self-edges are dropped. Cycles cannot loop: the
 *   ranking pass is capped at one iteration per node.
 */
export function layoutDiagram(diagram: Diagram): DiagramLayout {
    const { nodes } = diagram;
    const ids = new Set(nodes.map((node) => node.id));
    const valid = diagram.edges.filter(
        (edge) => ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to
    );
    const keys = new Set(valid.map((edge) => `${edge.from}>${edge.to}`));
    const isTwoWay = (edge: DiagramEdgeData) =>
        keys.has(`${edge.to}>${edge.from}`);

    const directed = valid.filter((edge) => !isTwoWay(edge));
    const inTree = new Set(directed.flatMap((edge) => [edge.from, edge.to]));

    // Each two-way pair once, in the order written.
    const seen = new Set<string>();
    const pairs = valid.filter((edge) => {
        if (!isTwoWay(edge)) return false;
        const key = [edge.from, edge.to].sort().join("<>");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const peerOf = new Map<string, string>();
    const anchors = new Set<string>();
    const canBePeer = (id: string) =>
        !peerOf.has(id) && !inTree.has(id) && !anchors.has(id);

    for (const { from, to } of pairs) {
        if (canBePeer(to)) {
            peerOf.set(to, from);
            anchors.add(from);
        } else if (canBePeer(from)) {
            peerOf.set(from, to);
            anchors.add(to);
        } else {
            // Both already have a place: fall back to a plain parent → child edge.
            directed.push({ from, to });
        }
    }

    const anchorOf = (id: string): string => {
        let current = id;
        for (let hops = 0; peerOf.has(current) && hops < nodes.length; hops++) {
            current = peerOf.get(current)!;
        }
        return current;
    };

    const treeEdges = directed
        .map((edge) => ({ from: anchorOf(edge.from), to: anchorOf(edge.to) }))
        .filter((edge) => edge.from !== edge.to);

    const rank = new Map<string, number>();
    for (const node of nodes) {
        if (!peerOf.has(node.id)) rank.set(node.id, 0);
    }
    for (let pass = 0; pass < nodes.length; pass++) {
        let changed = false;
        for (const { from, to } of treeEdges) {
            const next = Math.min(rank.get(from)! + 1, nodes.length - 1);
            if (next > rank.get(to)!) {
                rank.set(to, next);
                changed = true;
            }
        }
        if (!changed) break;
    }

    // Compact ranks into consecutive row indexes.
    const levels = [...new Set(rank.values())].sort((a, b) => a - b);
    const rowOf = (id: string) => levels.indexOf(rank.get(id)!);

    const peersOf = (id: string): DiagramNodeData[] =>
        nodes
            .filter((node) => peerOf.get(node.id) === id)
            .flatMap((node) => [node, ...peersOf(node.id)]);

    const rows: DiagramCell[][] = levels.map(() => []);
    for (const node of nodes) {
        if (peerOf.has(node.id)) continue;
        const row = rowOf(node.id);

        rows[row].push({
            node,
            hasParent: treeEdges.some(
                (edge) => edge.to === node.id && rowOf(edge.from) === row - 1
            ),
            hasChild: treeEdges.some(
                (edge) => edge.from === node.id && rowOf(edge.to) === row + 1
            )
        });
        for (const peer of peersOf(node.id)) {
            rows[row].push({
                node: peer,
                peerOf: peerOf.get(peer.id),
                hasParent: false,
                hasChild: false
            });
        }
    }

    const edges = [
        ...valid
            .filter((edge) => !isTwoWay(edge))
            .map((edge) => ({ ...edge, bidirectional: false })),
        ...pairs.map((edge) => ({ ...edge, bidirectional: true }))
    ];

    return { rows, edges };
}

/**
 * Which halves of a cell carry the horizontal connector line.
 *
 * Cells are equal width, so in half-cell units cell `i` is centered at 2i + 1
 * and the row is centered at `count`. The line spans every connected cell plus
 * the row center; because all rows share that center, the lines of two
 * adjacent rows always meet, whatever their widths.
 */
export function busHalves(
    index: number,
    count: number,
    connected: number[]
): { left: boolean; right: boolean } {
    if (connected.length === 0) return { left: false, right: false };

    const lo = Math.min(2 * Math.min(...connected) + 1, count);
    const hi = Math.max(2 * Math.max(...connected) + 1, count);

    return {
        left: lo <= 2 * index && 2 * index + 1 <= hi,
        right: lo <= 2 * index + 1 && 2 * index + 2 <= hi
    };
}
