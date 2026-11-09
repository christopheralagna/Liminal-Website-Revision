# Phase 4 backend foundation

**Updated:** November 9, 2026

**Status:** Stages B1–B5, C, and D implemented; [Phase 5A volunteer management](phase-5a-volunteers.md) now adds transactional volunteer mutations. Phase 5B scheduling remains deferred.

Stage D adds separate public/admin layouts, login/logout, protected dashboard and read-only volunteer/shift views. See the [administrative interface guide and verification checkpoint](phase-4-admin.md). Stage B/C completion sections below are historical checkpoint records.

Stage C adds the maintained Better Auth runtime, database sessions, centralized permissions, and guarded initial administrator provisioning. See [authentication architecture and operating guide](phase-4-authentication.md). The Stage B record below describes the original foundation checkpoint; its statements that authentication is absent are historical.

## Architecture and scope

One Next.js App Router application contains the unchanged public historical archive and the foundation for a future administrative interface. PostgreSQL stores synthetic administrative data only; public pages continue to use their existing static content modules. No admin pages, login, authentication handler, account provisioning, scheduling engine, or public deployment was added.

B1's Node 24.22.2 / Next.js 16.4.5 / React 19.3.1 baseline is retained. Stage B adds exact pins for Prisma CLI/client/PostgreSQL adapter **7.10.1**, `pg` **8.23.1**, Zod **4.6.7**, Vitest **5.1.0**, and tsx **4.23.15**. Better Auth and its `auth` CLI **1.7.18** are development-only schema tools at this stage. PostgreSQL reports **17.11**; Compose pins the official image by digest. No separate server or repository framework.

`prisma/schema.prisma` is now the active PostgreSQL schema. The [approved Stage A draft](proposals/phase-4-schema.prisma) remains unchanged as a design record. Older database/workflow documents describe unimplemented or superseded assumptions and must not override this implementation.

## Models and relationships

| Models | Purpose |
| --- | --- |
| `User`, `Account`, `Session`, `Verification` | Authentication-compatible tables only; no runtime authentication. Server-owned `ADMIN`, `COORDINATOR`, `VIEWER` role enum remains separate from operational roles. |
| `VolunteerProfile` | Volunteer identity/status with optional unique user link; optional food-handler issuance/expiration dates. |
| `VolunteerRole`, `VolunteerRoleMembership` | Configurable activities and many-to-many volunteer authorization. |
| `Availability` | Effective-dated weekly local-time windows. |
| `ShiftDefinition`, `ShiftPattern`, `Shift` | Work definition → weekly pattern → concrete occurrence; ad hoc shifts may omit a pattern. |
| `ShiftAssignment` | Links multiple volunteers to a shift; unique volunteer/shift pair and cancellation status. |

Exactly **12 models** and four application/domain enums. Event, finance, audit, generalized qualification, and coverage-request models remain deferred, including their foreign keys and enums. No historical operating hours, volunteer limits, certification requirements, or venue policies were inferred.

Operational foreign keys restrict deletion to preserve records. User deletion cascades accounts/sessions and sets an optional volunteer login link to null. Relevant foreign keys and schedule queries are indexed. Capacity is a positive integer; **aggregate capacity, overlapping shifts, role membership, timezone validity, pattern consistency, and availability eligibility are Phase 5 service rules**, not currently enforced by the database.

Food-handler fields describe the current certificate only. Null means missing information, not proof of validity; expiration cannot precede issuance when both dates exist. They do not grant membership or imply any role requires certification. Renewal history and expiry-day eligibility decisions remain deferred.

## Migration and auth-schema reconciliation

The additive migration `20261108000000_initial` creates the 12 tables and indexes. Applied successfully to separate development and test databases without resetting either.

Custom SQL checks enforce:

- Canonical trimmed lowercase, nonempty user email.
- Food-handler date ordering when both dates are recorded.
- Availability weekday 0–6, `0 <= startMinute < endMinute <= 1440`, and effective-date ordering.
- Pattern weekday 0–6, start minute 0–1439, duration 1–1440 minutes, positive capacity, and ordered validity dates.
- Concrete shift end after start and positive capacity.

Better Auth's exact generator/configuration produced [the committed schema artifact](generated/better-auth-1.7.18.prisma). `scripts/auth-schema.config.mts` is a schema-only configuration, never imported by application routes. It specifies UUID generation, signup disabled, and server-owned role/active fields. This is not a usable authentication service.

Reconciliation retained the generated core fields and nullability. Auth IDs use PostgreSQL-generated UUIDs; the active schema spells `gen_random_uuid()` without the generator's `pg_catalog` prefix because PostgreSQL introspection normalizes it that way. A read-only Prisma diff reports **no difference**. The domain still uses Prisma-generated UUIDs. Approved physical table names, native timestamp precision, application role enum, extra expiry indexes, and provider/account uniqueness were retained intentionally; the library adapter addresses Prisma models rather than requiring lowercase physical table names.

