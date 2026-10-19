"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PriceEl as El } from "@/sections/Pricing";
import PriceEl from "@/components/PriceEl";

/* Pricing tuner. Add shapes and text to three independent cards, drag them,
 * resize them from eight handles, and copy the config back into the section.
 *
 * ⚠ A WORKBENCH. It does not touch sections/Pricing.tsx — it prints a config
 * and the section is edited by hand from it. That is what stops a tuner
 * breaking the thing it tunes.
 *
 * ⚠ SEEDED FROM THE SECTION'S OWN CARDS, so it always opens on what is live.
 * /faq-tuner and Faq.tsx had already drifted to four pills against six before
 * that rule existed.
 *
 * ⚠ IT DRAWS WITH THE SECTION'S OWN <PriceEl>. The FAQ tuner rebuilds a dead
 * pill and keeps every class in step by hand; this renders the real thing.
 *
 * ⚠ THE STAGE IS THE REAL CARD ROW, 1:1 — same max-w, flex-1, gutter, 640px.
 *
 * Mechanics taken from how real editors do it:
 *   - setPointerCapture, filtered by pointerId, so a drag survives leaving the
 *     element and a second touch cannot hijack it;
 *   - eight resize handles, shift = keep aspect, alt = resize from centre;
 *   - snapping to the card's own edges/centre and to every other element's
 *     edges/centres, 6px threshold, with the guide drawn;
 *   - one undo entry per completed interaction, not per pointermove.
 */

type Card = { name: string; els: El[]; fill?: string };

/* ⚠ THE LAST ABSOLUTE ARRANGEMENT, MOVED HERE FROM sections/Pricing.tsx. The
   section is a flow layout now and no longer reads these, so this tuner tunes
   nothing live — it is kept only until someone retires it. */
