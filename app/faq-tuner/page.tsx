"use client";

import { useRef, useState } from "react";
import { PILLS } from "@/sections/Faq";

/* FAQ tuner. Drag the pills where you want them, tilt them, add and remove
 * them, then copy the config block and paste it back.
 *
 * ⚠ A WORKBENCH, LIKE /tuner. It does not touch sections/Faq.tsx and nothing
 * here ships — it prints a config, and the section is edited by hand from it.
 * That is the whole reason it cannot break the section.
 *
 * ⚠ THE PILLS HERE ARE DEAD — the closed shape and nothing else. No GSAP, no
 * open state, no click. This is a placement tool: arrange them, copy the
 * config, and the animation is baked into the section afterwards. Keeping them
 * inert is what stops the drag fighting a click and stops this page needing to
 * track changes to FaqItem.
 */

/* `size` is the pill's font-size in px. The pill hugs its text and every
   inset is in em, so one number scales the whole thing — box, padding, radius
   and the + together. 20 is the section's own size at this width. */
type Pill = { id: number; q: string; a: string; x: number; y: number; tilt: number; openW: number; size: number };

/* ⚠ SEEDED FROM THE SECTION'S OWN PILLS, not a second copy kept in step by
   hand. The tuner always opens on exactly what is live, so there is no drift
   between what is arranged here and what ships. Adding `id` is the only
   change — the section keys on the question, the tuner needs a stable handle
   that survives editing the text. */
const START: Pill[] = PILLS.map((p, i) => ({ id: i + 1, ...p }));

