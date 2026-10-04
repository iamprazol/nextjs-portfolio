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
| `src/app/` | Routes, layouts, API handlers. `%5Ftokens/` and `%5Fui/` are dev-only galleries at `/_tokens` and `/_ui` |
| `src/components/ui/` | Design-system primitives (`Panel`, `Tag`, `Button`, …); `ui/diagram/` for diagrams |
| `src/components/<page>/` | Sections for one page (`home/`, `systems/`, `log/`, …) |
| `src/lib/github/` | Data layer: client, queries, schemas, derivation rules, public `get*` API |
| `src/env.ts` | Typed, server-only environment. Never read `process.env` elsewhere |
| `docs/redesign/` | Architecture, design tokens, milestones, step prompts |

Import with the `@/*` alias (`@/lib/github`, `@/components/ui/Panel`).

## Ground rules

- **No hardcoded work data.** Projects, statuses, log entries, timeline, skills, stats and activity
  come from `src/lib/github/*`. Only UI copy (labels, headings) is static.
- **Unverifiable = hidden.** If GitHub can't provide a value, omit the element. Never invent a number.
- **Both themes.** Check every component in light and dark, at 1440px and 390px.
- **Token colors only.** Style with the tokens in `src/app/globals.css` (`bg-panel`, `text-ink-2`, …).
  The default Tailwind palette is disabled; don't add raw hex values in components.
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
npm run test        # vitest
npm run test:e2e    # playwright
```

Formatting follows `.prettierrc`: 4-space indent, double quotes, no trailing commas.
