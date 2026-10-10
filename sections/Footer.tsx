"use client";

import { useRef } from "react";
import Section from "@/components/Section";
import TicketStrip from "@/components/TicketStrip";
import FooterCoins from "@/components/FooterCoins";

/**
 * Section 7: Footer
 * Step 1: Cloud base (locked to 58.5vw desktop, meeting user's red guide line)
 * Step 2: Right-side Ticket Strip (locked to 78.5vw with chunky 5px dashed perforation)
 * Step 3: Floating Interactive Crypto Coins (clustered in the 58.5vw - 78.5vw pocket with spring hover physics)
 */
export default function Footer() {
  const cloudGroupRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cloudGroupRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    // Gentle organic float: subtle vertical breathing + micro horizontal shift
    cloudGroupRef.current.style.transform = `translate3d(${relX * 8}px, ${relY * 8}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (!cloudGroupRef.current) return;
    cloudGroupRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <Section
      id="footer"
      bleed={true}
      className="relative overflow-hidden bg-haze select-none [--cloud-target-x:clamp(270px,76vw,420px)] md:[--cloud-target-x:58.5vw]"
    >
      <div
        className="relative h-full w-full min-h-[100svh] overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Background: Vibrant cyan-to-purple gradient from mockup */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8] via-[#607afb] to-[#9481fb]" />

        {/* 
          3. Floating Interactive Crypto Coin Field:
          Layered in the gradient pocket behind the cloud border,
          popping to foreground on hover.
        */}
        <FooterCoins />

        {/* 
          1a. Desktop Cloud Group (Strictly UNTOUCHED for desktop >= 768px):
          Positioned so the rightmost contour apex (at 65.3% of 1920x1080)
          meets the user's red guide line (~58.5vw on desktop).
          pointer-events-none on the graphic wrapper so transparent areas
          never block coin hover events.
        */}
        <div
          ref={cloudGroupRef}
          className="pointer-events-none hidden md:block absolute inset-y-0 left-0 z-20 transition-transform duration-700 ease-out will-change-transform"
        >
          {/* Cloud image wrapper anchored to 58.5vw desktop with subtle breathing animation */}
          <div
            className="pointer-events-none relative h-full animate-cloud-breathe will-change-transform"
            style={{
              left: "calc(var(--cloud-target-x, 58.5vw) - (100vh * 1.161))",
            }}
          >
            {/* Solid haze extension rectangle extending infinitely left */}
            <div className="absolute -top-[10%] -bottom-[10%] right-full w-[100vw] bg-haze -mr-px pointer-events-none" />

            {/* Cloud graphic with black comic outline */}
            <img
              src="/images/footer/cloud.png"
              alt="Cloud footer boundary"
              className="h-full w-auto max-w-none object-contain select-none pointer-events-none"
              style={{
                aspectRatio: "1920 / 1080",
              }}
            />
          </div>

          {/* Content Container inside the solid white area of the cloud: pointer-events-auto for interactive links */}
          <div className="pointer-events-auto absolute inset-y-0 left-0 z-30 flex flex-col justify-between p-(--space-m) sm:p-(--space-xl) md:p-(--space-2xl) max-w-[min(46vw,600px)]">
            {/* Header / Brand */}
            <div>
              <span className="font-display text-2 uppercase tracking-tight text-ink">
                LARPZZZ
              </span>
              <p className="mt-(--space-s) text-base text-ink/70 max-w-[34ch]">
                The new wave of digital assets. Fake it till you make it.
              </p>
            </div>

            {/* Bottom links placeholder */}
            <div className="flex flex-wrap items-center gap-(--space-m) text-base text-ink/50">
              <span>© 2026 LARPZZZ</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>

        {/* 
          1b. Mobile Cloud Group (Strictly for mobile < 768px):
          Placed on top, right side facing downwards (height up to 48% of the window)
        */}
        <div className="pointer-events-none block md:hidden absolute inset-x-0 top-0 z-20 h-[48svh] overflow-hidden select-none">
          {/* Solid haze extension rectangle extending upwards */}
          <div className="absolute -top-[50vh] inset-x-0 h-[50vh] bg-haze pointer-events-none" />

          {/* Cloud graphic with right side facing downwards and subtle breathing micro-animation */}
          <div className="pointer-events-none relative h-full w-full animate-cloud-breathe-mob will-change-transform">
            <img
              src="/images/footer/cloud-mobile.png"
              alt="Cloud footer boundary"
              className="h-full w-full object-fill select-none pointer-events-none"
            />
          </div>

          {/* Content Container inside the solid white area of the mobile cloud */}
          <div className="pointer-events-auto absolute inset-0 z-30 flex flex-col justify-between p-5 pb-7 max-h-[38svh]">
            {/* Header / Brand */}
            <div>
              <span className="font-display text-[28px] uppercase tracking-tight text-ink leading-none">
                LARPZZZ
              </span>
              <p className="mt-2 text-sm text-ink/70 max-w-[28ch] leading-snug">
                The new wave of digital assets. Fake it till you make it.
              </p>
            </div>

            {/* Bottom links placeholder */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink/50">
              <span>© 2026 LARPZZZ</span>
              <a href="#" className="hover:text-ink transition-colors">Privacy</a>
              <a href="#" className="hover:text-ink transition-colors">Terms</a>
            </div>
          </div>
        </div>

        {/* 
          2. Ticket Strip:
          Positioned along the right edge at ~78.5vw (meeting the user's white guide line)
          with perforated dashed left border.
        */}
        <TicketStrip />
      </div>
    </Section>
  );
}
