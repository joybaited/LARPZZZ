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

## Session — 2026-10-07 (session 9)

The Pricing cards laid out for real, the Benefits list reworked, a `/no-hero`
route, and **everything from sessions 7, 8 and 9 committed, pushed, and in
PR #5.** Branch **`feat/pricing-layout`** — NOT `feat/features`, see below.

### ⚠ START HERE: THE BRANCH CHANGED, AND WHY

`feat/features` already existed on the remote with 12 of the owner's older
commits. The mandatory `git pull --rebase origin main` replayed them onto the
new `main`, which gave every one of them a NEW SHA, so a normal push was
rejected as non-fast-forward. The only way onto that branch was a force-push.

**@snvzyn was about to push the hero to `feat/features`.** Force-pushing a
rewritten history onto a branch somebody is about to publish to is how their
commits disappear. So the work went to a NEW branch instead and
`feat/features` was left exactly as it was.

- Every commit that is on `origin/feat/features` is also in this history,
  verified by comparing commit SUBJECTS, not SHAs — after a rebase the SHAs
  never match and comparing them says "12 commits lost" when nothing is.
- **Do not force-push `feat/features`** until @snvzyn's hero has landed and
  they say so.
- **The owner is waiting on that push and will say when it is done.** That is
  the next thing to ask about at the start of the session.

### Done

- **Three pricing tiers: Starter (Free→$14) / Monthly ($44) / Lifetime
  ($149).** Arranged in `/pricing-tuner`, pasted back, then tuned by hand
  against the render at four widths.
- **Layout follows the owner's reference**: heading, price, suffix, CTA in the
  MIDDLE, then the feature list. Left-aligned on a 7% gutter.
- **The "Benefits" header was removed** at the owner's call and the list
  resized into the space: 15px → 17px, row step 5.3% → 7.2%.
- **`/no-hero`** — every section in order except the hero. A second view, NOT
  an edit to `app/page.tsx`.
- **`snv.md` deleted.** `main` already had `SNV.md` from PR #3 and Windows
  treats the two as one path. The owner chose main's.

### ⚠ THREE BUGS IN PriceEl AND THE CONFIG — read before tuning

1. **A LEFT-ALIGNED ELEMENT GOES AT `x: 50` WITH `w: 86`, NOT AT THE GUTTER.**
   `PriceEl` anchors on the element's CENTRE. `x: 7` puts the centre at 7%, so
   half an 86%-wide block hangs 115px off the left edge. `align: "left"` does
   not move the anchor — the WIDTH does the alignment. Every text block in the
   config is at `x: 50`.
2. **`min(Npx, 50%)` ON A BORDER RADIUS TURNS A PILL INTO AN ELLIPSE.** A
   percentage radius resolves PER-AXIS, so 50% of a 304x56 box rounds the
   horizontal by 152px. It is a plain px radius now; the browser already
   clamps one that exceeds the box, so `radius: 999` is a true pill at any
   card size. The old cap was written to stop blobs and did something else.
3. **A WRAPPED LINE CANNOT HOLD A FIXED POSITION BELOW IT.** At 768 the card
   is 214px and three feature lines wrapped into the row beneath. Same failure
   the Features cards hit with a bottom-pinned block. Copy is now short enough
   to hold one line at 214px — that is why the strings read terse.

### Gotchas

- **⚠ AFTER A REBASE, `git log HEAD..origin/<branch>` LISTS COMMITS THAT ARE
  NOT MISSING.** A rebase rewrites SHAs, so every replayed commit reads as
  absent from the remote's point of view — it reported 12 "lost" commits when
  nothing was lost. **Compare commit SUBJECTS, not SHAs**, before concluding
  anything is gone:
  `comm -23 <(git log origin/<b> --format=%s|sort) <(git log HEAD --format=%s|sort)`.
  Empty output means nothing is only on the remote.
- **⚠ A NON-FAST-FORWARD PUSH IS A QUESTION, NOT AN OBSTACLE.** The fix is
  always `--force-with-lease` and it is sometimes the wrong thing to do. Ask
  who else is on that branch FIRST — here the answer was "@snvzyn is pushing
  the hero to it shortly," which turned a routine force-push into a new
  branch.
