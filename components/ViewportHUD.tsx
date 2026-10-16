"use client";

import { useState, useEffect } from "react";

export default function ViewportHUD() {
  if (process.env.NODE_ENV === "production") return null;

  const [mounted, setMounted] = useState(false);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    function update() {
      setDims({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!mounted) return null;

  return (
    <aside
      aria-label="Development Viewport Indicator"
      className="fixed bottom-3 right-3 z-[99999] select-none rounded border border-white/10 bg-black/85 px-2.5 py-1 font-mono text-[11px] text-[#00ff66] shadow-lg backdrop-blur-sm flex items-center gap-2"
    >
      <span>
        {dims.width}px × {dims.height}px |{" "}
        {dims.width >= 1800
          ? "4K Canvas"
          : dims.width >= 1024
          ? "Desktop"
          : "Mobile/Tablet"}
      </span>
      <span className="text-white/30">|</span>
      <a
        href="/sticker-tuner"
        className="text-[#EAC2FF] hover:underline font-sans font-semibold text-[11px]"
      >
        Sticker Tuner ⚙
      </a>
    </aside>
  );
}
