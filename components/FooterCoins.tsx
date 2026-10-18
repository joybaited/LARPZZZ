"use client";

import { useEffect, useRef } from "react";

type CoinDef = {
  id: string;
  src: string;
  alt: string;
  pctX: number; // percentage of viewport width (vw)
  pctY: number; // percentage of section height (vh)
  size: number; // diameter in px
  rotate: number; // default rotation in degrees
  zIndex: number;
};

// Ultra-dense 52-coin sticker collage covering 90-94% of the background pocket
const COIN_DEFS: CoinDef[] = [
  // Row 0: Top boundary (-2 to 4vh)
  { id: "c1-ghost-top1", src: "/images/icons/09.webp", alt: "Ghost", pctX: 51, pctY: -1, size: 200, rotate: -3, zIndex: 12 },
  { id: "c2-ghost-top2", src: "/images/icons/09.webp", alt: "Ghost", pctX: 63, pctY: 1, size: 195, rotate: 2, zIndex: 13 },
  { id: "c3-goldbtc-top", src: "/images/icons/11.webp", alt: "Gold BTC", pctX: 72, pctY: 2, size: 215, rotate: 6, zIndex: 14 },
  { id: "c4-shield-top", src: "/images/icons/06.webp", alt: "Shield", pctX: 76.5, pctY: 5, size: 155, rotate: 8, zIndex: 12 },

  // Row 1: Upper rim (6 to 13vh)
  { id: "c5-usdc-top", src: "/images/icons/10.webp", alt: "USDC", pctX: 50.5, pctY: 8, size: 175, rotate: -8, zIndex: 15 },
  { id: "c6-polyround-top", src: "/images/icons/12.webp", alt: "Polygon", pctX: 62.5, pctY: 10, size: 185, rotate: 12, zIndex: 17 },
  { id: "c7-monero-top", src: "/images/icons/14.webp", alt: "Monero", pctX: 70, pctY: 11, size: 175, rotate: -6, zIndex: 16 },
  { id: "c8-matic-top", src: "/images/icons/05.webp", alt: "Matic", pctX: 76, pctY: 14, size: 150, rotate: 10, zIndex: 13 },

  // Row 2: Upper slope (14 to 21vh)
  { id: "c9-shiba-upper", src: "/images/icons/13.webp", alt: "Shiba", pctX: 52.5, pctY: 17, size: 175, rotate: -5, zIndex: 18 },
  { id: "c10-goldbtc-upper", src: "/images/icons/11.webp", alt: "Gold BTC", pctX: 66, pctY: 19, size: 185, rotate: 8, zIndex: 16 },
  { id: "c11-shield-upper", src: "/images/icons/06.webp", alt: "Shield", pctX: 75, pctY: 21, size: 155, rotate: -8, zIndex: 14 },
  { id: "c12-chainlink-upper", src: "/images/icons/07.webp", alt: "Chainlink", pctX: 49.5, pctY: 23, size: 160, rotate: 6, zIndex: 13 },

  // Row 3: Mid-upper (22 to 29vh)
  { id: "c13-monero-upper", src: "/images/icons/14.webp", alt: "Monero", pctX: 69.5, pctY: 26, size: 180, rotate: 14, zIndex: 17 },
  { id: "c14-goldbtc-mid", src: "/images/icons/11.webp", alt: "Gold BTC Mid", pctX: 51, pctY: 29, size: 180, rotate: -8, zIndex: 16 },
  { id: "c15-matic-right", src: "/images/icons/05.webp", alt: "Matic Right", pctX: 75.5, pctY: 29, size: 155, rotate: 12, zIndex: 15 },
  { id: "c16-usdc-mid1", src: "/images/icons/10.webp", alt: "USDC Mid", pctX: 61, pctY: 28, size: 170, rotate: 4, zIndex: 18 },

  // Row 4: Core chest (30 to 38vh) - Hero Bitcoin Anchor
  { id: "c17-btc-hero", src: "/images/icons/01.webp", alt: "Bitcoin Hero", pctX: 63, pctY: 36, size: 250, rotate: -4, zIndex: 23 },
  { id: "c18-eth-mid", src: "/images/icons/02.webp", alt: "Ethereum", pctX: 73, pctY: 37, size: 190, rotate: -12, zIndex: 18 },
  { id: "c19-shield-mid", src: "/images/icons/06.webp", alt: "Shield Mid", pctX: 76.5, pctY: 38, size: 150, rotate: 8, zIndex: 15 },
  { id: "c20-chainlink-mid", src: "/images/icons/07.webp", alt: "Chainlink", pctX: 50, pctY: 37, size: 160, rotate: 10, zIndex: 14 },

  // Row 5: Core waist (39 to 47vh)
  { id: "c21-ghost-mid", src: "/images/icons/09.webp", alt: "Ghost Mid", pctX: 51, pctY: 44, size: 175, rotate: -8, zIndex: 17 },
  { id: "c22-polyround-mid", src: "/images/icons/12.webp", alt: "Polygon Mid", pctX: 61, pctY: 45, size: 175, rotate: 6, zIndex: 18 },
  { id: "c23-shiba-mid", src: "/images/icons/13.webp", alt: "Shiba Mid", pctX: 69.5, pctY: 46, size: 175, rotate: 10, zIndex: 20 },
  { id: "c24-matic-mid", src: "/images/icons/05.webp", alt: "Matic Mid", pctX: 75.5, pctY: 46, size: 155, rotate: -6, zIndex: 16 },

  // Row 6: Belly transition (48 to 55vh)
  { id: "c25-solana-mid", src: "/images/icons/04.webp", alt: "Solana Mid", pctX: 63, pctY: 52, size: 210, rotate: 4, zIndex: 21 },
  { id: "c26-usdc-mid2", src: "/images/icons/10.webp", alt: "USDC Mid", pctX: 50.5, pctY: 53, size: 170, rotate: 8, zIndex: 17 },
  { id: "c27-eth-mid2", src: "/images/icons/02.webp", alt: "Ethereum Mid", pctX: 73, pctY: 54, size: 180, rotate: -10, zIndex: 18 },
  { id: "c28-badge-mid", src: "/images/icons/08.webp", alt: "Larpz Badge", pctX: 76, pctY: 56, size: 160, rotate: -4, zIndex: 16 },

  // Row 7: Lower torso (56 to 63vh)
  { id: "c29-shiba-mid2", src: "/images/icons/13.webp", alt: "Shiba Mid", pctX: 69.5, pctY: 60, size: 175, rotate: 6, zIndex: 19 },
  { id: "c30-goldbtc-lower1", src: "/images/icons/11.webp", alt: "Gold BTC Lower", pctX: 50.5, pctY: 61, size: 175, rotate: -6, zIndex: 16 },
  { id: "c31-monero-lower", src: "/images/icons/14.webp", alt: "Monero Lower", pctX: 61, pctY: 61, size: 175, rotate: 12, zIndex: 18 },
  { id: "c32-shield-lower", src: "/images/icons/06.webp", alt: "Shield Lower", pctX: 76, pctY: 63, size: 155, rotate: 8, zIndex: 15 },

  // Row 8: Pelvis core (64 to 71vh) - BNB
  { id: "c33-bnb-hero", src: "/images/icons/03.webp", alt: "BNB Hero", pctX: 64, pctY: 68, size: 170, rotate: -12, zIndex: 22 },
  { id: "c34-ghost-lower", src: "/images/icons/09.webp", alt: "Ghost Lower", pctX: 51, pctY: 69, size: 175, rotate: 8, zIndex: 17 },
  { id: "c35-badge-lower", src: "/images/icons/08.webp", alt: "Larpz Badge Lower", pctX: 74, pctY: 69, size: 165, rotate: 4, zIndex: 18 },
  { id: "c36-chainlink-lower1", src: "/images/icons/07.webp", alt: "Chainlink Lower", pctX: 49.5, pctY: 74, size: 160, rotate: -8, zIndex: 15 },

  // Row 9: Upper bottom (72 to 79vh)
  { id: "c37-eth-lower", src: "/images/icons/02.webp", alt: "Ethereum Lower", pctX: 73, pctY: 76, size: 185, rotate: -8, zIndex: 19 },
  { id: "c38-solana-lower", src: "/images/icons/04.webp", alt: "Solana Lower", pctX: 58.5, pctY: 77, size: 190, rotate: 8, zIndex: 20 },
  { id: "c39-usdc-lower", src: "/images/icons/10.webp", alt: "USDC Lower", pctX: 50.5, pctY: 81, size: 170, rotate: -6, zIndex: 16 },
  { id: "c40-matic-lower", src: "/images/icons/05.webp", alt: "Matic Lower", pctX: 75.5, pctY: 79, size: 155, rotate: 10, zIndex: 17 },

  // Row 10: Deep bottom (80 to 88vh)
  { id: "c41-polyround-lower", src: "/images/icons/12.webp", alt: "Polygon Lower", pctX: 66, pctY: 83, size: 190, rotate: -10, zIndex: 19 },
  { id: "c42-shiba-lower", src: "/images/icons/13.webp", alt: "Shiba Lower", pctX: 72.5, pctY: 85, size: 175, rotate: 8, zIndex: 18 },
  { id: "c43-goldbtc-lower2", src: "/images/icons/11.webp", alt: "Gold BTC Lower", pctX: 51, pctY: 87, size: 185, rotate: 6, zIndex: 17 },
  { id: "c44-chainlink-lower2", src: "/images/icons/07.webp", alt: "Chainlink Lower", pctX: 76, pctY: 87, size: 155, rotate: -8, zIndex: 16 },

  // Row 11: Base footing (89 to 96vh)
  { id: "c45-btc-bottom", src: "/images/icons/01.webp", alt: "Bitcoin Bottom", pctX: 62.5, pctY: 92, size: 170, rotate: 6, zIndex: 21 },
  { id: "c46-monero-bottom", src: "/images/icons/14.webp", alt: "Monero Bottom", pctX: 71, pctY: 93, size: 180, rotate: 12, zIndex: 19 },
  { id: "c47-ghost-bottom", src: "/images/icons/09.webp", alt: "Ghost Bottom", pctX: 51, pctY: 94, size: 175, rotate: -6, zIndex: 16 },
  { id: "c48-shield-bottom", src: "/images/icons/06.webp", alt: "Shield Bottom", pctX: 76, pctY: 94, size: 155, rotate: -4, zIndex: 17 },

  // Row 12: Sub-floor bleed (97 to 103vh)
  { id: "c49-solana-bottom", src: "/images/icons/04.webp", alt: "Solana Bottom", pctX: 57.5, pctY: 99, size: 190, rotate: -8, zIndex: 18 },
  { id: "c50-matic-bottom", src: "/images/icons/05.webp", alt: "Matic Bottom", pctX: 66, pctY: 100, size: 170, rotate: 12, zIndex: 17 },
  { id: "c51-polyround-bottom", src: "/images/icons/12.webp", alt: "Polygon Bottom", pctX: 73.5, pctY: 101, size: 180, rotate: -6, zIndex: 18 },
  { id: "c52-shiba-bottom", src: "/images/icons/13.webp", alt: "Shiba Bottom", pctX: 50.5, pctY: 102, size: 170, rotate: 10, zIndex: 16 },
];

