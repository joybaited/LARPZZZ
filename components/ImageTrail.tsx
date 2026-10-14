"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Codrops' Image Trail, VARIANT 3 — ported to GSAP 3 and React.
 *
 * Source: github.com/codrops/ImageTrailEffects `js/demo3.js`, MIT, Codrops
 * 2019. Read from the repo, not recreated from the demo page.
 *
 * ⚠ WHAT MAKES IT VARIANT 3 AND NOT ANY OTHER: the image does NOT simply
 * fade where it was dropped. At 0.4s it fades AND falls by a full viewport
 * height on `Quint.easeInOut`, while still gliding toward the cursor on
 * `Expo.easeOut` over 1.6s. Three overlapping tweens on one timeline. Drop
 * the fall and it becomes variant 1.
 *
 * Their numbers, kept exactly:
 *   threshold  50px of mouse travel before the next image is shown
 *   lerp       0.1 toward the cursor, so the image starts where the pointer
 *              WAS and chases where it IS
 *   glide      1.6s expo.out        at 0.0s
 *   fade       1.0s power1.out      at 0.4s
 *   fall       1.0s quint.inOut     at 0.4s, +(viewport height + half image)
 *
 * ⚠ TweenMax's `Expo.easeOut` IS GSAP 3's "expo.out", and `TimelineMax` is
 * `gsap.timeline()`. The original's `.to(el, 1.6, {...}, 0)` signature puts
 * duration second; GSAP 3 wants it inside the vars object. Porting the shape
 * without porting the signature silently gives every tween the default 0.5s.
 */

/* their 50. The distance the pointer must travel before the next image. */
const THRESHOLD = 50;

type Props = {
  /** image urls, in the order they cycle */
  images: string[];
  /** px. the trail image's box; the art is `object-contain` inside it. */
  size?: number;
  /** css selector for areas the trail must NOT fire over */
  exclude?: string;
};

export default function ImageTrail({ images, size = 190, exclude }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    /* the trail is decoration and it is a lot of motion. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* no hover means no trail — on touch every tap would dump an image. */
    if (!window.matchMedia("(hover: hover)").matches) return;

    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
    if (!imgs.length) return;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    let winH = window.innerHeight;
    const onResize = () => {
      winH = window.innerHeight;
      gsap.set(imgs, { x: 0, y: 0, opacity: 0 });
    };
    window.addEventListener("resize", onResize);

    let mouse = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let cache = { x: 0, y: 0 };
    let seeded = false;
    let idx = 0;
    let z = 1;

    /* ⚠ THE POSITION IS RELATIVE TO THE HERO, NOT THE PAGE. The original
       reads pageX/pageY because its container is the document; ours is a
       section, so the offset has to come off the container's own box or
       every image lands one section too low. */
    const onMove = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      if (!seeded) {
        last = { ...mouse };
        cache = { ...mouse };
        seeded = true;
      }
    };

    /* ⚠ THE EXCLUSION IS TESTED ON THE REAL POINTER TARGET, not on a
       rectangle. The nav is an irregular shape with a dropdown that changes
       height, and a box test would either miss its corners or kill a band of
       the hero that is not actually the nav. `closest` asks the DOM. */
    let blocked = false;
    const onMoveCapture = (ev: PointerEvent) => {
      const t = ev.target as Element | null;
      blocked = !!(exclude && t?.closest(exclude));
      onMove(ev);
    };

    const show = () => {
      const img = imgs[idx];
      gsap.killTweensOf(img);
      const w = img.offsetWidth || size;
      const h = img.offsetHeight || size;

      gsap
        .timeline()
        .set(
          img,
          {
            opacity: 1,
            zIndex: z,
            /* starts at the LERPED point (where the pointer was) and the
               glide below takes it to where the pointer is. That lag is the
               trail. */
            x: cache.x - w / 2,
            y: cache.y - h / 2,
          },
          0,
        )
        .to(img, { duration: 1.6, ease: "expo.out", x: mouse.x - w / 2, y: mouse.y - h / 2 }, 0)
        .to(img, { duration: 1, ease: "power1.out", opacity: 0 }, 0.4)
        /* the fall. `+=` is relative, so it drops from wherever the glide has
           carried it rather than from a fixed point. */
        .to(img, { duration: 1, ease: "quint.inOut", y: `+=${winH + h / 2}` }, 0.4);
    };

    let raf = 0;
    const render = () => {
      cache.x = lerp(cache.x || mouse.x, mouse.x, 0.1);
      cache.y = lerp(cache.y || mouse.y, mouse.y, 0.1);

      const dist = Math.hypot(mouse.x - last.x, mouse.y - last.y);
      if (seeded && !blocked && dist > THRESHOLD) {
        show();
        z += 1;
        idx = idx < imgs.length - 1 ? idx + 1 : 0;
        last = { ...mouse };
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    /* capture, so a handler inside the hero cannot stop it reaching here. */
    window.addEventListener("pointermove", onMoveCapture, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMoveCapture, true);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(imgs);
    };
  }, [images, size, exclude]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      /* ⚠ pointer-events-none OR IT EATS EVERY CLICK IN THE HERO. The layer
         covers the whole section, so without it the buttons underneath stop
         responding the moment one image is on screen. */
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {images.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className="absolute top-0 left-0 object-contain opacity-0 will-change-transform"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}
