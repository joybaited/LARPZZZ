"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, Resize, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";

const MODEL = "/models/iphone.glb";
const DEG = Math.PI / 180;

/* ----------------------------------------------------------------
   tuned 2026-10-04 in /tuner. angles are the owner's, do not "improve"
   them. position is centred on the section by design.
   ---------------------------------------------------------------- */
const TUNED = {
  rotation: [-18, 159, 6] as [number, number, number], // degrees
  fit: 0.72, // fraction of viewport height (0.76 tuned flat; the tuned
             // angles swing the silhouette taller, so it is scaled back
             // a little to keep the phone off the top and bottom edges)
};

/* ----------------------------------------------------------------
   kaktus entrance — _ref/kaktus/docs/02 s5, 1:1.

   underdamped harmonic oscillator:
     x(t) = 1 - e^(-z*wn*t) * (cos(wd*t) + z/sqrt(1-z^2) * sin(wd*t))
   zeta 0.65, wn 10 rad/s -> 1-2 visible overshoots, then settles.
   ---------------------------------------------------------------- */
const ZETA = 0.65;
const WN = 10;
const WD = WN * Math.sqrt(1 - ZETA * ZETA);
const K = ZETA / Math.sqrt(1 - ZETA * ZETA);

function spring(t: number) {
  if (t <= 0) return 0;
  return 1 - Math.exp(-ZETA * WN * t) * (Math.cos(WD * t) + K * Math.sin(WD * t));
}

/* impulse start: scale 0.2, rotated off the rest pose (doc 02) */
const FROM_SCALE = 0.2;
const OVERSHOOT = 1.15;
const FROM_YAW = -25 * DEG;
const FROM_ROLL = 22 * DEG;

/* mouse parallax bounds (doc 05 s1B) */
const YAW = 10 * DEG;
const PITCH = 5 * DEG;

/* idle float (doc 05 s3) */
const FLOAT_HZ = 0.4;
const WOBBLE = 1.5 * DEG;

/* entrance is done at ~1.8s (doc 02 timeline) */
const SETTLE_AT = 1.4;
const SETTLE_OVER = 0.4;

export default function Phone() {
  const root = useRef<THREE.Group>(null); // parallax rig ("telefon look at")
  const pivot = useRef<THREE.Group>(null); // spring pivot ("telefon rotate")
  const t0 = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const { scene } = useGLTF(MODEL);
  const { viewport } = useThree();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = 1 - (e.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const p = pivot.current;
    const r = root.current;
    if (!p || !r) return;
    if (!t0.current) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;
    const s = spring(t);

    /* entrance: 0.2 -> 1.15 overshoot -> 1 */
    p.scale.setScalar(FROM_SCALE + (OVERSHOOT - FROM_SCALE) * s);

    /* unwind from the impulse pose onto the tuned rest angles */
    const [rx, ry, rz] = TUNED.rotation;
    p.rotation.x = rx * DEG * s;
    p.rotation.y = FROM_YAW + (ry * DEG - FROM_YAW) * s;
    p.rotation.z = FROM_ROLL + (rz * DEG - FROM_ROLL) * s;

    /* idle float + wobble, fading in once the entrance settles */
    const settled = Math.min(Math.max((t - SETTLE_AT) / SETTLE_OVER, 0), 1);
    if (settled > 0) {
      const w = 2 * Math.PI * FLOAT_HZ * t;
      p.position.y = Math.sin(w) * 0.04 * settled;
      p.rotation.z += Math.cos(w) * WOBBLE * settled;
    }

    /*
      parallax. easing.damp is frame-rate independent — a fixed per-frame
      lerp moves at different speeds on a 60Hz and a 144Hz screen, which is
      the usual reason this kind of motion feels different machine to
      machine. 0.35 is the smoothing time in seconds.
    */
    easing.damp(r.rotation, "x", -mouse.current.y * PITCH * settled, 0.35, delta);
    easing.damp(r.rotation, "y", mouse.current.x * YAW * settled, 0.35, delta);
  });

  /* viewport.height is the world height visible at z=0, so a fraction of
     it is the same fraction of the screen on every display. */
  const fit = viewport.height * TUNED.fit;

  return (
    <group ref={root}>
      {/* centred on the section: no position offset */}
      <group ref={pivot} scale={FROM_SCALE}>
        <group scale={fit}>
          {/* drei does the bounding-box maths: 1 unit, origin centred */}
          <Resize>
            <Center>
              <primitive object={scene} />
            </Center>
          </Resize>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
