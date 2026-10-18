# snv

Start here. Everything you need to pick up the hero, and the things that will
waste your afternoon if nobody tells you.

Read `docs/COLLABORATION.md` before your first push — this file is the
shortcut, that one is the rulebook.

---

## Setup

```bash
git clone https://github.com/joybaited/LARPZZZ.git
cd LARPZZZ
npm install
npm run dev
```

Node 24, npm 11 is what it was built on. `npm run build` should pass clean —
if it doesn't, say so before you change anything, because it passed on `main`
as of this writing.

**`npm install` is not optional even if you cloned before.** `package.json`
gained 6 devDependencies for the 3D model pipeline — `@gltf-transform/core`,
`/extensions`, `/functions`, `draco3dgltf`, `meshoptimizer`, `sharp`. Build
tooling only; none of it ships to the browser.

---

## You're on the hero

`sections/Hero.tsx`. It's on `main` now, so branch off fresh:

```bash
git switch main
git pull
git switch -c tweak/hero-whatever
```

**Read `docs/HERO.md` first.** It names the four numbers that get nudged —
size, leading, indent, top offset — and where the line sits between a tweak
and a rewrite.

### What's in it

A `<nav>` rectangle (empty on purpose, phase 1) and a three-line headline:

```
FAKE IT
TILL' YOU
MAKE IT
```

**`till'` is the owner's spelling, asked for directly. Not a typo.**

The line breaks are `<span className="block">`, not wrapping. That's
deliberate — a width that happens to break in the right place re-breaks at
every other width.

### ⚠ THERE IS NO 3D ON THE SITE ANY MORE (2026-10-11)

This section used to say the phone was rendered by a `<Canvas>` behind the
page. That is no longer true and it is the biggest thing to know when you
pull.

**Every canvas is gone from the live site.** No three.js, no glb, no Draco on
the wire — verified, zero 3D network requests on a full page scroll. It went
in two steps: the hero's canvas was commented out in session 14 for
performance, and the How it works canvas was removed entirely on Kez's call.

**Your glb is untouched.** `public/models/iphone.glb` is still in the repo,
exactly as you committed it at `62d1880` — your seam fix. Nothing has run any
of the three scripts that write that path. `CLAUDE.md` records why: they each
clobber the other two, and `apply-all-fixes.mjs` reads a scratch directory on
your machine, so the binary is the artifact and it is not reproducible from
source. "Remove the 3D" meant the code, not your file.

**Nothing of the hero's 3D is deleted either.** `components/Scene.tsx`,
`Phone.tsx`, `SceneMount.tsx` and `public/hdri/` are all still here and still
wired. Putting the hero phone back is one line in `sections/Hero.tsx` — the
comment there has it verbatim.

**If you restore it, that is a conversation first.** It would be the only live
canvas again, and `CLAUDE.md` asks for an architecture discussion before there
are two. The tuned values are still the owner's, still chosen by eye in
`/tuner` — rotation `[-18, 159, 6]`, camera `z 5.9 / fov 42`, `fit 0.72`.
Don't "improve" them.

`docs/3D.md` has the full picture and a section at the top addressed to you.

### What replaced it

The How it works centre now holds six flat phone mockups with a pixel-wave
transition between them (`components/PixelatedImageReveal.tsx`) — DOM divs
plus GSAP, no WebGL. It cycles every 2.8s while the section is on screen.

---

## Stay out of these right now

| What | Why |
|---|---|
| `components/Scene.tsx` / `Phone.tsx` | The hero's 3D. One owner, and it is out of the site — see above before restoring it. |
| `public/models/iphone.glb` | Yours. Three scripts write that path and each clobbers the other two. |
| `components/Section.tsx` | Every section's height and heading space comes from here now. A change there moves the whole page. **It changed in #8 — read the responsive-pass section below first.** |

