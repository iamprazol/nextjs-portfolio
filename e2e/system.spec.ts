import { expect, test } from "@playwright/test";

// Mock fixtures (scripts/fixtures/demo-world.mts):
// - atlas-membership: architecture, 2 problems, 4 releases, no workflow
// - relay-qa: workflow + README notes, 1 problem, no architecture, no releases
// - formkit-legacy: tagged repo with no metadata files and only a prerelease

const tabNames = (page: import("@playwright/test").Page) =>
    page.getByRole("tablist").getByRole("tab").allTextContents();

test.describe("system profile", () => {
    test("lists only the tabs the system has data for", async ({ page }) => {
        await page.goto("/systems/atlas-membership");
        expect(await tabNames(page)).toEqual([
            "Overview",
            "Architecture",
            "Engineering Problems",
            "Releases"
        ]);

        await page.goto("/systems/relay-qa");
        expect(await tabNames(page)).toEqual(["Overview", "Engineering Problems", "Workflow"]);

        await page.goto("/systems/formkit-legacy");
        expect(await tabNames(page)).toEqual(["Overview", "Releases"]);
    });

    test("returns a real 404 for an unknown system", async ({ page }) => {
        const response = await page.goto("/systems/does-not-exist");
        expect(response?.status()).toBe(404);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Route not found");
    });

    test("header shows status and links, and hides the repo link when private", async ({ page }) => {
        await page.goto("/systems/atlas-membership");
        await expect(page).toHaveTitle("Atlas Membership — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Atlas Membership");
        await expect(page.getByRole("link", { name: "demo-labs/atlas-membership" })).toHaveAttribute(
            "href",
            "https://github.com/demo-labs/atlas-membership"
        );
        await expect(page.getByRole("link", { name: "atlas.example" })).toBeVisible();

        // docsmith is private: no repo link anywhere in the header
        await page.goto("/systems/docsmith");
        await expect(page.locator("main header a[href*='github.com']")).toHaveCount(0);
    });

    test("keeps the selected tab in the URL and opens a linked tab", async ({ page }) => {
        await page.goto("/systems/atlas-membership");
        await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");

        await page.getByRole("tab", { name: "Releases" }).click();
        await expect(page).toHaveURL(/\?tab=releases$/);
        await expect(page.getByRole("tabpanel", { name: "Releases" })).toBeVisible();

        await page.getByRole("tab", { name: "Overview" }).click();
        await expect(page).toHaveURL(/\/systems\/atlas-membership$/);

        await page.goto("/systems/atlas-membership?tab=problems");
        await expect(page.getByRole("tab", { name: "Engineering Problems" })).toHaveAttribute(
            "aria-selected",
            "true"
        );
        const cards = page.getByRole("tabpanel", { name: "Engineering Problems" }).locator("article");
        await expect(cards).toHaveCount(2);
        await expect(cards.first()).toContainText("Engineering problem #01");
        await expect(
            cards.first().getByRole("link", { name: /^Read problem/ })
        ).toHaveAttribute("href", "/systems/atlas-membership/problems/multi-membership");
    });

    test("overview shows the profile, architecture preview and recent work", async ({ page }) => {
        await page.goto("/systems/atlas-membership");
        const profile = page.getByRole("region", { name: "System profile" });
        await expect(profile).toContainText("Product Engineering · Architecture");
        await expect(profile).toContainText("v4.2.0");
        await expect(page.getByRole("region", { name: "Recent work" }).locator("li")).toHaveCount(3);

        // No metadata, no architecture: the rows that depend on them are absent.
        await page.goto("/systems/formkit-legacy");
        const bare = page.getByRole("region", { name: "System profile" });
        await expect(bare.locator("dt")).toHaveText(["Stack", "Created"]);
    });

    test("architecture: select a node, inspect it, and share the link", async ({ page }) => {
        await page.goto("/systems/atlas-membership?tab=architecture");
        const panel = page.getByRole("tabpanel", { name: "Architecture" });
        await expect(panel).toContainText("Select a node to inspect it.");

        // Arrow keys move focus between nodes; Enter selects.
        await panel.getByRole("button", { name: "Atlas", exact: true }).focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await expect(panel.getByRole("button", { name: "Payments" })).toBeFocused();
        await page.keyboard.press("Enter");

        await expect(page).toHaveURL(/tab=architecture&node=payments$/);
        await expect(panel.getByRole("button", { name: "Payments" })).toHaveAttribute("aria-pressed", "true");
        await expect(panel).toContainText("Inspecting · Payments");
        await expect(
            panel.getByRole("link", { name: "Double charges under concurrent checkout" })
        ).toHaveAttribute("href", "/systems/atlas-membership/problems/checkout-race");

        await page.goto("/systems/atlas-membership?tab=architecture&node=db");
        await expect(panel).toContainText("Inspecting · Database");
    });

    test("releases: rows newest first with the PRs merged before each", async ({ page }) => {
        await page.goto("/systems/atlas-membership?tab=releases");
        const rows = page.getByRole("tabpanel", { name: "Releases" }).locator("tbody tr");

        await expect(rows.locator("th")).toHaveText([
            /^v4\.3\.0-beta\.1\s*pre-release$/,
            "v4.2.0",
            "v4.1.0",
            "v4.0.0"
        ]);
        await expect(rows.nth(1)).toContainText("Add the subscriptions table #380");
        // The hidden PR (#405) is not listed anywhere.
        await expect(page.getByRole("tabpanel", { name: "Releases" })).not.toContainText("#405");
    });

    test("workflow: selecting a step shows its detail and highlights its node", async ({ page }) => {
        await page.goto("/systems/relay-qa?tab=workflow");
        const panel = page.getByRole("tabpanel", { name: "Workflow" });

        await expect(panel.getByRole("button", { name: /^01\s*Record/ })).toHaveAttribute("aria-pressed", "true");
        await panel.getByRole("button", { name: /^03\s*Repair/ }).click();
        await expect(panel).toContainText("Step 03 · Repair");
        await expect(panel).toContainText("pick the best match from the snapshot");

        // README sections, in display order.
        await expect(panel.locator("h2")).toHaveText([
            "Steps",
            "Why I built it",
            "What works",
            "What doesn't (yet)",
            "Lessons"
        ]);
    });
});
