"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Resize, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { easing } from "maath";
import * as THREE from "three";

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

/* ⚠ PAUSE WHEN OFFSCREEN BY SWITCHING "always" <-> "never".
   `demand` was tried first and the model NEVER RENDERED — read back through
   toDataURL, the canvas was 0 model pixels with a live context, correct size
   and no errors. On `demand` nothing draws until something calls invalidate,
   and a static model asks for nothing; the invalidate in <Model> fires before
   the GPU upload finishes, so the one render it buys is empty. The hero uses
   the default "always" and works, so this does too.
   The entrance-replay bug that "never" caused in the hero cannot happen here:
   that was a CLOCK desync (elapsedTime resuming against a pre-pause t0), and
   this scene has no timeline to desync — nothing reads the clock. */
function PauseOffscreen() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setFrameloop(e.isIntersecting ? "always" : "never");
        if (e.isIntersecting) invalidate();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gl, setFrameloop, invalidate]);

  return null;
}

/* ⚠ THE MODEL IS NORMALISED, NOT RAW-SCALED, AND THAT IS WHY THE FIRST
   VERSION WAS INVISIBLE. A raw `scale={9.2}` on the glb means nothing: the
   file's own units put the phone at some arbitrary size and origin, so a
   hand-picked multiplier lands it off-camera. The hero does the real thing
   and this copies it exactly:
     <Resize>  normalises the bounding box to 1 unit
     <Center>  moves the origin to the middle of that box
     scale     = viewport.height * fit, so it is a FRACTION OF THE VISIBLE
                 HEIGHT and therefore the same proportion on every display.
   `viewport.height` is the world height visible at z=0.

   Rotation and fit are the hero's tuned values, Kez's own, from /tuner on
   2026-10-04 — not re-derived here. */
/* ⚠ NOT THE HERO'S PITCH ANY MORE. The hero's tuned pose is [-18, 159, 6],
   and -18 on X tips the top of the phone AWAY from the viewer — in the hero
   that reads fine against a tall section, but in this slot it showed the
   phone from below-left with the screen foreshortened. Kez: face left but a
   bit down, so more of the screen is visible.
   X -18 -> -10 is a small nudge, not a stand-up: it tips the top back toward
   the viewer by 8 degrees, which opens the screen a little without losing the
   angled look. (A first pass at +6 was a 24-degree swing and far too much.)
   Y 159 (the left-facing yaw) and Z 6 are the hero's and unchanged. */
const TUNED_ROT = [-10, 159, 6] as const; // degrees
const DEG = Math.PI / 180;

/* cursor parallax, the hero's: yaw 10deg, pitch 5deg, damp 0.35s.
   ⚠ `easing.damp` RATHER THAN A PER-FRAME LERP. A fixed lerp moves at a
   different speed on a 60Hz and a 144Hz screen, which is the usual reason
   this kind of motion feels different machine to machine. `damp` is a
   smoothing TIME in seconds, so it is frame-rate independent. */
const PARALLAX = { yaw: 10, pitch: 5, damp: 0.35 };

/* ⚠ PROCEDURAL ENVIRONMENT, NOT THE 1.5MB .hdr. Measured on this page:
   potsdamer_platz_1k.hdr fetched at 3198ms — BEFORE the glb at 3611ms, so a
   1.5MB reflection map was competing with the model for bandwidth and winning.
   Nearly half the glb's size, for reflections on a phone the size of a card.
   `RoomEnvironment` ships inside the installed `three` package and is built on
   the GPU from geometry, so it costs ZERO network bytes and no decode. It is
   what three.js's own examples use for product shots.
   Scene.tsx still loads the .hdr — that is the hero's and is not touched here,
   and the file stays in public/hdri for it. */
function RoomEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    return () => {
      env.texture.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Model({ fit }: { fit: number }) {
  const { scene } = useGLTF(MODEL);
  const invalidate = useThree((s) => s.invalidate);
  const viewport = useThree((s) => s.viewport);
  const root = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  /* nudge a render when the model resolves or the viewport resizes. Harmless
     under "always"; it is what makes the first painted frame prompt. */
  useEffect(() => invalidate(), [scene, viewport.height, invalidate]);

  /* normalised to -1..1 across the window, same as the hero — the pointer is
     tracked on the window, not the canvas, because the canvas is
     pointer-events-none and would never see the event. */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = 1 - (e.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const r = root.current;
    if (!r) return;
    easing.damp(r.rotation, "x", -mouse.current.y * PARALLAX.pitch * DEG, PARALLAX.damp, delta);
    easing.damp(r.rotation, "y", mouse.current.x * PARALLAX.yaw * DEG, PARALLAX.damp, delta);
  });

  return (
    /* ⚠ TWO GROUPS, NOT ONE. Parallax turns the OUTER group; the tuned rest
       pose sits on the inner one. Putting both on a single group means the
       damp writes rotation.x/y every frame and wipes the tuned angles — the
       phone would snap flat on the first pointer move. */
    <group ref={root}>
      <group
        rotation={[TUNED_ROT[0] * DEG, TUNED_ROT[1] * DEG, TUNED_ROT[2] * DEG]}
        scale={viewport.height * fit}
      >
        <Resize>
          <Center>
            <primitive object={scene} />
          </Center>
        </Resize>
      </group>
    </group>
  );
}

export default function StepsScene({ fit = 0.84 }: { fit?: number }) {
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
    /* ⚠ FETCHING AND MOUNTING ARE SEPARATED, AND THAT IS THE WHOLE TRICK.
       The DOWNLOAD is network work off the main thread — starting it at once
       costs the hero nothing but bandwidth, and it is the long pole at 3.3MB.
       The MOUNT is what decodes 2.3MB of webp and uploads to the GPU on the
       main thread, so only that is deferred.
       The first build delayed both behind requestIdleCallback and the glb did
       not start until 5636ms. Now the bytes are already arriving while the
       page settles, and the canvas mounts into a warm cache. */
    useGLTF.preload(MODEL);

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const go = () => setMounted(true);
    /* Safari has no requestIdleCallback; a timeout is the documented fallback.
       The timeout is short because the fetch is already in flight — this is
       only waiting for first paint to be out of the way, not for the model. */
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 600 });
      return () => (w as unknown as { cancelIdleCallback?: (i: number) => void }).cancelIdleCallback?.(id);
    }
    const id = setTimeout(go, 300);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;

  return (
    <Canvas
      /* `always`, but only while the section is on screen — PauseOffscreen
         flips it to "never" the rest of the time, which is the whole page for
         most of a visit. */
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
        <Model fit={fit} />
        <RoomEnv />
      </Suspense>
    </Canvas>
  );
}
