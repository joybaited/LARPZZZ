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
  /* closed lie, in degrees. opening rotates it back to 0. */
  tilt = 0,
  /* font-size in px (scaled by --px). Omit it to inherit the column's size,
     which is what /sections/Faq does so the size can change per breakpoint.
     Every inset on the row is in em, so this scales padding and radius too. */
  size,
  /* fires whenever this row opens or closes, including when the browser
     closes it because a sibling opened. `grown` is the answer's height in px,
     0 on close. */
  onToggle,
}: {
  q: string;
  a: string;
  tilt?: number;
  /* ⚠ DEAD — kept in the type so old call sites compile. Every row is the
     column's full width, open or closed, so there is no open width. */
  openW?: number;
  size?: number;
  onToggle?: (open: boolean, grown: number) => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDetailsElement>(null);
  /* ⚠ A REF, NOT THE PROP DIRECTLY. The toggle listener is bound once in an
     effect keyed on [tilt], so reading the prop there would go stale. */
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

  /* ⚠ `name` MAKES THE BROWSER CLOSE THE OTHERS ITSELF, behind the tween, so
     the sibling's exit never runs and its body is left at the open height.
     This catches that close and resets it. */
  useEffect(() => {
    const d = el.current, b = body.current;
    if (!d || !b) return;
    const sync = () => {
      if (!d.open && !gsap.isTweening(b)) {
        gsap.set(b, { height: 0 });
        gsap.to(d, { rotate: tilt, borderRadius: 999, duration: 0.42, ease: "power3.inOut" });
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

    /* ⚠ ONE TIMELINE: height, rotation and radius on one playhead.
       ⚠ NO WIDTH AND NO x. The row is the column's width open or closed, so
       it only grows DOWN — in flow, which pushes the rows below it and the
       section after it. The old width tween + edge-clamp slide is what threw
       an open pill off its siblings' edges on a phone (measured at 390: the
       10-380 row opened to 24-394, past the screen). */
    gsap.killTweensOf([d, b]);

    if (d.open) {
      gsap
        .timeline({ defaults: { duration: 0.42, ease: "power3.inOut" }, onComplete: () => { d.open = false; } })
        .to(b, { height: 0 }, 0)
        .to(d, { rotate: tilt, borderRadius: 999 }, 0);
      onToggleRef.current?.(false, 0);
    } else {
      d.open = true;
      const grown = b.scrollHeight;
      const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px")) || 1;
      gsap
        .timeline({ defaults: { duration: 0.62, ease: "expo.out" } })
        .fromTo(b, { height: 0 }, { height: grown }, 0)
        .to(d, { rotate: 0, borderRadius: Math.round(28 * px) }, 0);
      onToggleRef.current?.(true, grown);
    }
  };

  return (
    /* ⚠ GSAP OWNS THE RADIUS (pill closed, card open) — no `open:rounded-*`,
       a class fighting the inline style would snap at the end of the tween.
       ⚠ THE ROW IS THE INVERSE OF THE GROUND: solid #3D065F, #EAC2FF text,
       the hero nav's own treatment. No border: the fill is the edge. */
    <details
      ref={el}
      name="faq"
      style={size ? { fontSize: `calc(${size} * var(--px, 1px))` } : undefined}
      className="group w-full overflow-hidden rounded-[999px] bg-[#3D065F] text-[#EAC2FF] px-[1.6em] transition-colors duration-200 will-change-transform hover:bg-[#4d0878] open:bg-[#4d0878]"
    >
      <summary
        onClick={toggle}
        className="flex min-h-[48px] cursor-pointer list-none items-center gap-[1em] py-[0.8em] [&::-webkit-details-marker]:hidden"
      >
        {/* ⚠ ONE LINE FROM sm UP, WRAPS BELOW IT. The row no longer changes
            width, so a wrapped question cannot re-flow mid-tween — and at 360
            the longest question is ~320px of text in ~250px of room, so nowrap
            was clipping it under overflow-hidden. */}
        <span className="mr-auto text-balance sm:whitespace-nowrap">{q}</span>
        {/* rotates to an x. CSS, not GSAP — one transition beats a tween. */}
        <span className="shrink-0 text-[1.4em] leading-none transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>

      <div ref={body} className="h-0 overflow-hidden">
        {/* 85%, not 70: on the purple fill 70% reads muddy, not quiet. */}
        <p className="pb-[1em] text-[0.82em] leading-[1.4] opacity-85">{a}</p>
      </div>
    </details>
  );
}
