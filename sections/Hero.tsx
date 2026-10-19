import Section from "@/components/Section";
/* ⚠ KEPT THOUGH THE MOUNT IS COMMENTED OUT — see the note at the mount
   site. Re-adding the phone should be one line, not an import hunt. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SceneMount from "@/components/SceneMount";
import PriceEl from "@/components/PriceEl";
import HoverGhost from "@/components/HoverGhost";
import { NavMenuWithPanel } from "@/components/NavMenu";
import PillButton from "@/components/PillButton";
import { LEGAL, SECTION_LINKS, SOCIALS, TELEGRAM, UPDATES } from "@/lib/site";
import ImageTrail from "@/components/ImageTrail";
import PixelatedImageReveal from "@/components/PixelatedImageReveal";
import { StickerLayer, type Sticker } from "@/components/Stickers";
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
    /* 56.5, not the model's 58.5: the step phones are height-bound at 85% of
       the hero, and 58.5 would run them off the bottom. */
    y: 54,
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

  /* ⚠ THE OPEN PANEL'S CONTENT. Notes and card copy are from copy.md.
     ⚠ THE SOCIAL hrefs ARE PLACEHOLDERS — no social URL exists anywhere in
     the repo yet. Fill these in; nothing else needs to change. */
  panel: {
    card: { eyebrow: "Plans from", price: "$14", detail: "All six apps, iOS & Android, no seed phrase." },
    /* the links, updates, socials and legal line are NOT here — they live
       in lib/site.ts, shared with the footer, so each is set once. */
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

};

/* ⚠ A PAIR IS A `clamp()`, NOT A LERP BETWEEN THE ENDS — and css already
   does this, so it is a css `clamp()` and not a resize listener. Solve the
   preferred line through (390, min) and (1440, max) the way the tokens do,
   then let clamp hold the floor and the ceiling. Interpolating linearly in js
   was 8px out at 768: correct at both design widths and wrong in between,
   which is the dangerous kind of wrong. */
/* THE HERO'S PHONE: the six step screens and the pixel transition between
   them, moved here from How it works (which now shows the old hero phone,
   static). Same dials it had there. HERO.art.src is still the old phone — the
   open nav's card crops it into its corner. */
const STEP_PHONES = ["a", "b", "c", "d", "e", "f"].map((k) => ({ src: `/images/steps-phone-${k}.webp`, alt: "" }));
const HeroSteps = ({ className = "" }: { className?: string }) => (
  <PixelatedImageReveal
    images={STEP_PHONES}
    grid={26}
    pattern="wave"
    waveRows={3}
    jitterRows={1.1}
    gap={1.5}
    glow="0 0 5px rgba(234, 194, 255, 0.8), 0 0 12px rgba(234, 194, 255, 0.35)"
    stepDuration={1.1}
    auto
    loopEvery={2800}
    maskToArt
    fit="contain"
    square={false}
    className={`!rounded-none text-violet ${className}`}
  />
);

const fluid = ([min, max]: number[]) => {
  const m = ((max - min) / (1440 - 390)) * 100; /* vw coefficient */
  const b = min - (m * 390) / 100; /* px intercept */
  /* ⚠ THE CEILING IS IN rem SO IT KEEPS RISING ABOVE 1440. The line is
     solved through the two design widths and then clamped — but a px
     ceiling freezes the arrangement there, and the STAGE does not freeze:
     measured at 2560 the headline still sat at 102px,265px, 96px type, on a
     2560-wide stage, i.e. crushed into the top-left corner with the rest of
     the screen empty. That is the "breaks on a big screen" report.
     `max/16` rem rides the root clamp in globals.css (16px up to 36px), so
     above 1440 every hero coordinate grows with the page instead of
     stopping. At or below 1440 the root is <=16px, so this is the SAME
     number it always was — the ceiling only lifts on screens bigger than
     the design. */
  return `clamp(${min}px, ${b.toFixed(2)}px + ${m.toFixed(3)}vw, ${(max / 16).toFixed(4)}rem)`;
};

/* ⚠ THE HEADLINE DOES NOT USE `fluid`. Its css is the one session 4 wrote —
   clamp(3.25rem, 1.14rem + 5.4vw, 9rem) — and that vw term is STEEPER than
   the line through (390, 52) and (1440, 96), so between the ends it sits
   BELOW it: 59.7px at 768, not 67.8. /hero-tuner states the same formula
   (`headClamp`), so this is what the arrangement was tuned against. The
   min/max in HERO are that clamp solved at the two design widths; they are
   the ceiling and floor, not the line. */
