import type { Metadata } from "next";

// Setting `openGraph` on a route replaces the root layout's, and with it the
// image Next would otherwise pick up from an opengraph-image file. So the
// image is always named here: the site card, or the route's own.
const SITE_IMAGE = "/opengraph-image";

type Page = {
    title: string;
    description?: string | null;
    /** The page's own path, e.g. "/systems/atlas". Query-string variants point back to it. */
    path: string;
    /** True when the route has its own opengraph-image file (at `<path>/opengraph-image`). */
    ownImage?: boolean;
};

/**
 * A route's metadata: title and description, the same pair for link previews
 * (Open Graph and Twitter), a canonical URL and the preview image. Relative
 * URLs resolve against `metadataBase` in the root layout.
 */
export function pageMetadata({ title, description, path, ownImage = false }: Page): Metadata {
    const summary = description ?? undefined;
    const image = {
        url: ownImage ? `${path}/opengraph-image` : SITE_IMAGE,
        width: 1200,
        height: 630,
        alt: title
    };

    return {
        title,
        description: summary,
        alternates: {
            canonical: path,
            // Setting `alternates` replaces the root layout's, so the feed is repeated here.
            types: { "application/rss+xml": [{ url: "/log/rss.xml", title: "Engineering Log" }] }
        },
        openGraph: { type: "website", title, description: summary, url: path, images: [image] },
        twitter: { card: "summary_large_image", title, description: summary, images: [image] }
    };
}
