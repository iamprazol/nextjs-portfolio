# Architecture

## 1. Stack decisions

| Area | Current | New | Why |
| --- | --- | --- | --- |
| Framework | Next.js 15.5 App Router, one client page | Next.js 15 App Router, **Server Components by default**, multi-route | GitHub fetching happens on the server with a secret token; pages are cached and revalidated |
| Styling | Chakra UI v2 + Emotion | **Tailwind CSS v4 + CSS custom properties** (tokens in `DESIGN-TOKENS.md`) | The design is token-driven (two themes, one variable set). Chakra v2 + Emotion forces `"use client"` on most of the tree, which fights server-side GitHub data |
| Theme | Chakra `useColorMode` | **`next-themes`** with `class` strategy (`.light` / `.dark` on `<html>`) | No flash on load, works with server components, persists choice |
| Fonts | Geist via `next/font` (already set up) | Keep Geist + Geist Mono | Matches the design |
| Data | Arrays in components | **`src/lib/github/`** — typed GitHub GraphQL + REST layer | Single source of truth |
| Markdown | — | `gray-matter` + `remark`/`rehype` (or `next-mdx-remote/rsc`) | Case studies live as markdown in GitHub |
| Validation | — | `zod` | Every `.portfolio` file from GitHub is validated; invalid files are skipped and logged, never crash the build |
| Contact | `/api/contact` → wpmake Everest Forms | **Keep as is** | Already working |
| Tests | — | `vitest` for the data layer, Playwright smoke tests for pages | Derivation rules must be tested against fixtures |

Chakra is removed in milestone M01 after the new primitives exist, so the old site keeps building until then.

## 2. Routes

| Route | Page | Data source |
| --- | --- | --- |
| `/` | Home | `getProfile`, `getSystems`, `getNow`, `getLog({limit:3})`, `getActivity` |
| `/systems` | Systems index + status filter | `getSystems()` |
| `/systems/[slug]` | System profile (overview, architecture, problems, releases, workflow) | `getSystem(slug)` |
| `/systems/[slug]/problems/[problem]` | Engineering problem case study | `getProblem(slug, problem)` |
| `/log` | Engineering log | `getLog()` |
| `/log/[number]` | Single log entry (optional, M09) | `getLogEntry(n)` |
| `/timeline` | Engineering timeline by year | `getTimeline()` |
| `/lab` | Experiments + terminal | `getExperiments()`, `getNow()` |
| `/about` | About, how I work, tools | `getProfile()`, `getToolUsage()` |
| `/resume` | Printable résumé generated from the same data | all of the above |
| `/api/contact` | existing | — |
| `/api/revalidate` | GitHub webhook receiver | — |
| `/log/rss.xml`, `/sitemap.xml`, `/opengraph-image` | feeds/SEO | data layer |

## 3. GitHub as the CMS

Two kinds of data come from GitHub:

**A. Derived data (zero writing)** — computed from what you already do on GitHub:
repos, topics, languages, commits, PRs, releases, contribution calendar, stars.

**B. Narrative data (written once, in GitHub, not here)** — things GitHub cannot know, such as
your role, a case study's trade-offs, or an architecture diagram. These live as files in a
GitHub repo and are fetched at build/revalidate time. Editing them never touches this codebase.

### 3.1 Content repository

`GITHUB_CONTENT_REPO` (default: `iamprazol/iamprazol`, your profile-README repo) holds a
`portfolio/` folder:

```
portfolio/
  profile.json              # name, headline, location, links, how-I-work steps, leadership facts
  systems/<slug>.json       # only for repos you can't add files to (e.g. org-owned products)
  systems/<slug>/problems/*.md
  systems/<slug>/architecture.json
  timeline/<year>.md        # optional narrative for a year; numbers still come from GitHub
```

### 3.2 Per-repo metadata (for repos you own)

A repo becomes a **System** when it has the topic `portfolio-system`, and an **Experiment** when it
has `portfolio-lab`. Optional richer data lives in the repo itself:

```
.portfolio/
  system.json               # role, kind ("WordPress Product"), proves, featured order
  architecture.json         # nodes + edges for the interactive diagram
  workflow.json             # ordered steps (ClaudeGrill-style workflow pages)
  problems/<slug>.md        # engineering problem case studies (frontmatter + markdown)
```

If both the repo and the content repo describe the same system, **repo files win** and the content-repo
file fills missing keys only.

### 3.3 Schemas (zod, in `src/lib/github/schemas.ts`)

```ts
SystemMeta = {
  slug: string,                     // defaults to repo name kebab-cased
  name?: string,                    // defaults to repo name
  kind: string,                     // "WordPress Product", "AI QA Framework"
  role?: string[],                  // ["Product Engineering", "Architecture"]
  proves?: string,                  // one line: what this system demonstrates
  repo?: string,                    // "owner/name" — required in content-repo files
  order?: number,                   // featured order on home
  status?: "production"|"building"|"active"|"experiment"|"maintenance" // override only
}
ProblemFrontmatter = {
  number: number, title: string, summary: string,
  role?: string[], tradeoffs?: string[], result?: string[],
  constraints?: string[], relatedPRs?: number[], date?: string,
  nodes?: string[],                 // ids of architecture nodes this problem is about
  diagrams?: { before?: Diagram, after?: Diagram }
}
Diagram = { nodes: {id, label, group?, detail?}[], edges: {from, to}[] }
Workflow = { steps: {title, subtitle, detail, node?: string}[], nodes: Diagram["nodes"], edges: Diagram["edges"] }
Profile = {
  name, headline, intro, location: {label, lat, lng},
  links: {github, linkedin?, x?, email?},
  howIWork: string[],
  leadership?: { developersLed?: number, since?: string }   // shown only if present
}
```

