import Section from "@/components/Section";

/* Section four. Two rows of testimonial cards travelling in opposite
 * directions, forever. Carried over from LZ-2's section 05.
 *
 * WHY CSS AND NOT GSAP — LZ-2's reasoning, and it still holds. GSAP is on this
 * page and section two uses it, but every other animation here is scroll-linked
 * or measured. This one is neither: a constant-speed loop that never reads the
 * scroll position and has no controls. A CSS animation runs on the compositor
 * with no mount, no teardown, no resize handler and no ScrollTrigger refresh,
 * so it cannot fall out of step. The day it needs to pause on hover or respond
 * to scroll, it becomes a client component — not before.
 *
 * ⚠ IT IS A SERVER COMPONENT. No "use client", because there is no state, no
 * effect and no handler. That also means the cards' data can come straight from
 * a fetch here when one is wired up, with no round trip to the browser.
 *
 * THE SEAM: each row holds the set TWICE and travels exactly one set's width
 * plus one gap, at which point the second set sits precisely where the first
 * began and the reset to 0 cannot be seen. Dropping the gap term makes the loop
 * jump by one gap every pass — a stutter that reads as jank rather than as an
 * obviously broken animation. Keyframes are in globals.css.
 *
 * ⚠ REDUCED MOTION IS HANDLED IN globals.css, which caps every animation at
 * 0.01ms. That leaves the cards sitting still, which is the correct outcome.
 */

/* ── THE DATA ─────────────────────────────────────────────────────────────
 *
 * ⚠ THE SHAPE IS THE INTEGRATION POINT, and it is deliberately the only part
 * built today. Kez's intent is that these come from an external source —
 * Telegram, Google, or whatever wins — so what matters now is that the section
 * renders a LIST rather than hardcoded markup. Swapping this array for a fetch
 * is then a one-line change in this file and nothing in the markup moves.
 *
 * Not built yet, on purpose: no API client, no env vars, no caching layer, no
 * fallback UI. Which source it is decides all four, and none of them can be
 * designed correctly before that. What the sources look like when it is time:
 *
 *   Google   — Places API `fetchFields` with a `reviews` field mask. Returns
 *              author, rating, text, time and a profile photo URL. ⚠ CAPPED AT
 *              5 REVIEWS PER PLACE, which is the real constraint on this design
 *              and the reason the row duplicates a small set rather than paging
 *              a long one. Needs a billing-enabled key, server-side.
 *   Telegram — no reviews product. It would be a bot reading a channel's
 *              messages (getUpdates / channel history) and mapping them to this
 *              shape, which also means moderation is on us.
 *
 * Either way the server component fetches, maps to Testimonial[], and the
 * markup below is unchanged. Keep `id` stable per source so React's keys do not
 * churn when the list refreshes. */
export type Testimonial = {
  id: string;
  /** the quote. one to three lines reads best at this card size. */
  quote: string;
  name: string;
  /** a handle, title or city — whatever the source gives. */
  detail?: string;
};

/* Placeholder copy, clearly marked as such. LZ-2 left its boxes empty rather
   than inventing testimonials; these exist so the row has something to measure
   and are not meant to ship. */
const TESTIMONIALS: Testimonial[] = [
  { id: "t1", quote: "Placeholder quote of about the length a real one runs to, so the card is sized against something honest.", name: "Name", detail: "@handle" },
  { id: "t2", quote: "A shorter placeholder — this is what a brief one looks like.", name: "Name", detail: "@handle" },
  { id: "t3", quote: "Placeholder quote that runs a little longer than the others, to show where the copy starts to crowd the card and the clamp takes over.", name: "Name", detail: "@handle" },
  { id: "t4", quote: "Placeholder quote, middling length, roughly three lines at this card size.", name: "Name", detail: "@handle" },
];

/* LZ-2 1:1. 40s one way; row two is slower so the two never beat in sync and
   the pair does not read as one block sliding. */
const DURATION = ["40s", "52s"];

