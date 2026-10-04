"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF, useProgress } from "@react-three/drei";
import Phone from "./Phone";

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
 * the one <Canvas>. single owner — do not add a second one.
 * fixed behind the page; sections drive it via scroll triggers later.
 */
export default function Scene() {
  const { progress } = useProgress();
  const ready = progress >= 100;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-500 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        camera={{ ...CAMERA, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* lighting per kaktus doc 03 s5: ambient 0.65 + key + fill */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} />
        <Suspense fallback={null}>
          <Fade>
            <Phone />
          </Fade>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
