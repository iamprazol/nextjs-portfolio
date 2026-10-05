import { expect, test } from "@playwright/test";

// Mock fixtures: two experiments, vector-notes (topics embeddings, sqlite) and
// tiny-shell (topic cli); the owner is learning Rust and Python.

test.describe("lab", () => {
    test("groups experiments by their first topic, most recently pushed first", async ({ page }) => {
        await page.goto("/lab");
        await expect(page).toHaveTitle("Experiments — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experiments");
        await expect(page.getByRole("heading", { level: 2 })).toHaveText(["embeddings", "cli", "Learning now"]);

        const group = page.getByRole("region", { name: "embeddings" });
        await expect(group.getByRole("link", { name: "vector-notes" })).toHaveAttribute(
            "href",
            "https://github.com/demo-dev/vector-notes"
        );
        await expect(group).toContainText("Local semantic search over markdown notes");
        await expect(group.locator("time")).toHaveAttribute("datetime", /^2026-09-22T/);

        await expect(page.getByRole("region", { name: "cli" })).toContainText("A shell in 500 lines");
    });

    test("shows what the owner is learning now", async ({ page }) => {
        await page.goto("/lab");
        await expect(page.getByRole("region", { name: "Learning now" }).getByRole("listitem")).toHaveText([
            "Rust",
            "Python"
        ]);
    });

    test("is where the home page sends 'currently learning'", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("region", { name: "Now" }).getByRole("link", { name: "Rust" }).click();
        await expect(page).toHaveURL(/\/lab$/);
    });
});
