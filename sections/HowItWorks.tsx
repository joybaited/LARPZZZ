import Section from "@/components/Section";

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

/* the four cards. `text` is the whole heading — their cards are a heading and
 * an image, and the images are product renders we do not have, so the card is
 * the heading alone. Art drops into the lower part when it exists, which is
 * why the heading is pinned to the top rather than centred. */
const CARDS = [
  { id: "earn", text: "Earn up to 4% with the Money Account" },
  { id: "send", text: "Send and receive money globally, instantly" },
  { id: "spend", text: "Spend anywhere with your card, get up to 3% back" },
  { id: "connect", text: "One account that connects to everything" },
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
    <Section id="how-it-works" className="bg-violet text-grape">
      {/* ⚠ `h-[100svh]`, NOT `min-h-`. The grid below sizes its rows off this
          box, and a min-height gives a percentage row nothing to resolve
          against — the rows collapse to content and the ~90% is ignored.
          A fixed height is what makes the column fill the screen. */}
      <div className="flex h-[100svh] items-center justify-center">
        <ul
          role="list"
          /* ⚠ THE ROW IS 90% OF THE VIEWPORT AND THE TWO CARD ROWS SPLIT IT.
             `grid-rows-2` on a 90svh box gives each card ~45svh minus half the
             gap, which is MetaMask's model: height fixed, ratio falls out.
             Below lg the height is released (`h-auto`) and the cards go back
             to a natural 2-up, or four 45svh cards stacked is four screens. */
          className="m-0 grid w-full list-none grid-cols-2 gap-[clamp(12px,0.5rem+0.6vw,16px)] p-0 max-lg:h-auto lg:h-[90svh] lg:grid-cols-[1fr_1.066fr_1fr] lg:grid-rows-2"
        >
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
              <h3 className="font-display text-[clamp(16px,1.667vw,32px)] leading-[1.05] uppercase text-balance">
                {c.text}
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