`app/globals.css` is shared and holds the design tokens. Besides
`--color-haze` (`#f5f2ff`, the hero's ground) and `--nav-inset`, it gained
**`--color-violet` (`#eac2ff`) and `--color-grape` (`#3d065f`)** — purely
additive, no existing token changed value. They are the pair that Faq and
Testimonials already had hardcoded. Agree changes before adding to it — if you
each invent your own spacing values the page ends up looking like two
websites.

### ⚠ `npm install` before you run anything

`package.json` gained two runtime dependencies and they are both load-bearing:

| Package | Why |
|---|---|
| `lenis` | Site-wide smooth scroll, mounted in `app/layout.tsx`. |
| `embla-carousel-react` | The Features carousel. |

**`lenis` changes how scrolling works everywhere, so two things that used to
be true no longer are:**

- **`overflow: hidden` does not lock the page.** Lenis drives it with its own
  transform and keeps going. Use `window.__lenis?.stop()` / `.start()` — that
  is what the nav does.
- **ScrollTrigger needs Lenis's position, not the browser's.** It is wired up
  once in `components/SmoothScroll.tsx`. If you add a pinned or scrubbed
  trigger it will work; if you ever remove that wiring, every pin silently
  stops tracking.

### Features is not a scroll-pinned rail any more

It was a GSAP ScrollTrigger pin that mapped vertical scroll onto a horizontal
transform. It is now an Embla carousel with arrow buttons and drag, rebuilt
1:1 against phantom.com's mechanics. The `extra={1}` is gone with it, so the
section is one viewport and the card height no longer decides the section
height.

---

## Three traps that already cost time

**1. `text-(--text-1)` compiles to `color`, not `font-size`.** Tailwind can't
tell which property an arbitrary custom property belongs to, so it guesses
colour. The h1 was silently body-sized and black-on-black with no error
anywhere. Use the bare utilities: `text-1` `text-2` `text-3` `text-base`.

**2. No top margin on a section's first child.** The nav's `margin-top`
collapsed *through* the section, pushed the hero down, and exposed a white
strip of body above it. Looks exactly like a 3D bug. Use padding on the
section.

**3. A WebGL canvas reads as empty unless you read it inside
`requestAnimationFrame`.** The drawing buffer is cleared after each frame, so
`toDataURL()` and `readPixels()` both return fully transparent when called
normally. An hour went into debugging an invisible model that was rendering
correctly the whole time — the measuring tool was broken, not the site.

---

## Before you push

```bash
git pull --rebase origin main
```

Not optional. Full reasoning in `docs/COLLABORATION.md`, along with branch
naming, how conflicts get resolved, and the shared-files danger list.

Nothing goes directly on `main`. One section per branch, one PR per branch.

---

## Two things that are not set up yet

- **Vercel exists now, with a caveat.** The site is live at
  https://larpz-final.vercel.app and PRs get preview URLs. But deploys are
  blocked while the repo is private, and separately by a git-author
  permission — see the note at the end of the responsive-pass section. Check
  locally at 390 and 1440 minimum, 768 and 1024 before asking for review.
- **Nothing on `main` has been reviewed by a second person**, and none of it
  has been looked at rendered at 768 or 1024. If the hero looks off at a width
  nobody checked, that's likely a real bug and not you misreading it.

---

## The responsive pass (2026-10-18) — read this before you size anything

A full pass over every section's responsive behaviour landed in **#8**
(squashed onto `main` as `7572c18`). It touched four of the shared files, it
changed how section heights work, and it added a page-wide colour system. If
you size, position or colour anything, the rules below are now the ones in
force.

```bash
git switch main && git pull     # you want 7572c18 or later
```

### The method, in one line

**Measure first, change second, measure again.** Every number in this section
came off a Playwright probe against the running page, not off a guess. That is
not ceremony — four separate times a change that looked obviously right made
things *worse*, and only the re-measure caught it. Those four are written out
below as warnings, because each one will catch you too.

`scripts/responsive-check.mjs` is the one that stayed:

```bash
npm run dev                                  # it needs the server up
node scripts/responsive-check.mjs            # all 20 viewports
node scripts/responsive-check.mjs --self-check   # geometry only, no browser
```

It loads the page at the 20 viewports that actually matter (StatCounter
desktop shares, real `innerHeight` after browser chrome) and reports sticker
/ content collisions, elements escaping their section, horizontal scroll and
clipped text. It **measures only — it never writes a section**, same rule as
the tuners. It takes **no screenshots**: the owner does visual verification,
we do numbers.

It currently reports **6/20 viewports with problems**, all of them
Testimonials quote clipping on shallow screens (843×546, 844×340) and tablet
portrait. That is the baseline — if your branch makes it 7, you caused one.

Two calibrations are baked into it that you should know about, because they
will look like bugs:

- **It measures the GLYPH box, not the element box.** A section `<h2>` is a
  full-width band (1536px wide at the baseline) but the word inside it is
  562px starting at x=487. Comparing element boxes reported **24 collisions on
  the owner's own approved layout** — all false.
- **It ignores the hero ImageTrail (`/images/cursor/01..18.webp`) and the
  in-card `mockup-phone` art.** The trail follows the cursor and is *designed*
  to cross the headline; the phone is a card's own artwork, not a sticker.

### The four traps that cost real time

**1. `min-h-[100svh]` and `pb-` on the same element make the box a viewport
PLUS the padding.** `box-sizing: border-box` does not save you — it governs
`height`, not `min-height`. This is why the mobile hero was 770px tall on a
730px screen. Subtract the pad from the min-height. `Section.tsx` has carried
a comment about this for `--section-fill` since before any of it; it bit
anyway.

**2. A `flex-1` child cannot shrink if its parent has no height ceiling.**
First attempt at the hero used `min-h-`, so there was no deficit to
distribute, the art kept its natural 437px and the column grew *past* the
screen — **823px on a 770 viewport, worse than before the change**. It needs
`h-` + `max-h-`. And the flexible child needs `min-h-0`, or it refuses to go
below its content.

**3. A percentage is only proportional while the box it measures keeps the
same SHAPE.** Sticker `x`/`y` are percentages of a stage; when the stage's
aspect ratio changes with the window, the same percentage lands somewhere
else relative to the content. Root-font scaling does not fix this — it scales
*sizes*, not *coordinates*. The fix is to lock the stage's aspect ratio so
the percentages stay geometrically identical; Testimonials does this and
measures **0% drift across seven viewports from 1180 to 3440 wide**, against
a stage that otherwise reshapes 1.42 → 1.86.

**4. A row-average detector cannot see a thin line.** Chasing a 3px blue seam
at the footer, the first detector reported "clean" for both the broken and
the fixed tree. Averaging across the full width washed the line out. Looking
for a *discontinuity* between adjacent rows found it immediately. If you
write a visual check, check that it fails on the known-bad case before you
trust a pass.

### Section heights changed — `components/Section.tsx`

This is the highest-risk file in the pass. It is on the "stay out of these"
list above and it still is; read this before touching it.

```
SECTION_MIN = min(100svh, calc(78vw + 240px))
```

A section used to demand a full viewport of height always. On a tall narrow
screen that is far more than the content needs, and every inner wrapper
centres itself in it — so the surplus split in half and **half of it pooled
between the heading and the first card**. Measured, heading glyph bottom to
first inked pixel:

| | before | after |
|---|---|---|
| Testimonials @ 390×770 | 252px | 52px |
| Features @ 820×1100 | 280px | 45px |
| Pricing @ 1024×1290 | 331px | 70px |
| **any desktop** | 52–68px | **unchanged** |

Landscape keeps the full viewport, so every desktop and laptop is
byte-for-byte what it was.

**⚠ The gate is the ASPECT RATIO, not `lg`.** iPad Pro portrait is 1024 wide
and 1290 tall, so a width breakpoint puts it on the *desktop* branch — it kept
the full 237px gap while every phone was already fixed. Three sections use
`[@media(min-aspect-ratio:1/1)]:` for exactly this reason. If you add a
section that centres content in `--section-fill`, do the same.

The heading also **bottom-aligns in its band on desktop** now. The band is a
fixed `HEADING_SPACE` (240px at 1920) but the glyphs are only 117px of it, so
centring left 62px of dead air before the content. It is 8–13px now. The
band's own height did not change, so nothing below it moved.

### The page colour is on `<html>` now — `components/PageTint.tsx`

**Sections no longer paint their own background.** This is the biggest
behavioural change in the pass. It is lifted 1:1 from phantom.com, read off
their live stylesheet:

```css
html {
  background-color: var(--page-bg);
  color: var(--page-fg);
  transition-property: background-color, color;
  transition-duration: .4s;
  transition-timing-function: cubic-bezier(.22, 1, .36, 1);
}
```

`PageTint.tsx` writes those two variables when a section crosses the middle
of the screen. **It writes two strings; CSS does the animation.** No scroll
listener, no rAF, no GSAP.

**If you add a section, add it to `PALETTE` in that file** — six entries, in
page order — or it will inherit the colour of whatever came before it.

Two details worth knowing:

- The observer uses a `-50% 0px -50% 0px` rootMargin, which collapses the
  viewport to its centre line so exactly one section can own the colour. On
  each crossing it **measures and picks the nearest** rather than trusting
  callback order — two sections crossing in one frame arrive as two
  callbacks, and taking the last one makes the colour depend on scroll
  direction.
- The palette steps are chosen by **contrast ratio, not by eye**. The first
  version measured 1.19–1.27 between neighbours, which is invisible in
  motion; the current one measures 1.63–11.18 while keeping grape-on-light at
  6.20–13.24 and violet-on-dark at 9.83, all clear of the 4.5 body-text
  threshold. Everything is still just `--color-violet` and `--color-grape` at
  different lightnesses. If you re-pick, check the ratios.

**The footer is deliberately NOT in the palette.** It keeps painting its own
`#e3b5fb` and does not take part. That is your file and it stayed yours.

### Stickers: five sections lost them, one kept them

Hero, Features, Testimonials, Faq and Pricing have **no stickers at all** now
— config arrays, render layers and the `hideStickers` prop are gone from all
five. Hero also had two hardcoded on its mobile phone art; those went too.

**How it works keeps its four step badges**, and they are the only ones left.
The sticker image files are still in `public/` — unreferenced, but they are
design assets, not build output.

`/sticker-tuner` was rewritten around that one section. It had seven real
bugs; the two worth repeating because the patterns recur:

- **Resize divided live pointer distance by distance-at-pointerdown.** A
  corner drag *starts at the handle*, so that denominator was near zero and
  the first move blew the sticker up by a huge factor. Track travel, not a
  ratio of distances.
- **The drag handler had the state array in its `useCallback` deps**, so every
  pointermove rebuilt it while the handler already bound to the window kept
  reading the array from the render it was created in. Use a ref.

It also positions against **`stageRef`** — the same box the section positions
its own sticker layer against — not the section element. A tuner measuring
the section hands back numbers that land somewhere else on the real page.

### The badge-vs-text problem, and why it is not about the sticker

Worth reading even though it is "done", because the shape of the problem
recurs everywhere on this site.

The How it works badges crossed card body copy at 1920, 1536 and 1440 — and
cleared it at 1366 and 1280. Four rounds of moving the sticker could not
converge, because **the cause was not the sticker's position**. Cards 2 and 3
span 68.3–100% of the stage and their copy ran to 96%, so a badge on the
card's outer edge *has* to cross it. And the copy wraps at a different line at
every width, so the last line ends at a different x each time.

The fix was to make the **copy reserve the corner** (`margin-inline-end:
29cqi`), not the badge dodge the copy. `cqi` rather than `vw` because it is a
fraction of the *card* — and the card is not a fixed fraction of the viewport
(one column at 390, two at 640). That is what makes it hold by construction
instead of by tuning. Zero overlaps at ten viewports.

**Container query units are the right tool whenever an ornament has to stay
in proportion to its card.** `Card.tsx` already used `[container-type:inline-size]`;
`HowItWorks.tsx` does now too.

### Videos: there are now two sources, and the order is the mechanism

The card videos and the nav ghost were **invisible on iOS**. They are VP9
WebM with alpha, which Safari cannot decode. Chromium showed them fine at
every viewport, so the markup was never the bug.

Each `<video>` now carries two `<source>` children, **webm first**:

```jsx
<source src={media.src} type="video/webm" />
<source src={media.src.replace(/\.webm$/, ".mp4")} type="video/mp4" />
```

A browser takes the first source it can play, so Chromium and Firefox keep
real alpha and Safari falls through to the mp4. **If you add a video, add the
mp4 too**, or it is invisible on every iPhone.

**⚠ `ffprobe` REPORTS `yuv420p` ON A TRANSPARENT VP9 FILE.** The alpha rides
in a side-channel it does not report. `Card.tsx` already warned about this and
it still caught me: I read "no alpha", encoded plain H.264, and those
fallbacks would have shown a **black box** over 52–68% of each frame. Decode a
frame to rgba and read the alpha values — that is the only real test.

HEVC-with-alpha is Safari's only transparent format and it needs Apple's
VideoToolbox, which is macOS-only. So each mp4 is the same footage **matted
onto the flat colour it actually sits on** — `#EAC2FF` for the cards,
`#3D065F` for the nav bar. Both are fixed surfaces the tween does not touch,
so it lands pixel-identical. If either of those colours ever changes, the
mp4s need re-encoding; the ffmpeg command is in the commit message for
`8004ab0`.

### Your files — what changed and what did not

**`sections/Footer.tsx`** gained **one mobile-only overlay** and nothing else.
Your gradient, cloud, coins and ticket strip are untouched.

The reason: the footer's background is a cyan-to-purple gradient
(`#38bdf8 → #607afb → #9481fb`) that is meant to sit *behind* the cloud — and
the cloud is `hidden md:block`. On a phone the gradient's first rows were the
topmost thing in the section and painted a hard cyan line across the join with
Pricing. Measured at the seam: `rgb(122,125,251)`, the `#607afb` stop, a +116
jump in blueness against the rows above. The overlay is a band of the footer's
own `#e3b5fb` over that edge, fading out below it, rendered only below `md`.
Blueness at the seam is 46 now. Desktop renders nothing — `display: none`,
margin `0px`, confirmed at 1536 and 1920.

**`components/FooterCoins.tsx`** — mobile coin sizing only. Coins were a fixed
px size scaled by `w/390` with a 1.2 ceiling, so the largest was 114px on a
430 screen: **27% of the whole width for one decorative icon**. Bounded to 19%
of the viewport now — 87px at 430, 73px at 360. The desktop collage values the
file marks `STRICTLY UNTOUCHED` are untouched.

> **⚠ `FooterCoins` splits at 768 and that is CORRECT.** Everything else in
> the codebase splits at `lg` (1024), so it looks like a mistake. It is not —
> it is the *footer's* breakpoint. `Footer.tsx` swaps its cloud at `md` and
> `TicketStrip.tsx` swaps the strip from a vertical rail to a horizontal bar
> at the same `md`, and the coins sit in the gap those two leave. I changed it
> to 1024 to "align" it and had to revert: at 768 the horizontal strip does
> not exist at all (`flex md:hidden`), so the mobile coin band would be placed
> against a strip that is not there. The file carries this note now. Please
> don't align it either.

Both were edited at the owner's explicit request. If either is wrong for
reasons that are not visible in the diff, say so — they are your files and a
revert is cheap.

### A build trap that will waste your afternoon

**Writing `<html>` inside a CSS comment crashes Turbopack.** The build dies
with `TurbopackInternalError` / exit `0xc0000142` in the PostCSS worker, and
the error names neither the line nor the cause. It reproduces every time.
Existing `<ul>` and `<nav>` comments in `globals.css` are fine, so it is
specific to that tag. Bisect by reverting `globals.css` alone if you ever see
that error.

### Where things actually stand

- `tsc` clean, `next build` clean (20/20 routes).
- `scripts/responsive-check.mjs` at **6/20 viewports**, as described above.
- Two eslint errors pre-date all of this and are still there: `Faq.tsx:46`
  ("Cannot access variable before it is declared" — `move` used in the resize
  effect above its declaration) and `app/hero-tuner/page.tsx:318` (setState in
  an effect). Confirmed by stashing. Neither is from the responsive pass and
  neither blocks the build.
- The site is deployed: **https://larpz-final.vercel.app**

### Mobile round two (2026-10-18, later) — touch, and two FAQ sizing bugs

Three more mobile fixes on top of the pass above. Same method: measure, change,
measure again.

**The pill buttons now respond to touch.** The whole roll was driven by
`:hover`, and on a phone that failed in *both* directions at once — measured
with real touch events through CDP (`Input.dispatchTouchEvent`; a scripted
`TouchEvent` never sets `:active` and gives a false pass):

| | `__main` | `__hover` | `__fill` opacity |
|---|---|---|---|
| press, before | `none` | +24px | 0 |
| held 1.6s, before | `none` | +24px | 0 |
| ~1s after release, before | **-24px** | **0** | **1** |

The press did nothing and the *release* played the entrance, which then stuck
open permanently because the emulated hover outlived the tap. After: the roll
starts on press (`main -17.9`), holds through a long press (`-24.0`), and
releases to rest with no stick. Desktop is identical before and after
(`-23.6` on hover, back to `none` off) — verified on a separate non-touch
context.

Two things worth keeping in your head:

- **`@media (hover: hover)` alone is not enough.** Chromium grants *neither*
  `:hover` nor `:active` during a touch hold — it defers both to tap
  completion — so `:active` cannot express "stays down on long press" on
  Android. iOS Safari does apply `:active` during a hold, so a CSS-only fix
  would have worked on one platform and silently not the other. That is why
  there is a JS trigger: `components/PillTouch.tsx` sets `.pill-btn--press`
  on `touchstart` and clears it on `touchend`/`touchcancel`.
- **It is ONE delegated listener**, mounted once in `app/layout.tsx`, not
  handlers in `PillButton.tsx` and `PriceEl.tsx`. Both of those are server
  components, so a handler in each would mean two client boundaries and two
  copies to keep in step. If you add a new pill anywhere, it works
  automatically — the listener matches `closest(".pill-btn")`.

**FAQ pills no longer break onto two lines on mobile.** Measured before: four
of the six questions wrapped at 360px, three at 390. Three constraints were
stacking — the pill's own `calc(100vw - 48px)`, the container's `px-4`
subtracting 32px more, and a `max-sm:whitespace-normal` that explicitly
permitted the break. All three changed; zero wraps at 360/390/430/768 now, and
the text stayed at **16px** rather than being shrunk to fit, which is what the
owner asked for. The longest question needs 329px and now sits in a 340px pill
at 360.

If you add or reword a question, re-run the check — a long enough question
will still overflow, and the pill is `whitespace-nowrap` at every width now,
so it will push rather than wrap.

**The nav hamburger had collapsed into the left edge.** `HERO.menu.x` is 4.6
and that is a percentage of the SECTION — right on a wide screen, but 4.6% of
390px is 18px, and the button's left edge measured 9-13px from the screen edge
at 360-430 against 92px on desktop. It is `max(4.6%, 22px)` now: the tuned
percentage wins wherever it is already larger (roughly 480px up, so desktop and
`/hero-tuner` are untouched and still measure 92px) and the floor only applies
where the percentage has collapsed. A media query would have been a second
number to keep in sync with `x`; `max()` reads the same one.

### One Vercel thing that will block you

Deploys were failing with *"Git author kez-james must have access to the
project on Vercel to create deployments"*, and separately Vercel refuses to
build this repo while it is **private**. The workaround used for #8 was to
flip the repo public, deploy, then flip it back. That is not sustainable — the
GitHub account needs adding to the Vercel project. If your push does not
deploy, this is why, and it is not something in your branch.
