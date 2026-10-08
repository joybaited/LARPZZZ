"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { Environment, useGLTF, useProgress } from "@react-three/drei";
import Phone, { type PhoneTune } from "./Phone";

/* decoder wasm warmed from the CDN so it compiles before the model lands
   rather than after it (smoothly docs, draco s3). */
useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

/* camera tuned 2026-10-04 in /tuner */
const CAMERA = { position: [0, 0, 5.9] as [number, number, number], fov: 42 };

/**
 * fade the canvas in once the model is decoded and on the GPU, instead of
 * popping mid-entrance. kaktus doc 02 s2 does the same handshake: the
 * preloader hides only when the pipeline is ready, 300ms ease.
 */
function Fade({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * ⚠ STOP RENDERING WHEN THE HERO IS OFF SCREEN.
 *
 * the canvas is absolute inside the hero, so from section two down it is not
 * on screen — but r3f's default frameloop is "always", so it kept running a
 * full webgl render, the spring, the idle float and the parallax damping for
 * the whole 8392px page. measured: identical draw calls scrolled past the
 * hero as at the top, and 47x that at the bottom where the marquee and the
 * faq pills composite over it.
 *
 * `never` stops the loop dead; the observer puts it back to `always` before
 * the hero returns (200px rootMargin), so the phone is already moving by the
 * time it is visible.
 */
/* ⚠ THE `camera` PROP ONLY SEEDS THE CAMERA ON MOUNT. r3f reads it once;
   moving a slider after that changes nothing until the canvas remounts. This
   writes the live values and calls updateProjectionMatrix, which is what
   /tuner's <Cam> does. Inert on the page, where camZ/fov are undefined. */
function CamSync({ camZ, fov }: { camZ?: number; fov?: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (camZ === undefined && fov === undefined) return;
    const c = camera as THREE.PerspectiveCamera;
    if (camZ !== undefined) c.position.z = camZ;
    if (fov !== undefined) c.fov = fov;
    c.updateProjectionMatrix();
    invalidate();
  }, [camera, camZ, fov, invalidate]);
  return null;
}

function PauseOffscreen() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    /* the canvas's own wrapper is what scrolls — observe that, not the
       <canvas>, whose box r3f manages. */
    const el = gl.domElement.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setFrameloop(e.isIntersecting ? "always" : "never"),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gl, setFrameloop]);

  return null;
}

/**
 * the one <Canvas>. single owner — do not add a second one.
 *
 * absolute, not fixed: it fills its POSITIONING PARENT, so the phone belongs
 * to whatever section mounts it and scrolls away with that section. fixed
 * pinned it to the viewport and it rode down the whole page. the parent must
 * be `relative` — <Section> already is.
 */
export default function Scene({ tune, camZ, fov }: {
  /* all optional: the page passes nothing and gets the tuned defaults.
     /hero-tuner passes a live set so the dials drive the real component
     rather than a copy of it. */
  tune?: PhoneTune;
  camZ?: number;
  fov?: number;
} = {}) {
  const { progress } = useProgress();
  const ready = progress >= 100;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, camZ ?? CAMERA.position[2]], fov: fov ?? CAMERA.fov, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* lighting per kaktus doc 03 s5: ambient 0.65 + key + fill */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} />
        <PauseOffscreen />
        <CamSync camZ={camZ} fov={fov} />
        <Suspense fallback={null}>
          <Fade>
            <Phone tune={tune} />
          </Fade>
          {/*
            ⚠ SELF-HOSTED, NOT preset="city".

            the preset fetches potsdamer_platz_1k.hdr (1.5MB) from the
            pmndrs CDN on every load — a 301 then a 1.5MB download from a
            third party, bigger than the whole optimised model. it landed at
            2284ms while the canvas faded in at 1242ms, so the phone showed
            for a second with no reflections and then popped.

            same file, served from /public: no redirect, no third party, and
            vercel's immutable cache covers it. `files` + `path` is drei's
            own supported form.
          */}
          <Environment files="potsdamer_platz_1k.hdr" path="/hdri/" />
        </Suspense>
      </Canvas>
    </div>
  );
}
