"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Sticker, StickerAnchor } from "@/components/Stickers";
import HowItWorks, { HOW_IT_WORKS_CARDS, HOW_IT_WORKS_STICKERS } from "@/sections/HowItWorks";
import Features, { FEATURES_STICKERS } from "@/sections/Features";
import Testimonials, { TESTIMONIALS_STICKERS } from "@/sections/Testimonials";
import Faq, { FAQ_STICKERS } from "@/sections/Faq";
import Pricing, { PRICING_STICKERS } from "@/sections/Pricing";
import Hero, { HERO_STICKERS } from "@/sections/Hero";

/* ⚠ A TUNER NEVER WRITES THE SECTION IT TUNES. It prints a config block to
   copy; the section is edited by hand from it. That is what stops a tuner
   breaking the thing it is tuning.

   ⚠ IT SEEDS ITSELF FROM EACH SECTION'S OWN EXPORT. Every section's sticker
   array is imported, so the tuner always opens on what is live. Keeping a
   second copy of the coordinates here is how the faq tuner drifted to four
   pills against six, with a width 104px out.

   ⚠ POSITIONS ARE PERCENTAGES, NOT PIXELS, or a placement tuned at one window
   size is wrong at every other. Stage stickers are % of the section's stage
   box — the same box the section positions its own layer against, handed over
   as `stageRef`. Card stickers are % of one card.

   ⚠ THE PANEL FLOATS OVER THE STAGE. A panel in a column beside it takes its
   width off the stage, so the stage is no longer the shape of the real page
   and every value tuned against it is wrong on the page. */

type Draft = {
  name: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  rotate: number;
  z: number;
  anchor: StickerAnchor;
  card: number;
  cap: number;
  desktopOnly: boolean;
};

type SectionKey = "hero" | "howitworks" | "features" | "testimonials" | "faq" | "pricing";

const SECTIONS: {
  key: SectionKey;
  label: string;
  exportName: string;
  seed: Sticker[];
  cards: number;
  note: string;
}[] = [
  {
    key: "hero",
    label: "Hero",
    exportName: "HERO_STICKERS",
    seed: HERO_STICKERS,
    cards: 0,
    note: "Desktop Hero stage stickers. Mobile uses separate vertical flow.",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    exportName: "TESTIMONIALS_STICKERS",
    seed: TESTIMONIALS_STICKERS,
    cards: 8,
    note: "Cards are a MARQUEE: the set renders twice and scrolls. A card sticker rides its card and appears in both copies.",
  },
  {
    key: "features",
    label: "Features",
    exportName: "FEATURES_STICKERS",
    seed: FEATURES_STICKERS,
    cards: 0,
    note: "Embla carousel. Stage stickers only — the cards carry video art already.",
  },
  {
    key: "faq",
    label: "Faq",
    exportName: "FAQ_STICKERS",
    seed: FAQ_STICKERS,
    cards: 0,
    note: "Desktop pill scatter. The stage is the lg-only scatter box.",
  },
  {
    key: "pricing",
    label: "Pricing",
    exportName: "PRICING_STICKERS",
    seed: PRICING_STICKERS,
    cards: 3,
    note: "Three plan cards.",
  },
  {
    key: "howitworks",
    label: "How it works",
    exportName: "HOW_IT_WORKS_STICKERS",
    seed: HOW_IT_WORKS_STICKERS,
    cards: 4,
    note: "Four step badges. @snvzyn has an unmerged branch on this file.",
  },
];

const toDraft = (s: Sticker): Draft => ({
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
  anchor: s.anchor ?? "stage",
  card: s.card ?? 0,
  cap: s.cap ?? 148,
  desktopOnly: s.desktopOnly ?? (s.anchor !== "card"),
});

const r1 = (n: number) => Math.round(n * 10) / 10;

type LibItem = { name: string; src: string; family: string; ratio: number };

