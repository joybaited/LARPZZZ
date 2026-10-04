# Handover

Running log of what happened each session. Newest session at the top.

**Claude: update this file at the end of every session.** Add a new entry
under a `## Session — YYYY-MM-DD` heading at the top of the log. Never rewrite
old entries, never start a second handover file — this is the only one.

Each entry covers: what got done, what is still open, and anything the next
session would get wrong without being told.

---

## Start here

**Project:** LARPZZZ — a design-led marketing-style site with a 3D element.
Not a product or an app. The owner is design-first and wants freedom to design;
the code exists to serve that, so avoid architecture that boxes in the design.

**Working directory:** `C:\Websites\LARPZ-FINAL` (Windows, PowerShell).
Note the folder name and the repo name differ — repo is `LARPZZZ`.

**Repo:** https://github.com/joybaited/LARPZZZ — private. Owner `joybaited`,
collaborator `snvzyn`. Two devs, both editing the same sections.

**Run `/ponytail` at the start of the session.** The owner works with it on
(level: full). It is the lazy-senior-dev mode: no speculative abstractions,
shortest diff that works, stdlib and native platform features before
dependencies. It shapes what gets built here — do not over-engineer this site.

### Do not do these unprompted

1. **Do not scaffold the app.** No Next.js, no `npm install`, nothing. The
   owner will say when. They said: "dont scaffold ill lyk".
2. **Do not write more docs until you have a writing sample.** Every doc is
   supposed to be in the owner's tone. None has been provided yet.
3. **Do not push to `main` directly** — see `docs/COLLABORATION.md`.

---

## Session — 2026-10-04 (session 4)