function Card({ t }: { t: Testimonial }) {
  return (
    /* ⚠ shrink-0 — a flex item defaults to shrinking to fit, which would
       compress the cards onto the screen, make the travel distance wrong and
       break the seam. The row depends on being wider than what holds it. */
    /* ⚠ A BOUNDED HEIGHT (SCALPEL QDPA): Sized to prevent vertical overflow on shallow
       viewports (e.g. 1536x742) while preserving proportional growth on tall displays.
       The height is bounded to fit two rows inside var(--section-fill) minus the gap.
       ⚠ A FIXED `h-` ONLY IN LANDSCAPE. The card's height is derived from
       --section-fill, which is now smaller on a portrait screen — so a fixed
       height cut the quote off by 7-8px on every phone (measured 98>91 at
       412, 91>83 at 390). In portrait it is a MIN-height: the row still has a
       floor, and a card grows for the text it holds rather than clipping it.
       Landscape keeps the exact two-rows-in-one-fill geometry as tuned. */
    /* ⚠ NOT justify-between. With a fixed height that pushes the quote to the
       top and the footer to the floor, leaving a hole in the middle on any
       quote shorter than the card. The quote sits at the top, the footer gets
       `mt-auto`, and a short quote simply leaves the gap where it belongs. */
    /* ⚠ THE CARD IS THE INVERSE OF THE GROUND, not a tint of it — the same
       treatment as the FAQ pills and the hero nav. It was `bg-paper text-ink`
       on a `bg-deep` section; the section is now the hero's `#EAC2FF` ground,
       so a white card would glare against it. */
    <li className="flex min-h-[clamp(170px,min(12rem+6.5vw,calc((var(--section-fill)-clamp(24px,1rem+1.4vw,44px)-2rem)/2)),360px)] w-[clamp(280px,17rem+9.5vw,500px)] shrink-0 flex-col rounded-[20px] bg-[#3D065F] p-[clamp(20px,1.2rem+1.4vw,36px)] text-[#EAC2FF] [@media(min-aspect-ratio:1/1)]:h-[clamp(170px,min(12rem+6.5vw,calc((var(--section-fill)-clamp(24px,1rem+1.4vw,44px)-2rem)/2)),360px)]">
      {/* scales with the card, so the quote fills it rather than floating in
          it. line-clamp keeps a long one from pushing the footer out. */}
      {/* 4, not 5: at this height a 5th line is half-cut by the card's floor —
          the clamp has to stop at what actually fits, not at what overflows.
          ⚠ THE LINE COUNT CANNOT BE A FIXED NUMBER, because the card's height
          comes from the viewport and the line height comes from the type
          scale, so how many lines FIT changes with both. Measured, lines the
          card can hold vs lines requested:
            1920x940  holds 6, asked 4   (wasting two)
            1366x640  holds 3, asked 4   (cut the 4th)
            430x860   holds 3, asked 4   (cut the 4th)
            843x546   holds 2, asked 2   but still overflowed 61>41
          A media query per viewport is a guess that is wrong between the
          guesses — a first attempt at `min-height:620px` broke 1280x610,
          which had been fine. So the quote is a flex child that takes the
          space the card actually gives it (`flex-1 min-h-0 overflow-hidden`)
          and the 4-line clamp is only a ceiling for a long quote on a tall
          card. The box can no longer ask for more room than it has.
          The one remaining number is the clamp itself: a -webkit-box still
          reserves its full line count even inside a shorter flex box, so on
          the two genuinely shallow viewports (843x546, 844x340 — both ~2
          lines of room) it is 2. 580px is below every normal phone portrait
          (730+) and above both of those, so no real phone is affected. */}
      <p className="min-h-0 flex-1 overflow-hidden text-[clamp(15px,min(0.95rem+0.7vw,2.2vh),24px)] leading-[1.35] [-webkit-box-orient:vertical] [display:-webkit-box] [-webkit-line-clamp:2] [@media(min-height:580px)]:[-webkit-line-clamp:4]">
        {t.quote}
      </p>
      {/* ⚠ THE NAME IS THE CARD'S HEADING, AND IT IS THE ONLY MEGION HERE.
          Kez's: the display face carries the name, the quote and the handle
          stay in Neue Montreal — setting the quote in Megion too would make
          the card all display type and nothing would read as the heading.

          No `font-medium` on it: Megion ships one weight (Bold) and is
          display-only, so there is no weight to set. Same note as the FAQ.

          The size is in `em`, so it scales off the footer's own clamp rather
          than needing a second clamp of its own. */}
      <footer className="mt-auto pt-[clamp(12px,0.6rem+0.6vw,20px)] text-[clamp(14px,0.8rem+0.3vw,17px)]">
        <p className="font-display text-[1.15em] leading-[1.1] uppercase tracking-[0.02em]">{t.name}</p>
        {t.detail && <p className="opacity-80">{t.detail}</p>}
      </footer>
    </li>
  );
}

