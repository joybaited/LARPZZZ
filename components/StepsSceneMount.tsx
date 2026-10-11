"use client";

import dynamic from "next/dynamic";

/* ⚠ DYNAMIC, ssr:false — three.js stays out of the initial bundle and never
   runs on the server. Same shape as the hero's <SceneMount>. */
const StepsScene = dynamic(() => import("./StepsScene"), { ssr: false });

/* the centre slot. Isolation lives here rather than in the scene:
   - `contain: layout paint size` — the canvas cannot invalidate layout or
     paint outside this box, so nothing it does reaches the rest of the page.
   - `isolate` — its own stacking context, so the z-10 inside cannot punch
     through the nav (HANDOVER.md: keep every sticker below z-30).
   - `pointer-events-none` — the model never eats a click meant for a card.
   - `aria-hidden` — decorative, so a screen reader meets the four steps and
     not an unlabelled canvas. */
export default function StepsSceneMount({ fit }: { fit?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 isolate"
      style={{ contain: "layout paint size" }}
    >
      <StepsScene fit={fit} />
    </div>
  );
}
