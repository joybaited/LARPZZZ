"use client";

import Section from "@/components/Section";
import PixelatedImageReveal from "@/components/PixelatedImageReveal";

/* How it works. Four cards in two flanking columns with an empty middle.
 *
 * ⚠ THE MIDDLE COLUMN IS EMPTY ON PURPOSE. MetaMask stands a phone mockup
 * there and the four cards frame it. Kez's call: keep the arrangement, drop
 * the phone — so the centre is a held gap, not a missing element. It is a
 * real grid column rather than a margin, because the cards' widths come from
 * the three-column split; collapse it and they stretch.
 *
 * ⚠ THE CARD HAS NO FIXED ASPECT RATIO, AND ASSUMING ONE IS WHAT BROKE THE
 * FIRST BUILD. Measured off metamask.io at five viewports:
 *
 *   1522x738   card 367x308   ratio 1.193   column 90.5% of viewport height
 *   1440x900   card 347x378   ratio 0.918   column 89.6%
 *   1440x700   card 347x292   ratio 1.188   column 90.6%
 *   1280x800   card 308x336   ratio 0.916   column 89.6%
 *   1920x1080  card 464x463   ratio 1.003   column 91.8%
 *
 * The ratio swings from 0.92 to 1.19 while the COLUMN HOLDS ~90% OF THE
 * VIEWPORT HEIGHT at every one. So the height is the fixed thing: the column
 * fills ~90svh, the two cards split it, and the card's ratio is whatever
 * falls out. Reading the ratio off a single 900px-tall window and pinning
 * `aspect-[347/378]` to it gave 383x417 cards — two of them plus a gap is
 * 850px, which overflows any normal viewport. That is the bug in Kez's
 * screenshot: on their page the whole thing fits one screen.
 *
 * ⚠ THE ONE RATIO THAT IS CONSTANT IS THE CENTRE GAP: 1.15 of a card's width,
 * at all five viewports. `fr` splits what is left AFTER the gaps, so declaring
 * `1.15fr` measures 1.234 — the two gaps land inside the span. `1.066fr` is
 * the value that MEASURES 1.150. Tried and rejected: bare percentages (gaps
 * are added on top and the row overflows) and `calc()` against a `--g` custom
 * property (the arbitrary value does not resolve, the three-column rule is
 * dropped entirely, and the cards fall back to the 2-col track at 620px).
 *
 * NO PER-CARD COLOURS. MetaMask gives each card its own background out of a
 * six-colour palette. Kez's call: the house pair only, same as Faq,
 * Testimonials and Pricing — grape card, violet text. Their palette happens
 * to contain our exact pair (#3D065F / #EAC2FF is one of their six), so this
 * is the same design in one of its colourways rather than a flattening.
 *
 * THE LIST IS NOT THE LAYOUT. A <ul> of <li>: four of the same kind of thing
 * is a list, so a screen reader meets "list, 4 items" rather than four
 * anonymous boxes. Same reasoning as Pricing's row.
 */

/* the four steps. Kez's copy.
 *
 * ⚠ THE BODY SIZE IS NOT COPIED FROM METAMASK, BECAUSE THEIRS HAVE NO BODY.
 * Checked every bento card on their page: each is a 24px heading and an
 * image, and `querySelectorAll('p')` returns nothing in all of them. So there
 * was no "same body sizing as the metamask one" to read off. It is derived
 * instead: 0.58 of the heading, which is the ratio Testimonials already uses
 * between its quote and its footer, and the same clamp shape so the two
 * scale together. */
export type HowItWorksCard = {
  id: string;
  text: string;
  body: string;
};

export const HOW_IT_WORKS_CARDS: HowItWorksCard[] = [
  {
    id: "purchase",
    text: "Purchase a License",
    body: 'Grab Larpz Wallet in the "Buy" page. Choose the plan that works for you, no hidden fees.',
  },
  {
    id: "key",
    text: "Receive your Key",
    body: "After payment, you'll receive a unique license key via Telegram or email. Keep it safe.",
  },
  {
    id: "activate",
    text: "Activate your Wallet",
    body: "Enter your license key, and download the app",
  },
  {
    id: "flex",
    text: "Flex to your hearts content",
    body: "Customize Your Portfolio to your hearts content.",
  },
];

