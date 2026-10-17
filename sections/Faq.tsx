"use client";

import { useEffect, useRef } from "react";
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

/* ⚠ STICKER ANTI-COLLISION LAW:
 * Coordinates tuned to spacious negative space pockets around the pills.
 * z-index locked to 5 (pills are z-10 closed and z-30 open) so pills ALWAYS
 * paint above stickers and readable copy is never obscured. */
export const FAQ_STICKERS = [
  {
    id: "sticker-1792129292826",
    name: "screenshot-2026-10-15-124544",
    src: "/images/sticker-screenshot-2026-10-15-124544.png",
    x: 12.0,
    y: 37.0,
    w: 10.3,
    rotate: -22,
    z: 5,
  },
  {
    id: "sticker-1792129312368",
    name: "screenshot-2026-10-15-124511",
    src: "/images/sticker-screenshot-2026-10-15-124511.png",
    x: 75.7,
    y: 84.2,
    w: 10.7,
    rotate: 18,
    z: 5,
  },
  {
    id: "sticker-1792129318538",
    name: "screenshot-2026-10-15-124624",
    src: "/images/sticker-screenshot-2026-10-15-124624.png",
    x: 51.5,
    y: 9.5,
    w: 10.4,
    rotate: 16,
    z: 5,
  },
  {
    id: "sticker-1792129322389",
    name: "screenshot-2026-10-15-124718",
    src: "/images/sticker-screenshot-2026-10-15-124718.png",
    x: 88.5,
    y: 36.0,
    w: 16.0,
    rotate: 24,
    z: 5,
  },
  {
    id: "sticker-1792129381412",
    name: "screenshot-2026-10-15-124734",
    src: "/images/sticker-screenshot-2026-10-15-124734.png",
    x: 22.6,
    y: 84.4,
    w: 10.5,
    rotate: -19,
    z: 5,
  },
];

/* how far the nearest neighbour is pushed, in px, and how far the opening pill
   rises. Both subtle — this is room being made, not a scatter. */
const PUSH = 54;
const LIFT = 0.42;

export default function Faq({ hideStickers = false }: { hideStickers?: boolean } = {}) {
  const wrap = useRef<HTMLDivElement>(null);
  /* which pill currently owns the layout — see the onToggle guard below. */
  const active = useRef<number | null>(null);

  /* Reset layout on resize below 1024px to prevent stale GSAP transforms */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && active.current !== null) {
        active.current = null;
        move(null, 0);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    const rootRect = root.getBoundingClientRect();
    /* Safe boundary margin within the desktop stage: minimum 24px or 3% */
    const marginX = Math.max(24, rootRect.width * 0.03);
    const marginY = 16;

    const { cx: fx, cy: fy } = home(cards[i]);

    cards.forEach((c, j) => {
      if (j === i) {
        /* Lift the active card by a fraction of what it grew, with dual-bound top and bottom safety */
        const currentY = Number(gsap.getProperty(c, "y")) || 0;
        const restingTop = c.getBoundingClientRect().top - currentY - rootRect.top;
        const targetLift = -grown * LIFT;
        const maxUpwardLift = marginY - restingTop; // most negative allowed Y (cannot lift above marginY)

        // Check bottom boundary on shallow laptop viewports (e.g. 1024x600):
        const maxBottom = rootRect.height - marginY;
        const projectedBottom = restingTop + c.offsetHeight + grown + targetLift;
        let lift = targetLift;
        if (projectedBottom > maxBottom) {
          lift += maxBottom - projectedBottom;
        }

        const clampedY = Math.max(lift, maxUpwardLift);

        gsap.to(c, { x: 0, y: Math.min(0, clampedY), duration: 0.55, ease: "power3.out", overwrite: "auto" });
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

      const rawTargetX = (dx / d) * amount;
      const rawTargetY = (dy / d) * amount;

      /* Clamp X to prevent pushing beyond root boundaries on compact desktops */
      const currentX = Number(gsap.getProperty(c, "x")) || 0;
      const cardRect = c.getBoundingClientRect();
      const restingLeft = cardRect.left - currentX - rootRect.left;
      const restingRight = restingLeft + c.offsetWidth;

      const minTargetX = marginX - restingLeft;
      const maxTargetX = rootRect.width - marginX - restingRight;

      const clampedX = minTargetX <= maxTargetX
        ? Math.max(minTargetX, Math.min(maxTargetX, rawTargetX))
        : rawTargetX;

      /* Clamp Y to prevent pushing out of vertical bounds */
      const currentY = Number(gsap.getProperty(c, "y")) || 0;
      const restingTop = cardRect.top - currentY - rootRect.top;
      const restingBottom = restingTop + c.offsetHeight;

      const minTargetY = marginY - restingTop;
      const maxTargetY = rootRect.height - marginY - restingBottom;

      const clampedY = minTargetY <= maxTargetY
        ? Math.max(minTargetY, Math.min(maxTargetY, rawTargetY))
        : rawTargetY;

      gsap.to(c, {
        x: clampedX,
        y: clampedY,
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
      {/* Desktop scattered pill layout (>= 1024px) - bounded within canvas ceiling */}
      <div
        ref={wrap}
        data-faq-wrap
        className="relative mx-auto hidden min-h-[var(--section-fill)] w-full max-w-[var(--canvas-max-width,120rem)] overflow-hidden lg:block"
      >
        {/* the wordmark, centred. pointer-events-none so it never blocks a
            pill that overlaps it. Tuned opacity on compact desktop (1024px-1280px) to preserve pill readability. */}
        <h2 className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(4.5rem,1.6rem+7.4vw,12.5rem)] leading-[0.9] uppercase select-none opacity-20 xl:opacity-100 transition-opacity duration-300">
          FAQ
        </h2>

        {PILLS.map((p, i) => (
          <div
            key={p.q}
            data-pill
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            /* ⚠ THE OPEN PILL PAINTS ABOVE ITS NEIGHBOURS AND STICKERS. */
            className="absolute z-10 has-[details[open]]:z-30"
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

        {/* Floating Stickers Layer locked to desktop canvas stage - strictly z-[5] below pills (z-10 / z-30) */}
        {!hideStickers && FAQ_STICKERS.map((st) => (
          <div
            key={st.id}
            aria-hidden="true"
            className="pointer-events-none absolute hidden lg:block z-[5]"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.w}%`,
              zIndex: st.z ?? 5,
              transform: `translate(-50%, -50%) rotate(${st.rotate}deg)`,
            }}
          >
            <img
              src={st.src}
              alt={st.name}
              className="block h-auto w-full max-w-none select-none drop-shadow-xl"
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
