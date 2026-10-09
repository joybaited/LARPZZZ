"use client";

/* The nav wordmark, which swaps for the Phantom ghost while hovered.
 *
 * ⚠ A CLIENT COMPONENT FOR TWO HANDLERS, AND ONLY FOR THEM. sections/Hero.tsx
 * is a server component; an onMouseEnter there is the "Event handlers cannot
 * be passed to Client Component props" error. Rather than mark the whole hero
 * `use client` — it is mostly static markup and a large config — the
 * interactive part is this.
 *
 * ⚠ THE SWAP IS CSS, NOT STATE. `group-hover:` does both fades with no
 * re-render. The handlers exist ONLY to start and stop playback: without
 * `autoPlay` the video would fade in frozen, and with it the video would
 * decode forever behind opacity:0 — the card videos were measured still
 * running ~121 frames per 2.5s while thousands of px off screen.
 */
export default function HoverGhost({
  text,
  src,
  size,
  color,
  ghost,
  ghostY,
  x,
  y,
}: {
  text: string;
  src: string;
  size: number;
  color: string;
  ghost: number;
  ghostY: number;
  x: number;
  y: number;
}) {
  return (
    /* ⚠ THE GHOST SITS ON THE WORDMARK, NOT BESIDE IT, and that is what keeps
       the hover honest. An earlier pass hung it off the word's right edge;
       the ghost is absolute but still a child, so the box stretched to cover
       it and `group-hover` stayed open whenever the pointer was anywhere in
       that wider area — leaving the word sideways never faded it out.
       Stacked, the box is exactly the wordmark and the hover ends where the
       word does.

       ⚠ `inline-grid` WITH BOTH CHILDREN IN ONE CELL. This is what lets them
       overlap without either leaving the flow: the box is sized by the
       wordmark (the taller ghost is allowed to overflow it), so swapping
       them cannot resize the nav or shift the word by a pixel. */
    <div
      className="group absolute inline-grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={(e) => {
        const v = e.currentTarget.querySelector("video");
        if (v) void v.play().catch(() => {});
      }}
      onMouseLeave={(e) => {
        const v = e.currentTarget.querySelector("video");
        if (!v) return;
        v.pause();
        /* back to frame one, so the next hover starts at the top of the loop
           rather than wherever the pointer happened to leave it. */
        v.currentTime = 0;
      }}
    >
      {/* ⚠ FADES OUT SLOWLY, COMES BACK INSTANTLY — Kez's. The two durations
          are deliberately different: 420ms out so the swap reads as a
          crossfade, 0ms back so releasing the pointer snaps the wordmark
          into place rather than making you wait for it. */}
      <span
        /* ⚠ TWO DURATIONS, ONE PROPERTY. The transition on the RESTING
           state governs the way BACK (hover released), and the one on the
           hovered state governs the way OUT. So duration-0 here plus
           group-hover:duration-[420ms] means: fade out over 420ms, return
           instantly — which is exactly what Kez asked for. Putting a single
           duration on both would make the return as slow as the exit. */
        className="font-display col-start-1 row-start-1 block whitespace-nowrap opacity-100 transition-opacity duration-0 [transition-timing-function:cubic-bezier(0.33,0,0.2,1)] group-hover:opacity-0 group-hover:duration-[420ms] motion-reduce:transition-none"
        style={{ fontSize: `${size}px`, color }}
      >
        {text}
      </span>

      {/* ⚠ pointer-events-none. It is stacked over the wordmark, so without
          this it would take the hover off the very element whose hover is
          keeping it visible — the two would fight and flicker.

          It is allowed to be taller than the row: grid lets it overflow the
          cell, so `ghost` is not capped by the wordmark's height the way the
          old roller capped it by a cell. */}
      <video
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 block w-auto max-w-none opacity-0 transition-opacity duration-0 [transition-timing-function:cubic-bezier(0.33,0,0.2,1)] group-hover:opacity-100 group-hover:duration-[420ms] motion-reduce:transition-none"
        style={{ height: `${ghost}px`, marginTop: `${ghostY}px` }}
      />
    </div>
  );
}