- **⚠ A PRICE AT 62px HAS A ~78px LINE BOX, SO AN OVERLAP CHECK LIES.** Every
  sweep flags the price against `/month` and `once` on cards 2 and 3 at every
  width. The GLYPHS are clear — the render proves it. Do not chase those two;
  this is the inflated-box trap sessions 7 and 8 both recorded, in its third
  disguise.
- **⚠ I "FIXED" THE ANCHOR ONCE AND CHANGED NOTHING.** A regex for `x: 7,`
  never matched because the generator had written `x: 7.0,`. The re-measure
  returned byte-identical offsets, which is the tell: *a real change that
  moves nothing means the edit did not land.* Confirm the write before
  re-reasoning about the layout.
- **`clip` in a Playwright screenshot is VIEWPORT-relative.** Slicing a 7492px
  page needs `fullPage: true` ON EACH CLIPPED SHOT or it throws "clipped area
  is outside the resulting image".
- **The page is 7492px with the marquee settled, not 5400.** An early
  `networkidle` capture measures before the FAQ pills lay out. Wait ~1.2s.

### Open

1. **⚠ WAITING ON @snvzyn'S HERO PUSH.** The owner said it is coming and that
   they will say when. Until it lands: do not touch `feat/features`, do not
   force-push it, and do not branch off it. `sections/Hero.tsx`,
   `components/Scene.tsx`, `components/Phone.tsx` and the `<Canvas>` are all
   theirs right now — stay out of those files.
