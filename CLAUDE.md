# LARPZZZ

Design-led site with 3D. Two devs working on the same sections.

---

## Reminders for Claude — act on these unprompted

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
| `amalbycia` | owner |
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

- `docs/COLLABORATION.md` — git workflow, file ownership, conflict handling.
  Read before pushing.

More docs to come; they are written in the owner's voice.
