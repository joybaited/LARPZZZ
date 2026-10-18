"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PriceEl as El } from "@/sections/Pricing";
import PriceEl from "@/components/PriceEl";
/* ⚠ SEEDED FROM THE LIVE SECTION, not from a hand-kept copy. CLAUDE.md:
   a tuner SHOULD import the section's exported config, or the two drift —
   /faq-tuner and Faq.tsx had already reached four pills against six, with a
   width 104px out. HERO is a plain const, so importing it here is just data. */
import { HERO } from "@/sections/Hero";

/* Hero tuner. Add text and buttons over the real hero, drag them, resize them
 * from eight handles, recolour the ground, and resize the nav — then copy a
 * config block back into sections/Hero.tsx.
 *
 * ⚠ A WORKBENCH. It does not touch sections/Hero.tsx — it prints a config and
 * the section is edited by hand from it. That is what stops a tuner breaking
 * the thing it tunes.
 *
 * ⚠ THE STAGE IS THE FULL VIEWPORT, carrying the real nav and the real
 * headline, so there is something to lay out against and the shape is the
 * shape of the page. The panel FLOATS over it — a column beside the stage
 * takes its width off the stage and every value tuned against it is wrong.
 *
 * ⚠ IT RENDERS WITH THE SECTION'S OWN <PriceEl>, the same component Pricing
 * uses, so what is arranged here is what ships. Reused rather than re-drawn:
 * /faq-tuner keeps a dead copy of its pill in step by hand, which is how the
 * two drifted to four pills against six.
 *
 * ⚠ POSITIONS ARE PERCENTAGES OF THE VIEWPORT, not pixels, or a placement
 * tuned at one window size is wrong at every other.
 *
 * ⚠ NO 3D HERE. The phone and every phone dial were removed deliberately —
 * this tunes the FLAT layout. WebGL ran every frame the stage was open, which
 * is what made laying out against it feel heavy, and on a machine without a
 * GPU it starves the main thread badly enough that drag and animation timing
 * both stop being trustworthy. `HERO.phone` is untouched in Hero.tsx and the
 * config block below does not print it, so pasting from here cannot disturb
 * the pose. Use /hero itself to judge the phone.
 *
 * Mechanics are /pricing-tuner's, which were taken from how real editors
 * work: setPointerCapture filtered by pointerId, eight handles with
 * shift=aspect and alt=from-centre, 6px snapping with guides, one undo entry
 * per completed interaction.
 */

type Guide = { x?: number; y?: number };

/* the hero's own dials, the ones that are not per-element. */
type Ground = {
  bg: string;
  /* ⚠ THE NAV AND THE HEADLINE ARE FLUID ON THE PAGE, so they are fluid
     here too: a min and a max in px, solved on the same 390 -> 1440 line as
     every token in globals.css. A single px value would be right at one
     width and wrong at every other — which is the entire reason the real
     ones are clamps. The panel shows what each pair resolves to at the
     current stage width. */
  navMin: number; navMax: number; /* px — --space-xl, 48 -> 60 */
  navRadius: number; /* px */
  /* ⚠ PX PAIRS, NOT PERCENTAGES. --nav-inset is clamp(1rem, …, 3rem) — 16px
     at 390 and 48px at 1440, which is 4.1% and 3.3%. A single percentage is
     wrong at one end or the other, and that is exactly what made the tuner's
     390 layout drift 4px from the page's. Same for the headline indent. */
  navInsetMin: number; navInsetMax: number; /* px — 16 -> 48 */
  navFill: string;
  /* ⚠ PX PAIR, NOT A %. The page's nav top is --space-m, clamp(1.5rem, …,
     1.875rem) — 24px at 390 and 30px at 1440. A fixed 3.2% was right at 1440
     and 3px out at 390. */
  navYMin: number; navYMax: number;
  headline: string; /* one line per row */
  headColor: string;
  headMin: number; headMax: number; /* px — the live clamp solves 52 -> 96 */
  /* --nav-inset + --space-l: 48px at 390, 86px at 1440 */
  headXMin: number; headXMax: number; /* px from the left edge */
  /* --space-m + nav height + --space-3xl: 168 at 390, 200 at 1440. this is
     the TOP of the block, matching the page; the stage converts it to the
     centre anchor the drag uses. */
  headYMin: number; headYMax: number; /* px from the top */
  headLeading: number;
  /* ⚠ THE HEADLINE'S OWN TYPOGRAPHY. It renders in the display face at weight
     700 uppercase on the page; these make each of those a dial rather than
     something only editable in the section. `headCaps: false` is what lets a
     headline keep its own casing instead of being forced upper. */
  headWeight: number;
  headTracking: number; /* em */
  headAlign: "left" | "center" | "right";
  headFont: "display" | "sans";
  headCaps: boolean;
  headItalic: boolean;
  showHead: boolean;
  showNav: boolean;
  /* the dropdown's height, as a % of the viewport. */
  menuH: number;
};

/* ⚠ SEEDED FROM WHAT IS LIVE IN sections/Hero.tsx. The nav is
   h-(--space-xl) (48->60px), rounded-lg (8px), mx-(--nav-inset) (~16->48px,
   4.6% of 1040). The headline is clamp(3.25rem,1.14rem+5.4vw,9rem) — 144px at
   1440 — leading 0.9, indented --nav-inset + --space-l.

   A tuner that keeps a second copy by hand is how it drifts from the section,
   so when Hero.tsx changes these numbers change with it. */
/* ⚠ MEASURED OFF THE RENDERED /hero AT 1440, NOT READ OFF THE SOURCE.
   The headline is clamp(3.25rem, 1.14rem + 5.4vw, 9rem): 52px at 390 and
   **96px at 1440** — the 9rem ceiling is never reached at either design
   width. Seeding it at 144 made the tuner headline half again too big, and
   every element arranged against it would have been wrong on the page.

   nav: x 48, y 29, h 57, radius 8. headline: x 86, y 200, 96px, leading 0.9.
   Re-measure with getBoundingClientRect if Hero.tsx changes. */
const GROUND: Ground = {
  bg: HERO.bg,
  /* ⚠ 48 -> 57, NOT 48 -> 60. --space-xl is
     clamp(3rem, 2.54rem + 1.14vw, 3.75rem); the 3.75rem (60px) ceiling is
     only reached ABOVE 1440, so at the design width it renders 57.1px.
     Seeding the ceiling made the tuner's bar 3px taller than the page's. */
  navMin: HERO.nav.h[0], navMax: HERO.nav.h[1],
  navRadius: HERO.nav.radius,
  navInsetMin: HERO.nav.inset[0], navInsetMax: HERO.nav.inset[1],
  navFill: HERO.nav.fill,
  navYMin: HERO.nav.y[0], navYMax: HERO.nav.y[1],
  headline: HERO.headline.lines.join("\n"),
  headColor: HERO.headline.color,
  headMin: HERO.headline.min, headMax: HERO.headline.max,
  headXMin: HERO.headline.x[0], headXMax: HERO.headline.x[1],
  headYMin: HERO.headline.y[0], headYMax: HERO.headline.y[1],
  headLeading: HERO.headline.leading,
  /* ⚠ `?? ` ON EVERY NEW FIELD. Hero.tsx's HERO.headline does not carry these
     yet, so reading them bare would seed `undefined` into a slider and make
     it uncontrolled. The fallbacks are what the live <h1> actually renders:
     `font-display uppercase`, no explicit weight or tracking. */
  headWeight: HERO.headline.weight ?? 700,
  headTracking: HERO.headline.tracking ?? 0,
  headAlign: HERO.headline.align ?? "left",
  headFont: HERO.headline.font ?? "display",
  headCaps: HERO.headline.caps ?? true,
  headItalic: HERO.headline.italic ?? false,
  showHead: HERO.headline.show,
  showNav: HERO.nav.show,
  menuH: HERO.menu.panelHeight ? +((HERO.menu.panelHeight / 900) * 100).toFixed(1) : 35,
};

/* ⚠ THIS IS `clamp()`, NOT A LERP BETWEEN THE ENDS.

   A straight line from (390, min) to (1440, max) is NOT what the tokens do.
   A real clamp holds its FLOOR until the vw term overtakes it, so it is flat
   and then rises. Interpolating linearly was **8px out at 768** on the
   headline — right at both design widths and wrong in between, which is the
   worst kind of wrong because 390 and 1440 both look correct.

   So: derive the preferred line from the two endpoints the way the css does
   (`b + m*vw`, solved through them), then clamp it to [min, max] exactly as
   `clamp()` would. Matches the live section at 390, 768, 1024 and 1440. */
const fluid = (min: number, max: number, vw: number) => {
  const m = (max - min) / (1440 - 390);
  return Math.min(max, Math.max(min, min + m * (vw - 390)));
};

/* ⚠ THE HEADLINE IS NOT SOLVED THROUGH ITS ENDPOINTS. Its css is
   clamp(3.25rem, 1.14rem + 5.4vw, 9rem): the vw term is steeper than the line
   through (390, 52) and (1440, 96), so between the ends it sits BELOW that
   line — 59.7px at 768, not 67.8. Stated as the real formula so the stage
   matches the page at every width, not only the two that were measured. */
