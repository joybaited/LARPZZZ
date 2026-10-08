# Handover — fix the Features section's spacing

You are picking up a half-finished restyle of section two (the horizontal
card rail) in the LARPZZZ repo. The style swaps are done; **the spacing is
wrong and that is your job.** Everything below is what the previous session
knew.

## Ground rules from the repo's CLAUDE.md

- **Lazy senior dev.** No speculative abstractions, shortest diff that works,
  native platform features and already-installed deps before new ones. Do not
  over-engineer this site.
- **`sections/Features.tsx` and `components/Card.tsx` are SHARED FILES** — two
  devs (`joybaited` the owner, `snvzyn` the collaborator) both edit the same
  sections. Changing spacing is fine. Replacing the layout or animation
  approach needs a conversation first.
- **Design at 390px and 1440px. Verify at 768 and 1024.** Breakpoints are
  Tailwind defaults; `lg` is 1024 and it is the rail's boundary.
- **Nothing goes directly on `main`.** Current branch is `feat/pricing-layout`.
- Do not scaffold, do not add dependencies, do not rebuild
  `public/models/iphone.glb` (binary with three writers — see CLAUDE.md).

## What the section is

`sections/Features.tsx` — six cards on a horizontal rail.

**The pattern:** pin the SECTION, and as the page scrolls vertically through
it, translate the TRACK inside it horizontally. The page never scrolls
sideways; the only thing moving is one transform on the track. **The pinned
element and the animated element are not the same element** — animating the
pinned one corrupts the measurements ScrollTrigger took to pin it, which is
the most common way this pattern breaks. Do not "simplify" that apart.

Below 1024 the rail never mounts: the track becomes a real scroll-snap
carriage and the browser does the physics. `gsap.matchMedia()` tears the pin
down on a resize across the breakpoint or when reduced-motion is turned on.

## What was just changed (and is already committed-adjacent / uncommitted)

In `components/Card.tsx`:

1. **The splitter rule was REMOVED.** There used to be a visible 1px line
   (`bg-paper/30`) between the media and the copy. Kez asked for it gone. The
   `<div className="mt-[70%] shrink-0">` spacer **stays** — it is not
   decoration, it is what defines where the media region ends and the text
   begins, and the media's own `blockSize` is stated against the same 70% so
   the two meet. Delete the spacer and the media has no bottom edge to size to.
2. **Colours swapped to the hero's palette.** Card was `bg-ink text-paper`,
   now `bg-[#EAC2FF] text-[#3D065F]` — the hero section's ground colour and
   the hero tagline's text colour.
3. **Cards enlarged.** `--card-h` went from
   `clamp(440px, 21rem + 30vh, 775px)` back up to
   `clamp(500px, 24rem + 34vh, 880px)`.
4. **Heading swapped to Megion** (`font-display`) + `uppercase`, to match the
   nav wordmark and the hero tagline "Fake it / Till' you / Make it". Size up
   from `clamp(25px,1.25rem+1vw,36px)` to `clamp(30px,1.5rem+1.3vw,46px)`.
5. **Copy sized up** from `clamp(16px,0.9rem+0.5vw,20px)` to
   `clamp(17px,0.95rem+0.6vw,23px)`.

In `sections/Features.tsx`:

6. **Top padding reduced** to pull the cards up and cut the gap below them:
   `pt-[clamp(220px,11rem+24vh,520px)]` → `pt-[clamp(120px,6rem+13vh,300px)]`
   (and the `max-lg:` pair likewise).
7. **`anticipatePin: 1`** added to the ScrollTrigger config.
8. **`document.fonts?.ready.then(() => ScrollTrigger.refresh())`** added.

## ⚠ THE SPACING IS BROKEN — THIS IS THE TASK

Kez reports "a lot of errors already with spacing and stuff" after the above.
The changes were applied but **never visually verified** — no browser check was
run. Assume items 3, 4, 5 and 6 interact badly. The likely culprits, in order:

### 1. The heading grew but its reserved room did not

The card's text block is built so **the heading is pinned to a fixed line and
the copy hangs below it** — `mt-auto` is on the `<h3>`, taking all the slack
above it, so the heading lands at the same height on all six cards and a
longer copy spends the room BELOW it. **The six headings must line up across
the rail.**

The heading went from max 36px to max 46px **and** changed font (Megion is a
different face with different metrics from Neue Montreal) **and** became
`uppercase`. Megion is Bold-only and display-only. Caps + a bigger display
face is a much taller line box. That eats the room the copy needs and can push
the copy out of the card's bottom.

### 2. The copy box is a FIXED three lines

`<p style={{ blockSize: "calc(3 * 1.35em)" }}>` — three lines are reserved
whether or not they are used, **and this is what holds the headings level.**
The copy sits below the pinned heading, so without a fixed box card two's
third line would push its heading up and undo the alignment.

The copy font-size went up, so `3 * 1.35em` is now taller in px. Card two's
copy runs to three lines where the others take two. **Check card two
specifically** — if any copy now runs to four lines at some width it will
overflow and clip (the card has `overflow-hidden`). At that point the copy
wants shortening, not the box growing — growing it is what broke the alignment
before.

### 3. The media region is sized off the card's WIDTH, not its height

This trips people repeatedly. **A percentage margin resolves against the
containing block's INLINE size in both axes** — that is CSS, not a typo. So:

- the spacer's `mt-[70%]` is 70% of the card's **width**
- the media's `blockSize: calc(var(--card-h) * var(--card-r) * 0.7)` is stated
  against the width too, deliberately, so the two meet at the same place

