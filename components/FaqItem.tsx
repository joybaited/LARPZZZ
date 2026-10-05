"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* One FAQ row. Native <details> for the semantics, GSAP for the height.
 *
 * ⚠ THE CLOSE HAS TO BE INTERCEPTED. The browser collapses a <details> the
 * instant `open` flips, so an exit tween never gets to run — preventDefault on
 * the toggle, animate, then set open=false in onComplete.
 *
 * `name` makes the group exclusive (one open at a time) with no state. */
export default function FaqItem({
  q,
  a,
  /* closed lie, in degrees. opening rotates it back to 0 — so they can be
     scattered at angles and straighten as they expand. */
  tilt = 0,
}: {
  q: string;
  a: string;
  tilt?: number;
}) {
  const body = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDetailsElement>(null);
  /* the hugged width, measured on the way open so the close has something to
     return to. */
  const closedW = useRef(0);

  /* ⚠ `name` MAKES THE BROWSER CLOSE THE OTHERS ITSELF, behind the tween. It
     sets open=false directly, so the exit animation never runs on the sibling
     and its inner height is left at the open value — the next open would then
     jump from full height instead of sliding. This catches that close and
     zeroes it. Only fires when GSAP is not already animating the element. */
  useEffect(() => {
    const d = el.current, b = body.current;
    if (!d || !b) return;
    const sync = () => {
      if (!d.open && !gsap.isTweening(b)) {
        gsap.set(b, { height: 0 });
        /* radius and width too, or the sibling is left square and stretched
           after the browser shuts it mid-tween. */
        gsap.to(d, {
          rotate: tilt,
          borderRadius: 999,
          width: closedW.current || "auto",
          duration: 0.42,
          ease: "power3.inOut",
          onComplete: () => gsap.set(d, { clearProps: "width" }),
        });
      }
    };
    gsap.set(d, { rotate: tilt });
    d.addEventListener("toggle", sync);
    return () => d.removeEventListener("toggle", sync);
  }, [tilt]);

  const toggle = (e: React.MouseEvent) => {
    const d = el.current, b = body.current;
    if (!d || !b) return;
    e.preventDefault();

    /* ⚠ ONE TIMELINE, NOT THREE TWEENS. Height, rotation and radius have to
       land together — separate tweens with different durations drift, and the
       radius was worse still as a CSS transition, on its own clock entirely.
       A timeline gives them one playhead and one ease.

       `expo.out` on the open: it covers most of the distance early, so the
       card feels like it springs open rather than creeping. The close is
       quicker and `power3.inOut` so it does not linger. */
    gsap.killTweensOf([d, b]);

    if (d.open) {
      gsap
        .timeline({
          defaults: { duration: 0.42, ease: "power3.inOut" },
          onComplete: () => {
            d.open = false;
            /* hand the width back to w-fit — an inline px value would pin the
               pill at the open measure forever. */
            gsap.set(d, { clearProps: "width" });
          },
        })
        .to(b, { height: 0 }, 0)
        .to(d, { rotate: tilt, borderRadius: 999, width: closedW.current }, 0);
    } else {
      /* remember the hugged width to close back to, then measure the room to
         open into. both read before anything is written, so neither is a
         forced reflow mid-tween. */
      closedW.current = d.getBoundingClientRect().width;
      const full = d.parentElement!.clientWidth;
      d.open = true;
      gsap
        .timeline({ defaults: { duration: 0.62, ease: "expo.out" } })
        .fromTo(b, { height: 0 }, { height: "auto" }, 0)
        .to(d, { rotate: 0, borderRadius: 28, width: full }, 0);
    }
  };

  return (
    /* a card. the height animation already drives the box, so expanding and
       shrinking is the same tween — only the skin changed. */
    <details
      ref={el}
      name="faq"
      /* ⚠ A PILL CLOSED, A CARD OPEN — AND GSAP OWNS THE RADIUS. It was a CSS
         transition, which put it on a different clock from the height and
         rotation and is what made the corner read as laggy. It is a timeline
         target now; the only transition left here is the hover colour, which
         is unrelated to the toggle.

         No `open:rounded-*` either — a class that fights an inline style GSAP
         is writing would snap it at the end of the tween.

         will-change: transform for the composited rotation. */
      /* ⚠ w-fit CLOSED. The pill hugs its question; opening tweens the width
         out to the container's full measure. `w-fit` is the resting state and
         GSAP writes an inline width over it during the tween — the inline
         value is cleared on close so this takes over again. */
      className="group mb-(--space-s) w-fit max-w-full overflow-hidden rounded-[999px] border border-ink/15 bg-paper/60 px-(--space-l) transition-colors duration-200 will-change-transform hover:bg-paper open:bg-paper"
    >
      <summary
        onClick={toggle}
        /* tighter than a card's padding — a pill reads as a pill only if the
           row is close to the text's own height. */
        /* ⚠ THE + SITS BESIDE THE TEXT, NOT AT THE FAR EDGE. justify-between
           on a hugged pill is a no-op, but the moment the width tweens open it
           would fling the + to the right edge mid-animation. `mr-auto` on the
           question does the same job only once the pill is wide. */
        className="flex cursor-pointer list-none items-center gap-(--space-m) py-(--space-s) text-[clamp(18px,0.95rem+0.7vw,24px)] [&::-webkit-details-marker]:hidden"
      >
        <span className="mr-auto">{q}</span>
        {/* rotates to an x. CSS, not GSAP — one transition beats a tween. */}
        <span className="shrink-0 text-[1.4em] leading-none transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>

      <div ref={body} className="h-0 overflow-hidden">
        <p className="max-w-[60ch] pb-(--space-m) opacity-70">{a}</p>
      </div>
    </details>
  );
}
