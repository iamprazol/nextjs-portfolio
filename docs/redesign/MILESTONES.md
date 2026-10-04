# Milestones

Work top to bottom. A milestone is done when all its steps' acceptance criteria pass, `npm run build`
and `npm run lint` pass, and both themes have been checked at 1440px and 390px.

| # | Milestone | Prompt file | Depends on | Done when |
| --- | --- | --- | --- | --- |
| M00 | Foundations & housekeeping | `prompts/M00-foundations.md` | — | Deps installed, env typed, Vercel branch config fixed, old content isolated |
| M01 | Design system & theming | `prompts/M01-design-system.md` | M00 | Tokens, light/dark switch, primitives, Chakra removed |
| M02 | GitHub data layer | `prompts/M02-github-data-layer.md` | M00 | All `get*` functions return typed data from GitHub; derivation rules tested on fixtures |
| M03 | App shell, navigation & ⌘K | `prompts/M03-app-shell.md` | M01, M02 | Layout, nav, footer, command palette, 404, metadata |
| M04 | Home page | `prompts/M04-home.md` | M03 | All home sections render live GitHub data |
| M05 | Systems index | `prompts/M05-systems-index.md` | M03 | Status filter works, cards from `getSystems` |
| M06 | System profile page | `prompts/M06-system-profile.md` | M05 | Overview, interactive architecture, problems, releases, workflow variant |
| M07 | Engineering problem page | `prompts/M07-engineering-problem.md` | M06 | Markdown case study with before/after diagrams and linked PRs |
| M08 | Engineering log | `prompts/M08-engineering-log.md` | M03 | PR-driven log with filters, expansion, RSS |
| M09 | Timeline | `prompts/M09-timeline.md` | M03 | Year-by-year from contribution data |
| M10 | Lab & terminal | `prompts/M10-lab.md` | M03 | Experiments + working terminal commands |
| M11 | About & tools | `prompts/M11-about.md` | M03 | Profile, how-I-work, tools linked to systems |
| M12 | Résumé & contact | `prompts/M12-resume-contact.md` | M04–M11 | Printable `/resume`, contact form restyled |
| M13 | Freshness: webhook, cron, caching | `prompts/M13-revalidation.md` | M02 | Push to a System repo updates the site within a minute |
| M14 | Quality, SEO & launch | `prompts/M14-quality-launch.md` | all | a11y, performance, OG images, sitemap, tests, PR to `master` |

Suggested pacing: M00–M02 first week (foundation), M03–M06 second, M07–M11 third, M12–M14 fourth.

```
M00 ─┬─ M01 ─┐
     └─ M02 ─┴─ M03 ─┬─ M04
                     ├─ M05 ─ M06 ─ M07
                     ├─ M08, M09, M10, M11
                     └──────────────── M12 ─ M14
            M02 ─ M13 ──────────────────────┘
```
