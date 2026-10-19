"use client";

import { useEffect, useRef, useState } from "react";

/* The nav's hamburger, the surface behind the bar, and the panel it opens.
 *
 * ── THIS IS osmo.supply's MECHANISM, PORTED ──────────────────────────────
 *
 * Read from their live CSS (slater.app/16596/45446.css) and JS
 * (slater.app/16596/55554.js), not from a recreation. Worth knowing before
 * changing any number here:
 *
 * ⚠ THEIR JAVASCRIPT ANIMATES NOTHING. The whole script flips one attribute,
 * `data-nav-status`, between "active" and "not-active". Every pixel of the
 * motion is a CSS transition keyed off that attribute. GSAP is on their page
 * for other work and the nav never touches it. So this needs no animation
 * library either — adding one would be strictly more code for less.
 *
 * ⚠ ONE EASING FOR EVERYTHING: cubic-bezier(0.625, 0.05, 0, 1). Their
 * `--cubic-default`. The smoothness is NOT from per-element easings; it is
 * from one shared curve plus staggered delays. Do not give these elements
 * separate easings — that is what makes a menu feel assembled from parts.
 *
 * ⚠ THE TWO-STEP FEEL IS DELAYS, NOT SEQUENCED CALLBACKS. Opening, the
 * surface moves first and the panel follows 300ms later. Closing, the panel
 * goes immediately and the surface settles after. The asymmetry is the entire
 * effect and it lives only in the base vs. active transition-delay.
 *
 * ⚠ `rotate(0.001deg)` ON EVERY TRANSFORM IS THEIRS AND IS DELIBERATE. It
 * forces the element onto its own composited layer so text does not shimmer
 * while the row interpolates. A no-op rotation buys that without
 * `will-change` permanently pinning a layer for an element that is static
 * almost all the time.
 */

/* Their durations, in ms. `--duration-default` and its multiples. */
const D = { quarter: 150, half: 300, base: 600, onehalf: 900 };
const EASE = "cubic-bezier(0.625, 0.05, 0, 1)";

/* ── THE WHOLE MENU ───────────────────────────────────────────────────────
 *
 * ⚠ IT IS ONE COMPONENT BECAUSE <Hero> IS A SERVER COMPONENT. The button, the
 * surface and the panel all read the same `open`, and a server component can
 * hold no state — so one client component owns it and renders all three.
 *
 * ⚠ THE SURFACE IS A SEPARATE LAYER FROM THE <nav> BOX, AND THAT IS LOAD-
 * BEARING. The `in: "nav"` elements are absolute with percentage x/y and
 * resolve against the <nav>, which has a tuned fixed height. So the <nav>
 * must never change size. Osmo has the same split — their `.nav-bar__back`
 * is a backdrop that insets independently of the bar's content box — and it
 * is what lets the surface swell to meet the panel while the wordmark and
 * hamburger hold their positions exactly.
 */
