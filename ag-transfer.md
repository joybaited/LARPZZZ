# AG-TRANSFER: Responsive Architecture & Section-by-Section State Handover

> **Target Audience**: Claude / Incoming Engineers  
> **Repository**: `LARPZ-FINAL` (`https://github.com/joybaited/LARPZZZ.git`)  
> **Branch**: `main` (Latest commit: `39124b5`)  
> **Date**: October 17, 2026  
> **Frameworks**: Next.js 16.3.8 (Turbopack), React 19, Tailwind CSS v4, GSAP 3.15, Embla Carousel, SCALPEL Quantum Dynamic Proportional Architecture (QDPA), Basement Studio 120rem Canvas Standard.

---

## 1. Executive Summary & Core Mandate

In this session, we resolved critical responsive layout breaking points across all sections of the site. Previously, when resizing the browser window to squished aspect ratios (e.g., `843px × 546px`) or expanding onto ultrawide/4K screens, elements collided, buttons deformed into stretched pills, and content overflowed below the fold.

We re-architected the site using the **Basement Studio 120rem Canvas Architecture** and **SCALPEL QDPA Dual-Axis Engine**, fixing each section surgically with dedicated specialists while strictly preserving the **Footer boundary** (`sections/Footer.tsx`, `components/FooterCoins.tsx`, `components/TicketStrip.tsx` remain untouched).

---

## 2. Architectural Framework & Standards

