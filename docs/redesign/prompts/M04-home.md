# M04 — Home page

> **Preamble:** Branch `design-update`. The home page matches the approved design artboard "01 · Home":
> three-column hero (left rail · hero · right rail) on a 64px grid, then Systems, Engineering Log and
> GitHub activity below the fold. Dark = blue accent, light = orange accent (tokens only — never
> hardcode hex in components). Every value comes from `src/lib/github`. Sections live in
> `src/components/home/`. One commit per step.

---

### Step 4.1 — Page scaffold

```
Create src/app/page.tsx (server) that fetches in parallel: getProfile, getSystems, getNow,
getStats, getLog({limit:3}), getActivity. Layout: max-w 1440px, px 32px, .bg-grid.
Hero row is a flex-wrap row: LeftRail (flex 1 1 260px, max 320px), Hero (flex 999 1 520px),
RightRail (flex 1 1 280px, max 320px). Under 1100px the rails move below the hero; under 768px
everything stacks. Each section is its own component receiving typed props.
Commit: "feat(home): page scaffold"
```

### Step 4.2 — Hero

```
src/components/home/Hero.tsx:
- Eyebrow: 32px rule + "HEY, I'M" (mono, .2em tracking, ink-2).
- H1: first name in ink + last name in accent, Geist Mono 76px (clamp(44px, 6vw, 76px)), from profile.name.
- Subtitle: profile.headline (23px mono).
- Intro: profile.intro (Geist 17px, ink-2, max 520px).
- CTAs: "EXPLORE SYSTEMS" (primary: accent border, acc-soft fill, ↗ icon) → /systems;
  "VIEW RESUME" ghost with document icon → /resume.
- Stats row (border-top, 3 columns with dividers): from getStats — years active, developers led
  (only if profile.leadership.developersLed exists, else show PRs merged), products count.
  Labels: YEARS / Production Engineering, DEVELOPERS / Technical Leadership, PRODUCTS /
  Owned / Built / Maintained. A stat with no value is not rendered.
Commit: "feat(home): hero"
```

### Step 4.3 — Left rail: clock and system status

```
LocalTimeCard (client): "LOCAL TIME · KATHMANDU" label (city from profile.location.label),
live clock in Asia/Kathmandu via Intl.DateTimeFormat, ticking each second (paused when
document.hidden), full date below. Render server time first to avoid layout shift.
SystemStatusCard (server): "SYSTEM STATUS" + green "ONLINE" pill; one row per system from
getSystems(): IconTile monogram, name, kind, StatusDot + status label. Each row links to
/systems/[slug].
Commit: "feat(home): local time and system status cards"
```

### Step 4.4 — Left rail: session resources

```
SessionCard (client) replaces the design's fake CPU/Memory/Disk numbers with REAL visitor values:
RingGauge rows for CPU cores (navigator.hardwareConcurrency / 16), Memory (navigator.deviceMemory GB / 16),
Battery (navigator.getBattery level, if supported) and "Time here" (seconds since mount).
Rows whose API is unsupported are hidden. Footer line: "Read live from your browser — nothing stored."
Commit: "feat(home): live session card"
```

### Step 4.5 — Right rail: now card

```
NowCard (server) from getNow(): three groups separated by dividers —
CURRENTLY BUILDING (repo name + its description; links to its system/lab page),
CURRENTLY LEARNING (up to 2 languages, each linking to /lab),
CURRENTLY EXPLORING (up to 2 topics from recent stars).
Group labels in accent mono with a dot. A group with no data is omitted.
Commit: "feat(home): currently building/learning/exploring"
```

### Step 4.6 — Right rail: globe and command bar

```
LocationGlobe: CSS-only sphere (radial gradient + dotted texture using --globe tokens), tilted orbit
ellipse, accent pin at profile.location lat/lng projected onto the visible hemisphere, label
"KATHMANDU, NP" + coordinates in mono. role="img" with aria-label. Slow rotation of the dot texture
disabled under prefers-reduced-motion.
CommandBar: full-width button "› Type a command... ⌘ K" that opens the palette.
Commit: "feat(home): location globe and command bar"
```

### Step 4.7 — Below the fold

```
1) "01 — SYSTEMS / Real products. Real users. Real problems." — 4-up grid of SystemCards
   (id like SYS-01 from order, status, name, description, stack tags) + "ALL SYSTEMS →".
2) "02 — ENGINEERING LOG / Notes from the work." — 3 latest entries (#number accent, title, tag)
   + RecentActivity panel (term colors in both modes): 4–5 items from getActivity with repo,
   latest commit message, relative time, "View →" to GitHub profile.
Commit: "feat(home): systems, log preview and github activity"
```

### Step 4.8 — Home QA

```
Check: both themes at 1440, 1100, 768, 390px; no hydration warnings; Lighthouse a11y ≥ 95;
every visible number traced to /_data output. Add a Playwright test that loads / in both themes
and asserts the systems count equals getSystems().length from mock fixtures.
Commit: "test(home): responsive and data checks"
```