const headClamp = (min: number, max: number, vw: number) =>
  Math.min(max, Math.max(min, 1.14 * 16 + (5.4 * vw) / 100));

/* ⚠ THE SAME CURVE PROBLEM ON THE HEADLINE'S TOP. It is
   --space-m + nav height + --space-3xl, three clamps stacked, so it is 168 at
   390, **173 at 768** and 200 at 1440 — a line through the ends says 180 at
   768. These are globals.css's own numbers; if a token there changes, change
   it here and the stage follows. */
const TOK = {
  spaceM: [1.5, 1.27, 0.57, 1.875],
  navH: [3, 2.54, 1.14, 3.75],
  space3xl: [6, 5.09, 2.29, 7.5],
  navInset: [1, 0.2571, 3.0476, 3],
  spaceL: [2, 1.7, 0.76, 2.5],
} as const;
const tok = ([mn, b, m, mx]: readonly number[], vw: number) =>
  Math.min(mx * 16, Math.max(mn * 16, b * 16 + (m * vw) / 100));

const SNAP = 6; /* px — the threshold real tools use (6-10) */
const KEY = "larpz.hero-tuner";

/* defaults per kind. w/h are % of the viewport, size/radius are px.
   `box` with radius 999 and a fill IS the button — there is no kind: "button",
   same as /pricing-tuner, because a named slot is less useful than a shape. */
const NEW: Record<El["kind"], Partial<El>> = {
  text: { text: "Text", size: 20, color: "#000000", weight: 400, align: "center" },
  box: { text: "Button", w: 14, h: 6, radius: 999, fill: "#000000", color: "#ffffff", size: 16, weight: 600 },
  ellipse: { text: "", w: 6, h: 10, fill: "#000000", color: "#ffffff", size: 15, weight: 600 },
  line: { text: "", w: 20, size: 2, fill: "#000000" },
};

/* ⚠ NAMES ARE "<kind> <n>", NUMBERED FROM THE HIGHEST ALREADY USED for that
   kind — not the array length, which collides after a delete. Names are the
   selection handle, so a collision points the panel at the wrong element. */
const nextName = (els: El[], kind: El["kind"]) => {
  const n = els.reduce((max, e) => {
    const m = e.name.match(new RegExp("^" + kind + " (\\d+)$"));
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
  return `${kind} ${n + 1}`;
};

const HANDLES: [string, number, number][] = [
  ["nw", -1, -1], ["n", 0, -1], ["ne", 1, -1],
  ["w", -1, 0], ["e", 1, 0],
  ["sw", -1, 1], ["s", 0, 1], ["se", 1, 1],
];
const CURSOR: Record<string, string> = {
  nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize",
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
};

const cloneEls = (e: El[]): El[] => e.map((x) => ({ ...x }));

/* ⚠ DEFINED AT MODULE SCOPE, NOT INSIDE THE COMPONENT.

   A component declared inside another component is a NEW FUNCTION on every
   render, so React sees a different component type each time, unmounts the
   old subtree and mounts a fresh one. Any <input> inside it loses focus on
   every keystroke — which is exactly the "I can only type one letter at a
   time" bug: the first character re-rendered the page, `Row` was re-created,
   and the field the caret was in no longer existed.

   Nothing here closes over state, so hoisting costs nothing and the inputs
   keep their identity across renders. */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="mb-1.5 flex items-center gap-2">
    <span className="w-[74px] shrink-0 text-black/50">{label}</span>
    {children}
  </label>
);

/* a labelled slider + number box. Every numeric dial in the panel is one of
   these, so a range and its box can never disagree. */
const Dial = ({
  label, v, on, min, max, step = 0.1,
}: { label: string; v: number; on: (n: number) => void; min: number; max: number; step?: number }) => (
  <Row label={label}>
    <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => on(+e.target.value)} className="w-full" />
    <input type="number" step={step} value={v} onChange={(e) => on(+e.target.value)} className="w-16 rounded border border-black/15 px-1.5 py-1" />
  </Row>
);

