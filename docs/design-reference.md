# Liminal Visual Design Reference & Design System

This design specification establishes the visual language, typography, color palette, component design, and layout patterns for the Liminal historical website, derived directly from the Squarespace screenshots (`references/squarespace-photos/`) and the original hand-coded site styles (`references/original-website/liminal-website-master/css/main.css`).

---

## 1. Aesthetic Direction & Brand Identity

The visual identity of Liminal sits in an intentional, warm space between a **grassroots community living room**, a **third-wave espresso bar**, and a **radical cultural press**. It avoids sterile corporate SaaS themes, harsh pure black-and-white palettes, and flashy tech gimmicks.

### Core Visual Attributes
- **Grounded & Warm**: Dominated by deep warm charcoal blacks, raw umber, rich terracotta/clay, and soft peach tones.
- **Organic & Human**: Rounded card corners, soft arched image masks (`rounded-t-full`), textured sandstone tones, and subtle natural grain.
- **Dignified & Typographic**: Clean, legible modern sans-serif headings with purposeful letter-spacing, accompanied by warm serif accents for historical essays.
- **Accessible & Restrained**: Strong color contrast (WCAG AA/AAA compliant), clear tactile states, subtle micro-interactions, and no excessive motion.

---

## 2. Color System & Design Tokens

The palette faithfully translates the color scheme captured across the 35 Squarespace screenshots and early site styles into modern Tailwind CSS tokens.

```
┌─────────────────────────────────────────────────────────────┐
│                       LIMINAL PALETTE                       │
│                                                             │
│  [ #141312 ]  Background Charcoal (Deep)                    │
│  [ #1c1a18 ]  Background Surface (Warm Black)               │
│  [ #9b5d43 ]  Terracotta Accent (Primary Brand)             │
│  [ #b37a5c ]  Warm Clay (Light Accent / Banner)             │
│  [ #e39c7a ]  Peach Glow (Subheadings & Highlights)         │
│  [ #3d3725 ]  Earthy Olive Brown (Cards & Carousels)        │
│  [ #faf6f0 ]  Alabaster Cream (Headings & Light Text)       │
│  [ #d4eac2 ]  Sage Green (Subtle Accent from Early Site)    │
└─────────────────────────────────────────────────────────────┘
```

### Color Token Table

| Token Name | Hex Code | Tailwind Key | Source Reference | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `charcoal-950` | `#141312` | `bg-charcoal-950` | Squarespace Home (`4.02.52 PM.png`) | Global page background, deepest layer. |
| `charcoal-900` | `#1c1a18` | `bg-charcoal-900` | Squarespace Home (`4.03.02 PM.png`) | Card surfaces, modal bodies, navigation bars. |
| `charcoal-800` | `#292523` | `bg-charcoal-800` | Squarespace Forms (`4.04.00 PM.png`) | Input field backgrounds, table row hover states. |
| `terracotta-600` | `#864d36` | `bg-terracotta-600` | Squarespace Buttons (`4.03.48 PM.png`) | Button hover states, active tab indicators. |
| `terracotta-500` | `#9b5d43` | `bg-terracotta-500` | Squarespace Sections (`4.04.40 PM.png`) | Primary CTA buttons, full-width alternating banner sections. |
| `terracotta-400` | `#b37a5c` | `bg-terracotta-400` | Squarespace Hero Banner (`4.02.52 PM.png`) | Hero banner background, badge backgrounds. |
| `peach-300` | `#e39c7a` | `text-peach-300` | Squarespace Headings (`4.03.09 PM.png`) | Section eyebrow headers, subheadings, icon fills. |
| `peach-200` | `#f0b89e` | `text-peach-200` | Squarespace Highlights (`4.07.17 PM.png`) | Interactive link hovers, active navigation markers. |
| `olive-800` | `#3d3725` | `bg-olive-800` | Squarespace Carousel Cards (`4.03.09 PM.png`) | Circular-image carousel card containers. |
| `cream-50` | `#faf6f0` | `text-cream-50` | Squarespace Headlines (`4.02.52 PM.png`) | Primary display titles, hero typography, white buttons. |
| `cream-200` | `#e8e0d5` | `text-cream-200` | Squarespace Body Text (`4.05.05 PM.png`) | Primary body copy, readable descriptions. |
| `cream-400` | `#b8aba0` | `text-cream-400` | Squarespace Captions (`4.08.35 PM.png`) | Metadata, dates, secondary labels, photo captions. |
| `sage-300` | `#d4eac2` | `text-sage-300` | Original CSS (`main.css`) | Subtle badges, environmental/mutual-aid tags. |

