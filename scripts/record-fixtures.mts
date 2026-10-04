/**
 * Records every GitHub response the data layer needs as fixtures for
 * GITHUB_MOCK=1.
 *
 *   npm run fixtures:record   real API → src/lib/github/fixtures.local (git-ignored)
 *
 * Recordings of your real account can contain private repository names, so
 * they are written to a git-ignored folder. Point GITHUB_FIXTURES_DIR at it to
 * replay them. Only response bodies are stored — never headers or the token.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

try {
    process.loadEnvFile(".env.local");
} catch {
    // No .env.local: rely on the environment.
}
process.env.GITHUB_MOCK = "0";

const outDir = path.resolve("src/lib/github/fixtures.local");

const { liveTransport, recordingTransport, setTransport } = await import(
    "../src/lib/github/client"
);
const { getConfig } = await import("../src/lib/github/config");
const { runAll } = await import("./fixtures/run-all.mts");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const config = getConfig();
const recordedAt = config.now();
setTransport(recordingTransport(liveTransport, outDir));

await runAll();

await writeFile(
    path.join(outDir, "meta.json"),
    JSON.stringify(
        {
            recordedAt: recordedAt.toISOString(),
            login: config.login,
            owners: config.owners,
            contentRepo: `${config.contentRepo.owner}/${config.contentRepo.name}`
        },
        null,
        2
    ) + "\n"
);

console.log(`Fixtures written to ${path.relative(process.cwd(), outDir)}`);