## 4. Derivation rules (implemented in `src/lib/github/derive.ts`, unit-tested)

| UI value | Rule |
| --- | --- |
| **System status** | `archived` → hidden. Topic `portfolio-lab` → **Experiment**. Latest non-prerelease release within 12 months → **Production**. Else pushed within 30 days → **Building**. Else pushed within 120 days → **Active**. Else **Maintenance**. `system.json.status` overrides. |
| **Stack tags** | Top 4 languages by bytes (GraphQL `languages`) + repo topics except `portfolio-*` |
| **Years of production engineering** | Current year − first year with contributions (`contributionsCollection` per year, earliest non-zero) |
| **Products count** | Number of Systems |
| **Developers led** | `profile.leadership.developersLed` only — omitted if absent (GitHub can't know it) |
| **PRs merged** (secondary stat) | Count of merged PRs authored by you in System repos |
| **Engineering Log entries** | Merged PRs authored by you in System + Lab repos, newest first. Numbered `#N` by merge order across all repos. Label `portfolio:hide` excludes; label `portfolio:highlight` pins. Title = PR title, summary = first paragraph of PR body (markdown stripped, 200 chars). Tag = system name. Releases appear as entries of type `release`. |
| **Currently building** | System or Lab repo with most commits by you in the last 14 days |
| **Currently learning** | Languages in your commits of the last 90 days that had < 5% share in the 365 days before |
| **Currently exploring** | Most common topics across repos you starred in the last 60 days (top 2) |
| **Timeline years** | One entry per year with contributions: commits, PRs, reviews, repos contributed to, top languages, repos created, releases shipped. Optional title/body from `timeline/<year>.md`; otherwise title = the repo with most commits that year. |
| **Recent activity** | Last 5 public push/PR/release events (REST `GET /users/{login}/events/public`), grouped by repo, latest commit message |
| **Tools tied to work** | Languages + topics aggregated across Systems, each linked to the systems that use it |
| **Résumé** | Composed from Profile + Systems + Timeline + Log highlights |

## 5. Data layer layout

```
src/lib/github/
  client.ts        # graphql() + rest() with GITHUB_TOKEN, retries, rate-limit logging
  queries.ts       # GraphQL documents
  schemas.ts       # zod schemas
  content.ts       # read files from content repo and .portfolio/ folders
  derive.ts        # pure functions — all rules from §4
  index.ts         # public API: getProfile, getSystems, getSystem, getProblem, getLog,
                   # getTimeline, getNow, getActivity, getExperiments, getToolUsage
  fixtures/        # recorded JSON responses for tests + offline dev (GITHUB_MOCK=1)
```

Every public function is wrapped with `unstable_cache` (or `fetch` with `next: { tags }`) and
tagged: `gh:profile`, `gh:systems`, `gh:system:<slug>`, `gh:log`, `gh:timeline`, `gh:activity`.

## 6. Freshness

- **ISR**: pages export `revalidate = 3600`.
- **Webhook**: a GitHub webhook (push, pull_request, release, repository) on System repos and the
  content repo calls `/api/revalidate`. The route verifies `X-Hub-Signature-256` with
  `GITHUB_WEBHOOK_SECRET`, maps the repo to its tags and calls `revalidateTag`.
- **Cron fallback**: Vercel cron hits `/api/revalidate?all=1` (bearer `CRON_SECRET`) daily for
  activity/"now" data, which changes without webhooks.
- **Failure mode**: if GitHub is down at revalidate time, Next keeps serving the last good page.
  If GitHub is down on a cold build, the fixtures snapshot is **not** used in production —
  the build fails loudly instead of shipping fake data.

## 7. Environment

| Var | Purpose |
| --- | --- |
| `GITHUB_LOGIN` | `iamprazol` |
| `GITHUB_TOKEN` | Fine-grained PAT, read-only: Contents, Metadata, Pull requests on selected repos (incl. org repos if allowed) |
| `GITHUB_CONTENT_REPO` | `iamprazol/iamprazol` |
| `GITHUB_SYSTEM_OWNERS` | Comma list of owners searched for topic `portfolio-system`, e.g. `iamprazol,themegrill` |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret |
| `CRON_SECRET` | Vercel cron bearer |
| `GITHUB_MOCK` | `1` = use fixtures (dev/tests only) |
| `WP_API_KEY` | existing contact form key |

## 8. Known issue to fix first

`vercel.json` only builds `main` and `develop`, but this repo's default branch is **`master`**
(and the last commit message says "develop or master"). As written, production pushes to `master`
are skipped. M00 step 3 fixes this.
