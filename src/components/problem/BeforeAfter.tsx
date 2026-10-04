import { MonoLabel } from "@/components/ui";
import { DiagramTree } from "@/components/ui/diagram";
import { cn } from "@/lib/cn";
import type { Diagram } from "@/lib/github";

type BeforeAfterProps = { before?: Diagram; after?: Diagram };

function Figure({ title, diagram, accent }: { title: string; diagram: Diagram; accent?: boolean }) {
    return (
        <figure
            className={cn(
                "min-w-0 rounded-xl border p-5",
                accent ? "border-acc-line bg-acc-soft" : "border-line-2 bg-panel"
            )}
        >
            <figcaption>
                <MonoLabel className={accent ? "text-acc-ink" : undefined}>{title}</MonoLabel>
            </figcaption>
            <DiagramTree diagram={diagram} label={title} className="mt-4" />
        </figure>
    );
}

/** The old and new system side by side; stacked on small screens. Either may be missing. */
export function BeforeAfter({ before, after }: BeforeAfterProps) {
    if (!before && !after) return null;

    return (
        <div className={cn("mt-10 grid gap-5", before && after && "md:grid-cols-2")}>
            {before && <Figure title="The Old System" diagram={before} />}
            {after && <Figure title="The New System" diagram={after} accent />}
        </div>
    );
}
