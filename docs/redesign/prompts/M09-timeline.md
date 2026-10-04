# M09 — Timeline

> **Preamble:** Branch `design-update`. Matches artboard "07 · Timeline". Years and numbers come from
> `contributionsCollection`; optional narrative from `portfolio/timeline/<year>.md`. One commit per step.

---

### Step 9.1 — Year rail

```
src/app/timeline/page.tsx: H1 "Engineering Timeline", subtitle "Key moments, learnings and growth."
Left: vertical rail of years (dot + line; past years filled accent, selected year ringed),
each a button showing year, title, one-line subtitle. Selected year in ?year= (default latest).
Commit: "feat(timeline): year rail"
```

### Step 9.2 — Year detail

```
Right panel for selected year: year (link color), title, narrative (from markdown if present),
then 4 blocks: KEY WORK (top repos by contributions, linked to systems when they are systems),
TECHNOLOGIES (top languages that year), NUMBERS (commits, PRs, reviews, repos contributed to),
NOTABLE RELEASE (latest non-prerelease release that year across systems). Add a 52-week
contribution heatmap strip for the year from contributionCalendar, using --acc opacity steps.
Commit: "feat(timeline): year detail and heatmap"
```
