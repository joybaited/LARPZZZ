# LARPZZZ

Design-led site with 3D. Two devs working on the same sections.

---

## Reminders for Claude — act on these unprompted

**Read `HANDOVER.md` at the start of every session.** It is the running log of
what happened previously, what is still open, and what the last session knew
that this one does not.

**Update `HANDOVER.md` at the end of every session.** Add a new entry at the
top of the log. Same file every time — never start a second one, never rewrite
old entries.

**Run `/ponytail` at the start of the session** (level: full). The owner works
with it on. Lazy senior dev: no speculative abstractions, shortest diff that
works, native platform features and already-installed deps before new ones.
Do not over-engineer this site.

**Read `docs/COLLABORATION.md` before any git operation.** It is the source of
truth for how the two devs work together.

### Before any push, commit, or PR

Remind about:

1. `git pull --rebase origin main` — has it been run? It is mandatory before
   every push.
2. Is this branched off **fresh `main`**, or off a stale local `main`?
3. Nothing goes directly on `main`. If the current branch is `main`, branch
   first.

### When touching a file the other dev wrote, or that both devs edit

Say so explicitly, every time, without being asked:

- **Has the other dev been told?** Two people in one file at once is the
  failure mode this project is set up to avoid.
- **Has their work landed on `main` yet?** Don't build on top of an open
  branch.
- **Is this a tweak or a rewrite?** Changing spacing is fine. Replacing their
  layout or animation approach needs a conversation first.

### When touching a shared file

`app/page.tsx`, `app/globals.css`, `package.json`, or the `<Canvas>` — flag it
as a shared file and name the rule from `docs/COLLABORATION.md`.

- `page.tsx` is stubbed up front and should not be edited again.
- `globals.css` holds design tokens; changes get agreed on first.
- New dependency → tell the other dev.
- The `<Canvas>` has one owner.

---

## Devs

| GitHub | Role |
|---|---|
| `joybaited` | owner |
| `snvzyn` | collaborator |

Both edit the same sections. Coordination is verbal, in chat, before work
starts.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind v4 (`@theme` in `globals.css`) |
| 3D | three.js + @react-three/fiber v9 + @react-three/drei |
| Animation | GSAP + ScrollTrigger |
| Deploy | Vercel (auto-deploy on `main`, preview per PR) |

Not installed yet — scaffolding comes after the repo is wired up.

### 3D budget

**One `<Canvas>`, dynamically imported.** 3D plus freeform design is where
sites get heavy. If a design calls for 3D in several separate sections, raise
it — that is a different architecture, not a bigger canvas.

---

## Layout

Design at **390px** and **1440px**. Verify at **768** and **1024**.

Breakpoints are Tailwind defaults: `sm 640` `md 768` `lg 1024` `xl 1280`
`2xl 1536`. Content maxes at `1280`, gutter at `1440`.

---

## Docs

- `HANDOVER.md` — running session log. Read at session start, update at
  session end.
- `docs/COLLABORATION.md` — git workflow, file ownership, conflict handling.
  Read before pushing.

More docs to come; they are written in the owner's voice.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
