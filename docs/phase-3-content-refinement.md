# Phase 3 content refinement

**Date:** November 8, 2026  
**Scope:** `/about`, `/cafe`, `/events`, `/community`, `/gallery`. Local implementation only. Homepage excluded.

## Requested corrections

| Correction | Status |
| --- | --- |
| Remove fabricated chronology; do not infer a replacement | Complete: timeline and its claims removed from About. |
| Remove founding essays and associated navigation | Complete: section and unused essays module deleted; gallery essay callout corrected. |
| Remove cafe simulator and fabricated payment details | Complete: state, tiers, simulator, explanatory claims, and client-only code removed. Cafe is now static. |
| Remove historical menu | Complete: menu interface, filters, and unused menu data module deleted. |
| Remove individual names from event archive | Complete: all 12 records reviewed, names removed from data, and name-bearing flyers withheld from display and deleted from public assets. No event detail routes exist. |
| Do not expand photographs | Complete: no new images imported. Existing 19 gallery entries retained; earlier report's count of 21 was incorrect. |
| Remove fabricated venue policy | Complete: removed from Events, facilities data, and volunteer descriptions. |
| Correct autonomous teams | Complete: unsupported six-group structure replaced with brief descriptions of supported Cafe, Events & Partnerships, and Fundraising activities. No social media, administration/meetings, recruitment, or wheat pasting listed. This is explicitly a selection, not a complete staffing chart. |
| Remove Daily Shift Standards | Complete: checklists, schedules, training requirements, and related UI removed. |
| Audit tone, accuracy, and historical framing | Complete: plain descriptions, past-tense operations, no impact claims or invented explanations for closure. Existing design tokens and useful filters/lightboxes preserved. |

## Evidence reviewed

- Original public `about.html`, `cafe+menu.html`, `events.html`, and `classes+workshops.html`: purpose, pay-high/pay-low intent, opening-night announcement, and community teaching approach.
- Archived Squarespace facilities screenshots (4.04.40, 4.04.46, 4.04.50 PM): cafe, art materials, multimedia room, library. The library page described lending as a future plan, contradicting the previous honor-system lending claim.
- Archived volunteer-team screenshots (4.07.17, 4.07.22, 4.07.28 PM): team coordination and categories. Owner corrections override conflicting responsibilities in these records.
- Archived event schedule screenshots (4.05.36, 4.05.45, 4.05.50 PM) and existing public flyers: dates, titles, and advertised activities. Original event-description and staff-role documents were consulted privately; no raw documents or personal contact records were published.

## Additional corrections and ambiguities

- Removed unsupported claims about salaries, corporate hierarchy, consensus meetings, volunteer certifications, plant counts, maintenance/compliance duties, library size, room capacity, anonymous distribution rules, and quantities of supplies distributed.
- Removed invented event collaborators, food offerings, clinical methods, frequencies, times, and specific bail-fund beneficiaries. Political education retains its subject matter in ordinary language.
- The Narcan flyer in `public/` advertises February 3 and a county program; it does not match the May 25, 2023 listing. It is no longer attached to that record. The old Renegade card conflated a January 7 poster with a December 2 collage event; it now describes the actual poster without inferring a year.
- The jazz poster contains names and separates a second-Thursday trio from a fourth-Thursday open jam. Only the documented open-jam details remain. Art therapy and capoeira times now match their posters; those posters are withheld because they include names. The political education illustration contains author names and is also withheld.
- Movie-night source text and poster disagree about the end time (8:00 versus 8:30 PM); time omitted. Narcan source gives a May 25 listing but a conflicting third-Thursday recurrence; recurrence omitted.
- Some event descriptions are plans, not proof of occurrence. Public framing and summaries say what records advertised/described. **Still needing verification:** whether undated proposed events occurred, precise dates/recurrences where omitted, and the year of the January 7 Renegade poster. No inferred dates are published.
- Individual gallery years were unsupported and removed. Precise photo dates still need verification. Captions were shortened to avoid inferred identities, affiliation, fundraising policies, or impact; the kit-making image is identified as a poster, not a photograph of volunteers.
- Closure reasons and a finer-grained organizational chronology remain unverified and are omitted. Operating years and nonprofit/pay-what-you-can identity follow the owner's authoritative account.

## Files changed by this refinement

- Pages: `src/app/{about,cafe,community,events,gallery}/page.tsx`.
- Data: `src/data/{community,events,facilities,photos}.ts`.
- Deleted unused modules: `src/data/essays.ts`, `src/data/menu.ts`.
- Deleted public posters containing names: `public/images/archival/flyer-{jazz.png,art-therapy.jpg,capoeira.jpg,revolution.jpg}`. Original archival materials remain in ignored references.
- Documentation: this report and `docs/project-status.md` (the existing file's casing; no duplicate uppercase status document created).

No shared component, global style, homepage asset, configuration, dependency, or backend changes were made by this refinement. The repository already had unrelated uncommitted changes; Git's overall diff includes those.

## Validation

- `npm run build`: passed after final content changes; all 9 static pages generated.
- `npm run lint`: passed without warnings/errors. `tsc --noEmit`: passed.
- Extra `tsc --noEmit --noUnusedLocals --noUnusedParameters`: only existing unused `Sparkles` and `BookOpen` imports in excluded `src/app/page.tsx`; no unused symbols in refined files. These were deliberately left untouched.
- Production HTTP checks: all six public routes returned 200; all internal links and fragments resolved, including the retained `facilities` anchor. All 27 unique rendered image URLs returned 200. All five legacy routes returned their expected 308 redirects.
- Built non-homepage output contains none of the removed section titles, simulator tiers, or prohibited terminology. Event data/output and both remaining displayed event flyers were reviewed for names. The four deleted posters return 404 at their old public URLs. No event detail pages or deleted-feature navigation remain.
- Existing responsive grids, stacking, padding, and reading widths reviewed in source; short pages have no fixed-height replacement sections. Useful event filters, gallery search, and lightboxes remain. Image/lightbox triggers now have keyboard-operable buttons; filters expose pressed state and gallery search has an accessible label.
- **Visual verification limit:** production preview starts, but browser tab creation fails through the connected browser tooling (`timeoutMs` error); the in-app browser is unavailable. Desktop/mobile screenshots and live interaction checks could not be completed. No visual pass is claimed.
- Homepage SHA-1 remains `b7370a3c4a1028988884b919a4b31bb41f062fe7`. Session-baseline comparisons also confirm shared header, footer, layout, and global CSS are unchanged. The homepage's pre-existing Git diff was preserved, not reverted.
- Whitespace checks passed for refinement files. Repository-wide `git diff --check` finds an existing trailing blank line in `.gitignore`, outside this task's scope.
- No new dependencies, backend work, deployment, or imported photographs.

Remaining review items are the historical ambiguities above and visual/interaction QA when browser tooling is available. Shared footer wording and homepage content remain outside this refinement's scope.
