# Portfolio redesign — "Engineering Lab"

This folder is the full build plan for the redesigned portfolio on the `design-update` branch.
It turns the current single-page Chakra site into a multi-page engineering portfolio whose
**every piece of work and progress data is fetched from GitHub** — no hand-maintained project
arrays, skill lists or experience entries in this codebase.

## How to use this folder

1. Read `ARCHITECTURE.md` once — it defines how GitHub becomes the CMS.
2. Do the one-time GitHub setup in `GITHUB-SETUP.md` (token, topics, content folder, webhook).
3. Work through `MILESTONES.md` in order. Each milestone links to a prompt file in `prompts/`.
4. Each prompt file contains numbered **step prompts**. Paste one step at a time into Claude Code
   (or your agent of choice) from the repo root. Each step is small enough to review and commit alone.
5. Tick the step off in `PROGRESS.md` when its acceptance criteria pass.

## Files

| File | What it is |
| --- | --- |
| `ARCHITECTURE.md` | Stack decisions, GitHub data model, derivation rules, caching/revalidation |
| `DESIGN-TOKENS.md` | Exact light/dark color tokens, type, spacing, components — from the approved design canvas |
| `GITHUB-SETUP.md` | What to configure on GitHub so the site has data to fetch |
| `MILESTONES.md` | 15 milestones, their order, dependencies and definition of done |
| `PROGRESS.md` | Checklist of every step prompt |
| `prompts/M00–M14` | Step-by-step prompts per milestone, page and section |

## Ground rules for every step (repeated in each prompt)

- **No hardcoded work data.** Projects, statuses, log entries, timeline, skills, stats, activity
  and "currently building/learning" must come from `src/lib/github/*`. The only allowed static
  content is UI copy (labels, headings) and the site owner's GitHub login in env.
- **Unverifiable = hidden.** If GitHub can't provide a value, the UI omits that element; it never
  shows an invented number.
- **Both themes.** Every component is checked in light and dark mode.
- **Small commits.** One step prompt = one commit, message given in the step.
