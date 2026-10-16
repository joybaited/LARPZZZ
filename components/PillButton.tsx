import { PILL_HOVER_FILL, PILL_HOVER_TEXT } from "@/components/pillHover";

/* A pill button carrying metamask.io's hover. The mechanism and the numbers
 * are documented in `pillHover.tsx`, which owns the stylesheet — this is just
 * the markup shape it expects: a filling layer plus two stacked copies of the
 * label inside a clipping holder.
 */
type Props = {
  children: React.ReactNode;
  href?: string;
  /** resting fill, and the colour the label rolls to on hover */
  fill: string;
  /** resting label colour, and the colour the circle fills with */
  color: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function PillButton({ children, href = "#", fill, color, className = "", style }: Props) {
  return (
    <a
      href={href}
      className={`pill-btn relative isolate inline-block overflow-hidden rounded-full no-underline shrink-0 ${className}`}
      style={{ background: fill, color, ...style }}
    >
      <span aria-hidden="true" className="pill-btn__fill" style={{ background: PILL_HOVER_FILL }} />
      <span className="pill-btn__holder">
        <span className="pill-btn__main">{children}</span>
        <span aria-hidden="true" className="pill-btn__hover" style={{ color: PILL_HOVER_TEXT }}>
          {children}
        </span>
      </span>
    </a>
  );
}
