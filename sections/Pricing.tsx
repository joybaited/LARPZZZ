import Section from "@/components/Section";
import PriceEl from "@/components/PriceEl";

/* Pricing. Three cards in a centred row, carried over from LZ-2's section 04.
 *
 * DELIBERATELY EMPTY CARDS. They are empty in LZ-2 too — the intent is
 * pricing, the content was never written, and nothing is invented here. No
 * headings, no prices, no placeholder copy. The structure is built to hold
 * content so that when it arrives it drops in rather than being positioned
 * into a shape.
 *
 * NO FIGURES. LZ-2 stands a squiggle at each end of the row, rotated a
 * quarter turn and overlapping the cards. Carried over, measured, looked at,
 * and dropped at Kez's call: a 900px box rotated 90deg is 900px WIDE, so each
 * one spans most of the row and reads as a pink sliver between opaque cards
 * rather than as a shape. The cards carry the section on their own.
 *
 * THE LIST IS NOT THE LAYOUT. A <ul> of <li>, each holding an <article>:
 * three of the same kind of thing is a list, and a pricing tier makes sense
 * on its own. A screen reader meets "list, 3 items" instead of three
 * anonymous boxes.
 *
 * ⚠ FLEX, NOT LZ-2'S ABSOLUTE POSITIONING. LZ-2 derives each card's `left`
 * from the row's inset plus N x (width + gutter), which is correct arithmetic
 * that runs off BOTH edges below ~1200px — its own open item 14. The cards
 * are identical and evenly spaced, which is what flex does natively, so the
 * no-overlap guarantee comes from the layout instead of from maths.
 */

/* the card. LZ-2: 360x640, 20px radius, 3px border, 60px gutter.
 *
 * ⚠ FILL AND BORDER ARE BOTH GRAPE AND ARE KEPT SEPARATE ANYWAY. The 3px edge
 * cannot be seen against its own fill, but dropping the border would silently
 * take 3px off each side of the 360x640 (box-sizing is border-box) and throw
 * away the ability to give the fill a lighter edge later. LZ-2 held this
 * through every size change; it is held here for the same reason.
 *
 * ⚠ THE ROW SCALES, WHERE LZ-2'S DOES NOT. Three 360px cards and two 60px
 * gutters is 1200px — its natural size, capped by max-w and inside
 * --content-max (1280). Below that the cards are `flex-1 min-w-0` and the
 * gutter clamps, so the row fits the width it is given instead of running off
 * both edges. That is LZ-2's open item 14, and it is the one deliberate
 * behaviour change in this port.
 *
 * `min-w-0` is load-bearing: a flex item's default `min-width: auto` refuses
 * to shrink below its content, which is what silently keeps a row overflowing
 * when `flex-1` looks like it should have handled it.
 *
 * ⚠ BELOW `sm` THE ROW BECOMES A COLUMN. Three cards side by side at 390 is
 * three 101px slivers 640px tall. They stack instead, at a height that is not
 * the desktop 640 — see the note on the <li>.
 */
/* ⚠ ARRANGED IN /pricing-tuner, PASTED BACK. Do not hand-edit — open the
 * tuner, move things, copy the config.
 *
 * ⚠ FEATURE ROWS CARRY `w: 88` AND SIT AT x: 50. Kez's tuner config had them
 * at x: 54.4 with no width — auto-width text, so a 20.5px line is ~310px and
 * overflows a 214px card at 768. A width makes it wrap instead of spill, and
 * x: 50 is the centre the off-by-4.4 was approximating.
 *
 * Three INDEPENDENT cards. Nothing is shared: each owns its own element list,
 * so card 2 can be laid out differently from card 1.
 *
 * ⚠ x/y/w/h ARE PERCENTAGES OF THE CARD, NOT OF THE SECTION. The row is
 * `flex-1` and reflows below 1200px, so a section-relative percentage would
 * slide off the card at every other width. Card-relative holds at any size.
 *
 * x/y are the element's CENTRE, so resizing or retyping keeps it on its mark.
 *
 * `kind` is the shape, not the meaning. `show: false` hides without deleting.
 */
export type PriceEl = {
  name: string;
  kind: "text" | "box" | "line" | "ellipse";
  /* optional: the tuner omits it when empty, and a box or line often has
     no label at all. */
  text?: string;
  /* centre, % of card */
  x: number;
  y: number;
  /* box/line/ellipse only, % of card. text hugs its content. */
  w?: number;
  h?: number;
  /* px */
  size?: number;
  radius?: number;
  /* 0-100 */
  opacity?: number;
  rotate?: number;
  weight?: number;
  align?: "left" | "center" | "right";
  fill?: string;
  color?: string;
  border?: number;
  borderColor?: string;
  italic?: boolean;
  strike?: boolean;
  caps?: boolean;
  tracking?: number;
  /* the face. omitted = the body font (Neue Montreal), which is what every
     existing element already renders as, so adding this changes nothing that
     is already laid out. "display" is Megion. */
  font?: "display" | "sans";
  show?: boolean;
  /* a box that is a BUTTON: takes metamask.io's hover (the fill scales up
     behind the label while the label rolls over). A box without it is just a
     shape, so existing tuned elements are unaffected. */
  btn?: boolean;
  /* HERO ONLY. `in: "nav"` means x/y are percentages OF THE NAV BAR, not of
     the section — the nav is the nearest positioned ancestor, so <PriceEl>
     resolves against it with no change to the renderer. `in: "menu"` is the
     same thing for the nav's dropdown panel. Unused by Pricing; it lives
     here because this is where the shared element type lives. */
  in?: "nav" | "menu";
};

