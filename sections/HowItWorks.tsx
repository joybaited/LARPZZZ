"use client";

import Section from "@/components/Section";
import PixelatedImageReveal from "@/components/PixelatedImageReveal";
import { type Sticker } from "@/components/Stickers";

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

export type HowItWorksSticker = Sticker;

export const HOW_IT_WORKS_STICKERS: HowItWorksSticker[] = [
  {
    name: "step-cash",
    src: "/images/step-cash.webp",
    alt: "",
    x: 28.0,
    y: 38.3,
    w: 14.2,
    rotate: "16deg",
    z: 25,
  },
  {
    name: "step-key",
    src: "/images/step-key.webp",
    alt: "",
    x: 26.4,
    y: 88.9,
    w: 12.8,
    rotate: "6deg",
    z: 25,
  },
  {
    name: "step-activate",
    src: "/images/step-activate.webp",
    alt: "",
    x: 94.7,
    y: 36.8,
    w: 8.1,
    rotate: "12deg",
    z: 25,
  },
  {
    name: "step-flex",
    src: "/images/step-flex.webp",
    alt: "",
    x: 92.7,
    y: 89.6,
    w: 9.6,
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
  children,
  stageRef,
  tuning,
}: {
  cards?: HowItWorksCard[];
  stickers?: HowItWorksSticker[];
  hideStickers?: boolean;
  children?: React.ReactNode;
  stageRef?: React.Ref<HTMLDivElement>;
  tuning?: boolean;
} = {}) {
  return (
    <Section id="how-it-works" bleed heading="How it works" className="text-grape">
      {/* ⚠ min-h-[var(--section-fill)] with lg:h-[var(--section-fill)] so desktop holds the exact measured ratio while mobile expands naturally without clipping. */}
      <div className="flex min-h-[var(--section-fill)] h-auto lg:h-[var(--section-fill)] items-center justify-center px-(--gutter)">
        <div ref={stageRef} className="relative w-full max-w-[min(1850px,calc(var(--section-fill)*1.82))]">
          <ul
            role="list"
            className="m-0 grid w-full list-none grid-cols-1 sm:grid-cols-2 gap-[clamp(12px,0.5rem+0.6vw,20px)] p-0 max-lg:h-auto lg:grid-cols-[1fr_1.066fr_1fr] lg:grid-rows-2"
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
              /* max-lg keeps a sleek proportional shape while stacked; at lg the row height
                 governs and the ratio is whatever the split gives. */
              className={`${PLACE[i]} relative isolate flex flex-col overflow-hidden rounded-[clamp(18px,5vw,28px)] lg:rounded-[clamp(20px,2.778vw,56px)] bg-grape p-5 lg:p-[clamp(18px,2.1vw,32px)] text-violet max-sm:aspect-auto max-sm:min-h-[130px] sm:max-lg:aspect-auto sm:max-lg:min-h-[150px] lg:aspect-[381/265] [container-type:inline-size]`}
            >
              <div>
                <h3 className="font-display text-[clamp(18px,5vw,24px)] lg:text-[clamp(19px,2.25vw,40px)] leading-[1.08] lg:leading-[1.05] uppercase text-balance">
                  {c.text}
                </h3>
                <p className="mt-[clamp(8px,1vw,18px)] max-w-[38ch] text-[clamp(13px,3.5vw,16px)] lg:text-[clamp(13px,1.3vw,23px)] leading-[1.38] lg:leading-[1.35] opacity-80 pe-[75px] sm:pe-[85px] lg:pe-0">
                  {c.body}
                </p>
              </div>

              {/* Mobile/Tablet sticker badge pinned to each card corner */}
              {!hideStickers && stickers?.[i] && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 -right-1 z-10 block w-[clamp(68px,22cqi,92px)] select-none lg:hidden"
                  style={{ transform: `rotate(${stickers[i].rotate ?? "0deg"})` }}
                >
                  <img
                    src={stickers[i].src}
                    alt=""
                    className="h-auto w-full object-contain select-none drop-shadow-md"
                  />
                </div>
              )}
            </li>
          ))}
          </ul>

          {/* Floating Stickers Layer — locked directly to the cards stage container on desktop; hidden below lg where mobile badges take over */}
          {!hideStickers && stickers?.map((st) => (
            <div
              key={st.name}
              aria-hidden="true"
              className="pointer-events-none absolute hidden lg:block"
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

          {children}
        </div>
      </div>
    </Section>
  );
}
