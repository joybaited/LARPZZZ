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
      className="group grid place-items-center"
      /* ⚠ POSITIONED BY THE PARENT NOW, NOT BY left/top HERE. This carried
         `absolute inline-grid` with a left/top in the style prop, and
         `inline-grid` won the cascade — computed position was `static`, so
         left, top and the centring translate were ALL ignored and the
         wordmark simply sat in flow against the hamburger. The nav places it
         now and this is only the swap. */
      style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
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
      /* ⚠ TOUCH HAS NO HOVER, so on a phone this component did nothing: the
         ghost never played and `group-hover` never opened. A touch start
         plays it and the end stops it, which gives a tap the same crossfade
         a hover gives — and costs desktop nothing, since a mouse never fires
         these. The css below pairs them with `group-active`. */
      onTouchStart={(e) => {
        const v = e.currentTarget.querySelector("video");
        if (v) void v.play().catch(() => {});
      }}
      onTouchEnd={(e) => {
        const v = e.currentTarget.querySelector("video");
        if (!v) return;
        v.pause();
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
        className="font-display col-start-1 row-start-1 block whitespace-nowrap opacity-100 transition-opacity duration-0 [transition-timing-function:cubic-bezier(0.33,0,0.2,1)] group-hover:opacity-0 group-hover:duration-[420ms] group-active:opacity-0 group-active:duration-[420ms] motion-reduce:transition-none"
        /* ⚠ FLUID, NOT A PX LUMP. `size` is 28.7px tuned against the 1536
           nav; on a 360 phone the nav bar itself is ~48px tall and a fixed
           28.7px wordmark crowds it. The px value is kept as the CEILING and
           a vw term carries it down — the desktop value is unchanged because
           the clamp saturates at its max well before 1024. */
        style={{ fontSize: `clamp(15px, 4.6vw, ${size}px)`, color }}
      >
        {text}
      </span>

      {/* ⚠ pointer-events-none. It is stacked over the wordmark, so without
          this it would take the hover off the very element whose hover is
          keeping it visible — the two would fight and flicker.

          It is allowed to be taller than the row: grid lets it overflow the
          cell, so `ghost` is not capped by the wordmark's height the way the
          old roller capped it by a cell. */}
      {/* ⚠ TWO SOURCES, WEBM FIRST — same reason as the feature cards. The
          webm is VP9 with alpha, which Safari cannot decode, so on the
          owner's phone the ghost was simply never visible. The mp4 is the
          same footage matted onto the nav's own fill (#3D065F), opaque and
          H.264, so it plays everywhere and sits invisibly on that bar.
          A browser takes the first source it can play: order is the fix. */}
      <video
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 block w-auto max-w-none opacity-0 transition-opacity duration-0 [transition-timing-function:cubic-bezier(0.33,0,0.2,1)] group-hover:opacity-100 group-hover:duration-[420ms] group-active:opacity-100 group-active:duration-[420ms] motion-reduce:transition-none"
        /* same treatment, and the offset scales with it or the ghost drifts
           off the word as the type shrinks. */
        style={{ height: `clamp(24px, 7.4vw, ${ghost}px)`, marginTop: `${ghostY}px` }}
      >
        <source src={src} type="video/webm" />
        <source src={src.replace(/\.webm$/, ".mp4")} type="video/mp4" />
      </video>
    </div>
  );
}
