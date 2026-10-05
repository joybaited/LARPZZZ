import Section from "@/components/Section";

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
const CARDS = [1, 2, 3];

export default function Pricing() {
  return (
    <Section id="pricing" className="bg-haze">
      <div className="flex min-h-[100svh] items-center justify-center py-(--space-3xl)">
        <ul
          role="list"
          className="m-0 flex w-full max-w-[1200px] list-none flex-col items-stretch gap-(--space-m) p-0 sm:flex-row sm:gap-[clamp(1rem,4.2vw,60px)]"
        >
          {CARDS.map((n) => (
            <li
              key={n}
              /* 640 is the desktop card. Stacked, that is three full screens
                 of empty black, so the height is only asserted once the row
                 is a row. */
              className="min-w-0 flex-1 rounded-[20px] border-[3px] border-ink bg-ink max-sm:aspect-[360/480] sm:h-[640px]"
            >
              {/* the inner <article>. fills its card and holds nothing yet —
                  it exists so content has somewhere to go that is not the
                  card box itself. empty by design. */}
              <article className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
