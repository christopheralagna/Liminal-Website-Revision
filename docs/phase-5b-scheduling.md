# Phase 5B — shift scheduling

Implemented, refined, and approved November 10, 2026. Assignment management remains Phase 5C and has not begun.

## Coordinator workflows

`/admin/scheduling` opens a Sunday–Saturday **weekly calendar** in America/Phoenix. Previous/next links and a date picker navigate weeks. Shift cards show the stored shift type, local time, status, and detail link. Overlapping shifts remain separate cards; overnight shifts appear on both days with continuation labels. Canceled shifts are hidden unless **Show canceled shifts** is selected. The responsive grid becomes day sections on smaller screens.

**Chronological list** is the alternative view. Both views use independent multi-select operational-role and shift-type checkboxes, including inactive catalog entries needed to inspect history. Selections match with OR inside each category and AND between categories; an empty category is unrestricted. Role changes clear incompatible selected types with a visible notice. An incompatible URL selection remains visible with an explanation. Clear filters preserves dates, view, and canceled-shift visibility. Repeated UUID query parameters and paging/date inputs are validated on the server. Viewing ranges longer than eight weeks are accepted: reads use windows of up to 366 calendar dates and pages of up to 200 shifts, with explicit continuation links. These viewing bounds are separate from the 56-day generation limit. Filters are retained across view changes and navigation.

ADMIN and COORDINATOR can write; VIEWER can read. Each service entry independently checks live `scheduling:read` or `scheduling:write` permissions. UI restrictions never substitute for authorization.

- **Create one-time shift** (`/admin/scheduling/new`): select an operational role, then an active shift type belonging to it, followed by start/end dates, times, and capacity. Starts must be future; positive intervals cannot exceed 24 hours. Overnight shifts require an explicit next-day end date.
- **Shift details** (`/admin/scheduling/[id]`): inspect the schedule and all assignment history. Future scheduled shifts without any assignment rows can change times/capacity or be canceled individually. Historical/completed/canceled shifts remain read-only. Cancellation is not restorable here. Recurrence identity is retained under expandable record details.
- **Create repeating schedule** (`/admin/scheduling/patterns/new`): select an operational role and one of its active shift types, then one weekday, Phoenix local start, duration, capacity, Repeats from, and optional inclusive Repeats until. The operation adds up to eight weeks of shifts, stopping earlier at the selected end date.
- **Repeating schedules** (`/admin/scheduling/patterns` and `/[id]`): show the rule separately from actual calendar coverage: weekday/time, Repeats from/until, number of shifts in SCHEDULED status, and latest scheduled **actual** local start date. No continuous-coverage claim is made. Canceled records remain available in a collapsed history list.

Creation forms link to **Manage shift types**; inline type creation has been removed. Changing the selected role resets the shift-type choice. Server validation independently requires the definition's stored role to match the submitted role for both one-time and repeating creation. Dates are bounded to 2000–2099, capacity to 1–1000, and repeating duration to 1–1440 minutes. Form defaults are not historical operating policies.

## Shift type catalog

`/admin/scheduling/types` groups all shift types by their stored operational role. `/types/new` creates a type under an active role; `/types/[id]` provides details and management. ADMIN/COORDINATOR can create, rename, deactivate, reactivate, or delete a truly unused type. VIEWER sees read-only catalog/details. No schema change or additional association was required.

Renaming changes the label displayed on existing and historical shifts; the form explains this before saving. For a different meaning, create a new type and deactivate the old one. The role association is fixed for all existing types, so updates cannot silently reclassify historical schedules. Reactivation under an inactive role is blocked. Inactive types remain visible in history and filters but are excluded from new-shift choices and further generation until reactivated.

Permanent deletion requires zero referencing Shift **and** ShiftPattern rows, including historical/canceled shifts and stopped schedules with no occurrences. The detail page explains reference counts and offers deactivation instead. A transaction locks the definition, checks its version, and rechecks every reference; existing restrictive foreign keys remain the final safeguard. New scheduling/generation reads acquire a shared definition lock so deletion/deactivation cannot race their active-type validation. Updates retain `updatedAt` stale-edit protection and creations retain stable form UUIDs. No shift, pattern, assignment, or role association is changed by catalog management. Operational roles still confer no administrative access.

## Extend, shorten, or cancel

**Extend repeating schedule** adds shifts using the existing weekday, time, and capacity. Each request accepts one to 56 inclusive calendar dates. If a bounded Repeats until precedes the requested end, extension moves that boundary forward in the same transaction. Existing shifts, overrides, and canceled dates are skipped rather than replaced. Extending a previously shortened schedule does not restore canceled shifts.

