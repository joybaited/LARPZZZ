"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Section from "@/components/Section";
import Card, { type CardData } from "@/components/Card";

/* Section two. Six cards in a carousel, rebuilt 1:1 against phantom.com's
 * security section (the pink "Scam detection" / grey "Ledger" cards).
 *
 * ⚠ IT IS A CLICK CAROUSEL, NOT A SCROLL-PINNED RAIL — that is the whole
 * change. The old version pinned the section and mapped vertical scroll onto
 * a horizontal transform, which is why the section needed `extra={1}` and why
 * its height was tangled up with the cards. Phantom does not do that: their
 * section is a normal ~1.9vh block that scrolls past like any other, and the
 * cards move only when you click an arrow or drag. Measured off their live
 * page rather than recreated by eye.
 *
 * Their numbers, read at 1440 and 1024:
 *   card ratio   0.747 at BOTH widths (427x571 and 468x627)
 *   radius       24px
 *   gap          32px at 1440, 24px at 1024
 *   gutter       48px at 1440, 32px at 1024
 *   step         one card per click (459px = 427 + 32)
 *   buttons      40x40, fully round, #E2DFFE, chevron M9 4L17 12L9 20,
 *                prev disabled at the start
 *
 * Embla is what they ship — found in their own bundle — and it brings the
 * drag, the momentum and the bounds for free. */

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
    media: { kind: "video", src: "/video/settingcust.webm", eager: true, down: "6cqw" },
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
    media: { kind: "video", src: "/video/idek.webm", down: "6cqw" },
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

export const FEATURES_STICKERS = [
  {
    id: "sticker-1792129027530",
    name: "screenshot-2026-10-15-132307",
    src: "/images/sticker-screenshot-2026-10-15-132307.png",
    x: 31.3,
    y: 12.7,
    w: 11.4,
    rotate: -67,
    z: 5,
  },
  {
    id: "sticker-1792129116255",
    name: "screenshot-2026-10-15-132307",
    src: "/images/sticker-screenshot-2026-10-15-132307.png",
    x: 67.4,
    y: 10.3,
    w: 10.6,
    rotate: 90,
    z: 5,
  },
  {
    id: "sticker-1792129166984",
    name: "screenshot-2026-10-15-124604",
    src: "/images/sticker-screenshot-2026-10-15-124604.png",
    x: 73.9,
    y: 110.9,
    w: 9.8,
    rotate: 16,
    z: 5,
  },
];

