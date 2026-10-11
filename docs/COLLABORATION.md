# How we work on this together

Two devs, one page. We both touch the same sections. This doc exists so that
doesn't turn into merge hell.

Read this before your first push.

**New here?** `SNV.md` in the repo root is the short version — setup, what you
are on, and the traps that have already cost somebody an afternoon. This file
is the rulebook; that one gets you moving.

---

## The one rule

**Never both edit the same file at the same time.**

Say it in chat before you start: "taking Footer.tsx". Say it when you're done:
"footer pushed". That's it. Git conflicts are a coordination problem, not a
tooling problem — no branching strategy fixes two people editing one file
simultaneously.

---

## Branches

Nothing goes directly on `main`. Ever. `main` is protected.

```bash
git switch main
git pull
git switch -c feat/footer
```

Naming:

| Prefix | Use |
|---|---|
| `feat/` | new section or component |
| `tweak/` | changing something that already exists |
| `fix/` | something is broken |

One section per branch. One PR per branch.

---

## Working on something the other person built

This is the case that breaks things, so it gets its own rules.

**1. Wait for their PR to merge.** Don't branch off their open branch, and
don't edit a file that's still moving in a branch you can't see. Let it land
on `main` first.

This cuts both ways and it is the easy one to miss: **if you want to hand a
section over, your PR has to land before they can start.** A section that only
exists on an open branch cannot be worked on by anyone else — there is nothing
on `main` for them to branch from. Merging is the handover.

**2. Branch off fresh `main`.**

```bash
git switch main
git pull
git switch -c tweak/footer-spacing
```

**3. Tell them.** "Reworking the footer spacing." They stay out of that file
until you've merged.

**4. Don't rewrite their approach without asking.** Changing spacing is a
tweak. Replacing their layout method or animation approach is a conversation
first — they had reasons you can't see in the diff.

---

## Before every push

```bash
git pull --rebase origin main
```

This is not optional. It replays your commits on top of the latest `main`,
which is how you find out their changes exist *before* you've built on top of
stale code. Linear history, no merge-commit thicket.

If it stops with a conflict:

```bash
# fix the conflicted files, then
git add .
git rebase --continue
```

---

## Push daily

A branch that's two days old is already stale when we're both editing the
same sections. Push every day even if the section isn't finished — an open PR
is visible, a local branch is not.

Long-lived branches are where every painful conflict comes from.

---

## Pull requests

Every change goes through a PR. `main` requires one approval.

- **Review on the Vercel preview URL, not the diff.** Every PR gets a live
  deploy. Open it. Look at the page. The diff won't tell you the footer now
  overlaps the hero on mobile.
- Check it at **390px and 1440px** minimum.
- Approve or comment the same day. A blocked PR blocks the other person.

---

## Conflicts

Whoever hits the conflict resolves it. Then ask the other person to look at
the result before merging — don't guess at someone's intent in a 3D or
animation file. Ten seconds of "is this what you meant" beats silently
deleting their work.

---

## Shared files — the actual danger zone

Conflicts almost never happen in a component. They happen in files we both
need:

| File | Rule |
|---|---|
| `app/page.tsx` | One import + one tag per new section. Nothing else. |
| `app/globals.css` | Design tokens only. Agree on changes before touching. |
| `package.json` | Say it in chat before adding a dependency. |
| `app/layout.tsx` | Site-wide providers live here now. One line each, say it in chat. |
| `components/Section.tsx` | Every section's height and heading space. A change here moves the whole page. |
| The `<Canvas>` | **One owner.** The other person requests props. There is currently none live — see `SNV.md`. |

### `page.tsx`: the one edit that is allowed

The original rule was "stubbed up front with all sections, don't edit it
again." That turned out not to survive contact — it was stubbed with `Hero`
only, so every new section has to add itself.

So the rule is narrower now. **Adding a section is one import and one tag, in
order, and nothing else.** Two people doing that land on adjacent lines and
git merges it cleanly. What does *not* belong there is section internals,
layout, wrappers or conditionals — that is what makes it a real conflict.

Say it in chat anyway: "wiring Features into page.tsx". It is three seconds
and the file is the one place every section meets.

**Design tokens get decided together, up front.** Colors, type scale,
spacing — all in `globals.css` under `@theme`. If we each invent spacing
values inside our own sections, the page looks like two different websites.
That's the failure mode that actually hurts design-led work, not git.

**If a section keeps getting contested**, split it: `Footer.tsx` +
`FooterNav.tsx` + `FooterSocials.tsx`. Smaller files, smaller overlap. Only
do this when a section actually becomes a problem — not preemptively.

---

## Layout targets

Design at **390px** (mobile) and **1440px** (desktop). Check **768** and
**1024** before requesting review.

Breakpoints are Tailwind defaults:

```
sm 640   md 768   lg 1024   xl 1280   2xl 1536
```

Content maxes out at `1280` with a `1440` gutter so nothing stretches on
ultrawide monitors.

---

## Quick reference

```bash
# start work
git switch main && git pull && git switch -c feat/thing

# before pushing
git pull --rebase origin main
git push -u origin feat/thing

# open the PR
gh pr create --fill

# after it merges
git switch main && git pull && git branch -d feat/thing
```
