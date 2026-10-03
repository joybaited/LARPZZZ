# Handover

Running log of what happened each session. Newest session at the top.

**Claude: update this file at the end of every session.** Add a new entry
under a `## Session — YYYY-MM-DD` heading at the top of the log. Never rewrite
old entries, never start a second handover file — this is the only one.

Each entry covers: what got done, what is still open, and anything the next
session would get wrong without being told.

---

## Session — 2026-10-03

### Done

- `git init` on `main`, initial commit.
- Private repo created: https://github.com/joybaited/LARPZZZ
- @snvzyn invited with **write** access — invite still pending his accept.
- `docs/COLLABORATION.md` written — git workflow, file ownership, how to
  handle working on a section the other dev built.
- `CLAUDE.md` written — stack, layout targets, and reminders to fire
  unprompted before pushes and when touching the other dev's files.
- `README.md` — setup steps, points devs at the collaboration doc.
- `.gitignore` for Next.js.

### Open

- **App is not scaffolded.** No Next.js, no dependencies, no `package.json`.
  Owner said they will confirm when to start. Do not scaffold unprompted.
- **Vercel not set up.** `vercel link` / `vercel deploy` are interactive and
  need the owner's terminal, or their Vercel scope passed as a flag. Nothing
  to deploy until the app exists anyway.
- **No branch protection.** See the gotcha below.
- **No docs from the owner yet.** They said they have more docs coming, and
  that docs should be written in their tone. No writing sample has been
  provided, so current docs are written plain and direct. Ask for a sample
  before writing more, then rewrite the existing ones to match.

### Gotchas for the next session

- **Branch protection is impossible right now.** GitHub blocks protected
  branches and rulesets on private repos on the free plan (403: "Upgrade to
  GitHub Pro or make this repository public"). So "nothing goes directly on
  `main`" is convention only, not enforced. Options if it matters later: make
  the repo public, GitHub Pro, or move it to a free organization — orgs get
  rulesets on private repos free.

- **`maintain` permission does not exist on personal repos.** It is an
  org-only role; the API returns 422. On a personal repo the only levels are
  `push` (write) and `admin`. @snvzyn has `push`, which covers the whole
  workflow. Owner was told `admin` is the only step up and includes repo
  deletion; they did not ask for it.

- **`amalbycia` is a former username.** The account is `joybaited`. Both
  appeared in early commits; all files are corrected now. Do not reintroduce
  `amalbycia`.

- **Stack is decided, not installed:** Next.js (App Router) + TypeScript,
  Tailwind v4, three.js + @react-three/fiber v9 + @react-three/drei, GSAP +
  ScrollTrigger, Vercel. Owner asked whether this meant "no HTML/CSS" — it was
  explained that JSX and Tailwind *are* HTML and CSS. Worth keeping
  explanations concrete rather than jargon-heavy.

- **Design comes later.** Owner is design-first and wants to design freely.
  The one hard constraint agreed: **one `<Canvas>`, dynamically imported.**
  Raise it if a design wants 3D in several separate sections.

- **Two devs edit the same sections.** This is not a file-ownership setup —
  it is a handoff setup. Read `docs/COLLABORATION.md` before any git work.