**Shorten repeating schedule** chooses an earlier inclusive Repeats until. In one transaction it updates the rule and cancels future SCHEDULED shifts whose actual Phoenix **start date** is after the selected date. This includes moved exceptions. A shift starting on the selected date is retained even if it ends overnight. Past, in-progress, completed, and previously canceled shifts remain unchanged. The rule can still add missing shifts within its shortened range.

**Cancel repeating schedule** stops further repetition and cancels all remaining future SCHEDULED shifts. It also works on a previously stopped rule with remaining future shifts. Historical/completed/canceled records remain unchanged. Changing weekday/time can be handled by canceling the old schedule and creating a new one; the interface no longer presents successor-pattern revision.

For both bulk operations, **any assignment row** on an affected future shift—including canceled/completed assignment history—blocks the entire operation. Feedback lists links and dates for the shifts requiring attention. Nothing is partially canceled, and assignments are never updated or deleted. The older ending/revision service commands remain protected and tested for compatibility, but have no normal user-facing controls. No recurrence-versioning engine was added.

## Save responses and validation

**Known unresolved issue:** intermittent React Server Component `enqueueModel` / closed-writable-stream errors have occurred after successful mutations. The application appears operational, and the revised save paths passed the browser checks recorded below, but the exact trigger remains uncertain and the intermittent issue is not considered resolved. Inspect the saved record before retrying after an overlay; the database mutation may already have committed.

The writable-stream problem was reproduced in native Chrome. A valid insert committed and the Server Action returned HTTP 200, followed by multiple detail-page requests and browser errors `Cannot write to a CLOSED writable stream` / `Cannot close a CLOSED writable stream`. An intermediate change removing only the extra refresh still reproduced a React Flight `enqueueModel` error followed by closed-stream errors.

Those earlier one-time-shift tests associated the errors with the post-save client navigation path interacting with the action's revalidated React Server Component response. Successful creation/edit navigation now happens through **Next's server-side redirect after commit/revalidation**. In-place changes use the action's own revalidation response. Scheduling forms issue no `router.replace()` or `router.refresh()` calls. Framework redirect control flow is rethrown rather than treated as a network failure. Revalidation is scoped to affected routes. No overlay suppression, dependency upgrade, or database retry was introduced.

The final path was browser-tested: a fresh valid one-time shift saved, redirected to its details, and canceled in place, with no new stream errors in the development log. This records a successful smoke check, not proof that the intermittent issue is resolved; no claim is made about a specific upstream framework defect.

Forms use explicit inline handling of native constraint failures plus shared Zod contracts; server Zod validation remains authoritative. Errors identify relevant fields, mark them with `aria-invalid`/`aria-describedby`, focus an alert summary, and offer controls to focus invalid fields. Date/time errors appear next to the end date. Values remain after rejection. Pending disables submission; transport-error text acknowledges that a save might have committed and asks the user to inspect the schedule. Stable form UUIDs are retained on retries: a repeated same-ID creation cannot insert another record. A newly opened form is a distinct creation request.

### Further shift-type `enqueueModel` investigation

The later report occurred in the remaining inline type-creation path, which returned success while revalidating its source form and the other creation route. It had no explicit client refresh, so the earlier one-time-shift diagnosis alone does not establish its cause. Existing development logs contain `enqueueModel` failures, but do not identify an application rendering stack.

A controlled inline attempt in this session created a synthetic type in PostgreSQL and showed success without reproducing the error. By that attempt the catalog payload had already been narrowed from whole Prisma records to the plain IDs/names used by client forms; the original failure was therefore not fully isolated. No attribution to Date serialization or to a framework defect is claimed.

The new catalog uses dedicated pages and server-managed redirects after create, update, and deletion, with scoped revalidation of the catalog and affected schedule/detail routes. Only necessary plain fields are sent to client forms. The new creation redirect and rename/deactivation were tested successfully in native Chrome, with no new stream errors in the development log. No error boundary or overlay suppression was added, and dependencies were not upgraded. The exact trigger of the originally reported inline failure remains unconfirmed; the verified result is the replacement workflow's successful tested lifecycle.

## Identity and transactions

The existing additive `20261110000000_shift_occurrence_date` migration is unchanged. It supplies immutable recurring `(patternId, occurrenceDate)` identity, its unique index, the recurring/one-time nullability check, and the identity-preserving trigger. `(patternId, startsAt)` uniqueness also remains. One-time shifts have null recurrence identity.

The original migration backfilled only two deterministic seed IDs with established original dates (January 4/6, 2027). Unknown recurring records or changed seed intervals stop the migration before schema/data changes; current timestamps or matching weekdays are insufficient evidence. The isolated-schema ambiguity test remains. Seeds still create missing synthetic fixtures without overwriting edits. **This refinement adds no schema or migration changes, performs no resets, and edits no applied migration.**

