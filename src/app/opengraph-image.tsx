import { getProfile, getToolUsage } from "@/lib/github";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const revalidate = 3600;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Engineering portfolio";

// The site's default card: also used by every page without one of its own.
export default async function Image() {
    const [profile, tools] = await Promise.all([getProfile(), getToolUsage()]);

    return ogImage({
        eyebrow: "Engineering portfolio",
        title: profile.name,
        subtitle: profile.headline,
        tags: tools.filter((tool) => tool.kind === "language").map((tool) => tool.name)
    });
}
