# Liminal frontend design audit

Reviewed November 7, 2026. **Recommendation stage only; no frontend changes made.**

## Assessment

The implementation retains Liminal’s warm dark palette and some recognizable shapes, but it loses much of the original’s social energy. It currently feels like a quiet, carefully packaged archive of a cafe interior. The references feel like a place where people gathered, made things, organized, and belonged.

The highest-value direction is a people-centered community archive: confident geometric typography, the authentic illustrated identity, documentary photography, and stronger changes of color and scale. Keep the existing application and working content structure. This needs focused refinement, not a rebuild or a new design system imposed on the project.

There are also two concrete rendering/usability defects to fix before judging finer styling: the intended fonts are not being applied, and the mobile sticky header overlaps its archive notice.

## Evidence and scope

Both required visual sources were accessible. I visually examined all 35 PNGs in `references/squarespace-photos/`, independently of `docs/design-reference.md`, and inspected the running Next.js application at `http://localhost:3000/` in Chrome.

| Original reference group | Screenshots examined | Main evidence |
| --- | ---: | --- |
| `home/` | 7 | Logo, navigation, mission strip, gathering photo, resources, volunteer banner, support section, footer |
| `about/` | 8 | Introduction, facilities, founding story, cafe; typography and photo composition |
| `programming/` | 8 | Event flyers, schedules, hosting information |
| `volunteer/` | 9 | Overview, teams, cafe volunteering, application portrait |
| `donate/` | 2 | Fundraising hierarchy and angled photographic composition |
| `contact/` | 1 | Collage, contact hierarchy and repeated identity |

The homepage references run from the 4.02.52 PM capture through 4.04.00 PM. The 4.03.09 PM, 4.03.40 PM, and 4.03.48 PM captures are especially useful for comparing the first photo, resource circles, and volunteer section. The volunteer application capture at 4.08.00 PM establishes that the arch is a real original motif, but a selective one.

Current application inspection covered the entire desktop homepage and the entire homepage in Chrome’s **390 × 844 responsive viewport**, using overlapping visual inspections from hero through footer. Desktop inspection used the normal maximized browser window; screenshots were 2880 × 1750 physical pixels, not a measured CSS viewport. I also opened and closed the mobile navigation, followed section anchors, advanced the resource carousel, and opened the volunteer-team dialog on desktop.

Browser tab automation was unavailable because of a tool error; native Chrome control provided actual rendered visual inspection instead. This was not a source-only review. Source was consulted afterward to explain observed issues.

Limits: the originals are desktop still images, so they cannot establish original mobile behavior, animation timing, or keyboard behavior. Current mobile findings are emulation observations, not physical-device testing. This is not a comprehensive accessibility, performance, content-provenance, or cross-browser certification. No forms or transactions were submitted.

## What defines the original identity

### Composition and hierarchy

The original is direct and emphatic: an illustrated logo and simple horizontal navigation, a terracotta headline strip, a short bold mission statement, then a substantial documentary photo alongside hours and location. Large circular resource photos are followed by a people-filled volunteer banner and a support section. Color and photographs carry the hierarchy more than decorative UI components.

Interior pages vary that vocabulary with thin rust rules, alternating dark and terracotta fields, overlapping photographs, occasional arches, and lively event flyers. This variety is meaningful: it suggests a community with many contributors rather than one polished institutional voice.

### Type, color, and atmosphere

The dominant reference typography is a rounded/geometric sans serif with strong headings and approachable body copy. The screenshots do not establish an exact font family. Serif typography is not the site’s dominant visual signature.

Near-black, saturated salmon/peach, terracotta, and mustard/olive form the recognizable palette. These colors appear in substantial surfaces, not merely tiny accents. Peach text against dark grounds is particularly characteristic. Exact hex values cannot be authenticated from screenshots alone.

The original illustrated mark has four chairs around a broad leafy plant and outlined LIMINAL lettering. Its handmade gathering metaphor matters. Real people, crowded tables, plants, zines, mismatched furniture, and event posters reinforce that metaphor throughout the site.

### Preserve the intent, improve the execution

Preserve the warm palette, bold sans typography, illustrated mark, circles, occasional arch, collage, documentary photos, and frank community language. Do not reproduce low-contrast peach on the pale volunteer gradient, small dense essays, uneven event listings and missing-image placeholders, repetitive oversized footer content, generic “Learn More” labels, or tinting that obscures photographs. Browser/editor controls and thumbnail overlays in captures are not design elements.

The existing design reference is useful direction, not proof of fidelity. Its rounded-card guidance is a modernization choice: the original resource cards are substantially squarer. Its palette and accessibility claims need verification in the implemented combinations. The archive notice is a legitimate new requirement rather than an original visual pattern.

## Five highest-impact improvements

### 1. Restore the typography and authentic identity