// Mobile gap coordinates (< 768px — the FOOTER's own `md` split, see note below — in the gap between cloud and ticket strip)
type MobileCoord = { pctX: number; pctY: number; size: number };
const MOBILE_COORDS: Record<number, MobileCoord> = {
  // Tier 1: Upper rim under cloud (y: 44-51vh)
  0: { pctX: 12, pctY: 45, size: 76 },
  1: { pctX: 30, pctY: 48, size: 82 },
  2: { pctX: 48, pctY: 45, size: 84 },
  3: { pctX: 66, pctY: 48, size: 80 },
  4: { pctX: 84, pctY: 45, size: 86 },
  5: { pctX: 98, pctY: 47, size: 72 },

  // Tier 2: Mid-upper core (y: 53-62vh)
  6: { pctX: 5, pctY: 55, size: 78 },
  7: { pctX: 22, pctY: 57, size: 78 },
  8: { pctX: 45, pctY: 55, size: 108 },
  9: { pctX: 72, pctY: 56, size: 86 },
  10: { pctX: 92, pctY: 56, size: 90 },

  // Tier 3: Mid-lower core (y: 63-72vh)
  11: { pctX: 8, pctY: 66, size: 78 },
  12: { pctX: 28, pctY: 65, size: 86 },
  13: { pctX: 48, pctY: 66, size: 82 },
  14: { pctX: 68, pctY: 67, size: 86 },
  15: { pctX: 90, pctY: 66, size: 82 },

  // Tier 4: Lower base tucking under ticket strip (y: 73-82vh)
  16: { pctX: 12, pctY: 76, size: 82 },
  17: { pctX: 32, pctY: 76, size: 84 },
  18: { pctX: 52, pctY: 77, size: 82 },
  19: { pctX: 72, pctY: 77, size: 80 },
  20: { pctX: 92, pctY: 76, size: 78 },
};

