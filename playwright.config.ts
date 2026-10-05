import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;

// End-to-end tests run against the dev server in mock mode: the fictional
// account in src/lib/github/fixtures, no network, and the dev-only /_data page
// available to compare against.
export default defineConfig({
    testDir: "e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    // The dev server compiles each route on first visit; under parallel load
    // that occasionally fails a request once. A retry tells that apart from a
    // real failure, which fails every time.
    retries: process.env.CI ? 2 : 1,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: process.env.CI ? "retain-on-failure" : "off"
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `npx next dev --turbopack -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        // WP_API_KEY is blanked so a test can never deliver a real contact message.
        env: {
            GITHUB_MOCK: "1",
            GITHUB_LOGIN: "demo-dev",
            WP_API_KEY: "",
            // Known secrets, so tests can sign requests to /api/revalidate.
            GITHUB_WEBHOOK_SECRET: "e2e-webhook-secret",
            CRON_SECRET: "e2e-cron-secret"
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