export default function FaqTuner() {
  const [pills, setPills] = useState<Pill[]>(START);
  const [sel, setSel] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  /* grab offset, so a pill does not jump its own centre to the cursor. */
  const grab = useRef<{ id: number; dx: number; dy: number } | null>(null);

  const set = (id: number, patch: Partial<Pill>) =>
    setPills((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  /* ⚠ POSITIONS ARE PERCENTAGES, NOT PIXELS. A px offset tuned at this window
     size would be wrong at every other one; a percentage of the stage holds
     its place. */
  const onMove = (e: React.PointerEvent) => {
    const g = grab.current, box = stage.current?.getBoundingClientRect();
    if (!g || !box) return;
    set(g.id, {
      x: +(((e.clientX - box.left - g.dx) / box.width) * 100).toFixed(1),
      y: +(((e.clientY - box.top - g.dy) / box.height) * 100).toFixed(1),
    });
  };

  const config = `/* paste into sections/Faq.tsx */
const PILLS = [
${pills.map((p) => `  { q: ${JSON.stringify(p.q)}, a: ${JSON.stringify(p.a)}, x: ${p.x}, y: ${p.y}, tilt: ${p.tilt}, openW: ${p.openW}, size: ${p.size} },`).join("\n")}
];`;

  const current = pills.find((p) => p.id === sel);

  /* ⚠ WARN ABOUT VALUES THE SECTION WILL OVERRIDE, rather than letting them be
     discovered after baking. The section enforces two rules the tuner cannot
     show on a closed pill:
       - openW below the pill's own hugged width is ignored (it would squeeze
         the question), so it is raised to that width;
       - a pill opening past the section's right edge is clamped to the room
         left, and slides in if that would take it under 72%.
     Both are measured off the live DOM, so they track whatever is on screen. */
  const warn = (p: Pill) => {
    const el = stage.current?.querySelector<HTMLElement>(`[data-id="${p.id}"] > div`);
    const box = stage.current?.getBoundingClientRect();
    if (!el || !box) return null;
    const w = el.getBoundingClientRect().width;
    const left = (p.x / 100) * box.width;
    const room = box.width - left - 24;
    if (p.openW < w) return `openW ${p.openW} is under this pill's own width (${Math.round(w)}) — the section will use ${Math.round(w)}.`;
    if (p.openW > room) return `opens past the right edge — the section will clamp it to ~${Math.round(Math.max(room, p.openW * 0.72))}.`;
    return null;
  };

  return (
    <div className="h-dvh w-full">
      {/* the stage — the full viewport, the shape of the real section. */}
      <div
        ref={stage}
        onPointerMove={onMove}
        onPointerUp={() => (grab.current = null)}
        onPointerLeave={() => (grab.current = null)}
        className="relative h-full w-full overflow-hidden bg-haze"
      >
        {/* the real heading, 1:1 from sections/Faq.tsx — centred so the pills
            can be arranged around it. pointer-events-none so it never eats a
            drag. not draggable: it is the fixed thing to lay out against. */}
        <h2 className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(4.5rem,1.6rem+7.4vw,12.5rem)] leading-[0.9] uppercase select-none">
          FAQ
        </h2>

        {pills.map((p) => (
          <div
            key={p.id}
            data-id={p.id}
            onPointerDown={(e) => {
              /* ⚠ THE OFFSET COMES FROM THE STORED x/y, NOT getBoundingClientRect.
                 On a ROTATED pill that rect is the inflated bounding box of the
                 rotation, so its top is well above the pill's real anchor — the
                 grab offset came out too large and the pill lagged the cursor
                 vertically. A -20deg pill moved 23px for 100px of drag. The
                 stored percentage is the anchor, so this is exact at any tilt. */
              const box = stage.current!.getBoundingClientRect();
              grab.current = {
                id: p.id,
                dx: e.clientX - box.left - (p.x / 100) * box.width,
                dy: e.clientY - box.top - (p.y / 100) * box.height,
              };
              setSel(p.id);
            }}
            /* ⚠ ROTATE ABOUT THE CENTRE. The default origin is the box's own
               centre, but the box here is the WRAPPER, which is sized by the
               pill — so a steep tilt swung the pill off its own x/y anchor and
               the placement no longer matched the number. Stated explicitly so
               a tilt turns the pill in place and x/y keep meaning the pill's
               top-left. */
            style={{ left: `${p.x}%`, top: `${p.y}%`, rotate: `${p.tilt}deg`, transformOrigin: "center center" }}
            className={`absolute cursor-grab active:cursor-grabbing ${sel === p.id ? "rounded-[999px] outline-2 outline-offset-4 outline-ink/30" : ""}`}
          >
            {/* ⚠ A DEAD PILL, NOT THE REAL FaqItem. It is the closed shape and
                nothing else — no GSAP, no open state, no click handler. This
                is a placement tool; the animation is baked in afterwards from
                the config it prints, so there is nothing here to fight the
                drag and nothing to get out of step with the component. */}
            {/* ⚠ THE INSETS ARE IN em, SO `size` SCALES THE WHOLE PILL. With
                the section's --space-* tokens here only the text would grow
                and the padding would stay put, which is not a size change. */}
            {/* ⚠ EVERY CLASS HERE MATCHES FaqItem'S CLOSED STATE, including
                whitespace-nowrap. Without it the dummy wraps where the real
                pill does not, so the width measured in the tuner is not the
                width on the page and a placement tuned here lands wrong. */}
            <div
              style={{ fontSize: `${p.size}px` }}
              className="flex w-fit items-center gap-[1.2em] rounded-[999px] border border-ink/15 bg-paper/60 px-[1.6em] py-[0.8em] select-none"
            >
              <span className="whitespace-nowrap">{p.q}</span>
              <span className="text-[1.4em] leading-none">+</span>
            </div>
          </div>
        ))}
      </div>

      {/* ⚠ FLOATING, NOT A COLUMN. As a flex column it took 340px off the
          stage, so the stage was not the shape of the real page and every
          placement tuned here landed wrong. Floating over it means the stage
          IS the viewport and the percentages mean what they will mean on the
          page. Collapsible so it can be got out of the way entirely. */}
      <button
        onClick={() => setPanel((v) => !v)}
        /* always reachable — above the panel and outside its box. */
        className="fixed top-4 right-4 z-[60] rounded-full bg-black px-4 py-2 text-[13px] text-white shadow-lg"
      >
        {panel ? "hide panel" : "tuner"}
      </button>

      {/* ⚠ THE STAGE IS NOT SHRUNK TO CLEAR THIS. It has to stay the shape of
          the real section or the percentages stop meaning anything — so the
          panel overlaps, and a pill can sit under it. `hide panel` is the way
          to reach that pill; the toggle is above this and always clickable. */}
      <aside
        hidden={!panel}
        className="fixed top-16 right-4 z-40 max-h-[calc(100dvh-5rem)] w-[340px] overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-4 text-[13px] shadow-2xl backdrop-blur"
      >
        <h1 className="mb-1 font-semibold">faq tuner</h1>
        <p className="mb-4 text-black/50">
          drag a pill to place it. pick one below to edit its text and tilt.
          copy the config at the bottom and paste it to me.
        </p>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() =>
              setPills((p) => {
                const id = Math.max(0, ...p.map((x) => x.id)) + 1;
                return [...p, { id, q: "New question?", a: "New answer.", x: 20, y: 60, tilt: 0, openW: 520, size: 20 }];
              })
            }
            className="rounded border border-black/15 px-3 py-1.5"
          >
            + add pill
          </button>
          <button onClick={() => setPills(START)} className="rounded border border-black/15 px-3 py-1.5">
            reset
          </button>
        </div>

        {/* the list. click to select, x to remove. */}
        <ul className="mb-4 list-none space-y-1 p-0">
          {pills.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <button
                onClick={() => setSel(p.id)}
                className={`flex-1 truncate rounded px-2 py-1 text-left ${sel === p.id ? "bg-black/[.06]" : ""}`}
              >
                {p.q}
              </button>
              <button
                onClick={() => {
                  setPills((v) => v.filter((x) => x.id !== p.id));
                  if (sel === p.id) setSel(null);
                }}
                className="px-1 text-black/40 hover:text-black"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {current && (
          <div className="mb-4 space-y-3 border-t border-black/10 pt-4">
            <label className="block">
              <span className="text-black/50">question</span>
              <input
                value={current.q}
                onChange={(e) => set(current.id, { q: e.target.value })}
                className="mt-1 w-full rounded border border-black/15 px-2 py-1"
              />
            </label>
            <label className="block">
              <span className="text-black/50">answer</span>
              <textarea
                value={current.a}
                rows={3}
                onChange={(e) => set(current.id, { a: e.target.value })}
                className="mt-1 w-full rounded border border-black/15 px-2 py-1"
              />
            </label>

            {([
              { k: "tilt" as const, label: "tilt (deg)", min: -20, max: 20, step: 0.1 },
              { k: "x" as const, label: "x (%)", min: 0, max: 95, step: 0.1 },
              { k: "y" as const, label: "y (%)", min: 0, max: 95, step: 0.1 },
              { k: "openW" as const, label: "open width (px)", min: 240, max: 1100, step: 10 },
              { k: "size" as const, label: "size (px)", min: 10, max: 48, step: 0.5 },
            ]).map((f) => (
              <div key={f.k}>
                <div className="flex justify-between">
                  <span>{f.label}</span>
                  <input
                    type="number"
                    value={current[f.k]}
                    step={f.step}
                    onChange={(e) => set(current.id, { [f.k]: Number(e.target.value) })}
                    className="w-20 rounded border border-black/15 px-1 text-right tabular-nums"
                  />
                </div>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={current[f.k]}
                  onChange={(e) => set(current.id, { [f.k]: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}

            {warn(current) && (
              <p className="rounded bg-amber-50 p-2 text-amber-900">
                ⚠ {warn(current)}
              </p>
            )}
          </div>
        )}

        <pre className="mt-4 overflow-x-auto rounded bg-black/[.04] p-3 text-[11px] leading-relaxed">
{config}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(config);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="mt-2 w-full rounded bg-black px-3 py-2 text-white"
        >
          {copied ? "copied" : "copy config"}
        </button>
      </aside>
    </div>
  );
}
