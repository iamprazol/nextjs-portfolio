import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import type { Heading } from "./schemas";
import { toSlug } from "./slug";

type HastNode = {
    type: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
};

function textOf(node: HastNode): string {
    if (node.type === "text") return node.value ?? "";
    return (node.children ?? []).map(textOf).join("");
}

/**
 * Gives every heading an id and reports the headings found. Runs after the
 * sanitizer, so ids are ours (the sanitizer would prefix or strip author ids).
 */
function collectHeadings(tree: HastNode, headings: Heading[]) {
    const used = new Map<string, number>();

    const visit = (node: HastNode) => {
        const depth = /^h([1-6])$/.exec(node.tagName ?? "")?.[1];
        if (node.type === "element" && depth) {
            const text = textOf(node).trim();
            const base = toSlug(text) || "section";
            const seen = used.get(base) ?? 0;
            used.set(base, seen + 1);

            const id = seen === 0 ? base : `${base}-${seen + 1}`;
            node.properties = { ...node.properties, id };
            headings.push({ id, text, depth: Number(depth) });
        }
        node.children?.forEach(visit);
    };
    visit(tree);
}

/** Markdown (GFM) → sanitized HTML, plus its headings for anchor links. */
export async function renderMarkdown(markdown: string) {
    const headings: Heading[] = [];

    const file = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(() => (tree) => collectHeadings(tree as HastNode, headings))
        .use(rehypeStringify)
        .process(markdown);

    return { html: String(file), headings };
}
