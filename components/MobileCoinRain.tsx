"use client";

import { useEffect, useRef } from "react";

// Crypto coin icons available for rain droplets
const COIN_ICONS = [
  { src: "/images/icons/01.webp", alt: "Bitcoin" },
  { src: "/images/icons/02.webp", alt: "Ethereum" },
  { src: "/images/icons/03.webp", alt: "BNB" },
  { src: "/images/icons/04.webp", alt: "Solana" },
  { src: "/images/icons/05.webp", alt: "Matic" },
  { src: "/images/icons/06.webp", alt: "Shield" },
  { src: "/images/icons/07.webp", alt: "Chainlink" },
  { src: "/images/icons/08.webp", alt: "Larpz" },
  { src: "/images/icons/09.webp", alt: "Ghost" },
  { src: "/images/icons/10.webp", alt: "USDC" },
  { src: "/images/icons/11.webp", alt: "Gold BTC" },
  { src: "/images/icons/12.webp", alt: "Polygon" },
  { src: "/images/icons/13.webp", alt: "Shiba" },
  { src: "/images/icons/14.webp", alt: "Monero" },
];

/**
 * TUNABLE CONFIGURATION FOR MOBILE COIN RAIN
 * Low density, gentle infinite rain from underneath the cloud.
 * Easily adjust rate, speed, size, and boundaries below.
 */
export const MOBILE_RAIN_CONFIG = {
  // Number of simultaneously falling coins (low & gentle density)
  coinCount: 5,

  // Vertical spawn origin (spawns behind/underneath the cloud: 35% - 44% of section height)
  spawnYMin: 0.35,
  spawnYMax: 0.44,

  // Despawn boundary (slips behind ticket strip at 82%, recycles at 89%)
  despawnY: 0.89,

  // Gentle downward speed in pixels per frame (~50-80px/sec at 60fps)
  speedMin: 0.85,
  speedMax: 1.45,

  // Coin diameter in px on mobile (increased chunky size)
  sizeMin: 68,
  sizeMax: 88,

  // Subtle horizontal sway amplitude in px
  driftAmp: 8,
  driftFreqMin: 0.015,
  driftFreqMax: 0.03,

  // Gentle tumbling rotation speed (degrees per frame)
  rotateSpeedMin: -0.45,
  rotateSpeedMax: 0.45,
};

type RainDrop = {
  x: number;
  homeX: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  phase: number;
  phaseSpeed: number;
  driftAmp: number;
  iconIndex: number;
  laneIndex: number;
};

// Calculate distributed horizontal position so coins rain evenly across the width
function getLaneX(lane: number, totalLanes: number, width: number): number {
  const laneSpan = (width * 0.82) / totalLanes;
  const laneBase = width * 0.09 + lane * laneSpan;
  return laneBase + (0.15 + Math.random() * 0.7) * laneSpan;
}

