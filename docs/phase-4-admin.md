# Phase 4 Stage D — administrative interface

Implemented November 9, 2026. Phase 5 remains unimplemented.

## Routes and layout separation

The root `src/app/layout.tsx` retains the HTML document, shared font/global CSS, and historical metadata. The public banner, header, main landmark, skip link, and footer now live in `src/app/(public)/layout.tsx`. Parenthesized route groups do not appear in URLs: all six public pages keep their URLs and byte-for-byte page source. Public components, styles, assets, schema, migrations, seed, dependencies, and authentication configuration are unchanged.

`src/app/admin/layout.tsx` provides separate administrative presentation and no-index metadata. Administrative routes are dynamic Node server-rendered pages. `/admin/login` is outside the `(protected)` group; `/admin`, `/admin/volunteers`, and `/admin/scheduling` share the protected shell. That shell identifies the current account, provides three navigation links, and includes sign-out. Navigation wraps on narrow screens; tables scroll horizontally rather than compressing their contents.

## Request flow and server/browser responsibilities

1. The login page runs on the server. It calls `requireUser`; an active session redirects to `/admin`. A missing session renders the form. Configuration/database failures show a generic unavailable message.
2. `src/components/admin/AuthControls.tsx` runs in the browser. Its labeled email/password form uses native input validation, password-manager autocomplete, pending/disabled states, and safe error messages. It sends JSON to the existing same-origin `POST /api/auth/sign-in/email` endpoint using `fetch`. Passwords are never logged or stored by the UI. Better Auth alone validates credentials and creates the database session.
3. The browser receives Better Auth's HTTP-only cookie and automatically sends it on subsequent same-origin requests. Browser JavaScript does not read the cookie. Successful login performs a full navigation to `/admin` to discard previous rendered state.
4. Server Components call the small server-only query module in `src/server/admin/queries.ts`. Every exported operation calls `requirePermission` itself before querying Prisma. The protected layout independently calls `requireUser`; layout protection alone is insufficient because Next can render children independently. No successful authorization or query results are cached across requests.
5. Prisma `count` queries populate the dashboard. `findMany` queries select only display fields and related operational memberships/assignments for the tables. No credential, session, profile email, certificate, or account-link fields are selected for these views. Data is rendered on the server; there is no new administrative JSON API or Server Action.
6. Sign-out posts to the existing Better Auth endpoint, which deletes the session and clears its cookie. Only a successful response navigates to login. Subsequent protected requests reject the old session.

All ADMIN, COORDINATOR, and VIEWER accounts have `volunteers:read` and `scheduling:read` under the existing permission matrix. They can view these three pages. Stage D introduces no write operations, so it does not require an ADMIN-only `requireRole` restriction. Exact-role and write-permission helpers remain available for future appropriately protected operations; no permissions were broadened.

`src/server/admin/page-access.ts` converts unauthorized reads into login redirects, insufficient permissions into safe denial text, and unexpected errors into a generic unavailable state. The underlying query functions still reject unauthorized direct calls. Database failures never become empty results. Public pages import none of these services and remain independent of PostgreSQL/authentication configuration.

## Recorded data and limits

The dashboard displays calculated counts of ACTIVE volunteer profiles, active operational roles, SCHEDULED shift records, and ASSIGNED assignment records on SCHEDULED shifts. Scheduled counts include past dates with that recorded status; assignments count rows, not distinct people. The UI explains these definitions and identifies seed records as synthetic rather than historical operations.

The volunteer table shows name, status, and recorded role memberships; inactive roles are labeled. Operational roles do not grant application permissions. The shift table shows all recorded occurrences, required role, start/end dates and times in America/Phoenix, recorded status, capacity, and non-cancelled assignments with their status. Empty datasets have explicit messages. These are demonstrations of recorded data, not eligibility checks or scheduling recommendations.

No create/edit/delete controls, shift generation, assignment management, conflict detection, availability rules, event/finance/account UI, signup, recovery, or new database structures were added. The existing permission checks, read services, shell, tables, and error handling can be reused in Phase 5; every future mutation still needs its own service authorization and applicable transaction/concurrency rules.

## Verification checkpoint

Executed using Node 24.22.2:

- `npm test`: **11 passed**.
- `npm run test:db`: **37 passed** (19 foundation, 15 existing auth, three Stage D integration cases).
- `npm run typecheck`: passed after regenerating stale Next route types created before the route moves.
- `npm run lint`: passed, zero warnings.
- `DATABASE_URL= TEST_DATABASE_URL= BETTER_AUTH_URL= BETTER_AUTH_SECRET= npm run build`: passed. All six public pages remain static; all four admin routes and auth are dynamic.
- Production HTTP smoke checks with those four variables blank: all six public URLs returned **200**; all four admin URLs returned safe unavailable content without protected data.
- Configured local preview HTTP checks: login returned **200**; `/admin`, `/admin/volunteers`, and `/admin/scheduling` each returned **307** to `/admin/login` without a session.
- Read-only source comparison confirmed all six moved public pages are byte-for-byte identical to HEAD; no changes to public components/assets/styles, schema/migrations/seed, dependencies, or auth configuration. `git diff --check` passed.

New integration cases use real Better Auth sessions and guarded dedicated-test PostgreSQL queries to exercise direct access denial for every read, all three read roles, live database count changes, field minimization, post-logout and disabled-user rejection, server-rendered login redirects/pages, empty table content, and sanitized permission/database errors. Only Next request-context/singleton wiring and redirect signaling are replaced. Empty/error scenarios use narrowly scoped query failures/results, not database deletion or infrastructure resets. Existing authentication, hashing, sessions, Prisma queries, and RBAC execute unchanged in real integration checks.

Browser verification is incomplete: the in-app browser was unavailable, Chrome's tab connector failed with a `timeoutMs` error, and the native fallback was unusually slow. No desktop/mobile browser interactions, successful form login, or browser logout are claimed. Responsive layout was reviewed in source; server-rendering and HTTP checks are automated verification, not browser interaction checks. An initial database run was blocked by sandbox loopback access and rerun with permitted local access. A new rendering assertion initially used the wrong HTML attribute capitalization; after correction the complete 37-test suite passed.

No real administrator was created. The existing `.env` lacked both Better Auth variables and was left untouched. Preview used an ephemeral random secret held in the server process only. Synthetic accounts were created through the established test library/provisioning workflow in the dedicated test database and cleaned up afterward. No development account or credential writes were performed.

## Local usage

Use the existing ignored `.env`; do not overwrite it. Add `BETTER_AUTH_URL=http://localhost:3000` and an independently generated random `BETTER_AUTH_SECRET` of at least 32 characters following the [authentication provisioning guide](phase-4-authentication.md#local-administrator-provisioning). Keep the secret in `.env` and out of source, logs, and command arguments.

```bash
nvm use
npm run db:up
npm run auth:provision-admin  # Once, in your interactive terminal; hidden password prompts
npm run dev
```

Open `http://localhost:3000/admin/login`, enter your provisioned account, and use **Sign out** in the shell when finished. Provisioning refuses an existing administrator and does not reset passwords. Subsequent runs need only `db:up` and `dev`. Database setup/migrations are already present; see the backend guide if setting up a fresh checkout.

Stage C deployment limits still apply: production HTTPS/secrets/database operations, trusted ingress and IP headers, per-process rate limiting, monitoring/cleanup, and a future reviewed recovery workflow. Disabled accounts are denied on subsequent checks; in-flight requests are not retroactively cancelled. A previously delivered page cannot be recalled from a browser, so shared machines should always sign out. No production deployment or Phase 5 work was performed.
