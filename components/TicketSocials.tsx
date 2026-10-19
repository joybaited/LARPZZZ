"use client";

import { useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import PillButton from "@/components/PillButton";
import { SITE_URL, SOCIALS, TELEGRAM, UPDATES } from "@/lib/site";

/* The ticket strip's contents: a QR that cycles through the socials, the
 * icons to pick one, the latest updates, and a Telegram CTA.
 *
 * ⚠ THE QR IS BOTH SCANNABLE AND A LINK. It is generated from each social's
 * real `href` (SITE_URL while that href is still a "#" placeholder), drawn as
 * one SVG path so it stays crisp at any size, and wrapped in an <a> — a phone
 * cannot scan its own screen, so on a phone it is simply a button.
 *
 * ⚠ ERROR CORRECTION "H" IS WHAT PAYS FOR THE ICON IN THE MIDDLE. H recovers
 * ~30% of the codewords, but a centre badge damages several at once, so in
 * practice it must stay small — see the badge's own note. Drop to "M" and
 * the badge has to go.
 *
 * ⚠ ALL FOUR CODES ARE RENDERED AND CROSSFADED, not regenerated per tick —
 * they are computed once in useMemo and swapping is just opacity.
 *
 * Cycles every 3.2s; hovering or focusing the strip holds it, and reduced
 * motion turns the cycle off entirely (the icons still switch it). */

const INK = "#3D065F";
const PAPER = "#f7ecff";
const VIOLET = "#EAC2FF";
const QUIET = 4; // the spec's quiet zone, in modules

function qrPath(text: string) {
  const qr = qrcode(0, "H");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
  return { n, d };
}

export default function TicketSocials() {
  const codes = useMemo(
    () => SOCIALS.map((s) => qrPath(s.href.startsWith("http") ? s.href : SITE_URL)),
    [],
  );
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SOCIALS.length), 3200);
    return () => clearInterval(id);
  }, [held]);

  const s = SOCIALS[active];

  return (
    <div
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="flex items-center gap-[clamp(12px,3vw,20px)] px-4 py-4 md:h-full md:flex-col md:items-stretch md:gap-[clamp(10px,1.4vh,20px)] md:p-[clamp(14px,1.4vw,28px)] md:pl-[clamp(18px,1.8vw,32px)]"
      style={{ color: INK }}
    >
      <p className="m-0 hidden text-[clamp(12px,0.45rem+0.3vw,0.8125rem)] font-semibold tracking-[0.1em] uppercase opacity-70 md:block">
        Scan or tap to follow
      </p>

      {/* the code. Square, capped by height too so it never pushes the rest
          of the strip off a short screen. */}
      <a
        href={s.href.startsWith("http") ? s.href : SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${s.label}`}
        className="relative block aspect-square size-[clamp(88px,28vw,128px)] shrink-0 rounded-[clamp(10px,1vw,16px)] border-[3px] border-black p-[4%] transition-transform duration-300 hover:-rotate-2 md:size-auto md:w-full md:max-w-[min(100%,32svh)] md:self-center"
        style={{ background: PAPER }}
      >
        <span className="relative block size-full">
          {codes.map((q, i) => (
            <svg
              key={SOCIALS[i].label}
              aria-hidden="true"
              viewBox={`${-QUIET} ${-QUIET} ${q.n + QUIET * 2} ${q.n + QUIET * 2}`}
              shapeRendering="crispEdges"
              className="absolute inset-0 size-full transition-opacity duration-500 motion-reduce:transition-none"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              <path d={q.d} fill={INK} />
            </svg>
          ))}
          {/* the centre badge: the active platform's mark.
              ⚠ 18% AND NO px RING. It was 22% plus a fixed 2px ring, and the
              ring is what broke the small code: on a 101px phone QR it grew
              the badge to ~13% of the code's area — past what "H" recovers —
              and it stopped decoding, while the same badge on a 238px desktop
              QR (~10%) still read. 18% with no ring covers the same small
              share at every size. Measured with jsQR at both. */}
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[22%]"
            style={{ background: PAPER }}
          >
            <svg viewBox="0 0 24 24" className="size-[72%]">
              <path d={s.icon} fill={INK} />
            </svg>
          </span>
        </span>
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-none md:gap-[clamp(8px,1.2vh,16px)]">
        {/* which platform the code is for */}
        <p className="m-0 font-display text-[clamp(18px,0.8rem+0.8vw,1.75rem)] leading-none uppercase md:text-center" aria-live="polite">
          {s.label}
        </p>

        {/* the icons. The active one is filled; clicking picks it. */}
        {/* wraps to two rows at 768-1023, where the strip is ~165px and
            four 44px targets do not fit on one line. */}
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 md:justify-center">
          {SOCIALS.map((so, i) => (
            <li key={so.label}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${so.label} code`}
                aria-pressed={i === active}
                className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-black transition-colors duration-300"
                style={{ background: i === active ? INK : "transparent" }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[45%]">
                  <path d={so.icon} fill={i === active ? VIOLET : INK} />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* phones: the CTA sits beside the code — there is no room for the
            update cards in an 18svh band, and the nav already carries them. */}
        <div className="md:hidden">
          <PillButton
            href={TELEGRAM.href}
            fill={INK}
            color={VIOLET}
            className="min-h-11 px-5 py-2.5 text-[15px] leading-none font-semibold"
          >
            Join Telegram
          </PillButton>
        </div>
      </div>

      {/* desktop: the latest updates, then the CTA pinned to the bottom.
          From lg only — at 768-1023 the strip is ~165px wide. */}
      <div className="mt-auto hidden flex-col gap-[clamp(8px,1vh,12px)] md:flex">
        <p className="m-0 hidden text-[clamp(12px,0.45rem+0.3vw,0.8125rem)] font-semibold tracking-[0.1em] uppercase opacity-70 lg:block">
          Latest updates
        </p>
        <ul className="m-0 hidden list-none flex-col gap-2 p-0 lg:flex">
          {UPDATES.items.map((u) => (
            <li
              key={u}
              className="flex items-start gap-2 rounded-[12px] border-2 border-black p-[clamp(10px,0.9vw,14px)] text-[clamp(12px,0.5rem+0.35vw,0.9375rem)] leading-snug"
              style={{ background: PAPER }}
            >
              <span
                className="mt-[0.1em] shrink-0 rounded-full px-2 py-[1px] text-[max(11px,0.72em)] font-semibold tracking-[0.06em] uppercase"
                style={{ background: INK, color: VIOLET }}
              >
                New
              </span>
              {u}
            </li>
          ))}
        </ul>
        <PillButton
          href={TELEGRAM.href}
          fill={INK}
          color={VIOLET}
          className="min-h-11 w-full px-4 py-3 leading-none font-semibold"
          style={{ fontSize: "clamp(14px, 0.5rem + 0.45vw, 1.0625rem)" }}
        >
          Join Telegram
        </PillButton>
      </div>
    </div>
  );
}