**Current problem:** Navigation, body text, and large headings render in a browser-default-looking serif. This makes the page feel formal and editorial, weakens the original’s approachable boldness, and changes line wrapping everywhere. The logo substitutes two benches and a thin plant for the original chairs, broad foliage, and outlined wordmark.

**Original treatment:** Confident geometric sans typography and an expressive, recognizable illustrated logo.

**Recommended change:** Fix font wiring first. `globals.css` and `tailwind.config.ts` reference `--font-montserrat` and `--font-serif`, but the source contains no definitions. Importing Google font CSS does not define these variables. An unresolved variable invalidates the declaration, so the later family names do not provide the intended fallback. Use explicitly defined font variables or real family names with reliable fallbacks. Retain the planned geometric sans for navigation, headings, and body text; reserve serif for occasional essay excerpts. Recover an authentic logo asset if available, or faithfully reconstruct the documented mark instead of retaining the current approximation.

Then tune scale against the actual rendered font: roughly 40–56 px desktop hero type, 30–36 px mobile, 16–18 px body, and comfortable reading measures around 55–70 characters. Treat these as starting ranges, not fixed specifications. Recheck wrapping before adjusting section heights.

**Why:** This repairs a defect affecting every screen and restores immediate recognition with relatively little structural work.

**Classification:** Fidelity + usability. **Priority:** First.

### 2. Put people and community activity back at the center

**Current problem:** The lead photo is an empty cafe table; the volunteer arch shows a chalkboard, plant, and jar; the support image shows an empty bar. Empty interiors repeat across sections. The arch crops handwritten content while giving a nonhuman subject enormous visual weight. The mobile volunteer section makes visitors traverse a large photo before reaching its explanation.

Image descriptions also contradict visible content: the lead image’s alt text describes people/children recording with microphones and zines; the support image’s description mentions pouring tea. Neither action is visible. The story facade visibly says “HEAD SPACE,” while its description refers to painted Liminal signage. A Liminal chalkboard is visible there, so this is a labeling/provenance question, not proof that the photo is unrelated.

**Original treatment:** People at microphones near the top, a full-width gathering photograph for volunteering, an occupied communal table for support, and actual people in the selective arch treatment.

**Recommended change:** Inventory existing original assets and map each section to its subject. Lead with the gathering/zine photograph, use an activity or volunteer portrait for volunteering, and use an occupied table or collective work scene for support. Keep interiors as supporting context. Use subject-specific focal points at each breakpoint; avoid cropping faces or readable signs. Place short factual captions below images instead of repeated heavy black label bars. Correct alt text to describe the selected asset. Establish the date/context of the facade image before presenting it as representative of a particular period.

Do not fabricate community photographs. If suitable originals are unavailable at sufficient quality, identify that limitation and use available documentary material honestly.

**Why:** Photography is the largest determinant of whether this feels like a living community’s history or a hospitality portfolio. Accurate labels also improve accessibility and historical trust.

**Classification:** Fidelity + usability + creative enhancement. **Priority:** Second.

### 3. Rebuild page rhythm with color, proportion, and fewer boxes

**Current problem:** Successive almost-black sections, generous repeated padding, thin borders, rounded cards, icon benefit boxes, and pill actions create a uniform marketing-page rhythm. The volunteer and mission headings are long and visually heavy. The first substantial photograph arrives too late. Resource photographs occupy relatively little of their card shells. The dark three-column footer ends the page without the original’s warm visual release.

**Original treatment:** A terracotta opening stripe, image-led resource cards with large circles, a photographic volunteer banner, and a terracotta location/contact area create distinct chapters. The collage and event flyers supply irregularity without requiring elaborate animation.

**Recommended change:** Keep the existing sections, but vary their treatment deliberately. Tighten the opening so mission and documentary evidence are encountered together. Increase resource-circle prominence and simplify card chrome. Give volunteering a broad people-focused photographic moment with a short headline and readable adjacent text; avoid an opaque tint over faces. Replace the four benefit boxes with a compact, plainly typeset list. Bring terracotta back as a substantial closing field with a concise historical location block. Use one restrained collage or poster grouping drawn from the archive, rather than inventing decorative shapes throughout.

Use a coherent spacing scale, with larger gaps between narrative chapters and smaller gaps within related content. Preserve breathing room without repeating the same section padding regardless of content. On mobile, introduce each chapter with its heading and a short explanation before a very tall image.

**Why:** The page gains memorable moments, faster comprehension, and local character while remaining orderly. The unconventional quality comes from authentic materials and composition.

**Classification:** Fidelity + creative enhancement. **Priority:** Third.

### 4. Make the archive navigation compact and dependable

**Current problem:** The persistent archive notice and header consume substantial space. At 390 px, the multiline notice overlaps the top of the logo as the page scrolls. Section anchors can place headings underneath the sticky stack. The header uses a fixed `top-[37px]` offset despite the notice changing height. “Explore Archive” also adds little distinction when it leads to the same story area as another navigation item.

