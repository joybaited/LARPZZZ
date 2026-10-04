# hero

the first section. a nav rectangle, a stacked headline, and the phone — which
is not in this file, because it lives in the shared canvas behind the page.

`sections/Hero.tsx`. read `SECTIONS.md` first for the section rules and
`3D.md` before touching the phone.

---

## what is in it

```
<Section id="hero" bleed>
  <nav>          empty rectangle, --nav-inset either side
  <h1>           three stacked lines, Megion
</Section>
```

the phone appears to be in the hero. it is not: it is rendered by the one
`<Canvas>` in `components/Scene.tsx`, fixed behind the whole page. the hero
does not know about it and must not try to own it.

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
