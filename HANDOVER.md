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
