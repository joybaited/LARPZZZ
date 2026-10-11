"use client";

import PixelatedImageReveal from "@/components/PixelatedImageReveal";

/* A demo route for the osmo.supply pixelated reveal — not part of the site.
   Hover (or tap) the card. Delete this route once the effect has a home. */
export default function PixelDemo() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#3D065F] p-8">
      <PixelatedImageReveal
        images={[
          { src: "/images/step-cash.webp", alt: "" },
          { src: "/images/step-key.webp", alt: "" },
        ]}
        /* the pixels take their colour from this — currentColor */
        className="w-[30vw] max-w-full text-[#EAC2FF]"
      />
    </main>
  );
}
