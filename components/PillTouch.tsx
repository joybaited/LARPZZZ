"use client";

import { useEffect } from "react";

/* The pill roll on a finger. ONE DELEGATED LISTENER FOR EVERY PILL ON THE
 * SITE — the markup is built in two places (`PillButton.tsx` and
 * `PriceEl.tsx`), both server components, so a handler per button would mean
 * making both of them client and keeping two copies in step.
 *
 * ⚠ CSS ALONE CANNOT DO THIS, AND :active IS THE TRAP. Measured in a 390x770
 * hasTouch context driving real CDP touch input: during a 1.6s hold the button
 * matched NEITHER :hover NOR :active — Chromium defers both to tap completion.
 * 100ms AFTER touchend it matched both and the roll started, i.e. backwards:
 * the press did nothing and the release played the entrance. iOS Safari does
 * apply :active during the hold, so a CSS-only fix would work on one platform
 * and not the other.
 *
 * ⚠ AND THE OLD BEHAVIOUR LEFT IT STUCK. Same probe on the pre-change CSS,
 * ~1s after the finger lifted: main at -24px, hover at 0, fill at scale(1.03)
 * opacity 1, and `:hover` still matching — fully rolled open and never coming
 * back, because the emulated hover outlives the tap. That is why the :hover
 * rules are fenced behind `(hover: hover)` in `pillHover.tsx`; this file is
 * the other half, supplying the trigger a finger can actually produce.
 *
 * `touchstart` is passive — the class is cosmetic, so there is nothing to
 * preventDefault and a non-passive listener would cost scroll performance on
 * every touch on the page. `touchend`/`touchcancel` both clear it, so a drag
 * off the button or an interrupting call releases cleanly instead of sticking.
 */
export default function PillTouch() {
  useEffect(() => {
    const ON = "pill-btn--press";
    const press = (e: TouchEvent) => {
      const el = (e.target as Element | null)?.closest?.(".pill-btn");
      if (el) el.classList.add(ON);
    };
    /* cleared off the DOM rather than off the remembered element: a touch can
       end over a different pill than it started on, and clearing every one is
       a shorter diff than tracking which. */
    const release = () => {
      for (const el of document.querySelectorAll("." + ON)) el.classList.remove(ON);
    };
    const opts = { passive: true } as const;
    document.addEventListener("touchstart", press, opts);
    document.addEventListener("touchend", release, opts);
    document.addEventListener("touchcancel", release, opts);
    return () => {
      document.removeEventListener("touchstart", press);
      document.removeEventListener("touchend", release);
      document.removeEventListener("touchcancel", release);
    };
  }, []);
  return null;
}
