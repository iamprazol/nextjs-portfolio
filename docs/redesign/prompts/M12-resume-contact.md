# M12 — Résumé & contact

> **Preamble:** Branch `design-update`. One commit per step.

---

### Step 12.1 — Generated résumé

```
src/app/resume/page.tsx: one-page résumé composed from getProfile, getStats, getSystems
(role + proves + stack), getTimeline (years + highlights), getLog highlights (portfolio:highlight).
Print stylesheet (@media print: light tokens, A4, no nav/footer, links shown as text).
"Download PDF" button triggers window.print(). Same data, no separate résumé content.
Commit: "feat(resume): generated printable resume"
```

### Step 12.2 — Contact

```
Rebuild the contact form at /about#contact in the new design (labels, 44px inputs, inline
validation, success/error states with aria-live). Keep posting to the existing /api/contact
route unchanged. Add a honeypot field and basic rate limiting (in-memory per IP, 5/hour).
Commit: "feat(contact): redesigned form with spam protection"
```
