"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Hero, { HERO } from "@/sections/Hero";
import HowItWorks, { HOW_IT_WORKS_CARDS, HOW_IT_WORKS_STICKERS } from "@/sections/HowItWorks";
import Features, { FEATURES_STICKERS } from "@/sections/Features";
import Testimonials, { TESTIMONIALS_STICKERS } from "@/sections/Testimonials";
import Faq, { FAQ_STICKERS } from "@/sections/Faq";
import Pricing, { PRICING_STICKERS } from "@/sections/Pricing";
import Footer from "@/sections/Footer";

export type SectionKey =
  | "hero"
  | "how-it-works"
  | "features"
  | "testimonials"
  | "faq"
  | "pricing"
  | "footer";

export type FreeSticker = {
  id: string;
  name: string;
  section: SectionKey;
  src: string;
  x: number;       // % of section width (relative to section container)
  y: number;       // % of section height
  w: number;       // % of section width (natural scaling, NO CAPPING)
  rotate: number;  // degrees
  z: number;
};

// Seed tuner with ALL current stickers from each section so there are NO duplicates
const INITIAL_STICKERS: FreeSticker[] = [
  // 1. Hero stickers
  ...(HERO.stickers || []).map((s, idx) => ({
    id: `hero-${s.name || idx}`,
    name: s.name || `sticker-${idx + 1}`,
    section: "hero" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: parseFloat(s.rotate || "0") || 0,
    z: s.z ?? 20,
  })),

  // 2. How It Works stickers
  ...HOW_IT_WORKS_STICKERS.map((s, idx) => ({
    id: `how-${s.name || idx}`,
    name: s.name,
    section: "how-it-works" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: parseFloat(s.rotate || "0") || 0,
    z: s.z ?? 25,
  })),

  // 3. Features stickers
  ...FEATURES_STICKERS.map((s, idx) => ({
    id: s.id || `features-${idx}`,
    name: s.name,
    section: "features" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: s.rotate || 0,
    z: s.z ?? 25,
  })),

  // 4. Testimonials stickers
  ...TESTIMONIALS_STICKERS.map((s, idx) => ({
    id: s.id || `testimonials-${idx}`,
    name: s.name,
    section: "testimonials" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: s.rotate || 0,
    z: s.z ?? 25,
  })),

  // 5. FAQ stickers
  ...FAQ_STICKERS.map((s, idx) => ({
    id: s.id || `faq-${idx}`,
    name: s.name,
    section: "faq" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: s.rotate || 0,
    z: s.z ?? 25,
  })),

  // 6. Pricing stickers
  ...PRICING_STICKERS.map((s, idx) => ({
    id: s.id || `pricing-${idx}`,
    name: s.name,
    section: "pricing" as SectionKey,
    src: s.src,
    x: s.x,
    y: s.y,
    w: s.w,
    rotate: s.rotate || 0,
    z: s.z ?? 25,
  })),
];

const SECTIONS: { id: SectionKey; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "how-it-works", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "pricing", label: "Pricing" },
  { id: "footer", label: "Footer" },
];