/* `fill` is the card's own background. NONE OF THE THREE SETS ONE NOW —
 * Kez's call, all three cards read identically. The reference inverted the
 * middle tier to pull the eye; that emphasis is gone deliberately, not
 * missed. Omitted means the card's class fill, which is grape.
 *
 * ⚠ THE SECTION IS THE HOUSE VIOLET PAIR, NOT ITS OWN MONOCHROME. It was
 * `bg-haze` with ink cards and white text — the only section still on black
 * and white, which is why it read as a different site. It is now `violet`
 * ground / `grape` cards, the same pair Faq and Testimonials use, so the
 * three violet sections match. The CTA pill inverts within the card: violet
 * fill, grape label.
 *
 * ⚠ COLOURS ARE TOKENS, NOT HEX. `var(--color-violet)` / `--color-grape`,
 * added to globals.css this session. Faq and Testimonials still hold the raw
 * hex and should be converted when either is next touched — until then the
 * same two colours are written two ways in the codebase. */
export const CARDS: { name: string; els: PriceEl[]; fill?: string }[] = [
  {
    name: "Card 1",
    els: [
      { name: "text 1", kind: "text", text: "Starter", x: 50, y: 7.6, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$14", x: 50, y: 16.8, w: 86, size: 62, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "7 days", x: 50, y: 23.5, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60, show: false },
      { name: "box 5", kind: "box", text: "Get Started", btn: true, x: 50, y: 33.1, w: 86, h: 8.8, size: 18, radius: 999, weight: 500, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "iOS & Android access", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Access to core AI tools", x: 50, y: 60.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Up to 3 active projects", x: 50, y: 73.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Community support", x: 50, y: 85.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
  {
    name: "Card 2",
    els: [
      { name: "text 1", kind: "text", text: "Monthly", x: 50, y: 9.0, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$44", x: 50, y: 16.8, w: 86, size: 62, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "/month", x: 50, y: 23.6, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60 },
      { name: "box 5", kind: "box", text: "Try It Free", btn: true, x: 50, y: 33.5, w: 86, h: 8.8, size: 18, radius: 999, weight: 500, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "Everything in Starter", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Unlimited active projects", x: 50, y: 57.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Advanced AI tools", x: 50, y: 67.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Priority email support", x: 50, y: 76.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 11", kind: "text", text: "Custom export presets", x: 50, y: 86.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
  {
    name: "Card 3",
    els: [
      { name: "text 1", kind: "text", text: "Lifetime", x: 50, y: 7.6, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$149", x: 50, y: 15.7, w: 86, size: 62, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "once", x: 50, y: 22.2, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60 },
      { name: "box 5", kind: "box", text: "Buy Lifetime", btn: true, x: 50, y: 33.2, w: 86, h: 8.8, size: 18, radius: 999, weight: 500, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "Everything in Monthly", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Lifetime updates", x: 50, y: 56.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Early access to tools", x: 50, y: 64.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Founder badge", x: 50, y: 72.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 11", kind: "text", text: "Direct line to the team", x: 50, y: 80.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 12", kind: "text", text: "No subscription, ever", x: 50, y: 88.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
];

export const PRICING_STICKERS = [
  {
    id: "sticker-1792129446612",
    name: "screenshot-2026-10-15-131401",
    src: "/images/sticker-screenshot-2026-10-15-131401.png",
    x: 90.1,
    y: 20.6,
    w: 12.6,
    rotate: -14,
    z: 25,
  },
  {
    id: "sticker-1792129480539",
    name: "screenshot-2026-10-15-131411",
    src: "/images/sticker-screenshot-2026-10-15-131411.png",
    x: 9.2,
    y: 20.2,
    w: 9.2,
    rotate: -27,
    z: 25,
  },
  {
    id: "sticker-1792129500616",
    name: "screenshot-2026-10-15-131354",
    src: "/images/sticker-screenshot-2026-10-15-131354.png",
    x: 61.1,
    y: 22.1,
    w: 11,
    rotate: 23,
    z: 25,
  },
];

export default function Pricing({ hideStickers = false }: { hideStickers?: boolean } = {}) {
  return (
    <Section id="pricing" heading="Pricing" className="bg-[#e3b7fa] text-grape">
      <div className="flex min-h-[var(--section-fill)] items-center justify-center py-8 lg:items-end lg:py-0">
        <ul
          role="list"
          className="m-0 flex w-full max-w-[1200px] list-none flex-col items-center gap-6 p-0 lg:flex-row lg:items-stretch lg:justify-center lg:gap-[clamp(24px,4.2vw,60px)]"
        >
          {CARDS.map((card) => (
            <li
              key={card.name}
              /* 640 is the desktop card. Stacked, that is three full screens
                 of empty black, so the height is only asserted once the row
                 is a row. */
              style={card.fill ? { background: card.fill } : undefined}
              className="w-full max-w-[380px] min-w-0 flex-1 rounded-[20px] border-[3px] border-grape bg-grape aspect-[360/500] sm:aspect-[360/480] lg:max-w-none lg:aspect-auto lg:h-[640px]"
            >
              {/* the inner <article>. `relative` is what the elements' x/y
                  percentages resolve against, so they are card-relative and
                  survive the row reflowing. */}
              <article className="relative h-full">
                {card.els.map((el) => (
                  <PriceEl key={el.name} el={el} />
                ))}
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Stickers Layer */}
      {!hideStickers && PRICING_STICKERS.map((st) => (
        <div
          key={st.id}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.w}%`,
            zIndex: st.z ?? 25,
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
    </Section>
  );
}
