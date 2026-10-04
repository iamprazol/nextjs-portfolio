# M14 — Quality, SEO & launch

> **Preamble:** Branch `design-update`. One commit per step.

---

### Step 14.1 — Accessibility pass

```
Run axe (via @axe-core/playwright) on every route in both themes; fix all serious/critical issues.
Verify: keyboard-only navigation through nav, palette, tabs, diagrams, log disclosures, terminal;
visible focus; contrast 4.5:1; prefers-reduced-motion respected.
Commit: "fix(a11y): resolve axe findings"
```

### Step 14.2 — Performance

```
Targets on mobile Lighthouse: Performance ≥ 90, CLS < 0.05, LCP < 2.5s. Ensure client components are
leaf-only (clock, session card, filters, palette, terminal, theme toggle). No GitHub calls from the
client. Fonts via next/font with display swap.
Commit: "perf: meet lighthouse targets"
```

### Step 14.3 — SEO

```
sitemap.ts (all routes incl. systems, problems, log entries), robots.ts, per-route metadata,
dynamic OG images (opengraph-image.tsx) for home, system and problem pages in the dark theme with
name, status and stack. JSON-LD Person on home.
Commit: "feat(seo): sitemap, og images and structured data"
```

### Step 14.4 — Test suite

```
Playwright smoke tests for every route in mock mode (both themes, 1440 and 390 widths), plus the
vitest suite. Add a GitHub Actions workflow (.github/workflows/ci.yml) running lint, typecheck,
test and test:e2e with GITHUB_MOCK=1 on push and PR.
Commit: "ci: lint, typecheck and tests"
```

### Step 14.5 — Launch

```
Set env vars in Vercel (Production + Preview), configure the GitHub webhook from GITHUB-SETUP.md,
deploy the design-update preview, verify every number against GitHub, then open a PR
design-update → master with a summary of milestones and screenshots of both themes.
Commit: "docs: launch checklist" (update PROGRESS.md)
```