export default function MobileCoinRain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const domRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let w = container.clientWidth || window.innerWidth;
    let h = container.clientHeight || window.innerHeight;

    const count = MOBILE_RAIN_CONFIG.coinCount;

    // Initialize drops with staggered heights and distributed horizontal lanes
    const drops: RainDrop[] = Array.from({ length: count }, (_, i) => {
      const frac = (i + 0.3) / count;
      const initialY = (MOBILE_RAIN_CONFIG.spawnYMin + frac * (MOBILE_RAIN_CONFIG.despawnY - MOBILE_RAIN_CONFIG.spawnYMin)) * h;
      const homeX = getLaneX(i, count, w);
      const size = MOBILE_RAIN_CONFIG.sizeMin + Math.random() * (MOBILE_RAIN_CONFIG.sizeMax - MOBILE_RAIN_CONFIG.sizeMin);
      const iconIndex = Math.floor(Math.random() * COIN_ICONS.length);

      return {
        x: homeX,
        homeX,
        y: initialY,
        speed: MOBILE_RAIN_CONFIG.speedMin + Math.random() * (MOBILE_RAIN_CONFIG.speedMax - MOBILE_RAIN_CONFIG.speedMin),
        size,
        rotation: (Math.random() - 0.5) * 30,
        rotSpeed: MOBILE_RAIN_CONFIG.rotateSpeedMin + Math.random() * (MOBILE_RAIN_CONFIG.rotateSpeedMax - MOBILE_RAIN_CONFIG.rotateSpeedMin),
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: MOBILE_RAIN_CONFIG.driftFreqMin + Math.random() * (MOBILE_RAIN_CONFIG.driftFreqMax - MOBILE_RAIN_CONFIG.driftFreqMin),
        driftAmp: MOBILE_RAIN_CONFIG.driftAmp * (0.6 + Math.random() * 0.8),
        iconIndex,
        laneIndex: i,
      };
    });

    const updateDimensions = () => {
      if (!container) return;
      w = container.clientWidth || window.innerWidth;
      h = container.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", updateDimensions);

    let animId: number;

    const tick = () => {
      // Strictly do not run on desktop (md breakpoint is 768px)
      if (w >= 768) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const despawnYPx = MOBILE_RAIN_CONFIG.despawnY * h;

      for (let i = 0; i < count; i++) {
        const drop = drops[i];

        drop.y += drop.speed;
        drop.phase += drop.phaseSpeed;
        drop.x = drop.homeX + Math.sin(drop.phase) * drop.driftAmp;
        drop.rotation += drop.rotSpeed;

        // When drop passes behind ticket strip, recycle to the top underneath the cloud
        if (drop.y > despawnYPx) {
          drop.laneIndex = (drop.laneIndex + 1 + Math.floor(Math.random() * (count - 1))) % count;
          drop.y = (MOBILE_RAIN_CONFIG.spawnYMin + Math.random() * (MOBILE_RAIN_CONFIG.spawnYMax - MOBILE_RAIN_CONFIG.spawnYMin)) * h;
          drop.homeX = getLaneX(drop.laneIndex, count, w);
          drop.x = drop.homeX;
          drop.speed = MOBILE_RAIN_CONFIG.speedMin + Math.random() * (MOBILE_RAIN_CONFIG.speedMax - MOBILE_RAIN_CONFIG.speedMin);
          drop.size = MOBILE_RAIN_CONFIG.sizeMin + Math.random() * (MOBILE_RAIN_CONFIG.sizeMax - MOBILE_RAIN_CONFIG.sizeMin);
          drop.rotSpeed = MOBILE_RAIN_CONFIG.rotateSpeedMin + Math.random() * (MOBILE_RAIN_CONFIG.rotateSpeedMax - MOBILE_RAIN_CONFIG.rotateSpeedMin);
          drop.iconIndex = Math.floor(Math.random() * COIN_ICONS.length);

          const imgEl = imgRefs.current[i];
          if (imgEl) {
            imgEl.src = COIN_ICONS[drop.iconIndex].src;
            imgEl.alt = COIN_ICONS[drop.iconIndex].alt;
          }
        }

        // Apply hardware-accelerated transform
        const el = domRefs.current[i];
        if (el) {
          const s = drop.size;
          const left = drop.x - s / 2;
          const top = drop.y - s / 2;
          el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${drop.rotation}deg)`;
          el.style.width = `${s}px`;
          el.style.height = `${s}px`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none block md:hidden absolute inset-0 z-10 overflow-hidden select-none"
    >
      {Array.from({ length: MOBILE_RAIN_CONFIG.coinCount }).map((_, i) => {
        const initialIcon = COIN_ICONS[i % COIN_ICONS.length];
        return (
          <div
            key={i}
            ref={(el) => {
              domRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform select-none"
            style={{
              width: "48px",
              height: "48px",
              transform: "translate3d(-9999px, -9999px, 0)",
            }}
          >
            <img
              loading="lazy"
              decoding="async"
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              src={initialIcon.src}
              alt={initialIcon.alt}
              className="h-full w-full object-contain select-none pointer-events-none drop-shadow-md"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
