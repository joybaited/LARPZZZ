import Section from "@/components/Section";
import SceneMount from "@/components/SceneMount";
import PriceEl from "@/components/PriceEl";
import type { PriceEl as El } from "@/sections/Pricing";
/* ⚠ TYPE-ONLY. components/Phone is reached only through SceneMount's
   dynamic(..., { ssr: false }) chunk, so importing a VALUE from it gives
   `undefined` at module-eval — session 10 hit exactly this with PHONE_TUNE.
   A type erases at compile time and cannot be undefined. */
import type { PhoneTune } from "@/components/Phone";

/* ⚠ ARRANGED IN /hero-tuner. This block is the layout — the tuner prints it
 * and it is pasted here by hand, which is what stops a tuner breaking the
 * section it tunes. /hero-tuner imports it to seed itself, so the two cannot
 * drift.
 *
 * ⚠ PAIRS ARE [value at 390, value at 1440] IN PX, and they are CLAMPS, not
 * a straight line between the ends — see `fluid` below. A single px value
 * would be right at one width and wrong at every other, which is the whole
 * reason the tokens in globals.css are clamps.
 *
 * ⚠ els x/y ARE PERCENTAGES, and `in: "nav"` makes them percentages OF THE
 * NAV instead of the section. <PriceEl> is absolute, so the nav being
 * `relative` is what makes that work — do not remove it.
 */
