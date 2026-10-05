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
});