Hero headline built, phone screen swapped, **sessions 2-4 merged to `main`.**
Work split mid-session: @snvzyn takes the hero, the owner takes Features.
Two PRs open (#2 Features, #3 SNV.md).

### Done

- **Hero headline.** `FAKE IT / TILL' YOU / MAKE IT`, three stacked spans in
  Megion, left of the phone. Size is an inline `clamp(3.25rem, 1.14rem + 5.4vw,
  9rem)` — one step above `--text-1`, kept out of `globals.css` because a token
  for a single headline is a shared-file change for nothing.
- **Screen texture swapped** to the owner's `flip.png` via a new
  `scripts/swap-screen.mjs`. Flags: `--no-flop`, `--flip`, `--roughness=N`,
  `--gloss`.
- **`docs/HERO.md`** — first per-section doc. Every section gets one.
- **Probes deleted.** `probe.mjs` and `probe2.mjs` are gone, as session 3 asked.
- **Features section** — empty placeholder on `bg-haze`, wired into
  `page.tsx`. PR #2.
- **`SNV.md`** — start-here file for @snvzyn, linked from `COLLABORATION.md`.
  PR #3.
- **`COLLABORATION.md` corrected twice.** The `page.tsx` rule said "stubbed up
  front with all sections, don't edit it again" — it never was, so every
  section has to add itself; narrowed to one import + one tag. And the missed
  half of "wait for their PR to merge": **merging is the handover**, because a
  section on an open branch cannot be handed to anyone.
- Build and typecheck passing throughout.

### The screen material — this is where the time went

The OLED material ships **`emissiveStrength: 10`**. That is what washed the
owner's artwork out to near-white: a 10x emitter clips everything. The original
texture happened to survive it. Set to `1` — still reads as lit, because
emissive is still bound.

Roughness ended at **0.4**. It shipped at 0.057 (a mirror), went to 1 (chalk,
owner said the glass was gone), then 0.4 — "glass but not reflective at all."
It is one number, tuned by eye, exposed as `--roughness=N`. Not measured.

**The orientation cost three rebuilds and the lesson is worth keeping.** The
texture needed a **horizontal flop** (mirrored), and I guessed **vertical**
twice before the owner sent a screenshot that settled it in one look. I had
sampled top/bottom vs left/right luminance and reasoned from the asymmetry —
but a phone UI that is near-symmetric in left/right *brightness* says nothing
about which way its *text* runs. **Pixel statistics cannot see mirroring; eyes
can.** Ask for a screenshot before reasoning from aggregates about orientation.

Each rebuild ran from a pristine backup, not the previous output, so the screen
has been through exactly one webp compression pass.

### Then the work split, and `main` happened

Mid-session the owner said **@snvzyn is taking the hero** and the owner is on
Features. That made the open PR a blocker rather than paperwork: the hero only
existed on `scaffold`, so there was nothing on `main` for him to branch from.

**PR #1 was merged by the owner, on their explicit instruction.** It was put to
them that `COLLABORATION.md` requires an approval, that `_ref/envy/BRANCHING.md`
says @snvzyn merges, and that nothing in it had been reviewed or seen rendered.
They said merge anyway — they own the repo. **Do not re-litigate this**, but do
not treat it as the new normal either: it was a deliberate one-off to unblock
a handover.

`main` now has the scaffold, the phone, the hero and all docs. `scaffold` is
deleted, local and remote.

### Where everything is

| branch | what | state |
|---|---|---|
| `main` | scaffold, phone, hero, docs | PR #1 merged |
| `feat/features` | Features placeholder, haze ground | **PR #2 open** |
| `docs/snv` | `SNV.md` + link from COLLABORATION.md | **PR #3 open** |

Both open PRs are branched off `main` and are clean single-purpose diffs.

### Features section

`sections/Features.tsx` — empty `<Section id="features" className="bg-haze">`,
one viewport, content column, no extra. `bg-haze` matches the hero so the two
read as one ground rather than a white seam mid-scroll.

Verified served on `localhost:3000`: both sections carry `bg-haze` at `100svh`,
and `.bg-haze` compiles to `background-color: var(--color-haze)`. That last
check was not paranoia — the `text-(--text-1)` trap in this project was exactly
a class resolving to the wrong property, so classes get verified in the
compiled css, not assumed.

### `SNV.md`

New file in the repo root, linked from the top of `COLLABORATION.md`. Setup,
what he is on, what to stay out of while the owner is in PR #2, and the three
traps that have cost real time. **It is in the house style, not the owner's
voice** — the writing sample still has not arrived, so it is a best guess and
the owner should skim it.

### Open

1. **PR #2 and PR #3 are both unmerged.** Per `_ref/envy/BRANCHING.md`
   @snvzyn merges. The owner merged #1 themselves to unblock the handover;
   that was a one-off, not a precedent.
2. **@snvzyn still has not been told about the shared-file changes** —
   `package.json` (+6 devDependencies, he needs `npm install`) and
   `globals.css` (`--color-haze`, `--nav-inset`). This is in `SNV.md` now, but
   that file is itself sitting in an unmerged PR. **Verbal coordination has
   still not happened. Top of the list.**
3. **A dev server is already running on port 3000** (PID was 19468 this
   session), started outside this session. A second `next dev --port 3000`
   fails with `EADDRINUSE` and the failure is quiet — `curl` still returns 200,
   from the *other* server. **Check what is already listening before concluding
   your own server came up.** It cost a wrong "it is up" this session.
4. **Nothing has been reviewed by a second person, and nothing has been seen
   at 768 or 1024.** The hero headline's size, indent and top offset have never
   been looked at rendered at any width. Still no Vercel, so no preview URLs —
   `COLLABORATION.md` says review on the preview, and that workflow does not
   exist yet. **This is the gap that matters most now that code is on `main`.**
5. **`Fade` in `components/Scene.tsx` is a no-op** — returns its children
   unchanged under a comment describing a handshake it does not perform. On
   `main` now. Harmless; worth a word with whoever owns the canvas.
6. **KTX2 is still the real load-speed lever.** ~2.3MB of 3.32MB is textures.
   Then drop the unused `specularf0` (0.95MB), preload the glb, immutable
   cache headers.
7. Everything else stands: Vercel, @snvzyn's invite, the owner's docs and
   writing sample, the old project link.

### Gotchas

- **`emissiveStrength` is the first thing to check when a swapped texture looks
  washed out.** Not the image, not the colour space, not the compression.
- **A plain read-and-write of the glb adds ~0.75MB and 65 accessors**, because
  reading re-expands what `prune()` and `dedup()` had merged. Both scripts
  re-run those passes before writing. I misread this as a Draco problem first;
  **the accessor count is the tell, not the file size.**
- **Rebuild from a pristine backup, never from the previous output**, or the
  screen texture compounds a webp pass every time.
- **`--roughness` is a calibration knob, not a constant.** 0 mirrors, 1 is
  chalk, 0.4 is the current answer. Expect to move it when the lighting changes.
- **A 200 from `curl` does not mean your server started.** See open item 3.
- **`git stash pop` after switching branches brings the files with you.** Moving
  work between branches mid-session left Features staged on `scaffold` briefly.
  Check `git status` after every pop.
- **Verify a Tailwind class in the compiled css, not by reading the markup.**
  The class being present in `class=` says nothing about what it compiled to.

---

---

## Session — 2026-10-04 (session 3)

Hero section started. 3D phone is on screen, tuned, and animating. Still on
branch `scaffold`, **nothing committed this session, nothing pushed.**

### Done

- **Section strategy agreed.** Every section is one `<Section>`, standard
  `100svh`; extra room is asked for with `extra={n}` in viewports and stays
  *inside* the section. Sections get built one at a time in their own file
  and wired together at the end. Rules in `docs/SECTIONS.md`.
- **Nav rectangle** in the hero — a `<nav>`, not a div, because that is what
  it will be. Empty on purpose. Fluid `--nav-inset` token.
- **Hero ground colour** `#f5f2ff` (`--color-haze`), sampled from the owner's
  image, added as a token.
- **iPhone model: 22.56MB -> 3.15MB (86% off), 2.8MB gzipped.** Geometry was
  already Draco+meshopt and is only ~51k triangles — **21.3MB of the 22.5MB
  was uncompressed PNG textures.** Script: `scripts/optimize-model.mjs`.
- **Tuner at `/tuner`** — sliders plus orbit for rotation, position, size,
  camera. Prints a config block to paste back. This is how the phone got
  positioned; it works, keep it.
- **Phone is live on the homepage** at the owner's tuned angles, verified by
  reading canvas pixels (19.6% opaque, centred within 1.5%).

### The tuned values — these are the owner's, do not "improve" them

```
rotation [-18, 159, 6] deg    camera { z: 5.9, fov: 42 }
fit 0.72 (fraction of viewport height)    position centred, no offset
```

`fit` was tuned at 0.76 in `/tuner`, where the model sits flat. At the tuned
angles the silhouette swings taller, so it is scaled back to keep the phone
off the top and bottom edges. The owner approved 0.72 on screen.

### Open

1. **Nothing is committed.** `scaffold` has the session-2 scaffold commits;
   everything in this session is working-tree only. Commit before anything
   else.
2. **`probe.mjs` and `probe2.mjs` in the repo root are throwaway debug
   scripts.** Delete them or gitignore them — they should not be committed.
3. **Replace the phone screen image.** Agreed, not started. The screen is
   texture **`111`**, 1320x2868, bound to *both* `baseColorTexture` and
   `emissiveTexture` (the emissive is why it looks lit). Owner is sending a
   replacement. Needs 1320x2868 or any 1:2.17 portrait; keep q95.
4. **Load speed — agreed as high priority, searched but not implemented.**
   ~2.5MB of the remaining 3.3MB is still textures. The real lever is
   **KTX2/Basis**: WebP decompresses to full RGBA in VRAM, KTX2 stays
   compressed (4-8x less GPU memory) and would likely reach ~1.5MB. Then:
   drop the unused `specularf0` (0.95MB, largest remaining), `<link
   rel="preload">` on the GLB, immutable cache headers.
5. **Playwright + gltf-transform + sharp + meshoptimizer were installed as
   devDependencies.** That is a shared-file change to `package.json` — tell
   @snvzyn.
6. Everything open from session 2 is still open: Vercel, @snvzyn's invite,
   owner's docs and writing sample, old project link.

### Gotchas — these cost real time this session

**All of these, plus the full 3D build, are written up in `docs/3D.md`.**
Read that before touching `Phone.tsx`, `Scene.tsx` or the model pipeline.


- **A canvas reads as empty unless you read it inside `requestAnimationFrame`.**
  WebGL clears the drawing buffer after each frame, so `toDataURL()` and
  `readPixels()` both return 100% transparent when called normally. An hour
  went into "the model is invisible" when **the model was rendering fine and
  the measuring tool was broken.** A plain red box tested the same way also
  read as empty — that is what proved it. Read pixels inside a double rAF,
  or set `preserveDrawingBuffer: true`.
- **Use drei's `<Resize>` and `<Center>`, not hand-rolled bounding-box maths.**
  Several attempts at "measure the box, divide by the longest axis, recentre"
  each had a different arithmetic bug and produced a model 6 to 29 units deep
  swallowing the camera. drei does it correctly in two components.
- **`Box3.setFromObject` needs `updateMatrixWorld(true)` first** on a freshly
  cloned gltf, or it returns a wrong box. (Moot now that drei does it.)
- **The glb root carries a baked 13x scale** and an off-centre origin. Any
  manual scale multiplies by it.
- **The model lies flat in the file** — screen normal +Y, length +Z. It needs
  standing upright; measuring before rotating reports the phone's *thickness*
  as its height and every fit calculation solves the wrong axis.
- **`-z-10` on the canvas put it behind the opaque section background.** It is
  `z-10` now. A fixed canvas behind an opaque section is invisible.
- **Margin collapse made a white strip above the nav.** The nav's `margin-top`
  escaped the section and pushed the section down, exposing the white body.
  Fixed with padding on the section. Do not reintroduce a top margin on a
  section's first child.
- **`text-(--text-1)` compiles to `color`, not `font-size`** (from session 2,
  still true and still worth knowing).
- **Megion demo is one weight, display only** — unchanged from session 2.

### On section height, since it came up twice

The owner asked whether sections are "Figma standard px". They are not, and
deliberately: **Figma's 900 height is not a real number.** Browser chrome eats
~120px, so a 900 frame is 72%-107% of a real viewport (1366x768 -> 648px,
1920x1080 -> 960px). `100svh` means one screenful for everyone, which is what
"it adjusts to their screen" actually requires. Widths *do* match the Figma
spec: content column 1280, gutter 40 at 1440. The phone follows the same rule
— a fixed fraction of the frame at every width.

---

## Session — 2026-10-04

App scaffolded. Section architecture built and verified. On branch
`scaffold`, committed, **not pushed, no PR yet.**

### Done

- **Next 16.3.8 + React 19.2.8 + Tailwind v4.** r3f **v9.8.1** + drei v10.7.9
  + three 0.186.1, GSAP 3.15. `npm run build` passes clean.
- **Section system** — `components/Section.tsx`. Every section is one
  `<Section>`: `100svh` standard, `extra={n}` adds n viewports *inside* the
  section. Rules in `docs/SECTIONS.md`.
- **Design tokens** in `app/globals.css` — `clamp()` solved 390→1440, so 960
  and 1280 are correct by construction. This was listed as open last session.
- **Fonts** — Megion (display) converted OTF→woff2, 33KB. Neue Montreal
  (body) from the font collection. Self-hosted in `public/fonts`.
- **One `<Canvas>`** — `components/Scene.tsx`, dynamically imported via
  `SceneMount`, fixed behind the page, empty until the design arrives.
- **Reference docs** in `_ref/` (gitignored): envy-standard, smoothly
  breakdown + 3d-docs, kaktus/phantom. Docs only — binaries stripped, 564K.

### Open

1. **Not pushed.** Branch `scaffold` needs `git pull --rebase origin main`,
   push, PR — and per `_ref/envy/BRANCHING.md` **the other dev merges it.**
2. **Megion is the demo font: one weight (Bold), display only.** It cannot
   carry body text or any other weight. The commercial version is at
   limitype.com. Fine for this private project; a real blocker if the site
   ever goes public or commercial.
3. **Body font is a placeholder decision.** Neue Montreal was picked because
   it is in the collection and pairs with Megion. Owner said they would say
   what else is wanted — this is the thing to confirm.
4. **Palette is black and white only** (phase 1, per `_ref/envy/METHOD.md`).
   Deliberate, not unfinished.
5. **Old project link** not yet provided — owner will send it for elements to
   bring in.
6. **Vercel still not set up.** Unchanged from session 1.
7. **@snvzyn's invite** may still be pending accept.

### Gotchas

- **`text-(--text-1)` compiles to `color`, not `font-size`.** Tailwind cannot
  tell which property an arbitrary custom property belongs to and guesses
  colour. Cost real time this session — the h1 was silently body-sized and
  black-on-black with no error. Type tokens therefore live in Tailwind's
  `--text-*` namespace so `text-1`/`text-2`/`text-base` are real utilities.
  Written up in `docs/SECTIONS.md`.
- **`next dev` appends a block to `CLAUDE.md` and re-adds it every run.**
  It is committed deliberately — deleting it only makes the tree dirty again.
  Disable with `agentRules: false` in `next.config.ts` if it becomes annoying.
- **`create-next-app` refuses a folder with capitals** ("LARPZ-FINAL"). It was
  scaffolded in a temp dir named `larpzzz` and moved in, keeping our
  `.gitignore`, `README.md` and `CLAUDE.md` rather than its generated ones.
- **`_ref/` is excluded in `tsconfig.json`.** Its snippets import deps we do
  not have (spline, rive) and failed the build's typecheck until excluded.
- **`npm audit` reports 5 high.** It is `braces`→`eslint-config-next`, dev-only
  lint tooling, not shipped code. The "fix" downgrades to v14. Left alone.
- **Section `extra` is not a gap.** It belongs to the section so scroll
  triggers measure against the right box. Do not turn it into spacer divs.

---

## Session — 2026-10-03

First session. Repo setup and collaboration docs only. No application code.

### Done

- `git init` on `main`; 3 commits, clean tree, all pushed.
- Private repo created: https://github.com/joybaited/LARPZZZ
- @snvzyn invited with **write** access — invite still pending his accept.
- `docs/COLLABORATION.md` — git workflow, branch naming, how to take over a
  section the other dev built, the shared-files danger list.
- `CLAUDE.md` — stack, layout targets, and reminders to fire unprompted before
  pushes and when touching the other dev's files.
- `README.md` — setup steps, points devs at the collaboration doc.
- `.gitignore` — covers Next.js, `.vercel`, env files. Written ahead of the
  scaffold on purpose; `create-next-app` may want to overwrite it, keep ours.

### Open

- **App is not scaffolded.** No `package.json`, no dependencies. Waiting on
  the owner's go-ahead.
- **Vercel not set up.** The owner asked for a plain `vercel` CLI deploy.
  `vercel link` / `vercel deploy` are interactive — they prompt for scope and
  project name — so this needs the owner's own terminal, or their Vercel scope
  passed as a flag. A `vercel whoami` call was declined in session 1, so their
  Vercel account/scope is still unknown. Nothing to deploy until the app
  exists anyway.
- **No branch protection.** Not fixable on the current plan — see gotchas.
- **Owner's docs not received.** They said: "i have a ton of docs" and will
  send them later. They also want every doc in their tone. Ask for a writing
  sample, then rewrite the existing docs to match.
- **Design tokens not decided.** `docs/COLLABORATION.md` says colors, type
  scale and spacing get agreed by both devs up front, in `globals.css` under
  `@theme`. That has not happened. Do it before either dev builds a section,
  or the page ends up looking like two different websites.

### Gotchas

- **Branch protection is impossible on this plan.** GitHub blocks protected
  branches *and* rulesets on private repos on the free tier (403: "Upgrade to
  GitHub Pro or make this repository public"). So "nothing goes directly on
  `main`" is convention only, not enforced by GitHub. Options if it starts to
  matter: make the repo public, GitHub Pro, or move it to a free organization —
  orgs get rulesets on private repos for free. The owner's response was "dw we
  will work well", so do not re-litigate it unless asked.

- **`maintain` permission does not exist on personal repos.** Org-only role;
  the API returns 422. On a personal repo the levels are `push` (write) and
  `admin`. @snvzyn has `push`, which covers the entire workflow. The owner
  asked for "full perms"; they were told `admin` is the only step up and that
  it includes deleting the repo. They did not ask for it.

- **`amalbycia` is a former username.** The account is `joybaited`. The early
  commits used `amalbycia` before this was known; all files are corrected.
  Do not reintroduce it.

- **Stack is decided, not installed:**

  | Layer | Choice |
  |---|---|
  | Framework | Next.js (App Router) + TypeScript |
  | Styling | Tailwind v4 (`@theme` in `globals.css`) |
  | 3D | three.js + @react-three/fiber **v9** + @react-three/drei |
  | Animation | GSAP + ScrollTrigger |
  | Deploy | Vercel |

  **r3f v9 is the React 19 line** — verified by web search in session 1. v9
  bundles its own reconciler and works across React 19.0–19.2; do not pair v9
  with React 18. GSAP was chosen over Framer Motion for scroll choreography
  (pinning, scrub), and the official GSAP skills are installed in this
  environment.

- **The owner asked "so no html css?"** They are more comfortable in HTML/CSS
  than in React. It was explained that JSX *is* HTML and Tailwind *is* CSS,
  and they accepted the stack. Keep explanations concrete and short; skip
  jargon. If React concepts come up, explain them as they appear rather than
  up front. They also asked for a long answer to be shortened — they prefer
  terse.

- **One `<Canvas>`, dynamically imported.** The agreed hard constraint. 3D
  plus freeform design is where sites get heavy. If a design calls for 3D in
  several separate sections, raise it — that is a different architecture, not
  a bigger canvas.

- **Layout targets:** design at **390px** and **1440px**, verify at **768**
  and **1024**. Tailwind default breakpoints (`sm 640` `md 768` `lg 1024`
  `xl 1280` `2xl 1536`). Content maxes at `1280`, gutter at `1440`. 1440 was
  confirmed by search as Figma's default desktop frame; 1512 is the 14" MBP
  logical width and does not need its own design.

- **Two devs edit the same sections.** This is deliberately *not* a
  file-ownership setup — it is a handoff setup. The owner said: "i might work
  on the sections he already did as well". Read `docs/COLLABORATION.md`
  before any git work.
