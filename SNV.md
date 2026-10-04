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

### The phone isn't in the hero

It looks like it is. It isn't. It's rendered by the one `<Canvas>` in
`components/Scene.tsx`, fixed behind the whole page.

**That canvas has one owner and it isn't the hero.** If you need the phone to
do something, that's a request, not an edit. `docs/3D.md` explains the whole
thing and is worth reading before you touch anything 3D.

**The tuned values are the owner's**, chosen by eye in `/tuner` — rotation
`[-18, 159, 6]`, camera `z 5.9 / fov 42`, `fit 0.72`. Don't "improve" them. If
something looks wrong that's a question, not a commit.

---

## Stay out of these right now

| What | Why |
|---|---|
| `app/page.tsx` | Owner is in it — PR #2, the Features section |
| `sections/Features.tsx` | Same PR |
| `components/Scene.tsx` | The canvas. One owner. |

`app/globals.css` is shared and holds the design tokens. It gained
`--color-haze` (`#f5f2ff`, the hero's ground colour) and `--nav-inset`. Agree
changes before adding to it — if you each invent your own spacing values the
page ends up looking like two websites.

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
