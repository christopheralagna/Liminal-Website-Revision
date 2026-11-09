# Phase 5A — volunteer management

Implemented November 9, 2026. Phase 5B has not begun.

## Functionality and use

Open `/admin/volunteers` to list all profiles, filter active/inactive records, or open a volunteer by name. ADMIN and COORDINATOR accounts can create a record or save changes to its name, optional email, status, operational roles, recurring weekly availability, and optional food-handler dates. VIEWER accounts see read-only details and no mutation buttons. Volunteer records do not create login accounts; the existing optional account link is preserved but is not editable here.

All changes on the detail form, including window removal and deactivation, are applied with **Save changes**. Fields remain available after validation errors. The button is disabled while saving; success returns to the saved detail record with a confirmation. Deactivation retains the profile and every historical shift assignment. There is no delete-profile control. Existing operational roles are checkboxes, including clearly marked inactive catalog entries; role catalog administration remains deferred. Multiple roles are supported and confer no application access.

Availability is grouped by weekday (Sunday = 0). New windows default to America/Phoenix and today's Phoenix calendar date; the suggested times are editable form defaults, not recorded operating hours. Existing windows retain their timezone and ID. Times are stored as minutes since midnight with an exclusive end, including 1440 through the explicit “Ends at midnight” checkbox. Overnight availability uses two windows on adjacent days. Effective start/end dates are inclusive calendar dates; an omitted end is unbounded. Multiple windows are allowed. Within the same timezone and weekday, windows that overlap both clock time and effective dates are rejected; adjacent clock times and disjoint effective dates are allowed. No timezone picker, eligibility enforcement, prediction, or historical inference was added.

Food-handler dates are independent optional calendar dates. When both are recorded, expiration cannot precede issuance. Missing information is explicitly unknown. Dates do not imply validity, role eligibility, or a certification requirement. There are no uploads, reminders, or renewal history.

## Files and data flow

- `src/app/admin/(protected)/volunteers/page.tsx`: protected list, status links, create link, detail links.
- `src/app/admin/(protected)/volunteers/new/page.tsx` and `[id]/page.tsx`: creation and detail routes.
- `src/components/admin/VolunteerEditor.tsx`: Server Component retrieves authorized editor data and serializes dates/times.
- `src/components/admin/VolunteerForm.tsx`: small client form with profile, role, availability, certificate fields, pending state, and feedback.
- `src/app/admin/(protected)/volunteers/actions.ts`: Server Action calls the protected mutation and revalidates dashboard/list/detail on success.
- `src/server/volunteers/validation.ts`: Zod input contract, time conversion, certificate/effective-date ordering, overlap policy.
- `src/server/volunteers/service.ts`: independently protected detail/catalog retrieval and transactional mutation.
- `tests/integration/volunteers.test.ts`: real Better Auth/PostgreSQL mutation, integrity, authorization, and rendering checks.

Initial retrieval runs on the server through `readAdminPage` and the service. Each read checks `volunteers:read` before Prisma. A submitted React form calls the Server Action, which passes only allowlisted validated values through the service to a Prisma transaction and PostgreSQL. Each mutation independently checks the current Better Auth session and live database permissions using `requirePermission("volunteers:write")` before validation or domain queries. ADMIN and COORDINATOR pass; VIEWER and unauthenticated callers receive safe errors, including direct service/action invocations. Client-supplied identities, roles, permissions, and account links cannot grant access. Next's existing same-origin Server Action protection remains in use.

The transaction updates the profile, reconciles memberships, and creates/updates/removes availability together. Uniqueness and foreign keys remain enforced. Availability IDs are checked for ownership; new windows use create rather than upsert so concurrent collisions cannot modify someone else's window. Each profile form carries the retrieved `updatedAt` version: a conditional update locks the profile and rejects stale concurrent edits. Creation uses a stable per-form UUID, so repeats cannot create duplicate profiles. An already-created response asks the user to open the saved record from the list. Related failures roll back the whole save. No mutation touches account links or shift assignments. Unexpected auth/database errors return generic feedback and are not logged or serialized to the browser. Invalid or nonexistent detail IDs return not-found; database outages remain distinguishable from empty data.

No schema, migration, dependency, seed, auth configuration, public website, or administrative shell changes were needed.

## Verification

Executed with the pinned Node 24.22.2. The dedicated test database URL and live database/user identity are verified by the existing guard before tests apply committed migrations. Synthetic test accounts use the real library, current sessions, RBAC, and SQL. Only Next request-context/singleton/cache/navigation wiring is replaced. Tests remove only their unique fixtures afterward.

- Unit/contract tests: 11 passed.
- Full PostgreSQL suite: 46 passed at the first completion pass (37 existing plus nine new); final targeted and validation results recorded below.
- New tests cover creation/editing, activation/deactivation, multiple roles and removal, availability creation/editing/removal, certificate dates, invalid inputs, nonexistent IDs, duplicate submissions, VIEWER and missing-session direct mutations, read-only rendering, stale edits, and preservation of historical assignments.
- Rollback checks run real SQL mutations, then force PostgreSQL division-by-zero before transaction commit. Both the profile and memberships remain unchanged; the UI result contains no database internals. Invalid role/window ownership also rolls back preceding writes.
- Browser interactions remain unverified: Chrome's tab connector returned `Cannot read properties of undefined (reading 'timeoutMs')`. Native Chrome selection took over eight minutes and only returned unrelated browser state. No successful browser form interaction, login, or responsive visual check is claimed. Server-rendered viewer form checks are integration checks, not browser verification.
- Initial test execution used the shell's old Node and failed to start Vitest; switching to the pinned Node resolved it. Sandbox loopback initially denied PostgreSQL access; the approved local-database execution passed. Next's generated page-prop check caught an optional default argument; the signature and existing rendering tests were corrected.

## Limits and Phase 5B readiness

Phase 5A stores availability and certification information without making scheduling eligibility decisions. The form requires JavaScript. Concurrent edits require reloading and reapplying changes; automatic merging is not implemented. The list is intentionally unpaginated for approximately 25 active volunteers. Existing non-Phoenix zones are preserved and shown; overlap comparisons apply within a zone, with conversion across zones deferred. No account management, audit history, notifications, scheduling/assignment mutations, calendar synchronization, event management, finance, generalized qualifications, or production deployment was introduced. Stage C deployment limitations still apply.

Phase 5B can reuse the protected admin shell, live permission checks, operational-role catalog, validated local-time/date conventions, volunteer IDs/status, stored availability, transaction/error conventions, and guarded PostgreSQL testing. Shift creation, recurrence generation, assignment rules, and related concurrency/eligibility decisions remain separate future work.

Final validation after the availability collision hardening:

- `npm run test:db -- tests/integration/volunteers.test.ts`: **10 passed**, including simultaneous stale edits and shared-window-ID collision protection. The preceding full suite was **46 passed** before this additional case; the unchanged 37 existing integration cases were not needlessly repeated.
- `npm run typecheck`: passed.
- `npm run lint`: passed, zero warnings.
- `npm run build`: passed. All six public routes remain static; volunteer list/detail/new routes are dynamic.
- `git diff --check`: passed. No unresolved test failures; browser interaction verification remains the limitation above.