**Original treatment:** A simpler, roomier logo/navigation header. It did not have the archival-status problem this version must solve.

**Recommended change:** Keep the closed/historical status unmistakable, but shorten the notice, with longer explanation in the opening or footer. Prefer one combined sticky container with natural internal sizing, or let the notice scroll away while the compact navigation remains. Set section scroll offsets to the real sticky height. Restore a legible authentic logo, use clear archive section labels, and remove or repurpose the redundant CTA. Ensure mobile menu and carousel controls have generous touch targets, ideally at least 44 × 44 CSS px.

**Why:** Visitors can see content and destination headings, recognize the brand, and understand the site’s status without fighting the navigation.

**Classification:** Usability + fidelity. **Priority:** Fourth.

### 5. Make the historical voice and interactions trustworthy

**Current problem:** The archive notice conflicts with prominent present-tense statements such as “Regularly open,” “we offer,” and “Donations are vital for us to stay open.” The footer’s “Portfolio-Quality Digital Archive” describes the developer’s ambition rather than Liminal. A prominent support quotation is attributed only to “Liminal Historical Archive,” which does not identify its historical source.

The volunteer-team dialog opens, but Escape does not dismiss it and focus remains on the trigger when opened. The carousel moves, but its fixed 420 px step can skip an intermediate mobile card rather than advancing one predictable item.

**Original treatment:** Present-tense invitations were appropriate for an operating community space. Historical framing is a new editorial responsibility. The original screenshots cannot establish dialog or carousel keyboard behavior.

**Recommended change:** Use past tense for archive summaries and label preserved original appeals as dated historical excerpts. Retain historical content rather than silently rewriting quoted records. Source quotations accurately; present unsourced editorial summaries without quotation marks. Replace the portfolio phrase with factual archive credits or preservation information.

Give dialogs initial focus, contained keyboard navigation, Escape dismissal, focus restoration, and a clear accessible name. Verify background scroll handling. Move the carousel by a measured card/page interval with clear current position, keyboard support, and reduced-motion handling. Keep animation modest: brief hover/focus feedback and optional short fades, with content immediately available and no compulsory scroll reveals or parallax.

**Why:** An archive should communicate the community’s history clearly and remain comfortable to use. Reliable controls will add more value than decorative motion.

**Classification:** Usability + fidelity to historical context. **Priority:** Fifth.

## Comparative evaluation across the requested dimensions

| Dimension | Assessment |
| --- | --- |
| Original identity | Partial: palette and circles remain; typography, mark, people-focused imagery, and color composition diverge substantially. |
| Aesthetic quality | Coherent foundation, but excessive uniformity and repeated component treatments flatten the experience. |
| Typography/readability | Readable cream-on-dark body text in many areas, but a font configuration defect undermines hierarchy and fidelity. Verify contrast numerically after palette refinements. |
| Layout/hierarchy | Logical section sequence; opening too diffuse, long headings and repeated spacious sections compete with the photographic story. |
| Imagery/composition | Most significant emotional weakness: too many empty spaces, mismatched descriptions, and crops that do not support section subjects. |
| Spacing/transitions | Consistent but monotonous. Restore deliberate alternation between text, photographs, and warm color fields. |
| Responsive behavior | Columns stack and no page-wide horizontal overflow was observed at 390 px. Sticky overlap, obscured anchor headings, and long image-first sections require attention. |
| Animation/interactivity | Menu, carousel, and dialog activate. Keyboard dialog behavior needs repair; additional motion is a low priority. Original motion is unknown. |
| Distinctiveness | Generic rounded shells and icon grids compete with the archive’s own richer visual material. Use flyers, photographs, the authentic mark, and selective collage. |
| Atmosphere/community | Warm colors alone do not convey collective life. Restore faces, activity, shared tables, and contributor-made artifacts. |

## Proposed implementation sequence after approval

1. Repair fonts and sticky positioning; establish baseline screenshots before aesthetic adjustments.
2. Restore the mark and curate original image/alt-text/caption mappings, resolving uncertain provenance explicitly.
3. Refine the existing hero, resources, volunteer, mission, and footer treatments with the color and composition strategy above.
4. Clarify historical framing and repair dialog/carousel accessibility while preserving content and working functionality.
5. Inspect the revised full homepage alongside the original references, then run build and lint checks.

Acceptance should include desktop and 390 px visual comparisons plus narrow-phone, tablet, and wide-desktop checks; legible loaded and fallback fonts; no sticky overlap or hidden anchor headings; intentional photo focal points; accurate descriptions; clear historical status; keyboard-complete dialogs; touch-friendly controls; reduced-motion behavior; and contrast verification for actual text/background combinations. Test zoom and long text as well as ideal viewport sizes.

No backend changes, publishing, frontend edits, build, or lint were performed for this audit. Implementation remains pending the user’s approval.
