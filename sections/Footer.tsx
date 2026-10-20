"use client";

import { useRef } from "react";
import Section from "@/components/Section";
import TicketStrip from "@/components/TicketStrip";
import FooterCoins from "@/components/FooterCoins";
import MobileCoinRain from "@/components/MobileCoinRain";
import TicketSocials from "@/components/TicketSocials";
import FooterCloudContent from "@/components/FooterCloudContent";


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
    /* ⚠ THE REDUCED-MOTION GUARD HAS TO BE HERE, IN JS. This writes
       `style.transform` directly, so the `@media (prefers-reduced-motion)`
       block that covers the cloud's CSS breathe cannot reach it. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      flush={true}
      className="relative overflow-hidden bg-[#e3b5fb] select-none [--cloud-target-x:clamp(270px,76vw,420px)] md:[--cloud-target-x:58.5vw]"
    >
      <div
        className="relative h-full w-full min-h-[100svh] overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Background: Vibrant cyan-to-purple gradient from mockup */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8] via-[#607afb] to-[#9481fb]" />

        {/* ⚠ THE GRADIENT'S TOP EDGE IS COVERED BELOW md. The gradient above
            is meant to sit BEHIND the cloud, and the cloud is `hidden
            md:block` — so on a phone its first rows were the topmost thing in
            the section and painted a hard cyan line across the join with
            pricing. Measured at the seam: rgb(122,125,251), the #607afb stop,
            a +116 jump in blueness against the rows above it.
            This is a band of the footer's own ground colour over that edge,
            fading out just below it so the gradient still emerges where the
            cloud would have revealed it. Desktop renders nothing here: there
            the cloud already covers it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[21] h-[22svh] md:hidden"
          style={{ background: "linear-gradient(to bottom, #e3b5fb 0%, #e3b5fb 55%, transparent 100%)" }}
        />

        {/* 
          3a. Floating Interactive Crypto Coin Field (Desktop >= 768px):
          Layered in the gradient pocket behind the cloud border,
          popping to foreground on hover.
        */}
        <FooterCoins />

        {/* 
          3b. Rain Droplet Crypto Coins (Mobile < 768px):
          Coins drop gently from underneath the cloud png like raindrops.
        */}
        <MobileCoinRain />

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
            <div className="absolute -top-[10%] -bottom-[10%] right-full w-[100vw] bg-[#e3b5fb] -mr-px pointer-events-none" />

            {/* Cloud graphic with black comic outline */}
            <img
              loading="lazy"
              decoding="async"
              src="/images/footer/cloud-violet.png"
              alt=""
              className="h-full w-auto max-w-none object-contain select-none pointer-events-none"
              style={{
                aspectRatio: "1920 / 1080",
              }}
            />
          </div>

        </div>

        {/* 
          1b. Mobile Cloud Group (Strictly for mobile < 768px):
          Placed on top, right side facing downwards (height up to 48% of the window)
        */}
        <div className="pointer-events-none block md:hidden absolute inset-x-0 top-0 z-20 h-[48svh] overflow-hidden select-none">
          {/* Solid haze extension rectangle extending upwards */}
          <div className="absolute -top-[50vh] inset-x-0 h-[50vh] bg-[#e3b5fb] pointer-events-none" />

          {/* Cloud graphic with right side facing downwards and subtle breathing micro-animation */}
          <div className="pointer-events-none relative h-full w-full animate-cloud-breathe-mob will-change-transform">
            <img
              loading="lazy"
              decoding="async"
              src="/images/footer/cloud-mobile-violet.png"
              alt=""
              className="h-full w-full object-fill select-none pointer-events-none"
            />
          </div>

        </div>


        {/* the content inside the cloud — a layer over it, sized to its edge */}
        <FooterCloudContent />

        {/*
          2. Ticket Strip:
          Positioned along the right edge at ~78.5vw (meeting the user's white guide line)
          with perforated dashed left border.
        */}
        {/* below md the band grows to fit the QR + icons + CTA instead of
            a fixed 18svh — on a 360x640 phone 18svh is 115px, too short
            to hold them. It still never drops below 18svh. */}
        <TicketStrip className="max-md:h-auto max-md:min-h-[18svh]">
          <TicketSocials />
        </TicketStrip>
      </div>
    </Section>
  );
}
