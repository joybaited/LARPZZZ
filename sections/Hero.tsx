import Section from "@/components/Section";
/* ⚠ KEPT THOUGH THE MOUNT IS COMMENTED OUT — see the note at the mount
   site. Re-adding the phone should be one line, not an import hunt. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SceneMount from "@/components/SceneMount";
import PriceEl from "@/components/PriceEl";
import HoverGhost from "@/components/HoverGhost";
import { NavMenuWithPanel } from "@/components/NavMenu";
import PillButton from "@/components/PillButton";
import ImageTrail from "@/components/ImageTrail";
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
    { name: "text 2", kind: "text", text: "Display any balance on a pixel-perfect Phantom Wallet, Trust Wallet, Ledger, Exodus or Bank app interface. Live prices, custom tokens, push notifications — built purely for entertainment.", x: 82, y: 50, w: 30, h: 0, size: 24, weight: 400, align: "center", color: "#3D065F" },
    { name: "box 4", kind: "box", text: "Buy", btn: true, x: 74.5, y: 67, w: 13, h: 6.4, size: 19, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
    { name: "box 3", kind: "box", text: "Login", btn: true, x: 89.5, y: 67, w: 13, h: 6.4, size: 19, radius: 999, weight: 600, fill: "#3D065F", color: "#EAC2FF" },
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
  /* ⚠ THE CURSOR TRAIL. Codrops' Image Trail variant 3 (MIT) — the images
     glide after the pointer, then fade AND fall a full viewport height.
     `exclude` is the one dial that matters: any pointer over something
     matching it suppresses the trail, so it never fires on the nav or on a
     button. It is a selector rather than a box because the nav's dropdown
     changes height and a rectangle would be wrong the moment it opens.
     18 files, webp, ~212KB the lot. */
  trail: {
    images: Array.from({ length: 18 }, (_, i) => `/images/cursor/${String(i + 1).padStart(2, "0")}.webp`),
    size: 110,
    /* Exclude nav, buttons, and subtitle text (headline is allowed to be rendered over) */
    exclude: "nav, .hero-stage-container > *, a, button, [role='button'], .pill-btn, .hero-mobile-content > p",
  },

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
    ghost: 46,
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
      rotate: "-7deg",
      rise: 14,
      drift: 8,
      tilt: "2deg",
      dur: "10s",
      delay: "-3s",
      z: 20,
    },
    {
      name: "lock",
      src: "/images/sticker-lock.webp",
      alt: "",
      x: 68.5,
      y: 24,
      w: 14,
      rotate: "9deg",
      rise: 14,
      drift: 8,
      tilt: "2deg",
      dur: "10s",
      delay: "-3s",
      z: 5,
    },
    {
      name: "screenshot-2026-10-15-132320",
      src: "/images/sticker-screenshot-2026-10-15-132320.png",
      alt: "",
      x: 25.8,
      y: 110.3,
      w: 10,
      rotate: "0deg",
      rise: 14,
      drift: 8,
      tilt: "2deg",
      dur: "10s",
      delay: "-3s",
      z: 25,
    },
    {
      name: "screenshot-2026-10-15-132331",
      src: "/images/sticker-screenshot-2026-10-15-132331.png",
      alt: "",
      x: 75.9,
      y: 112.9,
      w: 12.3,
      rotate: "127deg",
      rise: 14,
      drift: 8,
      tilt: "2deg",
      dur: "10s",
      delay: "-3s",
      z: 25,
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

export default function Hero({ hideStickers = false }: { hideStickers?: boolean } = {}) {
  const { nav, headline: h } = HERO;
  const subtitleEl = HERO.els.find((e) => e.name === "text 2");

  return (
    <Section
      flush id="hero" bleed
      /* A little more ground below the hero before the next section starts.
         `flush` means it takes none of the shared foot space, so it is set
         here. Padding, not a spacer div: the ground is an absolute `inset-0`
         layer, so it grows with the section and the extra space is the same
         colour for free. */
      className="min-h-[100svh] pb-[clamp(32px,2rem+3vw,80px)] max-lg:[--phone-w:clamp(260px,65vw,420px)] lg:[--phone-w:33%] flex flex-col overflow-x-hidden max-lg:overflow-y-visible lg:overflow-hidden">
      {/* ⚠ THE GROUND IS AN INLINE STYLE, NOT A TAILWIND CLASS. `bg-[${...}]`
          with an interpolated value generates NOTHING — Tailwind scans source
          text and never evaluates it, so the class silently does not exist.
          It rides on an absolute div rather than a `style` prop on <Section>,
          which has none and already uses style for its own minBlockSize. */}
      <div className="absolute inset-0 -z-20" style={{ background: HERO.bg }} />

      {/* ⚠ THE TRAIL IS z-[1]: ABOVE THE GROUND (-z-20), BELOW EVERYTHING
          ELSE. The phone art is z-10, the headline z-20 and the nav z-30, so
          images pass behind all three rather than over the type.
          `exclude` is a selector, not a rectangle — see the component. */}
      <ImageTrail images={HERO.trail.images} size={HERO.trail.size} exclude={HERO.trail.exclude} />
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

      {/* ── 120REM CANVAS STAGE ──────────────────────────────────────────────────────────
          Anchors nav, desktop stage, and mobile orchestrator within 120rem ceiling */}
      <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[var(--canvas-max-width,120rem)]">


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
            className="pointer-events-auto absolute z-30"
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
            {/* ⚠ z-20 SO THE DIM OVERLAY DOES NOT PAINT OVER THE CTA. The
                overlay is `fixed inset-0 z-0` INSIDE this nav; this row had
                `z-index: auto`, so source order put the overlay on top and the
                Login button visibly darkened as the panel opened. Measured: the
                button's own opacity stayed 1 the whole time and
                elementFromPoint at its centre returned the overlay — it was
                never dimmed, it was covered.

                The row has to beat the overlay's 0 but stay under the panel,
                which is why this is 20 and not something larger. */}
            <div className="absolute top-1/2 right-[2.5%] z-20 hidden -translate-y-1/2 items-center gap-[clamp(14px,0.6rem+1.1vw,32px)] lg:flex">
              {/* ⚠ THE LINKS LEAVE THE BAR WHEN THE PANEL OPENS, THE CTA DOES
                  NOT. They are the same four labels the panel lists, so with
                  the panel open the bar would show them twice — and the panel
                  is where they belong at that point. `nav-links` is matched
                  from globals.css off the same open/closed attribute the panel
                  uses, so the two cannot fall out of step.

                  ⚠ THEY FADE AND STOP TAKING CLICKS, BUT KEEP THEIR SPACE —
                  `visibility`, not `display`. Removing them from layout would
                  let the CTA slide left while the bar is mid-animation, which
                  reads as the nav collapsing rather than the panel opening.

                  Osmo does not need any of this: their top bar carries NO
                  links at all (checked their markup — hamburger, logo and
                  buttons only) and all eight live inside the panel. Ours shows
                  four in the bar, so ours has something to hide. */}
              {HERO.navLinks.items.map((label, i) => (
                <a
                  key={label}
                  href={label === "Features" ? "#features" : label === "Pricing" || label === "Buy" ? "#pricing" : label === "Reviews" ? "#testimonials" : "#"}
                  /* ⚠ THE CLASS GOES ON EACH LINK, NOT ON A WRAPPER. A wrapper
                     would need `display: contents` to leave the flex row's
                     spacing alone, and a contents box has nothing to fade —
                     opacity on it does nothing at all. */
                  className="nav-link whitespace-nowrap no-underline transition-opacity hover:opacity-100"
                  style={{
                    color: HERO.navLinks.color,
                    fontSize: "clamp(14px, 0.6rem + 0.5vw, 20px)",
                    /* a short stagger so they leave as a sweep rather than a
                       block. Reversed on the way back in by the css. */
                    "--i": i,
                  } as React.CSSProperties}
                >
                  {label}
                </a>
              ))}
              {/* the CTA. `leading-none` plus symmetric padding is what keeps
                  the pill's height tied to its own type rather than to the
                  line box, so it cannot grow taller than the bar. */}
              <PillButton
                href="/login"
                fill={HERO.navLinks.ctaFill}
                color={HERO.navLinks.ctaColor}
                className="whitespace-nowrap px-[clamp(16px,0.6rem+0.7vw,24px)] py-[clamp(7px,0.25rem+0.35vw,10px)] leading-none font-semibold"
                style={{ fontSize: "clamp(13px, 0.55rem + 0.45vw, 17px)" }}
              >
                {HERO.navLinks.cta}
              </PillButton>
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
              {/* ⚠ THE SAME FOUR LABELS THE BAR SHOWS, FROM THE SAME CONFIG.
                  One list, rendered in two places, so they cannot drift — the
                  failure the tuners in this repo keep hitting. The bar's copy
                  fades out as these fade in, so only one set is ever readable.

                  Laid out as a list rather than placed with coordinates: the
                  panel is a container, not a canvas, and a stacked list
                  reflows at any width without a second set of numbers. */}
              {/* ⚠ THE LIST KEEPS ITS OWN PADDING AND ITS OWN HEIGHT. It was
                  briefly wrapped in a padded row with the media box as a
                  sibling, which made the BOX the tallest thing in the panel —
                  and the surface behind the bar measures the panel and grows to
                  cover it, so the open nav turned into a dark slab. The links
                  decide the panel's height, exactly as before; the box is
                  overlaid on top of that box rather than added to it. */}
              <div className="relative">
                <ul className="m-0 flex list-none flex-col gap-[clamp(6px,0.3rem+0.6vw,16px)] p-[clamp(20px,1rem+2vw,48px)]">
                  {HERO.navLinks.items.map((label, i) => (
                    <li key={label}>
                      <a
                        href={label === "Features" ? "#features" : label === "Pricing" || label === "Buy" ? "#pricing" : label === "Reviews" ? "#testimonials" : "#"}
                        className="panel-link inline-block no-underline"
                        style={{
                          color: HERO.navLinks.color,
                          fontFamily: "var(--font-display)",
                          textTransform: "uppercase",
                          fontSize: "clamp(28px, 1.2rem + 2.6vw, 56px)",
                          lineHeight: 1.05,
                          "--i": i,
                        } as React.CSSProperties}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* ── THE MEDIA BOX ────────────────────────────────────────
                    Placeholder for a video player. Measured off osmo's open nav
                    at 1440: their right column `is--ad` is 397x437 (0.909) with
                    a 16px radius, holding a 238x149 (16:10) preview. Ours keeps
                    the 0.909 card and the 16:10 well inside it.

                    ⚠ ABSOLUTE, SO IT ADDS NO HEIGHT. In flow it is the tallest
                    child and the panel — and the dark surface with it — grows
                    to its 437px. Out of flow it sits inside the height the
                    links already set, which is what keeps the open nav the size
                    it has always been. `inset-y` + `aspect` means the links,
                    not a number here, decide how big it is.

                    Centred with left-1/2 + -translate-x-1/2 rather than a grid
                    column: nothing else shares its line, so there is no track
                    to balance against. Hidden below md — at 390 the panel is
                    the link list and a card over it would cover them. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-[clamp(20px,1rem+2vw,48px)] left-1/2 hidden -translate-x-1/2 md:flex aspect-[397/437] items-center justify-center rounded-[16px] border-2 border-dashed p-[clamp(12px,1.5vw,28px)]"
                  style={{ borderColor: `color-mix(in srgb, ${HERO.navLinks.color} 40%, transparent)` }}
                >
                  <div
                    className="flex aspect-[16/10] w-full items-center justify-center rounded-[8px] border border-dashed"
                    style={{
                      borderColor: `color-mix(in srgb, ${HERO.navLinks.color} 30%, transparent)`,
                      color: `color-mix(in srgb, ${HERO.navLinks.color} 55%, transparent)`,
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "clamp(10px, 0.6vw, 12px)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    VIDEO
                  </div>
                </div>
              </div>

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
        {/* ── DESKTOP STAGE (>= 1024px) ────────────────────────────────────────────────
            Desktop layout orchestrator: luxury 120rem canvas with floating centered phone,
            left-aligned headline, right-anchored content column, and desktop sticker field. */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {HERO.art?.show && (
            <img
              src={HERO.art.src}
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="pointer-events-none absolute z-10 h-auto max-w-none select-none"
              style={{
                left: `${HERO.art.x}%`,
                top: `${HERO.art.y}%`,
                width: "var(--phone-w, 33%)",
                transform: `translate(-50%, -50%) rotate(${HERO.art.rotate ?? 0}deg)`,
              }}
            />
          )}

          {/* Headline */}
          {h.show && (
            <h1
              className="hero-headline pointer-events-auto absolute z-[2] m-0"
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

          {/* stage-level elements. Desktop: rendered at tuned coordinates via PriceEl */}
          <div className="hero-stage-container pointer-events-none absolute inset-0 z-20 [&>*]:pointer-events-auto">
            {HERO.els.map((el, i) => (el.in ? null : <PriceEl key={i} el={el} />))}
          </div>

          {/* Floating Stickers Layer (Desktop) */}
          {!hideStickers && HERO.stickers?.map((st) => (
            <div
              key={st.name}
              aria-hidden="true"
              className="pointer-events-none absolute"
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
        </div>
      </div>

      {/* ── MOBILE / TABLET ORCHESTRATOR (< 1024px) ─────────────────────────────────
          Textbook decoupled sequential vertical layout per SCALPEL-FE-002 & FE-004.
          Guarantees zero element collision across any aspect ratio or squished window. */}
      <div className="relative z-20 mx-auto flex w-full max-w-xl flex-col items-center px-4 pt-[clamp(72px,12vh,96px)] pb-10 text-center lg:hidden">
        {/* 1. Mobile Headline */}
        <h1
          className="hero-headline m-0 text-center uppercase tracking-tight"
          style={{
            color: h.color,
            fontSize: "clamp(34px, 8.5vw, 56px)",
            lineHeight: 0.94,
            fontFamily: h.font === "display" ? "var(--font-display)" : undefined,
            fontWeight: h.weight,
          }}
        >
          {h.lines.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </h1>

        {/* 2. Mobile Phone Artwork with Pinned Stickers */}
        <div className="relative my-[clamp(14px,2.5vh,28px)] flex w-full max-w-[min(82vw,350px)] items-center justify-center">
          <img
            src={HERO.art.src}
            alt="Larpz Wallet Preview"
            className="pointer-events-none h-auto w-full max-h-[44vh] select-none object-contain drop-shadow-2xl"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {/* Lock sticker - anchored to top right of phone */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 -right-2 w-[28%] z-[5]"
            style={{ transform: "rotate(9deg)" }}
          >
            <img
              src="/images/sticker-lock.webp"
              alt=""
              decoding="async"
              className="animate-sticker block h-auto w-full select-none"
              style={{
                "--rise": "10px",
                "--drift": "6px",
                "--tilt": "2deg",
                "--dur": "10s",
                "--delay": "-3s",
              } as React.CSSProperties}
            />
          </div>

          {/* Balloons sticker - anchored to bottom left of phone */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 -left-3 w-[26%] z-[20]"
            style={{ transform: "rotate(-7deg)" }}
          >
            <img
              src="/images/sticker-balloons.webp"
              alt=""
              decoding="async"
              className="animate-sticker block h-auto w-full select-none"
              style={{
                "--rise": "12px",
                "--drift": "6px",
                "--tilt": "2deg",
                "--dur": "10s",
                "--delay": "-2s",
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* 3. Subtitle Copy */}
        <p className="m-0 max-w-[34ch] font-sans text-[clamp(14px,3.6vw,17px)] leading-[1.4] text-[#3D065F]">
          {subtitleEl?.text ??
            "Display any balance on a pixel-perfect Phantom Wallet, Trust Wallet, Ledger, Exodus or Bank app interface. Live prices, custom tokens, push notifications — built purely for entertainment."}
        </p>

        {/* 4. Action Buttons (Buy & Login) */}
        <div className="mt-5 flex items-center justify-center gap-[clamp(14px,3vw,24px)]">
          <PillButton
            href="#pricing"
            fill="#3D065F"
            color="#EAC2FF"
            className="h-[48px] min-w-[130px] px-7 text-[16px] font-semibold leading-none shadow-sm"
          >
            Buy
          </PillButton>
          <PillButton
            href="/login"
            fill="#3D065F"
            color="#EAC2FF"
            className="h-[48px] min-w-[130px] px-7 text-[16px] font-semibold leading-none shadow-sm"
          >
            Login
          </PillButton>
        </div>
      </div>
    </Section>
  );
}