2. **PR #5 is open** — `feat/pricing-layout` → `main`. Three PRs open at once
   now (#2, #4, #5). Per `docs/COLLABORATION.md` the OTHER dev merges, and a
   blocked PR blocks them, so this wants chasing.
3. **PR #2 and PR #4 are still open and unmerged.** #4 still holds session 5's
   handover entry, so this log still reads 4 → 6.
4. **⚠ `docs/COLLABORATION.md` AND `CLAUDE.md` DISAGREE ABOUT `page.tsx`.**
   CLAUDE.md says it is stubbed up front and must not be edited again; the doc
   says adding a section is one import and one tag and is explicitly allowed,
   and says the original rule "did not survive contact." The doc reads as the
   newer decision. **Ask the owner which stands** — session 9 sidestepped it
   with a separate route and did not resolve it.
5. **⚠ @snvzyn STILL HAS NOT BEEN TOLD** about any shared-file change —
   `package.json`, `globals.css`, `app/page.tsx`, the FAQ work,
   `app/sections/page.tsx`. **Top of the list for six sessions.** They have
   push access; `SNV.md` landing on main (PR #3) is the first sign of movement.
6. **Section 3 (How It Works) is still empty** and now reads as a dead
   screenful on `/no-hero` — a purple band with nothing in it. Still waiting
   on the steps, and on haze vs plum.
7. **Features overflows right at 1440** on `/no-hero`, cut mid-card. Expected
   for the marquee; worth a look on the carousel.
8. **FAQ answers are all still "New answer."**
9. **The temporary splitter line in `Card.tsx` is still in.**
10. **Card 1's `7 days` suffix is `show: false`**, ready to switch on.
11. Everything else from sessions 4-8 stands: KTX2, Vercel, the owner's docs and
   writing sample, the `Fade` no-op in `Scene.tsx`.

---

## Session — 2026-10-07 (session 8)

A canvas editor for the Pricing cards, built from how real editors work, plus
`snv.md` for the collaborator. **Committed in session 9** — see above. Branch
`feat/features`.

### Done

- **`/pricing-tuner`** — a real little design tool. Four shapes (text, box,
  ellipse, line), drag, eight resize handles, snapping with guides, arrow
  nudge, undo/redo, duplicate, z-order, show/hide, full properties panel
  (corner radius, opacity, rotation, weight, tracking, fill, border, align,
  strike/italic/caps). Listed at `/sections`.
- **`components/PriceEl.tsx`** — ONE renderer shared by the section and the
  tuner. This is the point: `/faq-tuner` draws its own dead copy of the pill
  and every class has to be kept in step by hand. Here there is nothing to
  drift.
- **`sections/Pricing.tsx`** now exports `CARDS` (three independent cards) and
  renders them. The placeholder content was stripped at the owner's call — an
  empty slate they fill in the tuner.
- **`snv.md`** — orientation for @snvzyn. What exists, where, the `/sections`
  workbench, tokens, the tuner rules, the gotchas. Deliberately does NOT
  duplicate `docs/COLLABORATION.md`; it points at it.
- **FAQ pill positions** updated from the owner's tuner config.
- **`/sections` notes corrected** — Testimonials, FAQ and Pricing had all said
  "placeholder" while being built.

### The owner's brief, in their words

- **"fully independnt per card and no fixed elements"** — each card owns its
  own element list. Do not refactor this into one shared layout with three sets
  of values; it was asked for explicitly.
- **"js gimme fake placeholder button or pill options i can resize and arrange
  and name"** — hence four generic shapes, not named slots. A button is a box
  with `radius: 999` and a fill. There is no `kind: "button"`.
- **"dont name it copy copy copy"** — duplicates are numbered like any other
  element.

### Why Figma round-tripping was refused

The owner asked whether they could export to Figma, edit there, and bring it
back. Searched; the answer is no, and the reasoning is worth keeping. Figma's
own community calls code-to-design plugins best-effort hacks, and HTML import
documents that not all CSS properties or element types survive. **The cards are
built on `clamp()`, `flex-1 min-w-0` and `svh` — Figma has no concept of any of
them** and would flatten everything to fixed pixels at one width. Two lossy
hops around a round trip. The tuner renders the real section at the real
viewport, which is fidelity Figma structurally cannot give here.

### The resize engine — read before touching the tuner

Taken from Konva's text-resize doc and Figma's handle behaviour:

- **Corner handles scale the FONT, side handles set the WRAP WIDTH.** Konva
  bakes the transformer's scale into the node (`width: width * scaleX,
  scaleX: 1`); a corner does the same thing with `fontSize` as the target.
- **⚠ THE FIRST VERSION COULD NOT ENLARGE TEXT AT ALL.** New text has no `w`,
  and the handle filter only gave it e/w — which resize the wrap and never the
  type. That was the owner's bug report.
- **⚠ THE REFERENCE DISTANCE IS CAPTURED AT POINTERDOWN, NOT READ LIVE.**
  Reading the element's rect each pointermove divides by a box that is itself
  shrinking, so the factor runs away: a -25px drag took 37.7px type to 5.7px.
  Same class of bug as the FAQ push being measured with the push still applied.
- **⚠ THE CENTRE MOVES BY HALF THE SIZE CHANGE APPLIED, not half the cursor
  travel.** Clamping w/h at a minimum while the centre followed the cursor is
  what "distorted" a shrinking box — w/h stopped at 1 but x walked from 50 to
  -7, carrying the box off the card.
- **⚠ A FIXED-WIDTH TEXT FRAME HAD NO HEIGHT**, so all six handles collapsed
  onto one line and grabbing a side handle hit a corner. The selection frame
  carries an invisible copy of the text for its real height.
- **Shift-aspect must RE-PIN after forcing the ratio**, or the anchored corner
  drifts. Alt resizes from the centre.
- **Snapping** is 6px, against the card's edges/centre and every other
  element's edges/centres — the thresholds real tools use.
- **Names are `<kind> <n>`, numbered from the highest already used for that
  kind**, not the array length. Length collides after a delete, and names are
  the selection handle, so a collision points the panel at the wrong element.

### Gotchas — these cost real time

- **⚠ A HEREDOC EATS A BACKSLASH LAYER.** `new RegExp("\\b...")` written into a
  Playwright script via `cat <<'EOF'` silently never matches, so test after
  test reported failures that were not real. **Write test scripts with the
  Write tool, not a heredoc.** Sessions 5, 6 and 7 all recorded a heredoc
  failing on prose; this is the same trap with a different disguise.
- **An element wrapper with `inset-0` fills the whole card.** The first tuner
  gave each element one, so six wrappers stacked and the topmost swallowed
  every click — you always dragged the last element whatever you aimed at.
  Hit-test with `document.elementFromPoint` to catch this.
- **`border-radius` needs capping**, `min(Npx, 50%)`. 90px on a 28x25 box reads
  as a blob and looks like the box is distorting.
- **A Playwright script with no `browser.close()` hangs the tool call** and
  turns into an orphaned background task. Always `try/finally`.
- **I twice "fixed" maths that was already correct** — the `ux*ux` anchor term
  looked wrong on reading and tested fine. **Confirm the fault exists before
  fixing it.** Sessions 6 and 7 recorded the same lesson.

### Open

1. ~~NOTHING IS COMMITTED.~~ Done in session 9. `snv.md` was dropped in
   favour of main's `SNV.md`.
2. ~~Everything from session 7 is still unpushed.~~ Pushed in session 9.
3. **PR #2 and PR #4 are still open and unmerged.**
4. ~~AT 768 THE PRICING COPY OVERFLOWS THE CARD.~~ Fixed in session 9: the
   rows carry `w: 86` and the copy is short enough to hold one line at 214px.
5. ~~Cards 2 and 3 are empty.~~ All three are laid out.
6. **Four shared-file changes @snvzyn has not been told about**, now five with
   `app/sections/page.tsx`. **Top of the list for five sessions.** They have
   push access and have still committed nothing.
7. Everything else from sessions 4-7 stands: Section 3 empty, FAQ answers still
   "New answer.", the `Card.tsx` splitter, KTX2, Vercel, the owner's docs and
   writing sample, the `Fade` no-op in `Scene.tsx`.

---

## Session — 2026-10-05 (session 7)

The FAQ section, end to end: pills, their animation, a tuner to place them,
and the owner's arrangement baked in. **Six commits, tree clean, nothing
pushed.** Branch `feat/features`.

### Done

- **FAQ pills.** Native `<details name="faq">` for the semantics, GSAP for the
  motion. They hug their question closed, then straighten, elongate and expand
  into a card. Six of them, scattered around a centred Megion wordmark.
- **Opening one moves the others.** Neighbours push away along the vector from
  the open pill, scaled by distance and by how much the answer actually grew;
  the open pill lifts so a low one does not push its answer off the bottom.
- **`/faq-tuner`** — drag pills to place them, dials for tilt, x, y, open width
  and size. Prints a config block to paste back. Listed at `/sections`.
- **Four earlier sections committed**: the Features restyle, Pricing,
  Testimonials and the FAQ work. Sessions 6 and 7 are both in these commits.

### The owner's working style — this is now in CLAUDE.md, obey it

1. **Ponytail is a PLUGIN. Invoke the skill** (`ponytail:ponytail`, full) at
   session start AND before every build or design task. They asked three times,
   the third in caps, because I kept writing in the style without loading it.
   Also saved to memory.
2. **No descriptions.** "dont gimme a description and waste time, ill ask you
   if i need one." Make the change, show the result, stop.
3. **No per-edit typechecks.** "save it for later, when its really needed." The
   build catches it.
4. They iterate in small steps and will say "a tiny bit more" repeatedly. Take
   it literally, change one number, show it.

### The FAQ mechanism — read before touching FaqItem.tsx

- **The close has to be intercepted.** The browser collapses a `<details>` the
  instant `open` flips, so the exit tween never runs. `preventDefault`,
  animate, set `open = false` in `onComplete`.
- **`name` makes the BROWSER close the siblings**, behind the tween, leaving
  their height, radius and width at the open values. A `toggle` listener resets
  them, guarded by `gsap.isTweening` so it cannot fight a live tween.
- **Height, width, rotation and radius are ONE timeline.** The radius was a CSS
  transition first — a different clock, so the corner always trailed and read
  as laggy.
- **The open width can never be less than the closed width.** An `openW` below
  the hugged width squeezes the QUESTION onto two lines on open and snaps it
  back on close. `Math.max(openW, closedWidth)`, and the question is
  `whitespace-nowrap` so no width change can re-break it.
- **A pill near the right edge opened straight past the section.** The width is
  clamped to the room available (24px gutter); if that would take it under 72%
  of the configured width it slides left instead of going narrow.
- **A sibling's close must not cancel the new pill's push.** Opening B makes
  the browser close A, which fires A's `onToggle(false)` a moment after B has
  already moved everything. Only the pill that owns the layout may reset it —
  the `active` ref in `Faq.tsx`.
- **The push is measured with the push subtracted.** A rect read while the
  pills are displaced includes the previous push, so switching pills would
  compound the offsets and the arrangement would drift apart with every click.

### Gotchas — these cost real time

- **`getBoundingClientRect()` ON A ROTATED ELEMENT RETURNS THE INFLATED
  BOUNDING BOX OF THE ROTATION.** This bit three separate times this session:
  a tuner drag where a -20deg pill moved 23px for 100px of cursor travel; a
  "dead space inside the closed pill" that did not exist; and a line-count
  check that reported 4 lines where there was 1. **Use `Range.getClientRects()`
  for line counts, and derive drag offsets from stored coordinates, never from
  a rotated rect.**
- **Percentage margins resolve against the containing block's INLINE size in
  BOTH axes.** `mt-[70%]` is 70% of the WIDTH. Mixing that with a `bottom: 30%`
  (which resolves against height) is why the card media ran past its splitter.
- **I twice "fixed" things that were not broken** — a `<p>` margin and a
  rotation origin — because I reasoned from a measurement instead of checking
  what the number meant. Both were reverted. **Confirm the fault exists before
  fixing it.**
- **A heredoc died on an apostrophe again**, writing this file. Session 6
  recorded the same thing. Use the Write or Edit tool for anything with prose.
- **Playwright scripts must run from the repo root** or `import { chromium }`
  will not resolve. Write `./.s.mjs`, run, `rm -f`.

### Open

1. **NOTHING IS PUSHED.** Six commits sit on `feat/features`.
   `git pull --rebase origin main` has NOT been run and `main` has moved since
   this branch was cut.
2. **PR #2 and PR #4 are still open and unmerged.**
3. **@snvzyn has committed nothing** — verified three ways in session 6. They
   have push access and have not started.
4. **Four shared-file changes nobody has told @snvzyn about**: `package.json`,
   `globals.css` (palette, marquee keyframe, reduced-motion),
   `app/page.tsx` (six sections wired), and the FAQ work. **Top of the list for
   four sessions.**
5. **The FAQ answers are all "New answer."** The owner has not written them.
   The lift barely shows because of it — `grown` is ~36px for one line.
6. **Section 3 (How It Works) is still an empty placeholder.** Still waiting on
   what the steps are, and on haze vs plum for the remaining sections.
7. **The temporary splitter line in `Card.tsx` is still in.** It is a styling
   guide and comes out when the cards are done.
8. **`transformOrigin: center center` in the tuner is dead code** — it only
   restates the default. I offered to strip it and the owner moved on. Harmless.
9. Everything else from sessions 4-6 stands: KTX2, Vercel, the owner's docs and
   writing sample, the old project link, the `Fade` no-op in `Scene.tsx`, and
   the 3D phone rendering over section two's cards.

---

## Session — 2026-10-05 (session 6)

A design session. Pricing added, Features restyled, Testimonials built, FAQ
headed. **Nothing committed — all of it is working-tree only on
`feat/features`.**

⚠ **This file does not contain session 5.** That entry is on branch
`docs/handover-s4` (PR #4, unmerged), so the log reads 4 -> 6 here. Read it
there, or merge #4.

### Done

- **Pricing — a new section 6.** Three cards carried over from LZ-2's section
  04, plus `sections/Pricing.tsx`, `app/pricing/`, a row in `/sections`, and
  the import+tag in `page.tsx`. Cards are DELIBERATELY EMPTY — they are empty
  in LZ-2 too, and nothing was invented.
- **Features restyled.** Cards wider and shorter, heading and copy moved to the
  foot, media re-placed above a temporary splitter line.
- **Testimonials built.** Two marquee rows, opposite directions, carried over
  from LZ-2's section 05.
- **FAQ.** Megion, centred, one step above the hero's headline size.

### The owner's working style — READ THIS BEFORE THE NEXT SESSION

They design by iterating in small steps, and they said both of these outright:

1. **"dont gimme a description and waste time, ill ask you if i need one."**
   Make the change, show the result, stop. No summaries of what was just done,
   no feature tours.
2. **"dont typecheck and waste time, save it for later, when its really
   needed."** Skip the per-edit `tsc`. The build catches it.
3. **"ill just describe and u js apply it to all cards"** — card edits go in
   the ONE shared rule in `Card.tsx`, never per card.
4. **Ponytail is a plugin.** Invoke the skill, do not just imitate the style.

### Features — what the restyle actually did

All of it is in `components/Card.tsx`, which is the single shared rule.

- **Card is now two independent dials**, `--card-h` and `--card-r`. LZ-2 writes
  the ratio inline as `5 / 7`, which ties width to height — shorten at a fixed
  ratio and the card gets NARROWER. The owner asked for shorter AND wider in
  one pass, so they had to come apart. Now `clamp(440px, 21rem + 30vh, 775px)`
  at ratio 0.84.
- **Heading and copy at the foot**, heading one line (`heading.join(" ")`, the
  `[string, string]` prop is unchanged), ~34px.
- **⚠ THE HEADING IS PINNED, NOT THE BLOCK.** The six headings must line up
  across the rail. Bottom-pinning the text block lined up the last line of
  COPY instead: card two runs to three lines where the others take two, so its
  taller block grew upward and carried its heading ~25px above the rest.
  `mt-auto` is on the HEADING and the copy box is a fixed 3 lines
  (`calc(3 * 1.35em)`). **Bottom-pinning anything whose height depends on copy
  length cannot hold an alignment.**
- **A temporary splitter line** at `mt-[70%]`, to be removed. It is the
  owner's styling guide.
- **⚠ PERCENTAGE MARGINS RESOLVE AGAINST WIDTH, IN BOTH AXES.** That is CSS,
  not a typo. The splitter's `mt-[70%]` is 70% of the card's WIDTH, so at ratio
  0.84 it lands at ~59% of the height. An earlier pass gave the media
  `bottom: 30%`, which resolves against HEIGHT — the two met at different
  places and the media ran past the line into the heading. The media's height
  is now `calc(var(--card-h) * var(--card-r) * 0.7)`, stated against the same
  basis. **If the line and a sibling disagree, check what each percentage is
  measured against before touching either number.**
- **Media is absolute, spanning card top to the line**, so it adds no height
  and cannot move the splitter. An earlier pass made the margin conditional on
  `media` — that let the line drift and the owner caught it. The offset is
  unconditional now.
- **⚠ THE VIDEOS ARE 720x720 SQUARE**, not tall. `object-contain` in a wide
  region pillarboxes them, which is why they read as small. They are sized by
  WIDTH at `w-[78%]` with `object-cover`, centred by translate — 418px
  rendered, inside the 720px source even at 2x DPR, so it downscales and stays
  sharp. **Nothing was re-encoded; the webm files are byte-identical.**

### Testimonials — built, placeholder copy

`sections/Testimonials.tsx`. Two rows, 40s and 52s so they never beat in sync,
row two `animation-direction: reverse`. Each row holds the set TWICE and
travels one set's width PLUS one gap — drop the gap term and the loop jumps by
one gap every pass.

- **CSS, not GSAP, and that is LZ-2's reasoning kept.** Every other animation
  here is scroll-linked or measured; this one is neither. A CSS animation runs
  on the compositor with no mount, teardown, resize handler or ScrollTrigger
  refresh. **It becomes a client component the day it needs hover-pause.**
- **It is a server component.** No state, no effect, no handler — so a fetch
  can go straight in it later with no round trip.
- **The data shape IS the integration.** The owner wants these from an external
  source. The section renders `Testimonial[]`; swapping the array for a fetch
  is one line and the markup does not move. Not built: API client, env vars,
  caching, fallback UI — **which source wins decides all four.**
- **⚠ Google Places caps at 5 reviews per place.** That is the real constraint
  and the reason duplicating a small set is the right shape anyway. Telegram
  has no reviews product — it would be a bot reading channel messages, and
  moderation lands on us.
- `line-clamp-4`, not 5: at this card height a 5th line is half-cut by the
  floor. Copy is placeholder and varied in length on purpose, so the spacing is
  tested against something honest.

### Open

1. **NOTHING IS COMMITTED.** Nine files, listed below. Commit before anything
   else.
2. **PR #2 and PR #4 are still open and unmerged.**
3. **@snvzyn has committed NOTHING — verified three ways** this session: remote
   branches, every commit author across all branches, and all four PR authors.
   They DO have `push` access (so session 1's "invite pending" is resolved);
   they simply have not started. The shared-file coordination is therefore
   one-directional for now, which is the good case.
4. **Shared files touched this session — `app/page.tsx` and `app/globals.css`.**
   That makes four outstanding shared-file changes nobody has told @snvzyn
   about: `package.json`, `globals.css`, `app/page.tsx`, and now the marquee
   keyframe. **Top of the list for three sessions running.**
5. **Section 3 (How It Works) is still an empty placeholder.** Two answers
   still outstanding: what the actual steps are, and haze vs plum for the
   remaining sections. Session 5's recorded mistake was building it from LZ-2's
   content without asking — do not repeat it.
6. **The FAQ workbench sits 15px left of the visible centre.** NOT a bug in the
   section: `scrollbar-gutter: stable` on `:root` reserves 15px, and `/faq`
   does not scroll so no scrollbar fills it. On `/` the page DOES scroll, so it
   is exactly centred there. The owner said leave it.
7. **The temporary splitter line in `Card.tsx` is still in.** It is a styling
   guide and comes out when the cards are done.
8. Everything else from sessions 4 and 5 stands: KTX2, Vercel, the owner's
   docs and writing sample, the old project link, the `Fade` no-op in
   `Scene.tsx`, and the 3D phone rendering over section two's cards.

### Uncommitted files

```
M app/globals.css        marquee keyframe + prefers-reduced-motion  SHARED
M app/page.tsx           Pricing import + tag                       SHARED
M app/sections/page.tsx  Pricing row
M components/Card.tsx    the restyle — all of it
M sections/Faq.tsx       Megion heading
M sections/Features.tsx  media re-enabled, note rewritten
M sections/Testimonials.tsx  the marquee
?? app/pricing/          workbench route
?? sections/Pricing.tsx  the three cards
```

### Gotchas

- **Percentage margins resolve against the containing block's INLINE size in
  BOTH axes.** `mt-[70%]` is 70% of the width. This cost the most time this
  session and is the single most useful thing to remember.
- **Bottom-pinning a block whose height depends on copy length cannot hold a
  cross-card alignment.** Pin the element that must line up; give the variable
  one a fixed box.
- **A flex item's default `min-width: auto` refuses to shrink below its
  content** — `min-w-0` is what makes `flex-1` actually work in a row that has
  to fit. This is why Pricing scales where LZ-2's version overflows below
  ~1200px (its open item 14).
- **`object-contain` pillarboxes a SQUARE source in a wide region.** Check the
  source's real dimensions before reaching for a fit mode; I assumed the phone
  videos were tall and they are 720x720.
- **A heredoc died on an apostrophe again**, writing the handover — the same
  failure session 5 recorded. Use the Write or Edit tool for anything with
  prose in it. The failed heredoc wrote nothing, which was checked rather than
  assumed.
- **Playwright scripts must run from the repo root**, or `import { chromium }`
  fails to resolve. Write to `./.s.mjs`, run, `rm -f`.
- **`document.querySelectorAll('li')` on `/features` now also catches Pricing's
  cards** on the full page. Filter by `li.querySelector('h3')`.
- **LZ-2's squiggle figures were ported into Pricing and then dropped** at the
  owner's call. A 900px box rotated 90deg is 900px WIDE, so each spanned most
  of the row and read as a pink sliver between opaque cards. The asset was
  deleted, not left orphaned. **Measurements looked fine while the render was
  obviously wrong — look at it.**

---

## Session — 2026-10-04 (session 4)

Hero headline built, phone screen swapped, **everything from sessions 3 and 4
committed and pushed.** Branch `scaffold`, PR open, waiting on @snvzyn to merge.

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
- **Four commits**, build passing, pushed.

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

### Open

1. **PR is open and unmerged.** Per `_ref/envy/BRANCHING.md` **@snvzyn merges
   it**, not the owner.
2. **@snvzyn has not been told about the shared-file changes.** Two of them:
   `package.json` (+6 devDependencies — gltf-transform x3, draco3dgltf,
   meshoptimizer, sharp) and `globals.css` (`--color-haze`, `--nav-inset`).
   Coordination is verbal and has not happened. **This is the top of the list.**
3. **`Fade` in `components/Scene.tsx` is a no-op.** It takes children and
   returns them unchanged, under a doc comment describing a handshake it does
   not perform — the actual fade is the `opacity` style on the wrapper div.
   Harmless, committed as-is: it is session 3's code and deleting it is a
   rewrite, not a tweak. Worth a word with whoever owns the canvas.
4. **Nothing has been seen rendered by Claude this session.** The headline and
   the glass were both verified by typecheck, build and byte comparison only.
   The owner checked the screen by eye; the headline position, size and indent
   have not been looked at on screen at any width.
5. **KTX2 is still the real load-speed lever** — unchanged from session 3.
   ~2.3MB of 3.32MB is textures. Then drop the unused `specularf0` (0.95MB),
   preload the glb, immutable cache headers.
6. Everything else from session 3 stands: Vercel, @snvzyn's invite, the owner's
   docs and writing sample, the old project link.

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