const headSize = (min: number, max: number) =>
  /* same rem ceiling as `fluid`, for the same reason: 9rem of a 16px root is
     the 96px it has always been, and it keeps growing past 1440. */
  `clamp(${min}px, 1.14rem + 5.4vw, ${(max / 16).toFixed(4)}rem)`;

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

/* Free-floating decoration for this section. Stage-anchored: x/y are
   percentages of the stage box below, which is the same box /sticker-tuner
   measures. Tune in /sticker-tuner and paste the block back here. */
export const HERO_STICKERS: Sticker[] = [
  {
    name: "pop-16",
    src: "/images/stickers/pop-16.webp",
    alt: "",
    x: 18,
    y: 0,
    w: 16.5,
    rotate: "-9deg",
    z: 25,
    anchor: "phone",
    cap: 148,
  },
  {
    name: "squiggle-20",
    src: "/images/stickers/squiggle-20.webp",
    alt: "",
    x: 31.7,
    y: 52.5,
    w: 7.8,
    rotate: "18deg",
    z: 1,
    cap: 148,
  },
];

export default function Hero({
  children,
  stickers = HERO_STICKERS,
  hideStickers,
  stageRef,
  tuning,
}: {
  children?: React.ReactNode;
  stickers?: Sticker[];
  hideStickers?: boolean;
  stageRef?: React.Ref<HTMLDivElement>;
  tuning?: boolean;
} = {}) {
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
      /* ⚠ THE BOTTOM PADDING IS INSIDE THE VIEWPORT HEIGHT, NOT ADDED TO IT.
         `min-h-[100svh]` with `pb-…` on the SAME element makes the box
         100svh + the padding, so the hero was taller than the screen at every
         mobile size — measured 770px on a 730px viewport, 796 on 770, and
         1023x700 overflowed by 48px. `box-sizing: border-box` does not help:
         it governs `height`, not `min-height`. Subtracting the pad from the
         min-height is what makes the two agree.
         Same trap Section.tsx documents for --section-fill. */
      className="min-h-[calc(100svh-var(--hero-pb))] [--hero-pb:clamp(16px,4vh,80px)] pb-[var(--hero-pb)] max-lg:[--phone-w:clamp(260px,65vw,420px)] lg:[--phone-w:33%] flex flex-col overflow-x-hidden max-lg:overflow-y-visible lg:overflow-hidden">
      {/* ⚠ THE GROUND IS AN INLINE STYLE, NOT A TAILWIND CLASS. `bg-[${...}]`
          with an interpolated value generates NOTHING — Tailwind scans source
          text and never evaluates it, so the class silently does not exist.
          It rides on an absolute div rather than a `style` prop on <Section>,
          which has none and already uses style for its own minBlockSize. */}
      {/* ⚠ THE GROUND IS TRANSPARENT NOW — <html> PAINTS IT. The hero is the
          first entry in PageTint's palette, so the root already carries
          HERO.bg before a scroll happens; a second opaque layer here would
          cover the tween and the hero would be the one section that never
          changed colour. The div stays because the trail and the stickers are
          positioned against it. */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-[#f3e2ff]">
        <img
          src="/images/herotextre/herotext.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-30 select-none"
        />
      </div>

      {/* ⚠ THE SEAM INTO HOW IT WORKS. Cross-fades to How It Works ground colour (#d9a3f7). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[clamp(80px,14vh,200px)]"
        style={{ background: "linear-gradient(to bottom, transparent, #d9a3f7)" }}
      />

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
      <div
        ref={stageRef}
        className={`pointer-events-none absolute inset-0 mx-auto w-full max-w-[var(--canvas-max-width,120rem)] ${
          tuning ? "pointer-events-auto" : ""
        }`}
      >


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
            {HERO.els.map((el, i) => (el.in === "nav" ? <PriceEl key={i} el={el} fluidText /> : null))}

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
            <div className="absolute top-1/2 right-[2.5%] z-20 hidden -translate-y-1/2 items-center gap-[clamp(14px,0.2rem+1.6vw,3rem)] lg:flex">
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
                  /* ⚠ THE ROLL: the label slides up out of a one-line window
                     and its copy slides in from below — the same move the
                     Login pill makes, so the bar reads as one family. The
                     window is `overflow-hidden` on the inner span, NOT on the
                     link, so the link's own opacity fade (.nav-link) still
                     works. leading 1.3 so the window clears "g" and "y".
                     ⚠ THE SIZE CEILING IS rem, NOT px. It was 20px, so from
                     1920 up the links froze while the bar kept growing — 564px
                     of dead gap beside the wordmark at 2560. At 1024 this is
                     still 14px, where the gap to the wordmark is only 36px. */
                  className="nav-link group/roll whitespace-nowrap no-underline"
                  style={{
                    color: HERO.navLinks.color,
                    fontSize: "clamp(14px, 0.35rem + 0.85vw, 1.5rem)",
                    /* a short stagger so they leave as a sweep rather than a
                       block. Reversed on the way back in by the css. */
                    "--i": i,
                  } as React.CSSProperties}
                >
                  <span className="relative block h-[1.3em] overflow-hidden leading-[1.3]">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/roll:-translate-y-full group-focus-visible/roll:-translate-y-full motion-reduce:transition-none">
                      {label}
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-0 top-full block transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/roll:-translate-y-full group-focus-visible/roll:-translate-y-full motion-reduce:transition-none">
                      {label}
                    </span>
                  </span>
                </a>
              ))}
              {/* the CTA. `leading-none` plus symmetric padding is what keeps
                  the pill's height tied to its own type rather than to the
                  line box, so it cannot grow taller than the bar. */}
              <PillButton
                href="/login"
                fill={HERO.navLinks.ctaFill}
                color={HERO.navLinks.ctaColor}
                className="whitespace-nowrap px-[clamp(16px,0.4rem+1vw,2rem)] py-[clamp(7px,0.2rem+0.45vw,0.875rem)] leading-none font-semibold"
                style={{ fontSize: "clamp(13px, 0.4rem + 0.65vw, 1.25rem)" }}
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
              {/* ── THE OPEN PANEL ─────────────────────────────────────────────
                  Osmo's open nav, in our words: dotted links on the left,
                  a card on the right, a strip of socials and the legal line
                  along the bottom. It replaces the empty VIDEO placeholder.

                  ⚠ ITS OWN LIST, NOT `navLinks.items`. The bar shows four
                  labels; the panel has room for every section, and forcing
                  the bar to carry five would crowd it at 1024.

                  ⚠ EVERY TOP-LEVEL PIECE IS A `.panel-link` WITH ITS OWN `--i`,
                  so the stagger in globals.css runs links -> card -> strip as
                  one sweep. That CSS existed already; nothing new animates. */}
              {/* ⚠ THE CARDS STACK UNTIL xl. Side by side they need ~46rem,
                  and at 1024-1279 the links column cannot spare it. From xl
                  the links take only their own width (`auto`) and the pair is
                  pushed to the right edge, capped so it does not balloon on a
                  2560 screen. */}
              <div className="grid gap-x-[clamp(24px,4vw,96px)] gap-y-[clamp(20px,2.5vw,40px)] p-[clamp(20px,1rem+2vw,48px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:grid-cols-[auto_minmax(0,52rem)] xl:justify-between">
                {/* the links. On hover-capable screens the rest dim while one
                    is pointed at — osmo's focus effect, CSS only. */}
                <ul className="group/list m-0 flex list-none flex-col gap-[clamp(2px,0.15rem+0.4vw,12px)] p-0">
                  {SECTION_LINKS.map((l, i) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="panel-link flex min-h-11 items-center gap-[clamp(10px,1.2vw,24px)] no-underline [&:hover>span]:!opacity-100"
                        style={{ color: HERO.navLinks.color, "--i": i } as React.CSSProperties}
                      >
                        <span
                          aria-hidden="true"
                          className="size-[clamp(6px,0.3rem+0.2vw,0.625rem)] shrink-0 rounded-full bg-current opacity-50 transition-opacity duration-300 group-hover/list:opacity-30"
                        />
                        <span className="font-display text-[clamp(30px,1.2rem+2.6vw,3.5rem)] leading-[1.05] uppercase transition-opacity duration-300 group-hover/list:opacity-40">
                          {l.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-[clamp(12px,1vw,20px)] xl:grid-cols-2">
                {/* the get-started card, where the video box was. The phone is
                    the hero's own art — already loaded above, so it costs no
                    request — cropped into the corner. Absolute, so it adds no
                    height; desktop only, where the card has room for it. */}
                <div
                  className="panel-link relative isolate flex flex-col justify-between gap-[clamp(16px,2vw,32px)] overflow-hidden rounded-[16px] p-[clamp(18px,1.6vw,32px)]"
                  style={{
                    color: HERO.navLinks.color,
                    background: `color-mix(in srgb, ${HERO.navLinks.color} 9%, transparent)`,
                    "--i": SECTION_LINKS.length,
                  } as React.CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO.art.src}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-[14%] -bottom-[38%] -z-10 hidden w-[62%] max-w-none rotate-[-8deg] select-none opacity-90 lg:block"
                  />
                  <div className="lg:max-w-[58%]">
                    <p className="m-0 text-[clamp(12px,0.5rem+0.3vw,0.875rem)] tracking-[0.08em] uppercase opacity-60">{HERO.panel.card.eyebrow}</p>
                    <p className="m-0 mt-1 font-display text-[clamp(44px,2rem+2.4vw,4.5rem)] leading-none">{HERO.panel.card.price}</p>
                    <p className="m-0 mt-2 text-[clamp(13px,0.55rem+0.35vw,1rem)] leading-snug opacity-75">{HERO.panel.card.detail}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <PillButton
                      href="#pricing"
                      fill={HERO.navLinks.ctaFill}
                      color={HERO.navLinks.ctaColor}
                      className="min-h-11 px-[clamp(20px,1rem+0.8vw,32px)] py-[clamp(10px,0.4rem+0.4vw,14px)] leading-none font-semibold"
                      style={{ fontSize: "clamp(15px, 0.6rem + 0.45vw, 1.125rem)" }}
                    >
                      Buy
                    </PillButton>
                    <PillButton
                      href="/login"
                      fill={`color-mix(in srgb, ${HERO.navLinks.color} 16%, transparent)`}
                      color={HERO.navLinks.color}
                      className="min-h-11 px-[clamp(20px,1rem+0.8vw,32px)] py-[clamp(10px,0.4rem+0.4vw,14px)] leading-none font-semibold"
                      style={{ fontSize: "clamp(15px, 0.6rem + 0.45vw, 1.125rem)" }}
                    >
                      Login
                    </PillButton>
                  </div>
                </div>

                {/* the updates card — the price card's inverse (violet ground,
                    grape type) so the pair reads as two different things.
                    Osmo's pattern: a live dot, then each update with a NEW
                    tag, then the Telegram ask. Content is UPDATES in
                    lib/site.ts, shared with the footer's ticket strip. */}
                <div
                  className="panel-link flex flex-col justify-between gap-[clamp(16px,2vw,32px)] rounded-[16px] p-[clamp(18px,1.6vw,32px)]"
                  style={{
                    background: HERO.navLinks.color,
                    color: HERO.nav.fill,
                    "--i": SECTION_LINKS.length + 1,
                  } as React.CSSProperties}
                >
                  <div>
                    <p className="m-0 flex items-center gap-2 text-[clamp(12px,0.5rem+0.3vw,0.875rem)] tracking-[0.08em] uppercase opacity-70">
                      <span aria-hidden="true" className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-current" />
                      </span>
                      {UPDATES.eyebrow}
                    </p>
                    <p className="m-0 mt-1 font-display text-[clamp(32px,1.4rem+1.8vw,3.25rem)] leading-[0.95] uppercase">{UPDATES.title}</p>
                    <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                      {UPDATES.items.map((u) => (
                        <li key={u} className="flex items-start gap-2 text-[clamp(13px,0.55rem+0.35vw,1rem)] leading-snug">
                          <span className="mt-[0.1em] shrink-0 rounded-full px-2 py-[1px] text-[max(11px,0.7em)] font-semibold tracking-[0.06em] uppercase" style={{ background: HERO.nav.fill, color: HERO.navLinks.color }}>
                            New
                          </span>
                          {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="m-0 mb-3 text-[clamp(13px,0.55rem+0.35vw,1rem)] leading-snug font-semibold">{UPDATES.join}</p>
                    <div className="flex flex-wrap gap-3">
                      <PillButton
                        href={TELEGRAM.href}
                        fill={HERO.nav.fill}
                        color={HERO.navLinks.color}
                        className="min-h-11 px-[clamp(20px,1rem+0.8vw,32px)] py-[clamp(10px,0.4rem+0.4vw,14px)] leading-none font-semibold"
                        style={{ fontSize: "clamp(15px, 0.6rem + 0.45vw, 1.125rem)" }}
                      >
                        Join Telegram
                      </PillButton>
                      <PillButton
                        href="#features"
                        fill={`color-mix(in srgb, ${HERO.nav.fill} 12%, transparent)`}
                        color={HERO.nav.fill}
                        className="min-h-11 px-[clamp(20px,1rem+0.8vw,32px)] py-[clamp(10px,0.4rem+0.4vw,14px)] leading-none font-semibold"
                        style={{ fontSize: "clamp(15px, 0.6rem + 0.45vw, 1.125rem)" }}
                      >
                        See the wallets
                      </PillButton>
                    </div>
                  </div>
                </div>
                </div>

                {/* the strip: socials big enough to hit, legal line beside. */}
                <div
                  className="panel-link flex flex-col gap-4 border-t pt-[clamp(16px,1.6vw,28px)] sm:flex-row sm:items-end sm:justify-between lg:col-span-2"
                  style={{
                    color: HERO.navLinks.color,
                    borderColor: `color-mix(in srgb, ${HERO.navLinks.color} 20%, transparent)`,
                    "--i": SECTION_LINKS.length + 2,
                  } as React.CSSProperties}
                >
                  <ul className="m-0 flex list-none flex-wrap gap-x-[clamp(18px,2.2vw,44px)] gap-y-2 p-0">
                    {SOCIALS.map((so) => (
                      <li key={so.label}>
                        <a
                          href={so.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-1 font-display text-[clamp(20px,0.9rem+1vw,2rem)] uppercase no-underline transition-opacity duration-300 hover:opacity-60"
                          style={{ color: HERO.navLinks.color }}
                        >
                          {so.label}
                          <span aria-hidden="true" className="text-[0.7em]">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="m-0 text-[clamp(12px,0.5rem+0.3vw,0.875rem)] opacity-50 sm:text-right">{LEGAL}</p>
                </div>
              </div>
              {HERO.els.map((el, i) => (el.in === "menu" ? <PriceEl key={i} el={el} fluidText /> : null))}
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
            /* ⚠ SIZED BY HEIGHT, NOT WIDTH. These screens are 521x1055 —
               0.49 wide per tall against the old phone's 0.80 — so the old
               33%-of-width rule made them 1.6x taller and ran them off the
               bottom. Height is 85% of the hero, centred 56.5% down, so it
               spans 14%..99%: clear of the nav, inside the bottom, at every
               window shape.
               The 54vw / 64.8rem terms cap the width at ~27% of the stage
               (54 x 0.494) — always narrower than the old 33% phone, so it
               cannot reach anything the old one did not. They bind on
               square-ish and tall windows (1024x768, an iPad Pro portrait at
               1024x1366); everywhere wider the 80% height governs.
               Centre stays HERO.art.x/y. */
            <div
              aria-hidden="true"
              data-sticker-phone
              className="pointer-events-none absolute z-10 aspect-[521/1055]"
              style={{
                left: `${HERO.art.x}%`,
                top: `${HERO.art.y}%`,
                height: "min(85%, 54vw, 64.8rem)",
                transform: `translate(-50%, -50%) rotate(${HERO.art.rotate ?? 0}deg)`,
              }}
            >
              <HeroSteps className="size-full" />
              <StickerLayer stickers={stickers} hide={hideStickers} anchor="phone" />
            </div>
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
            {HERO.els.map((el, i) => (el.in ? null : <PriceEl key={i} el={el} fluidText />))}
          </div>

        </div>

        <StickerLayer stickers={stickers} hide={hideStickers} anchor="stage" />
        {children}
      </div>

      {/* ── MOBILE / TABLET ORCHESTRATOR (< 1024px) ─────────────────────────────────
          Textbook decoupled sequential vertical layout per SCALPEL-FE-002 & FE-004.
          Guarantees zero element collision across any aspect ratio or squished window. */}
      {/* ⚠ ONE COLUMN THAT FITS THE SCREEN, AND THE ART ABSORBS WHAT IS LEFT.
          Measured before this: the hero ran 770px tall on a 730px viewport and
          1023x700 overflowed by 48px, because every child took its own slice
          of vh independently (`pt-[12vh]`, art at `44vh`, `pb-10`) and
          nothing reconciled the total against the screen.
          Now the column is exactly the viewport minus the pad, the fixed-size
          children (headline, copy, buttons) take their natural height, and the
          art is the ONLY flexible one — `min-h-0 flex-1` lets it give up space
          rather than push the buttons off. That is the one arrangement where
          adding a line of copy cannot cause an overflow.

          ⚠ `h-` AND `max-h-`, NOT `min-h-`. With a min-height the column has
          no ceiling, so `flex-1` on the art has no deficit to distribute — it
          kept its natural 437px and the column simply grew past the screen
          (measured 823px on a 770 viewport, WORSE than before the change).
          A definite height is what gives the flex layout something to divide.

          ⚠ pt CLEARS THE NAV, which is fixed and ~48-53px tall (measured), so
          the headline cannot slide under it the way it did in landscape. */}
      <div className="relative z-20 mx-auto flex h-[calc(100svh-var(--hero-pb))] max-h-[calc(100svh-var(--hero-pb))] w-full max-w-xl flex-col items-center justify-center gap-[clamp(10px,2.2vh,22px)] px-4 pt-[clamp(64px,9vh,104px)] text-center lg:hidden">
        {/* 1. Mobile Headline
            ⚠ IT IS SIZED TO FILL THE COLUMN, NOT TO A CAUTIOUS clamp. The old
            `clamp(34px, 8.5vw, 56px)` measured 133px WIDE on a 390 screen and
            220px on a 768 one — a display headline using a third of the width
            it was given, which reads as a mistake rather than restraint.
            `min(13vw, …)` tracks the width the lines actually need; the vh term
            keeps it from eating the art's budget on a short screen, and the
            44px floor holds it readable at 360.
            Basement's own scale does the same thing by switching tokens at the
            breakpoint (f-h0 6.125rem -> f-h0-mobile 2.875rem) rather than
            interpolating down to nothing. */}
        <h1
          className="hero-headline m-0 shrink-0 text-center uppercase tracking-tight text-balance"
          style={{
            color: h.color,
            fontSize: "clamp(44px, min(13vw, 7.5vh), 92px)",
            lineHeight: 0.92,
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

        {/* 2. Mobile Phone Artwork
            ⚠ THIS IS THE ONLY CHILD THAT FLEXES, and that is deliberate: it is
            the one element with no minimum legible size, so it is the one that
            should shrink when the screen is short. `min-h-0` is what lets it —
            a flex child defaults to `min-height: auto` and refuses to go below
            its content, which is why the old `44vh` art pushed the buttons off
            a 700px-tall window instead of giving up its own space.
            `h-full w-auto` + object-contain means the image fits the box it is
            given on BOTH axes and keeps its aspect ratio; it can never be the
            thing that overflows. */}
        {/* ⚠ THE ART IS DROPPED UNDER 420px OF HEIGHT. At 844x340 (phone in
            landscape) it measured 0x0 — flex had already taken every pixel off
            it and the headline was still forced under the fixed nav. An image
            at zero height is a layout still in deficit, so the honest fix is
            to stop asking for it: below 420px tall the hero is the headline,
            the copy and the buttons, which is all that fits and all that the
            section actually needs to do. The 3D/phone art returns the moment
            there is room for it. */}
        <div className="relative hidden min-h-0 w-full flex-1 items-center justify-center [@media(min-height:420px)]:flex">
          {/* phones keep the static hero phone — the pixel transition is
              desktop only. */}
          <img
            src={HERO.art.src}
            alt="Larpz Wallet Preview"
            className="pointer-events-none h-full max-h-full w-auto max-w-[min(82vw,350px)] select-none object-contain drop-shadow-2xl"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* 3. Subtitle Copy
            ⚠ 34ch IS THE LINE LENGTH, 3.9vw IS THE SIZE, AND THEY ARE NOT THE
            SAME CONSTRAINT. The ch cap stops a 430-wide phone running 60
            characters to the line; the vw term stops the type going small on a
            360. Measured at 78-95px tall across the range, which the column
            now budgets for instead of discovering at paint. */}
        <p className="m-0 max-w-[34ch] shrink-0 font-sans text-[clamp(14px,3.9vw,17px)] leading-[1.4] text-[#3D065F]">
          {subtitleEl?.text ??
            "Display any balance on a pixel-perfect Phantom Wallet, Trust Wallet, Ledger, Exodus or Bank app interface. Live prices, custom tokens, push notifications — built purely for entertainment."}
        </p>

        {/* 4. Action Buttons (Buy & Login)
            ⚠ NO `mt-` HERE — the column sets every gap in one place. A margin
            on a child plus a gap on the parent is two numbers for one space,
            and they drift. 48px tall keeps the 44px minimum touch target with
            room to spare. */}
        <div className="flex shrink-0 items-center justify-center gap-[clamp(14px,3vw,24px)]">
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
