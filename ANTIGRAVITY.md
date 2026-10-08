# ANTIGRAVITY.md

Orientation for an agent picking this repo up in Antigravity (or any tool that
is not the Claude Code session the project was built in).

**You are not the first agent here.** Read the three files in "Read these
first" before writing anything. They contain decisions that were paid for in
real time, and most of this file's value is pointing at them rather than
repeating them.

---

## The project in four lines

LARPZZZ — a design-led marketing site with one 3D element (an iPhone). Not a
product, not an app. The owner is **design-first** and wants freedom to
design; the code serves that. Avoid architecture that boxes the design in.

**Working dir:** `C:\Websites\LARPZ-FINAL` (Windows, PowerShell). Note the
folder name and repo name differ — the repo is `LARPZZZ`.

---

## Read these first, in this order

| File | Why |
|---|---|
| `HANDOVER.md` | **Start here.** Running session log, newest at top. What is done, what is open, what the last session knew that you do not. |
| `CLAUDE.md` | The standing rules. Written by the owner, overrides your defaults. |
| `docs/COLLABORATION.md` | Git workflow, file ownership, conflict handling. **Read before any git operation.** |

Then, per area:

| File | Covers |
|---|---|
| `docs/3D.md` | The whole 3D build, the model pipeline, and the **measured** load-speed research. Read before touching `Phone.tsx`, `Scene.tsx` or the glb. |
| `docs/HERO.md` | The hero section and `/hero-tuner`, including the clamp-vs-lerp lesson. |
| `docs/SECTIONS.md` | The section system. Every section is one `<Section>`. |

---

## Git and GitHub

| | |
|---|---|
| Repo | `https://github.com/joybaited/LARPZZZ` (**private**) |
| Owner | `joybaited` |
| Collaborator | `snvzyn` (has `push`) |
| Local git identity | `Kez` / `theabufanous@gmail.com` |
| `gh` CLI | authenticated, active account **`amalbycia`** |

⚠ **`amalbycia` is a FORMER USERNAME of `joybaited`.** Same person, same
account. Do not "correct" it to `joybaited` in commits or docs, and do not
reintroduce `amalbycia` into file contents either — the early commits used it
before this was known and every file was corrected. A second account
(`azxe-dev`) is also logged into `gh`; `amalbycia` is the active one.

`gh` token scopes: `gist`, `read:org`, `repo`, `workflow`.

### Before any push, commit or PR — every time

1. **`git pull --rebase origin main`** — mandatory before every push.
2. Is this branched off **fresh `main`**, or a stale local one?
3. **Nothing goes directly on `main`.** If you are on `main`, branch first.

⚠ **Branch protection does not exist on this repo** — GitHub blocks it for
private repos on the free tier. "Nothing on main" is convention, enforced by
nobody. Do not re-litigate it; the owner's answer was "dw we will work well".

### Two git traps already paid for

- **⚠ AFTER A REBASE, `git log HEAD..origin/<branch>` LISTS COMMITS THAT ARE
  NOT MISSING.** A rebase rewrites SHAs, so every replayed commit reads as
  absent. It once reported 12 "lost" commits when nothing was lost. **Compare
  commit SUBJECTS, not SHAs:**
  `comm -23 <(git log origin/<b> --format=%s|sort) <(git log HEAD --format=%s|sort)`
  Empty output means nothing is only on the remote.
- **⚠ A NON-FAST-FORWARD PUSH IS A QUESTION, NOT AN OBSTACLE.** The fix is
  always `--force-with-lease` and it is sometimes the wrong thing to do. **Ask
  who else is on that branch first.** Last time the answer was "@snvzyn is
  pushing to it shortly", which turned a routine force-push into a new branch.

### Current state

- Branch: **`feat/pricing-layout`**
- Open PRs: **#5** (this branch), **#4** (a handover entry), **#2** (section two)
- Per `docs/COLLABORATION.md` **the other dev merges**, not the author.
- ⚠ **Do not force-push `feat/features`.** It holds 12 of the owner's older
  commits and @snvzyn was about to publish to it.