export default function StickerTuner() {
  const [sectionKey, setSectionKey] = useState<SectionKey>("testimonials");
  const section = SECTIONS.find((s) => s.key === sectionKey)!;

  /* Drafts per section, so switching does not lose work. */
  const [all, setAll] = useState<Record<string, Draft[]>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.key, s.seed.map(toDraft)]))
  );
  const drafts = all[sectionKey] ?? [];
  const setDrafts = useCallback(
    (fn: (prev: Draft[]) => Draft[]) =>
      setAll((prev) => ({ ...prev, [sectionKey]: fn(prev[sectionKey] ?? []) })),
    [sectionKey]
  );

  const [sel, setSel] = useState<string | null>(null);
  const [panel, setPanel] = useState(true);
  const [lib, setLib] = useState<LibItem[]>([]);
  const [famFilter, setFamFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [outline, setOutline] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);

  /* ⚠ THE DRAG READS STATE THROUGH A REF, NOT THE CLOSURE. With the array in
     the useCallback deps, every pointermove rebuilt the handler while the one
     already bound kept reading the array from the render it was created in —
     the sticker jumped back a frame on each move. */
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  /* The library is read from a manifest written by the import script, so
     adding a sticker to public/images/stickers does not need a code change. */
  useEffect(() => {
    fetch("/images/stickers/index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLib)
      .catch(() => setLib([]));
  }, []);

  const active = drafts.find((d) => d.name === sel) || null;

  const patch = useCallback(
    (name: string, next: Partial<Draft>) =>
      setDrafts((prev) => prev.map((d) => (d.name === name ? { ...d, ...next } : d))),
    [setDrafts]
  );

  /* ⚠ THE BOX A GESTURE MEASURES AGAINST IS THE ANCHOR'S BOX. A card sticker
     dragged against the stage would write stage percentages into a field the
     section reads as card percentages — the exact drift a tuner exists to
     prevent. */
  const boxFor = useCallback((d: Draft): DOMRect | null => {
    if (d.anchor === "card") {
      const el = document.querySelector<HTMLElement>(`[data-sticker-card="${d.card}"]`);
      return el ? el.getBoundingClientRect() : null;
    }
    return stageRef.current ? stageRef.current.getBoundingClientRect() : null;
  }, []);

  /* One pointer handler for all three gestures. */
  const startDrag = useCallback(
    (e: React.PointerEvent, name: string, mode: "move" | "resize" | "rotate") => {
      e.stopPropagation();
      e.preventDefault();
      setSel(name);

      const start = draftsRef.current.find((d) => d.name === name);
      if (!start) return;

      /* ⚠ POINTER CAPTURE, so a drag that leaves the window still reports
         moves. Without it the pointer is lost and the sticker sticks to the
         cursor with no way to drop it. */
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const sx = e.clientX;
      const sy = e.clientY;
      const { x: x0, y: y0, w: w0, rotate: rot0 } = start;

      const onMove = (ev: PointerEvent) => {
        /* ⚠ MEASURE ON EVERY MOVE, NOT ONCE. Capturing the rect at
           pointerdown means scrolling mid-drag offsets every coordinate it
           writes, silently. getBoundingClientRect is cheap at pointer rate. */
        const box = boxFor(start);
        if (!box || !box.width || !box.height) return;

        if (mode === "move") {
          let nx = x0 + ((ev.clientX - sx) / box.width) * 100;
          let ny = y0 + ((ev.clientY - sy) / box.height) * 100;
          /* shift = snap to a 0.5% grid */
          if (ev.shiftKey) {
            nx = Math.round(nx * 2) / 2;
            ny = Math.round(ny * 2) / 2;
          }
          patch(name, { x: r1(nx), y: r1(ny) });
          return;
        }

        if (mode === "resize") {
          /* ⚠ WIDTH TRACKS THE POINTER'S HORIZONTAL TRAVEL, NOT A RATIO OF
             DISTANCES. Dividing live distance by distance-at-pointerdown blew
             the sticker up on the first move, because a corner drag STARTS at
             the handle and that denominator is near zero. Travel is linear and
             has no singularity. Floor at 1 so it can always be grabbed. */
          const dw = ((ev.clientX - sx) / box.width) * 100 * 2; /* ×2: centre-anchored */
          setDrafts((prev) =>
            prev.map((d) => (d.name === name ? { ...d, w: Math.max(1, r1(w0 + dw)) } : d))
          );
          return;
        }

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
    [patch, setDrafts, boxFor]
  );

  const add = useCallback(
    (item: LibItem) => {
      setDrafts((prev) => {
        let n = item.name;
        let i = 2;
        while (prev.some((d) => d.name === n)) n = `${item.name}-${i++}`;
        return [
          ...prev,
          {
            name: n,
            src: item.src,
            alt: "",
            x: 50,
            y: 50,
            w: 10,
            rotate: 0,
            z: 25,
            anchor: "stage" as StickerAnchor,
            card: 0,
            cap: 148,
            desktopOnly: true,
          },
        ];
      });
      setSel(null);
    },
    [setDrafts]
  );

  const remove = useCallback(
    (name: string) => {
      setDrafts((prev) => prev.filter((d) => d.name !== name));
      setSel((s) => (s === name ? null : s));
    },
    [setDrafts]
  );

  const duplicate = useCallback(
    (name: string) => {
      setDrafts((prev) => {
        const src = prev.find((d) => d.name === name);
        if (!src) return prev;
        let n = `${name}-copy`;
        let i = 2;
        while (prev.some((d) => d.name === n)) n = `${name}-copy${i++}`;
        return [...prev, { ...src, name: n, x: r1(src.x + 3), y: r1(src.y + 3) }];
      });
    },
    [setDrafts]
  );

  /* Arrow keys nudge; shift = coarse. Escape deselects. Delete removes —
     unlike the old tuner this is scratch material, and there is a reset. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") return setSel(null);
      if (!sel) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        return remove(sel);
      }
      if ((e.key === "d" || e.key === "D") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return duplicate(sel);
      }
      const cur = draftsRef.current.find((s) => s.name === sel);
      if (!cur) return;
      const step = e.shiftKey ? 1 : 0.1;
      const d: Partial<Draft> = {};
      if (e.key === "ArrowLeft") d.x = r1(cur.x - step);
      else if (e.key === "ArrowRight") d.x = r1(cur.x + step);
      else if (e.key === "ArrowUp") d.y = r1(cur.y - step);
      else if (e.key === "ArrowDown") d.y = r1(cur.y + step);
      else if (e.key === "[") d.rotate = cur.rotate - (e.shiftKey ? 15 : 1);
      else if (e.key === "]") d.rotate = cur.rotate + (e.shiftKey ? 15 : 1);
      else return;
      e.preventDefault();
      patch(sel, d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, patch, remove, duplicate]);

  /* ⚠ THE OUTPUT IS THE SECTION'S OWN SHAPE, pasteable with no editing.
     Optional keys are omitted when they hold the default, so a simple
     stage sticker stays a short block. */
  const config = useMemo(() => {
    const body = drafts
      .map((d) => {
        const lines = [
          `    name: "${d.name}",`,
          `    src: "${d.src}",`,
          `    alt: "${d.alt}",`,
          `    x: ${d.x},`,
          `    y: ${d.y},`,
          `    w: ${d.w},`,
          `    rotate: "${d.rotate}deg",`,
          `    z: ${d.z},`,
        ];
        if (d.anchor === "card") {
          lines.push(`    anchor: "card",`, `    card: ${d.card},`);
        } else if (d.anchor === "phone") {
          lines.push(`    anchor: "phone",`);
        }
        lines.push(`    cap: ${d.cap},`);
        if (d.anchor === "card" ? d.desktopOnly : !d.desktopOnly) {
          lines.push(`    desktopOnly: ${d.desktopOnly},`);
        }
        return `  {\n${lines.join("\n")}\n  },`;
      })
      .join("\n");
    return `export const ${section.exportName}: Sticker[] = [\n${body}\n];`;
  }, [drafts, section.exportName]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard is permission-gated and absent over plain http on some
         hosts; the block is on screen either way. */
      setCopied(false);
    }
  };

  const dirty = JSON.stringify(drafts) !== JSON.stringify(section.seed.map(toDraft));
  const shownLib = lib.filter((l) => famFilter === "all" || l.family === famFilter);
  const families = Array.from(new Set(lib.map((l) => l.family)));

  const stageProps = {
    /* ⚠ THE SECTION RENDERS NOTHING WHILE TUNING. The tuner draws every
       sticker itself as a drag handle; letting the section also render the
       card-pinned ones would paint an undraggable duplicate under the
       handle. */
    hideStickers: true,
    tuning: true,
    stageRef: (el: HTMLDivElement | null) => {
      stageRef.current = el;
    },
  };

  /* The overlay is a child of the SAME stage box the section positions its own
     layer against, so these coordinates transfer 1:1. */
  const overlay = (
    <div className="pointer-events-none absolute inset-0">
      {drafts
        .filter((d) => d.anchor === "stage")
        .map((d) => (
          <Handle
            key={d.name}
            d={d}
            on={sel === d.name}
            outline={outline}
            onDown={startDrag}
            unit="%"
          />
        ))}
    </div>
  );

  /* ⚠ CARD HANDLES ARE FIXED-POSITIONED AND RE-MEASURED EVERY FRAME, not
     rendered inside the card. Testimonials' cards are a MARQUEE: the row is
     animated, so a card's box is in a different place on every frame and a
     handle drawn once would drift off it immediately. Reading the card's rect
     on a rAF loop is the only thing that tracks it. The sticker still STORES
     card-relative percentages, so the output is resolution-independent. */
  const cardHandles = (
    <CardHandleLayer
      drafts={drafts}
      sel={sel}
      outline={outline}
      onDown={startDrag}
    />
  );

  return (
    <div
      className="relative min-h-screen w-full bg-[#f5f2ff]"
      onPointerDown={() => setSel(null)}
    >
      {/* ⚠ THE STAGE IS THE FULL VIEWPORT and carries the real section, so the
          stage is the shape of the real page. */}
      {sectionKey === "hero" && (
        <Hero {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </Hero>
      )}
      {sectionKey === "testimonials" && (
        <Testimonials {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </Testimonials>
      )}
      {sectionKey === "features" && (
        <Features {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </Features>
      )}
      {sectionKey === "faq" && (
        <Faq {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </Faq>
      )}
      {sectionKey === "pricing" && (
        <Pricing {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </Pricing>
      )}
      {sectionKey === "howitworks" && (
        <HowItWorks cards={HOW_IT_WORKS_CARDS} {...stageProps} stickers={drafts as unknown as Sticker[]} tuning>
          {overlay}
        </HowItWorks>
      )}

      {/* Card-pinned handles ride on top of the real cards, wherever they are
          this frame. One layer for every section — it finds its cards by the
          `data-sticker-card` attribute the sections carry. */}
      {cardHandles}

      {/* floating toolbar */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-3 left-3 z-[9999] flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/85 px-3 py-2 font-mono text-[11px] text-white backdrop-blur-md"
      >
        <Link href="/" className="text-white/60 transition hover:text-white">
          ← Exit
        </Link>
        <span className="text-white/20">|</span>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setSectionKey(s.key);
              setSel(null);
            }}
            className={`rounded px-2 py-0.5 transition ${
              s.key === sectionKey
                ? "bg-[#EAC2FF] font-semibold text-[#3D065F]"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="text-white/20">|</span>
        <span className="text-white/40">{drafts.length} stickers</span>
        {dirty && <span className="text-amber-300">● unsaved</span>}
        <button
          onClick={() => setOutline((o) => !o)}
          className="text-white/60 hover:text-white"
          title="outline every sticker, not just the selected one"
        >
          {outline ? "outlines on" : "outlines off"}
        </button>
        <button onClick={() => setPanel((p) => !p)} className="text-white/60 hover:text-white">
          {panel ? "hide panel" : "show panel"}
        </button>
      </div>

      {panel && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed top-16 right-3 bottom-3 z-[9998] flex w-[330px] flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-black/90 p-3 font-mono text-[11px] text-white backdrop-blur-md"
        >
          <p className="leading-relaxed text-white/50">{section.note}</p>

          {/* ── selected ─────────────────────────────── */}
          {active ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-[#EAC2FF]">{active.name}</span>
                <span className="flex gap-1">
                  <button
                    onClick={() => duplicate(active.name)}
                    className="rounded bg-white/10 px-1.5 py-0.5 hover:bg-white/20"
                    title="duplicate (ctrl+D)"
                  >
                    dup
                  </button>
                  <button
                    onClick={() => remove(active.name)}
                    className="rounded bg-red-500/20 px-1.5 py-0.5 text-red-300 hover:bg-red-500/40"
                    title="delete (Del)"
                  >
                    del
                  </button>
                </span>
              </div>

              {/* ⚠ ANCHOR IS THE MOST IMPORTANT FIELD. Switching it changes
                  which BOX x/y measure against, so the numbers are reset to
                  the centre rather than carried over — carrying them would
                  silently move the sticker somewhere arbitrary. */}
              <label className="mb-1 block text-white/50">anchor</label>
              <div className="mb-2 flex gap-1">
                {(["stage", "card"] as StickerAnchor[]).map((a) => (
                  <button
                    key={a}
                    disabled={a === "card" && section.cards === 0}
                    onClick={() =>
                      patch(active.name, {
                        anchor: a,
                        x: 50,
                        y: a === "card" ? 0 : 50,
                        w: a === "card" ? 22 : 10,
                        desktopOnly: a !== "card",
                      })
                    }
                    className={`flex-1 rounded px-2 py-1 transition disabled:opacity-25 ${
                      active.anchor === a
                        ? "bg-[#EAC2FF] font-semibold text-[#3D065F]"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {a === "card" ? "pin to card" : "free (stage)"}
                  </button>
                ))}
              </div>

              {active.anchor === "card" && (
                <>
                  <label className="mb-1 block text-white/50">
                    card index (0–{section.cards - 1})
                  </label>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {Array.from({ length: section.cards }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => patch(active.name, { card: i })}
                        className={`size-6 rounded transition ${
                          active.card === i
                            ? "bg-[#EAC2FF] font-semibold text-[#3D065F]"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <Num label="x %" v={active.x} set={(v) => patch(active.name, { x: v })} step={0.1} />
              <Num label="y %" v={active.y} set={(v) => patch(active.name, { y: v })} step={0.1} />
              <Num
                label={active.anchor === "card" ? "w cqi" : "w %"}
                v={active.w}
                set={(v) => patch(active.name, { w: Math.max(1, v) })}
                step={0.1}
              />
              <Num
                label="rotate °"
                v={active.rotate}
                set={(v) => patch(active.name, { rotate: Math.round(v) })}
                step={1}
              />
              <Num
                label="z"
                v={active.z}
                set={(v) => patch(active.name, { z: Math.round(v) })}
                step={1}
              />
              <Num
                label="cap px"
                v={active.cap}
                set={(v) => patch(active.name, { cap: Math.round(v) })}
                step={4}
              />

              {/* Layer depth presets:
                  z <= 2: behind text/headline
                  z = 5: behind images/phone artwork
                  z = 15: behind cards/UI elements
                  z >= 25: in front of content */}
              <label className="mt-2 mb-1 block text-white/50">layer depth</label>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => patch(active.name, { z: 1 })}
                  className={`rounded px-1.5 py-1 text-center transition ${
                    active.z <= 2 ? "bg-[#EAC2FF] font-semibold text-[#3D065F]" : "bg-white/10 hover:bg-white/20"
                  }`}
                  title="Behind text / headlines (z: 1)"
                >
                  behind text
                </button>
                <button
                  type="button"
                  onClick={() => patch(active.name, { z: 5 })}
                  className={`rounded px-1.5 py-1 text-center transition ${
                    active.z > 2 && active.z < 10 ? "bg-[#EAC2FF] font-semibold text-[#3D065F]" : "bg-white/10 hover:bg-white/20"
                  }`}
                  title="Behind phone / image artwork (z: 5)"
                >
                  behind image
                </button>
                <button
                  type="button"
                  onClick={() => patch(active.name, { z: 15 })}
                  className={`rounded px-1.5 py-1 text-center transition ${
                    active.z >= 10 && active.z < 25 ? "bg-[#EAC2FF] font-semibold text-[#3D065F]" : "bg-white/10 hover:bg-white/20"
                  }`}
                  title="Behind cards / UI (z: 15)"
                >
                  behind card
                </button>
                <button
                  type="button"
                  onClick={() => patch(active.name, { z: 25 })}
                  className={`rounded px-1.5 py-1 text-center transition ${
                    active.z >= 25 ? "bg-[#EAC2FF] font-semibold text-[#3D065F]" : "bg-white/10 hover:bg-white/20"
                  }`}
                  title="In front of content (z: 25)"
                >
                  in front
                </button>
              </div>

              <label className="mt-2 flex items-center gap-2 text-white/60">
                <input
                  type="checkbox"
                  checked={active.desktopOnly}
                  onChange={(e) => patch(active.name, { desktopOnly: e.target.checked })}
                />
                desktop only (hide below lg)
              </label>
              {active.anchor === "stage" && !active.desktopOnly && (
                <p className="mt-1 leading-relaxed text-amber-300/80">
                  ⚠ a free sticker has no anchor once the layout reflows — it will drift on mobile.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/40">
              Click a sticker on the stage, or add one below.
              <br />
              <span className="text-white/30">
                drag = move · shift = snap · [ ] = rotate · Del = remove
              </span>
            </p>
          )}

          {/* ── library ──────────────────────────────── */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-white/50">library · {shownLib.length}</span>
              <span className="flex gap-1">
                {["all", ...families].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFamFilter(f)}
                    className={`rounded px-1.5 py-0.5 transition ${
                      famFilter === f
                        ? "bg-[#EAC2FF] text-[#3D065F]"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </span>
            </div>
            {lib.length === 0 ? (
              <p className="text-amber-300/80">
                No library. Run the import so /images/stickers/index.json exists.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-1">
                {shownLib.map((l) => (
                  <button
                    key={l.name}
                    onClick={() => add(l)}
                    title={`${l.name} — click to add`}
                    className="aspect-square rounded bg-white/10 p-1 transition hover:bg-[#EAC2FF]/30"
                  >
                    <img src={l.src} alt="" className="size-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── config out ───────────────────────────── */}
          <div className="mt-auto">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-white/50">paste into sections/{section.label}</span>
              <span className="flex gap-1">
                <button
                  onClick={() =>
                    setAll((p) => ({ ...p, [sectionKey]: section.seed.map(toDraft) }))
                  }
                  className="rounded bg-white/10 px-1.5 py-0.5 hover:bg-white/20"
                >
                  reset
                </button>
                <button
                  onClick={copy}
                  className="rounded bg-[#EAC2FF] px-2 py-0.5 font-semibold text-[#3D065F] hover:brightness-110"
                >
                  {copied ? "copied ✓" : "copy"}
                </button>
              </span>
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/60 p-2 text-[10px] leading-relaxed text-[#EAC2FF]">
              {config}
            </pre>
            <p className="mt-1 leading-relaxed text-white/30">
              The tuner never writes the section — paste it by hand.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* A sticker's drag handle. Card-anchored ones are rendered by the section
   itself (inside the card), so the handle here covers stage ones; card
   handles are portalled in by the section through the same component. */
function Handle({
  d,
  on,
  outline,
  onDown,
  unit,
}: {
  d: Draft;
  on: boolean;
  outline: boolean;
  onDown: (e: React.PointerEvent, name: string, mode: "move" | "resize" | "rotate") => void;
  unit: string;
}) {
  return (
    <div
      id={`tuner-${d.name}`}
      onPointerDown={(e) => onDown(e, d.name, "move")}
      className="pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing"
      style={{
        left: `${d.x}%`,
        top: `${d.y}%`,
        width: `${d.w}%`,
        zIndex: on ? 600 : d.z,
        transform: `translate(-50%, -50%) rotate(${d.rotate}deg)`,
      }}
    >
      <img
        src={d.src}
        alt=""
        draggable={false}
        className="pointer-events-none block h-auto w-full select-none drop-shadow-xl"
      />

      {outline && !on && (
        <div className="pointer-events-none absolute -inset-0.5 border border-dashed border-[#8B5CF6]/50" />
      )}

      {on && (
        <div className="pointer-events-none absolute -inset-1 border-2 border-[#8B5CF6]">
          {/* ⚠ THE BADGE SITS BELOW THE BOX AND THE KNOB ABOVE IT. Both at
              -top-7 meant the badge covered the rotation knob and swallowed
              its pointer events. */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-[#1c1836] px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-[#EAC2FF]">
            {d.x}
            {unit} · {d.y}
            {unit} · w {d.w} · {d.rotate}°
          </div>

          <div
            onPointerDown={(e) => onDown(e, d.name, "rotate")}
            title="drag to rotate · shift snaps to 15°"
            className="pointer-events-auto absolute -top-8 left-1/2 size-4 -translate-x-1/2 cursor-crosshair touch-none rounded-full border-2 border-[#8B5CF6] bg-white"
          />
          <div className="absolute -top-5 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-[#8B5CF6]" />

          {/* One resize handle. Four identical corners all did the same thing. */}
          <div
            onPointerDown={(e) => onDown(e, d.name, "resize")}
            title="drag to scale"
            className="pointer-events-auto absolute -right-2 -bottom-2 size-4 cursor-nwse-resize touch-none rounded-sm border-2 border-[#8B5CF6] bg-white"
          />
        </div>
      )}
    </div>
  );
}

function Num({
  label,
  v,
  set,
  step,
}: {
  label: string;
  v: number;
  set: (n: number) => void;
  step: number;
}) {
  return (
    <label className="mb-1 flex items-center gap-2">
      <span className="w-16 shrink-0 text-white/50">{label}</span>
      <input
        type="number"
        value={v}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) set(n);
        }}
        className="w-full rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white outline-none focus:border-[#EAC2FF]"
      />
    </label>
  );
}

/* ⚠ TRACKS THE CARD EVERY FRAME. Testimonials' rows are a CSS marquee, so a
   card's box moves continuously; a handle positioned once is off it by the
   next frame. This reads the rects on rAF and draws the handles in fixed
   coordinates over them.
   It positions against the card that carries `data-sticker-card`, which is
   the same box the section's own CardStickers layer uses — so what is dragged
   here and what ships are the same percentages.
   `querySelectorAll` + [0]: the marquee renders the set twice, and the first
   copy is the one to track. */
function CardHandleLayer({
  drafts,
  sel,
  outline,
  onDown,
}: {
  drafts: Draft[];
  sel: string | null;
  outline: boolean;
  onDown: (e: React.PointerEvent, name: string, mode: "move" | "resize" | "rotate") => void;
}) {
  const [rects, setRects] = useState<Record<number, DOMRect>>({});
  const cards = drafts.filter((d) => d.anchor === "card");
  /* the set of card indices to watch, as a stable string so the effect does
     not restart on every render */
  const key = cards.map((d) => d.card).sort().join(",");

  useEffect(() => {
    if (!key) return;
    let raf = 0;
    const tick = () => {
      const next: Record<number, DOMRect> = {};
      for (const i of new Set(key.split(",").map(Number))) {
        const el = document.querySelectorAll<HTMLElement>(`[data-sticker-card="${i}"]`)[0];
        if (el) next[i] = el.getBoundingClientRect();
      }
      setRects(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[600]">
      {cards.map((d) => {
        const r = rects[d.card];
        if (!r || !r.width) return null;
        const on = sel === d.name;
        /* w is cqi — a percentage of the card's inline size. */
        const w = Math.min((d.w / 100) * r.width, d.cap || 160);
        return (
          <div
            key={d.name}
            id={`tuner-${d.name}`}
            onPointerDown={(e) => onDown(e, d.name, "move")}
            className="pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing"
            style={{
              left: r.left + (d.x / 100) * r.width,
              top: r.top + (d.y / 100) * r.height,
              width: Math.max(16, w),
              zIndex: on ? 700 : d.z,
              transform: `translate(-50%, -50%) rotate(${d.rotate}deg)`,
            }}
          >
            <img
              src={d.src}
              alt=""
              draggable={false}
              className="pointer-events-none block h-auto w-full select-none drop-shadow-xl"
            />
            {outline && !on && (
              <div className="pointer-events-none absolute -inset-0.5 border border-dashed border-[#22d3ee]/70" />
            )}
            {on && (
              <div className="pointer-events-none absolute -inset-1 border-2 border-[#22d3ee]">
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-[#083344] px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-[#a5f3fc]">
                  card {d.card} · {d.x}% · {d.y}% · w {d.w}cqi · {d.rotate}°
                </div>
                <div
                  onPointerDown={(e) => onDown(e, d.name, "rotate")}
                  title="drag to rotate · shift snaps to 15°"
                  className="pointer-events-auto absolute -top-8 left-1/2 size-4 -translate-x-1/2 cursor-crosshair touch-none rounded-full border-2 border-[#22d3ee] bg-white"
                />
                <div className="absolute -top-5 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-[#22d3ee]" />
                <div
                  onPointerDown={(e) => onDown(e, d.name, "resize")}
                  title="drag to scale"
                  className="pointer-events-auto absolute -right-2 -bottom-2 size-4 cursor-nwse-resize touch-none rounded-sm border-2 border-[#22d3ee] bg-white"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
