// Mirrors the Diagram schema in ARCHITECTURE.md §3.3. Defined here until the
// GitHub data layer exists; M02 moves it to src/lib/github/schemas.ts (zod)
// and this file re-exports the inferred type.
export type DiagramNodeData = {
    id: string;
    label: string;
    group?: string;
};

export type DiagramEdgeData = {
    from: string;
    to: string;
};

export type Diagram = {
    nodes: DiagramNodeData[];
    edges: DiagramEdgeData[];
};