export default function CanvaStickerTuner() {
  const [stickers, setStickers] = useState<FreeSticker[]>(INITIAL_STICKERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const activeSticker = stickers.find((s) => s.id === selectedId) || null;

  // Track active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Universal Canva Drag Handler (Move, Resize with zero caps, Rotate)
  const startDrag = useCallback(
    (
      e: React.PointerEvent,
      targetId: string,
      mode: "move" | "resize" | "rotate",
      element: HTMLElement,
      sectionEl: HTMLElement
    ) => {
      e.stopPropagation();
      e.preventDefault();

      setSelectedId(targetId);

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const initialDist = Math.max(10, Math.hypot(dx, dy));
      const initialAngle = Math.atan2(dy, dx);
      const secRect = sectionEl.getBoundingClientRect();

      const st = stickers.find((s) => s.id === targetId);
      if (!st) return;

      const initX = st.x;
      const initY = st.y;
      const initW = st.w;
      const initRot = st.rotate;
      const startPointerX = e.clientX;
      const startPointerY = e.clientY;

      const handlePointerMove = (moveEv: PointerEvent) => {
        if (mode === "resize") {
          // Direct Canva distance ratio scaling (NO CAPPING AT ALL)
          const currentDist = Math.hypot(moveEv.clientX - centerX, moveEv.clientY - centerY);
          const ratio = currentDist / initialDist;
          const newW = Math.max(1, Math.round(initW * ratio * 10) / 10);
          setStickers((prev) =>
            prev.map((s) => (s.id === targetId ? { ...s, w: newW } : s))
          );
        } else if (mode === "rotate") {
          const currentAngle = Math.atan2(moveEv.clientY - centerY, moveEv.clientX - centerX);
          const deltaAngle = currentAngle - initialAngle;
          let newRot = Math.round(initRot + (deltaAngle * 180) / Math.PI);
          if (moveEv.shiftKey) newRot = Math.round(newRot / 15) * 15;
          setStickers((prev) =>
            prev.map((s) => (s.id === targetId ? { ...s, rotate: newRot } : s))
          );
        } else if (mode === "move") {
          if (secRect.width > 0 && secRect.height > 0) {
            const dxPx = moveEv.clientX - startPointerX;
            const dyPx = moveEv.clientY - startPointerY;
            const newX = Math.round((initX + (dxPx / secRect.width) * 100) * 10) / 10;
            const newY = Math.round((initY + (dyPx / secRect.height) * 100) * 10) / 10;
            setStickers((prev) =>
              prev.map((s) => (s.id === targetId ? { ...s, x: newX, y: newY } : s))
            );
          }
        }
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [stickers]
  );

  // Keyboard Delete & Deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          setStickers((prev) => prev.filter((s) => s.id !== selectedId));
          setSelectedId(null);
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // Upload sticker from gallery
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadNotice("Saving sticker to project...");

    const localUrl = URL.createObjectURL(file);
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", baseName);

      const res = await fetch("/api/upload-sticker", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const finalSrc = data.success && data.src ? data.src : localUrl;
      const finalName = data.name || baseName;

      const newSticker: FreeSticker = {
        id: `sticker-${Date.now()}`,
        name: finalName,
        section: activeSection,
        src: finalSrc,
        x: 50,
        y: 50,
        w: 18,
        rotate: 0,
        z: 25,
      };

      setStickers((prev) => [...prev, newSticker]);
      setSelectedId(newSticker.id);
      setUploadNotice(`✓ Added ${finalName} to ${activeSection}`);
    } catch {
      const fallback: FreeSticker = {
        id: `sticker-${Date.now()}`,
        name: baseName,
        section: activeSection,
        src: localUrl,
        x: 50,
        y: 50,
        w: 18,
        rotate: 0,
        z: 25,
      };
      setStickers((prev) => [...prev, fallback]);
      setSelectedId(fallback.id);
      setUploadNotice(`✓ Added ${baseName} to ${activeSection}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadNotice(null), 3000);
    }
  };

  // Group stickers by section
  const stickersBySection = useMemo(() => {
    const map: Record<SectionKey, FreeSticker[]> = {
      hero: [],
      "how-it-works": [],
      features: [],
      testimonials: [],
      faq: [],
      pricing: [],
      footer: [],
    };
    stickers.forEach((s) => {
      if (map[s.section]) map[s.section].push(s);
      else map.hero.push(s);
    });
    return map;
  }, [stickers]);

  // Clean config string to copy
  const generatedConfig = useMemo(() => {
    const heroList = stickersBySection.hero;
    const howList = stickersBySection["how-it-works"];
    const otherList = stickers.filter((s) => s.section !== "hero" && s.section !== "how-it-works");

    return `// ============================================================================
// 1. HERO SECTION STICKERS (sections/Hero.tsx -> HERO.stickers)
// ============================================================================
stickers: [
${heroList
  .map(
    (s) => `  {
    name: "${s.name}",
    src: "${s.src}",
    alt: "",
    x: ${s.x},
    y: ${s.y},
    w: ${s.w},
    rotate: "${s.rotate}deg",
    rise: 14,
    drift: 8,
    tilt: "2deg",
    dur: "10s",
    delay: "-3s",
    z: ${s.z},
  },`
  )
  .join("\n")}
],

// ============================================================================
// 2. HOW IT WORKS STICKERS (sections/HowItWorks.tsx -> stickers prop)
// ============================================================================
stickers: [
${howList
  .map(
    (s) => `  {
    name: "${s.name}",
    src: "${s.src}",
    alt: "",
    x: ${s.x},
    y: ${s.y},
    w: ${s.w},
    rotate: "${s.rotate}deg",
    z: ${s.z},
  },`
  )
  .join("\n")}
]${
      otherList.length > 0
        ? `\n\n// Other stickers:\n${JSON.stringify(otherList, null, 2)}`
        : ""
    }`;
  }, [stickers, stickersBySection]);

  const copyConfig = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to render Canva stickers overlay over a section
  const renderStickersOverlay = (secKey: SectionKey) => {
    const list = stickersBySection[secKey];
    return (
      <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
        {list.map((st) => {
          const isSelected = selectedId === st.id;

          return (
            <div
              key={st.id}
              id={`sticker-box-${st.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(st.id);
              }}
              onPointerDown={(e) => {
                const parentSection = sectionRefs.current[secKey];
                if (parentSection) {
                  startDrag(e, st.id, "move", e.currentTarget, parentSection);
                }
              }}
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: `${st.w}%`,
                zIndex: st.z,
                transform: `translate(-50%, -50%) rotate(${st.rotate}deg)`,
              }}
              className={`pointer-events-auto absolute cursor-grab active:cursor-grabbing select-none ${
                isSelected ? "z-50" : ""
              }`}
            >
              <img
                src={st.src}
                alt={st.name}
                draggable={false}
                className="block h-auto w-full max-w-none select-none drop-shadow-xl pointer-events-none"
              />

              {/* CANVA-STYLE SELECTION BOX */}
              {isSelected && (
                <div className="pointer-events-none absolute -inset-2 rounded-sm border-2 border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.6)]">
                  {/* Badge */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1c1836] px-2 py-0.5 text-[10px] font-mono font-medium text-[#EAC2FF] shadow border border-white/20">
                    {st.name} ({st.w}% · {st.rotate}°)
                  </div>

                  {/* Top Rotation Knob */}
                  <div className="pointer-events-auto absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div
                      onPointerDown={(e) => {
                        const box = document.getElementById(`sticker-box-${st.id}`);
                        const parentSection = sectionRefs.current[secKey];
                        if (box && parentSection) startDrag(e, st.id, "rotate", box, parentSection);
                      }}
                      className="size-3.5 rounded-full bg-white border-2 border-[#8B5CF6] shadow cursor-crosshair hover:scale-125 transition"
                      title="Drag to rotate"
                    />
                    <div className="w-0.5 h-3 bg-[#8B5CF6]" />
                  </div>

                  {/* 4 Corner Resize Handles (Zero caps) */}
                  <div
                    onPointerDown={(e) => {
                      const box = document.getElementById(`sticker-box-${st.id}`);
                      const parentSection = sectionRefs.current[secKey];
                      if (box && parentSection) startDrag(e, st.id, "resize", box, parentSection);
                    }}
                    className="pointer-events-auto absolute -top-2 -left-2 size-4 rounded-xs bg-white border-2 border-[#8B5CF6] shadow cursor-nwse-resize hover:scale-125 transition"
                    title="Drag corner to scale (no caps)"
                  />
                  <div
                    onPointerDown={(e) => {
                      const box = document.getElementById(`sticker-box-${st.id}`);
                      const parentSection = sectionRefs.current[secKey];
                      if (box && parentSection) startDrag(e, st.id, "resize", box, parentSection);
                    }}
                    className="pointer-events-auto absolute -top-2 -right-2 size-4 rounded-xs bg-white border-2 border-[#8B5CF6] shadow cursor-nesw-resize hover:scale-125 transition"
                    title="Drag corner to scale (no caps)"
                  />
                  <div
                    onPointerDown={(e) => {
                      const box = document.getElementById(`sticker-box-${st.id}`);
                      const parentSection = sectionRefs.current[secKey];
                      if (box && parentSection) startDrag(e, st.id, "resize", box, parentSection);
                    }}
                    className="pointer-events-auto absolute -bottom-2 -left-2 size-4 rounded-xs bg-white border-2 border-[#8B5CF6] shadow cursor-nesw-resize hover:scale-125 transition"
                    title="Drag corner to scale (no caps)"
                  />
                  <div
                    onPointerDown={(e) => {
                      const box = document.getElementById(`sticker-box-${st.id}`);
                      const parentSection = sectionRefs.current[secKey];
                      if (box && parentSection) startDrag(e, st.id, "resize", box, parentSection);
                    }}
                    className="pointer-events-auto absolute -bottom-2 -right-2 size-4 rounded-xs bg-white border-2 border-[#8B5CF6] shadow cursor-nwse-resize hover:scale-125 transition"
                    title="Drag corner to scale (no caps)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={() => setSelectedId(null)}
      className="relative min-h-screen w-full bg-[#f5f2ff] font-sans select-none overflow-x-hidden"
    >
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        }}
      />

      {/* TOP BAR / NAVIGATION */}
      <div className="fixed top-4 left-4 z-[9999] flex items-center gap-3 rounded-full bg-black/85 px-4 py-2 font-mono text-xs text-white shadow-xl backdrop-blur-md border border-white/10">
        <Link href="/" className="text-white/60 hover:text-white transition">
          ← Exit
        </Link>
        <span className="text-white/20">|</span>
        <span className="font-semibold text-[#EAC2FF]">Canva Mode</span>
        <span className="text-white/40 text-[11px] hidden sm:inline">
          Active: <b className="text-white">{activeSection}</b>
        </span>
        {uploadNotice && (
          <span className="ml-2 font-semibold text-emerald-400">{uploadNotice}</span>
        )}
      </div>

      {/* 1. HERO SECTION */}
      <div
        id="hero"
        ref={(el) => {
          sectionRefs.current.hero = el;
        }}
        className="relative"
      >
        <Hero hideStickers />
        {renderStickersOverlay("hero")}
      </div>

      {/* 2. HOW IT WORKS SECTION */}
      <div
        id="how-it-works"
        ref={(el) => {
          sectionRefs.current["how-it-works"] = el;
        }}
        className="relative"
      >
        <HowItWorks cards={HOW_IT_WORKS_CARDS} hideStickers />
        {renderStickersOverlay("how-it-works")}
      </div>

      {/* 3. FEATURES */}
      <div
        id="features"
        ref={(el) => {
          sectionRefs.current.features = el;
        }}
        className="relative"
      >
        <Features hideStickers />
        {renderStickersOverlay("features")}
      </div>

      {/* 4. TESTIMONIALS */}
      <div
        id="testimonials"
        ref={(el) => {
          sectionRefs.current.testimonials = el;
        }}
        className="relative"
      >
        <Testimonials hideStickers />
        {renderStickersOverlay("testimonials")}
      </div>

      {/* 5. FAQ */}
      <div
        id="faq"
        ref={(el) => {
          sectionRefs.current.faq = el;
        }}
        className="relative"
      >
        <Faq hideStickers />
        {renderStickersOverlay("faq")}
      </div>

      {/* 6. PRICING */}
      <div
        id="pricing"
        ref={(el) => {
          sectionRefs.current.pricing = el;
        }}
        className="relative"
      >
        <Pricing hideStickers />
        {renderStickersOverlay("pricing")}
      </div>

      {/* 7. FOOTER */}
      <div
        id="footer"
        ref={(el) => {
          sectionRefs.current.footer = el;
        }}
        className="relative"
      >
        <Footer />
        {renderStickersOverlay("footer")}
      </div>

      {/* =========================================================================
          BOTTOM MINIMAL FLOATING CANVA TOOLBAR
          ========================================================================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 rounded-full bg-[#151226]/95 px-5 py-2.5 shadow-2xl backdrop-blur-xl border border-white/15 text-xs text-white">
        {/* Add Sticker Button */}
        <button
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-[#3D065F] px-4 py-2 font-semibold text-[#EAC2FF] hover:bg-[#4d0878] active:scale-95 transition border border-[#EAC2FF]/30 shadow"
        >
          <span>➕ Add Image from Gallery</span>
        </button>

        {/* Selected Sticker Controls & Info */}
        {activeSticker && (
          <div className="flex items-center gap-2 pl-2 pr-1 border-l border-white/15 font-mono text-[11px] text-white/80">
            <span className="text-[#EAC2FF] font-semibold">{activeSticker.name}</span>
            <span>w: {activeSticker.w}%</span>
            <span>rot: {activeSticker.rotate}°</span>
            <button
              onClick={() => {
                setStickers((prev) => prev.filter((s) => s.id !== activeSticker.id));
                setSelectedId(null);
              }}
              className="rounded-full bg-rose-500/20 px-2 py-1 text-rose-300 hover:bg-rose-500/40 text-[10px] font-bold"
              title="Delete sticker"
            >
              🗑 Delete
            </button>
          </div>
        )}

        {/* Copy Config Main Button */}
        <button
          onClick={copyConfig}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9481fb] to-[#EAC2FF] px-5 py-2 font-bold text-[#201e45] hover:brightness-110 active:scale-95 transition shadow-lg"
        >
          {copied ? "✓ Copied Config!" : "📋 Copy Config"}
        </button>
      </div>
    </div>
  );
}