export const HERO = {
  bg: "#EAC2FF",
  nav: { h: [48, 57], radius: 8, inset: [16, 48], y: [4.8, 10.8], fill: "#3D065F", show: true },
  headline: {
    lines: ["Fake it", "Till' you", "Make it"],
    color: "#3D065F",
    min: 52,
    max: 96,
    x: [64, 102],
    y: [232.8, 264.8],
    leading: 0.9,
    show: true,
  },
  phone: {
    rotation: [-6.3, 156.9, 5.7],
    position: [0.05, -0.21, 0.16],
    fit: 0.71,
    camera: { z: 5.9, fov: 42 },
    entrance: { zeta: 0.65, wn: 10, fromScale: 0.2, overshoot: 1.15, fromYaw: -25, fromRoll: 22, settleAt: 1.4, settleOver: 0.4 },
    idle: { floatHz: 0.2, floatAmp: 0.025, wobble: 1 },
    parallax: { yaw: 9.7, pitch: 5, damp: 0.39 },
  },
  els: [
    { name: "box 1", kind: "box", text: "Button", x: 94.1, y: 50, w: 9.7, h: 74, size: 18.3, radius: 235.3, weight: 600, fill: "#EAC2FF", color: "#3D065F", in: "nav" },
    /* ⚠ THE WORDMARK IS NOT IN `els` ANY MORE — it is the roller below, and
       it is rendered by Hero itself rather than by <PriceEl>. Putting a
       three-cell animated track behind one `kind: "text"` would mean teaching
       PriceEl about it, and PriceEl is a SHARED FILE that Pricing also uses.
       Its placement lives in `wordmark` on HERO instead. */
    { name: "text 2", kind: "text", text: "Display any balance on a pixel-perfect Phantom Wallet, Trust Wallet, Ledger, Exodus or Bank app interface. Live prices, custom tokens, push notifications — built purely for entertainment.", x: 82, y: 50, w: 30, h: 0, size: 24, weight: 400, align: "center", color: "#3D065F" },
    { name: "box 3", kind: "box", text: "Button", x: 89.5, y: 67, w: 13, h: 6.4, size: 16, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
    { name: "box 4", kind: "box", text: "Button", x: 74.5, y: 67, w: 13, h: 6.4, size: 16, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
    { name: "text 3", kind: "text", text: "Text", x: 78.8, y: 50, size: 20, weight: 400, align: "center", color: "#EAC2FF", in: "nav" },
    { name: "text 4", kind: "text", text: "Text", x: 85.2, y: 50, size: 20, weight: 400, align: "center", color: "#EAC2FF", in: "nav" },
    { name: "text 5", kind: "text", text: "Text", x: 72.4, y: 50, size: 20, weight: 400, align: "center", color: "#EAC2FF", in: "nav" },
    { name: "line 1", kind: "line", x: 3.4, y: 33.5, w: 2.7, size: 2, fill: "#EAC2FF", in: "nav" },
    { name: "line 2", kind: "line", x: 3.4, y: 50, w: 2.9, size: 2, fill: "#EAC2FF", in: "nav" },
    { name: "line 3", kind: "line", x: 3.4, y: 66.6, w: 2.7, size: 2, fill: "#EAC2FF", in: "nav" },
  ] as El[],

  /* ⚠ THE NAV WORDMARK ROLLER. The wordmark rises out of the bar as the
     Phantom ghost rises in, then the ghost rises out as the wordmark returns
     — one continuous upward travel, looping forever.

     x/y are percentages OF THE NAV, like an `in: "nav"` element, and it is
     centred on that point. `cell` is the height of one face in px: the track
     is three of them and the clip shows exactly one, so this is also the
     height of the window the faces move through. `dur` is the whole cycle,
     including both holds. The motion is one keyframe in globals.css.

     ⚠ `ghost` MUST NOT EXCEED `cell`, AND `ghostY` MUST KEEP IT INSIDE. This
     was briefly 66 in a 54 cell with a -6 nudge, which put 12px of ghost
     ABOVE its own cell — straight into the wordmark's cell, where it showed
     through during the hold. The window clips vertically precisely so each
     face is alone; a face taller than the window defeats that.

     ⚠ SO SIZE COMES FROM `ghostScale`, NOT FROM HEIGHT. It scales the video
     about its centre, and because the clip is vertical-only the extra width
     spills sideways harmlessly while the height is still cut at the cell
     edge. That is how it reads bigger than the bar without ever appearing in
     a neighbouring cell. `ghostY` nudges within the cell; keep
     `ghost/2 * ghostScale + |ghostY|` under `cell/2`. */
  wordmark: {
    text: "LARPZ WALLET",
    src: "/video/phantom.webm",
    x: 50.9,
    y: 50,
    size: 28.7,
    cell: 54,
    ghost: 54,
    ghostY: 0,
    ghostScale: 1,
    dur: "9s",
    color: "#EAC2FF",
  },

  /* ⚠ FLOATING STICKERS. x/y are PERCENTAGES OF THE SECTION, like els — a
     placement tuned at one window size has to hold at every other, which is
     the rule the tuners exist to keep.

     x/y place the sticker's CENTRE, so a size change grows it about its own
     middle rather than shifting it down and right.

     w is a percentage of the section's WIDTH, so the sticker scales with the
     page instead of staying a fixed pixel lump on a small screen.

     rise/drift are the float's travel in px and tilt its rotation; dur and
     delay set the period and stagger it so two stickers never move in
     lockstep. The motion itself is one keyframe in globals.css.

     ⚠ `rotate` IS THE RESTING ANGLE AND IT LIVES ON THE WRAPPER, not the
     image. The float keyframe writes `rotate()` on the image every frame, so
     a static angle set there is overwritten immediately — it has to sit on
     the element the animation does not touch. `tilt` is the float's own
     rocking about whatever angle this sets.

     ⚠ z IS ABOUT THE CANVAS. Scene.tsx's wrapper is z-10, so anything above
     that paints IN FRONT of the phone and anything below it BEHIND. The
     balloons are 20 and sit in front at the phone's foot; the padlock is 5
     and tucks behind the model at its top right. */
  stickers: [
    {
      name: "balloons",
      src: "/images/sticker-balloons.webp",
      alt: "",
      x: 35.5,
      y: 88.5,
      w: 13.5,
      rise: 16,
      drift: 9,
      tilt: "2.2deg",
      rotate: "-7deg",
      dur: "11s",
      delay: "-3s",
      z: 20,
    },
    {
      name: "lock",
      src: "/images/sticker-lock.webp",
      alt: "",
      x: 66,
      y: 22,
      w: 11.5,
      rise: 13,
      drift: 7,
      tilt: "1.8deg",
      /* ⚠ A DIFFERENT PERIOD FROM THE BALLOONS, not a rounder number. At
         11s and 9s the two would meet every 99s; the odd value keeps them
         from ever syncing up into one shared beat, which is the thing that
         makes a pair of floats read as a single animation. The negative
         delay also starts it mid-cycle, so they are not aligned on load. */
      dur: "8.5s",
      delay: "-5s",
      rotate: "9deg",
      /* ⚠ BEHIND THE PHONE — Kez's. Scene.tsx's canvas wrapper is z-10, so
         anything under that paints behind the model and anything over it in
         front. 5, not 0: the ground is -z-20 and a 0 would still clear it,
         but leaving a gap above the ground means a sticker can later be
         slipped between the two without renumbering this one. */
      z: 5,
    },
  ],
};

/* ⚠ A PAIR IS A `clamp()`, NOT A LERP BETWEEN THE ENDS — and css already
   does this, so it is a css `clamp()` and not a resize listener. Solve the
   preferred line through (390, min) and (1440, max) the way the tokens do,
   then let clamp hold the floor and the ceiling. Interpolating linearly in js
   was 8px out at 768: correct at both design widths and wrong in between,
   which is the dangerous kind of wrong. */
const fluid = ([min, max]: number[]) => {
  const m = ((max - min) / (1440 - 390)) * 100; /* vw coefficient */
  const b = min - (m * 390) / 100; /* px intercept */
  return `clamp(${min}px, ${b.toFixed(2)}px + ${m.toFixed(3)}vw, ${max}px)`;
};

/* ⚠ THE HEADLINE DOES NOT USE `fluid`. Its css is the one session 4 wrote —
   clamp(3.25rem, 1.14rem + 5.4vw, 9rem) — and that vw term is STEEPER than
   the line through (390, 52) and (1440, 96), so between the ends it sits
   BELOW it: 59.7px at 768, not 67.8. /hero-tuner states the same formula
   (`headClamp`), so this is what the arrangement was tuned against. The
   min/max in HERO are that clamp solved at the two design widths; they are
   the ceiling and floor, not the line. */
const headSize = (min: number, max: number) =>
  `clamp(${min}px, 1.14rem + 5.4vw, ${max}px)`;

/* ⚠ HERO.phone IS GROUPED FOR READING; PhoneTune IS FLAT. Flattened here
   rather than reshaping either side: the tuner prints the grouped block and
   <Phone> wants one object of dials.

   ⚠ AND IT IS PASSED EXPLICITLY, NOT LEFT TO PHONE_TUNE's DEFAULT.
   Phone.tsx still holds session 3's pose — rotation [-18, 159, 6], fit 0.72,
   floatHz 0.4 — and this config is the re-tune: [-6.3, 156.9, 5.7], fit 0.71,
   floatHz 0.2, plus a position offset it has no default for. Mounting
   <SceneMount /> bare renders the OLD angles, silently and without an error,
   which is the whole reason this prop exists. */
const PHONE: PhoneTune = {
  rotX: HERO.phone.rotation[0],
  rotY: HERO.phone.rotation[1],
  rotZ: HERO.phone.rotation[2],
  posX: HERO.phone.position[0],
  posY: HERO.phone.position[1],
  posZ: HERO.phone.position[2],
  fit: HERO.phone.fit,
  ...HERO.phone.entrance,
  ...HERO.phone.idle,
  ...HERO.phone.parallax,
};

export default function Hero() {
  const { nav, headline: h } = HERO;

  return (
    <Section id="hero" bleed>
      {/* ⚠ THE GROUND IS AN INLINE STYLE, NOT A TAILWIND CLASS. `bg-[${...}]`
          with an interpolated value generates NOTHING — Tailwind scans source
          text and never evaluates it, so the class silently does not exist.
          It rides on an absolute div rather than a `style` prop on <Section>,
          which has none and already uses style for its own minBlockSize. */}
      <div className="absolute inset-0 -z-20" style={{ background: HERO.bg }} />
      {/*
        the 3D phone. The canvas is absolute and belongs to THIS section — it
        is not mounted in page.tsx, so it cannot ride down the page over
        section two's cards (see docs/HERO.md).

        Its wrapper in Scene.tsx is z-10, so the nav, headline and elements
        are z-20 to paint above it, and the ground is -z-20 to stay behind.

        ⚠ <PhoneBox>, the grey stand-in, is still in the repo and is what
        /hero-tuner shows by default — WebGL every frame makes the stage heavy
        to lay out against. Swap it back in here the same way if that is
        wanted while designing.
      */}
      <SceneMount tune={PHONE} camZ={HERO.phone.camera.z} fov={HERO.phone.camera.fov} />

      {/*
        nav. ⚠ ABSOLUTE, NOT IN FLOW. It was `pt-(--space-m)` with the bar in
        flow; the tuned y is 4.8 -> 10.8px, well above --space-m's 24 -> 30, so
        a flow margin cannot place it. `relative` is load-bearing: the `in:
        "nav"` elements are absolute with % x/y and resolve against this bar.
      */}
      {nav.show && (
        <nav
          aria-label="Main"
          className="absolute z-20"
          style={{
            left: fluid(nav.inset),
            right: fluid(nav.inset),
            top: fluid(nav.y),
            height: fluid(nav.h),
            borderRadius: `${nav.radius}px`,
            background: nav.fill,
          }}
        >
          {HERO.els.map((el, i) => (el.in === "nav" ? <PriceEl key={i} el={el} /> : null))}

          {/* ⚠ THE ROLLER. Three cells — wordmark, ghost, wordmark — and the
              track travels exactly two of them, landing on a cell identical
              to the first. That is what makes the loop seamless: the state at
              100% IS the state at 0%, so there is no reset to see. Two cells
              would have to jump a full cell to restart and it would show
              every pass.

              ⚠ THE CLIP IS ONE CELL TALL AND CLIPS VERTICALLY ONLY. The faces
              are not hidden by opacity — they are physically outside the
              window. An opacity cross-fade would show both at once through
              each other, which is the thing that reads as cheap here. The
              horizontal axis stays visible so the ghost's alpha is not cut
              into a rectangle; see the wrapper below.

              ⚠ THE HEIGHTS ARE EXPLICIT AND IDENTICAL, in px from `cell`. If
              a cell could size itself to its own content the three would
              differ — a line of Megion and a square video are not the same
              height — and the 33.3333% travel would land mid-cell. Equal
              cells are what the percentages depend on.

              aria-label carries the wordmark so the nav still announces one
              name; the cells are aria-hidden so it is not read three times. */}
          <div
            aria-label={HERO.wordmark.text}
            role="img"
            /* ⚠ CLIPPED ON ONE AXIS ONLY. `overflow-hidden` clips BOTH, and
               the vertical clip is the only one the roll needs — the
               horizontal one was cutting the ghost's alpha into a hard
               rectangle, which reads as a box around it even though nothing
               paints a background here.

               `overflow-y: clip` + `overflow-x: visible` is the pair that
               does this. It has to be `clip`, not `hidden`: `hidden` on one
               axis forces the other to `auto` per the CSS overflow spec, so
               the combination silently becomes a scroll container and clips
               anyway. `clip` carries no such rule. */
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${HERO.wordmark.x}%`,
              top: `${HERO.wordmark.y}%`,
              height: `${HERO.wordmark.cell}px`,
              overflowY: "clip",
              overflowX: "visible",
            }}
          >
            <div
              className="animate-wordmark"
              style={{ "--roll-dur": HERO.wordmark.dur } as React.CSSProperties}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="flex items-center justify-center"
                  style={{ height: `${HERO.wordmark.cell}px` }}
                >
                  {i === 1 ? (
                    <video
                      src={HERO.wordmark.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      /* ⚠ TRANSPARENT VP9, the same path the card videos take.
                         The source gif was 480px and 953KB on an opaque-looking
                         black backdrop that was actually already alpha; as webm
                         at 240px it is 46KB and the alpha survives (verified by
                         decoding a frame to RGBA — ffprobe reports yuv420p on a
                         transparent VP9 file and cannot be trusted here). */
                      className="block h-full w-auto max-w-none"
                      style={{
                        height: `${HERO.wordmark.ghost}px`,
                        /* ⚠ SCALED, NOT TALLER. A bigger `height` would push
                           the ghost past its cell and into the wordmark's,
                           where it shows through during the hold. A scale
                           grows it about its own centre; the vertical clip
                           still cuts it at the cell edge, so it can read
                           larger than the bar while staying in its own cell.
                           The nudge keeps the wordmark cells untouched. */
                        transform: `translateY(${HERO.wordmark.ghostY ?? 0}px) scale(${HERO.wordmark.ghostScale ?? 1})`,
                      }}
                    />
                  ) : (
                    <span
                      className="font-display whitespace-nowrap"
                      style={{
                        fontSize: `${HERO.wordmark.size}px`,
                        color: HERO.wordmark.color,
                      }}
                    >
                      {HERO.wordmark.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/*
        headline. Three stacked spans — the breaks are the design, not
        wrapping. ⚠ TOP-LEFT ANCHORED, like the tuner: the tuned y IS the top
        of the block, so no centring transform.
      */}
      {h.show && (
        <h1
          className="absolute z-20 m-0 font-display uppercase"
          style={{
            left: fluid(h.x),
            top: fluid(h.y),
            color: h.color,
            fontSize: headSize(h.min, h.max),
            lineHeight: h.leading,
          }}
        >
          {h.lines.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </h1>
      )}

      {/* stage-level elements. the nav's own are rendered inside it above. */}
      {HERO.els.map((el, i) => (el.in === "nav" ? null : <PriceEl key={i} el={el} />))}

      {/* ⚠ THE STICKERS FLOAT, AND IT IS CSS, NOT GSAP. GSAP is on this page
          and section two uses it, but this is a constant-speed loop that reads
          nothing and has no controls — the same reasoning the testimonial
          marquee is written down with. A CSS animation runs on the compositor
          with no mount, no teardown and no ScrollTrigger refresh, so it cannot
          fall out of step with the 3D canvas sitting right behind it.

          ⚠ THE WRAPPER IS POSITIONED, THE IMAGE IS ANIMATED. Two elements, so
          the float's transform cannot clobber the centring one — putting both
          on one element means the keyframe's `translate3d(0,0,0)` at 0% wipes
          the `-50%, -50%` and the sticker jumps to its own corner on the first
          frame. This is the same split the FAQ pills use for the shove and the
          expand.

          `pointer-events-none` so a sticker over the phone never eats a drag,
          and `aria-hidden` because they are decoration. */}
      {HERO.stickers?.map((st) => (
        <div
          key={st.name}
          aria-hidden="true"
          className="pointer-events-none absolute"
          /* ⚠ ONE transform, STATED IN ORDER. The centring was
             `-translate-x-1/2 -translate-y-1/2` as classes; adding a rotation
             as a third class leaves the order to Tailwind's, and a rotate
             applied before the centring swings the sticker around the
             section's origin instead of its own middle. Written out, it
             translates first and then rotates about its own centre. */
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.w}%`,
            zIndex: st.z,
            transform: `translate(-50%, -50%) rotate(${st.rotate ?? "0deg"})`,
          }}
        >
          <img
            src={st.src}
            alt={st.alt}
            decoding="async"
            className="animate-sticker block h-auto w-full max-w-none select-none"
            style={{
              "--rise": `${st.rise}px`,
              "--drift": `${st.drift}px`,
              "--tilt": st.tilt,
              "--dur": st.dur,
              "--delay": st.delay,
            } as React.CSSProperties}
          />
        </div>
      ))}
    </Section>
  );
}
