# M08 — Engineering log

> **Preamble:** Branch `design-update`. Matches artboard "06 · Engineering Log". Entries are merged PRs and
> releases (ARCHITECTURE.md §4). Nothing is typed by hand. One commit per step.

---

### Step 8.1 — Log list

```
src/app/log/page.tsx: H1 "Engineering Log", mono subtitle "Small changes. Big impact.", max-w 1040px.
Ordered list of entries: #number (mono bold), title, summary, date (mono), system Tag, type icon
(PR vs release), +/− lines. Highlighted entries show an accent dot. Paginate 20 per page via ?page=.
Commit: "feat(log): list"
```

### Step 8.2 — Expand and filter

```
Each entry is a disclosure button (aria-expanded) that reveals: full PR body (sanitized markdown,
first 1200 chars), files changed count, link to the PR, and links to case studies whose
relatedPRs include it. Filter select "All systems / <each system>" synced to ?system=.
Commit: "feat(log): expandable entries and system filter"
```

### Step 8.3 — Entry page and RSS

```
/log/[number] full entry page with generateStaticParams (latest 100). /log/rss.xml route handler
producing RSS 2.0 from getLog({limit:50}). Add <link rel="alternate"> in layout.
Commit: "feat(log): entry pages and rss feed"
```
