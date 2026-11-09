# Liminal Project Status & Context Summary

**Updated:** November 8, 2026  
**Current work:** Phase 4 Stage A architecture review and database proposal prepared; awaiting explicit approval before Stage B.  
**Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.

## Project scope

Liminal was a nonprofit community center and pay-what-you-can cafe in Flagstaff, Arizona, operating from 2021 to 2023. This repository contains a public historical website and plans for a separate administrative demonstration application.

## Public website

- `/`: Existing homepage preserved byte for byte during this refinement, along with its shared header, footer, layout, styles, and dependencies.
- `/about`: Plain-language account of the space and activities, with facility cards. Fabricated chronology and essay section removed.
- `/cafe`: Concise historical cafe description. Fabricated pricing simulator and detailed menu removed, including their unused data modules.
- `/events`: Filterable records with brief, source-based descriptions. Individual names removed, including posters containing names. Unsupported dates, organizers, and elaborations removed; planned descriptions distinguished from confirmed events.
- `/community`: Participation and supported volunteer team activities. Fabricated venue policy, unsupported team structures, and daily shift standards removed.
- `/gallery`: Existing collection retained without additions. Unsupported captions and individual image dates removed; search and lightbox retained. Obsolete essay callout corrected.
- Legacy redirects remain in `next.config.mjs`, including `/facilities` to `/about#facilities`.

See [Phase 3 content refinement](phase-3-content-refinement.md) for source notes, open questions, modified files, and validation details.

## Historical evidence and privacy

The owner's firsthand corrections override earlier project documents and conflicting source descriptions. `docs/phase-3-completion.md` records the earlier implementation, **not a verified historical account**; its claims about the timeline, simulator, venue policy, and complete verification are superseded. `docs/historical-content.md` is a research aid whose assertions must be checked against original records, not treated as automatically true.

Original materials remain in ignored `references/`. Do not publish private applications, contact lists, tax records, or raw internal documents. Use only reviewed public assets. Missing information is a reason to omit a claim or document uncertainty, never to invent it.

## Validation and limits

Production build, configured lint, and standard TypeScript checks passed. The extra unused-symbol check reports only two existing homepage imports; the homepage is excluded from edits. Browser preview is blocked by the local browser connector; responsive structure was reviewed in source. Full validation details are in the refinement report.

## Backend and working tree

The existing `prisma/schema.prisma` is an uninstalled SQLite draft. No backend dependencies, migrations, seed, authentication, or administrative features are implemented.

Stage A deliverables are [the backend proposal](phase-4-backend.md) and [the complete proposed PostgreSQL schema](proposals/phase-4-schema.prisma), separate from the active schema. Recommendations: one Next.js app, Prisma 7/PostgreSQL, Better Auth email/password with database sessions, three application roles, configurable volunteer roles/qualifications, weekly recurrence, and a basic synthetic financial ledger. Inventory, budgets, historical operating rules, and venue-vetting policy are excluded.

Installed Next.js is 14.2.35 and local Node is 18.20.8. The proposal requests approval for a supported Node 24 / Next.js 16 / compatible React upgrade before auth implementation; nothing has been upgraded. Exact dependency compatibility, Prisma validation, migrations, seed, auth testing, and database availability remain unverified. Stage A changed documentation only. Existing architecture/workflow/roadmap documents remain earlier proposals; Phase 4 implementation must follow the approved design and firsthand corrections rather than their unsupported assumptions.

The working tree already contained uncommitted Phase 2/3 work at the start of refinement, including homepage changes and untracked routes/docs. Those changes were preserved. No commit or deployment was performed. Do not assume the working tree is clean. Stop at the Stage A checkpoint until the owner explicitly approves the design and prerequisites; do not begin Stage B or Phase 5 yet.
