# Phase 3 Completion Report: Public Historical Archive

**Date:** November 7, 2026  
**Status:** Complete — Ready for Review & Transition to Phase 4  
**Project:** Liminal Community Center & Cafe — Digital Historical Archive & Management Platform  
**Author:** Senior Full-Stack Software Engineer & UI/UX Specialist  

---

## 1. Executive Summary

Phase 3 has successfully transformed the initial single-page foundation of the **Liminal Community Center & Cafe** web application into a cohesive, multipage historical website. 

The website documents the authentic origins, social mission, physical architecture, community programming, volunteer structure, and economic equity model of Liminal during its active operating years (2021–2023) in Flagstaff, Arizona.

All pages adhere strictly to the visual identity, warm terracotta/charcoal palette, authentic illustrated branding, and accessible component standards established in Phase 2. All historical claims, menu items, event records, and philosophical essays are derived directly from primary archival sources without fabricated dates or facts.

The entire frontend passes all TypeScript checks, Next.js static site generation, and ESLint rules with **zero warnings or errors**. Sensitive documents and internal administrative files remain strictly isolated from version control.

---

## 2. Public Historical Route Architecture

The public application now consists of six canonical routes and five permanent redirects:

```
                                  ┌─────────────┐
                                  │   / (Home)  │
                                  └──────┬──────┘
             ┌──────────────┬────────────┼────────────┬──────────────┐
             ▼              ▼            ▼            ▼              ▼
       ┌───────────┐  ┌───────────┐┌───────────┐┌───────────┐┌───────────┐
       │   /about  │  │   /cafe   ││  /events  ││/community ││  /gallery │
       │ Our Story │  │ The Café  ││  Events   ││Volunteering││Photo Archive
       └───────────┘  └───────────┘└───────────┘└───────────┘└───────────┘
```

### 2.1. Home (`/`)
* **Role:** Architectural front door and curated executive summary.
* **Features:** Statement hero banner, historical sandstone location and hours, interactive circular-image community resources carousel, arched volunteer spotlight, community cost breakdown, and archival flyer collage from the community noticeboard.

### 2.2. Our Story & Philosophy (`/about`)
* **Role:** In-depth historical narrative exploring Liminal's origins, ideological framework, and physical spaces.
* **Key Content:**
  * The historical definition of "Liminal" (*"something that exists in-between things that are more familiar to us"*).
  * Critique of commercialized third spaces and neoliberal exclusion.
  * Paulo Freire popular education grounding.
  * Physical tour of all 5 facility spaces (*The Cafe Bar, Art Supply Room, Radical Library, Multimedia Space, Harm Reduction Station*).
  * Complete full-text co-founders' historical essays:
    1. *"Why should there be a cafe in a community arts center?"* by Christopher Alagna (Jan 27, 2021).
    2. *"Why am I Queer Before Anything Else? Identity Politics Eclipsing the Intended Value of Art"* by Ryan McElligott (Feb 18, 2021).
  * 2021–2023 Chronological timeline from initial buildout to respectful archival preservation.

### 2.3. The Café & Equity Model (`/cafe`)
* **Role:** Documentation of Liminal's pay-what-you-can hospitality operations.
* **Key Content & Interactivity:**
  * **Interactive Sliding-Scale Equity Simulator:** Allows visitors to test the 5 payment tiers ($0 Subsidized, $2 Reduced Wholesale, $4 Base Suggested, $8 Equity Supporter, $12+ Solidarity Champion) to understand how community surplus directly funded meals for neighbors.
  * **Authentic Menu Catalog:** Filterable by category (*All, Beverages, Small Plates, Vegan, Gluten-Free*). Includes craft pour-overs, cold brews, house-blended teas, *The House Drink*, and artisanal toasts/bowls crafted in partnership with local food cooperative *Evolve Eats*.
  * **Free Job Skills Education:** Documentation of the 2-weekend third-wave barista training offered to all volunteers.
  * Explicit retrospective disclaimer that the space is permanently closed and no longer accepting orders.

