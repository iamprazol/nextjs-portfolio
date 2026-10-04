# M02 — GitHub data layer

> **Preamble:** Branch `design-update`. Read `docs/redesign/ARCHITECTURE.md` §3–§7 carefully; it is the spec
> for this milestone. All code lives in `src/lib/github/`, is server-only, and is fully typed.
> No UI in this milestone. One commit per step.

---

### Step 2.1 — Client

```
Create src/lib/github/client.ts exporting `gql<T>(query, vars)` and `rest<T>(route, params)`
using @octokit/graphql and @octokit/rest with GITHUB_TOKEN from src/env.ts.
- Retries: 2 with backoff on 5xx/secondary rate limit.
- Logs remaining rate limit when < 500.
- When GITHUB_MOCK=1, read responses from src/lib/github/fixtures/<hash-of-query+vars>.json instead.
- Add scripts/record-fixtures.ts that runs every query in queries.ts against the real API and
  writes fixtures (strip tokens; keep data).
Acceptance: unit test proves mock mode never hits the network (msw fails on any request).
Commit: "feat(github): api client with mock mode"
```

### Step 2.2 — Schemas

```
Create src/lib/github/schemas.ts with zod schemas from ARCHITECTURE.md §3.3: SystemMeta,
ProblemFrontmatter, Diagram, Workflow, Profile, TimelineYearFrontmatter. Export inferred types.
Also define output domain types used by the UI: System, SystemStatus, Problem, LogEntry,
TimelineYear, NowState, ActivityItem, Experiment, ToolUsage, Stats.
Move the Diagram type out of the UI folder to import from here.
Commit: "feat(github): content schemas and domain types"
```

### Step 2.3 — Queries

```
Create src/lib/github/queries.ts with GraphQL documents:
- REPOS_BY_TOPIC: search `topic:portfolio-system user:<owner>` (and org:) for each owner in
  GITHUB_SYSTEM_OWNERS, plus `topic:portfolio-lab`. Fields: nameWithOwner, name, description, url,
  homepageUrl, isArchived, isPrivate, pushedAt, createdAt, stargazerCount, repositoryTopics,
  languages(first:10, orderBy SIZE) with sizes, latestRelease{tagName,publishedAt,isPrerelease},
  releases(last:20).
- REPO_FILE: object(expression:"HEAD:<path>") { ... on Blob { text } } and tree listing for
  `.portfolio/problems`.
- MERGED_PRS: search `is:pr is:merged author:<login> repo:<a> repo:<b>…` paginated, with number,
  title, bodyText, mergedAt, url, labels, additions, deletions, repository.nameWithOwner.
- CONTRIBUTIONS_BY_YEAR: user(login){ contributionsCollection(from,to){ totalCommitContributions,
  totalPullRequestContributions, totalPullRequestReviewContributions,
  commitContributionsByRepository(maxRepositories:10){repository{nameWithOwner primaryLanguage{name}} contributions{totalCount}},
  contributionCalendar{totalContributions} } } — called once per year since account creation.
- RECENT_STARS: user.starredRepositories(first:30, orderBy STARRED_AT) with starredAt + topics.
REST: GET /users/{login}/events/public (activity), GET /repos/{o}/{r}/commits?author&since (now).
Commit: "feat(github): graphql and rest queries"
```

### Step 2.4 — Content loader

```
Create src/lib/github/content.ts:
- loadProfile(): portfolio/profile.json from GITHUB_CONTENT_REPO → Profile (zod). Missing → minimal
  profile built from the GitHub user (name, bio, location, blog, avatar) — never invented values.
- loadSystemMeta(repo): merge `.portfolio/system.json` in the repo with
  `portfolio/systems/<slug>.json` in the content repo (repo wins).
- loadProblems(repo, slug): list + parse markdown from both locations; frontmatter via gray-matter,
  body → sanitized HTML via remark-gfm/remark-rehype/rehype-sanitize. Generate heading ids for anchors.
- loadArchitecture / loadWorkflow / loadTimelineNote(year).
Invalid files: log a warning with path + zod error, skip the file.
Acceptance: vitest with fixtures covers valid, missing and invalid files.
Commit: "feat(github): content loader for profile, systems and case studies"
```

### Step 2.5 — Derivation rules

```
Create src/lib/github/derive.ts with PURE functions (inject `now: Date` for testability) for every
row of ARCHITECTURE.md §4: deriveStatus, deriveStack, deriveStats, deriveLog (numbering, hide/highlight
labels, summary extraction, release entries), deriveNow (building/learning/exploring), deriveTimeline,
deriveActivity, deriveToolUsage.
Write src/lib/github/derive.test.ts with table-driven tests for each rule, including edge cases:
archived repo, prerelease only, no PR body, PR with portfolio:hide, year with zero contributions,
language newly appearing, no stars.
Acceptance: `npm test` passes with ≥ 90% coverage on derive.ts.
Commit: "feat(github): derivation rules with tests"
```

### Step 2.6 — Public API with caching

```
Create src/lib/github/index.ts exporting: getProfile, getSystems, getSystem(slug), getProblem(slug, problem),
getLog({limit?, system?}), getLogEntry(n), getTimeline, getNow, getActivity, getExperiments,
getToolUsage, getStats.
Wrap each with unstable_cache, revalidate 3600, tags per ARCHITECTURE.md §5. Fetch in parallel
(Promise.all) and dedupe repo lookups per request with React cache().
Add a dev-only route /_data that dumps each function's JSON for inspection.
Acceptance: with GITHUB_MOCK=1 every function returns data; with a real token, /_data shows your
real repos; no function returns a value not traceable to GitHub or the content repo.
Commit: "feat(github): cached public data api"
```
