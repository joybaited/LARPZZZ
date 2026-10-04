"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "@/components/Section";
import Card, { type CardData } from "@/components/Card";

gsap.registerPlugin(ScrollTrigger);

/* Section two. Six cards on a horizontal rail, carried over from LZ-2 and
 * rebuilt in React.
 *
 * THE PATTERN: pin the SECTION, and as the page scrolls vertically through
 * it, translate the TRACK inside it horizontally. The page never scrolls
 * sideways — the only thing moving is one transform on the track.
 *
 * THE SECTION IS PINNED, THE TRACK IS ANIMATED, AND THEY ARE NOT THE SAME
 * ELEMENT. Animating the pinned element corrupts the measurements ScrollTrigger
 * took to pin it, which is the most common way this pattern breaks.
 *
 * Below 1024 the rail never mounts: the track is a real scroll-snap carriage
 * and the browser does the physics — momentum, rubber band and snap for free.
 */

/* multiple of the track's travel that the pin lasts. 1 is one pixel of
   scrolling per pixel of travel; higher holds the section longer and moves the
   cards more slowly.
   ponytail: 1 because section two is currently LAST on the page. a ratio above
   1 asks for more scroll distance than the document has left, the scrub never
   reaches the end, and the final card stops short of the right edge. raise it
   once there is a section below to supply the distance. */
const SCROLL_RATIO = 1;
const SCRUB = 0.3;

const CARDS: CardData[] = [
  {
    heading: ["Winter", "Blankets"],
    copy: "Get big warmth for cold heavy. Snow out freezing or stay cozy — this night.",
    media: { kind: "video", src: "/video/settingcust.webm", eager: true },
  },
  {
    heading: ["Heavy-Weather", "Day"],
    copy: "Prepared to stay resilient in massive storms. Radical for photography, hiking, or camping in your local area.",
    media: { kind: "wheel" },
  },
  {
    heading: ["Red Apples", "Rolled"],
    copy: "They never look for blue birds, yellow cars, or green umbrellas. Totally fun to watch.",
  },
  {
    heading: ["Bake Fresh", "Cakes"],
    copy: "Bake bread for local bakery shop guests and let them eat it warm in the morning — entirely.",
    media: { kind: "video", src: "/video/idek.webm" },
  },
  {
    heading: ["Yellow Banana", "Slices"],
    copy: "Throw soft rubber balls that make them bounce high — on time, near our house.",
    media: { kind: "video", src: "/video/folk.webm" },
  },
  {
    heading: ["Rain &", "Lightning"],
    copy: "Crashes like a wave on our little sailboat. No dry towel remains.",
    media: { kind: "image", src: "/images/safa.webp", w: 1080, h: 1080 },
  },
];

export default function Features() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sec = section.current;
    const trk = track.current;
    if (!sec || !trk) return;

    const ctx = gsap.context(() => {
      /* matchMedia reverts everything it created the moment neither condition
         matches — so a resize across the breakpoint, or reduced motion being
         turned on, tears the pin down rather than leaving the section stuck to
         the viewport. 1024 is the stylesheet's boundary, stated twice. */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        /* FUNCTION-BASED so it is re-read on every refresh. A bare number is
           why this pattern breaks on resize and after fonts load — the
           distance was measured against a layout that no longer exists.
           Measured against innerWidth, not the section: a pinned element's
           width is set explicitly by ScrollTrigger and is not the viewport's. */
        const distance = () => Math.max(0, trk.scrollWidth - window.innerWidth);

        gsap.to(trk, {
          x: () => -distance(),
          /* REQUIRED. Any other ease breaks the 1:1 mapping between scroll
             position and horizontal position. */
          ease: "none",
          scrollTrigger: {
            trigger: trk,
            start: "center center",
            end: () => `+=${distance() * SCROLL_RATIO}`,
            pin: sec,
            /* pins add scroll distance, so they must measure before anything
               positioned below them. */
            refreshPriority: 1,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              trk.style.willChange = self.isActive ? "transform" : "auto";
            },
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <Section id="features" ref={section} bleed className="overflow-hidden bg-haze">
      <div className="flex min-h-svh flex-col justify-center py-(--space-2xl)">
        <ul
          ref={track}
          role="list"
          /* w-max is what makes the row wider than the viewport — the rail
             measures scrollWidth against it. Below 1024 it is a real scroller
             instead, with snap. */
          className="flex w-max list-none gap-(--space-l) p-0 ps-(--nav-inset) max-lg:w-auto max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto"
        >
          {CARDS.map((c) => (
            <Card key={c.heading.join(" ")} {...c} />
          ))}
          {/* the trailing gutter as a real element, not padding. a flex row's
              scrollWidth does not include its own padding-inline-end, so the
              rail measured short by exactly this much and the last card
              stopped off the right edge. an element is measured. */}
          <li aria-hidden="true" className="w-(--nav-inset) shrink-0" />
        </ul>
      </div>
    </Section>
  );
}