export default function FooterCoins() {
  const containerRef = useRef<HTMLDivElement>(null);
  const domRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Simulation nodes
    const nodes = COIN_DEFS.map((def) => ({
      ...def,
      homeX: 0,
      homeY: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: def.size * 0.44,
      currentRotate: def.rotate,
    }));

    const n = nodes.length;
    // Precomputed pairwise resting distances to ensure zero jitter/springiness at rest
    const restDists: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    const mouse = { x: -9999, y: -9999, active: false };
    let w = 0;
    let h = 0;
    let lastWasMobile: boolean | null = null;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      /* ⚠ 768 IS CORRECT HERE AND MUST STAY — it is the FOOTER's breakpoint,
         not the site's. Everything else in this codebase splits at `lg`
         (1024), so 768 looks like a mistake; it is not. Footer.tsx swaps its
         cloud at `md:block` / `md:hidden` and TicketStrip.tsx swaps the strip
         from a vertical rail to a horizontal bar at the same `md`. The coins
         are positioned in the gap those two leave, so they have to change
         layout on the same line the gap does.
         Verified by measurement: at 768 the horizontal ticket strip does not
         exist (`flex md:hidden`), so the mobile coin band would be placed
         against a strip that is not there. Moving this to 1024 desynced the
         coins from their own section — do not "align" it again without
         moving Footer.tsx and TicketStrip.tsx with it. */
      const isMobile = w < 768;
      const modeChanged = lastWasMobile !== null && lastWasMobile !== isMobile;
      lastWasMobile = isMobile;

      if (!isMobile) {
        // STRICTLY UNTOUCHED DESKTOP VALUES
        const scaleFactor = Math.min(2.5, Math.max(0.65, w / 1440));

        for (let i = 0; i < n; i++) {
          const node = nodes[i];
          node.homeX = (COIN_DEFS[i].pctX / 100) * w;
          node.homeY = (COIN_DEFS[i].pctY / 100) * h;
          node.radius = COIN_DEFS[i].size * scaleFactor * 0.44;
          if (modeChanged || (node.x === 0 && node.y === 0)) {
            node.x = node.homeX;
            node.y = node.homeY;
          }
          const el = domRefs.current[i];
          if (el) el.style.display = "block";
        }
      } else {
        // MOBILE ONLY GAP LAYOUT (gap between cloud bottom ~48vh and ticket strip ~86vh)
        /* ⚠ THE SIZE IS CAPPED AS A FRACTION OF THE VIEWPORT. Measured
           before: the largest coin was 114px on a 430 screen and 95px on a
           360 — 26-27% of the whole width for one decorative icon, which is
           what reads as "oversized" on a phone. The sizes in MOBILE_COORDS
           are tuned against a ~390 phone, so scaling them by w/390 keeps that
           proportion; the 1.0 ceiling stops the collage inflating on a tablet
           where the same band is far wider, and the extra min() holds any
           single coin under ~19% of the screen. */
        const mobScale = Math.min(1.0, Math.max(0.72, w / 390));

        for (let i = 0; i < n; i++) {
          const node = nodes[i];
          const el = domRefs.current[i];
          const mCoord = MOBILE_COORDS[i];

          if (mCoord) {
            node.homeX = (mCoord.pctX / 100) * w;
            node.homeY = (mCoord.pctY / 100) * h;
            node.radius = Math.min(mCoord.size * mobScale, w * 0.19) * 0.44;
            if (el) el.style.display = "block";
          } else {
            // Extra icons safely hidden on mobile to avoid overcrowding the small gap
            if (el) el.style.display = "none";
          }

          if (modeChanged || (node.x === 0 && node.y === 0)) {
            node.x = node.homeX;
            node.y = node.homeY;
          }
        }
      }

      // Precompute resting separations for equilibrium
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          restDists[i][j] = Math.hypot(nodes[j].homeX - nodes[i].homeX, nodes[j].homeY - nodes[i].homeY);
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    let animId: number;

    const tick = () => {
      // Strictly do not run on mobile (< 768px)
      if (w < 768) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // 1. Mouse Repulsion Force:
      // Smooth displacement when cursor approaches/hovers
      if (mouse.active) {
        for (let i = 0; i < n; i++) {
          const node = nodes[i];
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const repelRadius = node.radius + 65;

          if (dist < repelRadius && dist > 1) {
            const factor = 1 - dist / repelRadius;
            // Smooth cubic force curve: gentle on edges, firm near center
            const force = factor * factor * 9.5;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }
      }

      // 2. Pairwise Collision Physics (Inelastic, Zero-Springiness):
      // When a pushed coin collides with neighbor coins, it pushes them out smoothly
      // with zero elastic bounce impulse.
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);

            // Contact threshold respects resting equilibrium
            const restDist = restDists[i][j];
            const touchThreshold = Math.min(restDist, (a.radius + b.radius) * 0.84);

            if (dist < touchThreshold && dist > 0.001) {
              const overlap = touchThreshold - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              // Smooth positional separation (push neighbor out of way)
              const pushAmount = overlap * 0.44;
              a.x -= nx * pushAmount;
              a.y -= ny * pushAmount;
              b.x += nx * pushAmount;
              b.y += ny * pushAmount;

              // Damp closing velocities along collision normal (inelastic: prevents springy bounce)
              const rvx = b.vx - a.vx;
              const rvy = b.vy - a.vy;
              const closingSpeed = rvx * nx + rvy * ny;
              if (closingSpeed < 0) {
                const absorb = closingSpeed * 0.48;
                a.vx += nx * absorb;
                a.vy += ny * absorb;
                b.vx -= nx * absorb;
                b.vy -= ny * absorb;
              }
            }
          }
        }
      }

      // 3. Natural Friction & Inertia (Zero Spring Snap-Back)
      // Coins retain their new positions when nudged/pushed without returning to origin
      const damping = 0.78;
      /* same 768 boundary as updateDimensions — if these two disagree, a
         viewport gets mobile home positions with desktop containment bounds
         (or the reverse) and the coins settle against the wrong walls. */
      const isMobile = w < 768;
      const minX = isMobile ? -35 : w * 0.45;
      const maxX = isMobile ? w + 35 : w * 0.79;
      const minY = isMobile ? h * 0.41 : -120;
      /* ⚠ 0.78, NOT 0.82. The ticket strip sits at the foot of the footer and
         the clamp let coins settle into it — measured 3 coins overlapping the
         strip at 768 once this component started using the mobile layout
         there at all. The strip has to stay readable, so the physics ceiling
         stops above it rather than relying on the home coordinates alone
         (a nudge or a resize moves coins off home; the clamp is the only
         thing that holds).
         Measured: the strip's top edge is at 82% of the footer and the lowest
         coin bottom reached 81.9% — touching, with nothing to spare. 0.74
         leaves a real margin at every width instead of a rounding error. */
      const maxY = isMobile ? h * 0.74 : h + 120;

      for (let i = 0; i < n; i++) {
        const node = nodes[i];

        // Velocity friction (natural deceleration)
        node.vx *= damping;
        node.vy *= damping;

        // Position update
        node.x += node.vx;
        node.y += node.vy;

        // Soft containment within the pocket boundaries
        if (node.x < minX) {
          node.x = minX;
          if (node.vx < 0) node.vx = 0;
        } else if (node.x > maxX) {
          node.x = maxX;
          if (node.vx > 0) node.vx = 0;
        }

        if (node.y < minY) {
          node.y = minY;
          if (node.vy < 0) node.vy = 0;
        } else if (node.y > maxY) {
          node.y = maxY;
          if (node.vy > 0) node.vy = 0;
        }

        // Subtle dynamic tilt based on horizontal displacement velocity
        const targetTilt = node.rotate + node.vx * 1.2;
        node.currentRotate += (targetTilt - node.currentRotate) * 0.12;

        // Apply direct transform to DOM node (strictly preserving static layer hierarchy)
        const el = domRefs.current[i];
        if (el) {
          const s = node.radius * 2;
          const left = node.x - node.radius;
          const top = node.y - node.radius;
          el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${node.currentRotate}deg)`;
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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none hidden md:block absolute inset-0 z-10 overflow-hidden select-none"
    >
      {COIN_DEFS.map((coin, i) => (
        <div
          key={coin.id}
          ref={(el) => {
            domRefs.current[i] = el;
          }}
          data-coin={coin.id}
          className="pointer-events-auto absolute left-0 top-0 will-change-transform cursor-pointer"
          style={{
            zIndex: coin.zIndex,
          }}
        >
          <img
            src={coin.src}
            alt={coin.alt}
            className="h-full w-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
