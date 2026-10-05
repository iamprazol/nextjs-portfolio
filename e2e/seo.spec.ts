import { expect, test } from "@playwright/test";

// Mock fixtures: 4 systems, 3 case studies, 23 listed PRs with a page each.

const meta = (page: import("@playwright/test").Page, key: string) =>
    page.locator(`meta[property="${key}"], meta[name="${key}"]`).first();

test.describe("sitemap and robots", () => {
    test("the sitemap lists every page once, with absolute URLs", async ({ request }) => {
        const response = await request.get("/sitemap.xml");
        expect(response.status()).toBe(200);
        const xml = await response.text();
        const paths = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/");

        for (const path of [
            "/",
            "/systems",
            "/log",
            "/timeline",
            "/lab",
            "/about",
            "/resume",
            "/systems/atlas-membership",
            "/systems/formkit-legacy",
            "/systems/atlas-membership/problems/checkout-race",
            "/systems/relay-qa/problems/flaky-selectors",
            "/log/24",
            "/log/1"
        ]) {
            expect(paths, path).toContain(path);
        }
        expect(paths.filter((path) => /^\/systems\/[^/]+$/.test(path))).toHaveLength(4);
        expect(paths.filter((path) => path.includes("/problems/"))).toHaveLength(3);
        expect(paths.filter((path) => /^\/log\/\d+$/.test(path))).toHaveLength(23);
        // The hidden PR has no page, and dev-only pages are never listed.
        expect(paths).not.toContain("/log/19");
        expect(paths.some((path) => path.startsWith("/_"))).toBe(false);
        expect(new Set(paths).size).toBe(paths.length);
    });

    test("robots allows the site, hides the API and points to the sitemap", async ({ request }) => {
        const text = await (await request.get("/robots.txt")).text();
        expect(text).toMatch(/User-Agent: \*/i);
        expect(text).toContain("Disallow: /api/");
        expect(text).toContain("Disallow: /_data");
        expect(text).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
    });
});

test.describe("metadata", () => {
    for (const [path, title, canonical] of [
        ["/", "Demo Developer", "/"],
        ["/systems?status=building", "Systems", "/systems"],
        ["/systems/relay-qa?tab=workflow", "Relay QA", "/systems/relay-qa"],
        [
            "/systems/atlas-membership/problems/checkout-race",
            "Double charges under concurrent checkout · Atlas Membership",
            "/systems/atlas-membership/problems/checkout-race"
        ],
        ["/log?page=2", "Engineering Log", "/log"],
        ["/log/23", "#23 Make webhook activation idempotent", "/log/23"],
        ["/timeline?year=2024", "Engineering Timeline", "/timeline"],
        ["/lab", "Experiments", "/lab"],
        ["/about", "About", "/about"],
        ["/resume", "Résumé", "/resume"]
    ] as const) {
        test(`${path} has a description, canonical URL and preview tags`, async ({ page }) => {
            await page.goto(path);
            await expect(meta(page, "description")).toHaveAttribute("content", /.{20,}/);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                "href",
                // The home page's canonical may be written with or without the trailing slash.
                new RegExp(`^https?://[^/]+${canonical === "/" ? "/?" : canonical.replace(/[/?]/g, "\\$&")}$`)
            );
            await expect(meta(page, "og:title")).toHaveAttribute("content", title);
            await expect(meta(page, "og:image")).toHaveAttribute("content", /opengraph-image/);
            await expect(meta(page, "twitter:card")).toHaveAttribute("content", "summary_large_image");
            // Every page still advertises the feed.
            await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveCount(1);
        });
    }
});

test.describe("open graph images", () => {
    test("home, system and problem pages each have their own 1200×630 PNG", async ({ page, request }) => {
        const images = new Set<string>();
        for (const path of ["/", "/systems/atlas-membership", "/systems/atlas-membership/problems/checkout-race"]) {
            await page.goto(path);
            const url = await meta(page, "og:image").getAttribute("content");
            await expect(meta(page, "og:image:width")).toHaveAttribute("content", "1200");
            await expect(meta(page, "og:image:height")).toHaveAttribute("content", "630");

            const response = await request.get(new URL(url!).pathname + new URL(url!).search);
            expect(response.status(), path).toBe(200);
            expect(response.headers()["content-type"]).toBe("image/png");
            expect((await response.body()).byteLength).toBeGreaterThan(5000);
            images.add(new URL(url!).pathname);
        }
        expect(images.size).toBe(3);
    });
});

test.describe("structured data", () => {
    test("the home page describes the owner as a schema.org Person", async ({ page }) => {
        await page.goto("/");
        const json = await page.locator('script[type="application/ld+json"]').textContent();
        expect(JSON.parse(json!)).toMatchObject({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Demo Developer",
            jobTitle: "Software Engineer / Product Builder",
            homeLocation: { "@type": "Place", name: "Example City, EX" },
            sameAs: expect.arrayContaining(["https://github.com/demo-dev"])
        });
    });
});
