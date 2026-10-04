# M10 — Lab & terminal

> **Preamble:** Branch `design-update`. Matches artboard "08 · Lab / Experiments". One commit per step.

---

### Step 10.1 — Experiments

```
src/app/lab/page.tsx: H1 "Experiments", subtitle "Exploring new tools, workflows and ideas."
Group getExperiments() (repos with topic portfolio-lab) by their first non-portfolio topic
(e.g. ai, developer-tools, web) into cards: IconTile, group name, list of repos with description
and last-push relative time. Plus a "Learning now" card from getNow().learning.
Commit: "feat(lab): experiments grid"
```

### Step 10.2 — Terminal

```
Client Terminal (term colors in both modes): header "~/prajjwal — try a command", input with
history (↑/↓), and buttons for quick commands. Commands are resolved from server-provided data
(passed as props): `projects` (systems with status), `experiments`, `log` (last 5), `now`,
`stack` (top languages), `contact` (profile links), `theme`, `help`, `clear`, `open <system>`
(navigates). Unknown → "command not found: x — try help". Output is aria-live="polite".
Commit: "feat(lab): interactive terminal"
```
