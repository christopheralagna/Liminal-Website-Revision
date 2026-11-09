# Phase 4 B1 — framework and runtime compatibility

**Date:** November 8, 2026  
**Status:** B1 implemented and checked; stopped for owner review before B2–B5.

## Implemented

| Component | Before | B1 pin |
| --- | --- | --- |
| Node | 18.20.8 in the execution shell | 24.22.2, installed through existing nvm; official download checksum matched |
| npm | 10.8.2 | 11.19.1 bundled with Node 24.22.2 |
| Next.js / Next ESLint config | 14.2.35 | 16.4.5 |
| React / React DOM | 18.3.1 | 19.3.1 |
| React / React DOM types | 18.x | 19.3.0 |
| Node types | 20.x | 24.19.2 |
| ESLint | 8.57.1 | 9.39.5 (compatibility/deprecation caveat below) |

TypeScript remains 5.9.3 and Tailwind remains 3.4.19. Unrelated direct dependencies retain their previously installed versions; every direct dependency now has an exact version and the lockfile is updated. Stable package versions and peer requirements were checked in the npm registry; no prerelease, `--force`, or `--legacy-peer-deps` installation was used.

- Added `.nvmrc` and `.node-version` with the exact runtime; `package.json` requires Node 24.x. nvm installation does not replace Homebrew Node or alter the user's shell configuration; run `nvm use` in each project shell.
- Replaced removed `next lint` with `eslint . --max-warnings=0`. Migrated `.eslintrc.json` to `eslint.config.mjs`, retaining Core Web Vitals rules. Ignore historical `references/` so original archived websites are not treated as application source.
- Added `npm run typecheck`. Next.js required `jsx: react-jsx` and `.next/dev/types/**/*.ts` in TypeScript configuration; strict mode remains enabled.
- Kept Webpack explicitly in `dev` and `build` scripts to preserve the existing custom Webpack configuration. This avoids introducing a bundler migration alongside the framework upgrade.
- Scoped `outputFileTracingRoot` to this repository; this resolved a Next.js warning caused by an unrelated parent-directory lockfile.
- Disabled optional `agentRules` generation after dev startup created a managed `AGENTS.md`. The documented Next.js setting removes that generated-only file and prevents future startup from rewriting repository instructions.

These are compatibility changes within the approved architecture. No architecture redesign or new backend libraries were needed.

## Reproduce locally

With existing nvm installed:

```bash
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm ci
npm run typecheck
npm run lint
npm run build
npm run start
```

For development, use `npm run dev` instead of build/start. Both servers default to `http://localhost:3000`. If that port is occupied, use `npm run dev -- --port 3102` or `npm run start -- --port 3101`. Stop the process with Ctrl-C. Other version managers can use `.node-version`; verify `node --version` is `v24.22.2` before installing.

No database, Docker, credentials, or environment files are needed for the current public site. PostgreSQL/Prisma configuration, environment examples, migrations, seed scripts, database tests, and admin provisioning commands do not exist yet. Do not run commands from older backend plans as though implemented.

## Validation actually executed

