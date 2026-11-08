# Liminal Application Architecture Specification

This document defines the high-level architecture, technology stack, directory structure, security model, and application boundaries for the Liminal full-stack web platform.

---

## 1. Architectural Strategy & Technology Stack Evaluation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LANDSCAPE                             │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │     PUBLIC HISTORICAL ARCHIVE   │   │    NONPROFIT ADMIN MANAGEMENT   │  │
│  │   (SSG / ISR / Server Components│   │ (Authenticated Dynamic SSR / CSR│  │
│  │   Fast, SEO-Optimized, Visual)  │   │  Role-Based Dashboards & Forms) │  │
│  └────────────────┬────────────────┘   └────────────────┬────────────────┘  │
│                   │                                     │                   │
│                   ▼                                     ▼                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        NEXT.JS 15 (APP ROUTER)                        │  │
│  │       Server Components • Server Actions • REST Route Handlers        │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         DOMAIN SERVICE LAYER                          │  │
│  │   • VolunteerService   • FinancialService   • EventService   • Auth   │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     DATA ACCESS LAYER (PRISMA ORM)                    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          POSTGRESQL DATABASE                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack Selections & Justifications

| Layer | Selected Technology | Alternative Considered | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | Vite + React SPA | App Router enables optimal hybrid rendering: Static Site Generation (SSG) for historical archive pages (instant load, perfect SEO) combined with authenticated Server Components and dynamic Client Components for the administrative system. |
| **Styling Engine** | **Tailwind CSS** | CSS Modules / Styled-Components | Utility-first architecture allows exact color and typographic tokens matching the Squarespace design reference without CSS bloat, and provides responsive ergonomics out of the box. |
| **Language** | **TypeScript (Strict)** | JavaScript | End-to-end type safety spanning database models, domain DTOs, API contracts, and UI component props. |
| **Backend Architecture** | **Modular Next.js Server Architecture** *(Pre-factored for NestJS extraction)* | Separate NestJS Microservice | Per user requirements, we avoid introducing a separate NestJS server immediately. Instead, we encapsulate backend domain logic into pure TypeScript service modules (`src/lib/services/`). This delivers a frictionless single-repository development workflow while maintaining a clean boundary that can be extracted into NestJS later if needed. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | Drizzle ORM / TypeORM | Prisma's declarative schema modeling, automatic migration engine, type generation, and relational query syntax are ideally suited for complex relational structures (shifts, conflicts, roles, ledger items). |
| **Authentication** | **NextAuth.js (Auth.js v5)** | Custom JWT / Clerk | Self-hosted, privacy-conscious authentication with email/password and OAuth support, database session persistence, and zero vendor lock-in. |
| **Testing** | **Vitest + Playwright** | Jest + Cypress | Vitest provides sub-second unit and integration test execution with native TypeScript and ESM support; Playwright delivers reliable cross-browser E2E testing for complex volunteer scheduling and admin workflows. |

---

## 2. Monolith vs. Microservice Decision Matrix

The user requested an evaluation of a separate NestJS backend service.

### Recommendation: Unified Modular Monolith (Phase 2–4), Optional NestJS Split (Phase 6+)
1. **Developer Velocity**: Running both frontend and backend within Next.js App Router eliminates CORS configuration issues, port collisions, multi-process orchestration in local development, and dual-deployment complexity.
2. **Type Sharing**: Domain types, validation schemas (Zod), and database models are shared directly between UI forms, server actions, and route handlers without external packages or code generation.
3. **Clean Architecture Boundary**:
   - All business logic lives in `src/server/services/` (e.g. `VolunteerScheduleService`, `FinancialLedgerService`).
   - Server Actions and Route Handlers (`src/app/api/`) act strictly as thin transport controllers that validate input with Zod and delegate directly to services.
   - If external consumers (e.g., mobile apps, external non-profit networks) require a dedicated microservice later, these pure service classes can be ported directly into NestJS controllers and modules with minimal friction.

---

## 3. Proposed Repository Directory Structure

