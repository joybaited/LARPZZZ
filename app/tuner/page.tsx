"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const TunerScene = dynamic(() => import("@/components/TunerScene"), { ssr: false });

export type Tune = {
  rotX: number; rotY: number; rotZ: number;
  posX: number; posY: number;
  fit: number;
  camZ: number; fov: number;
};

const START: Tune = {
  rotX: 10, rotY: -15, rotZ: 5,
  posX: 0, posY: 0,
  fit: 0.62,
  camZ: 5, fov: 45,
};

const FIELDS: { key: keyof Tune; label: string; min: number; max: number; step: number }[] = [
  { key: "rotX", label: "rotate X (pitch)", min: -180, max: 180, step: 1 },
  { key: "rotY", label: "rotate Y (yaw)", min: -180, max: 180, step: 1 },
  { key: "rotZ", label: "rotate Z (roll)", min: -180, max: 180, step: 1 },
  { key: "posX", label: "move X", min: -3, max: 3, step: 0.01 },
  { key: "posY", label: "move Y", min: -3, max: 3, step: 0.01 },
  { key: "fit", label: "size (frac of height)", min: 0.05, max: 2, step: 0.01 },
  { key: "camZ", label: "camera distance", min: 1, max: 20, step: 0.1 },
  { key: "fov", label: "camera fov", min: 10, max: 110, step: 1 },
];

export default function TunerPage() {
  const [t, setT] = useState<Tune>(START);
  const [copied, setCopied] = useState(false);
  const [orbit, setOrbit] = useState(false);
  const liveRot = useRef<[number, number, number] | null>(null);

  const set = (k: keyof Tune, v: number) => setT((p) => ({ ...p, [k]: v }));

  const config = `/* tuned ${new Date().toISOString().slice(0, 16).replace("T", " ")} */
const TUNED = {
  rotation: [${t.rotX}, ${t.rotY}, ${t.rotZ}],   // degrees
  position: [${t.posX}, ${t.posY}, 0],
  fit: ${t.fit},            // fraction of viewport height
  camera: { z: ${t.camZ}, fov: ${t.fov} },
};`;

  return (
    <div className="flex h-dvh w-full">
      <div className="relative flex-1 bg-[#f5f2ff]">
        <TunerScene tune={t} orbit={orbit} onOrbit={(r) => (liveRot.current = r)} />
      </div>

      <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-black/10 bg-white p-4 text-[13px]">
        <h1 className="mb-1 font-semibold">phone tuner</h1>
        <p className="mb-4 text-black/50">
          drag the sliders, or tick orbit and drag the model. copy the config
          at the bottom and paste it to me.
        </p>

        <label className="mb-4 flex items-center gap-2">
          <input type="checkbox" checked={orbit} onChange={(e) => setOrbit(e.target.checked)} />
          orbit with mouse (drag to rotate)
        </label>

        {FIELDS.map((f) => (
          <div key={f.key} className="mb-3">
            <div className="flex justify-between">
              <span>{f.label}</span>
              <input
                type="number"
                value={t[f.key]}
                step={f.step}
                onChange={(e) => set(f.key, Number(e.target.value))}
                className="w-20 rounded border border-black/15 px-1 text-right tabular-nums"
              />
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={t[f.key]}
              onChange={(e) => set(f.key, Number(e.target.value))}
              className="w-full"
            />
          </div>
        ))}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setT(START)}
            className="rounded border border-black/15 px-3 py-1.5"
          >
            reset
          </button>
          <button
            onClick={() => {
              if (liveRot.current) {
                const [x, y, z] = liveRot.current;
                setT((p) => ({ ...p, rotX: Math.round(x), rotY: Math.round(y), rotZ: Math.round(z) }));
              }
            }}
            className="rounded border border-black/15 px-3 py-1.5"
          >
            grab orbit angle
          </button>
        </div>

        <pre className="mt-4 overflow-x-auto rounded bg-black/[.04] p-3 text-[11px] leading-relaxed">
{config}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(config);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="mt-2 w-full rounded bg-black px-3 py-2 text-white"
        >
          {copied ? "copied" : "copy config"}
        </button>
      </aside>
    </div>
  );
}