---

## Two devs, one set of sections

This is deliberately **not** a file-ownership setup — it is a handoff setup.
Both devs edit the same sections. Coordination is **verbal, in chat, before
work starts.**

### When you touch a file the other dev wrote, say so unprompted

- Has @snvzyn been told? Two people in one file is the failure mode this
  project is set up to avoid.
- Has their work landed on `main` yet? Don't build on an open branch.
- Is this a tweak or a rewrite? Spacing is fine. Replacing their layout or
  animation approach needs a conversation first.

### Shared files — name the rule from `docs/COLLABORATION.md` when you touch one

| File | Rule |
|---|---|
| `app/page.tsx` | Stubbed up front. ⚠ **`CLAUDE.md` and `COLLABORATION.md` disagree about whether it may be edited — unresolved, ask.** |
| `app/globals.css` | Design tokens. Changes get agreed first. |
| `package.json` | New dependency → tell the other dev. |
| the `<Canvas>` | **One owner.** `Scene.tsx`, `SceneMount.tsx`, `Phone.tsx`. |

⚠ **@snvzyn is ACTIVE** (PR #6 merged). The coordination rules are
two-directional and real now — they were dormant for the first six sessions
and several notes elsewhere still assume that.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | **Tailwind v4** — `@theme` in `app/globals.css`, no `tailwind.config.js` |
| 3D | three.js + @react-three/fiber **v9** + @react-three/drei |
| Animation | GSAP + ScrollTrigger |
| Deploy | Vercel (not set up yet) |

r3f **v9 is the React 19 line**. Do not pair v9 with React 18.

⚠ **`next dev` appends a block to `CLAUDE.md` and re-adds it on every run.**
It is committed deliberately — deleting it only makes the tree dirty again.

---

## Layout

Design at **390px** and **1440px**. Verify at **768** and **1024**.
Tailwind default breakpoints. Content maxes at `1280`, gutter at `1440`.

Sections are `100svh`, not a fixed px height. Extra room is asked for with
`extra={n}` in viewports and stays *inside* the section.

⚠ **`scrollbar-gutter: stable` was REMOVED from `:root`** (2026-10-09). It
reserved 15px down every page whether or not a scrollbar existed, so
full-bleed sections were 15px narrower than the viewport and anything centred
sat 7.5px left of true centre. If you see an old note saying a workbench route
is "15px off centre", that is why, and it is fixed.

---

## The workbench

`/sections` lists every route. Each section has a bare route (`/hero`,
`/pricing`, `/faq`, …) and some have a **tuner**.

### Tuner rules — these are hard requirements, from `CLAUDE.md`

- **The panel FLOATS over the stage and can be hidden.** Never a column beside
  it — that takes its width off the stage, so the stage is no longer the shape
  of the real page and every value tuned against it is wrong.
- **The stage is the full viewport**, carrying the real section's ground and
  any fixed element.
- **Positions are percentages, not pixels.**
- **A tuner never WRITES the section it tunes.** It prints a config block to
  copy; the section is edited by hand from it.
- **A tuner SHOULD import the section's exported config to seed itself.**
  `/hero-tuner` imports `HERO` from `sections/Hero.tsx`; `/faq-tuner` reads
  `PILLS` from `Faq.tsx`. Keeping a second copy by hand is how they drift —
  those two had already reached four pills against six, a width 104px out.

---

## ⚠ The 3D model is a BINARY WITH THREE WRITERS. Do not rebuild it.

`public/models/iphone.glb` is **the only copy** of @snvzyn's seam fix (PR #6).
Three scripts write that same path and each overwrites the other two:

| Script | Author | Reads from |
|---|---|---|
| `scripts/optimize-model.mjs` | ours | the original 22.5MB source |
| `scripts/swap-screen.mjs` | ours | a pristine backup |
| `scripts/apply-all-fixes.mjs` | @snvzyn | a hardcoded path **on their machine** |

- **Running either of ours silently destroys their fix.** It is a binary, so a
  diff shows only `Bin 3314596 -> 3304716 bytes` and review cannot see what was
  lost.
- **`apply-all-fixes.mjs` cannot be re-run by anyone**, including them — its
  input is in a temp scratch dir on their machine.
- **The glb is the artifact, not the scripts.** Ask @snvzyn before any model
  work. If a rebuild is genuinely needed, back up the committed glb first and
  say so. Rebuild from a pristine backup, never the previous output, or the
  screen texture compounds a webp pass every time.
- If you only need to *inspect* it, open it read-only and **verify the sha256
  before and after** to prove you changed nothing. Current:
  `53fae2f17f1f4613762d5012f122af6cfa8a3cdcb5c9ef77c81f72fccbc6e2fe`

**One `<Canvas>`, dynamically imported.** Hard constraint. If a design calls
for 3D in several separate sections, raise it — that is a different
architecture, not a bigger canvas.

---

## How the owner wants you to work

From `CLAUDE.md` and repeated in chat:

1. **No unrequested descriptions.** "dont gimme a description and waste time,
   ill ask you if i need one." Make the change, show it, stop.
2. **No per-edit typechecks.** "save it for later, when its really needed."
3. **They iterate in small steps** and will say "a tiny bit more" repeatedly.
   Take it literally — change one number, show it.
4. **Lazy senior dev:** no speculative abstractions, shortest diff that works,
   native platform features and already-installed deps before new ones. Do not
   over-engineer this site. (In Claude Code this is the `ponytail` plugin; in
   another tool, just hold the principle.)
5. **Card edits go in the ONE shared rule**, never per card.

---

## Environment traps that cost real time

- **⚠ HEADLESS CHROMIUM HERE HAS NO GPU.** It falls back to SwiftShader, ~100x
  slower, and **crashes the tab** under repeated drags. A measured "1349.9ms
  median frame" is a software-rendering number — **do not quote it as the
  site's performance or optimise against it.** Network measurements are still
  valid; frame timings are not.
- **The 3D phone takes ~30s to appear in headless.** That is this environment,
  not the site. Wait it out before concluding the model is broken — a 4s wait
  reported "0% opaque" on a model that renders fine.
- **⚠ A CANVAS READS AS EMPTY unless you read it inside a double
  `requestAnimationFrame`.** WebGL clears the drawing buffer after each frame,
  so `toDataURL()` and `readPixels()` return fully transparent when called
  normally. An hour once went into "the model is invisible" when the model was
  fine and **the measuring tool was broken.**
- **A heredoc dies on an apostrophe, and eats a backslash layer.** Sessions 5,
  6, 7, 8 and 10 all recorded it. **Use a file-writing tool for anything with
  prose or escapes**, not `cat <<EOF`.
- **Playwright scripts must run from the repo root** or imports will not
  resolve. Same for any script importing the project's deps.
- **A Playwright script with no `browser.close()` hangs** — always
  `try/finally`.
- **Vercel's CDN will not compress `.glb` or `.hdr`** — `model/gltf-binary` is
  not on its allowlist. ⚠ **But `next dev` DOES gzip the glb**, so measuring
  compression on localhost shows a saving that vanishes in production.

---

## Three recurring lessons, stated plainly

1. **Confirm the fault exists before fixing it.** Logged in sessions 6, 7 and
   8 — things were "fixed" that were already correct, and reverted.
2. **Confirm the edit landed.** A real change that moves nothing usually means
   the write did not happen, not that the reasoning was wrong.
3. **Look at the render.** Measurements have repeatedly looked fine while the
   page was visibly wrong — and pixel statistics cannot see mirroring, which
   cost three model rebuilds.
