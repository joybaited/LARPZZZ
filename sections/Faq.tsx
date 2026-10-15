"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import Section from "@/components/Section";
import FaqItem from "@/components/FaqItem";

/* Section five. FAQ — the wordmark centred, pills scattered around it.
 *
 * Megion is one weight (Bold) and display-only, so `font-display` is already
 * the bold cut — there is no font-weight to set.
 */

/* ⚠ ARRANGED IN /faq-tuner, PASTED BACK. Do not hand-edit these numbers —
 * open the tuner, move things, copy the config. x and y are percentages of the
 * section, so the arrangement holds at any window size; tilt is the closed lie
 * in degrees, straightened to 0 on open; openW is the expanded width in px and
 * size is the pill's font-size, which scales the whole pill.
 *
 * Answers are still placeholder — the owner has not written them. */
export const PILLS = [
  { q: "What is Larpzwallet?", a: "New answer.", x: 37.4, y: 21, tilt: 0, openW: 550, size: 27.5 },
  { q: "Do i need a seed phrase or a real wallet to use it ?", a: "New answer.", x: 35.1, y: 78.5, tilt: -0.3, openW: 490, size: 20 },
  { q: "Will it look exactly like the real crypto apps?", a: "New answer.", x: 6.3, y: 16.2, tilt: -20, openW: 520, size: 20 },
  { q: "Does it work on Iphone and Android?", a: "New answer.", x: 65, y: 16.4, tilt: 16.7, openW: 520, size: 20 },
  { q: "Can i add custom tokens and memecoins?", a: "New answer.", x: 3.9, y: 59.4, tilt: 14.8, openW: 520, size: 20 },
  { q: "Is my payment anonymous", a: "New answer.", x: 78.8, y: 59.8, tilt: -17, openW: 520, size: 20 },
];

/* how far the nearest neighbour is pushed, in px, and how far the opening pill
   rises. Both subtle — this is room being made, not a scatter. */
const PUSH = 54;
const LIFT = 0.42;

export default function Faq() {
  const wrap = useRef<HTMLDivElement>(null);
  /* which pill currently owns the layout — see the onToggle guard below. */
  const active = useRef<number | null>(null);

  /* ⚠ THE SECTION MOVES THE PILLS, NOT THE PILL ITSELF. A pill knows nothing
     about its neighbours; the arrangement lives here.

     ⚠ MEASURED AFTER THE PILL HAS OPENED, NOT BEFORE. The first version ran on
     the click, before the <details> had expanded, so it pushed against the
     CLOSED box and made the same gap whatever the answer's length. It is
     called from onToggle after the open now, so `grown` below is the real
     height the content needs and the push is proportional to it.

     ⚠ THE OPENING PILL RISES BY ITS OWN GROWTH. It expands downward from a
     fixed top, so a pill low in the section pushed its own answer off the
     bottom edge while the neighbours politely moved — which is the gimmick
     with no purpose. Lifting it by a fraction of what it grew keeps the answer
     on screen and reads as the pill making room for itself. */
  const move = (i: number | null, grown: number) => {
    const root = wrap.current;
    if (!root) return;
    const cards = [...root.querySelectorAll<HTMLElement>("[data-pill]")];

    if (i === null) {
      gsap.to(cards, { x: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      return;
    }

    /* ⚠ MEASURED WITH THE PUSH REMOVED. A rect read while the pills are
       already displaced includes the previous push, so switching from one pill
       to another would compound the offsets and the arrangement would drift
       further apart with every click. Reading each card's own x/y back out and
       subtracting it gives the resting position every time. */
    const home = (c: HTMLElement) => {
      const r = c.getBoundingClientRect();
      return {
        cx: r.left + r.width / 2 - (Number(gsap.getProperty(c, "x")) || 0),
        cy: r.top + r.height / 2 - (Number(gsap.getProperty(c, "y")) || 0),
      };
    };

    const { cx: fx, cy: fy } = home(cards[i]);

    cards.forEach((c, j) => {
      if (j === i) {
        gsap.to(c, { x: 0, y: -grown * LIFT, duration: 0.55, ease: "power3.out", overwrite: "auto" });
        return;
      }
      const { cx, cy } = home(c);
      const dx = cx - fx;
      const dy = cy - fy;
      const d = Math.hypot(dx, dy) || 1;
      /* nearest move most, the far side barely stirs. */
      const force = Math.min(1, 340 / d);
      /* scaled by how much the pill actually grew, so a one-line answer
         nudges and a long one clears real space. */
      const amount = PUSH * force * Math.min(1.4, grown / 70);
      gsap.to(c, {
        x: (dx / d) * amount,
        y: (dy / d) * amount,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  };

  return (
    /* bleed: the pills are placed against the full section, not the centred
       content column, so the percentages mean what the tuner showed. */
    <Section id="faq" bleed className="bg-violet text-[#3D065F]">
      {/* Desktop scattered pill layout (>= 1024px) - preserves exact 1536x742 baseline geometry */}
      <div ref={wrap} className="relative hidden min-h-[var(--section-fill)] overflow-hidden lg:block">
        {/* the wordmark, centred. pointer-events-none so it never blocks a
            pill that overlaps it. */}
        <h2 className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(4.5rem,1.6rem+7.4vw,12.5rem)] leading-[0.9] uppercase select-none">
          FAQ
        </h2>

        {PILLS.map((p, i) => (
          <div
            key={p.q}
            data-pill
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            /* ⚠ THE OPEN PILL PAINTS ABOVE ITS NEIGHBOURS. They overlap once
               tilted and expanded, and document order would otherwise let a
               later pill cover the one being read. `has-[details[open]]` lifts
               only the open one.

               ⚠ GSAP WRITES x/y ON THIS WRAPPER, the pill writes its own
               rotation and width on the <details> inside. Two elements, so the
               shove and the expand cannot clobber each other's transform. */
            className="absolute has-[details[open]]:z-10"
          >
            <FaqItem
              q={p.q}
              a={p.a}
              tilt={p.tilt}
              openW={p.openW}
              size={p.size}
              /* ⚠ A CLOSE ONLY COUNTS IF IT IS THE ACTIVE PILL. Opening B makes
                 the browser close A, which fires A's onToggle(false) a moment
                 AFTER B has already pushed everything — so an unguarded reset
                 would undo B's push instantly. Only the pill that currently
                 owns the layout may send it home. */
              onToggle={(isOpen, grown) => {
                if (isOpen) {
                  active.current = i;
                  move(i, grown);
                } else if (active.current === i) {
                  active.current = null;
                  move(null, 0);
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Mobile & Tablet stacked accordion (< 1024px) */}
      <div className="flex flex-col items-center px-4 py-8 lg:hidden">
        <h2 className="mb-8 font-display text-[clamp(3.5rem,14vw,6rem)] leading-[0.9] uppercase select-none text-center">
          FAQ
        </h2>
        <div className="flex w-full max-w-lg flex-col items-center gap-3">
          {PILLS.map((p) => (
            <div key={p.q} className="flex w-full justify-center">
              <FaqItem
                q={p.q}
                a={p.a}
                tilt={0}
                size={16}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
