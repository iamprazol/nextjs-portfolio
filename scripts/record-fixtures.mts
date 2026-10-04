/**
 * Writes the fixtures GITHUB_MOCK=1 replays, by running every getter with a
 * recording transport.
 *
 *   npm run fixtures:demo     fictional account → src/lib/github/fixtures (committed)
 *   npm run fixtures:record   your real account → src/lib/github/fixtures.local (git-ignored)
 *
 * A recording of a real account can contain private repository names, so it
 * goes to a git-ignored folder; set GITHUB_FIXTURES_DIR to that folder to
 * replay it. Only response bodies are stored — never headers or the token.
 *
 * Re-run `fixtures:demo` whenever a query document or its variables change:
 * fixtures are matched by a hash of both.
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const demo = process.argv.includes("--demo");

try {
    process.loadEnvFile(".env.local");
} catch {
    // No .env.local: rely on the environment.
}
process.env.GITHUB_MOCK = "0";
if (demo) process.env.GITHUB_LOGIN ||= "demo-dev";

const outDir = path.resolve(demo ? "src/lib/github/fixtures" : "src/lib/github/fixtures.local");

const { liveTransport, recordingTransport, setTransport } = await import(
    "../src/lib/github/client"
);
const { getConfig, setConfig } = await import("../src/lib/github/config");
const { runAll } = await import("./fixtures/run-all.mts");

let inner = liveTransport;
if (demo) {
    const { DEMO_CONFIG, DEMO_NOW, demoTransport } = await import("./fixtures/demo-world.mts");
    setConfig({ ...DEMO_CONFIG, now: () => DEMO_NOW });
    inner = demoTransport;
}

// Clear old fixtures so renamed queries do not leave stale files behind.
await mkdir(outDir, { recursive: true });
for (const file of await readdir(outDir)) {
    if (file.endsWith(".json")) await rm(path.join(outDir, file));
}

const config = getConfig();
const recordedAt = config.now();
setConfig({ ...config, now: () => recordedAt });
setTransport(recordingTransport(inner, outDir));

console.log(await runAll());

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

const count = (await readdir(outDir)).length;
console.log(`${count} files written to ${path.relative(process.cwd(), outDir)}`);
