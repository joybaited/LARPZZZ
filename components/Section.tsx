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
      className={`relative w-full ${className}`}
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
        minBlockSize: flush
          ? `calc(100svh + ${extra} * 100svh)`
          : `calc(100svh + ${FOOT_SPACE} + ${extra} * 100svh)`,
        paddingBlockStart: flush ? undefined : HEADING_SPACE,
        paddingBlockEnd: flush ? undefined : FOOT_SPACE,
        ["--section-fill" as string]: flush
          ? "100svh"
          : `calc(100svh - ${HEADING_SPACE})`,
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
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center px-(--gutter) text-center font-display uppercase leading-[0.9] tracking-[-0.02em] text-balance"
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