```
Liminal_Website_2.0/
├── docs/                             # Project documentation & architecture specs
│   ├── resource-inventory.md
│   ├── historical-content.md
│   ├── design-reference.md
│   ├── operational-workflows.md
│   ├── architecture.md
│   ├── database-design.md
│   └── development-roadmap.md
├── references/                       # Historical archives (read-only)
├── prisma/
│   ├── schema.prisma                 # Declarative database schema
│   ├── migrations/                   # Sequential SQL migrations
│   └── seed.ts                       # Synthetic demonstration seed data
├── public/
│   ├── images/
│   │   ├── archival/                 # Optimized historical photos & flyers
│   │   └── branding/                 # Liminal logos, icons, favicons
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public historical website route group
│   │   │   ├── page.tsx              # Historical homepage
│   │   │   ├── our-story/page.tsx    # Founding history & philosophy
│   │   │   ├── facilities/page.tsx   # Cafe, library, art room, multimedia room
│   │   │   ├── programming/          # Event archive & past calendars
│   │   │   ├── volunteer-history/    # History of volunteer teams & barista training
│   │   │   ├── archive/              # Searchable photo & document gallery
│   │   │   └── menu/page.tsx         # Historical cafe menu & pay-high/low model
│   │   ├── (admin)/                  # Authenticated management application
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/        # Operational metrics & coverage overview
│   │   │   │   ├── volunteers/       # Volunteer roster, availability, training
│   │   │   │   ├── schedule/         # Shift scheduler, calendar, conflict engine
│   │   │   │   ├── finances/         # Ledger, receipts, revenue/expense reports
│   │   │   │   ├── events/           # Event pipeline, vetting, staffing needs
│   │   │   │   └── inventory/        # Supplies, library, harm reduction counts
│   │   ├── api/                      # REST API endpoints & webhooks
│   │   │   ├── auth/[...nextauth]/   # Auth.js handler
│   │   │   ├── volunteers/           # Volunteer management endpoints
│   │   │   ├── shifts/               # Shift assignment & swap API
│   │   │   ├── finances/             # Ledger & reporting API
│   │   │   └── events/               # Event pipeline API
│   │   ├── layout.tsx                # Root layout with fonts & theme
│   │   └── globals.css               # Tailwind directives & CSS variables
│   ├── components/
│   │   ├── public/                   # Public archive UI components
│   │   │   ├── Header.tsx            # Header with logo & nav
│   │   │   ├── Footer.tsx            # Historic footer & disclaimer
│   │   │   ├── ArchiveBanner.tsx     # Permanent 2021-2023 archive notification
│   │   │   ├── ResourceCarousel.tsx  # Olive card circular carousel
│   │   │   ├── FacilitySection.tsx   # Alternating photo/text feature block
│   │   │   └── ArchedPhoto.tsx       # Historic arched masonry photo mask
│   │   ├── admin/                    # Administrative UI components
│   │   │   ├── AdminSidebar.tsx      # Admin navigation
│   │   │   ├── ShiftCalendar.tsx     # Interactive calendar grid
│   │   │   ├── ConflictBadge.tsx     # Scheduling conflict alert pill
│   │   │   ├── FinancialTable.tsx    # Transaction ledger table
│   │   │   └── MetricCard.tsx        # Dashboard KPI cards
│   │   └── ui/                       # Reusable accessible primitives
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Input.tsx
│   ├── server/                       # Backend domain logic (NestJS-ready)
│   │   ├── auth/                     # RBAC rules, session checks, password hashing
│   │   ├── services/                 # Pure business logic services
│   │   │   ├── VolunteerService.ts   # Scheduling & conflict logic
│   │   │   ├── FinanceService.ts     # Ledger calculations & monthly totals
│   │   │   ├── EventService.ts       # Event review workflow & staffing
│   │   │   └── InventoryService.ts   # Stock management & threshold alerts
│   │   └── validators/               # Zod validation schemas
│   └── lib/                          # Shared utilities
│       ├── prisma.ts                 # Prisma client singleton
│       ├── utils.ts                  # Classnames, date formatters, currency helpers
│       └── constants.ts              # System roles, department types, default shift hours
└── tests/
    ├── unit/                         # Vitest unit tests (services, algorithms)
    ├── integration/                  # Vitest API route & database tests
    └── e2e/                          # Playwright browser end-to-end tests
```

---

## 4. Security, Authentication & Role-Based Authorization

### User Roles & Permission Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                       ROLE HIERARCHY                        │
│                                                             │
│  [ BOARD_ADMIN ]      Full access across all domains,       │
│         │             financials, settings & users          │
│         ▼                                                   │
│  [ COORDINATOR ]      Manage volunteers, shifts, events,    │
│         │             inventory; view financial summaries  │
│         ▼                                                   │
│  [ BARISTA ]          Manage own shifts, claim swaps,       │
│         │             view cafe recipes & shift checklists  │
│         ▼                                                   │
│  [ GENERAL_VOLUNTEER] Claim non-cafe tasks, view schedules  │
└─────────────────────────────────────────────────────────────┘
```

1. **Role Enforcement**:
   - Server-side middleware protects `/admin/*` routes, redirecting unauthenticated users to `/login`.
   - Domain services enforce method-level permission checks (e.g., only `BOARD_ADMIN` can modify ledger entries or export sensitive financial records).
2. **Audit Logging**:
   - All mutations in administrative domains (shift reassignments, conflict overrides, financial adjustments) record an `AuditLog` entry with user ID, timestamp, entity type, and before/after state diff.
3. **Environment Security**:
   - Zero hardcoded secrets; configuration via `.env.local` validated at startup via `@t3-oss/env-nextjs` or a Zod environment schema.

---

## 5. Deployment & Infrastructure Strategy

- **Application Hosting**: Vercel or standard Node.js Docker container (deployable to Railway or Render).
- **Database**: Managed PostgreSQL instance (Supabase, Neon, or Railway Postgres).
- **Object Storage**: S3-compatible bucket (e.g., Cloudflare R2 or Supabase Storage) for uploaded receipt images and high-resolution historical gallery assets.
- **CI/CD Pipeline**: GitHub Actions running linting, TypeScript compilation, Vitest suite, and Playwright end-to-end tests on pull requests.

