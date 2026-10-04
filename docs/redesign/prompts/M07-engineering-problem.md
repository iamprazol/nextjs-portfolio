# M07 — Engineering problem page

> **Preamble:** Branch `design-update`. Matches artboard "04 · URM — engineering problem". Content is a
> markdown file fetched from GitHub (ARCHITECTURE.md §3). One commit per step.

---

### Step 7.1 — Route and article

```
src/app/systems/[slug]/problems/[problem]/page.tsx with generateStaticParams over all problems.
Layout: article (flex 999 1 640px) + aside (flex 1 1 300px).
Article: "← Back to <system>", mono "Engineering Problem #NN", H1 title, summary in --link color,
section chips linking to heading anchors, then the sanitized markdown body styled with a
`.prose-lab` class (Geist 16px/1.7, h2 20px, blockquote = dark --term panel with 20px text,
code in mono on --panel-2).
Commit: "feat(problem): article layout and markdown rendering"
```

### Step 7.2 — Before/after diagrams

```
If frontmatter.diagrams.before/after exist, render two DiagramTree figures side by side
("The Old System" / "The New System"), the new one with accent borders. Stack on mobile.
Commit: "feat(problem): before and after diagrams"
```

### Step 7.3 — Aside

```
Aside panels from frontmatter: My Role, Trade-offs, Result, Constraints (each hidden if empty).
"Evidence" panel: relatedPRs fetched from GitHub with title, +/− line counts and merge date.
Link to the matching log entries.
Commit: "feat(problem): role, trade-offs, result and PR evidence"
```

### Step 7.4 — Prev/next and metadata

```
Prev/next problem within the same system. generateMetadata from title + summary.
Commit: "feat(problem): navigation and metadata"
```
