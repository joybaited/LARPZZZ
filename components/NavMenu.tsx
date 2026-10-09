"use client";

import { useEffect, useRef, useState } from "react";

/* The nav's hamburger button and the panel it opens.
 *
 * It replaces three decorative `kind: "line"` elements that sat in HERO.els —
 * those were aria-hidden divs with no button, no state and no keyboard path,
 * so they looked like a menu and did nothing.
 *
 * ── WHY IT IS BUILT THIS WAY ─────────────────────────────────────────────
 *
 * ⚠ `aria-expanded` IS THE STATE, AND THE CSS READS IT. The bars animate from
 * the attribute, not from a second `.is-open` class — one source of truth, so
 * what a screen reader announces and what the icon shows cannot drift apart.
 * That is the standard pattern and it is also less code than keeping a class
 * in sync.
 *
 * ⚠ THE LABEL DOES NOT CHANGE TO "CLOSE". The accessible name stays "Menu"
 * and `aria-expanded` carries the open/closed state. Swapping the name is the
 * common mistake: it makes the button read as a different control depending
 * on when you meet it.
 *
 * ⚠ THE BARS TRANSLATE TO CENTRE, THEN ROTATE. Both on one transform, so they
 * are one composited change rather than two. Rotating without first collapsing
 * the gap gives an X with a visible offset where the arms cross.
 *
 * ⚠ THE MIDDLE BAR FADES ON A SHORTER DURATION than the outer two move. It is
 * gone before the arms reach the middle, so nothing passes through it.
 */
export default function NavMenu({
  x,
  y,
  color,
  items,
  panelFill,
}: {
  x: number;
  y: number;
  color: string;
  items: string[];
  panelFill: string;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

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
    /* a click anywhere outside closes it too. `pointerdown` rather than
       `click` so it fires before focus moves, and capture so a handler inside
       the panel cannot stop it reaching here. */
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open]);

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <button
        ref={btn}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="nav-menu-panel"
        onClick={() => setOpen((o) => !o)}
        /* ⚠ A 44px TARGET AROUND A 22px ICON. The bars are small; the button
           is not. 44 is the usual minimum for a touch target, and the padding
           is what provides it without drawing anything. */
        className="group grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0"
      >
        {/* the three bars, stacked in one grid cell so they share a centre
            and the rotation has a common origin. */}
        <span className="relative block h-[14px] w-[22px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute left-0 block h-[2px] w-full rounded-full transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
              style={{
                background: color,
                top: "50%",
                /* resting: top bar up, middle centred, bottom bar down.
                   open: outer two collapse to the centre and cross; the
                   middle fades. The -50% keeps each bar centred on `top` so
                   the translate is measured from the middle, not the edge. */
                transform: open
                  ? i === 1
                    ? "translateY(-50%)"
                    : `translateY(-50%) rotate(${i === 0 ? 45 : -45}deg)`
                  : `translateY(calc(-50% + ${(i - 1) * 7}px))`,
                opacity: open && i === 1 ? 0 : 1,
                /* the middle bar's fade is quicker than the arms' travel, so
                   it is gone before they arrive. */
                transitionDuration: i === 1 ? "160ms" : "300ms",
              }}
            />
          ))}
        </span>
      </button>

      {/* ⚠ THE PANEL IS NOT UNMOUNTED, IT IS HIDDEN. `hidden` until open keeps
          it out of the accessibility tree and off the tab order entirely —
          cheaper and more correct than rendering a visually-hidden element
          that a screen reader can still reach.

          It is absolute so opening it cannot resize the nav bar. */}
      <div
        ref={panel}
        id="nav-menu-panel"
        hidden={!open}
        className="absolute top-full left-0 mt-3 min-w-44 rounded-xl p-2 shadow-lg"
        style={{ background: panelFill }}
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {/* ⚠ KEYED BY INDEX, NOT BY LABEL. The three placeholders are all
              the literal string "Text", so a label key collides and React
              warns about duplicate keys. The list is static and never
              reordered, filtered or inserted into, which is exactly the case
              where an index key is correct rather than a smell. Real labels
              would not collide, but they also would not need the key to
              change. */}
          {items.map((label, i) => (
            <li key={i}>
              <a
                href="#"
                className="block rounded-lg px-3 py-2 text-base no-underline transition-colors duration-150 hover:bg-white/10"
                style={{ color }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
