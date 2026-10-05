import { expect, test } from "@playwright/test";

import { ROUTES, THEMES } from "./routes";

// Every route, in both themes, at desktop and phone width: it answers with the
// right status, shows its heading in the chosen theme, logs nothing to the
// console and does not scroll sideways.

const VIEWPORTS = [
    { name: "1440", width: 1440, height: 900 },
    { name: "390", width: 390, height: 844 }
];
const MISSING = "/this-page-does-not-exist";

for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
        test.describe(`smoke, ${theme} theme, ${viewport.name}px`, () => {
            test.use({ viewport: { width: viewport.width, height: viewport.height } });
            test.beforeEach(async ({ page }) => {
                await page.addInitScript((value) => localStorage.setItem("pp-theme", value), theme);
            });

            for (const route of ROUTES) {
                test(route, async ({ page }) => {
                    const issues: string[] = [];
                    page.on("console", (message) => {
                        if (message.type() === "error" || message.type() === "warning") issues.push(message.text());
                    });
                    page.on("pageerror", (error) => issues.push(String(error)));

                    const response = await page.goto(route);
                    expect(response?.status()).toBe(route === MISSING ? 404 : 200);

                    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
                    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
                    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
                    await expect(page.getByRole("contentinfo")).toBeVisible();

                    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
                    expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);

                    // The browser itself reports the 404 response as a console error.
                    expect(route === MISSING ? [] : issues).toEqual([]);
                });
            }
        });
    }
}
