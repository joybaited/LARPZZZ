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

export default function Card({ heading, copy, media }: CardData) {
  return (
    /* overflow-hidden performs the crop. `hidden` not `clip` because of the
       radius: a clipped box still paints children over its own rounded
       corners, so square media would poke out past them. */
    <li className="flex aspect-[5/7] w-[min(82vw,28rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] bg-ink text-paper">
      <h3 className="px-(--space-l) pt-(--space-l) text-2 leading-[0.95] tracking-[-0.01em]">
        {heading[0]}
        <br />
        {heading[1]}
      </h3>

      <p className="max-w-[34ch] px-(--space-l) pt-(--space-s) text-base leading-[1.35] opacity-70">
        {copy}
      </p>

      {media && (
        /* takes the room the text leaves and no more. min-h-0 lets it actually
           shrink inside the flex column — without it a flex child's automatic
           minimum size is its content, and the wrapper would push the card. */
        <div
          className="relative mt-(--space-m) min-h-0 flex-1 overflow-hidden [container-type:inline-size]"
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
              className="absolute inset-x-[-12%] bottom-[-18%] h-auto w-[124%] max-w-none rounded-[0.75rem] object-cover"
            />
          ) : (
            <img
              src={media.src}
              width={media.w}
              height={media.h}
              alt=""
              decoding="async"
              className="absolute inset-x-[-12%] bottom-[-18%] h-auto w-[124%] max-w-none rounded-[0.75rem] object-cover"
            />
          )}
        </div>
      )}
    </li>
  );
}
