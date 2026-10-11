"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

declare global {
  /* NOT `window.lenis` — Lenis already declares that for its own feature
     detection and the types collide. */
  interface Window { __lenis?: Lenis }
}

/* Smooth scroll. Lenis + GSAP ScrollTrigger, the pairing metamask.io ships —
 * read out of their own bundles (`lenis`, `gsap`, `ScrollTrigger` and
 * `virtual-scroll` all appear in their chunks), not off a tutorial.
 *
 * ⚠ THE SYNC IS NOT OPTIONAL — <Features> PINS A RAIL. Lenis takes the scroll
 * position over from the browser, so ScrollTrigger stops seeing real scroll
 * events and a pinned section silently stops tracking. The three lines below
 * are GSAP's documented fix:
 *   - ScrollTrigger.update on every Lenis scroll, so it reads Lenis's position
 *   - Lenis driven from gsap.ticker, so one rAF loop runs both instead of two
 *     competing (ticker passes SECONDS, Lenis wants MILLISECONDS)
 *   - lagSmoothing(0), or GSAP tries to "catch up" after a stall and jumps
 *
 * ⚠ prefers-reduced-motion IS HONOURED BY NOT RUNNING AT ALL. Hijacking the
 * scroll is exactly what that setting is asking you not to do, and a duration
 * of 0 still leaves the wheel handler in the way.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ autoRaf: false });
    /* ⚠ PUBLISHED ON window SO THE NAV CAN STOP IT. With Lenis driving the
       scroll, `overflow: hidden` on <body> does NOT lock the page — Lenis
       keeps applying its own transform and the page still moves under a open
       menu. `lenis.stop()` is the only thing that actually holds it, and the
       nav is a sibling component with no path to this instance otherwise.
       One global beats threading a context through for a single consumer. */
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's own default
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
