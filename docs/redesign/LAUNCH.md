# Launch checklist

Step 14.5. Everything above the line is done in the repo; everything below it needs access to
Vercel, GitHub settings or the live site, so it is done by hand. Tick 14.5 in `PROGRESS.md` when the
PR to `master` is open.

## Done in the repo

- [x] All milestones M00–M14.4 built on `design-update`, one commit per step.
- [x] `npm run lint`, `npm run typecheck`, `npm run test` and `npm run test:e2e` pass in mock mode.
- [x] CI runs the same four on every push and pull request (`.github/workflows/ci.yml`).
- [x] axe: no serious or critical findings on any route, in both themes.
- [x] Mobile Lighthouse on a production build of the mock data: Performance 96–100, CLS 0,
      LCP 1.5 s with throttling applied (2.0–2.8 s in Lighthouse's simulated estimate).

## 1. Vercel environment (Production and Preview)

- [ ] `GITHUB_LOGIN`, `GITHUB_TOKEN`, `GITHUB_CONTENT_REPO`, `GITHUB_SYSTEM_OWNERS` — see
      `GITHUB-SETUP.md` §1–2 for the token's scopes.
- [ ] `GITHUB_WEBHOOK_SECRET` — a long random string; the same value goes into the webhook below.
- [ ] `CRON_SECRET` — a long random string. Vercel sends it with the daily cron by itself.
- [ ] `WP_API_KEY` — already set for the current site; confirm it is present for Preview too.
- [ ] `GITHUB_MOCK` is **not** set (a production deploy refuses to start with it on).

## 2. GitHub

- [ ] `portfolio/profile.json` exists in the content repo (`GITHUB-SETUP.md` §3). Optional: `about`,
      `timeline/<year>.md`.
- [ ] Topic `portfolio-system` on every system repo and `portfolio-lab` on experiments.
- [ ] Webhook on each system repo and the content repo (or once at user/org level):
      `https://<domain>/api/revalidate`, content type `application/json`, the secret above, events
      Pushes, Pull requests, Releases, Repositories. The "ping" delivery should come back **202**.

## 3. Preview deploy

- [ ] Push `design-update` and open its Vercel preview.
- [ ] The build log shows no `skipped invalid file` or `rate limit low` warnings.
- [ ] Every route loads: `/`, `/systems`, one system (each tab), one case study, `/log`, one log
      entry, `/timeline`, `/lab`, `/about`, `/resume`, and an unknown URL returns 404.
- [ ] Both themes, at desktop and phone width.

## 4. Verify the numbers against GitHub

Nothing on the site is typed by hand, so each of these should match what GitHub shows.

- [ ] Home stats: years (current year − first year with contributions), systems count, developers
      led (from `profile.json` only), or merged PRs if that is absent.
- [ ] Each system's status follows the rule in `ARCHITECTURE.md` §4 (latest stable release within
      12 months → Production, pushed within 30 days → Building, within 120 → Active, else
      Maintenance).
- [ ] Log: the newest entry is your latest merged PR in a system repo; `portfolio:hide` PRs are
      absent, `portfolio:highlight` PRs are pinned.
- [ ] Timeline: one year's commits, PRs and reviews match that year on your GitHub profile; the
      heatmap has the same busy weeks.
- [ ] No private repository is named anywhere unless it is a system or experiment you published.

## 5. Things only production can prove

- [ ] Send one real message through the contact form and confirm it arrives. (Tests never send a
      deliverable message, so this path is unverified.)
- [ ] Merge a small PR in a system repo: the webhook delivery returns 202 with a list of tags, and
      the log shows the PR within a minute.
- [ ] After the first night, the cron run appears in Vercel's logs as
      `{"scope":"revalidate","source":"cron",…}`.
- [ ] Share a system URL in a chat app: the preview card shows its name, status and stack.
- [ ] Print `/resume` to PDF: one page if the data allows, light, no navigation.
- [ ] Run Lighthouse (mobile) on the live home page: Performance ≥ 90, CLS < 0.05, LCP < 2.5 s.

## 6. Pull request

- [ ] Open `design-update` → `master` with the summary below and screenshots of the preview in both
      themes (home, a system, the timeline).
- [ ] After merging, confirm Vercel builds `master` (`vercel.json` allows `master`,
      `design-update` and `develop`).

### PR summary

> **Engineering Lab redesign.** Replaces the single-page Chakra site with a multi-page portfolio
> whose work data is read from GitHub — no project, skill or experience arrays in the codebase.
>
> - **Foundations (M00–M02):** Tailwind v4 tokens with light and dark themes; a typed GitHub data
>   layer (`src/lib/github`) with tested derivation rules and a fictional fixture set for offline
>   development and tests.
> - **Pages (M03–M12):** app shell with command palette; home; systems index and system profiles
>   (overview, interactive architecture, case studies, releases, workflow); engineering log with
>   entry pages and RSS; timeline with contribution heatmap; lab with a working terminal; about
>   with tools linked to systems; generated printable résumé; redesigned contact form with a
>   honeypot and rate limit.
> - **Freshness (M13):** GitHub webhook and daily cron revalidate cache tags; structured logs for
>   GitHub calls and revalidations.
> - **Quality (M14):** axe-clean in both themes, keyboard paths tested, reduced motion respected;
>   mobile Lighthouse Performance 96–100 with no layout shift on mock data; sitemap, robots,
>   Open Graph images and JSON-LD; CI running lint, typecheck, unit and end-to-end tests.
>
> Setup needed before merging is in `docs/redesign/LAUNCH.md`.
