"use client";

import { useRef, useState } from "react";
import FaqItem from "@/components/FaqItem";

/* FAQ tuner. Drag the pills where you want them, tilt them, add and remove
 * them, then copy the config block and paste it back.
 *
 * ⚠ A WORKBENCH, LIKE /tuner. It does not touch sections/Faq.tsx and nothing
 * here ships — it prints a config, and the section is edited by hand from it.
 * That is the whole reason it cannot break the section.
 *
 * It renders the REAL FaqItem, so what is dragged around is the same component
 * with the same animation, not a mock-up that drifts from it.
 */

type Pill = { id: number; q: string; a: string; x: number; y: number; tilt: number; openW: number };

const START: Pill[] = [
  { id: 1, q: "What is this question doing here?", a: "Placeholder answer — roughly the length a real one runs to.", x: 8, y: 12, tilt: -2.5, openW: 520 },
  { id: 2, q: "And a second one?", a: "Opening this shuts the one above it.", x: 34, y: 38, tilt: 1.8, openW: 520 },
];

export default function FaqTuner() {
  const [pills, setPills] = useState<Pill[]>(START);
  const [sel, setSel] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  /* grab offset, so a pill does not jump its own centre to the cursor.
     `moved` is what lets a pill still be CLICKED OPEN in the tuner: the
     wrapper would otherwise swallow every press as a drag. Nothing moves
     until the pointer travels past the threshold, and a press that never
     does falls through to the <summary>. */
  const grab = useRef<{ id: number; dx: number; dy: number; moved: boolean } | null>(null);

  const set = (id: number, patch: Partial<Pill>) =>
    setPills((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  /* ⚠ POSITIONS ARE PERCENTAGES, NOT PIXELS. A px offset tuned at this window
     size would be wrong at every other one; a percentage of the stage holds
     its place. */
  const onMove = (e: React.PointerEvent) => {
    const g = grab.current, box = stage.current?.getBoundingClientRect();
    if (!g || !box) return;
    /* 4px of slop — below it this is a click, not a drag. */
    if (!g.moved && Math.abs(e.movementX) + Math.abs(e.movementY) < 4) return;
    g.moved = true;
    set(g.id, {
      x: +(((e.clientX - box.left - g.dx) / box.width) * 100).toFixed(1),
      y: +(((e.clientY - box.top - g.dy) / box.height) * 100).toFixed(1),
    });
  };

  const config = `/* paste into sections/Faq.tsx */
const PILLS = [
${pills.map((p) => `  { q: ${JSON.stringify(p.q)}, a: ${JSON.stringify(p.a)}, x: ${p.x}, y: ${p.y}, tilt: ${p.tilt}, openW: ${p.openW} },`).join("\n")}
];`;

  const current = pills.find((p) => p.id === sel);

  return (
    <div className="flex h-dvh w-full">
      {/* the stage. drag pills on it. */}
      <div
        ref={stage}
        onPointerMove={onMove}
        onPointerUp={() => (grab.current = null)}
        onPointerLeave={() => (grab.current = null)}
        className="relative flex-1 overflow-hidden bg-haze"
      >
        {pills.map((p) => (
          <div
            key={p.id}
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              grab.current = { id: p.id, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false };
              setSel(p.id);
            }}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            /* ⚠ onPointerDown IS ON THIS WRAPPER AND SO IS THE PILL'S CLICK.
               The press is shared: the wrapper starts a drag, and if the
               pointer never travels the <summary> underneath still gets its
               click and the pill opens. That is why the move handler has a
               slop threshold rather than moving on the first event. */
            className={`absolute cursor-grab active:cursor-grabbing ${sel === p.id ? "rounded-[999px] outline-2 outline-offset-4 outline-ink/30" : ""}`}
          >
            {/* the real component — not a mock. clicking still opens it, so the
                animation can be checked in place. */}
            <FaqItem q={p.q} a={p.a} tilt={p.tilt} openW={p.openW} />
          </div>
        ))}
      </div>

      <aside className="w-[340px] shrink-0 overflow-y-auto border-l border-black/10 bg-white p-4 text-[13px]">
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
                return [...p, { id, q: "New question?", a: "New answer.", x: 20, y: 60, tilt: 0, openW: 520 }];
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
