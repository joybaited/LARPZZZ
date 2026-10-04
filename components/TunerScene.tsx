"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Grid, OrbitControls, Resize, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Tune } from "@/app/tuner/page";

const MODEL = "/models/iphone.glb";
const DEG = Math.PI / 180;

function Phone({ tune, orbit, onOrbit }: {
  tune: Tune; orbit: boolean; onOrbit: (r: [number, number, number]) => void;
}) {
  const g = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL);
  const { viewport } = useThree();

  /* report the live rotation back so "grab orbit angle" can read it */
  useFrame(() => {
    if (!g.current) return;
    const r = g.current.rotation;
    onOrbit([r.x / DEG, r.y / DEG, r.z / DEG]);
  });

  const fit = viewport.height * tune.fit;

  return (
    <group
      ref={g}
      position={[tune.posX, tune.posY, 0]}
      rotation={orbit ? undefined : [tune.rotX * DEG, tune.rotY * DEG, tune.rotZ * DEG]}
    >
      <group scale={fit}>
        <Resize>
          <Center>
            <primitive object={scene} />
          </Center>
        </Resize>
      </group>
    </group>
  );
}

/* keep the camera in sync with the sliders */
function Cam({ tune }: { tune: Tune }) {
  const { camera } = useThree();
  useEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.z = tune.camZ;
    c.fov = tune.fov;
    c.updateProjectionMatrix();
  }, [camera, tune.camZ, tune.fov]);
  return null;
}

export default function TunerScene({ tune, orbit, onOrbit }: {
  tune: Tune; orbit: boolean; onOrbit: (r: [number, number, number]) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 0, tune.camZ], fov: tune.fov, near: 0.1, far: 1000 }}>
      <Cam tune={tune} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 4]} intensity={2.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} />
      <Grid
        args={[20, 20]}
        cellColor="#cfc9e6"
        sectionColor="#a79fd0"
        position={[0, -2, 0]}
        infiniteGrid
        fadeDistance={28}
      />
      <Suspense fallback={null}>
        <Phone tune={tune} orbit={orbit} onOrbit={onOrbit} />
        <Environment preset="city" />
      </Suspense>
      {orbit && <OrbitControls makeDefault enablePan={false} />}
    </Canvas>
  );
}
