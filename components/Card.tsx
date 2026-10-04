import PhoneWheel from "./PhoneWheel";

/* A card on section two's rail. Heading, copy, and optionally one piece of
 * media that bleeds past the card's padding and is CROPPED by it.
 *
 * ── THE MEDIA RULES, carried from LZ-2's docs/CARD-MEDIA.md ──────────────
 *
 * Three faults there wore one symptom for four rounds of tuning. All three
 * are designed out here rather than fixed:
 *
 * 1. NEVER width:auto on a <video> or <img>. On a replaced element that means
 *    "use the intrinsic width" — the source's own pixels — not "fill the
 *    container". An <img> took it literally at 2160px and derived 2160px of
 *    height from aspect-ratio. `w-full` below is width:100%, which is the fix.
 *
 * 2. NEVER let a reset's max-width:100% stay. Bleeding past the card is the
 *    entire intent, and max-width beats width, so a cap silently undoes the
 *    bleed and only the sideways shift survives. `max-w-none` is explicit.
 *
 * 3. NEVER loading="lazy" inside the rail. The track is moved by transform,
 *    and a transform does not update the geometry the lazy loader watches, so
 *    an off-screen card's image never fetches at all — paints nothing, no
 *    error. Videos survive it only because an unloaded video is an empty box.
 *
 * THE WRAPPER IS WHAT KEEPS THE CARD'S SIZE ITS OWN. The media refuses to
 * shrink (shrink-0, so it crops rather than squashing out of square). The
 * wrapper is the box that gives way: it takes the room the text leaves, and
 * performs the crop. Resize the media freely — the card will not move.
 */

type Media =
  | { kind: "video"; src: string; eager?: boolean }
  | { kind: "image"; src: string; w: number; h: number }
  | { kind: "wheel" };

export type CardData = {
  heading: [string, string];
  copy: string;
  media?: Media;
};

/* LZ-2's per-media dials, 1:1. Each media has its OWN pair rather than one
   shared set: they sit in different cards against different copy, and sharing
   would mean tuning one moved the other.

   bleed = how far the media reaches PAST the card's padding, per side. At the
   full pad it runs edge to edge. It is square, so this widens and HEIGHTENS
   together, and the extra height is absorbed by the card's overflow.
   gap   = the space above it. NEGATIVE climbs into the copy, which moves the
   cut down the media: more of the top shows, less of the bottom. */
const BLEED: Record<Media["kind"], string> = {
  video: "clamp(40px, 2rem + 1.4vw, 68px)",
  wheel: "clamp(12px, 0.5rem + 0.6vw, 24px)",
  image: "clamp(40px, 2rem + 1.4vw, 68px)",
};

const GAP: Record<Media["kind"], string> = {
  video: "-32px",
  wheel: "-44px",
  image: "-32px",
};

export default function Card({ heading, copy, media }: CardData) {
  return (
    /* overflow-hidden performs the crop. `hidden` not `clip` because of the
       radius: a clipped box still paints children over its own rounded
       corners, so square media would poke out past them. */
    <li
      /* LZ-2 1:1 — height is the lever, width derives from it by 5/7 written
         out as arithmetic. aspect-ratio cannot do it: that needs a DEFINITE
         height, and a min-height is a minimum, not a size — the ratio would
         have nothing to work from and every card would collapse to whatever
         its copy measured. Silently, six cards of six different widths. */
      style={{
        "--card-h": "clamp(500px, 24rem + 34vh, 880px)",
        blockSize: "var(--card-h)",
        inlineSize: "calc(var(--card-h) * 5 / 7)",
      } as React.CSSProperties}
      className="flex max-w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] bg-ink text-paper max-lg:!h-auto max-lg:!w-[min(82vw,21.5rem)] max-lg:aspect-[5/7]"
    >
      <h3 className="px-[clamp(28px,1.5rem+1vw,44px)] pt-[clamp(28px,1.5rem+1vw,44px)] pb-[clamp(12px,0.6rem+0.6vw,22px)] text-[clamp(40px,2rem+2vw,64px)] leading-none tracking-[-0.01em]">
        {heading[0]}
        <br />
        {heading[1]}
      </h3>

      <p className="max-w-[34ch] px-[clamp(28px,1.5rem+1vw,44px)] text-[clamp(16px,0.9rem+0.5vw,20px)] leading-[1.35]">
        {copy}
      </p>

      {media && (
        /* takes the room the text leaves and no more. min-h-0 lets it actually
           shrink inside the flex column — without it a flex child's automatic
           minimum size is its content, and the wrapper would push the card. */
        <div
          /* LZ-2 1:1 — margin-inline: pad - bleed, margin-block-start: gap.
             A NEGATIVE gap pulls the media up into the copy; the card clips,
             so that moves the CUT down the media. Each media carries its own
             pair: card one's video and card two's wheel sit against different
             copy, and sharing would mean tuning one moved the other. */
          style={{
            marginInline: `calc(clamp(28px, 1.5rem + 1vw, 44px) - ${BLEED[media.kind]})`,
            marginBlockStart: GAP[media.kind],
          }}
          className="relative hidden min-h-0 flex-1 overflow-hidden lg:block"
          aria-hidden="true"
        >
          {media.kind === "wheel" ? (
            <PhoneWheel />
          ) : media.kind === "video" ? (
            <video
              src={media.src}
              autoPlay
              muted
              loop
              playsInline
              /* metadata for the first card, which is on screen as the section
                 arrives; none for the rest, which sit off to the right. */
              preload={media.eager ? "metadata" : "none"}
              /* LZ-2 1:1. SQUARE, matching the 1080x1080 source: width is
                 whatever the inset leaves and aspect-ratio derives the height.
                 w-full not w-auto — auto on a replaced element means the
                 source's own pixel width. max-w-none because the reset's
                 max-width:100% beats width and silently re-caps the bleed.
                 shrink-0 so it CROPS rather than squashing out of square. */
              className="block aspect-square w-full max-w-none shrink-0 rounded-[0.75rem] object-cover"
            />
          ) : (
            <img
              src={media.src}
              width={media.w}
              height={media.h}
              alt=""
              decoding="async"
              /* same rules as the video above, and for the same reasons —
                 but its own tokens, never shared. */
              className="block aspect-square w-full max-w-none shrink-0 rounded-[0.75rem] object-cover"
            />
          )}
        </div>
      )}
    </li>
  );
}
