# LARPZ Master Ground-Truth & Responsive Blueprint
**Baseline Hardware:** 1536px × 742px (1080p @ 125% OS DPI, Aspect Ratio ~2.07)  
**Status:** Ground-Truth Extracted Directly From Owner's Display  
**Goal:** Mathematically preserve the owner's exact laptop layout, gaps, and visual hierarchy across all larger and smaller screens.

---

## 1. The Owner's Golden Baseline Measurements

These are the exact pixel dimensions and offsets captured from the live rendered page on the owner's laptop:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      GOLDEN VIEWPORT SPECIFICATION                     │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Viewport Width    │ 1536px (1520.8px) │ innerWidth (excluding bar)     │
│ Viewport Height   │ 742px             │ innerHeight (clean stage)      │
│ Device Pixel Ratio│ 1.25              │ 125% Windows Scaling           │
│ Aspect Ratio      │ 2.070             │ Wide Landscape                 │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### Exact Section Dimensions at Baseline

| Section | Total Height | Heading Space | Foot Space | Effective Content Fill |
|---|---|---|---|---|
| **Hero** | `742.4px` (100svh) | `0px` (flush) | `78.1px` | `742.4px` (Full bleed) |
| **How It Works** | `851.8px` | `195.84px` | `109.44px` | `546.5px` (Exact 2-card grid height) |
| **Features** | `931.7px` | `195.84px` | `109.44px` | `626.4px` (Arrows + Carousel cards) |
| **Testimonials** | `926.5px` | `195.84px` | `109.44px` | `621.2px` (2 Marquee rows + gap) |
| **FAQ** | `851.8px` | `195.84px` | `109.44px` | `546.5px` (6-pill canvas field) |
| **Pricing** | `945.3px` | `195.84px` | `109.44px` | `640.0px` (Exact 3-card height) |
| **Footer** | `742.4px` (100svh) | `0px` (flush) | `0px` | `742.4px` (Cloud + Coins + Ticket) |

---

## 2. Mathematical Scaling Model: How Every Section Scales

To maintain the exact look of your laptop on **any** screen size without breaking:
* **The Scaling Ratio:** On any screen of width $W$, the horizontal scale factor is $S_w = \frac{W}{1536}$.
* **The Vertical Ratio:** On any screen of height $H$, the vertical scale factor is $S_h = \frac{H}{742}$.
* **The Proportional Anchor:** Desktop layouts ($\ge 1024\text{px}$) use $S = \min(S_w, S_h)$ or fluid `clamp()` formulas matching your exact laptop ratios.

---

### Section 1: Hero Breakdown & Equations

* **Headline ("FAKE IT TILL' YOU MAKE IT"):**
  - Rendered: `397.9px × 259.2px`, `fontSize: 96px`, `left: 102px` ($6.7\%$ from left edge).
  - Mathematical Formula:
    $$\text{fontSize} = \text{clamp}(48\text{px}, 6.25\text{vw}, 112\text{px})$$
    $$\text{left} = \text{clamp}(24\text{px}, 6.7\text{vw}, 120\text{px})$$
* **Right Subtitle ("Display any balance..."):**
  - Rendered: `456.2px × 150px`, `fontSize: 24px`, center at `left: 1018.9px` ($67\%$ of width).
  - Desktop: Stays at $67\%$ width, bounded within $1280\text{px}$ content max.
  - Mobile ($< 1024\text{px}$): Sits naturally in flow directly below the headline at full readable width.
* **CTAs ("Buy" & "Login"):**
  - Rendered: Each button is `197.7px × 47.5px`, `fontSize: 19px`.
  - Exact gap between buttons: **$30.5\text{px}$** ($1034.1\text{px}$ to $1262.3\text{px}$).
  - Mobile: Sits side-by-side below the subtitle with the same clean $30\text{px}$ gap.

---

### Section 2: How It Works Breakdown & Equations

* **The 3-Column Grid Geometry:**
  - Left Card Column: `w: 381.9px` ($25.1\%$ of row)
  - Center Phone Column: `w: 407.1px` ($26.8\%$ of row)
  - Right Card Column: `w: 381.9px` ($25.1\%$ of row)
  - Exact Gaps: **$16.0\text{px}$** on both sides of the center column!
  - Row Height: Each card is `h: 265.3px`, with a **$16.0\text{px}$** vertical gap.
  - Total Grid Height: $265.3 \times 2 + 16 = \mathbf{546.5\text{px}}$ (exactly fills the inner section!).
* **Card Ratios:**
  - Card Aspect Ratio: $\frac{381.9}{265.3} = \mathbf{1.439}$ (Width is $1.44\times$ height).
* **Responsive Preservation:**
  - Desktop ($\ge 1024\text{px}$): Lock columns to `grid-cols-[1fr_1.066fr_1fr]` with `gap: 16px` and card aspect ratio $1.44$.
  - Laptops ($< 760\text{px}$ height): Reduce section heading padding so the $546\text{px}$ grid never gets squished.
  - Mobile ($< 1024\text{px}$): Center column phone hides; cards flow in clean 2-up or stacked list.

