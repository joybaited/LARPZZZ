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
| `components/Section.tsx` | Every section's height and heading space comes from here now. A change there moves the whole page. |

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

- **No Vercel.** `docs/COLLABORATION.md` says review on the preview URL rather
  than the diff — there are no preview URLs yet. Until there are, check it
  locally at 390 and 1440 minimum, 768 and 1024 before asking for review.
- **Nothing on `main` has been reviewed by a second person**, and none of it
  has been looked at rendered at 768 or 1024. If the hero looks off at a width
  nobody checked, that's likely a real bug and not you misreading it.
