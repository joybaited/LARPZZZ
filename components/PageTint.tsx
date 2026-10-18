"use client";

import { useEffect } from "react";

/* ⚠ THE SECTION PALETTE. One row per section, in page order — this is the
   single list, so a colour is never stated twice and the sections themselves
   no longer carry a `bg-` class.

   These are the exact colours the sections painted before this existed; the
   values moved, nothing was re-picked.

   ⚠ THE FOOTER IS NOT IN THIS LIST, ON PURPOSE. It is @snvzyn's file and a
   named boundary in CLAUDE.md, so it keeps painting its own #e3b5fb and
   simply does not take part in the tween. The last entry here is `pricing`,
   so scrolling into the footer leaves the root on pricing's colour while the
   footer's own background covers it — which looks identical to how it does
   now. */
const PALETTE: Record<string, [bg: string, fg: string]> = {
  /* A LADDER BETWEEN THE TWO PALETTE ANCHORS, violet #eac2ff and grape
     #3d065f. Every band is the house hue at a different lightness; nothing
     here is a new colour.

     ⚠ THE STEPS HAVE TO BE BIG ENOUGH TO SEE. The first version of this
     ladder was all pale tints and the change was invisible in motion —
     measured, adjacent bands sat at a contrast ratio of 1.19 to 1.27, which
     is nothing. These alternate light / mid / light / deep instead, so no
     two neighbours are on the same step:

       hero          #f3e2ff  near-white violet
       how-it-works  #d9a3f7  mid — a clear drop from the hero
       features      #3d065f  the dark band, mid-scroll
       testimonials  #efd4ff  back to light
       faq           #c98ef0  the deepest of the lights
       pricing       #f7ecff  lifts to meet the footer

     Measured step-to-step contrast: 1.63, 7.58, 11.18, 1.80, 2.14 — every
     one a visible change, against 1.19-1.27 before.

     Grape text on each light band measures 6.20 to 13.24, and violet on the
     dark band 9.83, so every pairing clears the 4.5 body-text threshold with
     room to spare. */
  hero: ["#f3e2ff", "#3d065f"],
  "how-it-works": ["#d9a3f7", "#3d065f"],
  features: ["#3d065f", "#eac2ff"],
  testimonials: ["#efd4ff", "#3d065f"],
  faq: ["#c98ef0", "#3d065f"],
  pricing: ["#f7ecff", "#3d065f"],
};

/**
 * Drives `--page-bg` / `--page-fg` on <html> from whichever section owns the
 * middle of the screen. The transition itself is in globals.css — this only
 * writes two strings.
 *
 * Mounted once, in layout.tsx. Renders nothing.
 */
export default function PageTint() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-section]")].filter(
      (el) => el.dataset.section && PALETTE[el.dataset.section]
    );
    if (!sections.length) return;

    const apply = (id: string) => {
      const pair = PALETTE[id];
      if (!pair) return;
      root.style.setProperty("--page-bg", pair[0]);
      root.style.setProperty("--page-fg", pair[1]);
    };

    /* ⚠ THE SECTION THAT OWNS THE MIDDLE OF THE SCREEN WINS, and it is picked
       by measuring on each change rather than trusting entry order. An
       observer fires per-element, so two sections crossing the line in the
       same frame arrive as two callbacks — taking the last one makes the
       colour depend on callback order, which flips depending on scroll
       direction. Reading positions and choosing is direction-independent.

       A -50%/-50% rootMargin collapses the viewport to a single line at its
       centre, so exactly one section can satisfy it at a time. */
    const pick = () => {
      const mid = window.innerHeight / 2;
      let best: { id: string; d: number } | null = null;
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        /* distance from the viewport's centre line to this section's span:
           0 while the line is inside it. */
        const d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;
        if (!best || d < best.d) best = { id: el.dataset.section!, d };
      }
      if (best) apply(best.id);
    };

    const io = new IntersectionObserver(pick, {
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });
    for (const el of sections) io.observe(el);

    /* the observer fires on crossings; this covers the first paint and the
       case where a resize moves the centre line into a different section
       without anything crossing it. */
    pick();
    window.addEventListener("resize", pick, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("resize", pick);
    };
  }, []);

  return null;
}