const CARDS: Card[] = [
  {
    name: "Card 1",
    els: [
      { name: "text 1", kind: "text", text: "Starter", x: 50, y: 7.6, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$14", x: 50, y: 16.8, w: 86, size: "clamp(44px, 3.8cqw + 24px, 62px)", weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "7 days", x: 50, y: 23.5, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60, show: false },
      { name: "box 5", kind: "box", text: "Get Started", btn: true, x: 50, y: 33.1, w: 86, h: 8.8, size: 18, radius: 999, weight: 600, caps: true, tracking: 0.03, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "iOS & Android access", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Access to core AI tools", x: 50, y: 60.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Up to 3 active projects", x: 50, y: 73.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Community support", x: 50, y: 85.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
  {
    name: "Card 2",
    els: [
      { name: "text 1", kind: "text", text: "Monthly", x: 50, y: 9.0, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$44", x: 50, y: 16.8, w: 86, size: "clamp(44px, 3.8cqw + 24px, 62px)", weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "/month", x: 50, y: 23.6, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60 },
      { name: "box 5", kind: "box", text: "Try It Free", btn: true, x: 50, y: 33.5, w: 86, h: 8.8, size: 18, radius: 999, weight: 600, caps: true, tracking: 0.03, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "Everything in Starter", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Unlimited active projects", x: 50, y: 57.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Advanced AI tools", x: 50, y: 67.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Priority email support", x: 50, y: 76.5, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 11", kind: "text", text: "Custom export presets", x: 50, y: 86.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
  {
    name: "Card 3",
    els: [
      { name: "text 1", kind: "text", text: "Lifetime", x: 50, y: 7.6, w: 86, size: 26, font: "display", caps: true, align: "left", color: "var(--color-violet)" },
      { name: "text 2", kind: "text", text: "$149", x: 50, y: 15.7, w: 86, size: "clamp(44px, 3.8cqw + 24px, 62px)", weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 3", kind: "text", text: "once", x: 50, y: 22.2, w: 86, size: 16, weight: 400, align: "left", color: "var(--color-violet)", opacity: 60 },
      { name: "box 5", kind: "box", text: "Buy Lifetime", btn: true, x: 50, y: 33.2, w: 86, h: 8.8, size: 18, radius: 999, weight: 600, caps: true, tracking: 0.03, fill: "var(--color-violet)", color: "var(--color-grape)" },
      { name: "text 7", kind: "text", text: "Everything in Monthly", x: 50, y: 48.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 8", kind: "text", text: "Lifetime updates", x: 50, y: 56.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 9", kind: "text", text: "Early access to tools", x: 50, y: 64.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 10", kind: "text", text: "Founder badge", x: 50, y: 72.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 11", kind: "text", text: "Direct line to the team", x: 50, y: 80.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
      { name: "text 12", kind: "text", text: "No subscription, ever", x: 50, y: 88.0, w: 86, size: 20, weight: 400, align: "left", color: "var(--color-violet)" },
    ],
  },
];
type Guide = { x?: number; y?: number };

const SNAP = 6; /* px — the threshold real tools use (6-10) */

const clone = (c: Card[]): Card[] => c.map((x) => ({ ...x, els: x.els.map((e) => ({ ...e })) }));

/* a hex for `<input type="color">`, which refuses anything else and silently
   shows black. The config holds design tokens, so they are resolved off the
   live computed styles rather than hardcoded here — a re-pick in globals.css
   then moves the tuner's swatches with it.
   ⚠ `"use client"` DOES NOT MEAN "BROWSER ONLY". A client component still
   prerenders on the server, where there is no `getComputedStyle` — without
   this guard the whole route 500s on `getComputedStyle is not defined`. */
const swatch = (v: string | undefined) => {
  if (!v) return "#ffffff";
  const t = v.match(/^var\((--[\w-]+)\)$/);
  if (!t) return v;
  if (typeof window === "undefined") return "#ffffff";
  const live = getComputedStyle(document.documentElement).getPropertyValue(t[1]).trim();
  return /^#[0-9a-f]{6}$/i.test(live) ? live : "#ffffff";
};
const START: Card[] = clone(CARDS as Card[]);

/* defaults per kind. w/h are % of the card, size/radius are px. */
const NEW: Record<El["kind"], Partial<El>> = {
  text: { text: "Text", size: 18, w: undefined, color: "var(--color-violet)", weight: 400, align: "center" },
  box: { text: "", w: 60, h: 12, radius: 8, fill: "var(--color-violet)", color: "var(--color-grape)", size: 15, weight: 600 },
  ellipse: { text: "", w: 20, h: 12, fill: "var(--color-violet)", color: "var(--color-grape)", size: 15, weight: 600 },
  line: { text: "", w: 60, size: 1, fill: "var(--color-violet)" },
};

/* ⚠ NAMES ARE "<kind> <n>", INCLUDING ON A DUPLICATE. Appending " copy"
   compounded — six duplicates gave "text 4 copy copy copy copy copy copy",
   which is unreadable in the list and in the config. A duplicate is just the
   next element of its kind, so it is numbered like any other.

   The number is one past the highest already used for that kind, not the array
   length, so deleting element 3 of 5 and adding another does not collide with
   an existing name. Names are the selection handle, so a collision would point
   the panel at the wrong element. */
const nextName = (els: El[], kind: El["kind"]) => {
  const n = els.reduce((max, e) => {
    const m = e.name.match(new RegExp("^" + kind + " (\\d+)$"));
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
  return `${kind} ${n + 1}`;
};

/* the eight handles, as unit offsets from the centre. */
const HANDLES: [string, number, number][] = [
  ["nw", -1, -1], ["n", 0, -1], ["ne", 1, -1],
  ["w", -1, 0], ["e", 1, 0],
  ["sw", -1, 1], ["s", 0, 1], ["se", 1, 1],
];
const CURSOR: Record<string, string> = {
  nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize",
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
};

export default function PricingTuner() {
  const [cards, setCards] = useState<Card[]>(START);
  /* opens on card 1 so the element list and the add buttons are there without
     having to click a tab first. index 0 is fine when the card is empty — the
     list renders empty and `current` is simply undefined. */
  const [sel, setSel] = useState<{ c: number; i: number } | null>({ c: 0, i: 0 });
  const [panel, setPanel] = useState(true);
  const [copied, setCopied] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const stage = useRef<HTMLDivElement>(null);

  /* ⚠ THE LIVE DRAG STATE IS A REF, NOT STATE. React batches state and a
     pointermove at 120Hz would drop frames reading it back. The ref holds the
     grab origin; only the resulting element values go through setState. */
  const drag = useRef<{
    pointerId: number; c: number; i: number; mode: "move" | string;
    startX: number; startY: number; el: El; cardW: number; cardH: number; diag: number;
  } | null>(null);

  const undo = useRef<Card[][]>([]);
  const redo = useRef<Card[][]>([]);
  const [, bump] = useState(0);

  const push = useCallback(() => {
    undo.current.push(clone(cards));
    if (undo.current.length > 100) undo.current.shift();
    redo.current = [];
    bump((n) => n + 1);
  }, [cards]);

  const set = (c: number, i: number, patch: Partial<El>) =>
    setCards((v) => v.map((card, ci) =>
      ci === c ? { ...card, els: card.els.map((e, ei) => (ei === i ? { ...e, ...patch } : e)) } : card));

  const current = sel ? cards[sel.c]?.els[sel.i] : undefined;

  /* ---- snapping -------------------------------------------------------
     Collect every line worth snapping to: the card's edges and centre, plus
     each OTHER element's edges and centre. Then pull the moving box's own
     three anchors (left/centre/right) to the nearest within the threshold.
     Percentages throughout, converted to px only for the threshold test. */
  const snapLines = (c: number, skip: number, cardW: number, cardH: number) => {
    const xs = [0, 50, 100];
    const ys = [0, 50, 100];
    cards[c].els.forEach((e, i) => {
      if (i === skip || e.show === false) return;
      const hw = (e.w ?? 0) / 2, hh = (e.h ?? 0) / 2;
      xs.push(e.x - hw, e.x, e.x + hw);
      ys.push(e.y - hh, e.y, e.y + hh);
    });
    return { xs, ys, cardW, cardH };
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
  const onDown = (e: React.PointerEvent, c: number, i: number, mode: "move" | string) => {
    e.stopPropagation();
    e.preventDefault();
    /* ⚠ CAPTURE, FILTERED BY pointerId. Without capture the drag dies the
       moment the cursor leaves the element; without the id filter a second
       touch hijacks an in-progress resize. */
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const card = stage.current?.querySelector<HTMLElement>(`[data-card="${c}"]`);
    if (!card) return;
    const b = card.getBoundingClientRect();
    push();

    /* ⚠ A SIDE HANDLE ON AUTO-WIDTH TEXT SEEDS FROM WHAT IS RENDERED. Text has
       no `w` until it is given one, so resizing from 0 collapsed it to nothing
       on the first pixel of drag. Measuring the live box turns the auto-width
       element into a fixed-width one at exactly its current size, which is
       what Figma's auto-width -> fixed switch does. */
    const el = { ...cards[c].els[i] };
    if (el.kind === "text" && mode !== "move" && el.w === undefined) {
      const node = card.querySelector<HTMLElement>(`[data-el="${i}"] > div > div`);
      const rendered = node?.getBoundingClientRect().width ?? 0;
      if (rendered) el.w = +((rendered / b.width) * 100).toFixed(1);
    }

    /* the corner's distance from the element's centre, captured ONCE. The
       whole gesture is scaled against this so the rate cannot run away as the
       element resizes under the cursor. */
    const rect = card.querySelector<HTMLElement>(`[data-el="${i}"] > div > div`)?.getBoundingClientRect();
    const diag = Math.max(24, Math.hypot(rect?.width ?? 60, rect?.height ?? 20) / 2);

    drag.current = {
      pointerId: e.pointerId, c, i, mode,
      startX: e.clientX, startY: e.clientY,
      el, cardW: b.width, cardH: b.height, diag,
    };
    setSel({ c, i });
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;

    const dxPct = ((e.clientX - d.startX) / d.cardW) * 100;
    const dyPct = ((e.clientY - d.startY) / d.cardH) * 100;
    const pxX = d.cardW / 100, pxY = d.cardH / 100;
    const L = snapLines(d.c, d.i, d.cardW, d.cardH);
    const g: Guide[] = [];

    if (d.mode === "move") {
      const hw = (d.el.w ?? 0) / 2, hh = (d.el.h ?? 0) / 2;
      const sx = applySnap(d.el.x + dxPct, hw, L.xs, pxX);
      const sy = applySnap(d.el.y + dyPct, hh, L.ys, pxY);
      if (sx.guide !== undefined) g.push({ x: sx.guide });
      if (sy.guide !== undefined) g.push({ y: sy.guide });
      set(d.c, d.i, { x: +sx.v.toFixed(1), y: +sy.v.toFixed(1) });
    } else {
      /* resize. The handle's unit offset says which edges move. Alt resizes
         about the centre, shift keeps the aspect ratio. */
      const [, ux, uy] = HANDLES.find((h) => h[0] === d.mode)!;
      const fromCentre = e.altKey;

      /* ⚠ TEXT SCALES ITS FONT, IT DOES NOT GET A BOX. Konva's text-resize
         doc resets the transformer's scale and bakes it into the node
         (`width: width * scaleX, scaleX: 1`) — the same move, except a corner
         bakes into fontSize rather than width. A corner therefore scales the
         type; a side handle sets the wrap width and leaves the font alone,
         which is Figma's split too.

         The factor comes from the drag along the handle's own axis measured
         against the element's rendered half-width, so the type tracks the
         cursor instead of growing at some arbitrary rate. */
      if (d.el.kind === "text" && ux && uy) {
        /* ⚠ THE REFERENCE DISTANCE IS FROM POINTERDOWN, NOT READ LIVE. Reading
           the element's rect each pointermove divides by a box that is itself
           shrinking, so the factor runs away: a -25px drag took 37.7px type to
           5.7px. `d.diag` is captured once when the drag starts and the whole
           gesture is measured against it. Same class of bug as the FAQ push
           being measured with the push still applied. */
        const grow = (e.clientX - d.startX) * ux + (e.clientY - d.startY) * uy;
        const factor = Math.max(0.15, 1 + grow / d.diag);
        const prevSize = typeof d.el.size === "number" ? d.el.size : parseFloat(String(d.el.size)) || 16;
        set(d.c, d.i, { size: +Math.min(400, Math.max(4, prevSize * factor)).toFixed(1) });
        setGuides([]);
        return;
      }

      let w = d.el.w ?? 0, h = d.el.h ?? 0, x = d.el.x, y = d.el.y;

      /* ⚠ THE CENTRE MOVES BY HALF THE SIZE CHANGE THAT WAS ACTUALLY APPLIED,
         not by half the cursor travel. Clamping w/h at a minimum while the
         centre kept following the cursor is what distorted a shrinking box:
         drag the SE handle far enough and w/h stopped at 1 but x walked from
         50 to -7, carrying the box off the card. Deriving the shift from
         (w - w0) means the opposite edge stays pinned and the box simply
         stops at its minimum. */
      const MIN = 2;
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
      /* ⚠ RE-PIN AFTER THE ASPECT FIX. Forcing h from the ratio changed the
         height without moving the centre back, so the anchored corner drifted
         while shift was held. The y shift is restated from the h that was
         actually used. */
      if (e.shiftKey && ux && uy && d.el.w && d.el.h) {
        h = Math.max(MIN, w * (d.el.h / d.el.w));
        if (!fromCentre) y = d.el.y + ((h - d.el.h) / 2) * uy;
      }
      const patch: Partial<El> = { w: +w.toFixed(1), x: +x.toFixed(1) };
      if (d.el.kind !== "line") { patch.h = +h.toFixed(1); patch.y = +y.toFixed(1); }
      set(d.c, d.i, patch);
    }
    setGuides(g);
  };

  const onUp = (e: React.PointerEvent) => {
    if (drag.current && e.pointerId === drag.current.pointerId) {
      drag.current = null;
      setGuides([]);
    }
  };

  /* ---- keyboard -------------------------------------------------------- */
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;

      const z = ev.key.toLowerCase() === "z";
      if ((ev.ctrlKey || ev.metaKey) && z) {
        ev.preventDefault();
        const from = ev.shiftKey ? redo : undo;
        const to = ev.shiftKey ? undo : redo;
        const prev = from.current.pop();
        if (prev) { to.current.push(clone(cards)); setCards(prev); bump((n) => n + 1); }
        return;
      }
      if (!sel || !current) return;

      if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        push();
        setCards((v) => v.map((c, ci) => ci === sel.c ? { ...c, els: c.els.filter((_, i) => i !== sel.i) } : c));
        setSel(null);
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "d") {
        ev.preventDefault();
        push();
        setCards((v) => v.map((c, ci) =>
          ci === sel.c ? { ...c, els: [...c.els, { ...current, name: nextName(c.els, current.kind), y: current.y + 5 }] } : c));
        setSel({ c: sel.c, i: cards[sel.c].els.length });
        return;
      }

      const d = ev.shiftKey ? 1 : 0.1;
      const by: Record<string, [number, number]> = {
        ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d],
      };
      const m = by[ev.key];
      if (!m) return;
      ev.preventDefault();
      if (!ev.repeat) push();
      set(sel.c, sel.i, { x: +(current.x + m[0]).toFixed(1), y: +(current.y + m[1]).toFixed(1) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const add = (kind: El["kind"]) => {
    const c = sel?.c ?? 0;
    push();
    const n = cards[c].els.length;
    const el: El = {
      name: nextName(cards[c].els, kind), kind, text: "", x: 50, y: 50, ...NEW[kind],
    } as El;
    setCards((v) => v.map((card, ci) => (ci === c ? { ...card, els: [...card.els, el] } : card)));
    setSel({ c, i: n });
  };

  /* z-order: the array order is the paint order. */
  const reorder = (dir: -1 | 1) => {
    if (!sel) return;
    const { c, i } = sel;
    const j = i + dir;
    if (j < 0 || j >= cards[c].els.length) return;
    push();
    setCards((v) => v.map((card, ci) => {
      if (ci !== c) return card;
      const els = [...card.els];
      [els[i], els[j]] = [els[j], els[i]];
      return { ...card, els };
    }));
    setSel({ c, i: j });
  };

  const num = (v: number | undefined) => (v === undefined ? "" : String(+v.toFixed(2)));
  const config = `/* paste into sections/Pricing.tsx */
export const CARDS: { name: string; els: PriceEl[]; fill?: string }[] = [
${cards.map((c) => `  {
    name: ${JSON.stringify(c.name)},${c.fill ? `
    fill: ${JSON.stringify(c.fill)},` : ""}
    els: [
${c.els.map((e) => {
    const keys: (keyof El)[] = ["name", "kind", "text", "x", "y", "w", "h", "size", "radius", "opacity", "rotate", "weight", "align", "fill", "color", "border", "borderColor", "italic", "strike", "caps", "tracking", "show"];
    const bits = keys
      .filter((k) => e[k] !== undefined && e[k] !== "" || k === "name" || k === "kind" || k === "x" || k === "y")
      .filter((k) => !(k === "text" && e.text === ""))
      .map((k) => `${k}: ${typeof e[k] === "number" ? +(e[k] as number).toFixed(2) : JSON.stringify(e[k])}`);
    return `      { ${bits.join(", ")} },`;
  }).join("\n")}
    ],
  },`).join("\n")}
];`;

  return (
    <div className="h-dvh w-full overflow-hidden bg-violet">
      <div
        ref={stage}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerDown={() => setSel(null)}
        className="flex h-full w-full items-center justify-center px-(--gutter)"
      >
        <ul role="list" className="m-0 flex w-full max-w-[1200px] list-none flex-row items-stretch gap-[clamp(1rem,4.2vw,60px)] p-0">
          {cards.map((card, ci) => (
            <li
              key={ci}
              data-card={ci}
              style={card.fill ? { background: card.fill } : undefined}
              className="relative h-[640px] min-w-0 flex-1 overflow-hidden rounded-[20px] border-[3px] border-grape bg-grape"
            >
              {card.els.map((el, i) => {
                const picked = sel?.c === ci && sel.i === i;
                return (
                  <div key={i} data-el={i}>
                    <div
                      onPointerDown={(e) => onDown(e, ci, i, "move")}
                      style={{ opacity: el.show === false ? 0.3 : 1 }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <PriceEl el={{ ...el, show: true }} />
                    </div>

                    {/* selection box + handles, drawn over the element */}
                    {picked && (
                      <div
                        /* ⚠ THE BOX HUGS THE ELEMENT. Auto-width text has no
                           w/h, so the frame sizes itself to the content via
                           inset-auto rather than guessing with padding — the
                           handles then sit on the real glyphs. */
                        style={{
                          left: `${el.x}%`, top: `${el.y}%`,
                          width: el.w ? `${el.w}%` : "max-content",
                          height: el.h ? `${el.h}%` : undefined,
                          transform: `translate(-50%, -50%) rotate(${el.rotate ?? 0}deg)`,
                          /* the frame must measure like the text it wraps */
                          fontSize: typeof el.size === "string" ? el.size : `${el.size ?? 16}px`,
                          fontWeight: el.weight ?? 400,
                          letterSpacing: `${el.tracking ?? 0}em`,
                          textTransform: el.caps ? "uppercase" : undefined,
                          lineHeight: 1.25,
                        }}
                        className="pointer-events-none absolute outline-1 outline-sky-400"
                      >
                        {/* invisible copy, so the frame measures the glyphs.
                            only needed while the element is auto-width. */}
                        {/* ⚠ ALWAYS MEASURED, EVEN AT FIXED WIDTH. Without this
                            a fixed-width text frame had NO HEIGHT, so all six
                            handles collapsed onto one line — the corners sat on
                            top of e/w and grabbing a side handle hit a corner,
                            scaling the font when it should have set the wrap.
                            The copy gives the frame the text's real height. */}
                        {el.kind === "text" && (
                          <span
                            className={`invisible block ${el.w ? "whitespace-pre-wrap" : "whitespace-pre"}`}
                            style={{ textAlign: el.align ?? "center" }}
                          >
                            {el.text || " "}
                          </span>
                        )}
                        {/* ⚠ TEXT GETS CORNERS TOO. A text element has no `w`
                            until you give it one, and the first version showed
                            only e/w on it — which resize the WRAP WIDTH and
                            never the type, so text could not be dragged bigger
                            at all. Corners scale the font; sides set the wrap.
                            That split is Figma's, and Konva's text-resize doc
                            is the same mechanism (bake the scale in, reset it). */}
                        {/* line: no vertical handles. text: no n/s, because its
                            height follows the type — the four corners scale the
                            font and e/w set the wrap. */}
                        {HANDLES.filter(([, , uy]) => (el.kind === "line" ? uy === 0 : true))
                          .filter(([, ux]) => (el.kind === "text" ? ux !== 0 : true))
                          .map(([k, ux, uy]) => (
                          <span
                            key={k}
                            onPointerDown={(e) => onDown(e, ci, i, k)}
                            style={{
                              left: `${50 + ux * 50}%`, top: `${50 + uy * 50}%`,
                              cursor: CURSOR[k],
                            }}
                            className="pointer-events-auto absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-sky-500 bg-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* snap guides */}
              {sel?.c === ci && guides.map((g, k) =>
                g.x !== undefined ? (
                  <div key={k} style={{ left: `${g.x}%` }} className="pointer-events-none absolute top-0 bottom-0 w-px bg-fuchsia-500" />
                ) : (
                  <div key={k} style={{ top: `${g.y}%` }} className="pointer-events-none absolute right-0 left-0 h-px bg-fuchsia-500" />
                ),
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ⚠ FLOATING, NOT A COLUMN. A column takes its width off the stage, so
          the stage stops being the shape of the real page and every value
          tuned against it is wrong. */}
      <button
        onClick={() => setPanel((v) => !v)}
        className="fixed top-4 right-4 z-[60] rounded-full bg-black px-4 py-2 text-[13px] text-white shadow-lg"
      >
        {panel ? "hide panel" : "tuner"}
      </button>

      <aside
        hidden={!panel}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-16 right-4 z-40 max-h-[calc(100dvh-5rem)] w-[340px] overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-4 text-[13px] shadow-2xl backdrop-blur"
      >
        <h1 className="mb-1 font-semibold">pricing tuner</h1>
        <p className="mb-3 text-black/50">
          drag to move, handles to resize (shift = aspect, alt = from centre).
          arrows nudge 0.1%, shift 1%. ctrl+z undo, ctrl+d duplicate, del
          removes.
        </p>

        <div className="mb-3 flex gap-1">
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() => setSel({ c: i, i: 0 })}
              className={`flex-1 truncate rounded border border-black/15 px-2 py-1 ${sel?.c === i ? "bg-black text-white" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {(["text", "box", "ellipse", "line"] as El["kind"][]).map((k) => (
            <button key={k} onClick={() => add(k)} className="rounded border border-black/15 px-2 py-1">
              + {k}
            </button>
          ))}
          {/* duplicate the selected element. ctrl+d does the same; the button
              is here because the shortcut is not discoverable. */}
          <button
            disabled={!current}
            onClick={() => {
              if (!sel || !current) return;
              push();
              setCards((v) => v.map((c, ci) =>
                ci === sel.c
                  ? { ...c, els: [...c.els, { ...current, name: nextName(c.els, current.kind), y: current.y + 5 }] }
                  : c));
              setSel({ c: sel.c, i: cards[sel.c].els.length });
            }}
            className="rounded border border-black/15 px-2 py-1 disabled:opacity-30"
          >
            duplicate
          </button>
          <button
            onClick={() => { push(); setCards(clone(START)); setSel(null); }}
            className="rounded border border-black/15 px-2 py-1"
          >
            reset
          </button>
        </div>

        {/* ⚠ COPY A WHOLE CARD ONTO THE OTHERS. The cards are independent by
            design, which means laying out card 1 and then rebuilding it twice
            by hand. This copies the arrangement across and leaves each copy
            free to diverge — independence is kept, the retyping is not. */}
        {sel && (
          <div className="mb-3 flex gap-1">
            <button
              onClick={() => {
                push();
                const src = cards[sel.c];
                setCards((v) => v.map((c, i) =>
                  i === sel.c ? c : { ...c, els: src.els.map((e) => ({ ...e })) }));
              }}
              className="flex-1 rounded border border-black/15 px-2 py-1"
            >
              copy this card → others
            </button>
          </div>
        )}

        <div className="mb-3 flex gap-1">
          <button
            disabled={!undo.current.length}
            onClick={() => {
              const prev = undo.current.pop();
              if (prev) { redo.current.push(clone(cards)); setCards(prev); bump((n) => n + 1); }
            }}
            className="flex-1 rounded border border-black/15 px-2 py-1 disabled:opacity-30"
          >
            ↶ undo
          </button>
          <button
            disabled={!redo.current.length}
            onClick={() => {
              const next = redo.current.pop();
              if (next) { undo.current.push(clone(cards)); setCards(next); bump((n) => n + 1); }
            }}
            className="flex-1 rounded border border-black/15 px-2 py-1 disabled:opacity-30"
          >
            ↷ redo
          </button>
        </div>

        {sel && cards[sel.c] && (
          <>
            <label className="mb-3 block">
              <span className="text-black/50">card name</span>
              <input
                value={cards[sel.c].name}
                onChange={(e) => {
                  const v = e.target.value;
                  setCards((cs) => cs.map((c, i) => (i === sel.c ? { ...c, name: v } : c)));
                }}
                onFocus={push}
                className="mt-1 w-full rounded border border-black/15 px-2 py-1"
              />
            </label>

            <ul className="mb-3 max-h-40 list-none space-y-1 overflow-y-auto p-0">
              {cards[sel.c].els.map((e, i) => (
                <li key={i} className="flex items-center gap-1">
                  <button
                    onClick={() => setSel({ c: sel.c, i })}
                    className={`flex-1 truncate rounded px-2 py-1 text-left ${sel.i === i ? "bg-black/[.06]" : ""}`}
                  >
                    <span className="text-black/35">{e.kind}</span> {e.name}
                  </button>
                  <button onClick={() => { push(); set(sel.c, i, { show: e.show === false ? undefined : false }); }}
                    title="show / hide" className="px-1 text-black/40 hover:text-black">
                    {e.show === false ? "◻" : "◼"}
                  </button>
                  <button
                    onClick={() => {
                      push();
                      setCards((v) => v.map((c, ci) => ci === sel.c ? { ...c, els: c.els.filter((_, k) => k !== i) } : c));
                      if (sel.i === i) setSel(null);
                    }}
                    className="px-1 text-black/40 hover:text-black"
                  >×</button>
                </li>
              ))}
              {!cards[sel.c].els.length && <li className="px-2 py-1 text-black/35">empty — add something above</li>}
            </ul>

            {current && (
              <div className="space-y-2 border-t border-black/10 pt-3">
                <div className="flex gap-1">
                  <button onClick={() => reorder(1)} className="flex-1 rounded border border-black/15 px-2 py-1">bring forward</button>
                  <button onClick={() => reorder(-1)} className="flex-1 rounded border border-black/15 px-2 py-1">send back</button>
                </div>

                <label className="block">
                  <span className="text-black/50">name</span>
                  <input value={current.name} onFocus={push}
                    onChange={(e) => set(sel.c, sel.i, { name: e.target.value })}
                    className="mt-1 w-full rounded border border-black/15 px-2 py-1" />
                </label>

                {current.kind !== "line" && (
                  <label className="block">
                    <span className="text-black/50">text</span>
                    <textarea value={current.text} rows={2} onFocus={push}
                      onChange={(e) => set(sel.c, sel.i, { text: e.target.value })}
                      className="mt-1 w-full rounded border border-black/15 px-2 py-1" />
                  </label>
                )}

                {/* numbers */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["x", "x %", 0.1], ["y", "y %", 0.1],
                    ...(current.kind !== "text" || current.w !== undefined ? [["w", "w %", 0.1] as const] : []),
                    ...(current.kind === "box" || current.kind === "ellipse" ? [["h", "h %", 0.1] as const] : []),
                    ["size", current.kind === "line" ? "thickness px" : "font px", 0.5],
                    ...(current.kind === "box" ? [["radius", "radius px", 1] as const] : []),
                    ...(current.kind === "line" ? [["radius", "radius px", 1] as const] : []),
                    ["rotate", "rotate °", 1],
                    ["opacity", "opacity %", 1],
                    ...(current.kind === "text" || current.kind === "box" || current.kind === "ellipse"
                      ? [["weight", "weight", 100] as const, ["tracking", "tracking em", 0.01] as const] : []),
                    ...(current.kind === "box" || current.kind === "ellipse" ? [["border", "border px", 1] as const] : []),
                  ] as [keyof El, string, number][]).map(([k, label, step]) => (
                    <label key={k} className="block">
                      <span className="text-black/50">{label}</span>
                      <input
                        type="number" step={step} value={num(current[k] as number | undefined)}
                        onFocus={push}
                        onChange={(e) => set(sel.c, sel.i, { [k]: e.target.value === "" ? undefined : Number(e.target.value) })}
                        className="mt-1 w-full rounded border border-black/15 px-2 py-1 tabular-nums"
                      />
                    </label>
                  ))}
                </div>

                {/* colours */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ...(current.kind === "text" ? [["color", "colour"] as const] : []),
                    ...(current.kind !== "text" ? [["fill", "fill"] as const] : []),
                    ...(current.kind === "box" || current.kind === "ellipse" ? [["color", "text colour"] as const, ["borderColor", "border"] as const] : []),
                  ] as [keyof El, string][]).map(([k, label]) => (
                    <label key={k} className="block">
                      <span className="text-black/50">{label}</span>
                      {/* ⚠ A NATIVE COLOUR INPUT ONLY ACCEPTS A HEX LITERAL.
                          The config holds `var(--color-violet)` now, and an
                          input handed that shows BLACK with no error — then
                          writes that black back the moment any dial next to
                          it is touched. So the token is resolved to its hex
                          for the swatch; `set` still writes whatever the user
                          picks, which is a hex, which is correct. */}
                      <input type="color" value={swatch(current[k] as string | undefined)} onFocus={push}
                        onChange={(e) => set(sel.c, sel.i, { [k]: e.target.value })}
                        className="mt-1 h-8 w-full rounded border border-black/15" />
                    </label>
                  ))}
                </div>

                {current.kind === "text" && (
                  /* auto-width vs fixed. A side handle switches it to fixed;
                     this switches it back, or a drag is one-way. */
                  <div className="flex items-center gap-2">
                    <span className="text-black/50">width</span>
                    <button
                      onClick={() => { push(); set(sel.c, sel.i, { w: undefined }); }}
                      className={`flex-1 rounded border border-black/15 px-2 py-1 ${current.w === undefined ? "bg-black text-white" : ""}`}
                    >auto</button>
                    <button
                      onClick={() => { push(); set(sel.c, sel.i, { w: current.w ?? 40 }); }}
                      className={`flex-1 rounded border border-black/15 px-2 py-1 ${current.w !== undefined ? "bg-black text-white" : ""}`}
                    >fixed</button>
                  </div>
                )}

                {current.kind === "text" && (
                  <div className="flex flex-wrap gap-2">
                    {([["strike", "strike"], ["italic", "italic"], ["caps", "caps"]] as [keyof El, string][]).map(([k, l]) => (
                      <label key={k} className="flex items-center gap-1">
                        <input type="checkbox" checked={!!current[k]}
                          onChange={(e) => { push(); set(sel.c, sel.i, { [k]: e.target.checked || undefined }); }} />
                        <span>{l}</span>
                      </label>
                    ))}
                    <select value={current.align ?? "center"}
                      onChange={(e) => { push(); set(sel.c, sel.i, { align: e.target.value as El["align"] }); }}
                      className="rounded border border-black/15 px-1">
                      <option value="left">left</option><option value="center">center</option><option value="right">right</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={current.show !== false}
                    onChange={(e) => { push(); set(sel.c, sel.i, { show: e.target.checked ? undefined : false }); }} />
                  <span>visible</span>
                </label>
              </div>
            )}
          </>
        )}

        <pre className="mt-4 max-h-60 overflow-auto rounded bg-black/[.04] p-3 text-[11px] leading-relaxed">
{config}
        </pre>
        <button
          onClick={() => { navigator.clipboard.writeText(config); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          className="mt-2 w-full rounded bg-black px-3 py-2 text-white"
        >
          {copied ? "copied" : "copy config"}
        </button>
      </aside>
    </div>
  );
}