---

## 3. Typography System

### Font Pairings
- **Display & Headings**: `Montserrat` or `Plus Jakarta Sans`
  - Bold, clean geometric grotesque sans-serif with open apertures and high x-height.
  - Matches the original Squarespace navigation and hero headings.
- **Body & Interface**: `Inter` or `Montserrat` (weights 400, 500, 600)
  - Highly legible at small screen sizes and dense administrative tables.
- **Editorial & Historical Essays**: `Georgia` or `Newsreader` (serif)
  - Used for historical quotes, philosophy excerpts, and archival essays to provide an authentic editorial magazine quality.

### Typographic Scale & Hierarchy
- **Hero Title (`H1`)**: `text-4xl md:text-6xl font-semibold tracking-tight text-cream-50`
- **Section Heading (`H2`)**: `text-2xl md:text-3xl font-semibold tracking-normal text-peach-300`
- **Card Title (`H3`)**: `text-xl font-medium text-cream-50`
- **Eyebrow / Sub-label**: `text-xs md:text-sm uppercase tracking-widest font-semibold text-terracotta-400`
- **Body Large**: `text-lg leading-relaxed text-cream-200`
- **Body Regular**: `text-base leading-normal text-cream-200/90`
- **Caption / Meta**: `text-xs text-cream-400`

---

## 4. Key Layout & Component Patterns

### 1. The Historical Hero Banner
- Clean top bar with the historic logo: two park benches flanking a potted leafy plant with "LIMINAL CAFE & COMMUNITY CENTER" typography.
- Horizontal desktop navigation: *About, Programming, Archive, Community, Admin*.
- Full-width terracotta feature banner directly below the navigation:
  > **"A People's Cafe & Community Center"**
  > *"Regularly open as a free mixed-use space. Run entirely by volunteers. Completely donation-based."*

### 2. Alternating Section Architecture
- The website alternates between:
  - Deep Charcoal background (`#141312`) with peach/cream typography and light border dividers.
  - Rich Terracotta full-width block (`#9b5d43`) with crisp white (`#faf6f0`) and dark charcoal typography.
- Side-by-side asymmetric pairings:
  - Left: High-resolution historical photograph with rounded corners (`rounded-2xl`).
  - Right: Story narrative or facility breakdown with eyebrow text, headline, description, and pill CTA button.

### 3. The Arched Photo Mask (`rounded-t-full`)
- Featured prominently in the volunteer recruitment page (`Screenshot 2026-11-07 at 4.08.00 PM.png`).
- A distinctive architectural arch evoking community space doorways, window frames, and historic Flagstaff masonry.
- Implemented in Tailwind with `aspect-[3/4] overflow-hidden rounded-t-full shadow-xl`.

### 4. Circular-Image Resource Carousel
- Featured in Squarespace homepage (`Screenshot 2026-11-07 at 4.03.09 PM.png`).
- Earthy olive-brown rounded rectangular cards (`bg-olive-800/90 rounded-2xl p-6`).
- Perfectly circular cropped images (`rounded-full aspect-square w-36 h-36 mx-auto object-cover border-2 border-peach-300/20`).
- Descriptive warm peach label underneath.
- Interactive left/right arrow buttons in translucent terracotta pills.

### 5. Pill-Shaped Action Buttons
- Rounded full pills (`rounded-full px-6 py-2.5 font-medium transition-colors`).
- **Primary CTA**: Terracotta fill (`bg-terracotta-500 hover:bg-terracotta-600 text-cream-50`).
- **Secondary / Ghost**: Outline with peach text (`border border-peach-300/40 text-peach-300 hover:bg-peach-300/10`).

### 6. Archival Status Banner (Crucial Requirement)
- A non-intrusive, dignified banner at the very top of every public view:
  > 🏛️ **Historical Archive (2021–2023)**: *Liminal was a community-supported space in Flagstaff, AZ. This site preserves its memory, records, and mission.*
- Distinguishes historical educational browsing from an active commercial operation.

---

## 5. Responsive Breakpoints & Accessibility

- **Mobile First**:
  - Full-screen slide-out mobile drawer menu with high-contrast tap targets (minimum 44x44px).
  - Single-column photo/text stacks that maintain proportional aspect ratios without layout shift.
- **Accessibility Standards**:
  - Color contrast ratios strictly meet WCAG 2.1 AA standards (minimum 4.5:1 for body copy against both charcoal and terracotta backgrounds).
  - Visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-peach-300 focus-visible:ring-offset-2`).
  - Semantic landmark elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
  - Alt text for every archival photograph describing both the visual scene and historical significance.

