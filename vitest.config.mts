import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
            "server-only": path.resolve(import.meta.dirname, "test/stubs/server-only.ts")
        }
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        // Tests never talk to GitHub: mock mode reads the committed fixtures.
        env: {
            GITHUB_LOGIN: "demo-dev",
            GITHUB_MOCK: "1"
        },
        coverage: {
            provider: "v8",
            enabled: true,
            reporter: ["text"],
            // The derivation rules are the contract with the design: keep them covered.
            include: ["src/lib/github/derive.ts"],
            thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 }
        }
    }
});
