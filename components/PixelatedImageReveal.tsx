"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Pixelated image reveal — osmo.supply's resource, ported to React.
 * https://www.osmo.supply/demo/pixelated-image-reveal
 * Credited there to Dennis Snellenberg, originally from hartmanncapital.com.
 * Listed as free; the page states no licence, so treat it as borrowed and
 * keep this attribution with it.
 *
 * ⚠ IT IS DOM DIVS, NOT CANVAS OR WEBGL. One absolutely-positioned div per
 * pixel, shown and hidden by GSAP with a random-origin stagger. GSAP is
 * already a dependency here, so this adds none — the original loads it from
 * jsDelivr, which we do not need.
 *
 * The mechanism: every pixel flicks ON in random order over
 * `stepDuration`, the underlying image is swapped at the moment the grid is
 * fully opaque, then every pixel flicks OFF again in random order. The swap
 * is hidden behind the covered frame, so it reads as the image dissolving.
 */

type Props = {
  /** the images to cycle through. Two is the hover case — at rest and
      revealed. More than two only makes sense with `loopEvery`, and the
      cycle wraps back to the first. */
  images: { src: string; alt: string }[];
  /** squares per side. The original is 7; denser reads as pixelation
      rather than as tiles. */
  grid?: number;
  /** seconds for one half of the effect — cover, then uncover */
  stepDuration?: number;
  /** run the transition on scroll-into-view instead of on hover */
  auto?: boolean;
  /** how the two images sit in the box. `cover` crops to fill (the
      original's square card); `contain` fits them whole, which is what a
      portrait mockup in a tall cell needs. */
  fit?: "cover" | "contain";
  /** drop the 1:1 box — for a slot that already has its own shape. */
  square?: boolean;
  /** clip the pixel grid to the artwork's own alpha, so the squares never
      paint over transparent background. */
  maskToArt?: boolean;
  /** ms between automatic plays. 0 (the default) plays once per trigger. */
  loopEvery?: number;
  className?: string;
};

