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
const CARDS: {
  id: string; text: string; body: string;
  /* `h%` is an optional override for the shared height dial below — the
     portrait sticker needs it, the other three sit on the default. */
  art?: { src: string; w: number; h: number; alt: string;
          "h%"?: string; rot?: number; down?: string };
}[] = [
  {
    id: "purchase",
    text: "Purchase a License",
    body: 'Grab Larpz Wallet in the "Buy" page. Choose the plan that works for you, no hidden fees.',
    /* ⚠ TRIMMED AND CONVERTED, NOT DROPPED IN AS EXPORTED. The source was a
       736x736 png at 353KB with the artwork floating in transparent padding —
       the same trap as the hero's flat render, where uncropped padding scales
       with the image and no width can centre it. `sharp().trim()` cut it to
       the art (560x432), webp took it to 26.6KB. */
    art: { src: "/images/step-cash.webp", w: 560, h: 432, alt: "", "h%": "150%" },
  },
  {
    id: "key",
    text: "Receive your Key",
    body: "After payment, you'll receive a unique license key via Telegram or email. Keep it safe.",
    art: { src: "/images/step-key.webp", w: 512, h: 390, alt: "", "h%": "148%", down: "6px" },
  },
  {
    id: "activate",
    text: "Activate your Wallet",
    body: "Enter your license key, and download the app",
    /* ⚠ PORTRAIT, UNLIKE THE OTHER THREE (584x1002, ratio 0.58). The shared
       `height: 128%` dial sizes on HEIGHT, so a tall sticker ends up NARROW:
       this renders 166px wide against 292-357 for the others. If it wants to
       match them visually it needs its own dial, not the shared one. */
    art: { src: "/images/step-activate.webp", w: 584, h: 1002, alt: "",
           "h%": "126%", rot: 12, down: "8px" },
  },
  {
    id: "flex",
    text: "Flex to your hearts content",
    body: "Customize Your Portfolio to your hearts content.",
    /* ⚠ THE SOURCE IS 167x155 — the smallest of the four by far. Trimmed to
       113x124, so it is being scaled UP to fill the card and will soften.
       A larger source is the only fix. */
    art: { src: "/images/step-flex.webp", w: 113, h: 124, alt: "", "h%": "138%" },
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

export default function HowItWorks() {
  return (
    <Section id="how-it-works" heading="How it works" className="bg-[#f3ddff] text-grape">
      {/* ⚠ `h-[100svh]`, NOT `min-h-`. The grid below sizes its rows off this
          box, and a min-height gives a percentage row nothing to resolve
          against — the rows collapse to content and the ~90% is ignored.
          A fixed height is what makes the column fill the screen. */}
      <div className="flex h-[var(--section-fill)] items-center justify-center">
        <ul
          role="list"
          /* ⚠ THE ROW IS 90% OF THE VIEWPORT AND THE TWO CARD ROWS SPLIT IT.
             `grid-rows-2` on a 90%-of-the-box row gives each card ~45% minus
             half the gap, which is MetaMask's model: height fixed, ratio falls
             out. ⚠ IT IS THE BOX, NOT 90svh. Against the viewport it ignored
             the heading space above it and the bottom row hung 16px out of
             the section. And it is `h-full` rather than the old `90%`: the
             box is ALREADY one viewport minus the heading space, so taking
             90% of it cut the cards twice — they measured 342px against 397
             before, which shrank every sticker with them, since a sticker is
             a percentage of the room its card leaves.
             Below lg the height is released (`h-auto`) and the cards go back
             to a natural 2-up, or four 45svh cards stacked is four screens. */
          className="m-0 grid w-full list-none grid-cols-2 gap-[clamp(12px,0.5rem+0.6vw,16px)] p-0 max-lg:h-auto lg:h-full lg:grid-cols-[1fr_1.066fr_1fr] lg:grid-rows-2"
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
              /* ⚠ 22 A SIDE, NOT THE ORIGINAL'S 7. At 7 the squares are huge
                 and it reads as tiles sliding about; dense enough and the
                 same mechanism reads as the image pixelating. 484 divs is
                 still nothing to animate — they only toggle `display`. */
              /* ⚠ 34, NOT 22. The cell is ~408px wide, so 22 across is an
                 18px square — big enough that a 3-row band of them touching
                 reads as a solid bar rather than as pixels. 34 is ~12px,
                 and 1156 divs is still only a display toggle each. */
              grid={34}
              /* a thin band of pixels climbing from the bottom, carrying the
                 next mockup up with it. */
              pattern="wave"
              waveRows={4}
              /* scatters each cell off its row so the band's edges are
                 ragged squares, not two straight lines. */
              jitterRows={1.4}
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
              /* the pixels are `currentColor`: the site's grape. */
              className="size-full !rounded-none text-grape"
              fit="contain"
              square={false}
            />
          </li>

          {CARDS.map((c, i) => (
            <li
              key={c.id}
              /* max-lg keeps a sane shape while stacked; at lg the row height
                 governs and the ratio is whatever the split gives. */
              className={`${PLACE[i]} flex flex-col overflow-hidden rounded-[clamp(20px,2.778vw,56px)] bg-grape p-[clamp(18px,2.1vw,32px)] text-violet max-lg:aspect-[347/378]`}
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
              {/* the art, where a card has it. `mt-auto` pushes it to the
                  bottom of the card, which is where MetaMask's renders sit,
                  and `min-h-0` lets it shrink rather than forcing the card
                  taller on a shallow window. Decorative, so alt="". */}
              {c.art && (
                /* ⚠ `flex-1 min-h-0`, NOT A PERCENTAGE MAX-HEIGHT. A
                   `max-h-[42%]` on a flex child resolved against nothing and
                   collapsed the art to 103x79. Giving the wrapper the leftover
                   column space with flex-1 and letting the image fill it is
                   what actually sizes it, and min-h-0 lets it shrink on a
                   shallow card instead of pushing the card taller.

                   ⚠ NO min-height FLOOR HERE. One was tried (38%) to stop the
                   sticker collapsing on a short window and it made things
                   worse everywhere else — clips went 5 to 8 and mobile began
                   clipping for the first time. The wrapper shrinking IS how
                   the card stays inside itself; the image's own cap is where
                   the bound belongs. */
                <div className="mt-auto flex min-h-0 flex-1 items-end justify-end pt-[clamp(8px,1vw,16px)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.art.src}
                    alt={c.art.alt}
                    width={c.art.w}
                    height={c.art.h}
                    /* ⚠ HEIGHT IS THE BINDING CONSTRAINT, NOT WIDTH, and the
                       rotation is inline on purpose. Raising max-w from 72% to
                       100% changed nothing: the art hit `max-h-full` (204px of
                       wrapper) long before the width cap, so the size dial is
                       the height, not the width. And `rotate-[6deg]` as a class
                       never generated a rule — it is the only arbitrary rotate
                       in the project and computed to `transform: none`. Inline
                       style sidesteps the JIT scan entirely. */
                    /* ⚠ max-h CAPS THE OVERSIZE. `height: 128%` is bigger
                       than the wrapper by design, and below lg the grid is
                       h-auto so there is no fixed row to stop it — the
                       sticker hung 10px out of the section at 768. The cap
                       lets it overflow its wrapper (which is the look) but
                       never its card. */
                    /* ⚠ max-w-full, NOT max-w-none. The last clips were the
                       WIDTH overflowing on the narrower cards at 1024 and
                       768, not the height — the height cap alone left three.
                       The wrapper is already inset from the card, so bounding
                       the width to it keeps the sticker inside at every size
                       without touching the oversize dial. */
                    className="w-auto max-w-full object-contain"
                    style={{
                      height: c.art["h%"] ?? "128%",
                      /* translate, NOT margin — a transform cannot push the
                         flex line, so a nudge can never change the card's
                         height or shift the copy above it. */
                      transform: `translateY(${c.art.down ?? "0px"}) rotate(${c.art.rot ?? 6}deg)`,
                      /* ⚠ THE CAP IS A VIEWPORT HEIGHT, NOT A PERCENTAGE OF
                         THE WRAPPER. `maxHeight: 100%` was tried and it
                         clamped the image straight back to the wrapper, so
                         `height: 165%` computed to 148px and the per-card
                         dials did nothing at all.
                         The dial has to be able to exceed its wrapper — that
                         oversize IS the effect — but percentage-of-wrapper
                         alone is fragile at the extremes: it collapsed to
                         101px on a 1440x700 window and overflowed the card by
                         19px at 768. A vh ceiling is independent of the
                         wrapper, so it bounds the overflow without touching
                         the dial in the normal range. */
                      maxHeight: `min(${c.art["h%"] ?? "128%"}, 30vh)`,
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