export type HowItWorksSticker = {
  name: string;
  src: string;
  alt?: string;
  x: number;
  y: number;
  w: number;
  rotate?: string;
  z?: number;
};

export const HOW_IT_WORKS_STICKERS: HowItWorksSticker[] = [
  {
    name: "step-cash",
    src: "/images/step-cash.webp",
    alt: "",
    x: 32.1,
    y: 47.1,
    w: 11.5,
    rotate: "16deg",
    z: 25,
  },
  {
    name: "step-key",
    src: "/images/step-key.webp",
    alt: "",
    x: 30.8,
    y: 76.9,
    w: 10.4,
    rotate: "6deg",
    z: 25,
  },
  {
    name: "step-activate",
    src: "/images/step-activate.webp",
    alt: "",
    x: 86.3,
    y: 46.2,
    w: 6.6,
    rotate: "12deg",
    z: 25,
  },
  {
    name: "step-flex",
    src: "/images/step-flex.webp",
    alt: "",
    x: 84.7,
    y: 77.3,
    w: 7.8,
    rotate: "6deg",
    z: 25,
  },
];

/* ⚠ ONE FLAT GRID, NOT COLUMNS OF COLUMNS. The first build wrapped each
   column in an <li> holding its own <ul>, with `display: contents` to un-nest
   them below lg. It measured 0x0 cards and a 0.45 ratio: a `contents` box has
   no box, so there was nothing for a height to resolve against. Four cards
   placed by column on one grid needs no nesting and no `contents`. Same
   warning as the hero's glide wrapper — see HANDOVER.md.

   Placement is explicit so DOM order (1,2,3,4) stays reading order while
   cards 3 and 4 sit in the right column. Below lg it is dropped and they flow
   as a plain 2-up. */
const PLACE = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2",
];

