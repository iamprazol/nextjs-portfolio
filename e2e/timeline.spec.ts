import { expect, test } from "@playwright/test";

// Mock fixtures: contributions in 2019, 2020 and 2022–2026 (none in 2021).
// 2024 has a note in the content repo; the clock is 1 Oct 2026.

test.describe("timeline", () => {
    test("lists the years with contributions, newest first and selected", async ({ page }) => {
        await page.goto("/timeline");
        await expect(page).toHaveTitle("Engineering Timeline — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Engineering Timeline");

        const years = page.getByRole("list", { name: "Years" }).getByRole("button");
        await expect(years).toHaveText([/^2026/, /^2025/, /^2024/, /^2023/, /^2022/, /^2020/, /^2019/]);
        await expect(years.nth(0)).toHaveAttribute("aria-current", "true");
        await expect(years.nth(1)).not.toHaveAttribute("aria-current");

        // Title and subtitle come from the year's note, else from GitHub.
        await expect(years.nth(2)).toContainText("The multi-membership rewrite");
        await expect(years.nth(2)).toContainText("Most of the year went into replacing");
        await expect(years.nth(0)).toContainText("Relay QA");
        await expect(years.nth(0)).toContainText("885 contributions");
    });

    test("keeps the selected year in the URL", async ({ page }) => {
        await page.goto("/timeline");
        const years = page.getByRole("list", { name: "Years" });

        await years.getByRole("button", { name: /^2024/ }).click();
        await expect(page).toHaveURL(/\/timeline\?year=2024$/);
        await expect(years.getByRole("button", { name: /^2024/ })).toHaveAttribute("aria-current", "true");
        await expect(years.getByRole("button", { name: /^2026/ })).not.toHaveAttribute("aria-current");

        // The latest year is the default, so it needs no parameter.
        await years.getByRole("button", { name: /^2026/ }).click();
        await expect(page).toHaveURL(/\/timeline$/);
    });

    test("opens on the year in the URL and falls back to the latest", async ({ page }) => {
        await page.goto("/timeline?year=2022");
        const years = page.getByRole("list", { name: "Years" });
        await expect(years.getByRole("button", { name: /^2022/ })).toHaveAttribute("aria-current", "true");

        // 2021 had no contributions, so it is not a year on the rail.
        await page.goto("/timeline?year=2021");
        await expect(years.getByRole("button", { name: /^2026/ })).toHaveAttribute("aria-current", "true");
    });

    test("shows the selected year's narrative, key work, numbers and release", async ({ page }) => {
        await page.goto("/timeline");
        const detail = page.getByRole("region", { name: "Relay QA" });
        await expect(detail).toContainText("2026 · in progress");

        // Systems link to their page; experiments are named without a link.
        const keyWork = detail.getByRole("region", { name: "Key work" });
        await expect(keyWork.getByRole("listitem")).toHaveText([
            /Relay QA\s*310 commits/,
            /Atlas Membership\s*280 commits/,
            /tiny-shell\s*31 commits/,
            /vector-notes\s*22 commits/
        ]);
        await expect(keyWork.getByRole("link", { name: "Relay QA" })).toHaveAttribute("href", "/systems/relay-qa");
        await expect(keyWork.getByRole("link", { name: "tiny-shell" })).toHaveCount(0);

        await expect(detail.getByRole("region", { name: "Technologies" }).getByRole("listitem")).toHaveText([
            "TypeScript",
            "PHP",
            "Rust"
        ]);
        await expect(detail.getByRole("region", { name: "Numbers" }).locator("dd")).toHaveText(["643", "67", "175", "4"]);

        const release = detail.getByRole("region", { name: "Notable release" });
        await expect(release).toContainText("v4.2.0");
        await expect(release).toContainText("4.2 — faster checkout");
        await expect(release.getByRole("link", { name: "Atlas Membership" })).toHaveAttribute(
            "href",
            "/systems/atlas-membership"
        );
        await expect(release.getByRole("link", { name: /Release notes on GitHub/ })).toHaveAttribute(
            "href",
            "https://github.com/demo-labs/atlas-membership/releases/tag/v4.2.0"
        );

        await expect(
            detail.getByRole("img", { name: "Contribution calendar for 2026: 885 contributions so far." })
        ).toBeVisible();
    });

    test("changes the detail with the year and hides what GitHub cannot provide", async ({ page }) => {
        await page.goto("/timeline");
        await page.getByRole("list", { name: "Years" }).getByRole("button", { name: /^2024/ }).click();

        const detail = page.getByRole("region", { name: "The multi-membership rewrite" });
        await expect(detail).toContainText("Planned the migration in the spring");
        await expect(detail.getByRole("img", { name: "Contribution calendar for 2024: 1,130 contributions." })).toBeVisible();
        // No stable system release in 2024, so there is no such block.
        await expect(detail.getByRole("region", { name: "Notable release" })).toHaveCount(0);

        // 2025's release is in a private repo: named, with no GitHub link.
        await page.goto("/timeline?year=2025");
        const release = page.getByRole("region", { name: "Notable release" });
        await expect(release).toContainText("v1.0.0");
        await expect(release.getByRole("link", { name: "DocSmith" })).toHaveAttribute("href", "/systems/docsmith");
        await expect(release.locator("a[href*='github.com']")).toHaveCount(0);
    });
});
