"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import HowItWorks, { HOW_IT_WORKS_CARDS, HOW_IT_WORKS_STICKERS } from "@/sections/HowItWorks";

/* ⚠ THIS TUNER COVERS ONE SECTION: How it works. Hero, Features,
   Testimonials, Faq and Pricing no longer have stickers — their configs and
   render layers were deleted — so a seven-section tuner was tuning five
   empty stages and emitting config blocks for arrays that do not exist.
   If stickers come back to another section, add it here the same way: mount
   it with `hideStickers`, hand the tuner the SAME box the section positions
   its stickers against, and extend the emitted config.

   ⚠ IT SEEDS ITSELF FROM THE SECTION'S OWN EXPORT and never writes the
   section. `HOW_IT_WORKS_STICKERS` is imported, so the tuner always opens on
   what is live; the output is a block to paste by hand. Keeping a second copy
   of the coordinates here is how the faq tuner drifted to four pills against
   six. */

/* ⚠ POSITIONS ARE PERCENTAGES OF THE STAGE, NOT THE SECTION, because that is
   what the section itself uses: the desktop sticker layer is absolute inside
   `stageRef` (the max-w-[min(120rem,...)] box), not inside the section. A
   tuner measuring the section would hand back numbers that land somewhere
   else on the real page. */
type Draft = {
  name: string;
  src: string;
  alt?: string;
  x: number;
  y: number;
  w: number;
  rotate: number;
  z: number;
};

const SEED: Draft[] = HOW_IT_WORKS_STICKERS.map((s) => ({
  name: s.name,
  src: s.src,
  alt: s.alt ?? "",
  x: s.x,
  y: s.y,
  w: s.w,
  /* the section stores rotate as a css string ("16deg"); the tuner works in
     numbers and writes the string back out on copy. */
  rotate: parseFloat(s.rotate ?? "0") || 0,
  z: s.z ?? 20,
}));

const r1 = (n: number) => Math.round(n * 10) / 10;

