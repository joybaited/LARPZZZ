import type { PriceEl as El } from "@/sections/Pricing";
import { PILL_HOVER_FILL, PILL_HOVER_TEXT } from "@/components/pillHover";

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
/* `fluidText` is OPT-IN, AND ONLY THE HERO PASSES IT. The text branch below
   sizes in raw px by default, which is what Pricing's cards were authored
   and tuned against — their feature lines are `size: 20` text elements and
   scaling them silently grew every card's copy. The hero's subtitle is the
   one place that needed to keep pace with its neighbours on a big screen,
   so it asks for it rather than every caller getting it. */
export default function PriceEl({ el, fluidText = false }: { el: El; fluidText?: boolean }) {
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

  if (el.kind === "box" || el.kind === "ellipse") {
    const label = (
      <>
        {/* the filling layer, metamask's ::before. Under the label via -z-10. */}
        <span aria-hidden="true" className="pill-btn__fill" style={{ background: PILL_HOVER_FILL }} />
        <span className="pill-btn__holder">
          <span className="pill-btn__main">{el.text}</span>
          <span aria-hidden="true" className="pill-btn__hover" style={{ color: PILL_HOVER_TEXT }}>
            {el.text}
          </span>
        </span>
      </>
    );

    const isBtn = Boolean(el.btn);
    const href = isBtn
      ? el.text?.toLowerCase() === "buy"
        ? "#pricing"
        : el.text?.toLowerCase() === "login"
        ? "/login"
        : el.text?.toLowerCase().includes("started") ||
          el.text?.toLowerCase().includes("free") ||
          el.text?.toLowerCase().includes("lifetime") ||
          el.text?.toLowerCase().includes("buy")
        ? "#pricing"
        : undefined
      : undefined;

    const Comp = href ? "a" : "div";

    return (
      <Comp
        {...(href ? { href } : isBtn ? { role: "button", tabIndex: 0 } : {})}
        style={{
          ...pos,
          width: `${el.w ?? 60}%`,
          height: `${el.h ?? 12}%`,
          /* ⚠ A BUTTON NEEDS A SANE BOUNDED RANGE. Fluid clamp clears the
             type plus the roll at every card and screen size, and prevents
             ballooning on 4K or collapsing on shallow viewports. */
          maxWidth: isBtn ? "210px" : undefined,
          minWidth: isBtn ? "120px" : undefined,
          minHeight: isBtn ? "46px" : undefined,
          maxHeight: isBtn ? "56px" : undefined,
          background: el.fill ?? "#ffffff",
          /* ⚠ CAPPED IN px, NOT AT 50%. A percentage radius resolves PER-AXIS.
             `radius: 999` or true pill ensures clean rounding at any scale. */
          borderRadius: el.radius ? (el.radius >= 999 ? "999px" : `calc(${el.radius} * var(--px, 1px))`) : isBtn ? "9999px" : 0,
          border: el.border ? `calc(${el.border} * var(--px, 1px)) solid ${el.borderColor ?? "#ffffff"}` : undefined,
          color: el.color ?? "#000000",
          fontSize: typeof el.size === "string" ? el.size : `calc(${el.size ?? 15} * var(--px, 1px))`,
          fontWeight: el.weight ?? 600,
          letterSpacing: el.tracking !== undefined ? `${el.tracking}em` : undefined,
          fontFamily: el.font === "display" ? "var(--font-display)" : undefined,
          textTransform: el.caps ? "uppercase" : undefined,
        }}
        /* min-w-0 so a long label cannot push the box wider than its own w,
           and overflow-hidden so shrinking clips instead of spilling. */
        className={`absolute flex min-w-0 items-center justify-center overflow-hidden text-center leading-none whitespace-pre-wrap no-underline select-none${
          isBtn ? " pill-btn isolate cursor-pointer" : " leading-tight"
        }`}
      >
        {isBtn ? label : el.text}
      </Comp>
    );
  }

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
        /* ⚠ RAW px UNLESS THE CALLER ASKS OTHERWISE. `--px` here scaled the
           hero's subtitle, which is what it was for — but PriceEl also
           renders every Pricing card, so it grew their copy too and the
           CTA label outgrew the `210px` cap on its own box. Opt-in keeps
           the hero's fix without reaching into a section that never asked
           for it. */
        fontSize:
          typeof el.size === "string"
            ? el.size
            : fluidText
              ? `calc(${el.size ?? 16} * var(--px, 1px))`
              : `${el.size ?? 16}px`,
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
