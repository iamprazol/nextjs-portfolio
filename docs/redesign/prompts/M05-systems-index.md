# M05 — Systems index

> **Preamble:** Branch `design-update`. Matches artboard "02 · Systems". Data from `getSystems()` only.

---

### Step 5.1 — Page and cards

```
src/app/systems/page.tsx: H1 "Systems", mono subtitle "Real products. Real users. Real problems.".
Grid of SystemCard (2 columns ≥ 900px, 1 below): IconTile, name, description, StatusBadge,
stack Tags, a split footer "MY ROLE" (meta.role joined) / "PROVES" (meta.proves) — each half
hidden if absent — and a link "Open system profile →" to /systems/[slug].
Order by meta.order then pushedAt desc.
Commit: "feat(systems): index page"
```

### Step 5.2 — Status filter

```
Client StatusFilter: pill buttons All / Production / Building / Active / Experiment / Maintenance,
showing only statuses that exist, with counts. Selected = solid ink pill. State synced to
?status= in the URL (shareable). Uses aria-pressed.
Commit: "feat(systems): status filter"
```

### Step 5.3 — Metadata

```
generateMetadata with count of systems; static params not needed. Add Playwright test for filter.
Commit: "test(systems): filter and metadata"
```
