import Section from "@/components/Section";
/* ⚠ KEPT THOUGH THE MOUNT IS COMMENTED OUT — see the note at the mount
   site. Re-adding the phone should be one line, not an import hunt. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SceneMount from "@/components/SceneMount";
import PriceEl from "@/components/PriceEl";
import HoverGhost from "@/components/HoverGhost";
import { NavMenuWithPanel } from "@/components/NavMenu";
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
    /* ⚠ THESE FIVE WERE TAILWIND CLASSES ON THE <h1> AND ARE DIALS NOW, so
       /hero-tuner can set them. The values here are exactly what the classes
       rendered — `font-display uppercase` at the face's own weight — so this
       is the same headline, stated rather than implied. */
    weight: 700,
    tracking: 0,
    align: "left" as "left" | "center" | "right",
    font: "display" as "display" | "sans",
    caps: true,
    italic: false,
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
    /* ⚠ THE WORDMARK IS NOT IN `els` ANY MORE — it is the roller below, and
       it is rendered by Hero itself rather than by <PriceEl>. Putting a
       three-cell animated track behind one `kind: "text"` would mean teaching
       PriceEl about it, and PriceEl is a SHARED FILE that Pricing also uses.
       Its placement lives in `wordmark` on HERO instead. */
    { name: "text 2", kind: "text", text: "Display any balance on a pixel-perfect Phantom Wallet, Trust Wallet, Ledger, Exodus or Bank app interface. Live prices, custom tokens, push notifications — built purely for entertainment.", x: 82, y: 50, w: 30, h: 0, size: 24, weight: 400, align: "center", color: "#3D065F" },
    { name: "box 3", kind: "box", text: "Login", x: 89.5, y: 67, w: 13, h: 6.4, size: 16, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
    { name: "box 4", kind: "box", text: "Buy", x: 74.5, y: 67, w: 13, h: 6.4, size: 16, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
  ] as El[],

  /* ⚠ THE HAMBURGER REPLACED THREE `kind: "line"` ELEMENTS. They were
     decorative aria-hidden divs at x 3.4 — they looked like a menu and did
     nothing: no button, no state, no keyboard path. The button lives in
     <NavMenu> because it needs both, and this is only its placement.

     x/y are percentages OF THE NAV, like an `in: "nav"` element.

     ⚠ THE PANEL IS EMPTY ON PURPOSE AND `panelHeight` IS WHAT GIVES IT A
     SHAPE. The mechanism animates `grid-template-rows: 0fr -> 1fr`, which
     resolves to the content's own height — with no content that is zero and
     nothing appears to happen. This is a stand-in so the motion can be judged
     first; when real content lands, drop it and the panel sizes itself. */
  menu: {
    x: 4.6,
    y: 50,
    panelHeight: 380,
    overlay: true,
  },

  /* ⚠ THE FLAT PHONE THAT REPLACED THE 3D ONE.

     x/y are percentages of the SECTION and place the image's CENTRE; `w` is
     a percentage of the section's width. Same units as `stickers`, so the
     two can be reasoned about together.

     ⚠ SEEDED FROM THE MODEL'S MEASURED BOX, THEN ENLARGED. The glb rendered
     at 26.09% wide, centred 52.17% / 58.53% — measured off a real render's
     alpha channel in session 10, not derived from the pose. This sits in the
     same place and is bigger, which is what was asked for. Those numbers are
     the baseline to come back to if it ever needs to match the model again.

     ⚠ `w` IS THE WIDTH OF THE PHONE ITSELF because the asset is cropped to
     it. The source png was a 1080x2160 canvas holding a 999x1251 phone; a
     re-export from an uncropped source would silently change what this
     number means. */
  art: {
    src: "/images/hero-phone.webp",
    x: 52.2,
    y: 58.5,
    w: 33,
    rotate: 0,
    show: true,
  },

  /* ⚠ THE NAV LINKS ARE A FLEX ROW, NOT FOUR ABSOLUTE SLOTS. They were
     three `kind: "text"` elements hand-placed at x 72.4 / 78.8 / 85.2 with a
     button at 94.1 — which cannot take a fourth label, and cannot guarantee
     anything at all about overlap: a percentage x places a word's CENTRE and
     knows nothing about how wide the word is, so "Features" and "Reviews"
     would collide at one width and gap at another.

     A row that lays itself out is the fix. The gap and type size are fluid so
     the group shrinks with the bar instead of running off it, and the whole
     row is hidden below `lg` where the hamburger takes over — which is what
     the hamburger was always for. */
  navLinks: {
    items: ["Features", "Pricing", "Buy", "Reviews"],
    cta: "Login",
    color: "#EAC2FF",
    ctaFill: "#EAC2FF",
    ctaColor: "#3D065F",
  },

  /* ⚠ THE NAV WORDMARK, AND THE GHOST THAT APPEARS ON HOVER. It was a
     three-cell roller that alternated the two forever; Kez dropped the
     animation, so the wordmark simply sits there and the ghost fades in
     beside it while the pointer is over it.

     x/y are percentages OF THE NAV, like an `in: "nav"` element, and the
     wordmark is centred on that point. `ghost` is the video's height in px
     and `ghostX`/`ghostY` place it relative to the wordmark's right edge, so
     it hangs off the end of the word rather than covering it.

     ⚠ NO CLIP ANY MORE, SO `ghost` IS NOT CAPPED BY A CELL. The roller's
     window was what forced the ghost to stay under ~54px and what made it
     bleed into the neighbouring cell when it did not. With the roller gone
     the ghost can be any size; the only limit is taste and the nav bar it
     overhangs. */
  wordmark: {
    text: "LARPZ WALLET",
    src: "/video/phantom.webm",
    x: 50.9,
    y: 50,
    size: 28.7,
    ghost: 54,
    ghostY: -5,
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

     ⚠ z IS ABOUT THE PHONE ART. `HERO.art` renders at z-10 — the same layer
     the 3D canvas used, so this scale did not change when the model came
     out — and anything above that paints IN FRONT of the phone, anything
     below it BEHIND. The balloons are 20 and sit in front at its foot; the
     padlock is 5 and tucks behind at its top right.

     ⚠ KEEP EVERY STICKER BELOW 30. The nav is z-30 so that the open dropdown
     covers the hero — a sticker at 30 or above would punch through the panel
     and float over it, which is the same bug the headline had at z-20 before
     the nav was raised. Nothing enforces this, so it is a rule, not a
     guarantee: 20 is the intended ceiling for "in front of the phone". */
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
      x: 68.5,
      /* ⚠ IT SITS BEHIND THE PHONE, so only what clears the top bezel reads.
         Lowering it hides more of it — that is the intent here, a deeper
         tuck, but it is also why y and w have to be judged together rather
         than one at a time. */
      y: 21.5,
      w: 14,
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
      /* ⚠ BEHIND THE PHONE. `HERO.art` renders at z-10, so under that is
         behind it and over it is in front — the same scale the 3D canvas
         used, which is why this number did not change when the model came
         out.

         5, not 0: the ground is -z-20, so a 0 would still clear it, but
         leaving a gap means another sticker can later be slipped between
         the two without renumbering this one. */
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
   which is the whole reason this prop exists.

   ⚠ UNUSED WHILE THE PHONE IS OUT OF THE HERO, AND KEPT DELIBERATELY. It
   is the re-tuned pose; deleting it would mean re-deriving those numbers from
   /hero-tuner to put the phone back. The lint disable is the cost of keeping
   it, and it is cheaper than losing the tune. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      {/* ⚠ THE 3D PHONE IS OUT OF THE HERO. NOTHING IS DELETED — the glb, the
          canvas, <Scene>, <Phone>, <SceneMount> and the whole `HERO.phone`
          block are all still here and still wired. Only the mount is gone, so
          putting it back is this one line:

            <SceneMount tune={PHONE} camZ={HERO.phone.camera.z} fov={HERO.phone.camera.fov} />

          ⚠ WHY IT CAME OUT: measured, the canvas is essentially all of the
          page's jank. Main-thread blocking over 15s on the same page —
          138ms without the canvas, 14,253ms with it, worst single stall
          7,734ms. The cause is the glb's 8 webp textures (2.3MB) decoding
          and uploading to the GPU on the main thread; Draco already runs in
          a worker, texture upload cannot. Fixing it properly means KTX2
          inside the glb, and that binary is @snvzyn's (CLAUDE.md) so it
          needs their sign-off.

          ⚠ /hero-tuner IS UNAFFECTED — it dropped the canvas already and
          tunes the flat layout. The glb still loads there only if something
          asks for it, which nothing now does. */}

      {/* ⚠ THE FLAT PHONE, STANDING IN FOR THE MODEL. A render at the same
          pose, so the hero keeps its subject at a fraction of the cost: 79KB
          of webp against 3.3MB of glb plus 2.3MB of textures decoded on the
          main thread.

          ⚠ THE SOURCE WAS CROPPED BEFORE IT GOT HERE. The png was a
          1080x2160 canvas with the phone sitting in the middle 999x1251 —
          477px of empty space above it and 432px below. Placed uncropped it
          would read as badly off-centre and far too small, and no amount of
          tuning x/y/w here would fix that, because the padding scales with
          the image. The committed webp is cropped to the phone itself, so
          `w` means the width of the PHONE.

          ⚠ z-10 PUTS IT WHERE THE CANVAS WAS, so the stickers' own z values
          still read correctly against it: the balloons at 20 are in front,
          the padlock at 5 is behind. That is the relationship the sticker
          config documents, and it survives the swap. */}
      {HERO.art?.show && (
        <img
          src={HERO.art.src}
          alt=""
          aria-hidden="true"
          /* eager + high priority: it is the hero's subject and above the
             fold, so lazy-loading it would just delay the LCP. */
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute z-10 h-auto max-w-none select-none"
          style={{
            left: `${HERO.art.x}%`,
            top: `${HERO.art.y}%`,
            width: `${HERO.art.w}%`,
            transform: `translate(-50%, -50%) rotate(${HERO.art.rotate ?? 0}deg)`,
          }}
        />
      )}

      {/*
        nav. ⚠ ABSOLUTE, NOT IN FLOW. It was `pt-(--space-m)` with the bar in
        flow; the tuned y is 4.8 -> 10.8px, well above --space-m's 24 -> 30, so
        a flow margin cannot place it. `relative` is load-bearing: the `in:
        "nav"` elements are absolute with % x/y and resolve against this bar.
      */}
      {nav.show && (
        <nav
          aria-label="Main"
          /* ⚠ z-30, NOT z-20 — IT HAS TO BEAT THE HEADLINE. The headline is
             also z-20 and comes later in source, so at equal z it painted
             over the open panel and the hero's type showed through it. The
             nav overlays the page when open, so it outranks the content. */
          className="absolute z-30"
          /* ⚠ NO BACKGROUND AND NO RADIUS HERE ANY MORE — <NavMenuWithPanel>
             paints the surface on its own layer so it can grow to meet the
             panel while this box stays exactly the size the `in: "nav"`
             elements resolve their percentages against. Putting a fill back
             here would draw a second, non-growing bar on top of it. */
          style={{
            left: fluid(nav.inset),
            right: fluid(nav.inset),
            top: fluid(nav.y),
            height: fluid(nav.h),
          }}
        >
          {HERO.els.map((el, i) => (el.in === "nav" ? <PriceEl key={i} el={el} /> : null))}

          {/* ⚠ A CLIENT COMPONENT, like <HoverGhost> and for the same reason:
              this section is a server component and the button needs state
              and handlers. The three lines it replaced needed neither, which
              is exactly why they were not a menu. */}
          {/* ⚠ THE ROW IS PINNED TO THE BAR'S RIGHT AND SIZES ITSELF. Right
              inset matches the wordmark's own breathing room; `flex` does the
              spacing so no label needs a coordinate and none can overlap
              another however long it gets.

              ⚠ HIDDEN BELOW lg, WHERE THE HAMBURGER TAKES OVER. Four links
              plus a button do not fit a 358px bar at any type size that is
              still readable, and squeezing them is what makes a nav break.
              That is the whole reason the burger exists. */}
          <div className="absolute top-1/2 right-[2.5%] hidden -translate-y-1/2 items-center gap-[clamp(14px,0.6rem+1.1vw,32px)] lg:flex">
            {HERO.navLinks.items.map((label) => (
              <a
                key={label}
                href="#"
                className="whitespace-nowrap no-underline opacity-90 transition-opacity duration-200 hover:opacity-100"
                style={{
                  color: HERO.navLinks.color,
                  fontSize: "clamp(14px, 0.6rem + 0.5vw, 20px)",
                }}
              >
                {label}
              </a>
            ))}
            <a
              href="#"
              /* the CTA. `leading-none` plus symmetric padding is what keeps
                 the pill's height tied to its own type rather than to the
                 line box, so it cannot grow taller than the bar. */
              className="whitespace-nowrap rounded-full px-[clamp(16px,0.7rem+1vw,30px)] py-[clamp(8px,0.3rem+0.5vw,13px)] leading-none font-semibold no-underline transition-opacity duration-200 hover:opacity-90"
              style={{
                background: HERO.navLinks.ctaFill,
                color: HERO.navLinks.ctaColor,
                fontSize: "clamp(14px, 0.6rem + 0.5vw, 19px)",
              }}
            >
              {HERO.navLinks.cta}
            </a>
          </div>

          <NavMenuWithPanel
            x={HERO.menu.x}
            y={HERO.menu.y}
            color={HERO.wordmark.color}
            fill={HERO.nav.fill}
            radius={HERO.nav.radius}
            panelHeight={HERO.menu.panelHeight}
            overlay={HERO.menu.overlay}
          >
            {HERO.els.map((el, i) => (el.in === "menu" ? <PriceEl key={i} el={el} /> : null))}
          </NavMenuWithPanel>

          {/* ⚠ A CLIENT COMPONENT, AND ONLY BECAUSE OF TWO HANDLERS. This
              section is a server component, so an onMouseEnter here is the
              "Event handlers cannot be passed to Client Component props"
              error. The fade itself is still pure CSS inside it — the
              handlers exist only to start and stop playback, which no
              `autoPlay` can do without decoding forever behind opacity:0. */}
          <HoverGhost
            text={HERO.wordmark.text}
            src={HERO.wordmark.src}
            size={HERO.wordmark.size}
            color={HERO.wordmark.color}
            ghost={HERO.wordmark.ghost}
            ghostY={HERO.wordmark.ghostY}
            x={HERO.wordmark.x}
            y={HERO.wordmark.y}
          />

        </nav>
      )}

      {/*
        headline. Three stacked spans — the breaks are the design, not
        wrapping. ⚠ TOP-LEFT ANCHORED, like the tuner: the tuned y IS the top
        of the block, so no centring transform.
      */}
      {h.show && (
        <h1
          className="absolute z-20 m-0"
          /* ⚠ THE FACE, CASE AND WEIGHT ARE STYLES NOW, NOT CLASSES. They
             were `font-display uppercase`; as classes they could not be
             tuned, and a template-literal Tailwind class generates no css at
             all (session 11), so a dial had to become a style rather than an
             interpolated class name. */
          style={{
            left: fluid(h.x),
            top: fluid(h.y),
            color: h.color,
            fontSize: headSize(h.min, h.max),
            lineHeight: h.leading,
            fontFamily: h.font === "display" ? "var(--font-display)" : undefined,
            fontWeight: h.weight,
            letterSpacing: h.tracking ? `${h.tracking}em` : undefined,
            textAlign: h.align,
            textTransform: h.caps ? "uppercase" : "none",
            fontStyle: h.italic ? "italic" : undefined,
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
      {HERO.els.map((el, i) => (el.in ? null : <PriceEl key={i} el={el} />))}

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
