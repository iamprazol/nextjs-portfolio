import { expect, test } from "@playwright/test";

// Mock fixtures: "Demo Developer" in Example City, with an `about` text, a
// GitHub link and an email (no LinkedIn or X); building Relay QA.

test.describe("about", () => {
    test("introduces the owner from the profile", async ({ page }) => {
        await page.goto("/about");
        await expect(page).toHaveTitle("About — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            "Hi, I'm Demo — Software Engineer / Product Builder"
        );
        // The about markdown replaces the one-line intro.
        const hero = page.getByRole("region", { name: /^Hi, I'm Demo/ });
        await expect(hero.locator("strong")).toHaveText("fictional");
        await expect(hero).not.toContainText("Fictional profile used for local development");
    });

    test("links only to the places the profile has", async ({ page }) => {
        await page.goto("/about");
        const hero = page.getByRole("region", { name: /^Hi, I'm Demo/ });

        await expect(hero.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/demo-dev");
        await expect(hero.getByRole("link", { name: "Email" })).toHaveAttribute(
            "href",
            "mailto:demo@demo-dev.example"
        );
        await expect(hero.getByRole("link", { name: "LinkedIn" })).toHaveCount(0);
        await expect(hero.getByRole("link", { name: "X", exact: true })).toHaveCount(0);

        await hero.getByRole("link", { name: "Get in touch" }).click();
        await expect(page).toHaveURL(/\/about#contact$/);
        await expect(page.getByRole("region", { name: "Get in touch" })).toBeInViewport();
    });

    test("numbers the profile's working principles", async ({ page }) => {
        await page.goto("/about");
        const steps = page.getByRole("region", { name: "How I work" }).getByRole("listitem");
        await expect(steps).toHaveCount(4);
        await expect(steps.first()).toHaveText("01Understand the system before changing it");
        await expect(steps.last()).toHaveText("04Leave the code easier to change than I found it");
    });

    test("shows where, what now and interests in the aside", async ({ page }) => {
        await page.goto("/about");
        const aside = page.getByRole("complementary", { name: "At a glance" });

        await expect(aside.getByRole("heading", { level: 2 })).toHaveText(["Based in", "Currently", "Interests"]);
        await expect(aside).toContainText("Example City, EX");
        await expect(aside.getByRole("link", { name: "Relay QA" })).toHaveAttribute("href", "/systems/relay-qa");
        await expect(aside).toContainText("Learning Rust, Python");
        // Topics across systems and starred repos, most common first.
        await expect(aside.getByRole("listitem").first()).toHaveText("agents");
    });
});
