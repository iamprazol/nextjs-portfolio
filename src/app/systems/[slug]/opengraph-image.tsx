import { notFound } from "next/navigation";

import { statusLabel } from "@/components/ui/status";
import { getProfile, getSystem } from "@/lib/github";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const revalidate = 3600;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "System profile";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const [system, profile] = await Promise.all([getSystem((await params).slug), getProfile()]);
    if (!system) notFound();

    return ogImage({
        eyebrow: system.kind ?? profile.name,
        title: system.name,
        subtitle: system.proves ?? system.description,
        status: { key: system.status, label: statusLabel[system.status] },
        tags: system.stack
    });
}
