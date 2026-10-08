"use client";

import dynamic from "next/dynamic";
import type { PhoneTune } from "./Phone";

/** dynamic import keeps three.js out of the initial bundle. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/* props are forwarded for /hero-tuner; the page passes none and gets the
   tuned defaults. */
export default function SceneMount(props: { tune?: PhoneTune; camZ?: number; fov?: number }) {
  return <Scene {...props} />;
}
