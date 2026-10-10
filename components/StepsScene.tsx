"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import type * as THREE from "three";

/* The How it works model. STATIC — no entrance, no float, no parallax.
 *
 * ⚠ THIS IS NOT <Scene>/<Phone>, AND THAT IS DELIBERATE. Those are the
 * hero's: a tuned camera, an entrance spring, an idle float and mouse
 * parallax, all of which Kez asked NOT to have here. Reusing them would mean
 * passing a tune that zeroes six animation dials and hoping none of them is
 * ever re-tuned from /hero-tuner. The hero's pair are left untouched so the
 * one-line path back to the hero phone (HANDOVER.md, session 14) still works.
 *
 * ⚠ THE GLB IS @snvzyn'S BINARY. public/models/iphone.glb, last written by
 * 62d1880 (their seam fix). Nothing here rebuilds it, and no script is run —
 * CLAUDE.md records that three scripts write that path and each destroys the
 * other two's work. This only reads it.
 *
 * ⚠ THE ONE LIVE <Canvas>. The hero's is commented out at its mount, so this
 * is the only one on the page. Kez: "the glb is only gonna be here nowhere
 * else." If the hero's phone is ever restored, that is two live canvases and
 * the architecture conversation CLAUDE.md asks for.
 */

/* ⚠ SELF-HOSTED DECODER, NOT gstatic. Measured on this section's first
   build: the glb landed at 5636ms and the Draco decoder only at 8010ms —
   it is fetched AFTER the glb parses and discovers it needs one, so the two
   are serial and the gap is dead time. Same third-party-serial problem
   HANDOVER.md has had open for three sessions against Scene.tsx:11.
   The files ship inside the installed `three` package
   (examples/jsm/libs/draco/gltf), so this adds no dependency and no CDN:
   copied to public/draco, served same-origin, covered by Vercel's immutable
   cache. Scene.tsx still points at gstatic — it is the hero's and is not
   touched here. */
useGLTF.setDecoderPath("/draco/");

const MODEL = "/models/iphone.glb";

/* ⚠ PAUSE WHEN OFFSCREEN, BUT NOT WITH `frameloop: "never"`. That is what
   caused the hero's entrance-replay bug: "never" stops the CLOCK advancing,
   so on return `elapsedTime` resumes near where it paused while any t0 refers
   to the pre-pause timeline (HANDOVER.md, session 14).
   `demand` has no such problem — it renders only when something invalidates,
   and a static model invalidates nothing, so offscreen it costs zero frames
   AND the clock keeps its own time. One render is forced on the way in so the
   model is actually painted. */
function PauseOffscreen() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setFrameloop(e.isIntersecting ? "demand" : "never");
        if (e.isIntersecting) invalidate();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gl, setFrameloop, invalidate]);

  return null;
}

/* the model, centred and scaled to fill the slot. `scale` is generous
   because Kez asked for it "pretty enlarged" — the centre column is ~1.15
   of a card wide and the model should read as the hero of the section. */
function Model({ scale }: { scale: number }) {
  const { scene } = useGLTF(MODEL);
  const invalidate = useThree((s) => s.invalidate);
  const ref = useRef<THREE.Group>(null);

  /* one render once the scene is in the tree — on `demand` nothing draws
     until something asks, and a static model never asks. */
  useEffect(() => invalidate(), [scene, invalidate]);

  return (
    <group ref={ref} scale={scale} rotation={[-0.12, 0.42, 0.04]}>
      <primitive object={scene} />
    </group>
  );
}

export default function StepsScene({ scale = 9.2 }: { scale?: number }) {
  /* ⚠ THE CANVAS MOUNTS ONLY AFTER THE PAGE IS INTERACTIVE. The glb is
     3.3MB with 2.3MB of webp textures that decode and upload ON THE MAIN
     THREAD — measured in session 14 as 99% of the page's jank, including a
     2.4s freeze. Mounting during first paint would put that cost directly
     against the hero.
     `requestIdleCallback` starts it once the browser is quiet, which on a
     normal connection is seconds before a scroll reaches this section, so it
     is warm on arrival without competing with the hero. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const go = () => setMounted(true);
    /* Safari has no requestIdleCallback; a timeout is the documented fallback
       and the exact delay does not matter, only that it is after first paint. */
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 3000 });
      return () => (w as unknown as { cancelIdleCallback?: (i: number) => void }).cancelIdleCallback?.(id);
    }
    const id = setTimeout(go, 1200);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;

  return (
    <Canvas
      /* ⚠ `demand`, NOT THE DEFAULT `always`. A static model has nothing to
         animate, so there is no reason to run a WebGL render every frame for
         the length of the page. */
      frameloop="demand"
      camera={{ position: [0, 0, 5.9], fov: 42, near: 0.1, far: 1000 }}
      /* capped at 2: a 3x retina render of this model is three times the
         fragment cost for no visible gain at this size. */
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      /* ⚠ CONTAINMENT GOES ON THE CANVAS ITSELF, NOT ONLY THE OUTER MOUNT.
         r3f inserts its OWN div between the mount and the <canvas>, so a
         `contain` set on the mount does not wrap the canvas — measured
         `contain: none` on the canvas's actual parent. Set here it lands on
         the element r3f renders. */
      style={{ pointerEvents: "none", contain: "layout paint size" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 4]} intensity={2.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} />
      <PauseOffscreen />
      <Suspense fallback={null}>
        <Model scale={scale} />
        {/* self-hosted, same reasoning as the hero's: the drei preset pulls
            1.5MB from a third-party CDN on every load. */}
        <Environment files="potsdamer_platz_1k.hdr" path="/hdri/" />
      </Suspense>
    </Canvas>
  );
}
