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

/* ⚠ EVERY DIAL, IN ONE PLACE, SO /hero-tuner CAN DRIVE THEM.
   The page passes nothing and gets exactly these values — the live hero is
   unchanged by the tuner existing. The tuner passes a full set.

   These are NOT a second copy of the animation: `PhoneTune` is the only
   definition and `Phone` is the only implementation, so the tuner cannot
   drift from the page the way /faq-tuner's hand-kept pill did. */
export type PhoneTune = {
  rotX: number; rotY: number; rotZ: number;
  posX: number; posY: number; posZ: number;
  fit: number;
  /* entrance */
  zeta: number; wn: number;
  fromScale: number; overshoot: number; fromYaw: number; fromRoll: number;
  settleAt: number; settleOver: number;
  /* idle float + wobble */
  floatHz: number; floatAmp: number; wobble: number;
  /* mouse parallax */
  yaw: number; pitch: number; damp: number;
  /* replay the entrance from t=0 — the tuner bumps this to watch it again */
  replay?: number;
};

export const PHONE_TUNE: PhoneTune = {
  rotX: TUNED.rotation[0], rotY: TUNED.rotation[1], rotZ: TUNED.rotation[2],
  posX: 0, posY: 0, posZ: 0,
  fit: TUNED.fit,
  zeta: 0.65, wn: 10,
  fromScale: 0.2, overshoot: 1.15, fromYaw: -25, fromRoll: 22,
  settleAt: 1.4, settleOver: 0.4,
  floatHz: 0.4, floatAmp: 0.04, wobble: 1.5,
  yaw: 10, pitch: 5, damp: 0.35,
};

/* ----------------------------------------------------------------
   kaktus entrance — _ref/kaktus/docs/02 s5, 1:1.

   underdamped harmonic oscillator:
     x(t) = 1 - e^(-z*wn*t) * (cos(wd*t) + z/sqrt(1-z^2) * sin(wd*t))
   zeta 0.65, wn 10 rad/s -> 1-2 visible overshoots, then settles.
   ---------------------------------------------------------------- */
/* ⚠ zeta MUST STAY UNDER 1 OR THE MATHS GOES IMAGINARY. At zeta >= 1 the
   system is critically/over-damped, `sqrt(1 - zeta^2)` is 0 or NaN, and the
   phone vanishes. The tuner's slider stops at 0.99; this clamp is the
   backstop for a hand-typed value. */
function spring(t: number, zeta: number, wn: number) {
  if (t <= 0) return 0;
  const z = Math.min(0.99, Math.max(0.01, zeta));
  const wd = wn * Math.sqrt(1 - z * z);
  const k = z / Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + k * Math.sin(wd * t));
}

export default function Phone({ tune = PHONE_TUNE }: { tune?: PhoneTune }) {
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

  /* ⚠ REPLAY RESETS THE CLOCK ORIGIN, IT DOES NOT REMOUNT. Remounting would
     refetch and re-decode the glb; zeroing t0 re-runs the entrance from the
     same loaded model, which is what "play it again" should cost. The 0 is a
     sentinel — useFrame seeds it from the live clock on the next frame. */
  useEffect(() => { t0.current = 0; }, [tune.replay]);

  useFrame((state, delta) => {
    const p = pivot.current;
    const r = root.current;
    if (!p || !r) return;
    if (!t0.current) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;
    const s = spring(t, tune.zeta, tune.wn);

    /* entrance: fromScale -> overshoot -> 1 */
    p.scale.setScalar(tune.fromScale + (tune.overshoot - tune.fromScale) * s);

    /* unwind from the impulse pose onto the tuned rest angles */
    const fromYaw = tune.fromYaw * DEG;
    const fromRoll = tune.fromRoll * DEG;
    p.rotation.x = tune.rotX * DEG * s;
    p.rotation.y = fromYaw + (tune.rotY * DEG - fromYaw) * s;
    p.rotation.z = fromRoll + (tune.rotZ * DEG - fromRoll) * s;

    /* idle float + wobble, fading in once the entrance settles.
       ⚠ settleOver DIVIDES — a 0 would be a divide by zero, so it floors at
       a frame. The slider cannot reach 0; this is the hand-typed backstop. */
    const settled = Math.min(Math.max((t - tune.settleAt) / Math.max(0.016, tune.settleOver), 0), 1);
    p.position.x = tune.posX;
    p.position.y = tune.posY;
    p.position.z = tune.posZ;
    if (settled > 0) {
      const w = 2 * Math.PI * tune.floatHz * t;
      p.position.y = tune.posY + Math.sin(w) * tune.floatAmp * settled;
      p.rotation.z += Math.cos(w) * tune.wobble * DEG * settled;
    }

    /*
      parallax. easing.damp is frame-rate independent — a fixed per-frame
      lerp moves at different speeds on a 60Hz and a 144Hz screen, which is
      the usual reason this kind of motion feels different machine to
      machine. `damp` is the smoothing time in seconds.
    */
    easing.damp(r.rotation, "x", -mouse.current.y * tune.pitch * DEG * settled, tune.damp, delta);
    easing.damp(r.rotation, "y", mouse.current.x * tune.yaw * DEG * settled, tune.damp, delta);
  });

  /* viewport.height is the world height visible at z=0, so a fraction of
     it is the same fraction of the screen on every display. */
  const fit = viewport.height * tune.fit;

  return (
    <group ref={root}>
      {/* centred on the section: the offset is in the frame loop, so the
          float can add to it without fighting a static position prop. */}
      <group ref={pivot} scale={tune.fromScale}>
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
