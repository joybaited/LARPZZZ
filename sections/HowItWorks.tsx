"use client";

import Section from "@/components/Section";
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
    body: "Enter your license key and download the app.",
  },
  {
    id: "flex",
    text: "Flex to your heart’s content",
    body: "Customize your portfolio to your heart’s content.",
  },
];

export type HowItWorksSticker = Sticker;

export const HOW_IT_WORKS_STICKERS: HowItWorksSticker[] = [
  {
    name: "step-cash",
    src: "/images/step-cash.webp",
    alt: "",
    x: 29.6,
    y: 38.5,
    w: 13.3,
    rotate: "16deg",
    z: 25,
    cap: 148,
  },
  {
    name: "step-key",
    src: "/images/step-key.webp",
    alt: "",
    x: 28.4,
    y: 89.9,
    w: 12.8,
    rotate: "6deg",
    z: 25,
    cap: 148,
  },
  {
    name: "step-activate",
    src: "/images/step-activate.webp",
    alt: "",
    x: 97,
    y: 36,
    w: 8.1,
    rotate: "12deg",
    z: 25,
    cap: 148,
  },
  {
    name: "step-flex",
    src: "/images/step-flex.webp",
    alt: "",
    x: 95.5,
    y: 88.5,
    w: 9.6,
    rotate: "6deg",
    z: 25,
    cap: 148,
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
    <Section id="how-it-works" bleed heading="How it works" className="bg-[#d9a3f7] text-grape">
      {/* ⚠ THE SEAM INTO FEATURES. Eased smootherstep cross-fade to Features ground colour (#3d065f). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-1 z-0 h-[clamp(140px,22vh,300px)]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(61,6,95,0) 0%, rgba(61,6,95,0.015) 8%, rgba(61,6,95,0.06) 16%, rgba(61,6,95,0.14) 25%, rgba(61,6,95,0.25) 34%, rgba(61,6,95,0.38) 43%, rgba(61,6,95,0.54) 52%, rgba(61,6,95,0.70) 62%, rgba(61,6,95,0.83) 72%, rgba(61,6,95,0.92) 81%, rgba(61,6,95,0.97) 90%, rgba(61,6,95,0.995) 96%, #3d065f 100%)",
        }}
      />
      {/* ⚠ min-h-[var(--section-fill)] with lg:h-[var(--section-fill)] so desktop holds the exact measured ratio while mobile expands naturally without clipping. */}
      <div className="flex min-h-[var(--section-fill)] h-auto lg:h-[var(--section-fill)] items-center justify-center px-(--gutter)">
        <div
          ref={stageRef}
          className="relative w-full max-w-[min(120rem,max(1200px,calc(var(--section-fill)*1.82)))]"
        >
          <ul
            role="list"
            className="m-0 grid w-full list-none grid-cols-1 sm:grid-cols-2 gap-[clamp(12px,0.5rem+0.6vw,20px)] p-0 max-lg:h-auto lg:grid-cols-[1fr_1.066fr_1fr] lg:grid-rows-2"
          >
          {/* The centre column. It is the grid's middle track — the `1.066fr`
              in `grid-cols-[1fr_1.066fr_1fr]` that holds the two card columns
              apart — so the element has to exist even when it is empty, or
              the three-column arrangement collapses to two. It carries the
              hero's phone, static — the pixel transition moved to the hero.
              Hidden below lg: the stacked 2-up has no centre column. */}
          <li role="presentation" className="relative hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
            {/* the hero's phone, swapped in from the hero, which now carries the
                pixel transition. Static on purpose. object-contain fits it
                whole inside the centre column on both axes and centres it, so
                it can never push the grid or overflow it. */}
            <img
              src="/images/hero-phone.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-contain select-none"
            />
          </li>

          {cards.map((c, i) => (
            <li
              key={c.id}
              /* max-lg keeps a sleek proportional shape while stacked; at lg the row height
                 governs and the ratio is whatever the split gives. */
              className={`${PLACE[i]} relative isolate flex flex-col justify-between overflow-hidden rounded-[clamp(18px,min(2.778vw,5.5vh),48px)] bg-grape p-[clamp(18px,min(2.1vw,3.6vh),32px)] max-sm:p-5 text-violet max-sm:aspect-auto max-sm:min-h-[130px] sm:max-lg:aspect-auto sm:max-lg:min-h-[150px] lg:aspect-[381/265] shadow-sm [container-type:inline-size]`}
            >
              <div>
                <h3 className="font-display text-[clamp(18px,min(2.25vw,6.2vh),2.25rem)] leading-[1.08] uppercase text-balance">
                  {c.text}
                </h3>
                {/* ⚠ THE COPY RESERVES THE BADGE'S CORNER — the badge does not
                    dodge the copy. Measured: cards 2 and 3 sit at 68.3..100%
                    of the stage and their copy ran to 96%, i.e. nearly the
                    full card width, so a badge on the card's outer edge
                    (91.6..102.4%) HAD to cross it. No coordinate fixes that;
                    the text occupies the space. Worse, the collision came and
                    went with window width — clear at 1366 and 1280, 92x49 deep
                    at 1920 — because the copy wraps at a different line and
                    ends at a different x each time, which is why four rounds
                    of nudging the sticker could never converge.
                    A right margin of ~29% of the card's inline size keeps the
                    last line clear of the corner the badge occupies, at every
                    width, by construction. cqi not vw: it is a fraction of
                    the CARD, which is the box the badge is placed against. */}
                <p className="mt-[clamp(8px,min(1vw,1.8vh),1rem)] max-w-[34ch] text-[clamp(13px,min(1.3vw,3.3vh),1.1875rem)] leading-[1.38] opacity-85 [margin-inline-end:25cqi] lg:[margin-inline-end:29cqi]">
                  {c.body}
                </p>
              </div>

              {/* Mobile/Tablet sticker badge pinned to each card corner.
                  ⚠ SIZED IN cqi — A FRACTION OF THE CARD, NOT OF THE VIEWPORT.
                  It was `w-[clamp(64px,14vw,96px)]`: 14vw is a fraction of the
                  SCREEN, and the card is not a fixed fraction of the screen
                  (one column at 390, two at 640), so the badge covered a
                  different share of the card at every width and clipped the
                  body copy at 360. 22cqi is 22% of the card's own inline size
                  at every width, which is the thing it has to stay in
                  proportion to. */}
              {!hideStickers && stickers?.[i] && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 -right-1 z-10 block w-[clamp(56px,22cqi,92px)] select-none lg:hidden"
                  style={{ transform: `rotate(${stickers[i].rotate ?? "0deg"})` }}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={stickers[i].src}
                    alt=""
                    className="h-auto w-full object-contain select-none drop-shadow-md"
                  />
                </div>
              )}
            </li>
          ))}
          </ul>

          {/* Floating Stickers Layer — anchored to the cards stage, so x/y are
              the same percentages /sticker-tuner reads and writes. Hidden
              below lg: the stacked 2-up has no scatter field, and each card
              carries its own corner badge instead.

              ⚠ THE WIDTH IS CAPPED IN px, NOT LEFT AS A RAW STAGE %. `w` is a
              percentage of the stage, and the stage grows faster than the
              cards do: measured 212x184 on a 402x280 card at 1920 — a badge
              covering nearly half the card, crossing the body copy on all
              four. At 1366 and 1280 the same percentage cleared the text
              entirely, so the overlap appeared and vanished with window width
              and no single tuned number could fix it.
              min() keeps the tuned proportion as the stage scales but stops it
              at 148px, which measurement puts clear of the copy at every
              width from 1024 up. Tune the proportion in /sticker-tuner; the
              cap is the guard rail, not the design. */}
          {!hideStickers && stickers?.map((st) => (
            <div
              key={st.name}
              aria-hidden="true"
              className="pointer-events-none absolute hidden lg:block"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: `min(${st.w}%, 148px)`,
                zIndex: st.z ?? 20,
                transform: `translate(-50%, -50%) rotate(${st.rotate ?? "0deg"})`,
              }}
            >
              <img
                loading="lazy"
                decoding="async"
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
