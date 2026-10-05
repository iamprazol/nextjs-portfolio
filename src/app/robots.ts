import type { MetadataRoute } from "next";

import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
    return {
        // /_data, /_ui and /_tokens are dev-only pages (404 in production).
        rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/_data", "/_ui", "/_tokens"] },
        sitemap: `${env.SITE_URL}/sitemap.xml`
    };
}
