# M00 — Foundations & housekeeping

> **Paste this preamble before any step in this file:**
> You are working in the `nextjs-portfolio` repo on branch `design-update`. Read `docs/redesign/README.md`
> and `docs/redesign/ARCHITECTURE.md` first. Ground rules: no hardcoded work data; anything GitHub
> can't provide is hidden, never invented; both themes; one commit per step with the message given.

---

### Step 0.1 — Audit and isolate the old site

```
Move the current single-page site out of the way without deleting it:
- Create src/legacy/ and move src/components/* and src/theme/ there (update imports).
- Keep src/app/page.tsx rendering the legacy page for now so the site still builds.
- Add docs/redesign/LEGACY-INVENTORY.md listing every hardcoded data array in the legacy
  components (Projects, OtherProjects, Skills, WorkExperience, Hero) and, for each field,
  which GitHub source in ARCHITECTURE.md §4 replaces it — or "dropped" if none.
Acceptance: `npm run build` passes; inventory covers every array.
Commit: "chore: isolate legacy portfolio components"
```

### Step 0.2 — Dependencies and tooling

```
Install: tailwindcss@4 @tailwindcss/postcss next-themes zod gray-matter remark remark-gfm
rehype-sanitize rehype-stringify remark-rehype @octokit/graphql @octokit/rest cmdk
lucide-react clsx. Dev: vitest @vitest/coverage-v8 @playwright/test msw.
Add postcss.config.mjs for Tailwind v4. Add scripts: "test": "vitest run",
"test:e2e": "playwright test", "typecheck": "tsc --noEmit".
Do NOT remove Chakra yet (M01 removes it).
Acceptance: build, lint, typecheck pass.
Commit: "chore: add tailwind, next-themes, zod, octokit and test tooling"
```

### Step 0.3 — Fix Vercel branch config

```
vercel.json's ignoreCommand only builds "main" and "develop", but the default branch is "master".
Change it so production builds run for "master" and previews run for "design-update" and "develop";
everything else is skipped. Explain the change in the commit body.
Acceptance: the shell expression exits 1 (build) for master/design-update/develop and 0 otherwise —
add a tiny test script scripts/check-vercel-ignore.sh that proves it.
Commit: "fix(vercel): build master and design-update branches"
```

### Step 0.4 — Typed environment

```
Create src/env.ts using zod that parses and exports: GITHUB_LOGIN, GITHUB_TOKEN,
GITHUB_CONTENT_REPO (default "iamprazol/iamprazol"), GITHUB_SYSTEM_OWNERS (comma list → string[]),
GITHUB_WEBHOOK_SECRET, CRON_SECRET, GITHUB_MOCK (boolean), WP_API_KEY.
Server-only (import "server-only"). In production, missing GITHUB_TOKEN throws at build.
Add .env.example with every key and a comment, no values. Make sure .env.local stays git-ignored.
Acceptance: typecheck passes; importing env in a client component fails the build.
Commit: "feat: typed server environment"
```

### Step 0.5 — Project conventions

```
Add CLAUDE.md at repo root (short): stack, folder map (src/app routes, src/components/ui primitives,
src/components/<page> sections, src/lib/github data layer), the ground rules, and "read
docs/redesign/ before changing anything". Add the path alias "@/*" if missing.
Commit: "docs: add CLAUDE.md conventions"
```
