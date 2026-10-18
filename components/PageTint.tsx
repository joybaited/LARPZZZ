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
     #3d065f, so every step is the house hue at a different lightness and
     nothing here is a new colour.

     Ordered so no two neighbours sit on the same step and the one dark band
     (features) lands in the middle of the scroll, with the sections either
     side of it lighter than their own neighbours — the contrast reads as a
     deliberate beat rather than a jolt.

       hero          #eac2ff  the anchor itself, unchanged
       how-it-works  #f7e3ff  lightest pink, clearly apart from the hero
       features      #4a1070  lighter than the old #3d065f, as asked
       testimonials  #f2d4ff  light again, a touch deeper than how-it-works
       faq           #e5b8fd  the deepest of the light bands
       pricing       #edd0ff  lifts back up to meet the footer's #e3b5fb

     Foreground is grape on every light band and violet on the dark one. */
  hero: ["#eac2ff", "#3d065f"],
  "how-it-works": ["#f7e3ff", "#3d065f"],
  features: ["#4a1070", "#eac2ff"],
  testimonials: ["#f2d4ff", "#3d065f"],
  faq: ["#e5b8fd", "#3d065f"],
  pricing: ["#edd0ff", "#3d065f"],
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
