"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* Curated pool of vibrant, high-character stickers (excluding pop-03 which is reserved for the FAQ heading) */
const STICKER_POOL = [
  "/images/stickers/cartoon-01.webp",
  "/images/stickers/cartoon-02.webp",
  "/images/stickers/cartoon-03.webp",
  "/images/stickers/cartoon-04.webp",
  "/images/stickers/cartoon-05.webp",
  "/images/stickers/cartoon-06.webp",
  "/images/stickers/cartoon-07.webp",
  "/images/stickers/cartoon-08.webp",
  "/images/stickers/cartoon-09.webp",
  "/images/stickers/cartoon-10.webp",
  "/images/stickers/cartoon-11.webp",
  "/images/stickers/cartoon-12.webp",
  "/images/stickers/cartoon-13.webp",
  "/images/stickers/cartoon-14.webp",
  "/images/stickers/cartoon-15.webp",
  "/images/stickers/pop-01.webp",
  "/images/stickers/pop-02.webp",
  "/images/stickers/pop-04.webp",
  "/images/stickers/pop-05.webp",
  "/images/stickers/pop-06.webp",
  "/images/stickers/pop-07.webp",
  "/images/stickers/pop-08.webp",
  "/images/stickers/pop-09.webp",
  "/images/stickers/pop-10.webp",
  "/images/stickers/pop-11.webp",
  "/images/stickers/pop-12.webp",
  "/images/stickers/pop-13.webp",
  "/images/stickers/pop-14.webp",
  "/images/stickers/pop-15.webp",
  "/images/stickers/pop-16.webp",
  "/images/stickers/pop-17.webp",
  "/images/stickers/pop-18.webp",
  "/images/stickers/pop-19.webp",
  "/images/stickers/pop-20.webp",
  "/images/stickers/squiggle-01.webp",
  "/images/stickers/squiggle-02.webp",
  "/images/stickers/squiggle-03.webp",
  "/images/stickers/squiggle-04.webp",
  "/images/stickers/squiggle-06.webp",
  "/images/stickers/squiggle-07.webp",
  "/images/stickers/squiggle-09.webp",
  "/images/stickers/squiggle-11.webp",
  "/images/stickers/squiggle-12.webp",
  "/images/stickers/squiggle-16.webp",
  "/images/stickers/squiggle-17.webp",
  "/images/stickers/squiggle-20.webp",
  "/images/stickers/squiggle-21.webp",
  "/images/stickers/squiggle-25.webp",
];

interface SlotDef {
  id: string;
  side: "left" | "right";
  horizontalBase: string;
  verticalBase: string;
  initialDelay: number;
}

/* 6 slots covering the 4 red scribble zones in the user's screenshot:
   1. Top-Left (scribble 1)
   2. Top-Right (scribble 2)
   3. Mid-Left Upper & Lower (tall vertical scribble 3)
   4. Mid-Right Upper & Lower (tall vertical scribble 4)
*/
const SLOTS: SlotDef[] = [
  {
    id: "top-left",
    side: "left",
    horizontalBase: "clamp(2.5rem, 8vw, 12rem)",
    verticalBase: "clamp(3.5rem, 5.5vw, 6.5rem)",
    initialDelay: 350,
  },
  {
    id: "top-right",
    side: "right",
    horizontalBase: "clamp(2.5rem, 8vw, 12rem)",
    verticalBase: "clamp(3.5rem, 5.5vw, 6.5rem)",
    initialDelay: 1200,
  },
  {
    id: "mid-left-upper",
    side: "left",
    horizontalBase: "clamp(1.5rem, 6vw, 9.5rem)",
    verticalBase: "clamp(15rem, 23vw, 21rem)",
    initialDelay: 800,
  },
  {
    id: "mid-left-lower",
    side: "left",
    horizontalBase: "clamp(2rem, 7vw, 11rem)",
    verticalBase: "clamp(28rem, 39vw, 37rem)",
    initialDelay: 2100,
  },
  {
    id: "mid-right-upper",
    side: "right",
    horizontalBase: "clamp(1.5rem, 6vw, 9.5rem)",
    verticalBase: "clamp(21rem, 30vw, 28rem)",
    initialDelay: 1600,
  },
  {
    id: "mid-right-lower",
    side: "right",
    horizontalBase: "clamp(2rem, 7vw, 11rem)",
    verticalBase: "clamp(35rem, 47vw, 45rem)",
    initialDelay: 2800,
  },
];

type SpotStatus = "hidden" | "entering" | "visible" | "leaving";

interface SpotData {
  src: string;
  rotation: number;
  offsetX: number;
  offsetY: number;
  scaleFactor: number;
  status: SpotStatus;
}

