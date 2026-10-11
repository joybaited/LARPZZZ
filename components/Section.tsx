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
   It is a clamp, not a fixed px: 72px on a 390 phone up to 140px at 1440, so
   the space grows with the type it is making room for.
   Kept local rather than a token in globals.css — that file is shared and
   CLAUDE.md says changes get agreed first; this needs nobody else. */
const HEADING_SPACE = "clamp(72px, 4rem + 4vw, 140px)";

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
        minBlockSize: `calc(100svh + ${extra} * 100svh)`,
        paddingBlockStart: flush ? undefined : HEADING_SPACE,
        ["--section-fill" as string]: flush
          ? "100svh"
          : `calc(100svh - ${HEADING_SPACE})`,
      }}
    >
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
