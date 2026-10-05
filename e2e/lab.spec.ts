import { expect, test } from "@playwright/test";

// Mock fixtures: two experiments, vector-notes (topics embeddings, sqlite) and
// tiny-shell (topic cli); the owner is learning Rust and Python.

test.describe("lab", () => {
    test("groups experiments by their first topic, most recently pushed first", async ({ page }) => {
        await page.goto("/lab");
        await expect(page).toHaveTitle("Experiments — Demo Developer");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experiments");
        await expect(page.getByRole("heading", { level: 2 })).toHaveText([
            "embeddings",
            "cli",
            "Learning now",
            "~/demo — try a command"
        ]);

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

test.describe("lab terminal", () => {
    const setup = async (page: import("@playwright/test").Page) => {
        await page.goto("/lab");
        const terminal = page.getByRole("region", { name: "~/demo — try a command" });
        const input = terminal.getByLabel("Command", { exact: true });
        const output = terminal.getByRole("log", { name: "Terminal output" });
        const run = async (command: string) => {
            await input.fill(command);
            await input.press("Enter");
        };
        return { terminal, input, output, run };
    };

    test("answers commands from the portfolio's data", async ({ page }) => {
        const { output, run, input } = await setup(page);
        await expect(output).toHaveAttribute("aria-live", "polite");

        await run("projects");
        await expect(input).toHaveValue("");
        await expect(output.getByRole("link", { name: "relay-qa" })).toHaveAttribute("href", "/systems/relay-qa");
        await expect(output).toContainText("Relay QA · Building");
        await expect(output).toContainText("Atlas Membership · Production");

        await run("log");
        await expect(output.getByRole("link", { name: /^#24 Retry a repaired selector/ })).toHaveAttribute(
            "href",
            "/log/24"
        );
        await expect(output.getByRole("link", { name: /^#\d+ |^v\d/ })).toHaveCount(5);

        await run("now");
        await expect(output).toContainText(/building\s+Relay QA/);
        await expect(output).toContainText(/learning\s+Rust, Python/);
        await expect(output).toContainText(/exploring\s+agents, llm/);

        await run("experiments");
        await expect(output.getByRole("link", { name: "tiny-shell" })).toHaveAttribute(
            "href",
            "https://github.com/demo-dev/tiny-shell"
        );

        await run("stack");
        await expect(output).toContainText(/PHP · /);

        await run("contact");
        await expect(output.getByRole("link", { name: "github.com/demo-dev" })).toHaveAttribute(
            "href",
            "https://github.com/demo-dev"
        );
    });

    test("reports unknown commands and clears the screen", async ({ page }) => {
        const { output, run } = await setup(page);

        await run("deploy now");
        await expect(output).toContainText("command not found: deploy — try help");

        await run("help");
        await expect(output).toContainText("open <system>");

        await run("clear");
        await expect(output).toBeEmpty();
    });

    test("recalls earlier commands with the arrow keys", async ({ page }) => {
        const { input, run } = await setup(page);
        await run("stack");
        await run("now");

        await input.press("ArrowUp");
        await expect(input).toHaveValue("now");
        await input.press("ArrowUp");
        await expect(input).toHaveValue("stack");
        await input.press("ArrowUp");
        await expect(input).toHaveValue("stack");
        await input.press("ArrowDown");
        await expect(input).toHaveValue("now");
        await input.press("ArrowDown");
        await expect(input).toHaveValue("");
    });

    test("runs quick commands from the buttons, including the theme switch", async ({ page }) => {
        const { terminal, output } = await setup(page);
        const quick = terminal.getByRole("list", { name: "Quick commands" });

        await quick.getByRole("button", { name: "projects" }).click();
        await expect(output).toContainText("Relay QA · Building");

        // The site opens in dark mode.
        await expect(page.locator("html")).toHaveClass(/dark/);
        await quick.getByRole("button", { name: "theme" }).click();
        await expect(page.locator("html")).toHaveClass(/light/);
        await expect(output).toContainText("theme: light");
    });

    test("open <system> goes to the system, by slug or by name", async ({ page }) => {
        const { output, run } = await setup(page);

        await run("open nothing");
        await expect(output).toContainText("open: no system named nothing — try projects");

        await run("open Relay QA");
        await expect(page).toHaveURL(/\/systems\/relay-qa$/);
    });
});
