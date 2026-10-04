import { expect, test } from "@playwright/test";

// Mock fixtures: 28 log entries (23 listed PRs + 5 releases); two PRs are
// highlighted, one (demo log #19) is hidden. PR 412 is log #23 and is cited by
// the checkout-race case study.

const rows = "main ol > li";

test.describe("engineering log", () => {
    test("lists 20 entries per page, highlighted first", async ({ page }) => {
        await page.goto("/log");
        await expect(page).toHaveTitle("Engineering Log — Demo Developer");
        await expect(page.locator(rows)).toHaveCount(20);

        // The two highlighted entries lead, then newest first.
        await expect(page.locator(`${rows} h2`).nth(0)).toHaveText("Make webhook activation idempotent");
        await expect(page.locator(rows).nth(0)).toContainText("#23");
        await expect(page.locator(rows).nth(0)).toContainText("Highlighted");
        await expect(page.locator(rows).nth(1)).toContainText("Highlighted");
        await expect(page.locator(rows).nth(2)).toContainText("#24");
        await expect(page.locator(rows).nth(2)).not.toContainText("Highlighted");
        await expect(page.locator(rows).nth(0)).toContainText("+240 −61");

        // The hidden PR is nowhere in the log.
        await expect(page.getByText("Bump dev dependencies")).toHaveCount(0);
    });

    test("paginates with ?page= and rejects pages that do not exist", async ({ page }) => {
        await page.goto("/log");
        const pagination = page.getByRole("navigation", { name: "Pagination" });
        await expect(pagination).toContainText("Page 1 of 2");

        await pagination.getByRole("link", { name: "Older" }).click();
        await expect(page).toHaveURL(/\/log\?page=2$/);
        await expect(page.locator(rows)).toHaveCount(8);
        await pagination.getByRole("link", { name: "Newer" }).click();
        await expect(page).toHaveURL(/\/log$/);

        expect((await page.goto("/log?page=3"))?.status()).toBe(404);
        expect((await page.goto("/log?page=abc"))?.status()).toBe(404);
    });

    test("an entry opens to show its description, size and links", async ({ page }) => {
        await page.goto("/log");
        const row = page.locator(rows).first();
        const button = row.getByRole("button", { name: "Make webhook activation idempotent" });

        await expect(button).toHaveAttribute("aria-expanded", "false");
        await button.focus();
        await page.keyboard.press("Enter");
        await expect(button).toHaveAttribute("aria-expanded", "true");

        await expect(row).toContainText("takes a row lock and records the webhook id");
        await expect(row).toContainText("7 files changed");
        // The PR template's HTML comment was stripped.
        await expect(row).not.toContainText("Describe your change");
        await expect(
            row.getByRole("link", { name: "Case study: Double charges under concurrent checkout" })
        ).toHaveAttribute("href", "/systems/atlas-membership/problems/checkout-race");
        await expect(row.getByRole("link", { name: "Pull request #412 on GitHub" })).toHaveAttribute(
            "href",
            "https://github.com/demo-labs/atlas-membership/pull/412"
        );
        await expect(row.getByRole("link", { name: "Open entry #23" })).toHaveAttribute("href", "/log/23");

        await page.keyboard.press("Enter");
        await expect(button).toHaveAttribute("aria-expanded", "false");
    });

    test("filters by system and keeps the choice in the URL and across pages", async ({ page }) => {
        await page.goto("/log");
        await page.getByLabel("System").selectOption({ label: "Relay QA" });
        await expect(page).toHaveURL(/\/log\?system=relay-qa$/);
        await expect(page.locator(rows)).toHaveCount(4);
        await expect(page.getByText("4 entries")).toBeVisible();

        // Experiments are listed too, and a long one keeps its filter when paging.
        await page.goto("/log?system=tiny-shell");
        await expect(page.getByLabel("System")).toHaveValue("tiny-shell");
        await expect(page.getByText("12 entries")).toBeVisible();
        await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);

        await page.getByLabel("System").selectOption({ label: "All systems" });
        await expect(page).toHaveURL(/\/log$/);

        expect((await page.goto("/log?system=nope"))?.status()).toBe(404);
    });

    test("private-repo entries have no GitHub link", async ({ page }) => {
        await page.goto("/log?system=docsmith");
        const row = page.locator(rows, { hasText: "Build search index at compile time" });
        await row.getByRole("button").click();
        await expect(row.locator("a[href*='github.com']")).toHaveCount(0);
        await expect(row.getByRole("link", { name: /^Open entry/ })).toBeVisible();
    });
});

test.describe("log entry page", () => {
    test("shows the entry and links to its neighbours", async ({ page }) => {
        await page.goto("/log/23");
        await expect(page).toHaveTitle("#23 Make webhook activation idempotent — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Make webhook activation idempotent");
        await expect(page.getByText("Engineering log #23 · highlighted")).toBeVisible();

        const more = page.getByRole("navigation", { name: "More entries" });
        await expect(more.getByRole("link", { name: /Newer · #24/ })).toHaveAttribute("href", "/log/24");
        await expect(more.getByRole("link", { name: /Older · #22/ })).toHaveAttribute("href", "/log/22");
    });

    test("skips the hidden entry when linking neighbours", async ({ page }) => {
        // #19 is hidden: #20's older neighbour is #18.
        await page.goto("/log/20");
        await expect(
            page.getByRole("navigation", { name: "More entries" }).getByRole("link", { name: /Older/ })
        ).toHaveAttribute("href", "/log/18");
    });

    test("returns a real 404 for hidden, unknown and malformed numbers", async ({ page }) => {
        for (const path of ["/log/19", "/log/999", "/log/abc", "/log/023"]) {
            expect((await page.goto(path))?.status(), path).toBe(404);
        }
    });

    test("is reachable from the home preview and from case-study evidence", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Retry a repaired selector once before failing" }).click();
        await expect(page).toHaveURL(/\/log\/24$/);

        await page.goto("/systems/atlas-membership/problems/checkout-race");
        await page.getByRole("link", { name: "Log #23" }).click();
        await expect(page).toHaveURL(/\/log\/23$/);
    });
});

test.describe("rss feed", () => {
    test("is advertised in the page head and serves RSS 2.0", async ({ page, request }) => {
        await page.goto("/");
        await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
            "href",
            /\/log\/rss\.xml$/
        );

        const response = await request.get("/log/rss.xml");
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toContain("application/rss+xml");

        const xml = await response.text();
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain("<title>Demo Developer — Engineering Log</title>");
        expect(xml.match(/<item>/g)).toHaveLength(28);
        // Newest first, not pinned first.
        expect(xml.indexOf("#24 Retry a repaired selector")).toBeLessThan(
            xml.indexOf("#23 Make webhook activation idempotent")
        );
        expect(xml).toContain("/log/24</link>");
        expect(xml).not.toContain("Bump dev dependencies");
    });
});
