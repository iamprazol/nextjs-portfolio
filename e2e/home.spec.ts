import { expect, test, type Page } from "@playwright/test";

/** How many items a data-layer function returned, read from the dev-only /_data page. */
async function countFromData(page: Page, call: string) {
    await page.goto("/_data");
    const row = page.locator("summary", { hasText: call });
    const text = await row.locator("span").last().textContent();
    const count = Number(text?.match(/^(\d+) items?$/)?.[1]);
    expect(Number.isInteger(count), `could not read "${call}" from /_data: ${text}`).toBe(true);
    return count;
}

for (const theme of ["dark", "light"] as const) {
    test.describe(`home, ${theme} theme`, () => {
        test.beforeEach(async ({ page }) => {
            await page.addInitScript((value) => localStorage.setItem("pp-theme", value), theme);
        });

        test("lists every system from the data layer", async ({ page }) => {
            const systems = await countFromData(page, "getSystems()");
            expect(systems).toBeGreaterThan(0);

            const issues: string[] = [];
            page.on("console", (message) => {
                if (message.type() === "error" || message.type() === "warning") {
                    issues.push(message.text());
                }
            });
            page.on("pageerror", (error) => issues.push(String(error)));

            await page.goto("/");
            await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));

            // The status card has one row per system…
            const statusCard = page.getByRole("region", { name: "System status" });
            await expect(statusCard.getByRole("link")).toHaveCount(systems);

            // …and the grid shows the first four.
            const cards = page.locator('a[href^="/systems/"]', { hasText: /^SYS-\d\d/ });
            await expect(cards).toHaveCount(Math.min(systems, 4));

            // No hydration warnings or other console noise.
            expect(issues).toEqual([]);
        });

        test("does not scroll sideways on a phone", async ({ page }) => {
            await page.setViewportSize({ width: 390, height: 800 });
            await page.goto("/");
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - window.innerWidth
            );
            expect(overflow).toBeLessThanOrEqual(0);
        });
    });
}
