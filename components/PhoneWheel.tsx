"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Four phone mockups arranged as the spokes of a wheel. The wheel turns a
 * quarter every 2.5s, so one phone swings out of the card as the next swings
 * in. Carried over from LZ-2's wheel.ts — the maths is theirs, the React
 * lifecycle is not.
 *
 * THE PHONE TILTS AS IT TRAVELS AND IS UPRIGHT WHEN IT ARRIVES. That is why
 * each phone is its own element rather than a child of a rotating hub: a rigid
 * wheel carries every phone round at the spoke's angle and they sit crooked in
 * the card. Position and lean are derived separately from one shared angle.
 */

const PHONES = [
  { src: "/images/mockup-phone@2x.webp", w: 560, h: 1103 },
  { src: "/images/mockup-phone-e@2x.webp", w: 500, h: 985 },
  { src: "/images/mockup-phone-t@2x.webp", w: 560, h: 1103 },
  { src: "/images/mockup-phone-l@2x.webp", w: 560, h: 1103 },
];

const INTERVAL = 2.5;   // seconds between steps — the wheel holds, then turns
const TURN = 0.9;       // seconds the turn itself takes, shorter so it rests
const HUB_DROP = 1;     // hub sits below the box, so only the top of the arc crosses
const LEAN = 26;        // degrees at full side — NOT the spoke angle, see below

export default function PhoneWheel() {
  const root = useRef<HTMLUListElement>(null);

  /* gsap.context() scopes every tween created inside it to this component and
     reverts them all on unmount — which is what @gsap/react's useGSAP wraps.
     Four lines of useEffect rather than a dependency for them. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {

      const spokes = [...el.querySelectorAll<HTMLElement>("li")];
      if (!spokes.length) return;

      const step = 360 / spokes.length;
      const state = { turn: 0 };
      let radius = 0;

      /* measured, not stated: the card is fluid so a baked number is right at
         one width only. */
      const measure = () => {
        radius = el.getBoundingClientRect().height / 2;
      };

      /* one function, every phone, derived from state.turn — so the spokes can
         never drift out of step with each other. */
      const place = () => {
        spokes.forEach((spoke, i) => {
          /* wrapped, so a phone passing the bottom comes round the near side
             rather than the long way back. unwrapped the angle just grows and
             loses float precision over a long session. */
          const angle = gsap.utils.wrap(0, 360, (i - state.turn) * step);
          const rad = (angle * Math.PI) / 180;

          const x = Math.sin(rad) * radius;
          const y = HUB_DROP * radius - Math.cos(rad) * radius;

          /* THE LEAN, and it is sin() not the angle. sin is 0 at top and
             bottom and peaks at the sides — upright when presented, leaning
             most as it passes. Using `angle` here is the rigid-wheel version:
             the phone arrives at 90deg and lies on its side. */
          const lean = Math.sin(rad) * LEAN;

          const depth = Math.cos(rad);
          /* never fully gone — a phone that vanishes reads as a swap, not a
             wheel. */
          const scale = 0.7 + 0.3 * ((depth + 1) / 2);

          /* written straight to style, not through gsap.set: this runs every
             frame for every phone, and gsap.set parses property names and
             reads the existing transform back off the element first.
             transform order is not commutative — translate, THEN lean, THEN
             scale. */
          spoke.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${lean}deg) scale(${scale})`;
          spoke.style.opacity = String(0.25 + 0.75 * ((depth + 1) / 2));
          spoke.style.zIndex = String(Math.round(depth * 100));
        });
      };

      measure();
      place();

      /* static wheel for reduced motion and small screens — laid out once, no
         loop. without this the four phones stack at the origin, unplaced. */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        measure();
        place();

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: INTERVAL - TURN,
          repeatRefresh: true,
        });

        /* repeatRefresh + a FUNCTION target, together. `turn: '+=1'` records
           its start value once, so every repeat replays 0 -> 1 and the wheel
           snaps back instead of advancing. */
        tl.to(state, {
          turn: () => state.turn + 1,
          duration: TURN,
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
    <ul
      ref={root}
      role="list"
      aria-hidden="true"
      className="relative m-0 grid h-full w-full list-none place-items-center overflow-hidden p-0"
    >
      {PHONES.map((p) => (
        <li
          key={p.src}
          /* every spoke stacked at the centre; the transform places it. */
          className="col-start-1 row-start-1 will-change-transform"
        >
          <img
            src={p.src}
            width={p.w}
            height={p.h}
            alt=""
            decoding="async"
            /* NO loading="lazy" — the rail moves the track by transform, and a
               transform does not update the geometry the lazy loader watches.
               Off-screen cards would never fetch at all. */
            className="h-auto w-[clamp(96px,30%,140px)] max-w-none"
          />
        </li>
      ))}
    </ul>
  );
}
