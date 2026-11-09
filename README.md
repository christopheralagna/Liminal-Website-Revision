# Liminal Community Center & Cafe — Digital Historical Archive & Management Platform

> **Current status — November 8, 2026:** Phase 3 content refinement is complete. Phase 4 is at the mandatory **Stage A design approval checkpoint**; no backend has been installed or implemented. Read the [backend proposal](docs/phase-4-backend.md), [proposed PostgreSQL schema](docs/proposals/phase-4-schema.prisma), and [current project status](docs/project-status.md). The older feature descriptions below predate the content refinement: essays, chronology, cafe menu/simulator, shift checklists, and unsupported team/policy claims were removed. See the [refinement report](docs/phase-3-content-refinement.md) for the actual public content.

## Phase 4 setup status

The existing public development commands below still apply. There are currently **no database migration, seed, admin-provisioning, auth, or backend test commands**. `prisma/schema.prisma` is an inactive SQLite draft, not a configured database. Do not run setup instructions from earlier planning documents as though those features exist.

The Stage A recommendation is PostgreSQL + Prisma 7, Better Auth, and a supported Node/Next.js runtime upgrade, with public rendering preserved. After explicit design approval, Stage B will add `.env.example`, database setup, migrations, deterministic synthetic seed instructions, and the later stages will document secure administrator provisioning and backend test/build commands. No credentials, authentication endpoints, administrative UI, or deployment were added during Stage A.

A portfolio-quality full-stack web application preserving the history, mission, and community impact of **Liminal Community Center & Cafe**, an authentic nonprofit community living room and pay-what-you-can cafe that operated in Flagstaff, Arizona, from 2021 to 2023.

---

## 🏛️ Project Purpose

1. **Public Historical Archive (Phase 2 & Phase 3)**: A multipage, responsive digital archive celebrating Liminal's physical space, community offerings, radical popular education, sliding-scale economics, and mutual aid activities.
2. **Nonprofit Management Platform (Upcoming Phases)**: A modern administrative application inspired by Liminal's authentic operational workflows (volunteer scheduling, barista certifications, conflict detection, expense ledgers, and event staffing).

---

## 🌐 Public Historical Website Structure

The public archive comprises six cohesive routes sharing a unified design system, warm terracotta/charcoal palette, authentic typography, and accessible navigation:

| Route | Page | Key Content & Interactive Features |
|---|---|---|
| **`/`** | **Home** | Statement hero, historical hours and sandstone location, community resources carousel, arched volunteer spotlight, mission breakdown, and noticeboard flyer collage. |
| **`/about`** | **Our Story &amp; Philosophy** | Founding narrative, critique of commercial spaces, Paulo Freire popular education roots, 5 physical facility tours, complete co-founders' essays (Christopher Alagna & Ryan McElligott), and 2021–2023 timeline. |
| **`/cafe`** | **The Café &amp; Equity Model** | Third-wave coffee philosophy, authentic historical menu (beverages + *Evolve Eats* small plates), and an interactive **Sliding-Scale Equity Simulator** demonstrating the *"pay high // pay low"* mutual-aid model. |
| **`/events`** | **Community &amp; Events** | Chronological event ledger, 6 category filters (Mutual Aid, Live Music, Political Education, Community Arts, Gatherings), and an interactive **Archival Flyer Lightbox**. |
| **`/community`** | **Volunteering &amp; Care** | 6 autonomous volunteer working groups, shift schedules (Wed–Sun 10am–2pm & 2pm–6pm), barista training requirements, daily operational checklists, and community care principles. |
| **`/gallery`** | **Photo &amp; Media Archive** | Curated catalog of 21 archival photographs, keyword search, category filter pills, room tags, and an accessible **Photo Lightbox Modal** with full historical descriptions. |

*Note: Legacy aliases (`/our-story`, `/menu`, `/programming`, `/archive`, `/facilities`) automatically issue 308 permanent redirects to the canonical routes above.*

---

## 🚀 Quickstart & Local Development

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **npm**: v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Linting Verification
```bash
npm run lint
npm run build
npm run start
```

---

## 🎨 Design Tokens & UI Architecture

