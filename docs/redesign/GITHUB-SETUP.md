# One-time GitHub setup

These are the only "manual" steps, and all of them happen on GitHub — never in this codebase.

## 1. Token

Create a **fine-grained personal access token**:
- Resource owner: `iamprazol` (create a second token or request org approval for `themegrill` if you want org repos like URM included).
- Repository access: selected repos — every System/Lab repo + the content repo.
- Permissions (read-only): **Contents, Metadata, Pull requests**.
- Add it to Vercel and `.env.local` as `GITHUB_TOKEN`.

Contribution calendar and starred repos come from your public profile via GraphQL and need no extra scope.

## 2. Mark repos

- Add topic **`portfolio-system`** to each product repo (URM, ClaudeGrill, ThemeGrill QA, DocStudio).
- Add topic **`portfolio-lab`** to experiments.
- For repos you **can't** add topics/files to (org-owned), add `portfolio/systems/<slug>.json` with `"repo": "owner/name"` to the content repo instead.

## 3. Content repo

In `iamprazol/iamprazol` (your profile repo) create `portfolio/profile.json`:

```json
{
  "name": "Prajjwal Poudel",
  "headline": "Software Engineer / Product Builder",
  "intro": "I build production software and developer tools…",
  "location": { "label": "Kathmandu, NP", "lat": 27.7172, "lng": 85.324 },
  "links": { "github": "https://github.com/iamprazol", "linkedin": "", "x": "", "email": "" },
  "howIWork": ["Understand the system before changing it", "Find the real constraint", "…"],
  "leadership": { "developersLed": 15 }
}
```

Write case studies as `portfolio/systems/urm/problems/multi-membership.md` (or `.portfolio/problems/` inside the repo):

```md
---
number: 1
title: Moving from single-membership to multi-membership architecture
summary: The original system assumed a user could only have one membership.
role: [Designed the new architecture, Refactored core components, Added migration scripts]
tradeoffs: [More complex data model, Increased testing effort]
result: [Supports multiple memberships, No breaking changes]
relatedPRs: [1234, 1240]
diagrams:
  before: { nodes: [...], edges: [...] }
  after:  { nodes: [...], edges: [...] }
---
## The Problem
…
```

## 4. Labels (optional, for the log)

In System repos create labels `portfolio:hide` and `portfolio:highlight`. Without them, every merged PR you author is a log entry.

## 5. Webhook

On each System repo and the content repo (or once at org/user level):
- Payload URL: `https://<your-domain>/api/revalidate`
- Content type: `application/json`, secret = `GITHUB_WEBHOOK_SECRET`
- Events: Pushes, Pull requests, Releases, Repositories.
