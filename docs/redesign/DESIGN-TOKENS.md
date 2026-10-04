# Design tokens

Source of truth: the approved design canvas "Prajjwal Engineering Portfolio" (9 artboards:
Home, Systems, URM profile, Engineering problem, ClaudeGrill, Log, Timeline, Lab, About).
Dark mode = the screenshot look (near-black, blue accent). Light mode = warm off-white, orange accent.

## Color tokens

Defined as CSS variables on `:root` (light) and `.dark` (dark) in `src/app/globals.css`, then exposed
to Tailwind v4 via `@theme inline`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#F6F4EF` | `#0A0D12` | Page background |
| `--panel` | `#FFFFFF` | `#0E131A` | Cards, panels |
| `--panel-2` | `#F2EFE8` | `#121821` | Inset areas, icon tiles |
| `--line` | `#E4E0D8` | `#1E2631` | Dividers, card borders |
| `--line-2` | `#DCD7CD` | `#2A3442` | Stronger borders, inputs |
| `--chip` | `#EDE9E1` | `#1A212B` | Tag backgrounds |
| `--ink` | `#17171A` | `#E6EAF0` | Primary text |
| `--ink-2` | `#4A4740` | `#B3BCC9` | Secondary text |
| `--mute` | `#6B6860` | `#8C96A6` | Captions, mono labels |
| `--link` | `#A34E08` | `#7AA7FF` | Text links |
| `--wire` | `#9C978C` | `#4A5566` | Diagram connectors |
| `--acc` | `#F08A24` | `#7AA7FF` | Accent (buttons, dots, name highlight) |
| `--acc-soft` | `#FDF3E7` | `rgba(122,167,255,.10)` | Accent fills |
| `--acc-line` | `#F3D3AE` | `rgba(122,167,255,.35)` | Accent borders |
| `--acc-ink` | `#8A4309` | `#A9C6FF` | Text on accent-soft |
| `--on-acc` | `#17171A` | `#0A0D12` | Text on solid accent |
| `--ok` | `#2E9E5B` | `#4ADE80` | Production / online |
| `--ok-soft` | `#E3F2E8` | `rgba(74,222,128,.12)` | |
| `--teal` | `#1F8A85` | `#5EEAD4` | Active |
| `--violet` | `#7C5CD6` | `#F5B451` | Experiment |
| `--term` / `--term-ink` / `--term-mute` | `#17171A` / `#EDEAE3` / `#A9A69E` | `#05070A` / `#E6EAF0` / `#8C96A6` | Terminal + GitHub activity panel (dark in both modes) |
| `--grid` | `rgba(23,23,26,.045)` | `rgba(122,167,255,.035)` | 64px background grid |
| `--glow` | `rgba(240,138,36,.18)` | `rgba(122,167,255,.22)` | Globe/pin glow |

Status → color: Production `--ok`, Building `--acc`, Active `--teal`, Experiment `--violet`, Maintenance `--mute`.

Contrast: all text pairs above meet 4.5:1 on their backgrounds. Do not use `--acc` (orange) for body text in light mode — use `--link`.

## Typography

- **Geist Mono** — nav logo, hero name, labels (uppercase, `letter-spacing: .14–.2em`, 11–12px), numbers, tags, terminal.
- **Geist** — body copy, headings on inner pages, descriptions.
- Scale: hero name 76px (clamp to 44px on mobile), page H1 48px, section H2 28–36px, card title 22px, body 16–17px, small 13–14px, label 11px.

## Layout

- Max widths: home 1440px, inner pages 1240px, log 1040px. Side gutter 24–32px, 16px on phones.
- Background: 64px grid lines in `--grid` on home; plain `--bg` elsewhere.
- Radius: cards 10–12px, buttons 8px, pills 999px, tags 4px.
- Card: `bg --panel`, `1px --line-2` border, light-mode shadow `0 10px 30px rgba(23,23,26,.06)`.

## Components (build in M01)

`Panel`, `MonoLabel`, `StatusDot` / `StatusBadge`, `Tag`, `Button` (primary outline-accent, ghost),
`IconTile`, `SectionHeader` (eyebrow `01 — SYSTEMS` + H2 + right link), `NavBar`, `ThemeToggle`,
`CommandPalette` (⌘K), `Footer`, `DiagramNode` / `DiagramEdge`, `Tabs`, `RingGauge`, `Terminal`.

## Motion

Theme switch: 300ms background/color transition. Hover: border to `--acc-line`. Respect
`prefers-reduced-motion` (no clock tick animation, no globe spin).
