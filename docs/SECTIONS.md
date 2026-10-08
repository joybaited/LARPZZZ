# sections

how the site is assembled. one section at a time, wired together at the end.

---

## why it works this way

each section is built on its own, in its own file, by whichever dev picked it
up. nothing outside that file has to change while it is being built — so two
people can work at the same time without landing in the same diff.

`app/page.tsx` is the only place sections meet, and adding one there is a
single import and a single tag. that is the whole wire-up.

---

## the standard size

**every section is one viewport tall.** `min-block-size: 100svh`.

`svh` not `vh` — `vh` measures the viewport with phone browser toolbars
retracted, so a `100vh` hero is cut off on load. `min-` not a fixed height, so
a section with more content than expected grows instead of clipping.

```tsx
<Section id="hero">…</Section>
```

## extra space

A section that needs more room than one viewport asks for it **by the
viewport**, and the extra stays inside that section:

```tsx
<Section id="work" extra={1}>     {/* two viewports total */}
<Section id="about" extra={0.5}>  {/* one and a half */}
```

**the extra belongs to the section.** it is not a gap between sections, not a
spacer div, and not margin on a neighbour. this matters for two reasons:

1. scroll animations are keyed to the section's own box. if the space it
   animates through lives outside it, every trigger is measured against the
   wrong element.
2. nobody has to know what a section's neighbours are in order to work on it.

It renders as `data-extra` on the element, so it is visible in devtools and
greppable.

## one route per section

**Every section has its own route, and they are wired into `page.tsx` only at
the end.** `/sections` lists them.

| route | what |
|---|---|
| `/sections` | the index — start here |
| `/hero` | section 1, on its own |
| `/features` | section 2, on its own |
| `/how-it-works` | section 3, on its own |
| `/` | every section, in order |

A workbench route is four lines: import the section, render it in a `<main>`.
They are **not part of the site** — same as `/tuner`. They exist so a section
can be built and looked at without the ones around it, and without the 3D
phone sitting over the top of it.

**`<Hero>` mounts the canvas itself, so `/hero` gets the phone for free.**
No workbench route should add its own `<SceneMount />` — that would render a
second `<Canvas>`. The other sections never see it, which is the point of
having the routes at all.

Adding a section: a file in `sections/`, a route folder, and one row in
`app/sections/page.tsx`.

## writing one

```tsx
// sections/Work.tsx
import Section from "@/components/Section";

export default function Work() {
  return (
    <Section id="work" extra={1}>
      …
    </Section>
  );
}
```

Then in `app/page.tsx` — one import, one tag, in order.

- **`id` is required** and must be unique. It is the anchor and the scroll
  trigger handle.
- **content is capped** at `--content-max` (1280) with `--gutter` either side,
  automatically. Pass `bleed` to opt out for full-width backgrounds.
- **sizes come from tokens**, not numbers. See below.

## sizing inside a section

Use the tokens in `globals.css`. They are `clamp()` functions solved between
390 and 1440, so they are correct at every width in between — including 960
(half a 1920 monitor) and 1280, which fixed values get wrong.

| want | use |
|---|---|
| space | `p-(--space-m)`, `gap-(--space-l)` … `--space-2xs`–`--space-3xl` |
| type | `text-base` `text-3` `text-2` `text-1` (small → large) |
| display face | `font-display` (Megion) |
| body face | default (Neue Montreal) |

Do not write fixed px for anything that should respond to width. Full
reasoning in `_ref/envy/LAYOUT.md`.

**The type tokens live in Tailwind's `--text-*` namespace on purpose.** That is
what makes `text-1` a real font-size utility. Writing `text-(--text-1)` instead
compiles to **`color`**, not `font-size` — Tailwind cannot tell which property an
arbitrary custom property is for, and it guesses colour. The result is text at
the wrong size and the wrong colour, with no error anywhere. Use the bare
utilities.

## the 3D canvas

**one `<Canvas>`, in `components/Scene.tsx`, mounted once — by `<Hero>`.**
Sections do not create canvases; they drive the shared one through scroll
triggers.

It is **`absolute`, not `fixed`**, so it fills the section that mounts it and
scrolls away with it. It used to be fixed and mounted in `page.tsx`, which
pinned it to the viewport — the phone rode down the whole page and sat over
section two's cards. If a later design needs the phone to persist across
sections, that is a conversation, not a change back to `fixed`.

If a design needs 3D in several separate sections, raise it. That is a
different architecture, not a second canvas.

## phase

Sections start as **black and white shapes with no real content** — that is
correct work, not unfinished work. Colour, copy, images and SVGs come later.
A placeholder that looks finished is the problem; one that looks like a
placeholder is not.
