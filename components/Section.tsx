type Props = {
  /** section id — used for the anchor and for scroll triggers */
  id: string;
  /**
   * extra vertical space beyond the standard one-viewport height.
   * `1` = one extra viewport, `0.5` = half. the extra belongs to THIS
   * section — it is not a gap between sections and not a spacer element.
   */
  extra?: number;
  /** opt out of the centred content column (full-bleed backgrounds, canvas) */
  bleed?: boolean;
  /**
   * opt OUT of the standard heading space at the top of the section.
   * for a section that owns its own vertical rhythm — the hero centres a
   * headline in the full viewport, and a pinned rail positions its own
   * content. everything else takes the default.
   */
  flush?: boolean;
  /**
   * the section's title, set large and centred in the heading space that is
   * already reserved at the top. omit it for a section that has no title —
   * the hero and the footer — and the space behaves exactly as before.
   */
  heading?: string;
  className?: string;
  children?: React.ReactNode;
  /** for scroll triggers that need to pin or measure the section element. */
  ref?: React.Ref<HTMLElement>;
};

/**
 * the standard section. every section is one of these.
 *
 * standard size  = full viewport height (100svh), content capped at
 *                  --content-max with --gutter either side.
 * extra space    = `extra` prop, in viewports. stays inside the section.
 *
 * height is a minimum, so a section with more content grows instead of
 * clipping. see docs/SECTIONS.md.
 */
/* ⚠ ONE SPACE FOR EVERY SECTION HEADING, SET HERE, NOT PER SECTION.
   Measured before this existed: the first heading sat 265px down in the hero,
   599 in Features, 75 in How it works and 391 in the Faq — four sections, four
   unrelated numbers, because each one hand-rolled its own top padding. A
   section that wants a different number now has to opt out with `flush`, which
   makes the exception visible instead of silent.
   It is a clamp, not a fixed px: 120px on a 390 phone up to 240px at 1440, so
   the space grows with the type it is making room for.
   The generous end of the published range on purpose — the guides cluster at
   80-120px desktop for a content section, and the editorial/awwwards end runs
   well past that. The owner asked for generous; this is roughly double the
   first pass (was 72 -> 140).
   Kept local rather than a token in globals.css — that file is shared and
   CLAUDE.md says changes get agreed first; this needs nobody else. */
/* ⚠ ONE SPACE FOR EVERY SECTION HEADING, SET HERE, NOT PER SECTION.
   Preserved at exactly 195.84px on the 1536x742 baseline, while scaling safely
   on shorter screens via min(..., 26.5vh) so shallow viewports don't clip content. */
const HEADING_SPACE = "clamp(80px, min(6rem + 6.5vw, 26.5vh), 240px)";

/* ⚠ THE BREATHING ROOM AT THE FOOT OF EVERY SECTION, SET HERE, NOT PER SECTION.
   Preserved at exactly 109.44px on the 1536x742 baseline. */
const FOOT_SPACE = "clamp(40px, min(3rem + 4vw, 15vh), 160px)";

/* ⚠ THE SECTION'S HEIGHT BUDGET. One viewport on a landscape screen, and on a
   portrait one the smaller of that and a width-proportional height. See the
   note on minBlockSize below for the measurements that set it. A section
   still grows past this when its content needs more — min-height, not
   height. */
const SECTION_MIN = "min(100svh, calc(78vw + 240px))";

/* ⚠ ON A PORTRAIT SCREEN A SECTION IS ONLY AS TALL AS WHAT IS IN IT.
   SECTION_MIN caps how much height a section ASKS for, but the section still
   reserved a whole viewport as its min-height, so a short section left the
   surplus as dead space at its foot — measured below the last inked pixel in
   Testimonials: 448px at 1024x1290, 300px at 430x860, 280px at 390x770, while
   the same section at 1536x742 sat at a reasonable 125px.
   `0px` is not a shrink: the padding, the heading band and the content all
   still set the real height. It only stops the section DEMANDING a viewport
   it has nothing to put in. Landscape keeps the tuned full-viewport rhythm,
   so every desktop and laptop is untouched. */
const PORTRAIT = "@media (max-aspect-ratio: 1/1)";

/* what an inner wrapper should use instead of `min-h-[100svh]`:
     className="min-h-[var(--section-fill)]"
   It is one viewport MINUS the heading space, so the section totals exactly
   one viewport instead of one-plus-the-padding. Set on the section element
   below, so it is always in scope for anything inside it. */

