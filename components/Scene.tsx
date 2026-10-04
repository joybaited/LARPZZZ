"use client";

import { Canvas } from "@react-three/fiber";

/**
 * the one <Canvas>. single owner — do not add a second one.
 * fixed behind the page; sections drive it via scroll triggers later.
 */
export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        {/* phase 1: empty. geometry arrives with the design. */}
      </Canvas>
    </div>
  );
}
