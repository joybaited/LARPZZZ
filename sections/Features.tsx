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
   cards more slowly. LZ-2 uses 1.6, which needs a section below it to supply
   the distance — see the `extra` note on the Section below. */
const SCROLL_RATIO = 1;
const SCRUB = 0.3;

/* The media, back on after the restyle — it was parked for a few passes while
 * the cards were sized and the text moved to the foot. Five of the six carry
 * one; card three never had any.
 *
 * It now fills the region ABOVE the splitter rather than the space under the
 * copy, which is where the restyle left it. Card.tsx holds that layout and the
 * per-media dials. */
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
    <Section
      id="features"
      ref={section}
      bleed
      /* the rail needs `distance` px of scroll AFTER the pin starts, and the
         pin starts at the track's centre — so the scroll above that point is
         distance the cards never travel through. without this the last card
         stops ~100px short of the right edge, because the document simply runs
         out. one extra viewport covers the track's travel at this card count. */
      extra={1}
      className="overflow-hidden bg-plum"
    >
      <div className="min-h-svh pt-[clamp(220px,11rem+24vh,520px)] max-lg:pt-[clamp(150px,8rem+15vw,280px)]">
        <ul
          ref={track}
          role="list"
          /* w-max is what makes the row wider than the viewport — the rail
             measures scrollWidth against it. Below 1024 it is a real scroller
             instead, with snap. */
          className="flex w-max list-none items-center gap-[clamp(28px,1.75rem+2.2vw,64px)] px-[clamp(32px,2rem+4vw,120px)] py-0 max-lg:w-auto max-lg:snap-x max-lg:snap-mandatory max-lg:gap-[clamp(16px,1rem+1vw,24px)] max-lg:overflow-x-auto max-lg:scroll-px-[clamp(20px,1rem+2vw,32px)] max-lg:px-[clamp(20px,1rem+2vw,32px)]"
        >
          {CARDS.map((c) => (
            <Card key={c.heading.join(" ")} {...c} />
          ))}
        </ul>
      </div>
    </Section>
  );
}