export default function HeroTuner() {
  const [els, setEls] = useState<El[]>(() => HERO.els);
  const [ground, setGround] = useState<Ground>(GROUND);
  const [sel, setSel] = useState<number | null>(null);
  const [panel, setPanel] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | { msg: string; run: () => void }>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [restored, setRestored] = useState(false);
  /* the stage's own width, so a fluid pair can show what it resolves to and
     the nav/headline render at the size they will be on the page. */
  const [vw, setVw] = useState(1440);
  /* ⚠ READ FROM THE STAGE, NOT `window`, AND IN AN EFFECT. The dropdown's
     height is a % of the viewport and has to resolve to px to render; reading
     window.innerHeight during render is a hydration mismatch (the server has
     no window) and never updates on resize. */
  const [vh, setVh] = useState(900);
  /* which piece of furniture is selected, so it gets the same blue outline an
     element gets. null when an element is selected instead. */
  const [gsel, setGsel] = useState<"nav" | "head" | null>(null);
  /* ⚠ WHICH ELEMENTS LIVE IN THE NAV, BY NAME, KEPT OUTSIDE `El`.
     `El` is Pricing's exported type and the shared <PriceEl> renders it —
     adding a hero-only `parent` field there would push a tuner concern into
     the section's own data. A set of names is enough, and names are already
     unique and already the selection handle.

     An element in here renders INSIDE the <nav>, so it moves with the bar and
     its x/y are percentages OF THE NAV, which is what "inside" has to mean
     for a button in a nav bar. */
  const [inNav, setInNav] = useState<string[]>(() =>
    HERO.els.filter((e) => e.in === "nav").map((e) => e.name),
  );
  /* the same idea for the dropdown. An element in here renders inside the
     OPEN panel, so its x/y are percentages of the panel. */
  const [inMenu, setInMenu] = useState<string[]>(() =>
    HERO.els.filter((e) => e.in === "menu").map((e) => e.name),
  );
  /* true while a moving element is over the bar, so the bar can show it is a
     drop target rather than leaving you to guess. */
  const [navHot, setNavHot] = useState(false);
  const [menuHot, setMenuHot] = useState(false);
  /* ⚠ THE DROPDOWN IS A STAGE STATE, NOT AN ANIMATION TO WATCH. Held open so
     elements can be arranged INSIDE the open panel; the real transition is on
     /hero. Without this the panel's area cannot be laid out against at all. */
  const [navOpen, setNavOpen] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  /* ---- persistence ------------------------------------------------------
     ⚠ sessionStorage, NOT localStorage, AND THAT IS THE WHOLE TRICK.

     A hard refresh cannot be told apart from a soft one: both report
     PerformanceNavigationTiming.type === "reload" and there is no flag for
     ctrl+shift+R. So "survives refresh but not a hard refresh" is not
     implementable as asked.

     sessionStorage is the honest version of the same intent: it survives
     EVERY refresh, soft or hard, and clears when the tab closes. Work is
     never lost to a reload; a fresh tab opens clean on what is live in
     Hero.tsx. `reset` below is the explicit "throw it away now" button.

     ⚠ RESTORE RUNS ONCE, IN AN EFFECT. Re-initialising the key on load is the
     usual reason a saved draft "disappears on refresh" — the write races the
     read and overwrites it with the defaults. The `restored` flag gates every
     save until the first read has happened. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw) as {
          els?: El[]; ground?: Ground; inNav?: string[]; inMenu?: string[];
        };
        if (Array.isArray(v.els)) setEls(v.els);
        /* spread over the defaults so a config saved before a new dial
           existed still loads, with the new dial at its default. */
        if (v.ground) setGround({ ...GROUND, ...v.ground });
        if (Array.isArray(v.inNav)) setInNav(v.inNav);
        if (Array.isArray(v.inMenu)) setInMenu(v.inMenu);
        setToast("restored your last session");
        setTimeout(() => setToast(null), 2200);
      }
    } catch {
      /* private mode, blocked storage, or corrupt json — open on defaults */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ els, ground, inNav, inMenu }));
    } catch {
      /* quota or blocked — the tuner still works, it just will not persist */
    }
  }, [els, ground, inNav, inMenu, restored]);

  useEffect(() => {
    const read = () => {
      setVw(stage.current?.clientWidth ?? window.innerWidth);
      setVh(stage.current?.clientHeight ?? window.innerHeight);
    };
    read();
    const ro = new ResizeObserver(read);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  const navH = tok(TOK.navH, vw) + (ground.navMax - GROUND.navMax);
  const headSize = headClamp(ground.headMin, ground.headMax, vw);
  const navInset = tok(TOK.navInset, vw) + (ground.navInsetMax - GROUND.navInsetMax);
  /* ⚠ OFFSET BY THE DIFFERENCE FROM THE TOKEN DEFAULT, so dragging still
     works but an untouched tuner sits exactly where the page does at EVERY
     width, not just the two that were measured. */
  const headX = tok(TOK.navInset, vw) + tok(TOK.spaceL, vw) + (ground.headXMax - GROUND.headXMax);
  const headY = tok(TOK.spaceM, vw) + tok(TOK.navH, vw) + tok(TOK.space3xl, vw) + (ground.headYMax - GROUND.headYMax);
  const navY = tok(TOK.spaceM, vw) + (ground.navYMax - GROUND.navYMax);

  /* ⚠ THE LIVE DRAG STATE IS A REF, NOT STATE. React batches state and a
     pointermove at 120Hz would drop frames reading it back. The ref holds the
     grab origin; only the resulting element values go through setState. */
  const drag = useRef<{
    pointerId: number; i: number; mode: "move" | string;
    startX: number; startY: number; el: El; w: number; h: number; diag: number;
  } | null>(null);

  const undo = useRef<El[][]>([]);
  const redo = useRef<El[][]>([]);
  const [, bump] = useState(0);

  const push = useCallback(() => {
    undo.current.push(cloneEls(els));
    if (undo.current.length > 100) undo.current.shift();
    redo.current = [];
    bump((n) => n + 1);
  }, [els]);

  const set = (i: number, patch: Partial<El>) =>
    setEls((v) => v.map((e, ei) => (ei === i ? { ...e, ...patch } : e)));

  const current = sel !== null ? els[sel] : undefined;
  const navOf = (el: El) => inNav.includes(el.name);
  const menuOf = (el: El) => inMenu.includes(el.name);

  /* ---- snapping -------------------------------------------------------
     Every line worth snapping to: the viewport's edges and centre, the nav's
     bottom edge, the headline's left edge, plus each OTHER element's edges
     and centre. Percentages throughout, converted to px only for the test. */
  const snapLines = (skip: number, w: number, h: number) => {
    const xs = [0, 50, 100, (navInset / w) * 100, 100 - (navInset / w) * 100, (headX / w) * 100];
    const ys = [0, 50, 100];
    if (ground.showNav) ys.push((navY / h) * 100, ((navY + navH) / h) * 100);
    els.forEach((e, i) => {
      if (i === skip || e.show === false) return;
      const hw = (e.w ?? 0) / 2, hh = (e.h ?? 0) / 2;
      xs.push(e.x - hw, e.x, e.x + hw);
      ys.push(e.y - hh, e.y, e.y + hh);
    });
    return { xs, ys };
  };

  const applySnap = (
    val: number, half: number, lines: number[], pxPerPct: number,
  ): { v: number; guide?: number } => {
    let best: { v: number; guide: number; d: number } | null = null;
    for (const anchor of [val - half, val, val + half]) {
      for (const line of lines) {
        const d = Math.abs(anchor - line) * pxPerPct;
        if (d <= SNAP && (!best || d < best.d)) best = { v: val + (line - anchor), guide: line, d };
      }
    }
    return best ? { v: best.v, guide: best.guide } : { v: val };
  };

  /* ---- pointer --------------------------------------------------------- */
  const onDown = (e: React.PointerEvent, i: number, mode: "move" | string) => {
    e.stopPropagation();
    e.preventDefault();
    setGsel(null);
    /* ⚠ CAPTURE, FILTERED BY pointerId. Without capture the drag dies the
       moment the cursor leaves the element; without the id filter a second
       touch hijacks an in-progress resize. */
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    /* ⚠ MEASURE THE ELEMENT'S OWN CONTAINER, NOT ALWAYS THE STAGE. A
       nav-parented element's x/y are percentages OF THE NAV, so dividing the
       cursor travel by the stage width would move it at the wrong rate — a
       1425px divisor for a 1329px box. */
    const box = stage.current;
    if (!box) return;
    const host = navOf(els[i]) ? box.querySelector<HTMLElement>("nav") ?? box : box;
    const b = host.getBoundingClientRect();
    push();

    /* ⚠ A SIDE HANDLE ON AUTO-WIDTH TEXT SEEDS FROM WHAT IS RENDERED. Text has
       no `w` until it is given one, so resizing from 0 collapsed it to nothing
       on the first pixel of drag. Measuring the live box turns the auto-width
       element into a fixed-width one at exactly its current size, which is
       Figma's auto-width -> fixed switch. */
    const el = { ...els[i] };
    const node = box.querySelector<HTMLElement>(`[data-el="${i}"] > div > div`);
    if (el.kind === "text" && mode !== "move" && el.w === undefined) {
      const rendered = node?.getBoundingClientRect().width ?? 0;
      if (rendered) el.w = +((rendered / b.width) * 100).toFixed(1);
    }

    /* the corner's distance from the element's centre, captured ONCE, so the
       gesture cannot run away as the element resizes under the cursor. */
    const rect = node?.getBoundingClientRect();
    const diag = Math.max(24, Math.hypot(rect?.width ?? 60, rect?.height ?? 20) / 2);

    drag.current = {
      pointerId: e.pointerId, i, mode,
      startX: e.clientX, startY: e.clientY,
      el, w: b.width, h: b.height, diag,
    };
    setSel(i);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;

    const dxPct = ((e.clientX - d.startX) / d.w) * 100;
    const dyPct = ((e.clientY - d.startY) / d.h) * 100;
    const pxX = d.w / 100, pxY = d.h / 100;
    const L = snapLines(d.i, d.w, d.h);
    const g: Guide[] = [];

    if (d.mode === "move") {
      /* the live drop-target highlight. Same precedence as the drop itself:
         the panel wins over the bar, or dropping into an open panel would
         light up the bar instead. */
      const hit = (r: DOMRect | undefined) =>
        !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      const pb = stage.current?.querySelector("[data-menu-panel]")?.getBoundingClientRect();
      const nb = stage.current?.querySelector("nav")?.getBoundingClientRect();
      setMenuHot(hit(pb));
      setNavHot(!hit(pb) && hit(nb));
      const hw = (d.el.w ?? 0) / 2, hh = (d.el.h ?? 0) / 2;
      const sx = applySnap(d.el.x + dxPct, hw, L.xs, pxX);
      const sy = applySnap(d.el.y + dyPct, hh, L.ys, pxY);
      if (sx.guide !== undefined) g.push({ x: sx.guide });
      if (sy.guide !== undefined) g.push({ y: sy.guide });
      set(d.i, { x: +sx.v.toFixed(1), y: +sy.v.toFixed(1) });
    } else {
      const [, ux, uy] = HANDLES.find((h) => h[0] === d.mode)!;
      const fromCentre = e.altKey;

      /* ⚠ TEXT SCALES ITS FONT, IT DOES NOT GET A BOX. A corner bakes the
         scale into fontSize (Konva's text-resize move); a side handle sets the
         wrap width and leaves the font alone, which is Figma's split.

         ⚠ THE REFERENCE DISTANCE IS FROM POINTERDOWN, NOT READ LIVE. Reading
         the rect each pointermove divides by a box that is itself shrinking,
         so the factor runs away — a -25px drag took 37.7px type to 5.7px in
         /pricing-tuner before `diag` was captured once. */
      if (d.el.kind === "text" && ux && uy) {
        const grow = (e.clientX - d.startX) * ux + (e.clientY - d.startY) * uy;
        const factor = Math.max(0.15, 1 + grow / d.diag);
        const prevSize = typeof d.el.size === "number" ? d.el.size : parseFloat(String(d.el.size)) || 16;
        set(d.i, { size: +Math.min(400, Math.max(4, prevSize * factor)).toFixed(1) });
        setGuides([]);
        return;
      }

      let w = d.el.w ?? 0, h = d.el.h ?? 0, x = d.el.x, y = d.el.y;

      /* ⚠ THE CENTRE MOVES BY HALF THE SIZE CHANGE ACTUALLY APPLIED, not half
         the cursor travel. Clamping w/h at a minimum while the centre followed
         the cursor is what carried a shrinking box off the stage: w/h stopped
         at the minimum but x kept walking. */
      const MIN = 1;
      if (ux) {
        const dw = dxPct * ux * (fromCentre ? 2 : 1);
        w = Math.max(MIN, (d.el.w ?? 0) + dw);
        if (!fromCentre) x = d.el.x + ((w - (d.el.w ?? 0)) / 2) * ux;
      }
      if (uy && d.el.kind !== "line") {
        const dh = dyPct * uy * (fromCentre ? 2 : 1);
        h = Math.max(MIN, (d.el.h ?? 0) + dh);
        if (!fromCentre) y = d.el.y + ((h - (d.el.h ?? 0)) / 2) * uy;
      }
      /* ⚠ RE-PIN AFTER THE ASPECT FIX, or the anchored corner drifts while
         shift is held. */
      if (e.shiftKey && ux && uy && d.el.w && d.el.h) {
        h = Math.max(MIN, w * (d.el.h / d.el.w));
        if (!fromCentre) y = d.el.y + ((h - d.el.h) / 2) * uy;
      }
      const patch: Partial<El> = { w: +w.toFixed(1), x: +x.toFixed(1) };
      if (d.el.kind !== "line") { patch.h = +h.toFixed(1); patch.y = +y.toFixed(1); }
      set(d.i, patch);
    }
    setGuides(g);
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    setGuides([]);
    setNavHot(false);
    setMenuHot(false);

    /* ⚠ DROPPED ON THE NAV? THEN IT LIVES IN THE NAV.
       Drag a button over the bar and let go and it becomes a child of it —
       moving with the bar from then on. Drag it back out and it returns to
       the stage. No button, no mode: where you drop it is what it means.

       Only a move re-parents. A resize that happens to end over the bar is
       still a resize.

       ⚠ THE COORDINATES HAVE TO BE CONVERTED, NOT CARRIED. x/y are
       percentages OF THE CONTAINER, so 50,50 of the stage is a completely
       different place from 50,50 of the nav. Re-stating the element's rect
       against its new host is what stops it jumping on the frame it moves. */
    if (d.mode !== "move") return;
    const stageEl = stage.current;
    const navEl = stageEl?.querySelector<HTMLElement>("nav");
    if (!stageEl || !navEl) return;

    /* ⚠ THE PANEL IS TESTED BEFORE THE BAR. When the dropdown is open the
       panel hangs directly off the bar's bottom edge, and the surface behind
       them is one box — so a point in the panel is NOT inside the <nav>'s own
       rect, but the two are adjacent and easy to confuse. Checking the panel
       first means a drop into the panel can never be read as a drop onto the
       bar. */
    const panelEl = stageEl.querySelector<HTMLElement>("[data-menu-panel]");
    const inside = (r: DOMRect | undefined) =>
      !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;

    const pb = panelEl?.getBoundingClientRect();
    const nb = navEl.getBoundingClientRect();
    const overMenu = inside(pb);
    const overNav = !overMenu && inside(nb);

    const was = inMenu.includes(d.el.name) ? "menu" : inNav.includes(d.el.name) ? "nav" : "section";
    const now = overMenu ? "menu" : overNav ? "nav" : "section";
    if (now === was) return;

    const host = now === "menu" ? pb! : now === "nav" ? nb : stageEl.getBoundingClientRect();
    const node = stageEl.querySelector<HTMLElement>(`[data-el="${d.i}"] > div > div`);
    const r = node?.getBoundingClientRect();
    if (r) {
      const patch: Partial<El> = {
        x: +(((r.left + r.width / 2 - host.left) / host.width) * 100).toFixed(1),
        y: +(((r.top + r.height / 2 - host.top) / host.height) * 100).toFixed(1),
      };
      /* a % width/height means the same re-statement */
      if (els[d.i]?.w !== undefined) patch.w = +((r.width / host.width) * 100).toFixed(1);
      if (els[d.i]?.h !== undefined) patch.h = +((r.height / host.height) * 100).toFixed(1);
      set(d.i, patch);
    }
    setInNav((v) => (now === "nav" ? [...new Set([...v, d.el.name])] : v.filter((n) => n !== d.el.name)));
    setInMenu((v) => (now === "menu" ? [...new Set([...v, d.el.name])] : v.filter((n) => n !== d.el.name)));
  };

  /* ⚠ DECLARED ABOVE ITS FIRST USE. `const` is in the temporal dead zone
     until its initialiser runs, so the ground-drag handlers below cannot
     close over it if it is declared further down the component. */
  const g = (patch: Partial<Ground>) => setGround((v) => ({ ...v, ...patch }));

  /* ---- dragging the nav and the headline ------------------------------
     ⚠ THEY ARE PART OF THE LAYOUT, SO THEY DRAG TOO. They are not in `els`
     — they are the section's own furniture and the config prints them
     separately — but a tuner where two of the four things on screen can only
     be moved by typing a number is not a tuner. Same pointer-capture dance,
     writing to `ground` instead of an element.

     The nav moves in y only: it is full-bleed by design and its x is the
     inset, which has its own dial. */
  const gdrag = useRef<{ pointerId: number; what: "nav" | "head"; x: number; y: number; gx: number; gy: number } | null>(null);

  const onGroundDown = (e: React.PointerEvent, what: "nav" | "head") => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSel(null);
    setGsel(what);
    gdrag.current = {
      pointerId: e.pointerId, what,
      x: e.clientX, y: e.clientY,
      gx: what === "head" ? headX : 0,
      gy: what === "head" ? headY : navY,
    };
  };

  const onGroundMove = (e: React.PointerEvent) => {
    const d = gdrag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const b = stage.current?.getBoundingClientRect();
    if (!b) return;
    if (d.what === "nav") {
      /* both ends by the same px, like the headline */
      const dy = e.clientY - d.y;
      g({ navYMin: +(ground.navYMin + dy).toFixed(1), navYMax: +(ground.navYMax + dy).toFixed(1) });
      d.y = e.clientY;
    } else {
      /* ⚠ A DRAG MOVES BOTH ENDS OF THE CLAMP BY THE SAME PX. The headline's
         position is a 390->1440 pair, so nudging only the value at THIS width
         would silently skew the other end. Shifting both keeps the ramp and
         moves the whole thing. */
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      g({
        headXMin: +(ground.headXMin + dx).toFixed(1), headXMax: +(ground.headXMax + dx).toFixed(1),
        headYMin: +(ground.headYMin + dy).toFixed(1), headYMax: +(ground.headYMax + dy).toFixed(1),
      });
      d.x = e.clientX; d.y = e.clientY; /* incremental, so both ends track */
    }
  };

  const onGroundUp = (e: React.PointerEvent) => {
    if (gdrag.current && e.pointerId === gdrag.current.pointerId) {
      gdrag.current = null;
      setGuides([]);
    }
  };

  const add = (kind: El["kind"]) => {
    push();
    const el: El = {
      name: nextName(els, kind), kind, text: "", x: 50, y: 50, ...NEW[kind],
    } as El;
    setEls((v) => [...v, el]);
    setSel(els.length);
  };

  const duplicate = () => {
    if (sel === null || !current) return;
    push();
    setEls((v) => [...v, { ...current, name: nextName(v, current.kind), y: current.y + 5 }]);
    setSel(els.length);
  };

  const remove = () => {
    if (sel === null) return;
    push();
    const gone = els[sel]?.name;
    setEls((v) => v.filter((_, i) => i !== sel));
    /* drop the parent record too, or a later element that reuses the name
       would silently inherit a nav parent it never asked for. */
    if (gone) setInNav((v) => v.filter((n) => n !== gone));
    setSel(null);
  };

  /* z-order: the array order is the paint order. */
  const reorder = (dir: -1 | 1) => {
    if (sel === null) return;
    const j = sel + dir;
    if (j < 0 || j >= els.length) return;
    push();
    setEls((v) => {
      const n = [...v];
      [n[sel], n[j]] = [n[j], n[sel]];
      return n;
    });
    setSel(j);
  };

  /* ---- keyboard -------------------------------------------------------- */
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      if (confirm) return; /* the dialog owns the keyboard while it is up */

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        const from = ev.shiftKey ? redo : undo;
        const to = ev.shiftKey ? undo : redo;
        const prev = from.current.pop();
        if (prev) { to.current.push(cloneEls(els)); setEls(prev); bump((n) => n + 1); }
        return;
      }
      /* arrows nudge the selected ground piece too — same step, same feel as
         an element, so there is one way to move things not two. */
      if (gsel) {
        const d = ev.shiftKey ? 1 : 0.1;
        const by: Record<string, [number, number]> = {
          ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d],
        };
        const m = by[ev.key];
        if (!m) return;
        ev.preventDefault();
        if (gsel === "nav") {
          const px = ev.shiftKey ? 10 : 1;
          g({ navYMin: +(ground.navYMin + m[1] * px * 10).toFixed(1), navYMax: +(ground.navYMax + m[1] * px * 10).toFixed(1) });
        }
        else {
          /* arrows move px here, not %, because the position is a px pair.
             shift = 10px, plain = 1px — the element nudge is in % so the
             numbers differ, the feel does not. */
          const px = ev.shiftKey ? 10 : 1;
          g({
            headXMin: +(ground.headXMin + m[0] * px / (ev.shiftKey ? 1 : 0.1) * 0.1).toFixed(1),
            headXMax: +(ground.headXMax + m[0] * px / (ev.shiftKey ? 1 : 0.1) * 0.1).toFixed(1),
            headYMin: +(ground.headYMin + m[1] * px / (ev.shiftKey ? 1 : 0.1) * 0.1).toFixed(1),
            headYMax: +(ground.headYMax + m[1] * px / (ev.shiftKey ? 1 : 0.1) * 0.1).toFixed(1),
          });
        }
        return;
      }

      if (sel === null || !current) return;

      if (ev.key === "Delete" || ev.key === "Backspace") { ev.preventDefault(); remove(); return; }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "d") { ev.preventDefault(); duplicate(); return; }

      const d = ev.shiftKey ? 1 : 0.1;
      const by: Record<string, [number, number]> = {
        ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d],
      };
      const m = by[ev.key];
      if (!m) return;
      ev.preventDefault();
      if (!ev.repeat) push();
      set(sel, { x: +(current.x + m[0]).toFixed(1), y: +(current.y + m[1]).toFixed(1) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---- the config block ------------------------------------------------ */
  /* ⚠ `phone`, `wordmark` AND `navLinks` ARE PRINTED BACK VERBATIM FROM THE
     LIVE HERO, not from any dial here. This tuner does not edit them, and the
     block it prints REPLACES the whole `HERO` object — so emitting it without
     them would silently delete the phone pose the moment it was pasted.
     Re-emitting what was imported keeps the paste lossless.

     `stickers` WAS in this list and is not any more: the hero's stickers were
     removed, so `HERO.stickers` does not exist. Printing it emitted
     `stickers: undefined` and `JSON.stringify` returned undefined, which broke
     the build on `.split` — and re-adding the key on paste would hand the hero
     back a layer it no longer renders.

     `menu` is NOT in this list: its panel height IS tuned here, so it is
     printed from the dial below with its other keys carried through. */
  const verbatim = (k: "phone" | "wordmark" | "navLinks") =>
    `  ${k}: ${JSON.stringify((HERO as Record<string, unknown>)[k], null, 2).split("\n").join("\n  ")},`;
  const config = `/* paste into sections/Hero.tsx — arranged in /hero-tuner */
export const HERO = {
  bg: ${JSON.stringify(ground.bg)},
  nav: { h: [${ground.navMin}, ${ground.navMax}], radius: ${ground.navRadius}, inset: [${ground.navInsetMin}, ${ground.navInsetMax}], y: [${ground.navYMin}, ${ground.navYMax}], fill: ${JSON.stringify(ground.navFill)}, show: ${ground.showNav} },
  /* nav height and headline size are CLAMPS, min at 390 -> max at 1440:
     height: clamp(${ground.navMin}px, …, ${ground.navMax}px)  = ${navH.toFixed(1)}px at this width
     font-size: clamp(${ground.headMin}px, …, ${ground.headMax}px) = ${headSize.toFixed(1)}px at this width */
  headline: {
    lines: ${JSON.stringify(ground.headline.split("\n"))},
    color: ${JSON.stringify(ground.headColor)},
    min: ${ground.headMin},
    max: ${ground.headMax},
    x: [${ground.headXMin}, ${ground.headXMax}],
    y: [${ground.headYMin}, ${ground.headYMax}],
    leading: ${ground.headLeading},
    weight: ${ground.headWeight},
    tracking: ${ground.headTracking},
    align: ${JSON.stringify(ground.headAlign)} as "left" | "center" | "right",
    font: ${JSON.stringify(ground.headFont)} as "display" | "sans",
    caps: ${ground.headCaps},
    italic: ${ground.headItalic},
    show: ${ground.showHead},
  },
  /* the dropdown. panelHeight is px; tuned as ${ground.menuH}% of the viewport,
     = ${Math.round((ground.menuH / 100) * vh)}px at this stage height. */
  menu: { x: ${HERO.menu.x}, y: ${HERO.menu.y}, panelHeight: ${Math.round((ground.menuH / 100) * vh)}, overlay: ${HERO.menu.overlay} },
  /* ↓ not tuned here — carried through from Hero.tsx unchanged. */
${verbatim("phone")}
${verbatim("wordmark")}
${verbatim("navLinks")}
  els: [
${els.map((e) => {
    const keys: (keyof El)[] = ["name", "kind", "text", "x", "y", "w", "h", "size", "radius", "opacity", "rotate", "weight", "align", "font", "fill", "color", "border", "borderColor", "italic", "strike", "caps", "tracking", "show"];
    const bits = keys
      .filter((k) => (e[k] !== undefined && e[k] !== "") || k === "name" || k === "kind" || k === "x" || k === "y")
      .filter((k) => !(k === "text" && e.text === ""))
      .map((k) => `${k}: ${typeof e[k] === "number" ? +(e[k] as number).toFixed(2) : JSON.stringify(e[k])}`);
    /* `in: "nav"` means x/y are percentages OF THE NAV, not of the section. */
    if (navOf(e)) bits.push(`in: "nav"`);
    if (menuOf(e)) bits.push(`in: "menu"`);
    return `    { ${bits.join(", ")} },`;
  }).join("\n")}
  ],
};`;

  const copy = () => {
    navigator.clipboard.writeText(config).then(
      () => { setToast("config copied"); setTimeout(() => setToast(null), 1600); },
      () => { setToast("copy blocked — select the box and copy"); setTimeout(() => setToast(null), 2600); },
    );
  };

  /* ⚠ CONFIRM BEFORE ANYTHING THAT THROWS WORK AWAY. Reset wipes every
     element and the saved session; it is the one irreversible button here
     (undo does not survive it), so it asks first. */
  const reset = () =>
    setConfirm({
      msg: `Discard ${els.length} element${els.length === 1 ? "" : "s"}, every ground change, and clear the saved session? This cannot be undone.`,
      run: () => {
        setEls([]);
        setGround(GROUND);
        setInNav([]);
        setInMenu([]);
        setSel(null);
        undo.current = [];
        redo.current = [];
        try { sessionStorage.removeItem(KEY); } catch {}
        setToast("reset to what is live in Hero.tsx");
        setTimeout(() => setToast(null), 2000);
      },
    });

  const num = (v: number | undefined) => (v === undefined ? "" : String(+v.toFixed(2)));

  /* a labelled row in the panel. The panel is most of this file and every row
     is the same three parts, so it is one local component rather than fifty
     repeats of the same div. */
  /* ⚠ ONE ELEMENT, RENDERED THE SAME WHEREVER IT LIVES. Pulled out of the
     map so the stage and the nav can both draw elements without a second copy
     of the markup — the thing that let /faq-tuner drift from its section. */
  /* ⚠ CALLED AS A FUNCTION, NOT RENDERED AS <ElView />.
     It closes over sel/els/onDown, so it cannot be hoisted to module scope —
     but rendering it as a component makes it a new component TYPE on every
     render, which remounts every element and kills focus and in-flight drags.
     Calling it returns the same JSX inline, so React only sees the elements
     themselves and reconciles them by key as usual. */
  const elView = (el: El, i: number) => {
    const picked = sel === i;
    return (
        /* ⚠ `contents`, NOT `relative z-20`. The elements have to paint
           above <Scene>'s own z-10 canvas wrapper, but a positioned
           wrapper here becomes the containing block for the absolute
           <PriceEl> inside it — and since the wrapper is 0-high, a
           `height: 6%` element resolved to 200x0 and could not be
           grabbed. `contents` generates no box at all, so PriceEl keeps
           resolving its percentages against the STAGE; the z-order is
           handled by the stage's own isolate + the canvas at z-0. */
        <div key={i} data-el={i} style={{ display: "contents" }}>
          {/* ⚠ `display: contents` ON THE DRAG WRAPPER, NOT A PLAIN DIV.
              <PriceEl> renders position:absolute, so a wrapper div around
              it has NO CONTENT to size to: it measured 1425x0 and its
              centre landed on the canvas instead of the element, so every
              drag hit the phone and nothing moved. `contents` makes the
              wrapper generate no box at all, and the handler rides on
              PriceEl's own absolute box. Verified with elementFromPoint —
              the hit-test that catches exactly this. */}
          <div onPointerDown={(e) => onDown(e, i, "move")} style={{ display: "contents" }}>
            {/* a hidden element still shows here, at 30%, so it can be
                selected and switched back on. `contents` means opacity
                cannot go on the wrapper — it has no box — so it rides on
                PriceEl's own opacity instead. */}
            <PriceEl
              el={{
                ...el,
                show: true,
                opacity: el.show === false ? (el.opacity ?? 100) * 0.3 : el.opacity,
              }}
            />
          </div>

          {picked && (
            <div
              /* ⚠ THE BOX HUGS THE ELEMENT. Auto-width text has no w/h, so
                 the frame sizes to its content rather than guessing. */
              style={{
                left: `${el.x}%`, top: `${el.y}%`,
                width: el.w ? `${el.w}%` : "max-content",
                maxWidth: el.w ? undefined : "92%",
                height: el.h ? `${el.h}%` : undefined,
                transform: `translate(-50%, -50%) rotate(${el.rotate ?? 0}deg)`,
                fontSize: `${el.size ?? 16}px`,
                fontWeight: el.weight ?? 400,
                letterSpacing: `${el.tracking ?? 0}em`,
                /* the frame measures the glyphs to size its handles, so it has
                   to be set in the same face or they sit off the text. */
                fontFamily: el.font === "display" ? "var(--font-display)" : undefined,
                textTransform: el.caps ? "uppercase" : undefined,
                lineHeight: 1.25,
              }}
              className="pointer-events-none absolute outline-1 outline-sky-400"
            >
              {/* ⚠ ALWAYS MEASURED, EVEN AT FIXED WIDTH. Without this copy
                  a fixed-width text frame has NO HEIGHT, so all six handles
                  collapse onto one line and a side handle hits a corner. */}
              {el.kind === "text" && (
                <span
                  /* must wrap exactly like <PriceEl> or the frame measures a
                     different number of lines and the handles sit off the
                     text — including the 92% ceiling on auto-width. */
                  className="invisible block whitespace-pre-wrap"
                  style={{ textAlign: el.align ?? "center", maxWidth: el.w ? undefined : "92%" }}
                >
                  {el.text || " "}
                </span>
              )}
              {/* line: no vertical handles. text: no n/s — the corners
                  scale the font and e/w set the wrap. */}
              {HANDLES.filter(([, , uy]) => (el.kind === "line" ? uy === 0 : true))
                .filter(([, ux]) => (el.kind === "text" ? ux !== 0 : true))
                .map(([k, ux, uy]) => (
                  <span
                    key={k}
                    onPointerDown={(e) => onDown(e, i, k)}
                    style={{ left: `${50 + ux * 50}%`, top: `${50 + uy * 50}%`, cursor: CURSOR[k] }}
                    className="pointer-events-auto absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-sky-500 bg-white"
                  />
                ))}
            </div>
          )}
        </div>
    );
  };

  return (
    <div className="h-dvh w-full overflow-hidden" style={{ background: ground.bg }}>
      {/* ⚠ THE STAGE IS THE FULL VIEWPORT. Not a column beside the panel, and
          not a fixed-width box — it has to be the shape of the real page or
          every percentage tuned against it is wrong on the page. */}
      <div
        ref={stage}
        onPointerMove={(e) => { onMove(e); onGroundMove(e); }}
        onPointerUp={(e) => { onUp(e); onGroundUp(e); }}
        onPointerCancel={(e) => { onUp(e); onGroundUp(e); }}
        onPointerDown={() => { setSel(null); setGsel(null); }}
        /* `isolate` keeps the canvas's z-10 inside THIS stacking context
           rather than competing with the panel's z-40. The canvas is z-0
           here and everything after it in DOM order paints on top. */
        className="relative isolate h-full w-full overflow-hidden pt-(--space-m)"
      >
        {/* the real nav, driven by the ground dials */}
        {ground.showNav && (
          <nav
            aria-label="Main"
            onPointerDown={(e) => onGroundDown(e, "nav")}
            /* ⚠ ABSOLUTE AND DRAGGABLE. On the page the nav is in flow with a
               top padding; here it is positioned so it can be dragged in y
               like everything else. `navY` seeds from the measured 29px. */
            style={{
              position: "absolute",
              left: `${navInset}px`,
              right: `${navInset}px`,
              top: `${navY}px`,
              height: `${navH}px`,
              borderRadius: `${ground.navRadius}px`,
              background: ground.navFill,
            }}
            /* ⚠ z-30, MATCHING THE PAGE. The headline is z-20 and comes later
               in source, so at an equal z it paints over the open dropdown
               and the hero's type shows through the panel. Same fix, same
               reason, as sections/Hero.tsx. */
            className={`z-30 cursor-grab transition-shadow active:cursor-grabbing ${
              navHot
                ? "shadow-[0_0_0_3px_rgb(56_189_248)]"
                : gsel === "nav"
                  ? "outline-2 outline-offset-2 outline-sky-400"
                  : ""
            }`}
          >
            {/* ⚠ ELEMENTS PARENTED TO THE NAV RENDER IN IT. <PriceEl> is
                absolute with percentage x/y, and the <nav> is the nearest
                positioned ancestor, so those percentages resolve against the
                BAR with no change to PriceEl at all — and a nav element moves
                when the bar moves, which is the whole point of "inside". */}
            {els.map((el, i) => (navOf(el) ? elView(el, i) : null))}

            {/* ⚠ THE REAL HAMBURGER, AND IT TOGGLES THE PANEL. The stage
                carries the page's own furniture, so the way you open the
                dropdown here is the way you open it there — click it. The
                checkbox in the side panel does the same thing and is kept
                because it can hold the panel open while you work.

                ⚠ `stopPropagation` ON pointerdown, OR THE NAV DRAG EATS THE
                CLICK. The <nav> starts a y-drag on pointerdown, which captures
                the pointer, so without this the button never sees a click at
                all and the panel cannot be opened from the stage.

                Not part of `els` — like the nav and the headline it is the
                section's furniture, and <NavMenuWithPanel> on the page owns
                the real one. This is the handle, not a copy of the animation. */}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={navOpen}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setNavOpen((v) => !v); }}
              className="absolute z-10 grid h-11 w-11 cursor-pointer place-items-center rounded-lg border-0 bg-transparent p-0"
              style={{ left: `${HERO.menu.x}%`, top: `${HERO.menu.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <span className="relative block h-[14px] w-[22px]">
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-0 block h-[2px] w-full rounded-full transition-transform duration-300"
                    style={{
                      background: HERO.wordmark.color,
                      top: "50%",
                      transform: navOpen
                        ? `translateY(-50%) rotate(${i === 0 ? -45 : 45}deg) scaleX(0.75)`
                        : `translateY(calc(-50% + ${i === 0 ? -3 : 3}px))`,
                    }}
                  />
                ))}
              </span>
            </button>

            {/* ⚠ THE DROPDOWN, HELD OPEN SO IT CAN BE LAID OUT AGAINST. On
                /hero this expands with grid-template-rows 0fr -> 1fr; here it
                is simply present or not, because a panel mid-transition is
                not a thing you can arrange elements inside.

                ⚠ ITS HEIGHT IS A PERCENTAGE OF THE VIEWPORT, like every other
                dimension here, so what is arranged against it holds at any
                window size. Hero.tsx states it in px, so the config block
                converts — see `menuH` there. */}
            {navOpen && (
              <div
                data-menu-panel=""
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute right-0 left-0 top-full mt-[6px] ${menuHot ? "shadow-[0_0_0_3px_rgb(217_70_239)]" : ""}`}
                style={{
                  height: `${(ground.menuH / 100) * vh}px`,
                  background: ground.navFill,
                  borderRadius: `${ground.navRadius}px`,
                }}
              >
                {els.map((el, i) => (menuOf(el) ? elView(el, i) : null))}
              </div>
            )}
          </nav>
        )}

        {/* the real headline. the breaks are the design, so it is one line per
            row of the textarea rather than a wrapped block. */}
        {ground.showHead && (
          <h1
            onPointerDown={(e) => onGroundDown(e, "head")}
            style={{
              position: "absolute",
              left: `${headX}px`,
              top: `${headY}px`,
              /* ⚠ TOP-LEFT ANCHORED, exactly like the page: the real h1 sits
                 at --space-m + nav + --space-3xl from the top and
                 --nav-inset + --space-l from the left. No centring transform
                 — the measured y IS the top of the block. */
              color: ground.headColor,
              fontSize: `${headSize}px`,
              lineHeight: ground.headLeading,
              /* the same styles the live <h1> takes, so the stage is the
                 page rather than an approximation of it. */
              fontFamily: ground.headFont === "display" ? "var(--font-display)" : undefined,
              fontWeight: ground.headWeight,
              letterSpacing: ground.headTracking ? `${ground.headTracking}em` : undefined,
              textAlign: ground.headAlign,
              textTransform: ground.headCaps ? "uppercase" : "none",
              fontStyle: ground.headItalic ? "italic" : undefined,
            }}
            className={`z-20 m-0 cursor-grab active:cursor-grabbing ${gsel === "head" ? "outline-2 outline-offset-2 outline-sky-400" : ""}`}
          >
            {ground.headline.split("\n").map((l, i) => (
              <span key={i} className="block">{l}</span>
            ))}
          </h1>
        )}

        {/* the elements, drawn with the section's own renderer */}
        {/* ⚠ STAGE-LEVEL ELEMENTS ONLY. One parented to the nav is rendered
            INSIDE the <nav> instead, so it moves with the bar and its
            percentages resolve against it. */}
        {els.map((el, i) => (navOf(el) || menuOf(el) ? null : elView(el, i)))}

        {/* snap guides */}
        {guides.map((gg, k) =>
          gg.x !== undefined ? (
            <div key={k} style={{ left: `${gg.x}%` }} className="pointer-events-none absolute top-0 bottom-0 w-px bg-fuchsia-500" />
          ) : (
            <div key={k} style={{ top: `${gg.y}%` }} className="pointer-events-none absolute right-0 left-0 h-px bg-fuchsia-500" />
          ),
        )}
      </div>

      {/* ⚠ FLOATING, NOT A COLUMN, and hideable. A column takes its width off
          the stage, so the stage stops being the shape of the real page. */}
      <button
        onClick={() => setPanel((v) => !v)}
        className="fixed top-4 right-4 z-[60] rounded-full bg-black px-4 py-2 text-[13px] text-white shadow-lg"
      >
        {panel ? "hide panel" : "tuner"}
      </button>

      {/* ⚠ NO stopPropagation ON THE PANEL. It was there to stop a click in
          the panel deselecting, but the panel is a SIBLING of the stage — the
          event never bubbles there anyway, so it bought nothing. What it did
          do was swallow pointerdown before <input type="color"> could start
          its own drag, so the hex square could be clicked but not dragged
          inside. */}
      <aside
        hidden={!panel}
        className="fixed top-16 right-4 z-40 max-h-[calc(100dvh-5rem)] w-[340px] overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-4 text-[13px] shadow-2xl backdrop-blur"
      >
        <h1 className="mb-1 font-semibold">hero tuner</h1>
        <p className="mb-3 text-black/50">
          drag to move, handles to resize (shift = aspect, alt = from centre).
          arrows nudge 0.1%, shift 1%. ctrl+z undo, ctrl+d duplicate, del
          removes. saved to this tab — a refresh keeps it, closing the tab
          does not.
        </p>

        <div className="mb-3 flex flex-wrap gap-1">
          {(["text", "box", "ellipse", "line"] as El["kind"][]).map((k) => (
            <button key={k} onClick={() => add(k)} className="rounded border border-black/15 px-2 py-1">
              + {k === "box" ? "button/box" : k}
            </button>
          ))}
          <button disabled={!current} onClick={duplicate} className="rounded border border-black/15 px-2 py-1 disabled:opacity-30">
            duplicate
          </button>
        </div>

        {/* ---- the ground: bg, nav, headline ---- */}
        <details open className="mb-3 rounded border border-black/10 p-2">
          <summary className="cursor-pointer select-none font-medium">ground</summary>

          <div className="mt-2">
            <Row label="bg">
              <input type="color" value={ground.bg} onChange={(e) => g({ bg: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
              <input value={ground.bg} onChange={(e) => g({ bg: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>

            <div className="mt-2 mb-1 flex items-center gap-2 font-medium">
              nav
              <label className="ml-auto flex items-center gap-1 font-normal text-black/50">
                <input type="checkbox" checked={ground.showNav} onChange={(e) => g({ showNav: e.target.checked })} />
                show
              </label>
            </div>
            {/* ⚠ A MIN/MAX PAIR, NOT ONE HEIGHT. The live nav is
                h-(--space-xl), a clamp from 48 at 390 to 60 at 1440. The
                readout is what the pair resolves to at THIS stage width. */}
            <Row label="h @390">
              <input type="range" min={0} max={160} step={0.1} value={ground.navMin} onChange={(e) => g({ navMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navMin} onChange={(e) => g({ navMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="h @1440">
              <input type="range" min={0} max={160} step={0.1} value={ground.navMax} onChange={(e) => g({ navMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navMax} onChange={(e) => g({ navMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <p className="mb-1.5 text-[11px] text-black/40">= {navH.toFixed(1)}px at {Math.round(vw)}px wide</p>
            <Row label="y @390">
              <input type="range" min={0} max={400} step={0.1} value={ground.navYMin} onChange={(e) => g({ navYMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navYMin} onChange={(e) => g({ navYMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="y @1440">
              <input type="range" min={0} max={400} step={0.1} value={ground.navYMax} onChange={(e) => g({ navYMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navYMax} onChange={(e) => g({ navYMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="radius">
              {/* ⚠ px, NOT a percentage. A % radius resolves PER-AXIS, so 50%
                  on a wide bar rounds the horizontal by half its width and the
                  bar reads as an ellipse. The browser clamps a px radius that
                  exceeds the box, so 999 is a true pill at any size. */}
              <input type="range" min={0} max={999} step={0.1} value={ground.navRadius} onChange={(e) => g({ navRadius: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navRadius} onChange={(e) => g({ navRadius: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="inset @390">
              <input type="range" min={0} max={200} step={0.1} value={ground.navInsetMin} onChange={(e) => g({ navInsetMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navInsetMin} onChange={(e) => g({ navInsetMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="inset @1440">
              <input type="range" min={0} max={200} step={0.1} value={ground.navInsetMax} onChange={(e) => g({ navInsetMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.navInsetMax} onChange={(e) => g({ navInsetMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <p className="mb-1.5 text-[11px] text-black/40">= {navInset.toFixed(1)}px at {Math.round(vw)}px wide</p>
            <Row label="fill">
              <input type="color" value={ground.navFill} onChange={(e) => g({ navFill: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
              <input value={ground.navFill} onChange={(e) => g({ navFill: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>

            <div className="mt-2 mb-1 flex items-center gap-2 font-medium">
              headline
              <label className="ml-auto flex items-center gap-1 font-normal text-black/50">
                <input type="checkbox" checked={ground.showHead} onChange={(e) => g({ showHead: e.target.checked })} />
                show
              </label>
            </div>
            <textarea
              value={ground.headline}
              onChange={(e) => g({ headline: e.target.value })}
              rows={3}
              className="mb-1.5 w-full rounded border border-black/15 px-1.5 py-1 font-mono text-[12px]"
            />
            <p className="mb-1.5 text-[11px] text-black/40">one line per row — the breaks are the design, not wrapping.</p>
            {/* ⚠ THE LIVE HEADLINE IS clamp(3.25rem, 1.14rem + 5.4vw, 9rem),
                which solves to 52px at 390 and **96px at 1440** — the 9rem
                ceiling never applies at either design width. Tune the two
                ends, not one middle number. */}
            <Row label="@390">
              <input type="range" min={12} max={300} step={0.1} value={ground.headMin} onChange={(e) => g({ headMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headMin} onChange={(e) => g({ headMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="@1440">
              <input type="range" min={12} max={300} step={0.1} value={ground.headMax} onChange={(e) => g({ headMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headMax} onChange={(e) => g({ headMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <p className="mb-1.5 text-[11px] text-black/40">= {headSize.toFixed(1)}px at {Math.round(vw)}px wide</p>
            {/* px from the top-left, a pair like everything else fluid here.
                drag the headline on the stage and both ends move together. */}
            <Row label="x @390">
              <input type="range" min={0} max={600} step={0.1} value={ground.headXMin} onChange={(e) => g({ headXMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headXMin} onChange={(e) => g({ headXMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="x @1440">
              <input type="range" min={0} max={1400} step={0.1} value={ground.headXMax} onChange={(e) => g({ headXMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headXMax} onChange={(e) => g({ headXMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="y @390">
              <input type="range" min={0} max={844} step={0.1} value={ground.headYMin} onChange={(e) => g({ headYMin: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headYMin} onChange={(e) => g({ headYMin: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="y @1440">
              <input type="range" min={0} max={1200} step={0.1} value={ground.headYMax} onChange={(e) => g({ headYMax: +e.target.value })} className="w-full" />
              <input type="number" step={0.1} value={ground.headYMax} onChange={(e) => g({ headYMax: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <p className="mb-1.5 text-[11px] text-black/40">= {headX.toFixed(0)}, {headY.toFixed(0)}px at {Math.round(vw)}px wide</p>
            <Row label="leading">
              <input type="range" min={0.6} max={2} step={0.01} value={ground.headLeading} onChange={(e) => g({ headLeading: +e.target.value })} className="w-full" />
              <input type="number" step={0.01} value={ground.headLeading} onChange={(e) => g({ headLeading: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="colour">
              <input type="color" value={ground.headColor} onChange={(e) => g({ headColor: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
              <input value={ground.headColor} onChange={(e) => g({ headColor: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>

            {/* ⚠ THESE FIVE WERE TAILWIND CLASSES ON THE <h1> and could not be
                tuned at all. They are styles on both sides now. */}
            <Dial label="weight" v={ground.headWeight} on={(n) => g({ headWeight: n })} min={100} max={900} step={100} />
            <Dial label="tracking" v={ground.headTracking} on={(n) => g({ headTracking: n })} min={-0.1} max={0.4} step={0.005} />
            <Row label="align">
              <select value={ground.headAlign} onChange={(e) => g({ headAlign: e.target.value as Ground["headAlign"] })} className="w-full rounded border border-black/15 px-1.5 py-1">
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </Row>
            <Row label="face">
              <select value={ground.headFont} onChange={(e) => g({ headFont: e.target.value as Ground["headFont"] })} className="w-full rounded border border-black/15 px-1.5 py-1">
                <option value="display">display (Megion)</option>
                <option value="sans">sans (Neue Montreal)</option>
              </select>
            </Row>
            <div className="mb-1.5 flex gap-3">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={ground.headCaps} onChange={(e) => g({ headCaps: e.target.checked })} />
                caps
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={ground.headItalic} onChange={(e) => g({ headItalic: e.target.checked })} />
                italic
              </label>
            </div>
          </div>
        </details>

        {/* ---- the dropdown ---- */}
        <details className="mb-3 rounded border border-black/10 p-2">
          <summary className="cursor-pointer select-none font-medium">dropdown panel</summary>
          <div className="mt-2">
            <label className="mb-2 flex items-center gap-2">
              <input type="checkbox" checked={navOpen} onChange={(e) => setNavOpen(e.target.checked)} />
              hold the panel open
            </label>
            <p className="mb-2 text-[11px] text-black/40">
              open it, then use <b>put in panel</b> on an element to arrange it
              inside. its x/y become percentages of the panel, so it moves with
              the panel and holds at any width. the real open/close animation is
              on /hero — this is just the end state to lay out against.
            </p>
            {/* ⚠ A % OF THE VIEWPORT, NOT PX, like every other dimension here.
                Hero.tsx wants px, so the config block converts at the current
                stage height and prints both. */}
            <Dial label="height %" v={ground.menuH} on={(n) => g({ menuH: n })} min={0} max={90} step={0.5} />
            <p className="mb-1.5 text-[11px] text-black/40">
              = {Math.round((ground.menuH / 100) * vh)}px at this stage height.
              it takes the nav&apos;s fill and radius.
            </p>
          </div>
        </details>

        {/* ---- the element list ---- */}
        <div className="mb-2 max-h-40 overflow-y-auto rounded border border-black/10">
          {els.length === 0 && <p className="p-2 text-black/40">no elements yet — add one above.</p>}
          {els.map((e, i) => (
            <div
              key={i}
              onClick={() => setSel(i)}
              className={`flex cursor-pointer items-center gap-2 px-2 py-1 ${sel === i ? "bg-black text-white" : ""}`}
            >
              <span className="truncate">{e.name}</span>
              {navOf(e) && <span className={`shrink-0 text-[10px] ${sel === i ? "text-white/60" : "text-sky-600"}`}>nav</span>}
              {menuOf(e) && <span className={`shrink-0 text-[10px] ${sel === i ? "text-white/60" : "text-fuchsia-600"}`}>panel</span>}
              <button
                onClick={(ev) => { ev.stopPropagation(); push(); set(i, { show: e.show === false }); }}
                className={`ml-auto shrink-0 text-[11px] ${sel === i ? "text-white/70" : "text-black/40"}`}
              >
                {e.show === false ? "hidden" : "shown"}
              </button>
            </div>
          ))}
        </div>

        {/* ---- the selected element ---- */}
        {current && sel !== null && (
          <div className="mb-3 rounded border border-black/10 p-2">
            <Row label="name">
              <input value={current.name} onChange={(e) => set(sel, { name: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>
            {/* ⚠ PARENTING AS A DROPDOWN, NOT ONLY AS A DRAG. Dragging onto
                the bar already worked, but there was no way to put something
                in the panel (you cannot drop onto a panel that is closed) and
                no way to see where an element currently lives. Changing this
                does NOT convert x/y — the element keeps its numbers and they
                now mean percentages of the new parent, which is usually what
                is wanted when moving something into a bar. */}
            <Row label="lives in">
              <select
                value={menuOf(current) ? "menu" : navOf(current) ? "nav" : "section"}
                onChange={(e) => {
                  const v = e.target.value;
                  const n = current.name;
                  push();
                  setInNav((a) => (v === "nav" ? [...new Set([...a, n])] : a.filter((m) => m !== n)));
                  setInMenu((a) => (v === "menu" ? [...new Set([...a, n])] : a.filter((m) => m !== n)));
                  if (v === "menu") setNavOpen(true);
                }}
                className="w-full rounded border border-black/15 px-1.5 py-1"
              >
                <option value="section">the section</option>
                <option value="nav">the nav bar</option>
                <option value="menu">the dropdown panel</option>
              </select>
            </Row>
            <Row label="text">
              <textarea value={current.text ?? ""} onChange={(e) => set(sel, { text: e.target.value })} rows={2} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <div className="grid grid-cols-2 gap-x-2">
              <Row label="x %"><input type="number" step={0.1} value={num(current.x)} onChange={(e) => set(sel, { x: +e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" /></Row>
              <Row label="y %"><input type="number" step={0.1} value={num(current.y)} onChange={(e) => set(sel, { y: +e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" /></Row>
              <Row label="w %"><input type="number" step={0.1} value={num(current.w)} onChange={(e) => set(sel, { w: e.target.value === "" ? undefined : +e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" /></Row>
              {current.kind !== "line" && (
                <Row label="h %"><input type="number" step={0.1} value={num(current.h)} onChange={(e) => set(sel, { h: e.target.value === "" ? undefined : +e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" /></Row>
              )}
            </div>
            <Row label="size px">
              <input type="range" min={1} max={300} step={0.1} value={typeof current.size === "number" ? current.size : parseFloat(String(current.size)) || 16} onChange={(e) => set(sel, { size: +e.target.value })} className="w-full" />
              <input type="number" value={num(typeof current.size === "number" ? current.size : parseFloat(String(current.size)) || undefined)} onChange={(e) => set(sel, { size: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            {current.kind !== "text" && (
              <Row label="radius">
                <input type="range" min={0} max={999} step={0.1} value={current.radius ?? 0} onChange={(e) => set(sel, { radius: +e.target.value })} className="w-full" />
                <input type="number" value={num(current.radius)} onChange={(e) => set(sel, { radius: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
              </Row>
            )}
            <Row label="rotate">
              <input type="range" min={-180} max={180} step={0.1} value={current.rotate ?? 0} onChange={(e) => set(sel, { rotate: +e.target.value })} className="w-full" />
              <input type="number" value={num(current.rotate)} onChange={(e) => set(sel, { rotate: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="opacity">
              <input type="range" min={0} max={100} step={0.1} value={current.opacity ?? 100} onChange={(e) => set(sel, { opacity: +e.target.value })} className="w-full" />
              <input type="number" value={num(current.opacity)} onChange={(e) => set(sel, { opacity: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="font">
              <select
                value={current.font ?? "sans"}
                onChange={(e) => { push(); set(sel, { font: e.target.value as El["font"] }); }}
                className="w-full rounded border border-black/15 px-1.5 py-1"
              >
                <option value="sans">Neue Montreal (body)</option>
                <option value="display">Megion (display)</option>
              </select>
            </Row>
            {/* ⚠ MEGION IS THE DEMO CUT: BOLD ONLY. The weight dial does
                nothing while it is selected — there is no other weight to
                pick, and the browser would fake one. Said here rather than
                silently ignoring the control. */}
            {current.font === "display" && (
              <p className="mb-1.5 text-[11px] text-black/40">Megion is bold-only — weight has no effect.</p>
            )}
            <Row label="weight">
              <select value={current.weight ?? 400} onChange={(e) => set(sel, { weight: +e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1">
                {[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </Row>
            <Row label="tracking">
              <input type="range" min={-0.1} max={0.5} step={0.005} value={current.tracking ?? 0} onChange={(e) => set(sel, { tracking: +e.target.value })} className="w-full" />
              <input type="number" step={0.005} value={num(current.tracking)} onChange={(e) => set(sel, { tracking: +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
            </Row>
            <Row label="align">
              <select value={current.align ?? "center"} onChange={(e) => set(sel, { align: e.target.value as El["align"] })} className="w-full rounded border border-black/15 px-1.5 py-1">
                <option value="left">left</option><option value="center">center</option><option value="right">right</option>
              </select>
            </Row>
            <Row label="text col">
              <input type="color" value={current.color ?? "#000000"} onChange={(e) => set(sel, { color: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
              <input value={current.color ?? ""} placeholder="#000000" onChange={(e) => set(sel, { color: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
            </Row>
            {current.kind !== "text" && (
              <>
                <Row label="fill">
                  <input type="color" value={current.fill ?? "#000000"} onChange={(e) => set(sel, { fill: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
                  <input value={current.fill ?? ""} placeholder="#000000" onChange={(e) => set(sel, { fill: e.target.value })} className="w-full rounded border border-black/15 px-1.5 py-1" />
                </Row>
                <Row label="border">
                  <input type="number" value={num(current.border)} onChange={(e) => set(sel, { border: e.target.value === "" ? undefined : +e.target.value })} className="w-16 rounded border border-black/15 px-1.5 py-1" />
                  <input type="color" value={current.borderColor ?? "#000000"} onChange={(e) => set(sel, { borderColor: e.target.value })} className="h-7 w-10 rounded border border-black/15" />
                </Row>
              </>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {(["caps", "italic", "strike"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => { push(); set(sel, { [k]: !current[k] } as Partial<El>); }}
                  className={`rounded border border-black/15 px-2 py-1 ${current[k] ? "bg-black text-white" : ""}`}
                >
                  {k}
                </button>
              ))}
              <button onClick={() => reorder(-1)} className="rounded border border-black/15 px-2 py-1">back</button>
              <button onClick={() => reorder(1)} className="rounded border border-black/15 px-2 py-1">front</button>
              <button onClick={remove} className="rounded border border-red-300 px-2 py-1 text-red-600">delete</button>
            </div>
          </div>
        )}

        {/* ---- the config ---- */}
        <div className="mb-2 flex gap-1">
          <button onClick={copy} className="flex-1 rounded bg-black px-2 py-1.5 text-white">copy config</button>
          <button onClick={reset} className="rounded border border-red-300 px-2 py-1.5 text-red-600">reset</button>
        </div>
        <textarea
          readOnly
          value={config}
          onFocus={(e) => e.currentTarget.select()}
          className="h-40 w-full rounded border border-black/10 bg-black/[0.03] p-2 font-mono text-[11px]"
        />
      </aside>

      {/* ⚠ A REAL DIALOG, NOT window.confirm. The native one is blocking and
          Playwright auto-dismisses it, so it cannot be tested — and it cannot
          be styled. This is the same floating-panel language as the rest. */}
      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onPointerDown={(e) => e.stopPropagation()}>
          <div role="alertdialog" aria-modal="true" className="w-[340px] rounded-xl bg-white p-4 text-[13px] shadow-2xl">
            <p className="mb-4">{confirm.msg}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded border border-black/15 px-3 py-1.5">cancel</button>
              <button
                data-confirm="yes"
                onClick={() => { confirm.run(); setConfirm(null); }}
                className="rounded bg-red-600 px-3 py-1.5 text-white"
              >
                discard
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black px-4 py-2 text-[13px] text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
