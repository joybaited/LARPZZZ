import type { PriceEl as El } from "@/sections/Pricing";

/* One element on a pricing card. SHARED BY THE SECTION AND THE TUNER.
 *
 * ⚠ THIS EXISTS SO THE TUNER CANNOT DRIFT FROM THE PAGE. The FAQ tuner draws
 * its own dead copy of the pill and every class has to be kept in step by
 * hand — a comment in it says exactly that. One component used by both ends
 * that, so what is arranged in the tuner is what ships.
 *
 * ⚠ CENTRED ON ITS x/y. The anchor is the middle, not the top-left, so
 * resizing or retyping keeps an element where it was put instead of growing
 * rightward off its mark.
 *
 * ⚠ SIZES ARE PERCENTAGES OF THE CARD, FONT SIZE IS px. A card is ~360px at
 * 1440 and ~214px at 768, so a % box scales with it while the type stays
 * legible. Mixing the two is deliberate, not an oversight.
 */
export default function PriceEl({ el }: { el: El }) {
  if (el.show === false) return null;

  const pos: React.CSSProperties = {
    left: `${el.x}%`,
    top: `${el.y}%`,
    opacity: (el.opacity ?? 100) / 100,
    /* ⚠ ROTATION AFTER THE CENTRING TRANSLATE. Put it first and the element
       orbits the card's origin instead of turning in place. */
    transform: `translate(-50%, -50%) rotate(${el.rotate ?? 0}deg)`,
  };

  if (el.kind === "line")
    return (
      <div
        aria-hidden="true"
        style={{
          ...pos,
          width: `${el.w ?? 60}%`,
          height: `${el.size ?? 1}px`,
          background: el.fill ?? "#ffffff",
          borderRadius: `${el.radius ?? 0}px`,
        }}
        className="absolute"
      />
    );

  if (el.kind === "box" || el.kind === "ellipse")
    return (
      <div
        style={{
          ...pos,
          width: `${el.w ?? 60}%`,
          height: `${el.h ?? 12}%`,
          background: el.fill ?? "#ffffff",
          /* ⚠ CAPPED IN px, NOT AT 50%. A percentage radius resolves PER-AXIS:
             50% on a 304x56 pill rounds the horizontal by 152px and the shape
             reads as an ellipse, not a pill. A px radius is uniform on both
             axes and the browser already clamps one that exceeds the box, so
             `radius: 999` gives a true pill at any card size and a small
             radius still reads as a small radius. */
          borderRadius: `${el.radius ?? 0}px`,
          border: el.border ? `${el.border}px solid ${el.borderColor ?? "#ffffff"}` : undefined,
          color: el.color ?? "#000000",
          fontSize: `${el.size ?? 15}px`,
          fontWeight: el.weight ?? 600,
          letterSpacing: `${el.tracking ?? 0}em`,
          fontFamily: el.font === "display" ? "var(--font-display)" : undefined,
          textTransform: el.caps ? "uppercase" : undefined,
        }}
        /* min-w-0 so a long label cannot push the box wider than its own w,
           and overflow-hidden so shrinking clips instead of spilling. */
        className="absolute flex min-w-0 items-center justify-center overflow-hidden text-center leading-tight whitespace-pre-wrap"
      >
        {el.text}
      </div>
    );

  /* text */
  return (
    <div
      style={{
        ...pos,
        width: el.w ? `${el.w}%` : undefined,
        /* ⚠ AN AUTO-WIDTH TEXT STILL NEEDS A CEILING. Without one a long
           string is one `max-content` line that runs off the section. 92%
           keeps it inside the gutter and lets it break naturally; give the
           element a real `w` (drag a side handle) to control where. */
        maxWidth: el.w ? undefined : "92%",
        color: el.color ?? "#ffffff",
        fontSize: `${el.size ?? 16}px`,
        fontWeight: el.weight ?? 400,
        letterSpacing: `${el.tracking ?? 0}em`,
        /* ⚠ MEGION IS ONE WEIGHT (BOLD) AND DISPLAY ONLY. Picking it ignores
           the weight dial — there is no light or regular cut to fall back to,
           so the browser would synthesise one and it would look wrong. */
        fontFamily: el.font === "display" ? "var(--font-display)" : undefined,
        textAlign: el.align ?? "center",
        textTransform: el.caps ? "uppercase" : undefined,
        fontStyle: el.italic ? "italic" : undefined,
        textDecoration: el.strike ? "line-through" : undefined,
      }}
      /* ⚠ `pre-wrap` EITHER WAY, SO LONG COPY WRAPS INSTEAD OF RUNNING OFF.
         It used to be `whitespace-pre` without a width, which never breaks a
         line — a long string just ran past the section with no way to tell
         except by looking. Typed newlines are still honoured (that is the
         `pre` half of pre-wrap), so a deliberate break is still a break.

         Auto-width text is unaffected in practice: with no `w` the box is
         `max-content`, so there is nothing to wrap against until it hits
         `maxWidth` below. */
      className="absolute leading-tight whitespace-pre-wrap"
    >
      {el.text}
    </div>
  );
}
