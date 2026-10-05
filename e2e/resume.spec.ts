import { expect, test } from "@playwright/test";

// Mock fixtures: four systems, two highlighted log entries, seven timeline years.

test.describe("resume", () => {
    test("is composed from the profile, systems, highlights and timeline", async ({ page }) => {
        await page.goto("/resume");
        await expect(page).toHaveTitle("Résumé — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Demo Developer");

        const resume = page.getByRole("article");
        await expect(resume).toContainText("Software Engineer / Product Builder");
        await expect(resume).toContainText("Example City, EX");
        // Links are written out, so they survive on paper.
        await expect(resume.getByRole("link", { name: "github.com/demo-dev" })).toHaveAttribute(
            "href",
            "https://github.com/demo-dev"
        );
        await expect(resume).toContainText("7 years of production engineering");
        await expect(resume).toContainText("6 developers led");

        const systems = resume.getByRole("region", { name: "Systems" });
        await expect(systems.getByRole("heading", { level: 3 })).toHaveCount(4);
        await expect(systems.getByRole("heading", { level: 3 }).first()).toHaveText(
            "Atlas Membership — WordPress Product"
        );
        await expect(systems).toContainText("Product Engineering · Architecture");
        await expect(systems).toContainText("Evolving a legacy data model without breaking existing sites");

        const highlights = resume.getByRole("region", { name: "Highlights" });
        await expect(highlights.getByRole("listitem")).toHaveCount(2);
        await expect(highlights.getByRole("link", { name: "Make webhook activation idempotent" })).toHaveAttribute(
            "href",
            "/log/23"
        );

        const timeline = resume.getByRole("region", { name: "Timeline" });
        await expect(timeline.getByRole("listitem")).toHaveCount(7);
        await expect(timeline.getByRole("listitem").first()).toContainText("2026");
        await expect(timeline.getByRole("listitem").first()).toContainText("shipped Atlas Membership v4.2.0");
    });

    test("prints as a light page without the site chrome", async ({ page }) => {
        // The site opens in dark mode; paper must not.
        await page.goto("/resume");
        await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
        await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();

        await page.emulateMedia({ media: "print" });
        await expect(page.getByRole("button", { name: "Download PDF" })).toBeHidden();
        await expect(page.locator("header").first()).toBeHidden();
        await expect(page.locator("footer")).toBeHidden();
        await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(23, 23, 26)");
    });

    test("the button opens the print dialog", async ({ page }) => {
        await page.goto("/resume");
        await page.evaluate(() => {
            window.print = () => document.body.setAttribute("data-printed", "yes");
        });
        await page.getByRole("button", { name: "Download PDF" }).click();
        await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
    });

    test("is linked from the home page", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "View resume" }).click();
        await expect(page).toHaveURL(/\/resume$/);
    });
});
