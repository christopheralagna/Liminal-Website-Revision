# Phase 4 Stage C — authentication and authorization

Implemented November 8–9, 2026. Stage D is now implemented; see the [administrative interface guide](phase-4-admin.md). Phase 5 remains unimplemented. This document records the Stage C authentication foundation.

## Architecture

Better Auth **1.7.18** is now an exact runtime dependency. Its Prisma adapter uses the existing lazy server-only Prisma 7.10.1 / PostgreSQL client. No schema, migration, synthetic seed, public page, or public asset changed. The approved 12-model foundation remains intact. Runtime and schema generation share the `role` / `isActive` additional-field definitions, with `input: false`.

`src/server/auth/index.ts` initializes authentication only on demand. `src/app/api/auth/[...all]/route.ts` runs on Node, forwards Web Requests to the library handler, and disables caching. The handler exposes these Stage C operations:

| Method / path | Behavior |
| --- | --- |
| `POST /api/auth/sign-in/email` | Email/password login; optional same-origin callback URL. |
| `GET /api/auth/get-session` | Current active user's database session, or null. |
| `POST /api/auth/sign-out` | Deletes the session and clears its cookie. |
| `POST /api/auth/sign-up/email` | Always rejected by Better Auth's `disableSignUp`, including direct server API calls. |

All other HTTP auth operations return 404. Stage D now provides login and read-only administrative UI; no signup UI exists. Public pages never import authentication or database services and remain usable without PostgreSQL or authentication environment variables.

Better Auth owns credential creation, its default password hashing, cookie signing, and session lifecycle. Passwords are 12–128 characters. Sessions are stored in PostgreSQL and expire **eight hours after creation** without rolling refresh. Cookie session caching is disabled: deleted/expired sessions and changed user records take effect on subsequent requests. Logout invalidates replay of the old cookie. Cookies are HTTP-only and SameSite=Lax, with Secure enabled on HTTPS; production configuration rejects HTTP. CSRF and origin checks are explicitly enabled, including in tests; callback destinations must be trusted. Unrecognized accounts, wrong passwords, and disabled-account logins receive generic credential errors. Library logging is disabled to avoid raw request/adapter error output.

A session-creation hook checks current active status. Session lookup suppresses disabled accounts. Permission helpers read the current user from PostgreSQL again and never accept a caller-provided identity or role. Disabling a user denies subsequent protected requests; existing session rows remain until logout/expiry or explicit revocation. Re-enabling an account can restore an unexpired session. Permanent session revocation requires deleting its session rows through trusted server logic; no account-management UI is included.

## Authorization services for Stage D

Import from `src/server/auth/permissions.ts` inside server code:

```ts
await requirePermission("volunteers:write");
await requireRole("ADMIN");
const user = await requireUser();
```

These helpers use Next's request-scoped `headers()`. `requireRole` is an exact role check, not a hierarchy. `AuthorizationError.status` is 401 for absent/invalid sessions and 403 for insufficient permissions; disabled sessions appear unauthenticated. Future handlers/actions must translate these errors to safe responses and call authorization within each protected service operation before reading or writing data. Frontend visibility and middleware are insufficient. Do not cache successful authorization across requests. When future mutations need atomic coordination with concurrent role/account changes, perform the check and protected mutation inside the same appropriately locked transaction.

| Permission | ADMIN | COORDINATOR | VIEWER |
| --- | --- | --- | --- |
| volunteers:read, scheduling:read | Yes | Yes | Yes |
| volunteers:write, scheduling:write | Yes | Yes | No |
| events:read, events:write | Yes | Yes | No |
| finances:read, finances:write, accounts:manage | Yes | No | No |

Event/finance/account permission names reserve boundaries for future services; no such business operations were built. Operational volunteer role memberships and certificates grant no application permissions.

## Local administrator provisioning

1. Use Node 24 (`nvm use`), install dependencies, and follow the existing [database setup](phase-4-backend.md). Keep the existing ignored `.env`; do not overwrite it.
2. Add `BETTER_AUTH_URL=http://localhost:3000` and an independently generated `BETTER_AUTH_SECRET` of at least 32 random characters to `.env`. Use a password manager or `node:crypto.randomBytes(48).toString("base64url")`; keep the secret out of source, logs, and command arguments. The example placeholder is rejected. Use the exact browser origin, including port; localhost and 127.0.0.1 are distinct origins.
3. Run `npm run auth:provision-admin` in an interactive local terminal. Enter the name, email, password, and confirmation when prompted. Both password entries are hidden. Do not put a password in a shell command, environment variable, or source file.

