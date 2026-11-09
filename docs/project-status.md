# Liminal Project Status & Context Summary

**Updated:** November 9, 2026
**Current work:** Phase 4 Stages B1–B5 and C complete; stopped before Stage D.

**Stack:** Node 24.22.2, Next.js 16.4.5 App Router, React 19.3.1, TypeScript 5.9.3, Tailwind CSS 3.4.19.

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

The active `prisma/schema.prisma` now implements the approved **12-model PostgreSQL foundation** with Prisma 7.10.1 and its PostgreSQL adapter. Local PostgreSQL 17.11 development/test services have separate loopback ports, credentials, named volumes, and health checks. One additive migration is applied to both; custom SQL enforces date/time/capacity/email integrity. No database reset was used.

The seed creates 12 synthetic volunteers, three roles, 16 memberships, 24 availability windows, two recurring patterns, two shifts, and four assignments. It is transactional, repeatable, and preserves user edits/unrelated records. Zero users, credentials, or sessions are seeded. No private historical records were imported.

Better Auth 1.7.18's generated core schema is reconciled and retained as a development artifact. Stage C adds its runtime authentication route, database sessions, current-user RBAC, and guarded local administrator provisioning. There is no administrative UI or scheduling engine. See the [authentication guide](phase-4-authentication.md). Deferred event/finance/audit/qualification/coverage models remain absent. Role memberships and optional food-handler dates follow the approved simplified design.

Stage B validation: Prisma validation/generation, migrations/status, repeated seed, no-drift comparison, **nine unit/contract tests and 19 PostgreSQL tests**, TypeScript, and final lint/build passed. The public build and all six routes were verified with the project databases stopped. Existing public source/assets are unchanged; no visual testing was repeated. Details and known limits: [backend guide](phase-4-backend.md). Existing B1 development-tooling warnings remain documented and were not reinvestigated.

The server-only Prisma singleton is lazy; public pages need no database. `.env*` is ignored except `.env.example`; generated Prisma output is ignored and recreated on installation. Local mutation commands verify approved database targets and live database/user identity. No deployment was performed.

Stage C preserves the committed Stage B schema/migration, seed, and public site. Stage D is the next boundary: connect the authentication and permission services to an administrative interface. Phase 5 scheduling workflows remain future work.

Stage C completion validation: **11 unit/contract and 34 PostgreSQL tests passed**, TypeScript and final lint/build passed. All six production public routes returned 200 with database/auth variables blank. Interactive CLI checks verified hidden passwords and safe rejection; no real administrator was created. Production ingress/TLS/secrets, distributed abuse protection, monitoring/cleanup, and a future recovery workflow remain deployment considerations. Detailed results and the corrected test-mode origin-check issue are recorded in the [backend checkpoint](phase-4-backend.md#stage-c-completion-checkpoint--november-9-2026).
