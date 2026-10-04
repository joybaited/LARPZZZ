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
export default function Section({
  id,
  extra = 0,
  bleed = false,
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
      style={{ minBlockSize: `calc(100svh + ${extra} * 100svh)` }}
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