The CLI accepts **no arguments**, requires a TTY, refuses production mode, restricts itself to the approved local development database, and checks the live database/user identity before writes. Its `react-server` Node condition enables the `server-only` marker for trusted local tooling. It prints only generic failures or success; no password, hash, session, or raw error is printed.

Provisioning obtains a PostgreSQL transaction advisory lock, rejects any existing ADMIN (including disabled ones) or an existing target email, and invokes Better Auth's supported `api.signUpEmail` on a separate **unmounted, local-only instance**. That instance alone enables signup with auto-login disabled. Better Auth performs validation, hashing, user creation, and credential linking through the transaction-bound Prisma adapter. Trusted code promotes the newly created user to ADMIN in the same transaction. A failure rolls back all new records. Concurrent bootstrap attempts serialize; duplicates never reset credentials. No session or volunteer profile is created. No public provisioning endpoint or administrator seed exists.

No real administrator was provisioned during implementation; tests use unique synthetic identities in the dedicated test database and remove them afterward. Subsequent accounts, password recovery, and role management require a separately approved workflow. This bootstrap command deliberately cannot replace an existing administrator.

## Tests and verification

```bash
npm test
npm run test:db
npm run typecheck
npm run lint
npm run build
```

Use Node 24. Database tests require the existing `TEST_DATABASE_URL` and `npm run db:up`. Tests verify target URL and live database identity, apply committed migrations without resets, and never fall back to the development database. Auth tests create unique synthetic users through the real library API, exercise the same handler used by Next, and remove only their own users/accounts/sessions. They do not mock authentication, hashing, sessions, Prisma, or RBAC. The `server-only` marker alone is replaced for Vitest's Node environment.

The 15 auth integration cases cover provisioning (including concurrent and duplicate attempts), valid/invalid login, HTTP-only cookies, persistence, logout replay, missing/tampered/expired/deleted sessions, disabled users, every role/permission combination, live role revocation, privileged field inputs, direct unauthorized service calls, CSRF/origin/redirect rejection, login rate limiting, Secure cookies, and fixed expiry. Two environment tests verify fail-closed secret/origin configuration. The existing nine unit/schema and 19 database tests remain included.

Actual completion results are recorded in [the backend checkpoint](phase-4-backend.md).

## Deployment considerations and remaining limits

- Production requires an explicit HTTPS origin, independent random secret, TLS termination, a protected PostgreSQL connection, and access-controlled secrets. Local HTTPS cookie behavior is verified through Web Requests, not an actual deployed TLS proxy.
- Better Auth's memory limiter is enabled in every environment: five sign-in requests per IP per minute and 100 general requests per minute. It is per process, resets on restart, and is not a distributed abuse defense. Server-side `auth.api` calls bypass the limiter; only use them from trusted server code. The configured `x-forwarded-for` header must be overwritten by an ingress that prevents direct access to the app. Until that is configured, callers can spoof this header and evade IP limits. A production proxy/shared limiter decision remains deployment work; no extra schema or service was added.
- Explicit library origin/CSRF validation and SameSite cookies protect browser requests. Non-browser clients are still allowed to call login; origin checking is not an access-control substitute.
- No email service, OAuth, verification workflow, password-reset emails, MFA, account-management interface, audit subsystem, or production deployment was added. Email verification is not required for these locally provisioned credentials. Password loss currently requires a separately reviewed recovery procedure.
- Disabled accounts lose effective access on subsequent checks; in-flight operations are not retroactively cancelled. Database outages fail protected operations closed. The public static site continues independently.
- Do not log raw authentication request bodies, cookies, API results, or database exceptions in future UI/services. Safe operational monitoring and production cleanup of expired sessions remain deployment concerns.

## References checked

Current official [Next.js integration](https://better-auth.com/docs/integrations/next), [Prisma adapter](https://better-auth.com/docs/adapters/prisma), [email/password](https://better-auth.com/docs/authentication/email-password), [session management](https://better-auth.com/docs/concepts/session-management), and [rate limiting](https://better-auth.com/docs/concepts/rate-limit) documentation were checked against the installed 1.7.18 API, adapter transaction implementation, and signup code. Existing Prisma 7 is supported; no dependency upgrades or migration were needed. Next's installed Route Handler guide was also reviewed.
