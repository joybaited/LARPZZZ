"use client";

import dynamic from "next/dynamic";

/** dynamic import keeps three.js out of the initial bundle. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneMount() {
  return <Scene />;
}
