import { expect, test } from "@playwright/test";

// Mock fixtures: four systems, one each in production, building, active and
// maintenance (see scripts/fixtures/demo-world.mts).

const cards = "main article";

test.describe("systems index", () => {
    test("shows a pill for each status that exists, with counts", async ({ page }) => {
        await page.goto("/systems");

        const pills = page.getByRole("group", { name: "Filter by status" }).getByRole("button");
        await expect(pills).toHaveText([
            /^All\s*4$/,
            /^Production\s*1$/,
            /^Building\s*1$/,
            /^Active\s*1$/,
            /^Maintenance\s*1$/
        ]);
        // No system is an experiment, so there is no such pill.
        await expect(page.getByRole("button", { name: /Experiment/ })).toHaveCount(0);

        await expect(page.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(cards)).toHaveCount(4);
    });

    test("filters by status and keeps the choice in the URL", async ({ page }) => {
        await page.goto("/systems");

        await page.getByRole("button", { name: /^Building/ }).click();
        await expect(page).toHaveURL(/\/systems\?status=building$/);
        await expect(page.getByRole("button", { name: /^Building/ })).toHaveAttribute("aria-pressed", "true");
        await expect(page.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "false");
        await expect(page.locator(cards)).toHaveCount(1);
        await expect(page.locator(cards)).toContainText("Relay QA");

        await page.getByRole("button", { name: /^All/ }).click();
        await expect(page).toHaveURL(/\/systems$/);
        await expect(page.locator(cards)).toHaveCount(4);
    });

    test("opens a shared filtered link already filtered", async ({ page }) => {
        await page.goto("/systems?status=production");

        await expect(page.getByRole("button", { name: /^Production/ })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(cards)).toHaveCount(1);
        await expect(page.locator(cards)).toContainText("Atlas Membership");
    });

    test("treats an unknown status as All", async ({ page }) => {
        await page.goto("/systems?status=nonsense");

        await expect(page.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(cards)).toHaveCount(4);
    });

    test("is operable from the keyboard", async ({ page }) => {
        await page.goto("/systems");

        await page.getByRole("button", { name: /^Active/ }).focus();
        await page.keyboard.press("Space");
        await expect(page).toHaveURL(/status=active$/);
        await expect(page.locator(cards)).toHaveCount(1);
        // Focus stays on the pill after the list changes.
        await expect(page.getByRole("button", { name: /^Active/ })).toBeFocused();
    });

    test("has metadata with the number of systems", async ({ page }) => {
        await page.goto("/systems");

        await expect(page).toHaveTitle("Systems — Demo Developer");
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            "content",
            /^4 systems:/
        );
    });

    test("lists systems in featured order and links each to its profile", async ({ page }) => {
        await page.goto("/systems");

        await expect(page.locator(`${cards} h2`)).toHaveText([
            "Atlas Membership",
            "Relay QA",
            "DocSmith",
            "formkit-legacy"
        ]);
        await expect(
            page.getByRole("link", { name: /^Open system profile\s*: Relay QA$/ })
        ).toHaveAttribute("href", "/systems/relay-qa");
    });
});
