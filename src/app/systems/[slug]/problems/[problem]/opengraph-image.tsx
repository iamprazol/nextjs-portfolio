import { notFound } from "next/navigation";

import { statusLabel } from "@/components/ui/status";
import { getProblem, getSystem } from "@/lib/github";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const revalidate = 3600;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Engineering problem";

type Props = { params: Promise<{ slug: string; problem: string }> };

export default async function Image({ params }: Props) {
    const { slug, problem: problemSlug } = await params;
    const [system, problem] = await Promise.all([getSystem(slug), getProblem(slug, problemSlug)]);
    if (!system || !problem) notFound();

    return ogImage({
        eyebrow: `${system.name} · Engineering problem`,
        title: problem.title,
        subtitle: problem.summary,
        status: { key: system.status, label: statusLabel[system.status] },
        tags: system.stack
    });
}
