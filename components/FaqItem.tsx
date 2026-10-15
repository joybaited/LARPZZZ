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
  /* ⚠ THE OPEN WIDTH, IN PX. Without it the pill opens to its PARENT's width,
     which is right in a normal column and wrong the moment the pill is placed
     absolutely — an absolute parent is sized by the pill itself, so there is
     nothing to expand into and it grows tall and narrow instead. Set this
     whenever the pill is positioned freely. */
  openW,
  /* font-size in px. Every inset on the pill is in em, so this scales the box,
     padding, radius and the + together — tuned per pill in /faq-tuner. */
  size = 20,
  /* fires whenever this pill opens or closes, including when the browser
     closes it because a sibling opened. `grown` is the answer's real height in
     px, so the section can size the push to the content rather than guessing.
     0 on close. */
  onToggle,
}: {
  q: string;
  a: string;
  tilt?: number;
  openW?: number;
  size?: number;
  onToggle?: (open: boolean, grown: number) => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDetailsElement>(null);
  /* the hugged width, measured on the way open so the close has something to
     return to. */
  const closedW = useRef(0);
  /* ⚠ A REF, NOT THE PROP DIRECTLY. The toggle listener is bound once in an
     effect keyed on [tilt], so reading the prop there would capture the first
     render's closure and go stale. */
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

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
          x: 0,
          duration: 0.42,
          ease: "power3.inOut",
          onComplete: () => gsap.set(d, { clearProps: "width" }),
        });
        onToggleRef.current?.(false, 0);
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
        /* x back to 0 — it is only non-zero when the pill had to slide in off
           the section's edge to open. */
        .to(d, { rotate: tilt, borderRadius: 999, width: closedW.current, x: 0 }, 0);
      onToggleRef.current?.(false, 0);
    } else {
      /* remember the hugged width to close back to, then measure the room to
         open into. both read before anything is written, so neither is a
         forced reflow mid-tween. */
      const r0 = d.getBoundingClientRect();
      closedW.current = r0.width;

      /* ⚠ THE PILL MUST NOT OPEN PAST THE SECTION'S EDGE. It is anchored by its
         LEFT edge and expands rightward, so a pill placed far right ran its
         open width straight off the section. Two steps, in order:

         1. clamp the width to the room actually left of the edge, so it never
            exceeds the section;
         2. if the clamp would squeeze it below a readable measure, slide the
            pill LEFT by the shortfall instead — it comes inside rather than
            getting narrow.

         The section, not the viewport: the pill is placed against the section's
         box and `overflow-hidden` there is what would clip it. */
      const edge = d.closest("section")?.getBoundingClientRect();
      const GUTTER = 24;
      const maxW = edge ? Math.max(280, edge.width - GUTTER * 2) : 340;
      let slide = 0;
      /* ⚠ NEVER NARROWER THAN THE CLOSED PILL. A configured openW below the
         hugged width squeezes the QUESTION onto two lines as the pill opens and
         snaps it back to one as it closes — the text break. The closed width is
         the floor, so opening can only ever widen. */
      let full = Math.min(Math.max(openW ?? d.parentElement!.clientWidth, r0.width), maxW);

      if (edge) {
        const room = edge.right - r0.left - GUTTER;
        if (full > room) {
          /* never below 72% of the configured width — past that it stops
             reading as the same pill and the answer re-wraps badly. */
          const floor = full * 0.72;
          if (room >= floor) {
            full = room;
          } else {
            full = floor;
            slide = -(full - room);
          }
        }
      }

      d.open = true;

      /* ⚠ MEASURE THE ANSWER AT ITS OPEN WIDTH, BEFORE ANIMATING. The body is
         height:0 and the pill is still hugged, so reading scrollHeight now
         would measure the answer wrapped to the CLOSED width — far too tall.
         Setting the final width first makes the measurement the real one, and
         it is a single read before any tween starts, so nothing thrashes. */
      gsap.set(d, { width: full });
      const grown = b.scrollHeight;

      gsap
        .timeline({ defaults: { duration: 0.62, ease: "expo.out" } })
        .fromTo(b, { height: 0 }, { height: grown }, 0)
        .fromTo(d, { width: closedW.current }, { rotate: 0, borderRadius: 28, width: full, x: slide }, 0);

      onToggleRef.current?.(true, grown);
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
      style={{ fontSize: `${size}px` }}
      /* ⚠ THE PILL IS THE INVERSE OF THE GROUND, NOT A TINT OF IT. It was
         `bg-paper/60` with `border-ink/15` — alpha over white, which against
         the purple ground reads as washed lilac with no edge rather than as a
         pill. Solid `#3D065F` with `#EAC2FF` text is the hero nav's own
         treatment (purple bar, pink labels), so the two sections match.
         No border: at full opacity the fill is the edge. */
      className="group w-fit max-w-full overflow-hidden rounded-[999px] bg-[#3D065F] text-[#EAC2FF] px-[1.6em] transition-colors duration-200 will-change-transform hover:bg-[#4d0878] open:bg-[#4d0878]"
    >
      <summary
        onClick={toggle}
        /* tighter than a card's padding — a pill reads as a pill only if the
           row is close to the text's own height. */
        /* ⚠ THE + SITS BESIDE THE TEXT, NOT AT THE FAR EDGE. justify-between
           on a hugged pill is a no-op, but the moment the width tweens open it
           would fling the + to the right edge mid-animation. `mr-auto` on the
           question does the same job only once the pill is wide. */
        className="flex cursor-pointer list-none items-center gap-[1.2em] py-[0.8em] [&::-webkit-details-marker]:hidden"
      >
        {/* ⚠ ONE LINE, ALWAYS. The pill's width changes throughout the tween,
            so a wrappable question re-flows mid-animation and visibly jumps
            between one and two lines. The pill hugs this text when closed, so
            nowrap costs nothing — it just stops the width tween from being able
            to re-break it. */}
        <span className="mr-auto text-balance max-sm:whitespace-normal whitespace-nowrap">{q}</span>
        {/* rotates to an x. CSS, not GSAP — one transition beats a tween. */}
        <span className="shrink-0 text-[1.4em] leading-none transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>

      <div ref={body} className="h-0 overflow-hidden">
        {/* ⚠ NO max-w HERE. 60ch at this font size is ~600px, wider than the
            configured openW, so the answer forced the pill past its own open
            width and the text re-wrapped mid-tween — the misalignment. The
            pill's width is the only thing that should decide the measure. */}
        {/* ⚠ opacity-70 WAS TUNED FOR DARK-ON-WHITE. Against the pill's
            purple fill, dropping the pink text to 70% pulls it toward the
            fill rather than toward a lighter grey — it reads muddy, not
            quiet. 85% keeps the answer subordinate to the question while
            staying legible on the dark ground. */}
        <p className="pb-[1em] text-[0.82em] leading-[1.4] opacity-85">{a}</p>
      </div>
    </details>
  );
}
