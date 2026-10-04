# nextjs-portfolio

Engineering portfolio whose work data is fetched from GitHub. The redesign is in progress on
`design-update`. **Read `docs/redesign/` before changing anything** — start with `README.md` and
`ARCHITECTURE.md`; `MILESTONES.md` and `PROGRESS.md` say what is built and what is next.

## Stack

Next.js 15 App Router (Server Components by default), React 19, TypeScript, Tailwind CSS v4 with CSS
custom-property tokens, `next-themes`, `zod`, Octokit (GraphQL + REST), remark/rehype for markdown.
Tests: `vitest` for the data layer, Playwright for pages.

## Folder map

| Path | What lives there |
| --- | --- |
| `src/app/` | Routes, layouts, API handlers. `%5Ftokens/`, `%5Fui/` and `%5Fdata/` are dev-only pages at `/_tokens`, `/_ui` and `/_data` |
| `src/components/ui/` | Design-system primitives (`Panel`, `Tag`, `Button`, …); `ui/diagram/` for diagrams |
| `src/components/shell/` | Nav bar, footer, command palette (⌘K) and the error state shown when GitHub fails |
| `src/components/<page>/` | Sections for one page (`home/`, `systems/`, `log/`, …) |
| `src/lib/github/` | Data layer. Pages import only from `@/lib/github` (`index.ts`: cached `get*` functions and types) |
| `src/env.ts` | Typed, server-only environment. Never read `process.env` elsewhere |
| `docs/redesign/` | Architecture, design tokens, milestones, step prompts |

Import with the `@/*` alias (`@/lib/github`, `@/components/ui/Panel`).

## Data layer

`client` (Octokit, retries, mock mode) → `sources` (one fetch per GitHub source) + `content`
(files written on GitHub) → `derive` (pure rules from `ARCHITECTURE.md` §4, tested) → `data`
(composition) → `index` (`unstable_cache`, tags).

- New rule or changed rule: edit `derive.ts` and its table-driven test. Coverage on `derive.ts` is
  enforced at 90%.
- `GITHUB_MOCK=1` replays `src/lib/github/fixtures/`, a **fictional** account generated from
  `scripts/fixtures/demo-world.mts`. Fixtures are matched by a hash of query + variables, so after
  changing a query or the demo world run `npm run fixtures:demo` and commit the result.
- `npm run fixtures:record` records your real account into `fixtures.local/` (git-ignored — it can
  contain private repo names). Never commit real recordings.
- In domain types `null` means GitHub could not provide the value: hide the element.

## Ground rules

- **No hardcoded work data.** Projects, statuses, log entries, timeline, skills, stats and activity
  come from `src/lib/github/*`. Only UI copy (labels, headings) is static.
- **Unverifiable = hidden.** If GitHub can't provide a value, omit the element. Never invent a number.
- **Both themes.** Check every component in light and dark, at 1440px and 390px.
- **Token colors only.** Style with the tokens in `src/app/globals.css` (`bg-panel`, `text-ink-2`, …).
  The default Tailwind palette is disabled; don't add raw hex values in components.
- **Real 404s.** The root `loading.tsx` wraps pages in Suspense, so `notFound()` called inside a
  page is served with status 200. For a true 404, decide before the page renders (unmatched route,
  `generateStaticParams`, or `src/middleware.ts` as the dev-only pages do).
- **Small commits.** One step prompt = one commit, using the message given in the step. Tick the
  step in `docs/redesign/PROGRESS.md` in the same commit.

## Commits

- **No AI co-author or attribution.** Never add `Co-Authored-By: Claude …` trailers,
  "Generated with Claude Code" lines, or any other AI attribution to commit messages or PR
  descriptions. Commits are authored by the repo owner only.

## Commands

```
npm run dev         # dev server
npm run build       # production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest (with coverage thresholds)
npm run test:e2e    # playwright
npm run fixtures:demo     # regenerate the committed mock fixtures
npm run fixtures:record   # record your real account into fixtures.local/
GITHUB_MOCK=1 npm run dev # run against fixtures, no network
```

Formatting follows `.prettierrc`: 4-space indent, double quotes, no trailing commas.
