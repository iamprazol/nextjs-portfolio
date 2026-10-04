# M13 — Freshness: webhook, cron, caching

> **Preamble:** Branch `design-update`. Read ARCHITECTURE.md §6. One commit per step.

---

### Step 13.1 — Webhook route

```
src/app/api/revalidate/route.ts (POST): verify X-Hub-Signature-256 (HMAC SHA-256 with
GITHUB_WEBHOOK_SECRET, timingSafeEqual). Map event + repository.full_name to tags:
any system repo → gh:systems, gh:system:<slug>, gh:log, gh:activity, gh:now;
content repo → gh:profile, gh:systems, gh:timeline; release → also gh:timeline.
Call revalidateTag for each; respond 202 with the tags. Reject bad signatures with 401.
Unit-test the signature check and mapping.
Commit: "feat(revalidate): github webhook handler"
```

### Step 13.2 — Cron

```
GET /api/revalidate?all=1 with Authorization: Bearer CRON_SECRET revalidates every gh:* tag.
Add "crons" to vercel.json: daily at 00:15 UTC.
Commit: "feat(revalidate): daily cron"
```

### Step 13.3 — Observability

```
Log (console.info, structured JSON) each revalidation and each GitHub call duration + remaining
rate limit. Add a dev-only /_data/health showing last fetch time per tag.
Commit: "chore: revalidation and github call logging"
```
