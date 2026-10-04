# M01 — Design system & theming

> **Preamble:** Branch `design-update`. Read `docs/redesign/DESIGN-TOKENS.md` — it is the visual spec.
> No hardcoded work data. Check every component in light and dark. One commit per step.

---

### Step 1.1 — Tokens and Tailwind theme

```
In src/app/globals.css: import tailwindcss, define every token from DESIGN-TOKENS.md as CSS variables
on :root (light) and .dark (dark), and map them in `@theme inline` (colors bg, panel, panel-2, line,
line-2, chip, ink, ink-2, mute, link, wire, acc, acc-soft, acc-line, acc-ink, on-acc, ok, ok-soft,
teal, violet, term, term-ink, term-mute; fonts sans=Geist, mono=Geist Mono).
Add a `.bg-grid` utility (64px lines in var(--grid)). Add a 300ms color/background transition on body,
disabled under prefers-reduced-motion.
Acceptance: a temporary /_tokens page (dev only, notFound() in production) shows every swatch with
its name in both themes.
Commit: "feat(ui): design tokens and tailwind theme"
```

### Step 1.2 — Theme provider and toggle

```
Add next-themes ThemeProvider (attribute="class", defaultTheme="dark", enableSystem=false,
storageKey="pp-theme") in src/app/providers.tsx; add suppressHydrationWarning on <html>.
Build src/components/ui/ThemeToggle.tsx: a real <button> with sun/moon lucide icon + "Light"/"Dark"
label, aria-label "Switch to light mode"/"Switch to dark mode", renders a same-size placeholder
until mounted to avoid hydration mismatch.
Acceptance: no flash of the wrong theme on reload; choice persists across routes and reloads.
Commit: "feat(ui): light/dark theme switch"
```

### Step 1.3 — Primitives

```
Create src/components/ui/ with: Panel, MonoLabel, StatusDot, StatusBadge, Tag, Button
(variants: primary = accent outline + acc-soft fill + arrow icon; ghost; solid-accent for light CTA),
IconTile (monogram or lucide icon), SectionHeader (eyebrow like "01 — SYSTEMS", title, optional
right-hand link), Tabs (accessible: role=tablist, arrow-key navigation), RingGauge (SVG ring,
value 0–1, label, readout).
StatusBadge takes a `SystemStatus` type ("production"|"building"|"active"|"experiment"|"maintenance")
and maps to the colors in DESIGN-TOKENS.md.
Add src/app/_ui/page.tsx (dev only) rendering every primitive in both themes side by side.
Acceptance: touch targets ≥ 44px; focus rings visible in both themes; no Chakra imports.
Commit: "feat(ui): primitives"
```

### Step 1.4 — Diagram primitives

```
Create src/components/ui/diagram/: DiagramNode (button when interactive, aria-pressed for
selection), DiagramTree (renders a {nodes, edges} graph as rows using flex + CSS connector lines,
no canvas/svg library), and DiagramFlow (vertical flow with ↓ connectors and an optional parallel
row). Inputs are the zod Diagram type from ARCHITECTURE.md §3.3 (import the type once M02 exists;
for now define it locally and move it in M02).
Acceptance: renders the URM tree from the design (URM → Membership/Payments/Users → WordPress Core ↔ Database)
from a test object; keyboard selectable; works at 390px (scrolls horizontally inside its own box).
Commit: "feat(ui): diagram primitives"
```

### Step 1.5 — Remove Chakra

```
After 1.1–1.4: delete src/lib/ChakraProviders.tsx, the legacy theme, and uninstall @chakra-ui/*,
@emotion/*. Temporarily replace src/app/page.tsx with a minimal placeholder using the new
primitives (legacy components can be deleted now — the inventory from 0.1 keeps the record).
Acceptance: build/lint/typecheck pass; bundle no longer contains emotion.
Commit: "refactor: remove chakra ui"
```
