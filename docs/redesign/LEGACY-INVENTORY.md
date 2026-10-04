# Legacy inventory

Every hardcoded data array in the old single-page site (now under `src/legacy/`), and what replaces
each field in the redesign. "Source" refers to the rules in `ARCHITECTURE.md` §4 and the schemas in
§3.3. **Dropped** means GitHub cannot verify the value, so the redesign does not show it.

The legacy code is deleted in M01 step 1.5 (Chakra removal) once nothing imports it.

## Hero — `src/legacy/components/Hero/Hero.tsx`

### `meta`

| Field | Legacy value | Replaced by |
| --- | --- | --- |
| `name` | "Prajjwal Poudel" | `Profile.name` — `portfolio/profile.json` in the content repo (`getProfile`) |
| `description[]` | "Full Stack Developer", "WordPress Expert", "React Enthusiast" (typewriter) | `Profile.headline` (`getProfile`). The rotating typewriter is dropped |
| Tagline (inline JSX) | "Transforming complex ideas, driven by curiosity…" | `Profile.intro` (`getProfile`) |

### `skills: string[]`

| Field | Legacy value | Replaced by |
| --- | --- | --- |
| items | PHP, WordPress, Laravel, JS, React | **Tools tied to work** — languages + topics aggregated across Systems (`getToolUsage`) |

### `floatingIcons[]`

| Field | Legacy value | Replaced by |
| --- | --- | --- |
| `emoji`, `placement` | 5 decorative emoji | Dropped (decoration, not data) |

## Skills — `src/legacy/components/Skills/Skills.tsx`

### `skills` (object of 4 category arrays)

| Field | Legacy value | Replaced by |
| --- | --- | --- |
| Category keys | Programming Languages, Backend Technologies, Frontend Technologies, Developer Tools | Dropped — tools are grouped by the systems that use them, not by hand-made categories |
| `skill` — languages | PHP, JavaScript, SQL, HTML, CSS, SCSS | **Stack tags** / **Tools tied to work** — GraphQL `languages` by bytes across System repos |
| `skill` — frameworks & services | WordPress, Laravel, REST API, Redis, Firebase, React, JQuery | **Tools tied to work** — repo topics (except `portfolio-*`) across Systems. A tool appears only if a System repo carries the topic |
| `skill` — dev tools | Git, GitHub, GitLab, VSCode, PHPStorm, Jira, Linux | Dropped — not derivable from repos |
| `icon` | devicon CDN URLs | Dropped — tags are text-only (`Tag` primitive) |

## Featured projects — `src/legacy/components/Projects/Projects.tsx`

### `projects: Project[]`

One live entry (Food Ordering System) and two commented-out entries (Advanced User Avatar,
Timed Content Locker). All three become Systems only if their repo gets the `portfolio-system`
topic (or a `portfolio/systems/<slug>.json` file in the content repo).

| Field | Replaced by |
| --- | --- |
| `title` | `SystemMeta.name`, defaulting to the repo name (`getSystems`) |
| `description` | Repo description from GitHub; `SystemMeta.proves` for the one-line claim |
| `image` | Dropped — system cards have no screenshots. `public/images/*` goes with the legacy code |
| `icon` | Dropped — `IconTile` primitive. `public/icons/*` goes with the legacy code |
| `technicalPoints[]` | **Stack tags** (top 4 languages + topics) for the tech; narrative points move to `.portfolio/problems/*.md` case studies |
| `projectOverview.overviewPoints[]` | Dropped — "5 star rating", "200+ active installations" are WordPress.org numbers GitHub can't verify. Stars and release count come from the repo instead |
| `projectOverview.links.github[]` | Repo URL from GitHub |
| `projectOverview.links.download` | Latest release URL (Releases tab, `getSystem`) |
| `projectOverview.links.liveDemo` | Repo `homepageUrl` from GitHub |
| `background` | Dropped (per-card gradient) |

## Other projects — `src/legacy/components/Projects/OtherProjects.tsx`

### `projects: Project[]`

Three live entries (Kuwa, Tourist Information Management System, Monkeee API) and one commented-out
(WPMake Site). These are older repos: tag them `portfolio-lab` to show as Experiments, or leave them
untagged and they disappear from the site.

| Field | Replaced by |
| --- | --- |
| `name` | Repo name (`getExperiments`) |
| `period` | Year of repo `createdAt` / last push; also surfaces under **Timeline years** → repos created |
| `projectType` | `SystemMeta.kind` if a `.portfolio/system.json` exists, else omitted |
| `description` | Repo description from GitHub |
| `points[]` | Dropped unless written as README/`.portfolio` content in the repo |
| `techStack[]` | **Stack tags** — top 4 languages + topics |
| `codeUrl` | Repo URL from GitHub |
| `liveUrl` | Repo `homepageUrl` from GitHub |

## Work experience — `src/legacy/components/WorkExperience/WorkExperience.tsx`

### `experience[]`

Three entries: ThemeGrill (Nov 2019 – Present), Turbo Subdomains (Dec 2022 – Feb 2024),
Infomax (Feb 2018 – Feb 2019).

| Field | Replaced by |
| --- | --- |
| `title` | Dropped — job titles aren't on GitHub. Role per system comes from `SystemMeta.role` |
| `company` | Repo owner of each System (e.g. `themegrill`), via `GITHUB_SYSTEM_OWNERS`. Employers with no reachable repos are dropped |
| `location` | `Profile.location.label` (one current location, not per job) |
| `date` | **Timeline years** — one entry per year with contributions; **Years of production engineering** = current year − first year with contributions |
| `bullets[]` — shipped features | **Engineering Log entries** (merged PRs + releases in System repos) and `.portfolio/problems/*.md` case studies |
| `bullets[]` — "managed a team of 10+ developers" | `Profile.leadership.developersLed` — shown only if present in `profile.json` |
| `bullets[]` — install counts (30k → 60k, 100k → 180k, 5k+ downloads) | Dropped — not verifiable from GitHub. May be written into a case study's `result[]` frontmatter, where it is attributed narrative rather than a site stat |
| `bullets[]` — optional year narrative | `portfolio/timeline/<year>.md` in the content repo |

## Contact — `src/legacy/components/ContactMe/ContactMe.tsx`

No arrays, but three hardcoded links in JSX:

| Field | Legacy value | Replaced by |
| --- | --- | --- |
| Email | `mailto:iamprazol@gmail.com` | `Profile.links.email` |
| LinkedIn | `linkedin.com/in/prajjwal-poudel` | `Profile.links.linkedin` |
| GitHub | `github.com/iamprazol` | `Profile.links.github` (falls back to `GITHUB_LOGIN`) |

The form itself posts to `/api/contact` (wpmake Everest Forms) and is kept as is; M12 restyles it.

## Not data

`SkillBadge`, `FloatingIcon`, `SafeMotionWrapper`, `ChakraProviders` and `theme/` hold no work data.
They are replaced by the M01 primitives and tokens.
