# hero

the first section. a nav rectangle, a stacked headline, and the phone — which
this file now mounts, because the canvas is absolute and belongs to the hero.

`sections/Hero.tsx`. read `SECTIONS.md` first for the section rules and
`3D.md` before touching the phone.

---

## what is in it

```
<Section id="hero" bleed>
  <SceneMount /> the one <Canvas>, absolute, filling this section
  <nav>          empty rectangle, --nav-inset either side
  <h1>           three stacked lines, Megion
</Section>
```

the phone is rendered by the one `<Canvas>` in `components/Scene.tsx`, which
this section mounts. it is **absolute**, so it fills the hero and scrolls away
with it.

it was `fixed` and mounted in `page.tsx` until session 10. that pinned it to
the viewport: the phone followed the reader down all 7492px of the page and
sat on top of section two's cards. **do not put it back to `fixed`** — and if
a workbench route mounts its own `<SceneMount />`, there will be two canvases.

**the section is `bleed`.** it opts out of the 1280 content column, because the
nav runs wider than that column at 1440. everything inside therefore sets its
own inset — which is what `--nav-inset` is for.

---

## the headline

```
FAKE IT
TILL' YOU
MAKE IT
```

three lines, broken by `<span className="block">`, not by wrapping. **the breaks
are the design.** a width that happens to wrap at the right place is not the
same thing — it re-breaks at every other width and the stack falls apart.

`till'` is the owner's spelling, asked for directly. it is not a typo to fix.

| | |
|---|---|
| face | `font-display` (Megion, bold only) |
| size | `clamp(3.25rem, 1.14rem + 5.4vw, 9rem)` — 52 @390 -> 144 @1440 |
| leading | `0.9` — the lines have to read as one block, not three sentences |
| indent | `--nav-inset` + `--space-l`, past the nav's left edge |
| top | `--space-3xl` below the nav |

### why the size is inline and not a token

it is one step above `--text-1` and used in exactly one place. a `--text-0`
token would be a shared-file change to `globals.css` for a single headline —
and shared-file changes get agreed with the other dev first. if a second
section wants this size, promote it then.

it is still a `clamp()` solved on the same 390 -> 1440 line as every token, so
it scales with everything else. do not swap it for a fixed px.

### tuning it

these four numbers are the ones that get nudged: size, leading, indent, top
offset. all four are in one `className` on the `<h1>`. nudging them is a tweak
and needs no conversation; replacing the stack with a different layout or
animating it is a rewrite and does — `COLLABORATION.md`.

---

## /hero-tuner

The workbench for this section. `/sections` lists it. It carries the real nav,
the real headline and the **real `<Canvas>`** — the same `<SceneMount>` the
page mounts, driven by props — so what is arranged there is what ships.

Add text, buttons (a box with `radius: 999` and a fill), ellipses and lines;
drag them, resize them from eight handles, recolour the ground, resize the nav
and its corner radius, retype the headline, and tune every number on the phone
including the entrance spring, the idle float, the wobble and the mouse
parallax. Copy the config block and edit this section by hand from it — the
tuner never writes `Hero.tsx`.

**⚠ IT SAVES TO `sessionStorage`, AND THAT IS DELIBERATE.** The brief was
"keep it on refresh, lose it on a hard refresh". **That is not implementable:**
a hard refresh and a soft one both report
`PerformanceNavigationTiming.type === "reload"` and no browser exposes
ctrl+shift+R. `sessionStorage` is the honest version of the same intent — it
survives EVERY refresh, hard or soft, and clears when the tab closes. The
`reset` button is the explicit throw-it-away, and it asks first.

**⚠ TWO BUGS THAT ONLY A HIT-TEST FINDS.** Both made every drag silently do
nothing, with no error anywhere:

1. **A wrapper `<div>` around an absolute `<PriceEl>` measures 1425x0.** Its
   centre lands somewhere else entirely — here, on the canvas. The wrapper is
   `display: contents` so it generates no box.
2. **A positioned wrapper becomes the containing block.** `relative z-20` on a
   0-high wrapper made a `height: 6%` element resolve to `200x0`. Percentages
   have to resolve against the STAGE, so the wrapper must not be positioned.

`document.elementFromPoint` at the element's own centre is the check that
catches both. Session 8 recorded the same class of bug in `/pricing-tuner`
(`inset-0` wrappers swallowing every click).

**⚠ THE STAGE IS THE REAL HERO, MEASURED — AND A LERP IS NOT A `clamp()`.**
The nav and the headline are fluid on the page, so the tuner holds them as
min/max pairs and resolves them the way the css does. Three things this got
wrong before it was measured against the render at four widths:

1. **The headline is 96px at 1440, not 144.** `clamp(3.25rem, 1.14rem + 5.4vw,
   9rem)` never reaches its 9rem ceiling at either design width. Seeding the
   ceiling made the tuner's headline half again too big, and anything arranged
   against it would have been wrong on the page.
2. **The nav is 48 -> 57, not 48 -> 60.** `--space-xl`'s 3.75rem ceiling is
   only reached above 1440.
3. **Interpolating linearly between the two ends was 8px out at 768.** A real
   `clamp()` holds its floor until the `vw` term overtakes it, so it is flat
   and then rises — it is not a straight line between the endpoints. The
   tuner states the actual token formulas (`TOK` in the file) instead. It was
   correct at 390 and 1440 and wrong in between, which is the dangerous kind
   of wrong: both the widths you check look right.

Verified equal to `/hero` at **390, 768, 1024 and 1440** on nav x/y/height and
headline x/y/size. Re-run that comparison if `globals.css` changes.

**⚠ THE NAV AND THE HEADLINE DRAG TOO**, with the same outline, pointer
capture and arrow-nudge as an element — a tuner where half the things on
screen can only be moved by typing a number is not a tuner. A drag moves BOTH
ends of their clamp by the same px, so the 390 -> 1440 ramp is preserved
rather than skewed.

**⚠ THE CANVAS IS `-z-10` IN THE TUNER, `z-10` ON THE PAGE.** `Scene.tsx` sets
z-10 so the canvas is not hidden behind an opaque section background (session
3). Inside the tuner's stage that painted it OVER every element. The stage
`isolate`s and the canvas goes behind.

---

## the nav

a `<nav>`, not a `<div>`, because that is what it will be. empty on purpose,
phase 1 — see the phase note in `SECTIONS.md`.

`mx-(--nav-inset)` holds it at ~93% of the viewport at every width. a fixed
48px inset ate 30% of a 390 screen, which is where that token came from. widen
or narrow the bar by changing the token alone.

---

## two traps that already bit

- **no top margin on the section's first child.** the nav originally had
  `margin-top` and it collapsed *through* the section, pushing the whole hero
  down and exposing a white strip of body above it. the section uses
  `pt-(--space-m)` instead. this looks like a 3d bug and is not one.
- **`text-(--text-1)` compiles to `color`, not `font-size`.** written up in
  `SECTIONS.md`. it applies to the arbitrary `text-[clamp(...)]` here too — that
  form works because it is a bracket value, but a bare custom property does not.

---

## ground colour

`--color-haze` `#f5f2ff`, a pale lavender sampled from the owner's reference
image. it is a token in `globals.css`, which is a **shared file** — it was added
for this section and the other dev needs to know it exists before adding a
third colour next to it.

phase 1 is otherwise black and white. this is the one exception and it is
deliberate.