Generation enumerates local calendar weekdays before converting Phoenix times to absolute timestamps. It does not add fixed UTC weeks. Initial generation spans the effective start through 55 days later, clipped by the effective end. Reads never generate shifts. Non-Phoenix rules remain readable; adding shifts is Phoenix-only, while shortening/cancellation explicitly use the application's Phoenix calendar display dates.

Pattern generation, extension, ending, shortening, cancellation, and legacy revision share a parameterized pattern-row lock. Bulk operations lock eligible shifts in stable ID order, then recheck current status/start and assignment counts before writing. Individual occurrence changes lock the pattern first when applicable and then the shift. `updatedAt` versions prevent stale mutations; generation/extension advance the pattern version. Future assignment writers must honor the shift-lock convention. Failures roll back the entire operation, and unexpected errors are sanitized.

## Local VIEWER / COORDINATOR accounts

Use the repository's Node 24 environment and configured local development database:

```sh
nvm use
npm run db:up
npm run auth:provision-test-user
```

Choose `VIEWER` or `COORDINATOR`, enter a name and unused email (for example, a local test identity under `example.invalid`), then enter and confirm your own password of 12–128 characters. Password input is hidden. Do not pass passwords as shell arguments. The command prints neither credentials nor hashes and issues no session.

Start the app with `npm run dev`. In a separate private browser session, open `/admin/login` and sign in using the email/password you entered. VIEWER should have calendar/list/details and no mutation controls. COORDINATOR should have scheduling controls. Existing ADMIN credentials remain unchanged.

`scripts/provision-test-user.ts` reuses the existing interactive provisioning pattern and `verifyTarget` development guard. `provisionLocalTestUser` also checks the URL and actual database/user identity, rejects production, allowlists VIEWER/COORDINATOR, and serializes duplicate-email checks. Better Auth's unmounted signup API handles hashing/linking; the role is assigned server-side transactionally. Existing users are never overwritten. Public signup and HTTP auth configuration are unchanged. Only integration tests can explicitly select the separately guarded test database target.

## Verification and remaining checks

Focused tests additionally cover catalog creation/rename/deactivation/reactivation, unused deletion, historical/pattern reference blocking, role mismatch rejection, multi-select/empty filters, stale catalog edits, new-reference versus deletion races, and catalog rollback. They also cover bulk shortening/cancellation, all-or-nothing assignment blocking, rollback after SQL writes, historical and assignment preservation, extension after cancellation, immutable identity, duplicate generation, stale versions/races, save/redirect response contracts, invalid date fields, calendar dates/overlaps/overnights/filtering, VIEWER rendering/authorization, and local account creation/login/target guards/duplicate refusal. Existing legacy tests remain except intentionally updated UI wording and viewing-range expectations.

Native Chrome interactions successfully verified required-field and reversed-date feedback with retained values, successful one-time creation and server redirect, individual cancellation, seven-day week rendering/navigation, hidden/shown canceled shifts, shift-type filtering, list switching with retained filters, and a desktop visual inspection. The extension connector remained broken, so the native browser interface was used. Three synthetic demo one-time shifts created during reproduction/final verification (November 20–22, 2026) remain on record as **CANCELLED**; no test shift or assignment was deleted. That earlier owned preview server was stopped.

Current catalog/filter browser checks also verified dedicated type creation and redirect, rename/deactivation, one-time role-first type selection/reset, two-role/two-type calendar filtering, visible incompatible-type clearing, and Clear filters preserving the week/canceled setting. Two clearly labeled synthetic catalog types created for these checks remain inactive; no user-defined type was changed or deleted. The dedicated browser tab was closed and the already-running user development server was left running.

Still manual: catalog reactivation/deletion controls and reference-blocking feedback, multi-select interactions in the list view, VIEWER/COORDINATOR interactive sign-in, repeating-schedule creation/extension/shortening/full cancellation and blocked-assignment feedback, overnight/overlap visuals, long-range pagination in a browser, keyboard-only traversal beyond tested form controls, and narrow-screen layout. Integration/SSR checks for these behaviors do not establish browser verification. No deployment was performed. Phase 5C has not begun.

Final catalog/filter validation (Node 24.22.2): **76 PostgreSQL integration tests passed**, **17 unit tests passed**, ESLint passed with zero warnings, TypeScript passed (including the production build's check), and production build passed. All six public routes remain static and public source/assets are unchanged. Prisma schema validation and `git diff --check` passed. The refinements added no dependencies or further migrations and performed no reset or deployment. The original additive occurrence-date migration is included with Phase 5B.