| Check | Result |
| --- | --- |
| Pre-upgrade `npm run build` | Passed; captured all six public pages' prerendered HTML as a comparison baseline. |
| Node installation | Passed; nvm verified the official archive checksum. |
| `npm install --strict-peer-deps` | Passed; initial in-place resolution emitted a transient React 18/19 peer warning. |
| `npm ci --strict-peer-deps` | Passed from the new lockfile; no unresolved peer-dependency error. Remaining install warnings below. |
| `npm ls --depth=0` | Passed, matching pinned versions. |
| `npm run typecheck` | Passed under Node 24. |
| `npm run lint` | Passed with zero lint warnings/errors under Node 24. |
| `npm run build` | Passed under Next.js 16/Webpack; six public routes remain static. Final build has no tracing warning. |
| Development startup and HTTP | Passed under Node 24/Webpack; all six public routes compiled and returned 200. |
| Public production HTTP checks | Six canonical routes returned 200; all internal links/anchors resolved; 46 unique rendered asset URLs (images, JavaScript, CSS, fonts, icons) returned 200; five legacy redirects retained their 308 destinations; unknown-route behavior remains 404. |
| Prerendered content comparison | All six pages' main-content text, element order, layout classes, links, image attributes, and relevant accessibility attributes matched the pre-upgrade baseline. Framework scripts/preloads were excluded from this comparison. |
| Source preservation | All `src/`, public assets, active Prisma schema, proposed schema, and `.gitignore` matched the B1 baseline byte for byte. Earlier uncommitted Stage A revisions were preserved. |
| Native Chrome checks | Desktop homepage visually matched the baseline. Carousel keyboard movement advanced its counter; client-side Events navigation/filter selection and flyer modal open/Escape dismissal worked; gallery search produced its expected empty state. At 390 × 844, mobile gallery/home content displayed in a single column and the mobile menu opened and navigated to Home. These were representative manual checks, not an exhaustive automated browser suite. |
| `npm audit --omit=dev --audit-level=moderate` | Passed: zero production advisories reported at check time. |

The browser-tab connector still fails with a `timeoutMs` error; native Chrome controls supplied the manual visual/interaction checks instead. No database or authentication tests were run or claimed.

## Remaining tooling warnings

- npm marks **ESLint 9.39.5 deprecated/unsupported**. It is retained because the current React, import, and accessibility plugins bundled by `eslint-config-next` declare ESLint support only through 9. Next.js itself supports ESLint 10, but forcing that version would violate those plugin peer declarations. This is a development-tooling limitation, not a clean supported-linter claim. Revisit when the plugin set advertises ESLint 10 support; do not suppress peer checks to hide it.
- Full `npm audit` reports **eight moderate development-only findings**, originating from a minimatch denial-of-service advisory through the TypeScript ESLint dependency chain. The report suggests downgrading the Next lint config across major versions. No forced downgrade or incompatible transitive-major override was applied. The production audit reports zero findings. Advisory: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
- npm 11 reports an optional `fsevents` install script not covered by `allowScripts`. No new lifecycle-script approval was added; dev server behavior was checked separately.

There are no unresolved compilation, type, or lint errors and no observed public visual/content regression. The linter lifecycle warning and development advisories remain review items; B1 does not claim every development dependency is fully supported or advisory-free.

## Files and boundaries

- `package.json`, `package-lock.json`: pinned versions and compatible commands.
- `.nvmrc`, `.node-version`: reproducible project runtime.
- `eslint.config.mjs`; deleted `.eslintrc.json`: supported configuration format and CLI migration.
- `next.config.mjs`: repository-local file tracing root and optional agent-file generation disabled.
- `tsconfig.json`: required Next.js 16 JSX/type-generation configuration.
- `README.md`, `docs/project-status.md`, `docs/phase-4-backend.md`, and this report: current setup, results, warnings, and checkpoint.

No public source/style/content/URL changes, active schema changes, Prisma/auth installs, database services, migrations, seed data, admin interfaces, scheduling rules, or deployment. Do not proceed to B2–B5 until the owner reviews B1 and instructs continuation.

## Troubleshooting and review

- If Next reports an unsupported Node version, load nvm and run `nvm use`; the IDE's inherited shell can still resolve Homebrew Node 18 until its environment is refreshed.
- `next lint` no longer exists; use `npm run lint`.
- Do not remove `--webpack` while the existing custom Webpack hook is present unless intentionally testing a separate bundler migration.
- Use `npm ci` for the checked-in lockfile; do not run `npm audit fix --force` to silence the known development warnings.
- Runtime installation is separate from Git changes. To roll back B1, restore only its configuration/package changes from the pre-B1 version, preserve earlier uncommitted design edits, switch back to the prior runtime, and reinstall that version's lockfile. No database state needs rollback.