export default function HowItWorks({
  cards = HOW_IT_WORKS_CARDS,
  stickers = HOW_IT_WORKS_STICKERS,
  hideStickers = false,
}: {
  cards?: HowItWorksCard[];
  stickers?: HowItWorksSticker[];
  hideStickers?: boolean;
} = {}) {
  return (
    <Section id="how-it-works" bleed heading="How it works" className="bg-[#f3ddff] text-grape">
      {/* ⚠ min-h-[var(--section-fill)] with lg:h-[var(--section-fill)] so desktop holds the exact measured ratio while mobile expands naturally without clipping. */}
      <div className="flex min-h-[var(--section-fill)] h-auto lg:h-[var(--section-fill)] items-center justify-center px-(--gutter)">
        <ul
          role="list"
          className="m-0 grid w-full max-w-[1560px] list-none grid-cols-1 sm:grid-cols-2 gap-[clamp(12px,0.5rem+0.6vw,20px)] p-0 max-lg:h-auto lg:grid-cols-[1fr_1.066fr_1fr] lg:grid-rows-2"
        >
          {/* The centre column. It is the grid's middle track — the `1.066fr`
              in `grid-cols-[1fr_1.066fr_1fr]` that holds the two card columns
              apart — so the element has to exist even when it is empty, or
              the three-column arrangement collapses to two. It carries the
              two phone mockups and the pixel transition between them, where
              the 3D model used to be.
              Hidden below lg: the stacked 2-up has no centre column. */}
          <li role="presentation" className="relative hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
            <PixelatedImageReveal
              /* six phone mockups, cycled in order and wrapping back to the
                 first. All six are the same 521x1055 trim, so they share one
                 silhouette and one mask. */
              images={[
                { src: "/images/steps-phone-a.webp", alt: "" },
                { src: "/images/steps-phone-b.webp", alt: "" },
                { src: "/images/steps-phone-c.webp", alt: "" },
                { src: "/images/steps-phone-d.webp", alt: "" },
                { src: "/images/steps-phone-e.webp", alt: "" },
                { src: "/images/steps-phone-f.webp", alt: "" },
              ]}
              /* Grid of 26 gives crisp, well-defined ~14-16px pixel blocks */
              grid={26}
              /* A defined band of pixels climbing from the bottom, carrying the next mockup up with it */
              pattern="wave"
              waveRows={3}
              /* Scatters cells off their row for defined, ragged pixel steps */
              jitterRows={1.1}
              /* Tiny 1.5px gap so pixel boxes are cleanly separated as floating square tiles */
              gap={1.5}
              /* Soft pink glow on each pixel */
              glow="0 0 5px rgba(234, 194, 255, 0.8), 0 0 12px rgba(234, 194, 255, 0.35)"
              /* snappy: each half is 0.22s, so the whole swap is under half a
                 second. The original's 0.3 felt slow at this density because
                 the stagger is spread across far more cells. */
              /* ⚠ THIS IS THE CLIMB, NOT A HALF-DISSOLVE. For `wave` it is
                 the time the band takes to cross all 22 rows, so 0.3 was
                 ~13ms a row — about one frame each, far too fast to read as
                 a wave. 1.1s is ~50ms a row, which is a band you can watch
                 travel. */
              stepDuration={1.1}
              /* plays itself when the section scrolls in — there is nothing
                 to hover in the middle of a card grid. */
              auto
              /* swaps every 2.8s while the section is on screen */
              loopEvery={2800}
              /* the squares stop at the phone's own edge — the grid is masked
                 with the artwork, so nothing paints on the transparent
                 corners. */
              maskToArt
              /* the pixels take the site's signature pink/violet (#eac2ff) */
              className="size-full !rounded-none text-violet"
              fit="contain"
              square={false}
            />
          </li>

          {cards.map((c, i) => (
            <li
              key={c.id}
              /* max-lg keeps a sane shape while stacked; at lg the row height
                 governs and the ratio is whatever the split gives. */
              className={`${PLACE[i]} flex flex-col overflow-hidden rounded-[clamp(20px,2.778vw,56px)] bg-grape p-[clamp(18px,2.1vw,32px)] text-violet max-sm:aspect-auto max-sm:min-h-[220px] sm:max-lg:aspect-[347/378] lg:aspect-[381/265]`}
            >
              {/* ⚠ THEIR TYPE AND RADIUS ARE PURE VIEWPORT FUNCTIONS, NO
                  CONSTANT. Fitted across four widths: font = w/60 (1.667vw,
                  21.3px at 1280 -> 32px at 1920) and radius = w/36 (2.778vw,
                  35.6 -> 53.3), both landing within 0.1px at every sample. So
                  they are written as the vw they actually are, clamped top and
                  bottom so neither collapses on a phone or runs away on a
                  display. leading-[1.05] is their 24/24 with room for
                  descenders, which a flat 1 clips on a 'g'. */}
              {/* ⚠ MEGION IS ONE WEIGHT (BOLD) AND DISPLAY-ONLY, so there is
                  no font-weight to set — `font-display` is already the bold
                  cut, and asking for a lighter one makes the browser
                  synthesise it. The `font-normal` that was here came off with
                  the face. `uppercase` is how every other section sets it:
                  Faq's heading, Testimonials' names, the hero's. */}
              {/* ⚠ ENLARGED PAST METAMASK'S OWN 24px AT KEZ'S ASK — 2.25vw is
                  32px at 1440 where theirs is 24. The clamp ceiling is what
                  keeps it inside the card: the heading is the taller of the
                  two blocks and a bare vw would outgrow a short card on a
                  wide, shallow window (1522x738 is the worst case checked). */}
              <h3 className="font-display text-[clamp(19px,2.25vw,40px)] leading-[1.05] uppercase text-balance">
                {c.text}
              </h3>
              {/* the body. Neue Montreal, not Megion — Megion is display-only
                  and a paragraph of it at this size is unreadable. Held at
                  0.58 of the heading (1.3vw against 2.25vw) so the two scale
                  together rather than drifting apart as separate numbers.
                  `max-w-[38ch]` keeps the measure readable on a wide card. */}
              <p className="mt-[clamp(8px,1vw,18px)] max-w-[38ch] text-[clamp(13px,1.3vw,23px)] leading-[1.35] opacity-80">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Stickers Layer */}
      {!hideStickers && stickers?.map((st) => (
        <div
          key={st.name}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.w}%`,
            zIndex: st.z ?? 20,
            transform: `translate(-50%, -50%) rotate(${st.rotate ?? "0deg"})`,
          }}
        >
          <img
            src={st.src}
            alt={st.alt ?? ""}
            className="block h-auto w-full max-w-none select-none drop-shadow-xl"
          />
        </div>
      ))}
    </Section>
  );
}
