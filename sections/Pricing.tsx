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
 * ⚠ FILL AND BORDER ARE BOTH INK AND ARE KEPT SEPARATE ANYWAY. The 3px edge
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
  show?: boolean;
};

/* `fill` is the card's own background. Only the middle card sets one —
 * the reference inverts it to pull the eye to the middle tier. Omitted
 * means ink, which is the other two. */
export const CARDS: { name: string; els: PriceEl[]; fill?: string }[] = [
  {
    name: "Card 1",
    els: [
      { name: "text 1", kind: "text", text: "Starter", x: 50, y: 7.6, w: 86, size: 26, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 2", kind: "text", text: "$14", x: 50, y: 16.8, w: 86, size: 62, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 3", kind: "text", text: "7 days", x: 50, y: 23.5, w: 86, size: 16, weight: 400, align: "left", color: "#8a8a8a", show: false },
      { name: "box 5", kind: "box", x: 50, y: 33.1, w: 86, h: 8.8, size: 15, radius: 999, weight: 500, fill: "#ffffff", color: "#000000" },
      { name: "text 6", kind: "text", text: "Get Started", x: 50, y: 33.1, size: 16, weight: 500, align: "center", color: "#000000" },
      { name: "text 7", kind: "text", text: "iOS & Android access", x: 50, y: 48.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 8", kind: "text", text: "Access to core AI tools", x: 50, y: 55.7, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 9", kind: "text", text: "Up to 3 active projects", x: 50, y: 62.9, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 10", kind: "text", text: "Community support", x: 50, y: 70.1, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 11", kind: "text", text: "Access to core AI tools", x: 50, y: 77.3, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff", show: false },
      { name: "text 12", kind: "text", text: "Access to core AI tools", x: 50, y: 84.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff", show: false },
    ],
  },
  {
    name: "Card 2",
    els: [
      { name: "text 1", kind: "text", text: "Monthly", x: 50, y: 9.0, w: 86, size: 26, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 2", kind: "text", text: "$44", x: 50, y: 16.8, w: 86, size: 62, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 3", kind: "text", text: "/month", x: 50, y: 23.6, w: 86, size: 16, weight: 400, align: "left", color: "#8a8a8a" },
      { name: "box 5", kind: "box", x: 50, y: 33.5, w: 86, h: 8.8, size: 15, radius: 999, weight: 500, fill: "#ffffff", color: "#000000" },
      { name: "text 6", kind: "text", text: "Try It Free", x: 50, y: 33.5, size: 16, weight: 500, align: "center", color: "#000000" },
      { name: "text 7", kind: "text", text: "Everything in Starter", x: 50, y: 48.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 8", kind: "text", text: "Unlimited active projects", x: 50, y: 55.7, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 9", kind: "text", text: "Advanced AI tools", x: 50, y: 62.9, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 10", kind: "text", text: "Priority email support", x: 50, y: 70.1, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 11", kind: "text", text: "Custom export presets", x: 50, y: 77.3, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 12", kind: "text", text: "Access to core AI tools", x: 50, y: 84.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff", show: false },
    ],
  },
  {
    name: "Card 3",
    els: [
      { name: "text 1", kind: "text", text: "Lifetime", x: 50, y: 7.6, w: 86, size: 26, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 2", kind: "text", text: "$149", x: 50, y: 15.7, w: 86, size: 62, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 3", kind: "text", text: "once", x: 50, y: 22.2, w: 86, size: 16, weight: 400, align: "left", color: "#8a8a8a" },
      { name: "box 5", kind: "box", x: 50, y: 33.2, w: 86, h: 8.8, size: 15, radius: 999, weight: 500, fill: "#ffffff", color: "#000000" },
      { name: "text 6", kind: "text", text: "Buy Lifetime", x: 50, y: 33.2, size: 16, weight: 500, align: "center", color: "#000000" },
      { name: "text 7", kind: "text", text: "Everything in Monthly", x: 50, y: 48.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 8", kind: "text", text: "Lifetime updates", x: 50, y: 55.7, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 9", kind: "text", text: "Early access to tools", x: 50, y: 62.9, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 10", kind: "text", text: "Founder badge", x: 50, y: 70.1, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 11", kind: "text", text: "Direct line to the team", x: 50, y: 77.3, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
      { name: "text 12", kind: "text", text: "No subscription, ever", x: 50, y: 84.5, w: 86, size: 17, weight: 400, align: "left", color: "#ffffff" },
    ],
  },
];

export default function Pricing() {
  return (
    <Section id="pricing" className="bg-haze">
      <div className="flex min-h-[100svh] items-center justify-center py-(--space-3xl)">
        <ul
          role="list"
          className="m-0 flex w-full max-w-[1200px] list-none flex-col items-stretch gap-(--space-m) p-0 sm:flex-row sm:gap-[clamp(1rem,4.2vw,60px)]"
        >
          {CARDS.map((card) => (
            <li
              key={card.name}
              /* 640 is the desktop card. Stacked, that is three full screens
                 of empty black, so the height is only asserted once the row
                 is a row. */
              style={card.fill ? { background: card.fill } : undefined}
              className="min-w-0 flex-1 rounded-[20px] border-[3px] border-ink bg-ink max-sm:aspect-[360/480] sm:h-[640px]"
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
    </Section>
  );
}