function Row({ reverse }: { reverse?: boolean }) {
  /* the set, twice. the second copy is aria-hidden: it is the same cards over
     again and a screen reader should meet them once. */
  return (
    <div className="flex flex-nowrap gap-[clamp(24px,1rem+1.4vw,44px)] overflow-hidden">
      {[false, true].map((dupe) => (
        <ul
          key={String(dupe)}
          role="list"
          aria-hidden={dupe || undefined}
          /* ⚠ THE GAP IS DECLARED TWICE ON PURPOSE — once as the flex gap and
             once as --gap, which the keyframe reads. The keyframe cannot see a
             `gap` property, and the travel must be one set's width PLUS one
             gap or the loop jumps. Keeping them as one token is what stops the
             two drifting apart when the gap is tuned. */
          style={{
            "--gap": "clamp(24px, 1rem + 1.4vw, 44px)",
            animationDuration: DURATION[reverse ? 1 : 0],
            animationDirection: reverse ? "reverse" : undefined,
          } as React.CSSProperties}
          className="animate-marquee m-0 flex shrink-0 list-none gap-[clamp(24px,1rem+1.4vw,44px)] p-0"
        >
          {TESTIMONIALS.map((t) => (
            <Card key={t.id} t={t} />
          ))}
        </ul>
      ))}
    </div>
  );
}


export default function Testimonials({
  stageRef,
  children,
}: {
  stageRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
} = {}) {
  return (
    /* bleed: the rows are deliberately wider than the screen, so they must not
       sit in the centred content column. */
    <Section id="testimonials" bleed heading="Testimonials" className="text-[#3D065F]">
      {/* ⚠ RATIO-LOCKED STICKER STAGE. The sticker x/y are percentages, and a
          percentage is only proportional while the box it measures is the same
          SHAPE. On `inset-0` this box took the section's aspect ratio, which
          changes with every window — so 12.5%/9.1% sat in negative space on the
          1536x742 baseline and landed on the heading at 1366x640. Root-font
          scaling cannot fix that; it scales sizes, not coordinates.
          Locked to the baseline ratio (1536/742 = 2.07) and fitted inside the
          section like a video: wider window letterboxes at the sides, narrower
          one leaves space top and bottom. Every percentage inside is then
          geometrically identical to the baseline at every viewport, and
          /tuner output stays valid at any window size.
          Centred both axes — `inset-0` is replaced by the inset-block-0 +
          margin auto pair, so the stage sits in the middle of the section
          rather than pinned to its top. */}
      <div
        ref={stageRef}
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 px-(--gutter)"
        style={{
          aspectRatio: "1536 / 742",
          width: "min(var(--canvas-max-width, 120rem), 100vw, calc(var(--section-fill) * 2.0701))",
          maxWidth: "100vw",
          marginBlock: "auto",
        }}
      >
        {children}
      </div>

      {/* ⚠ `h-fit` ON A PORTRAIT SCREEN, NOT A FULL --section-fill. Two marquee
          rows are ~2x300px however tall the viewport is, so on a tall narrow
          screen the wrapper reserved far more than the rows need and
          `justify-center` pooled the surplus under the heading — measured
          237px of dead band at 1024x1290.
          ⚠ THE GATE IS THE ASPECT RATIO, NOT `lg`. iPad Pro portrait is 1024
          WIDE and 1290 TALL, so a width breakpoint puts it on the desktop
          branch and it kept the full 237px gap while every phone was fixed.
          A landscape screen gets the tuned centred fill; a portrait one lets
          the rows set their own height. */}
      <div className="relative z-10 w-full flex flex-col justify-center gap-[clamp(24px,1rem+1.4vw,44px)] overflow-hidden py-[clamp(8px,2vh,32px)] [@media(min-aspect-ratio:1/1)]:min-h-[var(--section-fill)] [@media(min-aspect-ratio:1/1)]:py-0">
        <Row />
        <div className="hidden sm:block">
          <Row reverse />
        </div>
      </div>
    </Section>
  );
}