* **Palette**: Charcoal ground (`#141312`), deep charcoal cards (`#1c1a18`), full-width terracotta banners (`#b37a5c`), peach subheadings (`#e39c7a`), and earthy olive accents (`#3d3725`).
* **Typography**: Geometric grotesque headings (`Montserrat`) loaded via local `@font-face` definitions, paired with readable body copy and warm editorial serif accents (`Georgia`).
* **Signature Reusable Components**:
  * `ArchiveBanner`: Permanent top disclaimer identifying Liminal as a historical 2021–2023 archive.
  * `Header`: Sticky navigation with active path indicator via `usePathname()`, mobile drawer, and keyboard Escape listeners.
  * `Footer`: Comprehensive site directory, historical location, operating hours, and Instagram archive link.
  * `PageHero`: Standardized editorial hero for interior historical pages.
  * `LiminalLogo`: Authentic four-chair illustrated mark with responsive sizing.
  * `ArchiveDialog`: Accessible native HTML `<dialog>` modal with focus containment, backdrop blur, and Escape key dismissal.
  * `ArchedPhoto`: Masonry arched window photo frame with subtle captioning.
  * `ResourceCarousel`: Card-aware carousel with live region announcements and `prefers-reduced-motion` compliance.

---

## 📂 Project Structure

```
├── docs/                         # Architectural, design & completion reports
│   ├── architecture.md           # Architecture boundaries & stack selection
│   ├── database-design.md        # Relational schema & Prisma models (Phase 4+)
│   ├── design-reference.md       # Color tokens, typography, layout specs
│   ├── development-roadmap.md    # Phased roadmap (Phases 1–7)
│   ├── frontend-design-audit.md  # Detailed UI/UX audit by Astra
│   ├── historical-content.md     # Verified primary sources, timeline, menu & essays
│   ├── operational-workflows.md  # Historical volunteer, finance & event workflows
│   ├── phase-2-completion.md     # Phase 2 quality review & audit closure
│   └── phase-3-completion.md     # Phase 3 multipage historical archive report
├── public/
│   ├── fonts/                    # Local Montserrat TrueType font files
│   └── images/
│       ├── archival/             # Curated historical photography & flyers
│       └── branding/             # Authentic Liminal logo & favicon assets
├── src/
│   ├── app/
│   │   ├── about/page.tsx        # Our Story, Philosophy & Facilities
│   │   ├── cafe/page.tsx         # The Café & Equity Model Simulator
│   │   ├── community/page.tsx    # Volunteering, Teams & Operational Practices
│   │   ├── events/page.tsx       # Community Events Archive & Flyer Lightbox
│   │   ├── gallery/page.tsx      # Curated Photo Archive & Lightbox
│   │   ├── layout.tsx            # Root layout with ArchiveBanner, Header & Footer
│   │   ├── page.tsx              # Homepage assembly
│   │   └── globals.css           # Tailwind base, typography & dialog rules
│   ├── components/
│   │   └── public/               # Reusable presentation components
│   │       ├── ArchedPhoto.tsx
│   │       ├── ArchiveBanner.tsx
│   │       ├── ArchiveDialog.tsx
│   │       ├── Footer.tsx
│   │       ├── Header.tsx
│   │       ├── LiminalLogo.tsx
│   │       ├── PageHero.tsx
│   │       └── ResourceCarousel.tsx
│   ├── data/                     # Typed historical data models
│   │   ├── community.ts          # Volunteer teams, principles & shift checklists
│   │   ├── essays.ts             # Co-founders' essays with full transcripts
│   │   ├── events.ts             # 12 historical events with flyer references
│   │   ├── facilities.ts         # 5 architectural spaces and room features
│   │   ├── menu.ts               # Beverages, small plates & sliding scale tiers
│   │   └── photos.ts             # 21 curated archive photos with room tags
│   └── lib/
│       └── utils.ts              # Styling utilities
├── next.config.mjs               # Static unoptimized images, redirects & Webpack config
├── tailwind.config.ts            # Custom color palette & font configuration
├── tsconfig.json                 # TypeScript strict configuration
└── package.json                  # Next.js 14, React 18, Lucide React, Tailwind
```

---

## 🛡️ Privacy, Security & Historical Integrity

* **Zero Sensitive PII**: All private volunteer applications, addresses, phone numbers, tax forms, and internal financial records from the raw historical Google Drive download are strictly excluded from the Git repository via `.gitignore` (`/references/`, `*.zip`, `*.MOV`).
* **Verified Historical Sources**: Every menu item, historical event, and philosophical quotation is derived directly from authentic primary archival documents (`_Standard Practices at Liminal.docx`, `blog.html`, `cafe+menu.html`, `Screenshot 2026-11-07 at 4.02.52 PM.png`). No historical facts or dates have been fabricated.
* **Clear Historical Retrospective Framing**: Every public page prominently communicates that Liminal permanently closed in 2023, framing all content in warm, respectful past-tense narrative language.
