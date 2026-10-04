# M06 — System profile page

> **Preamble:** Branch `design-update`. Matches artboards "03 · URM — system profile" and "05 · ClaudeGrill".
> One route serves every system; sections render only when their GitHub data exists. One commit per step.

---

### Step 6.1 — Route and header

```
src/app/systems/[slug]/page.tsx with generateStaticParams from getSystems(). notFound() for
unknown slugs. Header: "← Back to Systems", round IconTile, name (40px), description, StatusBadge,
repo link (if public) and homepage link (if set).
Tabs (via ?tab=): Overview, Architecture, Engineering Problems, Releases — and Workflow when
workflow.json exists. A tab with no data is not shown.
Commit: "feat(system): route, header and tabs"
```

### Step 6.2 — Overview tab

```
Two columns: SystemProfile panel (dl: ROLE, STACK, SYSTEMS = architecture node labels, FIRST COMMIT
year, LAST RELEASE) and ArchitecturePreview (DiagramTree from architecture.json). Below: the 3 most
recent log entries for this system (getLog({system})).
Commit: "feat(system): overview tab"
```

### Step 6.3 — Interactive architecture

```
Architecture tab: full DiagramTree. Clicking a node selects it (aria-pressed) and shows an
"INSPECTING · <node>" panel in acc-soft with node.detail and links to problems whose frontmatter
mentions that node (add optional `nodes: string[]` to ProblemFrontmatter). Keyboard: arrow keys move
between nodes. Selection stored in ?node=.
Commit: "feat(system): interactive architecture"
```

### Step 6.4 — Engineering problems tab

```
Grid of problem cards: "ENGINEERING PROBLEM #01", title, summary, "Read problem →" to
/systems/[slug]/problems/[problem]. Sorted by number.
Commit: "feat(system): problems tab"
```

### Step 6.5 — Releases tab

```
Table (inside overflow-x-auto box): version, date, release name, and the merged PRs between this
tag and the previous one (titles, linked). Data: repo releases + MERGED_PRS filtered by mergedAt
range. Hidden for private repos without release data.
Commit: "feat(system): releases tab"
```

### Step 6.6 — Workflow variant (ClaudeGrill)

```
When workflow.json exists, render the ClaudeGrill layout: numbered step list (left, buttons),
DiagramFlow (center) highlighting nodes mapped to the selected step, and a right column with
"Why I built it", "What works", "What doesn't (yet)", "Lessons" — these come from the system's
README sections with those exact headings (parse README.md from GitHub), hidden when missing.
Commit: "feat(system): workflow view"
```
