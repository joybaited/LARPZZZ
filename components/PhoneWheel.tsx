"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Four phone mockups turning like the spokes of a wheel, a quarter turn every
 * 2.5s. Ported 1:1 from LZ-2's wheel.ts and section-02.css — the motion, the
 * constants and the structural rules are all theirs.
 *
 * ── THE RULE THAT SHAPES THIS ────────────────────────────────────────────
 *
 * THE PHONE TILTS AS IT TRAVELS AND IS UPRIGHT WHEN IT ARRIVES.
 *
 * Not what a rigid wheel does: on a real wheel a spoke's payload is fixed to
 * the arm, rotates with it, and arrives at whatever angle the arm holds — the
 * phones would sit crooked and one would be upside down. So position and lean
 * are derived SEPARATELY from one shared angle.
 *
 * ── THE STRUCTURAL RULES, from LZ-2's stylesheet ─────────────────────────
 *
 * 1. EVERY SPOKE SITS AT THE SAME ORIGIN, in one grid cell, and the module
 *    moves it from there. Grid, not absolute positioning: absolute takes them
 *    out of flow, the container collapses, and the measured radius is zero —
 *    a wheel with no size, silently.
 *
 * 2. THE PHONE IS HEIGHT-DRIVEN, width derived by aspect-ratio. `width: auto`
 *    on a replaced element does NOT mean "work it out from my height" — it
 *    means use the source's own pixel width, which is the bug that stretched
 *    these in the original. One size to set, and the phone cannot be out of
 *    proportion.
 *
 * 3. THE WHEEL DOES NOT CLIP — the card's own overflow does. The phones are
 *    deliberately taller than their box and travel past its edges.
 */

const PHONES = [
  { src: "/images/mockup-phone@2x.webp", w: 560, h: 1103 },
  { src: "/images/mockup-phone-e@2x.webp", w: 500, h: 985 },
  { src: "/images/mockup-phone-t@2x.webp", w: 560, h: 1103 },
  { src: "/images/mockup-phone-l@2x.webp", w: 560, h: 1103 },
];

/* LZ-2's constants, unchanged. */
const INTERVAL = 2.5; // seconds between steps — the wheel holds, then turns
const TURN = 0.9;     // seconds the turn takes, shorter so it rests
const HUB_DROP = 1;   // hub below the box, so only the top of the arc crosses
const LEAN = 26;      // degrees at full side — NOT the spoke angle

export default function PhoneWheel() {
  const root = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const spokes = [...el.querySelectorAll<HTMLElement>("li")];
      if (!spokes.length) return;

      /* read from the DOM, so adding a phone re-spaces the wheel on its own. */
      const step = 360 / spokes.length;
      const state = { turn: 0 };
      let radius = 0;

      /* measured from the element, not stated: the card is fluid, so a baked
         number is right at one width only. Half the height, so the arc is as
         tall as the box that holds it. */
      const measure = () => {
        radius = el.getBoundingClientRect().height / 2;
      };

      /* one function, every phone, derived from state.turn — so the spokes can
         never drift out of step with each other. */
      const place = () => {
        spokes.forEach((spoke, i) => {
          /* wrapped, so a phone passing the bottom comes round the near side
             rather than the long way back. Unwrapped the angle just grows,
             loses float precision over a long session, and a resize mid-cycle
             recomputes from a huge number and visibly jolts. */
          const angle = gsap.utils.wrap(0, 360, (i - state.turn) * step);
          const rad = (angle * Math.PI) / 180;

          const x = Math.sin(rad) * radius;
          const y = HUB_DROP * radius - Math.cos(rad) * radius;

          /* THE LEAN, and it is sin() not `angle`. sin is 0 at the top and the
             bottom and peaks at the sides, so a phone is upright when
             presented and leans most as it passes. Using `angle` is the
             rigid-wheel version: it arrives at 90deg, lying on its side. */
          const lean = Math.sin(rad) * LEAN;

          /* depth, so a phone arriving behind is smaller and dimmer than the
             one presented. cos is 1 at the top and -1 at the bottom. */
          const depth = Math.cos(rad);

          const scale = 0.7 + 0.3 * ((depth + 1) / 2);

          /* written straight to style, not through gsap.set: this runs every
             frame for every phone, and gsap.set builds a tween, parses the
             property names and reads the existing transform back off the
             element before writing. Transform order is not commutative — move
             to the point on the arc, THEN lean, THEN scale. */
          spoke.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${lean}deg) scale(${scale})`;

          /* ⚠ ONLY PHONES IN THE PRESENTED ARC SHOW: Side and bottom phones (depth <= 0.15)
             fade completely to 0 at rest, eliminating the two stray corners/tips peeking out
             on the left and right flanks. */
          const visibleFactor = Math.max(0, (depth - 0.15) / 0.85);
          spoke.style.opacity = String(visibleFactor);
          spoke.style.visibility = visibleFactor <= 0 ? "hidden" : "visible";

          /* the presented phone must paint over the ones behind it. */
          spoke.style.zIndex = String(Math.round(depth * 100));
        });
      };

      /* reduced motion and mobile get a STATIC wheel, not an empty box: the
         matchMedia block never runs in either case, and without this the four
         phones stack at the container's origin, unplaced. */
      measure();
      place();

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        measure();
        place();

        /* repeatDelay rather than a longer duration: the pause is dead time
           between turns, not part of the easing. Rolling it into the duration
           flattens the ease across the hold and the motion crawls. */
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: INTERVAL - TURN,
          repeatRefresh: true,
        });

        /* repeatRefresh AND a function target, together. `turn: '+=1'` records
           its start value once, so every repeat replays that same 0 -> 1: the
           wheel turns a quarter, SNAPS BACK, and never gets anywhere. */
        tl.to(state, {
          turn: () => state.turn + 1,
          duration: TURN,
          /* weighted to the end, so the wheel leaves smartly and settles
             rather than drifting the last few degrees. */
          ease: "power3.inOut",
          onUpdate: place,
        });

        const onResize = () => {
          measure();
          place();
        };
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          tl.kill();
        };
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    /* SQUARE, and it does NOT clip — the card does. The module measures this
       box to get the radius, so it must have a size of its own rather than
       inheriting whatever the flex column leaves. */
    <ul
      ref={root}
      role="list"
      aria-hidden="true"
      className="relative m-0 grid aspect-square w-full list-none place-items-center overflow-visible p-0"
    >
      {PHONES.map((p) => (
        <li
          key={p.src}
          /* all four in the SAME cell, layered by document order until the
             module gives each a z-index from its depth. Both properties it
             writes composite, so the wheel runs off the main thread. */
          className="col-start-1 row-start-1 will-change-[transform,opacity]"
        >
          <img
            src={p.src}
            width={p.w}
            height={p.h}
            alt=""
            decoding="async"
            /* NO loading="lazy" — the rail moves the track by transform, and a
               transform does not update the geometry the lazy loader watches,
               so an off-screen card's images never fetch at all. */
            className="block"
            /* HEIGHT-DRIVEN, width DERIVED by the ratio. Inline rather than
               utilities so the height is authoritative: a utility height
               beside an aspect-ratio let the ratio derive the height from the
               width instead, landing under the clamp's own floor.
               max-inline-size lifts the reset's cap, which would silently
               re-clamp a phone as the wheel scales it up. */
            style={{
              blockSize: "clamp(320px, 14rem + 10vh, 520px)",
              inlineSize: "auto",
              aspectRatio: "560 / 1103",
              maxInlineSize: "none",
              objectFit: "contain",
            }}
          />
        </li>
      ))}
    </ul>
  );
}