export default function StickerTuner() {
  const [drafts, setDrafts] = useState<Draft[]>(SEED);
  const [sel, setSel] = useState<string | null>(null);
  const [panel, setPanel] = useState(true);
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  /* ⚠ THE DRAG READS STATE THROUGH A REF, NOT THE CLOSURE. The old tuner had
     `[stickers]` in its useCallback deps, so every pointermove rebuilt the
     handler and the one already bound to the window kept reading the array
     from the render it was created in — the sticker jumped back a frame on
     each move. A ref is the same value with no dependency. */
  const draftsRef = useRef(drafts);
  /* assigned in an effect, not during render — a ref write during render is a
     react lint error and is unsafe under concurrent rendering. The handlers
     that read it only ever run after paint, so an effect is soon enough. */
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const active = drafts.find((d) => d.name === sel) || null;

  const patch = useCallback((name: string, next: Partial<Draft>) => {
    setDrafts((prev) => prev.map((d) => (d.name === name ? { ...d, ...next } : d)));
  }, []);

  /* One pointer handler for all three gestures. */
  const startDrag = useCallback(
    (e: React.PointerEvent, name: string, mode: "move" | "resize" | "rotate") => {
      e.stopPropagation();
      e.preventDefault();
      setSel(name);

      const stage = stageRef.current;
      const start = draftsRef.current.find((d) => d.name === name);
      if (!stage || !start) return;

      /* ⚠ POINTER CAPTURE, so a drag that leaves the window or crosses an
         iframe still reports moves to this element. Without it the pointer is
         lost and the sticker sticks to the cursor with no way to drop it. */
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const sx = e.clientX;
      const sy = e.clientY;
      const { x: x0, y: y0, w: w0, rotate: rot0 } = start;

      /* ⚠ MEASURE THE STAGE ON EVERY MOVE, NOT ONCE. The old tuner captured
         `secRect` at pointerdown; scrolling mid-drag then offset every
         coordinate it wrote, silently. getBoundingClientRect is cheap enough
         at pointer rate. */
      const onMove = (ev: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        if (!box.width || !box.height) return;

        if (mode === "move") {
          patch(name, {
            x: r1(x0 + ((ev.clientX - sx) / box.width) * 100),
            y: r1(y0 + ((ev.clientY - sy) / box.height) * 100),
          });
          return;
        }

        if (mode === "resize") {
          /* ⚠ WIDTH TRACKS THE POINTER'S HORIZONTAL TRAVEL, NOT A RATIO OF
             DISTANCE FROM THE CENTRE. The old tuner divided the live distance
             by the distance at pointerdown — but a corner drag STARTS at the
             handle, so that denominator was near zero and the first move blew
             the sticker up by a huge factor. Travel is linear and has no
             singularity. Floor at 1% so it can always be grabbed again. */
          const dw = ((ev.clientX - sx) / box.width) * 100 * 2; /* ×2: centre-anchored, both edges move */
          setDrafts((prev) =>
            prev.map((d) => (d.name === name ? { ...d, w: Math.max(1, r1(w0 + dw)) } : d))
          );
          return;
        }

        /* rotate: angle of the pointer about the sticker's centre */
        const el = document.getElementById(`tuner-${name}`);
        if (!el) return;
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const a0 = Math.atan2(sy - cy, sx - cx);
        const a1 = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        let deg = rot0 + ((a1 - a0) * 180) / Math.PI;
        if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
        patch(name, { rotate: Math.round(deg) });
      };

      const onUp = (ev: PointerEvent) => {
        target.releasePointerCapture?.(ev.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    },
    [patch]
  );

  /* Arrow keys nudge; shift = coarse. Escape deselects. No Delete binding:
     these four badges are the section's content, not scratch material, and a
     stray Backspace silently emptying the config is not recoverable here. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setSel(null);
      if (!sel) return;
      const step = e.shiftKey ? 1 : 0.1;
      const d: Partial<Draft> = {};
      const cur = draftsRef.current.find((s) => s.name === sel);
      if (!cur) return;
      if (e.key === "ArrowLeft") d.x = r1(cur.x - step);
      else if (e.key === "ArrowRight") d.x = r1(cur.x + step);
      else if (e.key === "ArrowUp") d.y = r1(cur.y - step);
      else if (e.key === "ArrowDown") d.y = r1(cur.y + step);
      else return;
      e.preventDefault();
      patch(sel, d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, patch]);

  /* ⚠ THE OUTPUT IS THE SECTION'S OWN SHAPE, pasteable over
     HOW_IT_WORKS_STICKERS with no editing: rotate back to a "Ndeg" string,
     alt kept, keys in the same order as the source. */
  const config = `export const HOW_IT_WORKS_STICKERS: HowItWorksSticker[] = [
${drafts
  .map(
    (d) => `  {
    name: "${d.name}",
    src: "${d.src}",
    alt: "${d.alt ?? ""}",
    x: ${d.x},
    y: ${d.y},
    w: ${d.w},
    rotate: "${d.rotate}deg",
    z: ${d.z},
  },`
  )
  .join("\n")}
];`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard is permission-gated and silently absent over plain http on
         some hosts; the block is on screen either way. */
      setCopied(false);
    }
  };

  const dirty = JSON.stringify(drafts) !== JSON.stringify(SEED);

  return (
    <div className="relative min-h-screen w-full bg-[#f5f2ff]" onPointerDown={() => setSel(null)}>
      {/* ⚠ THE STAGE IS THE REAL SECTION AT FULL VIEWPORT WIDTH and the panel
          FLOATS over it. A panel in a column beside the stage takes its width
          off the stage, so the stage is no longer the shape of the real page
          and every percentage tuned against it is wrong when pasted. */}
      <HowItWorks
        cards={HOW_IT_WORKS_CARDS}
        hideStickers
        stageRef={(el) => {
          stageRef.current = el;
        }}
      >
        {/* The overlay is a child of the SAME stage box the section positions
            its own sticker layer against, so these coordinates transfer 1:1. */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {drafts.map((d) => {
            const on = sel === d.name;
            return (
              <div
                key={d.name}
                id={`tuner-${d.name}`}
                onPointerDown={(e) => startDrag(e, d.name, "move")}
                className="pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  width: `${d.w}%`,
                  zIndex: on ? 40 : d.z,
                  transform: `translate(-50%, -50%) rotate(${d.rotate}deg)`,
                }}
              >
                <img
                  src={d.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none block h-auto w-full select-none drop-shadow-xl"
                />

                {on && (
                  <div className="pointer-events-none absolute -inset-1 border-2 border-[#8B5CF6]">
                    {/* ⚠ THE BADGE SITS BELOW THE BOX AND THE KNOB ABOVE IT.
                        Both were at -top-7 before, so the badge covered the
                        rotation knob and swallowed its pointer events. */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1c1836] px-2 py-0.5 font-mono text-[10px] text-[#EAC2FF]">
                      {d.x}% · {d.y}% · w {d.w}% · {d.rotate}°
                    </div>

                    <div
                      onPointerDown={(e) => startDrag(e, d.name, "rotate")}
                      title="drag to rotate · shift snaps to 15°"
                      className="pointer-events-auto absolute -top-8 left-1/2 size-4 -translate-x-1/2 cursor-crosshair touch-none rounded-full border-2 border-[#8B5CF6] bg-white"
                    />
                    <div className="absolute -top-5 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-[#8B5CF6]" />

                    {/* One resize handle, bottom-right. Four identical
                        copy-pasted corners all did the same thing. */}
                    <div
                      onPointerDown={(e) => startDrag(e, d.name, "resize")}
                      title="drag to scale"
                      className="pointer-events-auto absolute -right-2 -bottom-2 size-4 cursor-nwse-resize touch-none rounded-sm border-2 border-[#8B5CF6] bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </HowItWorks>

      {/* floating toolbar */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-4 z-[9999] flex items-center gap-3 rounded-full border border-white/10 bg-black/85 px-4 py-2 font-mono text-xs text-white backdrop-blur-md"
      >
        <Link href="/" className="text-white/60 transition hover:text-white">
          ← Exit
        </Link>
        <span className="text-white/20">|</span>
        <span className="font-semibold text-[#EAC2FF]">How it works · stickers</span>
        <span className="text-white/40">{drafts.length} badges</span>
        {dirty && <span className="text-amber-300">● unsaved</span>}
        <button onClick={() => setPanel((p) => !p)} className="text-white/60 hover:text-white">
          {panel ? "hide panel" : "show panel"}
        </button>
      </div>

      {panel && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed right-4 bottom-4 z-[9999] w-[min(92vw,380px)] rounded-2xl border border-white/15 bg-[#151226]/95 p-4 text-xs text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-[#EAC2FF]">
              {active ? active.name : "select a sticker"}
            </span>
            {dirty && (
              <button
                onClick={() => {
                  setDrafts(SEED);
                  setSel(null);
                }}
                className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/20"
              >
                reset to live
              </button>
            )}
          </div>

          {active ? (
            <div className="mb-3 space-y-2 font-mono">
              {(
                [
                  ["x", -20, 120, 0.1],
                  ["y", -20, 120, 0.1],
                  ["w", 1, 40, 0.1],
                  ["rotate", -180, 180, 1],
                  ["z", 0, 29, 1],
                ] as const
              ).map(([key, min, max, step]) => (
                <label key={key} className="flex items-center gap-2">
                  <span className="w-12 text-white/50">{key}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={active[key]}
                    onChange={(e) => patch(active.name, { [key]: Number(e.target.value) })}
                    className="flex-1 accent-[#8B5CF6]"
                  />
                  <input
                    type="number"
                    step={step}
                    value={active[key]}
                    onChange={(e) => patch(active.name, { [key]: Number(e.target.value) })}
                    className="w-16 rounded bg-black/40 px-1 py-0.5 text-right text-[11px]"
                  />
                </label>
              ))}
              {/* ⚠ z STOPS AT 29. The nav is z-30 and its open dropdown must
                  cover the page — a sticker at 30+ punches through the panel.
                  Same rule the Hero config documents. */}
              <p className="text-[10px] leading-snug text-white/40">
                drag to move · corner to scale · knob to rotate (shift snaps 15°) · arrows nudge
                0.1% (shift 1%) · z caps at 29 so the nav panel stays on top
              </p>
            </div>
          ) : (
            <p className="mb-3 text-white/40">
              Click a badge on the stage. Positions are % of the cards stage, which is the box the
              section itself positions against.
            </p>
          )}

          <pre className="max-h-48 overflow-auto rounded-lg bg-black/50 p-2 font-mono text-[10px] leading-relaxed text-emerald-200">
            {config}
          </pre>

          <button
            onClick={copy}
            className="mt-2 w-full rounded-full bg-gradient-to-r from-[#9481fb] to-[#EAC2FF] py-2 font-bold text-[#201e45] transition hover:brightness-110"
          >
            {copied ? "✓ copied — paste over HOW_IT_WORKS_STICKERS" : "copy config"}
          </button>
          <p className="mt-2 text-center text-[10px] text-white/35">
            paste into sections/HowItWorks.tsx by hand — the tuner never writes the section
          </p>
        </div>
      )}
    </div>
  );
}
