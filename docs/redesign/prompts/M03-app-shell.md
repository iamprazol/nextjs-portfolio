# M03 — App shell, navigation & command palette

> **Preamble:** Branch `design-update`. Read `DESIGN-TOKENS.md`. Server components by default; client
> components only for interactivity. Data only from `src/lib/github`. One commit per step.

---

### Step 3.1 — Root layout

```
Rewrite src/app/layout.tsx: Geist + Geist Mono via next/font (keep existing setup), ThemeProvider,
<html lang="en" suppressHydrationWarning>, body bg-bg text-ink. Default metadata (title template
"%s — Prajjwal Poudel", description from getProfile().headline, metadataBase from VERCEL_URL).
Add a skip-to-content link.
Commit: "feat(shell): root layout"
```

### Step 3.2 — Navigation bar

```
Create src/components/shell/NavBar.tsx (server) + NavLinks.tsx (client, for active state via
usePathname). Left: ">_" in accent + "PRAJJWAL" + muted "POUDEL" in Geist Mono, letter-spacing .16em
(name from getProfile). Center: Systems, Log, Timeline, Lab, About — active link has a 2px accent
underline and aria-current="page". Right: ThemeToggle + "⌘ K" button that opens the palette.
Mobile (<768px): links collapse into a menu button with an accessible disclosure panel.
Commit: "feat(shell): navigation bar"
```

### Step 3.3 — Command palette (⌘K)

```
Build src/components/shell/CommandPalette.tsx with cmdk. Opens on ⌘K / Ctrl+K and from any
"Type a command…" trigger (export a useCommandPalette() context hook).
Groups:
- Navigate: projects (/systems), architecture (first system's architecture tab), problems,
  timeline, experiments (/lab), log, about, resume.
- Systems: one item per system from getSystems() (passed as props from a server parent).
- Actions: theme (toggle), github (open profile), contact (/about#contact), copy email (if present).
Each item shows a monospace command name ("▸ projects") and a muted description. Esc closes,
focus returns to trigger, role="dialog" with aria-label.
Commit: "feat(shell): command palette"
```

### Step 3.4 — Footer, 404, loading and error states

```
Footer: "BUILD / AUTOMATE / IMPROVE" mono label with accent rule, links from profile.links (only
those present), © year.
not-found.tsx in the design language with a terminal-style "404: route not found" and links.
loading.tsx skeletons using Panel shapes (no spinners). error.tsx shows "GitHub is not responding"
with a retry button — never fallback data.
Commit: "feat(shell): footer, 404, loading and error states"
```