export default function PixelatedImageReveal({
  images,
  grid = 7,
  stepDuration = 0.3,
  auto = false,
  fit = "cover",
  square = true,
  maskToArt = false,
  loopEvery = 0,
  className = "",
}: Props) {
  const card = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = card.current;
    const pixelGrid = gridRef.current;
    if (!host || !pixelGrid || !stack.current) return;

    /* ⚠ THE PIXELS ARE BUILT HERE, NOT IN JSX. 49 divs that exist only to be
       animated are not state and never re-render — putting them through React
       would mean 49 elements diffed on every parent render for no reason.
       Rebuilt if `grid` changes, which the cleanup handles. */
    const size = 100 / grid;
    const frag = document.createDocumentFragment();
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const pixel = document.createElement("div");
        /* ⚠ THE OVERLAP IS WHAT MAKES IT READ AS SOLID. At a fine grid the
           percentage edges land on fractional device pixels and a hairline of
           the image shows between neighbours — the cover looks like a mesh,
           not a surface. Each tile is drawn a touch past its cell so the
           seams are buried; they are opaque and identically coloured, so the
           overlap is invisible. */
        pixel.style.cssText = `position:absolute;display:none;background-color:currentColor;width:calc(${size}% + 1px);height:calc(${size}% + 1px);left:${col * size}%;top:${row * size}%`;
        frag.appendChild(pixel);
      }
    }
    pixelGrid.appendChild(frag);

    const pixels = Array.from(pixelGrid.children) as HTMLElement[];
    const stagger = stepDuration / pixels.length;
    const frames = Array.from(stack.current!.children) as HTMLElement[];

    /* ⚠ AN INDEX, NOT A BOOLEAN. Two images could be a flag; a cycle of six
       cannot, and a flag is what the hover case silently degrades to
       (`index` only ever being 0 or 1). One counter covers both, so there is
       no second code path to keep in step. */
    let index = 0;
    let delayed: gsap.core.Tween | undefined;

    const show = (i: number) => {
      frames.forEach((f, n) => { f.style.display = n === i ? "block" : "none"; });
    };

    const goTo = (next: number) => {
      index = ((next % frames.length) + frames.length) % frames.length;
      /* ⚠ KILL BEFORE RE-RUNNING, or a fast in-out-in leaves half the grid
         mid-stagger and the two passes fight: pixels stick visible and the
         swap fires against the wrong frame. */
      gsap.killTweensOf(pixels);
      delayed?.kill();

      gsap.set(pixels, { display: "none" });
      gsap.to(pixels, {
        display: "block",
        duration: 0,
        stagger: { each: stagger, from: "random" },
      });

      /* the swap happens while the grid fully covers the image */
      delayed = gsap.delayedCall(stepDuration, () => show(index));

      gsap.to(pixels, {
        display: "none",
        duration: 0,
        delay: stepDuration,
        stagger: { each: stagger, from: "random" },
      });
    };

    show(0);

    const onClick = () => goTo(index + 1);
    const onEnter = () => { if (index === 0) goTo(1); };
    const onLeave = () => { if (index !== 0) goTo(0); };

    /* `auto` drives it from the viewport rather than the pointer: it plays
       when the element scrolls in, so a decorative piece animates on its
       own. */
    let io: IntersectionObserver | undefined;
    let loop: number | undefined;
    if (auto) {
      /* ⚠ THE LOOP IS GATED ON VISIBILITY, and it has to be. An interval left
         running off screen keeps GSAP staggering hundreds of elements against
         a section nobody is looking at — the same waste the videos and the
         canvas were each pulled up for. The observer starts it on the way in
         and clears it on the way out. */
      const stop = () => { if (loop) { clearInterval(loop); loop = undefined; } };
      const start = () => {
        stop();
        if (!loopEvery) return;
        loop = window.setInterval(() => goTo(index + 1), loopEvery);
      };
      io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) start(); else stop(); },
        { threshold: 0.45 },
      );
      io.observe(host);
    } else if (window.matchMedia("(pointer: coarse)").matches) {
      /* coarse pointer gets tap-to-advance; a hover effect has no "out" on
         touch, so the first image would otherwise never come back. */
      host.addEventListener("click", onClick);
    } else {
      host.addEventListener("mouseenter", onEnter);
      host.addEventListener("mouseleave", onLeave);
    }

    return () => {
      io?.disconnect();
      if (loop) clearInterval(loop);
      host.removeEventListener("click", onClick);
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(pixels);
      delayed?.kill();
      pixelGrid.replaceChildren();
      show(0);
    };
  }, [grid, stepDuration, auto, loopEvery, images.length]);

  const objectFit = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      ref={card}
      /* `aspect-square` replaces the original's padding-top:100% spacer —
         same 1:1 box, one element fewer. */
      className={`relative overflow-hidden rounded-[0.5em] ${square ? "aspect-square" : ""} ${className}`}
    >
      {/* ⚠ EVERY FRAME IS MOUNTED, ONE SHOWN. They are stacked and toggled by
          `display`, so a swap is a style write with nothing to load — the
          browser has already decoded all of them. Rendering only the current
          one would fetch mid-transition and flash on the first cycle.
          `eager` on the first, lazy on the rest: the first is what is on
          screen at rest, the others have until the first 4s tick. */}
      <div ref={stack} className="absolute inset-0">
        {images.map((im, i) => (
          <div key={im.src} className="absolute inset-0" style={{ display: i === 0 ? "block" : "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={im.src}
              alt={im.alt}
              className={`absolute inset-0 size-full ${objectFit}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
      {/* the pixels inherit `currentColor`, so the colour of the dissolve is
          set with a text colour on this component.

          ⚠ THE MASK IS THE ARTWORK ITSELF, not a hand-written radius. The
          grid is a plain rectangle of divs and knows nothing about the shape
          underneath, so at the corners it painted squares over transparent
          background. Masking with the first frame and the same object-fit
          means the cover is EXACTLY the artwork's own alpha — a rounded
          rectangle here. All the frames share one silhouette, so one mask
          serves the whole cycle.
          -webkit- too: Safari still needs the prefix for mask-image. */}
      <div
        ref={gridRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={
          maskToArt
            ? {
                maskImage: `url(${images[0].src})`,
                WebkitMaskImage: `url(${images[0].src})`,
                maskSize: fit === "contain" ? "contain" : "cover",
                WebkitMaskSize: fit === "contain" ? "contain" : "cover",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }
            : undefined
        }
      />
    </div>
  );
}