Stage C must integrate and test the real Prisma auth adapter, sessions, signup restrictions, permission checks, and secure provisioning. Generating compatible tables is not evidence that login or authorization works.

## Modules

```text
compose.yaml                         # Separate local dev/test PostgreSQL services and volumes
prisma.config.ts                     # Explicit Prisma 7 config and migrations path
prisma/schema.prisma                 # Active 12-model schema
prisma/migrations/                   # Additive migration and custom SQL constraints
prisma/seed-data.ts                   # Transactional, create-only synthetic fixtures
prisma/seed.ts                        # Guarded development seed entry point
src/server/database/environment.ts  # Zod URL parsing and strict local tooling targets
src/server/database/client.ts       # PrismaPg client factory for server/tooling
src/server/db.ts                     # Lazy server-only singleton, cached across dev reloads
scripts/database-target.ts           # Live database/user identity verification
scripts/database.ts                  # Guarded migration/status commands, no reset operation
scripts/auth-schema.config.mts       # Development-only schema-generation configuration
src/generated/prisma/                # Ignored; generated from the committed schema
vitest*.mts, tests/                   # Unit/contract and isolated database tests
```

No public code imports the new server modules. The server-only entry point validates its environment only when requested, so public rendering does not need credentials or a live database. CLI failures use safe messages; URLs/passwords are not printed. Integration test pool errors are sanitized to prevent reporter serialization of credential-bearing connection objects.

## Local setup

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
npm ci
cp .env.example .env
# Edit .env: choose separate random dev/test passwords and put matching URL-encoded
# passwords in DATABASE_URL and TEST_DATABASE_URL. Do not overwrite an existing .env.
npm run db:up
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:status
npm run dev
```

For this implementation session, random local passwords were generated directly into ignored `.env` (mode 0600), without printing them. No working administrator credentials or sessions were created. `.env*` is ignored except `.env.example`; generated clients are ignored. Existing archive/image exclusions were preserved.

Compose binds development to **127.0.0.1:5434**, database/user **liminal_dev**, and tests to **127.0.0.1:5435**, database/user **liminal_test**. Services have separate named volumes and readiness checks. `npm run db:stop` stops both without deleting data. `npm run db:up` restarts them. Do not use `docker compose down -v` unless intentionally deleting disposable data after separate review.

To connect without putting passwords in arguments:

```bash
docker compose exec postgres psql -U liminal_dev -d liminal_dev
docker compose exec postgres-test psql -U liminal_test -d liminal_test
```

These are local development database-owner accounts, not a production privilege design. If using another local PostgreSQL installation, create the same separate database/user identities on the documented loopback ports; guarded commands intentionally reject remote, renamed, or differently configured mutation targets until reviewed.

`db:migrate` calls **migrate deploy**, applying committed migrations; it does not reset or interactively resolve drift. Future schema changes should be generated as new migrations, reviewed (including custom SQL), and then applied through the guard. Initial SQL was generated with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --config prisma.config.ts` before custom checks were appended and applied. Do not regenerate or edit an applied migration.

The project `postinstall` generates the ignored client automatically after `npm ci`; `npm run db:generate` is also available explicitly.

`prisma.config.ts` uses a nonconnecting placeholder URL when no URL exists, permitting schema validation/generation without credentials. Migration and seed commands require the real URL, reject unapproved local targets, query database/user identity before writing, and refuse production mode. No reset/truncate/drop command is exposed. Public application configuration is not restricted to local URLs; only local mutation tooling is.

## Synthetic seed and tests

Seed contents: **12 volunteers** (10 active, two inactive), **three roles**, **16 memberships**, **24 availability windows**, **two weekly patterns/definitions**, **two concrete shifts**, and **four assignments**, including multiple volunteers on one shift. Fixtures use `Demo` labels, `@example.invalid`, fixed January 2027 demonstration dates, and reserved deterministic UUIDs. No historical/private records were read or imported.

The seed is one transaction of create-if-missing upserts. Reruns neither overwrite existing edits nor delete unrelated records. It is intentionally not a data-reset or fixture-synchronization command; unique-key collisions fail rather than overwrite user data.

```bash
npm test                   # Unit/contract tests; no PostgreSQL required
npm run test:db            # Real PostgreSQL tests; requires TEST_DATABASE_URL and db:up
npm run typecheck
npm run lint
npm run build
npm run start
```

The database suite refuses a development/remote target, applies the committed migration to the dedicated test database, and tests connection, schema inventory, seed repeatability/edit preservation, create/read/update, rollback, required fields, foreign keys, uniqueness, restrictive deletion, auth UUID/cascade/set-null relationships, and SQL checks. Individual test writes are rolled back; only known synthetic seed fixtures persist. It never resets or truncates the database, and never falls back to `DATABASE_URL` if the test URL is missing.

## Validation results and limitations

