import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;

// End-to-end tests run against the dev server in mock mode: the fictional
// account in src/lib/github/fixtures, no network, and the dev-only /_data page
// available to compare against.
export default defineConfig({
    testDir: "e2e",
    fullyParallel: true,
    reporter: "list",
    use: { baseURL: `http://localhost:${PORT}` },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `npx next dev --turbopack -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        env: { GITHUB_MOCK: "1", GITHUB_LOGIN: "demo-dev" },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