export function NavMenuWithPanel({
  x,
  y,
  color,
  fill,
  radius,
  panelHeight,
  overlay,
  children,
}: {
  x: number;
  y: number;
  color: string;
  fill: string;
  radius: number;
  panelHeight: number;
  overlay: boolean;
  /* the `in: "menu"` elements, rendered by the section and passed in so this
     component stays unaware of <PriceEl> and of HERO. */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  /* ⚠ THE OPEN STATE IS WRITTEN ONTO THE PARENT <nav> AS AN ATTRIBUTE, which
     is how anything outside this component animates on it — the bar's own
     links fade out from globals.css by matching `[data-nav-open="true"]`.

     It is set from an effect rather than rendered, because the <nav> belongs
     to <Hero> (a server component) and is this component's ancestor, not its
     child. Osmo does the same thing: their entire nav script flips one
     `data-nav-status` attribute and every pixel of motion is css keyed off
     it. */
  useEffect(() => {
    const nav = btn.current?.closest("nav");
    if (!nav) return;
    nav.setAttribute("data-nav-open", String(open));
  }, [open]);

  /* ⚠ THE SURFACE MEASURES THE PANEL RATHER THAN TRUSTING `panelHeight`.
     The surface has to reach exactly as far down as the panel does, and
     `panelHeight` is only the EMPTY panel's stand-in height — the moment the
     panel holds real content, or `panelHeight` is retuned, a hardcoded reach
     leaves the panel hanging off the bottom of its own background. Measuring
     keeps the two fused whatever decides the height.

     `useLayoutEffect` would be the usual choice, but it warns during SSR and
     the value is only needed once the panel has laid out; the surface's own
     300ms delay means an effect lands long before it starts moving. */
  const panelRef = useRef<HTMLDivElement>(null);
  const [reach, setReach] = useState(panelHeight);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    /* offsetHeight, not scrollHeight: the panel is capped to the viewport
       and scrolls inside itself, so its box — not its content — is how far
       the surface has to reach. */
    const ro = new ResizeObserver(() => setReach(el.offsetHeight));
    ro.observe(el);
    setReach(el.offsetHeight);
    return () => ro.disconnect();
  }, [panelHeight]);

  /* ⚠ ESCAPE CLOSES AND FOCUS GOES BACK TO THE BUTTON. Without the second
     half, closing with the keyboard drops focus onto <body> and the next Tab
     restarts from the top of the document — the menu becomes a trap that is
     easy to enter and disorienting to leave.

     Bound only while open, so there is no always-on keydown listener. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    /* a click anywhere outside the nav closes it. `pointerdown` rather than
       `click` so it fires before focus moves, and capture so a handler inside
       cannot stop it reaching here.

       ⚠ THE TEST IS THE WHOLE <nav>, not a panel ref: the panel and the bar
       are siblings now, so a panel-only test would close the menu when the
       bar's own links were clicked. */
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest("nav")) setOpen(false);
    };
    /* ⚠ SCROLL IS LOCKED THROUGH LENIS, NOT `overflow: hidden`. Lenis drives
       the page with its own transform, so hiding the body's overflow does not
       stop it — the page still slides under an open menu. `stop()` is what
       actually holds it. The optional chain covers the two cases where there
       is no instance: reduced-motion (SmoothScroll returns early) and the
       first paint before its effect has run. Then the native listeners below
       are the fallback that still closes the menu.

       ⚠ AND THE LOCK IS RELEASED IN ONE PLACE — the cleanup. Calling start()
       inside each close path is how this goes wrong: a close by Escape, by
       outside click and by scroll are three paths, and any one of them
       forgotten leaves the page dead. The effect is keyed on `open`, so
       every close runs this teardown exactly once. */
    window.__lenis?.stop();

    /* a scroll attempt closes the menu and hands the page back. `wheel` and
       `touchmove` are the INTENT — they fire even while Lenis is stopped and
       the page has not moved, which a `scroll` listener would not. Passive,
       because this never calls preventDefault: the gesture is not cancelled,
       it just means "close". Not { once: true } — the menu can also be closed
       by Escape or a click, and a stale one-shot listener left armed would
       swallow the next unrelated gesture. */
    /* ⚠ EXCEPT INSIDE THE PANEL. On a short screen (a phone in landscape)
       the panel scrolls itself, and a swipe there is reading the menu, not
       leaving it. */
    const onScrollIntent = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("#nav-menu-panel")) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("wheel", onScrollIntent, { passive: true });
    window.addEventListener("touchmove", onScrollIntent, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("wheel", onScrollIntent);
      window.removeEventListener("touchmove", onScrollIntent);
      window.__lenis?.start();
    };
  }, [open]);

  return (
    <>
      {/* ── THE DIMMED PAGE BEHIND ──────────────────────────────────────
          Osmo's `.nav__bg`: rgba(0,0,0,0.3), fading on the base duration,
          with `visibility` transitioned alongside `opacity` so it is not
          clickable while invisible. Transitioning visibility rather than
          toggling it is what lets the fade OUT play — a straight
          `visibility: hidden` would cut it off at frame one.

          ⚠ IT IS `fixed`, SO IT COVERS THE PAGE AND NOT JUST THE HERO. The
          nav lives inside the hero section, but a dim that stopped at the
          section's bottom edge would read as a bug. */}
      {overlay && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-0 motion-reduce:transition-none"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            opacity: open ? 1 : 0,
            visibility: open ? "visible" : "hidden",
            pointerEvents: open ? "auto" : "none",
            transition: `opacity ${D.base}ms ${EASE}, visibility ${D.base}ms ${EASE}`,
          }}
        />
      )}

      {/* ── THE SURFACE ─────────────────────────────────────────────────
          Osmo's `.nav-bar__back`. Closed it is inset from the <nav> box;
          open it grows outward and upward to meet the panel, so the bar and
          the panel read as ONE continuous surface instead of two stacked
          boxes. This is the single biggest contributor to the effect and it
          is the piece most easily left out.

          ⚠ `bottom` IS WHAT REACHES DOWN TO THE PANEL. The panel is
          `top: 100%` of the <nav>, so a negative bottom here spans the gap
          and the two surfaces fuse. Its own rounding goes flat at the join
          for the same reason.

          ⚠ `-z-10` KEEPS IT BEHIND THE BAR'S CONTENT. It is painted after
          the wordmark in source order, so without this it would cover it. */}
      <div
        aria-hidden="true"
        className="absolute -z-10 motion-reduce:transition-none"
        style={{
          background: fill,
          inset: open ? "-4px 0px" : "0px",
          bottom: open ? `-${reach + 6}px` : "0px",
          borderRadius: `${radius}px`,
          /* ⚠ THE SURFACE LEADS, THE PANEL FOLLOWS — AND THAT GAP IS THE
             WHOLE TWO-STEP. `inset` fires at 0ms so the bar visibly swells
             before anything drops; `bottom` carries the same 300ms delay as
             the panel so the two reach full extension together. Give these
             the same delay and the effect collapses into one move after a
             dead pause, which is what it looked like before. */
          transition: open
            ? `inset ${D.base}ms ${EASE} 0ms, bottom ${D.onehalf}ms ${EASE} ${D.half}ms`
            : `inset ${D.base}ms ${EASE} ${D.quarter}ms, bottom ${D.base}ms ${EASE} 0ms`,
        }}
      />

      {/* ── THE HAMBURGER ───────────────────────────────────────────────
          ⚠ TWO BARS, NOT THREE. Osmo's is two, and that is why their X is
          clean: with three, the middle one has to fade and you are timing a
          disappearance against two rotations. Two bars simply cross.

          ⚠ THEY ALSO `scaleX(0.75)` AS THEY ROTATE. A rotated bar spans
          further corner-to-corner than a flat one, so without the shrink the
          X reads visibly larger than the closed burger. Theirs is exactly
          0.75. */}
      {/* ⚠ A FLOOR UNDER THE LEFT INSET ON MOBILE. `x` is a percentage of the
          SECTION, which is the right unit on a wide screen — but 4.6% of a
          390px phone is 18px, and measured, the button's left edge sat 9-13px
          from the screen edge at 360-430 against 92px on desktop. It read as
          jammed into the corner.
          `max(x%, 22px)` keeps the tuned percentage wherever it is already
          bigger — every width from about 480 up, so desktop and /hero-tuner
          are untouched — and only lifts it where the percentage has collapsed
          to nothing. A media query would have been a second number to keep in
          sync with `x`; max() reads the same value. */}
      <div
        className="absolute"
        style={{
          left: `max(${x}%, 22px)`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <button
          ref={btn}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="nav-menu-panel"
          onClick={() => setOpen((o) => !o)}
          /* ⚠ A 44px TARGET AROUND A SMALL ICON. 44 is the usual minimum for
             a touch target; the padding provides it without drawing
             anything. The hover tint is Osmo's `.nav-menu:hover`. */
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border-0 bg-transparent p-0 transition-colors motion-reduce:transition-none"
          style={{
            transitionDuration: `${D.half}ms`,
            transitionTimingFunction: EASE,
            backgroundColor: open ? "rgba(255,255,255,0.06)" : "transparent",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = open ? "rgba(255,255,255,0.06)" : "transparent")
          }
        >
          <span className="relative block h-[14px] w-[22px]">
            {[0, 1].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute left-0 block h-[2px] w-full rounded-full motion-reduce:transition-none"
                style={{
                  background: color,
                  top: "50%",
                  /* closed: one bar 3px above centre, one 3px below.
                     open: both to centre, crossing at ±45deg, shrunk to
                     0.75 so the X matches the burger's visual width. */
                  transform: open
                    ? `translateY(-50%) rotate(${i === 0 ? -45 : 45}deg) scaleX(0.75)`
                    : `translateY(calc(-50% + ${i === 0 ? -3 : 3}px)) rotate(0.001deg) scaleX(1)`,
                  transition: `transform ${D.base}ms ${EASE}`,
                }}
              />
            ))}
          </span>
        </button>
      </div>

      {/* ── THE PANEL ───────────────────────────────────────────────────
          ⚠ THE HEIGHT ANIMATES WITH `grid-template-rows: 0fr -> 1fr`, not a
          measured pixel height. That is the core trick and it is pure CSS: a
          grid row interpolates between fractions, so `auto` height becomes
          animatable without reading content height in JS and without a
          max-height guess that is either too small to fit or too large to
          time correctly. `overflow: hidden` on the track does the reveal.

          ⚠ THE INNER WRAPPER NEEDS `min-h-0` AND `overflow-hidden` TOO.
          Without it the grid item refuses to shrink below its content's
          min-content height, so the row collapses to that instead of to
          zero and the panel never fully closes.

          ⚠ IT ALSO SLIDES: translateY(-0.625em) -> 0. The panel emerges from
          behind the bar rather than simply unrolling, which is what stops the
          reveal looking like a window blind. */}
      <div
        className="absolute top-full right-0 left-0 pt-[6px]"
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* `inert` while closed: aria-hidden alone left every link in the
            hidden panel reachable by Tab. A click on any link closes the
            menu so the page is handed back as the anchor scrolls. */}
        <div
          id="nav-menu-panel"
          aria-hidden={!open}
          inert={!open}
          onClick={(e) => {
            if ((e.target as Element).closest("a")) setOpen(false);
          }}
          className="grid overflow-hidden motion-reduce:transition-none"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            transform: open
              ? "translateY(0em) rotate(0.001deg)"
              : "translateY(-0.625em) rotate(0.001deg)",
            transition: open
              ? `grid-template-rows ${D.onehalf}ms ${EASE} ${D.half}ms, transform ${D.base}ms ${EASE} ${D.half}ms`
              : `grid-template-rows ${D.base}ms ${EASE} 0ms, transform ${D.base}ms ${EASE} 0ms`,
          }}
        >
          <div className="min-h-0 overflow-hidden">
            {/* ⚠ `relative`, SO AN `in: "menu"` ELEMENT RESOLVES AGAINST THIS
                BOX. <PriceEl> is absolute with percentage x/y and takes the
                nearest positioned ancestor — without this they would resolve
                against the <nav> and land in the bar. Same arrangement the
                nav's own elements already rely on.

                `panelHeight` is what gives the row a height to animate to;
                with real children it can go once they fill it. */}
            {/* ⚠ CAPPED TO THE SCREEN AND SCROLLS INSIDE ITSELF. Page scroll
                is locked while the menu is open, so a panel taller than the
                viewport (phone landscape, ~390px tall) would be cut off with
                no way to reach the bottom. 7.5rem clears the bar above at
                every width. `data-lenis-prevent` lets the wheel/touch through
                to this box while Lenis is stopped.
                `panelHeight` no longer sets a min-height — the panel has real
                content now and sizes itself; the prop only seeds `reach`. */}
            <div
              ref={panelRef}
              data-lenis-prevent
              className="relative max-h-[calc(100svh-7.5rem)] overflow-y-auto overscroll-contain"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
