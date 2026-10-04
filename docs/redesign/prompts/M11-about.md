# M11 — About & tools

> **Preamble:** Branch `design-update`. Matches artboard "09 · About". Text from `portfolio/profile.json`;
> tools from `getToolUsage()`. One commit per step.

---

### Step 11.1 — About hero

```
src/app/about/page.tsx: mono "About", H1 from profile (e.g. "Hi, I'm Prajjwal — …"), intro
paragraphs (profile.about markdown if present, else profile.intro), CTA row: "Get in touch"
(→ #contact) + link buttons for each profile link present. Aside panel: BASED IN, CURRENTLY
(from getNow), INTERESTS (top topics across systems + stars).
Commit: "feat(about): hero and aside"
```

### Step 11.2 — How I work

```
Numbered 2-column list (01–06) from profile.howIWork; hidden if empty.
Commit: "feat(about): how I work"
```

### Step 11.3 — Tools attached to real work

```
Grid from getToolUsage(): groups (Backend, Frontend, Engineering, AI/Automation) by a fixed
language/topic → group map in src/lib/github/tool-groups.ts (this is a classification table, not
content). Each card lists tools and "Used in <system> →" links. Subtitle: "No ratings — each tool
is linked to the system it was used in."
Commit: "feat(about): tools linked to systems"
```