---

### Section 3: Features Breakdown & Equations

* **The Carousel Geometry:**
  - Card Width: `471.1px`, Card Height: `535.3px`.
  - Ratio: $\frac{471.1}{535.3} = \mathbf{0.880}$ (Strictly matches `--card-r: 0.88`).
  - Gap between cards: **$31.3\text{px}$** (Target $32\text{px}$).
  - Arrow Bar: Height `64px`, margin bottom `27.1px`, padding horizontal `46.7px`.
* **Responsive Preservation:**
  - Card Height Formula:
    $$\text{--card-h} = \text{clamp}(380\text{px}, \min(20\text{rem} + 29\text{vh}, 56\text{svh}), 640\text{px})$$
  - Width automatically derives from height: $\text{inlineSize} = \text{--card-h} \times 0.88$.
  - Cards and arrows will never push beyond the visible screen on any laptop.

---

### Section 4: Testimonials Breakdown & Equations

* **The Double Marquee Geometry:**
  - Card Width: `417.9px`, Card Height: `291.8px`, Padding: `36px`.
  - Ratio: $\frac{417.9}{291.8} = \mathbf{1.432}$.
  - Two rows traveling in opposite directions.
* **Responsive Preservation:**
  - Desktop ($\ge 1024\text{px}$): Maintain 2 rows with cards sized at `h: clamp(220px, 11rem + 5vh, 320px)`.
  - Mobile / Shallow Laptop ($< 1024\text{px}$ or height $< 760\text{px}$): Render 1 marquee row to keep vertical space balanced.

---

### Section 5: FAQ Breakdown & Equations

* **The 6-Pill Scatter Geometry:**
  - Central Wordmark: `w: 248.9px`, `h: 125.3px`, centered at exactly $760.5\text{px}$ (50% of 1521px).
  - Pill Coordinates (Relative to 1536×742):
    1. **Top Center-Left:** `x: 37.4%` (568.8px), `y: 21%`, `w: 381.9px`
    2. **Bottom Center-Left:** `x: 35.1%` (533.8px), `y: 78.5%`, `w: 515.2px`
    3. **Top Far-Left:** `x: 6.3%` (95.8px), `y: 16.2%`, `w: 464.9px`
    4. **Top Right:** `x: 65%` (988.5px), `y: 16.4%`, `w: 414.6px`
    5. **Bottom Left:** `x: 3.9%` (59.3px), `y: 59.4%`, `w: 459.9px`
    6. **Bottom Right:** `x: 78.8%` (1198.4px), `y: 59.8%`, `w: 328.1px`
* **Responsive Preservation:**
  - Desktop ($\ge 1024\text{px}$): Keep the exact measured coordinates.
  - Mobile ($< 1024\text{px}$): Switch to stacked accordion list, clamping open width to `min(openW, calc(100vw - 32px))`.

---

### Section 6: Pricing Breakdown & Equations

* **The 3-Card Geometry:**
  - Each Card: `w: 360px`, `h: 640px` (Aspect Ratio $0.5625 = 9:16$).
  - Gaps between cards: Exactly **$60.0\text{px}$**!
  - Total Row Width: $360 \times 3 + 60 \times 2 = \mathbf{1200px}$.
  - Side Margins: $(1520.8 - 1200) / 2 = \mathbf{160.4px}$ (Centered on screen).
* **Responsive Preservation:**
  - Desktop ($\ge 1024\text{px}$): Exact 1200px row with 60px gaps.
  - Below 1024px: Stacks cards vertically or into a swipeable carousel so cards retain their 9:16 proportions without squishing.

---

## 3. Implementation Plan: Executing the Equations

1. **Phase 1: Global Viewport Budget (`Section.tsx`)**
   Apply the shallow-laptop clamp so `HEADING_SPACE` reduces from `195px` to `110px` on screens with height $\le 760\text{px}$.
2. **Phase 2: Hero Exact Positioning & Flow Switch (`Hero.tsx`)**
   Lock the headline, subtitle ($67\%$), and buttons ($30.5\text{px}$ gap) to the measured coordinates on desktop; add clean vertical stacking on mobile.
3. **Phase 3: How It Works Grid Precision (`HowItWorks.tsx`)**
   Lock the $16\text{px}$ gaps, $1.44$ card aspect ratio, and $546\text{px}$ content height.
4. **Phase 4: Features Carousel Height Clamp (`Card.tsx`)**
   Clamp card height using `min(20rem + 29vh, 56svh)` to preserve the $0.88$ ratio without clipping.
5. **Phase 5: FAQ Mobile Accordion & Desktop Scatter (`Faq.tsx`)**
   Preserve the exact 6 coordinates on desktop; switch to stacked accordion below 1024px.
6. **Phase 6: Pricing 60px Gaps & Tablet Reflow (`Pricing.tsx`)**
   Preserve the 360×640 cards and 60px gaps on desktop; reflow at 1024px.