- Prisma validation/client generation, development migration/status/seed, and test migration: passed.
- Repeated development seed: passed. Live counts match the fixture summary; zero users/accounts/sessions seeded.
- Read-only live-database-to-schema comparison: passed, no difference detected.
- **Nine unit/contract tests and 19 database tests passed.** TypeScript and final full lint passed.
- Final production build with database URLs blank and both project databases stopped: passed; all six public production routes returned 200 while PostgreSQL remained stopped. No browser/visual repetition was needed; all pre-existing public source/assets match the Stage B baseline byte for byte.
- One later verification run was interrupted by premature database shutdown while preparing the offline check. Databases were restored, the local test credential was rotated, test pool error handling was hardened, and the targeted suite passed again. No failed/interrupted run is counted as passing.
- No login, authorization, provisioning, admin pages, scheduling algorithms, or production deployment tested or claimed. Existing B1 tooling warnings were not reinvestigated.

No substantial architectural deviation. Auth UUID default spelling/generation reconciliation, corrected client output path, native ESM extensions for tooling configurations, and explicit safety guards are implementation details of the approved design.

## Stage C readiness and Phase 5 questions

Stage C can use the generated client and reconciled authentication tables, but must implement/test the maintained authentication library and server-side RBAC. No public registration or administrator seed exists. Current application access roles do not confer operational volunteer roles, or vice versa.

Before Phase 5: settle availability warnings/overrides, one-off exceptions, recurring-pattern edits and preservation of assigned future occurrences, certificate applicability/expiry-day semantics, and cancellation/reactivation history. Capacity/overlap checks must be revalidated inside consistently locked transactions; the unique volunteer/shift key alone is insufficient. Do not add deferred domains until their workflows are approved.

Stage C is now implemented; no administrative interface or scheduling workflow has been started. Stop before Stage D.

## Stage C completion checkpoint — November 9, 2026

Stage C authentication and authorization is implemented. See [the authentication guide](phase-4-authentication.md) for architecture, permission boundaries, local setup, provisioning, tests, and deployment limitations. The schema, committed migration, synthetic seed, and all existing public source/assets are unchanged from the Stage B commit. Better Auth 1.7.18 moved from development-only tooling to a pinned runtime dependency; no library versions were upgraded.

Major additions: `src/server/auth/` (lazy library configuration, shared field contract, current-account authorization, request-scoped permission helpers, local provisioning), the Node `/api/auth/[...all]` Route Handler, `scripts/provision-admin.ts`, and real authentication integration/environment tests. Package scripts, the environment example, schema-generation configuration, Vitest server-only handling, README, and project status are updated.

Completion verification with Node 24.22.2:

- `npm test`: **11 passed** (existing nine plus two auth environment tests).
- `npm run test:db`: **34 passed** (existing 19 plus 15 real Better Auth/PostgreSQL cases). Includes concurrent initial provisioning, duplicate rejection, the complete permission matrix, stale session/role/disabled-account checks, and CSRF/rate-limit behavior. Only the guarded dedicated test database was used for account writes; synthetic auth records were cleaned up.
- `npm run typecheck`: passed.
- Final `npm run lint`: passed with zero warnings.
- One final `DATABASE_URL= TEST_DATABASE_URL= BETTER_AUTH_URL= BETTER_AUTH_SECRET= npm run build`: passed; six public routes remain static, and the auth route is dynamic.
- Production server smoke check with the same four variables blank: `/`, `/about`, `/cafe`, `/community`, `/events`, and `/gallery` all returned **200**. No public visual regression run was necessary.
- Provisioning CLI smoke checks: noninteractive execution refused; actual PTY input verified both password entries are hidden and a too-short synthetic password fails without provisioning. No real administrator or developer credentials were created.
- `git diff --check`: passed. Read-only comparison to the Stage B commit confirmed no schema/migration/seed or existing public source/assets changed.

Initial sandboxed database execution was blocked by loopback permissions; the suite was rerun with permitted local access. The first connected auth run found Better Auth's test-mode default skipping origin checks (33 passed, one failed). Explicit origin/CSRF settings corrected this; the full suite passed afterward, including strengthened provisioning concurrency and CSRF cases. Blocked/failed attempts are not counted as passing verification.

Confirmed protections include library-owned hashing/session lifecycle, endpoint-level signup rejection, HTTP-only SameSite cookies, Secure cookies on HTTPS, explicit origin/CSRF validation, fixed database-backed expiry, logout revocation, current-account permission checks, generic credential failures, server-owned role/active fields, and transactional local provisioning. Remaining deployment considerations are the per-process in-memory limiter and trusted ingress/IP-header configuration, actual TLS/secret/database operations, monitoring, expired-session cleanup, and future password recovery. No unresolved local implementation failure remains; no production deployment is claimed.

Stage D can connect login/session/logout endpoints and `requireUser`, `requirePermission`, and `requireRole` to future server operations and UI. No administrative pages, account-management system, event/finance functionality, or scheduling rules were built. Stop here before Stage D.
