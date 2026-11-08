# Liminal Community Center & Cafe — Digital Historical Archive & Management Platform

A portfolio-quality full-stack web application preserving the history, mission, and community impact of **Liminal Community Center & Cafe**, an authentic nonprofit community living room and pay-what-you-can cafe that operated in Flagstaff, Arizona, from 2021 to 2023.

---

## 🏛️ Project Purpose

1. **Public Historical Archive**: An engaging, responsive digital archive celebrating Liminal's physical space, community offerings, radical popular education, sliding-scale economics, and mutual aid activities.
2. **Nonprofit Management Platform (Upcoming Phases)**: A modern administrative application inspired by Liminal's authentic operational workflows (volunteer scheduling, barista certifications, conflict detection, expense ledgers, and event staffing).

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

### 3. Production Build & Verification
```bash
npm run build
npm run start
```
Run linter verification:
```bash
npm run lint
```

---

## 🎨 Visual Design & Architecture

The application faithfully captures the aesthetic and warmth of the former Squarespace production website:
* **Palette**: Charcoal base (`#141312`), full-width terracotta banners (`#b37a5c`), peach subheadings (`#e39c7a`), and earthy olive-brown cards (`#3d3725`).
* **Typography**: Geometric grotesque headings (`Montserrat`) paired with readable interface copy (`Inter`) and warm editorial serif accents (`Newsreader` / `Georgia`).
* **Signature Components**:
  * Persistent 2021–2023 Historical Archive disclaimer banner.
  * Park-bench and potted plant Liminal logo recreation.
  * Interactive circular-image Community Resources carousel with smooth scrolling.
  * Historic masonry arched window photo mask (`rounded-t-full`).
  * Historical modal dialogues exploring the 2021 cafe menu, volunteer teams, and founding philosophy.

---

## 📂 Project Structure

```
├── docs/                         # Architectural & historical documentation
│   ├── resource-inventory.md     # Comprehensive audit of historical assets
│   ├── historical-content.md     # Verified facts, timeline, menu & sources
│   ├── design-reference.md       # Color tokens, typography, layout specs
│   ├── operational-workflows.md  # Volunteer, finance & event workflows
│   ├── architecture.md           # Stack evaluation & boundaries
│   ├── database-design.md        # Relational schema & Prisma models
│   └── development-roadmap.md    # Phased implementation plan
├── public/
│   └── images/
│       ├── archival/             # Curated historical photography
│       └── branding/             # Favicons and branding icons
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with ArchiveBanner & Header
│   │   ├── page.tsx              # Historical homepage assembly
│   │   └── globals.css           # Tailwind directives & theme variables
│   ├── components/
│   │   └── public/
│   │       ├── ArchiveBanner.tsx # Permanent archive notice
│   │       ├── Header.tsx        # Navigation with mobile drawer
│   │       ├── Footer.tsx        # Historic location, hours & attribution
│   │       ├── LiminalLogo.tsx   # SVG recreation of authentic logo
│   │       ├── ResourceCarousel.tsx # Olive card circular carousel
│   │       └── ArchedPhoto.tsx   # Arched window photo frame
│   └── lib/
│       └── utils.ts              # Tailwind class merging utility
├── tailwind.config.ts            # Custom design tokens
├── tsconfig.json                 # Strict TypeScript configuration
└── package.json                  # Next.js 14, React 18, Tailwind CSS
```

---

## 🛡️ Privacy & Historical Integrity

All sensitive documents (tax forms, personal volunteer applications) have been removed from the repository. Demonstration seed data in subsequent phases will use 100% synthetic profiles. All public claims and menu records are verified directly against archival documents in `references/`.