function PoppingSpot({
  slot,
  active,
}: {
  slot: SlotDef;
  active: boolean;
}) {
  const [data, setData] = useState<SpotData>({
    src: STICKER_POOL[0],
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    scaleFactor: 1,
    status: "hidden",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const spawnNext = useCallback(() => {
    // Pick random sticker
    const randomSrc = STICKER_POOL[Math.floor(Math.random() * STICKER_POOL.length)];
    // Random rotation between -18deg and +18deg
    const randomRot = Math.floor((Math.random() - 0.5) * 36);
    // Subtle position jitter so it doesn't always spawn in the exact same pixel
    const jitterX = Math.floor((Math.random() - 0.5) * 26);
    const jitterY = Math.floor((Math.random() - 0.5) * 32);
    // Slight size variance
    const scale = 0.9 + Math.random() * 0.22;

    setData({
      src: randomSrc,
      rotation: randomRot,
      offsetX: jitterX,
      offsetY: jitterY,
      scaleFactor: scale,
      status: "entering",
    });

    // Enter animation finishes in ~450ms -> visible
    timerRef.current = setTimeout(() => {
      setData((prev) => ({ ...prev, status: "visible" }));

      // Stay visible for 2.6s - 4.4s
      const stayDuration = 2600 + Math.random() * 1800;
      timerRef.current = setTimeout(() => {
        setData((prev) => ({ ...prev, status: "leaving" }));

        // Pop out finishes in ~320ms -> hidden
        timerRef.current = setTimeout(() => {
          setData((prev) => ({ ...prev, status: "hidden" }));

          // Stay hidden for 1.0s - 2.8s before popping next
          const hiddenDuration = 1000 + Math.random() * 1800;
          timerRef.current = setTimeout(spawnNext, hiddenDuration);
        }, 320);
      }, stayDuration);
    }, 450);
  }, []);

  useEffect(() => {
    if (!active) {
      clearTimer();
      setData((prev) => ({ ...prev, status: "hidden" }));
      return;
    }

    timerRef.current = setTimeout(spawnNext, slot.initialDelay);
    return clearTimer;
  }, [active, slot.initialDelay, spawnNext]);

  // Click interaction: popping early!
  const handleClick = () => {
    if (data.status === "entering" || data.status === "visible") {
      clearTimer();
      setData((prev) => ({ ...prev, status: "leaving" }));
      timerRef.current = setTimeout(() => {
        setData((prev) => ({ ...prev, status: "hidden" }));
        const hiddenDuration = 600 + Math.random() * 1000;
        timerRef.current = setTimeout(spawnNext, hiddenDuration);
      }, 320);
    }
  };

  if (data.status === "hidden") return null;

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    top: `calc(${slot.verticalBase} + ${data.offsetY}px)`,
    ...(slot.side === "left"
      ? { left: `calc(${slot.horizontalBase} + ${data.offsetX}px)` }
      : { right: `calc(${slot.horizontalBase} + ${data.offsetX}px)` }),
    zIndex: 20,
    transformOrigin: "center center",
    // Custom properties for keyframe rotations
    ["--rot-target" as string]: `${data.rotation}deg`,
    ["--rot-start" as string]: `${data.rotation - 14}deg`,
    ["--rot-mid" as string]: `${data.rotation + 4}deg`,
    ["--rot-end" as string]: `${data.rotation + 14}deg`,
  };

  const getAnimationClass = () => {
    switch (data.status) {
      case "entering":
        return "animate-faq-pop-in";
      case "visible":
        return "animate-faq-pop-float";
      case "leaving":
        return "animate-faq-pop-out";
      default:
        return "";
    }
  };

  return (
    <div
      style={positionStyle}
      onClick={handleClick}
      title="Pop!"
      className={`pointer-events-auto cursor-pointer select-none transition-transform hover:scale-110 active:scale-90 ${getAnimationClass()}`}
    >
      <img
        loading="lazy"
        decoding="async"
        src={data.src}
        alt=""
        draggable={false}
        className="block h-auto w-[clamp(68px,6.8vw,115px)] max-w-none select-none drop-shadow-[0_10px_20px_rgba(61,6,95,0.25)]"
        style={{
          transform: `scale(${data.scaleFactor})`,
        }}
      />
    </div>
  );
}

export default function FaqPoppingStickers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes faqPopIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(var(--rot-start, -12deg));
          }
          65% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.18) rotate(var(--rot-mid, 3deg));
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.96) rotate(var(--rot-target, 0deg));
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(var(--rot-target, 0deg));
          }
        }

        @keyframes faqPopOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(var(--rot-target, 0deg));
          }
          25% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.12) rotate(calc(var(--rot-target, 0deg) + 2deg));
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(var(--rot-end, 14deg));
          }
        }

        @keyframes faqPopFloat {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translateY(0px) rotate(var(--rot-target, 0deg));
          }
          50% {
            transform: translate(-50%, -50%) scale(1.03) translateY(-5px) rotate(calc(var(--rot-target, 0deg) + 2deg));
          }
        }

        .animate-faq-pop-in {
          animation: faqPopIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-faq-pop-out {
          animation: faqPopOut 0.32s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-faq-pop-float {
          animation: faqPopFloat 3.2s ease-in-out infinite alternate;
          will-change: transform;
        }
      `}</style>

      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 hidden overflow-visible lg:block"
      >
        {SLOTS.map((slot) => (
          <PoppingSpot key={slot.id} slot={slot} active={inView} />
        ))}
      </div>
    </>
  );
}
