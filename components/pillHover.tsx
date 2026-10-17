/* metamask.io's button hover, as one stylesheet shared by every pill.
 *
 * ── MEASURED OFF THEIR LIVE PAGE, NOT RECREATED ─────────────────────────
 *
 * Read off `.button_button__XszAu` / `.button_button-holder__kUpTr` at 1440
 * with getComputedStyle in both states. A web search for this effect returns
 * only generic "expanding circle" tutorials; none of them is what they do and
 * none has these numbers.
 *
 * Two things happen at once:
 *
 * 1. A CIRCLE SCALES UP BEHIND THE LABEL, 0 -> 1.03. Theirs is
 *    `border-radius: 100px` and sized to the button, so it reads as the pill
 *    filling rather than a circle crossing it. 1.03, not 1 - it overshoots the
 *    edge so no hairline of the old fill survives at the rim.
 *
 * 2. THE LABEL ROLLS VERTICALLY. Two copies of the text sit in an
 *    `overflow: hidden` holder: the resting one slides up and out, a second
 *    (absolute, aria-hidden) slides up into its place. Measured on their
 *    42px button: main 0 -> -28.69px, hover +45px -> ~0.
 *
 * ⚠ THE EASING IS THE WHOLE FEEL: cubic-bezier(0.4, 1.35, 0.5, 0.97). The
 * 1.35 is above 1, so it OVERSHOOTS and settles - that is the small spring at
 * the end. Swap it for a plain ease-out and the effect dies while every
 * distance stays identical. The same curve is on their bento cards and their
 * language switcher; it is the site's one signature curve.
 *
 * ⚠ OPACITY RUNS AT HALF THE TRANSFORM'S DURATION, always. 0.5s/0.25s on the
 * label, 0.55s/0.275s on the circle. The fade finishes while the movement is
 * still going, so the swap never reads as a crossfade.
 *
 * ⚠ THE RULES ARE NOT IN globals.css. This needs pseudo-element, :hover and
 * descendant selectors, none of which an inline style can express - and
 * globals.css is a shared file that per CLAUDE.md gets agreed before it is
 * touched. React hoists and dedupes a <style>, so rendering twenty buttons
 * emits it once.
 */
/* The hover colours. The pill rests in its section's own pair and flips to
   this on hover, so the yellow is a deliberate accent against the purple
   rather than a second violet. Grape on #FFD84D is ~11:1, well past AA.
   Kept here, not in globals.css: that file is shared and per CLAUDE.md its
   changes get agreed first, and this is only the buttons' business. */
export const PILL_HOVER_FILL = "#c9e264";
export const PILL_HOVER_TEXT = "#3D065F";

export const PILL_CSS = `
/* ⚠ UNIFORM scale, EXACTLY AS THEIRS - DO NOT MAKE THIS scaleY. A scaleY(0)
   collapses the fill to a full-width horizontal HAIRLINE on the way out,
   which on a 304px button is a visible line flicking away. scale(0) collapses
   to a point instead, which is why theirs closes cleanly. */
.pill-btn__fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 100px;
  transform: scale(0);
  transform-origin: center;
  /* ⚠ THE EXIT IS NOT THE ENTRANCE PLAYED BACKWARDS. The 1.35 overshoot is
     what gives the entrance its spring; reversed, it drives the scale past
     zero and snaps. The exit is a plain ease-out, so it closes down to the
     point smoothly instead of flicking. */
  transition: transform 0.4s cubic-bezier(0.33, 0, 0.67, 1),
              opacity 0.4s cubic-bezier(0.33, 0, 0.67, 1);
  opacity: 0;
}
.pill-btn:hover .pill-btn__fill,
.pill-btn:focus-visible .pill-btn__fill {
  transform: scale(1.03);
  opacity: 1;
  transition: transform 0.55s cubic-bezier(0.4, 1.35, 0.5, 0.97),
              opacity 0.275s cubic-bezier(0.4, 1.35, 0.5, 0.97);
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* ⚠ THE HOLDER MUST CLIP, AND THAT IS WHAT EATS DESCENDERS. The roll needs
   overflow hidden, but a button set in leading-none gives the holder a line
   box exactly the font size - and glyphs do not fit in their font size.
   Measured on an 18.32px "Login": the line box was 18.31px while the glyphs
   spanned 22px, so the g was cut 1.69px short at the bottom and the cap was
   2px short at the top.

   A line-height of 1.5 is the floor that clears ascender and descender at any
   size. Stated in em so it tracks the type at every button size. */
.pill-btn__holder {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  line-height: 1.5;
  height: 1.5em;
}
/* Same asymmetry as the fill: spring in, ease out. With the overshoot curve
   on the way back the two labels wobble past each other at the hand-off and
   the swap reads as a stutter, which is most obvious on a wide button where
   the text has further to travel. */
.pill-btn__main,
.pill-btn__hover {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  width: 100%;
  height: 1.5em;
  line-height: 1.5;
  transition: transform 0.4s cubic-bezier(0.33, 0, 0.67, 1);
}
.pill-btn:hover .pill-btn__main,
.pill-btn:hover .pill-btn__hover,
.pill-btn:focus-visible .pill-btn__main,
.pill-btn:focus-visible .pill-btn__hover {
  transition: transform 0.5s cubic-bezier(0.4, 1.35, 0.5, 0.97);
}
/* ⚠ THE TRAVEL IS THE HOLDER'S LINE BOX, NOT A HAND-PICKED DISTANCE. At
   1.5 line-height the box is 1.5em, so anything less leaves a sliver of the
   outgoing label still inside the clip at the end of the roll. Stated in em
   so it tracks the type at every button size. */
.pill-btn__hover {
  position: absolute;
  inset: 0;
  transform: translateY(1.5em);
}
.pill-btn:hover .pill-btn__main,
.pill-btn:focus-visible .pill-btn__main { transform: translateY(-1.5em); }
.pill-btn:hover .pill-btn__hover,
.pill-btn:focus-visible .pill-btn__hover { transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .pill-btn__fill,
  .pill-btn__main,
  .pill-btn__hover { transition: none; }
}
`;

export function PillStyle() {
  return <style>{PILL_CSS}</style>;
}
