import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ROUTES, THEMES } from "./routes";

// axe on every route in both themes. Serious and critical findings fail the
// build; contrast (4.5:1) is one of the rules, which is why both themes run.

for (const theme of THEMES) {
    test.describe(`axe, ${theme} theme`, () => {
        test.beforeEach(async ({ page }) => {
            await page.addInitScript((value) => localStorage.setItem("pp-theme", value), theme);
        });

        for (const route of ROUTES) {
            test(route, async ({ page }) => {
                await page.goto(route);
                await expect(page.locator("html")).toHaveClass(new RegExp(theme));
                // The body cross-fades between themes; measure colours once it has settled.
                await page.waitForTimeout(350);

                const { violations } = await new AxeBuilder({ page })
                    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
                    // Next's dev-mode overlay is not part of the site.
                    .exclude("nextjs-portal")
                    .analyze();

                const blocking = violations
                    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
                    .map((violation) => ({
                        rule: violation.id,
                        help: violation.help,
                        nodes: violation.nodes.map((node) => `${node.target.join(" ")} — ${node.failureSummary?.split("\n")[1]?.trim()}`)
                    }));
                expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
            });
        }
    });
}

test.describe("keyboard", () => {
    /** The focused element shows a ring: an outline at least 2px wide. */
    const expectFocusRing = async (page: import("@playwright/test").Page) => {
        const outline = await page.evaluate(() => {
            const style = getComputedStyle(document.activeElement!);
            return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
        });
        expect(outline.style).not.toBe("none");
        expect(outline.width).toBeGreaterThanOrEqual(2);
    };

    test("skip link, then the navigation, each with a visible focus ring", async ({ page }) => {
        await page.goto("/");
        await page.keyboard.press("Tab");
        await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
        await expectFocusRing(page);

        // Past the logo to the first section link.
        const systems = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Systems" });
        for (let i = 0; i < 6 && !(await systems.evaluate((node) => node === document.activeElement)); i++) {
            await page.keyboard.press("Tab");
        }
        await expect(systems).toBeFocused();
        await expectFocusRing(page);
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/systems$/);
    });

    test("the skip link moves focus into the page", async ({ page }) => {
        await page.goto("/log");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        await expect(page.locator("main")).toBeFocused();
    });

    test("command palette opens, filters, runs and closes from the keyboard", async ({ page }) => {
        await page.goto("/");
        await page.keyboard.press("Control+k");
        const palette = page.getByRole("dialog", { name: "Command palette" });
        await expect(palette).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(palette).toBeHidden();

        await page.keyboard.press("Control+k");
        await page.keyboard.type("timeline");
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/timeline$/);
    });

    test("system tabs follow the arrow keys", async ({ page }) => {
        await page.goto("/systems/atlas-membership");
        const tabs = page.getByRole("tablist").getByRole("tab");
        await tabs.first().focus();
        await expectFocusRing(page);

        await page.keyboard.press("ArrowRight");
        await expect(tabs.nth(1)).toBeFocused();
        await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("End");
        await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Home");
        await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    });

    test("timeline years and terminal quick commands work with Enter", async ({ page }) => {
        await page.goto("/timeline");
        const year = page.getByRole("list", { name: "Years" }).getByRole("button", { name: /^2023/ });
        await year.focus();
        await expectFocusRing(page);
        await page.keyboard.press("Enter");
        await expect(year).toHaveAttribute("aria-current", "true");

        await page.goto("/lab");
        const terminal = page.getByRole("region", { name: /try a command/ });
        await terminal.getByRole("button", { name: "stack" }).focus();
        await expectFocusRing(page);
        await page.keyboard.press("Enter");
        await expect(terminal.getByRole("log")).toContainText("PHP");
    });
});

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("nothing animates or eases", async ({ page }) => {
        await page.goto("/");
        const durations = await page.evaluate(() =>
            [...document.querySelectorAll("body, body *")].map((node) => {
                const style = getComputedStyle(node);
                return Math.max(
                    ...style.transitionDuration.split(",").map(parseFloat),
                    ...style.animationDuration.split(",").map(parseFloat)
                );
            })
        );
        // Durations are in seconds: everything is at most the 0.01ms override.
        expect(Math.max(...durations)).toBeLessThanOrEqual(0.0001);
    });
});