export default function Section({
  id,
  extra = 0,
  bleed = false,
  flush = false,
  heading,
  className = "",
  children,
  ref,
}: Props) {
  return (
    <section
      ref={ref}
      id={id}
      data-section={id}
      data-extra={extra || undefined}
      className={`relative w-full ${flush ? "" : "[@media(max-aspect-ratio:1/1)]:!min-h-0"} ${className}`}
      style={{
        /* ⚠ THE SECTION'S OWN min-height IS NOT WHAT MAKES IT TALL — the
           INNER wrapper is. Four sections hard-code `min-h-[100svh]` of their
           own, so this box is (their 100svh + this padding) and shrinking the
           min-height below that does nothing. Measured: min-height 778px,
           section 1022px, child 900px. `box-sizing: border-box` does not help
           either; it governs `height`, not `min-block-size`.
           So the padding is published as a variable and the inner wrappers
           subtract it via `--section-fill` instead of re-asserting 100svh. */
        /* ⚠ THE SECTION GROWS BY THE FOOT SPACE — IT DOES NOT SQUEEZE THE
           CONTENT INTO IT. `--section-fill` stays one viewport minus the
           heading, so the card rows keep the height they were designed
           against; the foot pad is added on top of the min-height instead of
           taken out of it. Subtracting it from `--section-fill` would shrink
           every card row and make the cramming worse, not better. */
        /* ⚠ A SECTION STOPS DEMANDING A WHOLE VIEWPORT WHEN THE VIEWPORT IS
           TALL AND NARROW. `100svh` on a 1024x1290 iPad or a 390x770 phone is
           a box far taller than the content that goes in it, and every inner
           wrapper centres itself in that box — so the surplus splits in half
           and half of it pools between the heading and the first card.
           Measured, heading glyph bottom to first inked pixel:
             testimonials 390x770 -> 252px of dead band, 30% of the section
             features     820x1100 -> 280px, 24%
             pricing      1024x1290 -> 331px, 24%
           while the same sections at 1536x742 sat at a healthy 52-68px.
           `min(100svh, 78vw + 240px)` keeps the full viewport on any screen
           wider than it is tall — every desktop and laptop, where the design
           was tuned — and on a portrait screen caps the demand at something
           proportional to the WIDTH, which is what the content's own size
           actually tracks. The section still GROWS past this for content that
           needs it: this is a min-height, not a height. */
        minBlockSize: flush
          ? `calc(100svh + ${extra} * 100svh)`
          : `calc(${SECTION_MIN} + ${FOOT_SPACE} + ${extra} * 100svh)`,
        paddingBlockStart: flush ? undefined : HEADING_SPACE,
        paddingBlockEnd: flush ? undefined : FOOT_SPACE,
        /* the fill tracks the same budget, or the inner wrappers would still
           reserve a full viewport inside a section that no longer is one. */
        ["--section-fill" as string]: flush
          ? "100svh"
          : `calc(${SECTION_MIN} - ${HEADING_SPACE})`,
      }}
    >
      {/* ⚠ THE HEADING LIVES IN THE SPACE THAT WAS ALREADY RESERVED, AND IT
          IS ALWAYS FULL-BLEED-CENTRED EVEN IN A `bleed` SECTION. It sits
          above the children, outside the content column, so a bleed section
          (a carousel, a marquee) still gets a centred title without having
          to opt back into the column.
          It is `absolute`, pinned to the top padding band, for the reason the
          media box in the nav panel had to be: in flow it ADDS its height to
          a section whose inner wrapper is already `--section-fill` tall, so
          every section would grow by the height of its own heading and the
          content would be pushed off the viewport. Out of flow, the reserved
          space absorbs it and nothing below moves. */}
      {heading ? (
        <h2
          /* ⚠ FONT-SIZE IS SET IN `style`, NOT `text-(--text-1)`. That
             shorthand is ambiguous in Tailwind v4 — it cannot tell a
             font-size variable from a colour one, so it silently produced no
             font-size at all and the heading rendered at the inherited 16px.
             Measured before and after. */
          /* ⚠ BOTTOM-ALIGNED IN ITS BAND ON DESKTOP, NOT CENTRED. The band is
             a fixed HEADING_SPACE — 240px at 1920 — but the glyphs are only
             117px of it, so centring left 62px of dead air between the
             wordmark and the first row of content (measured 62/51/43/41 at
             1920/1536/1366/1280; it is the gap in the Features screenshot).
             Sitting the type on the band's floor with a small pad turns that
             into deliberate breathing room instead of a hole, and moves
             nothing else — the band's own height is unchanged, so every
             section below starts exactly where it did.
             Centred below lg, where the band is already tight to the type. */
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center px-(--gutter) text-center font-display uppercase leading-[0.9] tracking-[-0.02em] text-balance lg:items-end lg:pb-[clamp(16px,2.6vh,40px)]"
          style={{ height: HEADING_SPACE, fontSize: "var(--text-1)" }}
        >
          {heading}
        </h2>
      ) : null}
      {bleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-(--content-max) px-(--gutter)">
          {children}
        </div>
      )}
    </section>
  );
}