An earlier pass used `bottom: 30%`, which resolves against the **height**
instead — the two met at different places and the media ran past the boundary
into the heading. **If you change the 70%, change both, or they desync.**

At `--card-r 0.84` the card is 0.84 as wide as it is tall, so 50% of the width
lands at ~42% of the height, and each point of that 70% moves the boundary
~0.84 points down the card. 70% sits it at ~59% of the height.

### 4. Two dials, and they are INDEPENDENT

```
--card-h  clamp(500px, 24rem + 34vh, 880px)   <- height is the lever
--card-r  0.84                                 <- width derives: h * r
```

`aspect-ratio` cannot do this: it needs a DEFINITE height, and a min-height is
a minimum, not a size — the ratio would have nothing to work from and every
card would collapse to whatever its copy measured, silently, six cards of six
different widths.

The original LZ-2 wrote the ratio inline as `5 / 7`, which ties width to
height: shorten the card and it gets narrower too. Kez wanted shorter AND
wider in one pass, so the ratio is its own token. **Keep them separate.**

**ONE RULE FOR ALL SIX CARDS.** Both dials live on the shared component; there
is no per-card override anywhere. That is the point — six cards that are
nearly the same size read as a mistake rather than a design. Do not add
per-card overrides.

Below `lg` the card is width-led instead (`max-lg:!w-[min(82vw,21.5rem)]` +
`max-lg:aspect-[0.84]`), so the same 0.84 holds at every size.

### 5. The space below the cards is CENTRING SLACK, not padding

The track is `items-center` inside a `min-h-svh` box, so the cards sit at the
centre of whatever room the top padding leaves. **`pt` pushes them down and
the slack lands under them. There is no `pb` to cut.** Kez wanted less room
below the cards, which is why `pt` came down. If they now sit too high, raise
`pt`; the two move together and you cannot adjust them independently without
restructuring, which is not wanted.

## Do not break these while fixing the spacing

- **`ease: "none"` on the track tween is REQUIRED.** Any other ease breaks the
  1:1 mapping between scroll position and horizontal position.
- **`distance()` is function-based so it is re-read on every refresh.** A bare
  number is why this pattern breaks on resize and after fonts load — the
  distance was measured against a layout that no longer exists. It measures
  against `window.innerWidth`, **not the section**: a pinned element's width
  is set explicitly by ScrollTrigger and is not the viewport's.
- **`extra={1}` on the `<Section>` is load-bearing.** The rail needs
  `distance` px of scroll AFTER the pin starts, and the pin starts at the
  track's centre — so the scroll above that point is distance the cards never
  travel through. Without it the last card stops ~100px short of the right
  edge because the document runs out. **If you change the card size you change
  `scrollWidth`, so re-check that the last card still reaches the right
  edge.** This is the most likely second-order breakage from enlarging the
  cards.
- **`w-max` on the track is what makes the row wider than the viewport.** The
  rail measures `scrollWidth` against it.
- **Never `loading="lazy"` on media in the rail.** The track moves by
  transform, and a transform does not update the geometry the lazy loader
  watches, so an off-screen card's image never fetches at all — paints
  nothing, no error.
- **Never `width:auto` on the `<video>`/`<img>`.** On a replaced element that
  means "use the intrinsic width" — the source's own pixels — not "fill the
  container". `w-full` is the fix. And `max-w-none` must stay: bleeding past
  the card is the entire intent, and `max-width` beats `width`, so a cap
  silently undoes the bleed.
- **The videos are play/paused on an IntersectionObserver and that is
  necessary.** Measured: three `autoPlay loop` videos keep decoding forever,
  on or off screen — at the page bottom with this section thousands of px
  away, all three were still playing ~121 decoded frames each per 2.5s. The
  browser does not stop them, and `preload` only governs the first fetch, not
  playback.
- **The video sources are 720x720 square.** In a region wider than it is tall,
  `object-contain` fits them to the HEIGHT and pillarboxes the rest, which is
  why they read as small. The current CSS sizes the square by the WIDTH
  (`w-[78%]`) and lets the card crop top and bottom. 720px is the native
  frame; the region is ~469 CSS px, so even at 2x DPR this is inside the
  source's own pixels. Nothing is re-encoded — the enlargement is CSS layout,
  not a resample. **If you enlarge the cards further, re-check you are not
  upscaling past 720.**

## How to verify

`npm run dev`. Check **390, 768, 1024, 1440** — the rail only mounts at ≥1024,
so 768 and below is the scroll-snap carriage and a different layout path.

Specifically confirm:

1. All six headings sit on the same line across the rail.
2. No copy is clipped at the card's bottom edge (card two is the long one).
3. The media's bottom edge lands exactly where the text block starts — no
   overlap into the heading, no gap.
4. The last card reaches the right edge at the end of the pin (this is what
   `extra={1}` pays for).
5. Nothing is upscaled past the video sources' 720px.

## Known-unrelated open issues — leave alone

- The card copy is still placeholder lorem ("Winter Blankets", "Red Apples
  Rolled"). Real copy has not been written. Not your task.
- Card three has no media, by design — it never had any.
- `/pricing-tuner` has a 0-height wrapper bug. Different file.
- `app/globals.css` had `scrollbar-gutter: stable` removed last session —
  site-wide, and `@snvzyn` has not been told. Do not re-add it; a full-bleed
  section now measures the true viewport width.