The formal design system and mathematical scaling rules are documented in [`docs/responsive-architecture-method.md`](file:///C:/Websites/LARPZ-FINAL/docs/responsive-architecture-method.md).

### A. Basement Studio 120rem (1920px) Canvas Ceiling
- **The Rule**: Backgrounds remain full-bleed (`100vw`), but interactive stages, grids, sticker fields, and carousel arrow controls are strictly enclosed within `--canvas-max-width: 120rem` with `mx-auto`.
- **The Benefit**: Eliminates extreme element dispersion where controls or stickers drift 3400px away on ultrawide monitors.

### B. Dual-Axis Proportional Engine (SCALPEL QDPA)
- Defined in [`app/globals.css`](file:///C:/Websites/LARPZ-FINAL/app/globals.css):
  ```css
  --dpa-w-factor: calc(100vw / 96);
  --dpa-h-factor: calc(100vh / 46.375);
  --dpa-dual-axis: min(var(--dpa-w-factor), var(--dpa-h-factor));
  font-size: clamp(0.875rem, var(--dpa-dual-axis), 1.375rem);
  ```
- **Proportional Bridge**: `--px: calc(1rem / 16)` on desktop (tracks root scaling), `--px: 1px` on mobile (< 1024px).
- **Shortest-Side Safety**: `min(vw, vh)` prevents elements from clipping vertically on shallow laptop displays (canonical ground truth: `1536px × 742px`).

### C. Responsive Decoupling Pattern (SCALPEL-FE-002)
- **Desktop Stage (`hidden lg:block`)**: Art-directed absolute coordinate canvas inside 120rem ceiling.
- **Mobile/Tablet Orchestrator (`block lg:hidden`)**: Sequential, in-flow vertical layout with fluid typography clamps and bounded media (`max-w-[min(82vw,350px)] max-h-[44vh]`). Guarantees zero element collision on any squished window.

### D. Sticker Anti-Collision Law
1. **Desktop Quarantine**: Free-floating decorative stickers must be hidden on mobile/tablet (`hidden lg:block`).
2. **Layer Priority**: Floating stickers use `z-[5]`; interactive cards, text, and buttons use `z-10` / `z-20` / `z-30`. Stickers can NEVER render over readable content.
3. **Negative Space Placement**: Sticker coordinates are pinned to open negative space shoulders.

---

## 3. Section-by-Section Modifications

### 1. Hero Section & Button Architecture
- **Files**:
  - [`sections/Hero.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/Hero.tsx)
  - [`components/PriceEl.tsx`](file:///C:/Websites/LARPZ-FINAL/components/PriceEl.tsx)
  - [`components/PillButton.tsx`](file:///C:/Websites/LARPZ-FINAL/components/PillButton.tsx)
  - [`components/pillHover.tsx`](file:///C:/Websites/LARPZ-FINAL/components/pillHover.tsx)
- **Root Cause of Button Bug**:
  - In `PillButton.tsx`, the root `<a>` had hardcoded `inline-block`. When combined with `min-w-[128px]`, `inline-block` bypassed flexbox centering, shoving the label to the top-left corner with ~70px of empty space on the right.
  - In `pillHover.tsx`, `.pill-btn__holder` had no explicit line box height matching its `line-height: 1.5`, causing text to sit off-center and risk ascender/descender clipping.
- **The Surgical Fix**:
  - In `PillButton.tsx`: Changed root class to `inline-flex items-center justify-center text-center overflow-hidden rounded-full`.
  - In `pillHover.tsx`: Added `.pill-btn { display: inline-flex; align-items: center; justify-content: center; text-align: center; }`.
  - Bound `.pill-btn__holder` to `display: inline-flex; align-items: center; justify-content: center; height: 1.5em; line-height: 1.5;`.
  - Bound `.pill-btn__main` and `.pill-btn__hover` to `display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 1.5em; line-height: 1.5;`.
  - Removed forced `uppercase tracking-[0.05em]`. Preserved authentic **Title Case ("Buy" / "Login")** in Neue Montreal weight 600 with natural kerning across desktop, mobile, and top nav CTA.
  - Bounded button dimensions in `PriceEl.tsx`: `minWidth: 120px, maxWidth: 210px, minHeight: 46px, maxHeight: 56px`.
  - Restored tuned desktop stage coordinates in `HERO.els`: Buy at `x: 74.5%`, Login at `x: 89.5%` at `y: 67%`, rendering via `<PriceEl>` to stay in 100% sync with `/hero-tuner`.

### 2. How It Works Section
- **File**: [`sections/HowItWorks.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/HowItWorks.tsx)
- **Modifications**:
  - Bound stage container to 120rem ceiling: `max-w-[min(120rem,max(1200px,calc(var(--section-fill)*1.82)))]`.
  - Replaced rigid aspect ratios on mobile/tablet with adaptive `min-h-[150px]` so cards never squish.
  - Pinned designated corner sticker badges (`step-cash`, `step-key`, `step-activate`, `step-flex`) directly inside cards on mobile/tablet.

### 3. Features Section
- **Files**:
  - [`sections/Features.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/Features.tsx)
  - [`components/Card.tsx`](file:///C:/Websites/LARPZ-FINAL/components/Card.tsx)
- **Modifications**:
  - Encapsulated arrow navigation buttons and Embla carousel track inside `--canvas-max-width` (120rem).
  - Preserved Phantom edge-peeking effect via track padding `px-[clamp(20px,1rem+2vw,48px)]`.
  - **iPhone Cut-Off Defense**: Card 1 (`settingcust.webm`) and Card 3/4 (`idek.webm`) declare container query translation `down: "6cqw"`, moving mockups down by 6% of container inline width so the Dynamic Island and bezel are never clipped by the card's rounded top border.
  - **Sticker Anti-Collision**: Isolated `FEATURES_STICKERS` to desktop (`hidden lg:block`), bounded inside the 120rem canvas, and lowered z-index to `z-[5]` (behind cards at `z-10`).

### 4. Testimonials Section
- **File**: [`sections/Testimonials.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/Testimonials.tsx)
- **Modifications**:
  - **Laptop 1536x742 Vertical Overflow Fix**: Bound card height using dual-axis formula:
    `h-[clamp(170px,min(12rem+6.5vw,calc((var(--section-fill)-clamp(24px,1rem+1.4vw,44px)-2rem)/2)),360px)]`.
    Guarantees two card rows fit inside `var(--section-fill)` (546px) with a 32px safety buffer.
  - Bound quote typography: `text-[clamp(15px,min(0.95rem+0.7vw,2.2vh),24px)] leading-[1.35] line-clamp-4`.
  - Full-bleed 100vw marquee loops preserved; mobile single marquee row preserved (`hidden sm:block` on Row 2).
  - **Sticker Anti-Collision**: Re-anchored sticker from `x: 27.1%` (which hit heading text) to `x: 12.5%` in negative space, quarantined with `hidden lg:block` at `z-[5]`.

### 5. FAQ Section
- **Files**:
  - [`sections/Faq.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/Faq.tsx)
  - [`components/FaqItem.tsx`](file:///C:/Websites/LARPZ-FINAL/components/FaqItem.tsx)
- **Modifications**:
  - Wrapped desktop scattered pills inside `--canvas-max-width` (120rem) with boundary clamping.
  - **Radial Collision Safety**: In `move()`, clamped non-active pills to safe margins ($X \ge 24\text{px}$, $Y \ge 16\text{px}$) so neighboring cards never get pushed offscreen or collide between 1024px and 1280px.
  - **Mobile Centering**: Scoped horizontal `slide` logic in `FaqItem.tsx` strictly to desktop (`[data-faq-wrap]`); on mobile (< 1024px), `slide` remains 0 so the accordion expands symmetrically from center with zero horizontal overflow.
  - **Sticker Anti-Collision**: Quarantined to desktop negative space (`hidden lg:block`) at `z-[5]` (closed pills are `z-10`, open are `z-30`).

### 6. Pricing Section
- **File**: [`sections/Pricing.tsx`](file:///C:/Websites/LARPZ-FINAL/sections/Pricing.tsx)
- **Modifications**:
  - **Laptop Vertical Overflow Fix**: Bounded desktop card height:
    `lg:h-[min(calc(640px*var(--scale-factor,1)),calc(var(--section-fill)-2rem))]`.
  - Enforced 120rem row max-width: `max-w-[min(120rem,calc(1200px*var(--scale-factor,1)))]`.
  - Fluid price typography via container query: `clamp(44px, 3.8cqw + 24px, 62px)`.
  - CTA buttons render via `<PriceEl>` with Title Case and MetaMask hover roll physics.
  - **Sticker Anti-Collision**: Quarantined to desktop (`hidden lg:block`) at `z-[5]` (behind cards at `z-10`).

---

## 4. STRICT BOUNDARIES (DO NOT TOUCH)

The user has placed a strict, non-negotiable boundary on the footer components:
1. `sections/Footer.tsx`
2. `components/FooterCoins.tsx`
3. `components/TicketStrip.tsx`

**Under no circumstances should any changes be made to these three files.**

---

## 5. Verification & Commands

- **Production Build**:
  ```bash
  npm run build
  ```
  *Current status: All 20 static pages compile cleanly in ~1.8s with Turbopack and zero errors.*
- **Dev Server**:
  ```bash
  npm run dev
  ```
  *Runs on `http://localhost:3000`.*
- **Git State**:
  - All modified files committed in `39124b5`.
  - Remote is synced with `origin/main`.