export default function Features({
  hideStickers = false,
  children,
}: {
  hideStickers?: boolean;
  children?: React.ReactNode;
} = {}) {
  const section = useRef<HTMLElement>(null);
  /* `align: "start"` + `containScroll: "trimSnaps"` is what makes the first
     card sit on the gutter and the last one stop AT the right edge instead of
     over-travelling — the exact failure the old rail had, where the last card
     finished 227px past the viewport. Embla handles the bounds. */
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    if (!embla) return;
    /* the arrows' disabled state, Phantom's: prev is disabled at the start
       and next at the end, rather than wrapping. */
    const sync = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    sync();
    embla.on("select", sync).on("reInit", sync);
    /* ⚠ THE CARDS MEASURE BEFORE THE FONTS SWAP IN. Both faces are
       `font-display: swap`, so the first paint uses a fallback and the real
       metrics arrive later — the card's copy box is `3 * 1.35em`, so the swap
       changes its height and the ratio derives the width from that. Embla
       caches slide positions at init, so without this the snap points are
       measured against a layout that no longer exists. Same trap the old
       ScrollTrigger rail had, same fix. */
    document.fonts?.ready.then(() => embla.reInit());
    return () => { embla.off("select", sync).off("reInit", sync); };
  }, [embla]);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    /* ⚠ THREE autoPlay loop VIDEOS DECODE FOREVER, ON OR OFF SCREEN.
       Measured at the page bottom with this section thousands of px away: all
       three still playing, ~121 decoded frames each per 2.5s. The browser does
       not stop them, and `preload` only governs the first fetch, not playback.
       Native play/pause on an IntersectionObserver — no state, no re-render,
       and it stays out of Card.tsx, which is a server component. */
    const vids = sec.querySelectorAll("video");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "300px" },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <Section
      id="features"
      heading="Features"
      ref={section}
      bleed
      /* ⚠ NO `extra` ANY MORE, AND THAT IS THE POINT. The old rail pinned the
         section and needed a second viewport of scroll to travel through, so
         the section's height was a function of the cards. Phantom's is a
         normal block that scrolls past like any other — the carousel moves on
         a click, not on scroll, so the section is one viewport and the card
         height has no say in it. */
      /* `text-violet` is for the section HEADING, which inherits it — the
         cards set their own ink. Black on this ground is unreadable. */
      className="overflow-hidden bg-[#3D065F] text-violet"
    >
      <div className="relative z-10 flex min-h-[var(--section-fill)] flex-col justify-center">
        {/* Ultrawide Controls & Track Containment:
            Bounded by --canvas-max-width (120rem / 1920px) so arrow controls
            and track snap points do not drift off to the 3400px monitor edges on ultrawide displays. */}
        <div className="mx-auto w-full max-w-[var(--canvas-max-width,120rem)]">
          {/* The arrows sit ABOVE the rail, not under it — they are the
              control for what follows, so they read before the thing they
              drive. Phantom's shape, scaled up from their 40px. */}
          <div className="mb-[clamp(20px,1rem+1.5vh,40px)] flex justify-end gap-(--space-xs) px-[clamp(20px,1rem+2vw,48px)]">
            <Arrow dir="prev" onClick={prev} disabled={!canPrev} />
            <Arrow dir="next" onClick={next} disabled={!canNext} />
          </div>

          {/* ⚠ THE VIEWPORT IS THE OVERFLOW BOX AND THE TRACK IS THE FLEX ROW.
              Embla needs exactly this pair: it writes the transform on the
              track and clips against the viewport. The gutter is PADDING on the
              viewport, not a margin on the first card, so `align: "start"`
              still snaps flush to it — 48px at 1440 and 32px below lg, which is
              what Phantom measures. */}
          <div ref={emblaRef} className="w-full overflow-hidden">
            {/* ⚠ THE GUTTER IS PADDING ON THE TRACK, NOT ON THE VIEWPORT, and
                that is what produces Phantom's peek. With it on the viewport the
                first card sits neatly on the margin and nothing bleeds; on the
                track it scrolls WITH the cards, so the row runs off both edges
                and you always see a sliver of the neighbours — which is what
                their page does. Embla still snaps the first card to the gutter
                because `align: "start"` measures against the track's content
                box. */}
            <ul className="flex list-none touch-pan-y gap-[clamp(16px,1rem+1vw,32px)] px-[clamp(20px,1rem+2vw,48px)] py-0">
              {CARDS.map((c) => (
                <Card key={c.heading.join(" ")} {...c} />
              ))}
            </ul>
          </div>

          {children}
        </div>

      </div>

      {/* Floating Stickers Layer — Stage-anchored within 120rem canvas ceiling, quarantined to desktop (hidden lg:block), z-[5] behind cards */}
      {!hideStickers && (
        <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[var(--canvas-max-width,120rem)] hidden lg:block">
          {FEATURES_STICKERS.map((st) => (
            <div
              key={st.id}
              aria-hidden="true"
              className="pointer-events-none absolute z-[5]"
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
      )}
    </Section>
  );
}

/* Phantom's arrow, to their measurements. `disabled:opacity-40` is their
   disabled look; the chevron path is theirs verbatim. */
function Arrow({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      className="grid size-[clamp(52px,3rem+1.2vw,64px)] place-items-center rounded-full bg-[#E2DFFE] text-[#3D065F] transition-opacity disabled:cursor-default disabled:opacity-40"
    >
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        className={dir === "prev" ? "rotate-180" : undefined}
      >
        <path d="M9 4L17 12L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