### 2.4. Community & Events Archive (`/events`)
* **Role:** Chronological exhibition of Liminal's workshops, cultural nights, and mutual aid assemblies.
* **Key Content & Interactivity:**
  * 12 verified historical events with accurate titles, dates, times, and organizers.
  * **Category Filter Pills:** Mutual Aid & Harm Reduction, Live Music & Culture, Political Education & Film, Community Arts & Gallery, and Community Gatherings.
  * **Archival Flyer Lightbox:** High-resolution modal inspect view for original event posters (*Sonoran Prevention Works Narcan training, Renegade Art Party, Open Jazz Jam, Queer Board Game Night, Wrecking Ball, Capoeira workshop, and NAU Graduate Student rally*).
  * **Anti-Oppressive Venue Agreement:** Historical documentation of Liminal's Venue Right of Refusal policy protecting marginalized attendees.

### 2.5. Volunteering & Collective Care (`/community`)
* **Role:** Exhibition of the 100% volunteer-run organizational structure and daily operational routines.
* **Key Content:**
  * **6 Autonomous Working Groups:** Detailed breakdowns of schedules, responsibilities, and training requirements for:
    1. *Café Baristas & Support Pool*
    2. *Events & Programming Collective*
    3. *Art Exhibition & Gallery Curators*
    4. *Mutual Aid & Harm Reduction Working Group*
    5. *Facilities, Carpentry & Plant Care*
    6. *Communications, Flyering & Outreach*
  * **Principles of Community Care:** Non-hierarchical governance, democratic Slack coordination, and anti-oppressive space agreements.
  * **Daily Shift Checklists:** Morning opening (10am–2pm) and afternoon closing (2pm–6pm) operational procedures, commercial espresso maintenance, and cash drawer reconciliation.

### 2.6. Photo & Media Archive (`/gallery`)
* **Role:** Interactive visual documentary catalog of Liminal's physical space and community.
* **Key Content & Interactivity:**
  * Curated collection of 21 archival photographs and promotional flyers.
  * **Live Keyword Search:** Instant search across image titles, room tags, and descriptions.
  * **Room & Category Taxonomy:** Filterable by Space & Rooms, Community Gatherings, Live Music, Arts & Supplies, and Mutual Aid.
  * **Accessible Lightbox Modal:** Full-view image modal rendered using HTML5 `<dialog>` with focus containment, Escape key dismissal, and historical room/year citations.

### 2.7. Legacy Route Compatibility
Configured in `next.config.mjs`, the following legacy URLs issue permanent (308) HTTP redirects to their canonical equivalents:
* `/our-story` $\to$ `/about`
* `/menu` $\to$ `/cafe`
* `/programming` $\to$ `/events`
* `/archive` $\to$ `/gallery`
* `/facilities` $\to$ `/about#facilities`

---

## 3. Historical Content Architecture

To prevent code bloat and decouple raw archival copy from presentation components, all historical records are modeled as strongly typed TypeScript data modules in `src/data/`:

| Module | Interface / Export | Items | Description |
|---|---|---|---|
| `src/data/essays.ts` | `HistoricalEssay` | 2 | Full co-founders' essays, author roles, dates, summaries, and paragraphs. |
| `src/data/facilities.ts` | `FacilityArea` | 5 | Architectural spaces, subtitles, descriptions, bulleted features, and image paths. |
| `src/data/menu.ts` | `MenuItem`, `EQUITY_MODEL_EXPLANATION` | 15 | Beverages and small plates with prices, descriptions, partner tags, and sliding scale tiers. |
| `src/data/events.ts` | `HistoricalEvent` | 12 | Event dates, times, categories, descriptions, organizers, and flyer image links. |
| `src/data/community.ts` | `VolunteerTeam`, `COMMUNITY_PRINCIPLES` | 6 | Volunteer working groups, schedules, responsibilities, and operational principles. |
| `src/data/photos.ts` | `ArchivalPhoto` | 21 | Photo catalog with categories, year, room tags, aspect ratios, and descriptions. |

---

## 4. Reusable UI Components & Visual Design

* **`PageHero` (`src/components/public/PageHero.tsx`):** Standardized editorial header for interior pages providing responsive typography and pill metadata.
* **`Header` (`src/components/public/Header.tsx`):** Sticky navigation featuring active link highlights (`usePathname()`), mobile drawer with $\ge 44 \times 44$ px touch targets, and Escape key listeners.
* **`Footer` (`src/components/public/Footer.tsx`):** Terracotta footer housing site navigation, historical location, operating hours, and Instagram link.
* **`ArchiveBanner` (`src/components/public/ArchiveBanner.tsx`):** In-flow top notification establishing 2021–2023 historical context.
* **`LiminalLogo` (`src/components/public/LiminalLogo.tsx`):** Authentic four-chair illustrated mark with responsive scaling and priority loading.
* **`ArchiveDialog` (`src/components/public/ArchiveDialog.tsx`):** Native modal dialog implementing HTML5 `<dialog>` semantics, background scroll locking, focus traps, and Escape key dismissal.
* **`ArchedPhoto` (`src/components/public/ArchedPhoto.tsx`):** Masonry arched window photo frame reflecting the historic building architecture.

---

## 5. Technical Quality Assurance & Verification

### 5.1. Code Quality & Linting
* **Command:** `npm run lint`
* **Result:** `✔ No ESLint warnings or errors`

### 5.2. TypeScript & Production Build
* **Command:** `npm run build`
* **Result:** Successfully compiled with exit code 0.
* **Prerendered Static Routes (9/9):**
  * `/` (9.34 kB)
  * `/_not-found` (875 B)
  * `/about` (188 B)
  * `/cafe` (6.31 kB)
  * `/community` (188 B)
  * `/events` (6.43 kB)
  * `/gallery` (6.23 kB)
* **Shared First-Load JS:** 87.3 kB across all pages.

### 5.3. Responsive Design & Accessibility
* **Mobile Viewport (390 × 844 px):** Clean single-column stacking, touch-friendly tap targets, no horizontal overflow, and fully accessible mobile navigation drawer.
* **Desktop Viewport ($\ge 1024$ px):** 12-column asymmetric grid layouts, comfortable reading measure (55–70 characters), and balanced whitespace.
* **Keyboard Navigation:** Full tab order throughout forms, carousels, and dialogs. Modals trap focus and return focus to triggering elements upon dismissal.

---

## 6. Privacy & Resource Hygiene

1. **Exclusion of Sensitive Historical Records:**
   * The root `.gitignore` strictly excludes `/references/`, `*.zip`, `*.tar.gz`, and raw uncompressed `*.MOV`/`*.mov` video files.
   * No volunteer phone numbers, home addresses, tax documents, or confidential records are committed or bundled.
2. **Curated Public Media:**
   * Only reviewed, high-quality public archive photos and event posters are published to `public/images/archival/`.

---

## 7. Known Limitations & Non-blocking Observations

1. **Event Detail Pages:**
   * The modal flyer inspect dialog (`ArchiveDialog`) was selected as the optimal experience given that archival flyers contain the most complete primary content. Dedicated standalone `/events/[id]` routes can be introduced in future iterations if extended multi-page historical narratives for individual events become available.
2. **Administrative Backend:**
   * As specified in the roadmap, Phase 3 strictly focused on the public historical website. The administrative management backend, database models, and authentication system are deferred to Phase 4.

---

## 8. Recommendation & Transition to Phase 4

Phase 3 has fulfilled all objectives, delivering a polished, authentic, and technically sound public historical website.

**Recommendation:** Formally close Phase 3 and proceed to **Phase 4: Nonprofit Management Backend & Database Architecture**, focusing on:
1. Setting up the PostgreSQL database and Prisma/Drizzle ORM schema based on `docs/database-design.md`.
2. Implementing authentication with role-based access control (`ADMIN`, `COORDINATOR`, `BARISTA`, `VOLUNTEER`).
3. Building the volunteer shift scheduling engine and conflict-detection business logic inspired by Liminal's historical operations.

