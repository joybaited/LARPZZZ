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
      /* Height is the lever, width derives from it by a ratio. aspect-ratio
         cannot do it: that needs a DEFINITE height, and a min-height is a
         minimum, not a size — the ratio would have nothing to work from and
         every card would collapse to whatever its copy measured. Silently,
         six cards of six different widths.

         ⚠ TWO DIALS, AND THEY ARE INDEPENDENT. LZ-2 writes the ratio inline
         as `5 / 7`, which ties the width to the height: shorten the card at a
         fixed ratio and it gets NARROWER too. Kez asked for shorter AND wider
         in one pass, so the ratio is its own token and the two move
         separately.

         ⚠ ONE RULE FOR ALL SIX CARDS. Both dials live here, on the shared
         component — there is no per-card override anywhere, so a change here
         is a change to every card by construction. That is the point: six
         cards that are nearly the same size read as a mistake rather than a
         design.

         --card-h  was clamp(500px, 24rem + 34vh, 880px). Down ~12%.
         --card-r  was 5/7 = 0.714 inline. Now 0.84 — wider. */
      style={{
        "--card-h": "clamp(440px, 21rem + 30vh, 775px)",
        "--card-r": "0.84",
        blockSize: "var(--card-h)",
        inlineSize: "calc(var(--card-h) * var(--card-r))",
      } as React.CSSProperties}
      /* below lg the card is width-led instead: a fixed width and the ratio
         derives the height, so the same 0.84 holds at every size rather than
         the old 5/7 surviving on mobile. */
      /* `relative` is what the media anchors to — it is absolute and spans
         from the card's top to the splitter. */
      className="relative flex max-w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] bg-ink text-paper max-lg:!h-auto max-lg:!w-[min(82vw,21.5rem)] max-lg:aspect-[0.84]"
    >
      {/* ⚠ THE MEDIA FILLS THE REGION ABOVE THE SPLITTER — Kez's.
          It used to sit AFTER the copy and climb back up into it with a
          negative margin, which is LZ-2's arrangement; the restyle moved the
          text to the card's foot, so that space no longer exists and the
          negative-margin dials went with it.

          ⚠ ABSOLUTE, SO IT ADDS NO HEIGHT. The splitter's own `mt-[70%]` is
          what defines where the line sits, and the media must not be the
          thing that decides it — as a flex child it would push the line down
          by its own height and the offset would stop meaning anything. It is
          taken out of flow and told to span from the card's top to the line
          instead, so the line stays exactly where its margin puts it and the
          media sizes itself to whatever room that leaves.

          `bottom: 30%` is the splitter's `mt-[70%]` expressed from the other
          end — both resolve against the card's WIDTH, so they meet at the
          same place and track each other. Move the line and this follows.

          ⚠ NOT `aspect-square`. LZ-2 sizes the media by its 1:1 source and
          lets the card's overflow eat the excess; here the region is a known
          box, so object-cover crops to it — same intent (crop, never squash)
          against a box the card actually has. */}
      {media && (
        <div
          /* bleeds past the card's padding by the per-media dial and is
             CROPPED by the card. margin-inline: pad - bleed, 1:1 from LZ-2.
             The GAP dial is not used here — it was the negative climb into
             the copy, and there is no copy above this any more. */
          /* ⚠ THE HEIGHT IS 70% OF THE CARD'S WIDTH, NOT ITS HEIGHT, because
             that is what the splitter's `mt-[70%]` resolves against — a
             percentage margin uses the containing block's INLINE size in both
             axes. An earlier pass set `bottom: 30%`, which resolves against
             the HEIGHT instead, so the two met at different places and the
             media ran past the line into the heading. Both are stated against
             the width now and the bottom edge lands exactly on the rule. */
          style={{
            insetInline: `calc(clamp(28px, 1.5rem + 1vw, 44px) - ${BLEED[media.kind]})`,
            blockSize: "calc(var(--card-h) * var(--card-r) * 0.7)",
          }}
          /* `isolate` gives it its own stacking context so nothing inside can
             paint over the text below, and `clip` crops the wheel's phones,
             which are deliberately taller than their box. */
          className="absolute top-0 hidden isolate overflow-clip lg:block"
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
              /* w-full not w-auto — auto on a replaced element means the
                 source's own pixel width, not "fill the container".
                 max-w-none because the reset's max-width:100% beats width and
                 would silently re-cap the bleed. */
              /* ⚠ THE SOURCES ARE 720x720 SQUARE. In a region wider than it is
                 tall, `contain` fits them to the HEIGHT and pillarboxes the
                 rest — which is why they read as small. This sizes the square
                 by the WIDTH instead and lets the card crop the overflow top
                 and bottom, so the video fills the region.

                 ⚠ NO UPSCALING PAST THE SOURCE. 720px wide is the native
                 frame; the region is ~469 CSS px, so even at 2x DPR this is
                 inside the source's own pixels and stays sharp. Nothing is
                 re-encoded and the files are untouched — the enlargement is
                 CSS layout, not a resample. */
              className="absolute top-1/2 left-1/2 block aspect-square w-[78%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-[0.75rem] object-cover"
            />
          ) : (
            <img
              src={media.src}
              width={media.w}
              height={media.h}
              alt=""
              decoding="async"
              /* ⚠ NEVER loading="lazy" in the rail: the track moves by
                 transform, which does not update the geometry the lazy loader
                 watches, so an off-screen card's image never fetches at all —
                 paints nothing, no error. */
              className="block h-full w-full max-w-none rounded-[0.75rem] object-cover"
            />
          )}
        </div>
      )}

      {/* ⚠ TEMPORARY SPLITTER — to be removed. Kez's, for styling.
          A full-bleed horizontal rule across the card.

          ⚠ THE OFFSET IS A PERCENTAGE OF THE CARD'S WIDTH, NOT ITS HEIGHT.
          A percentage margin resolves against the containing block's INLINE
          size in both axes — that is CSS, not a typo — so this is the dial
          but it is not a height fraction. At --card-r 0.84 the card is 0.84
          as wide as it is tall, so 50% of the width lands at ~42% of the
          height, and each point here moves the line ~0.84 points down the
          card. 70% sits it at ~59% of the height, above the heading.

          `h-px` not `border-t`: a border would sit inside the card's own
          rounded corners and the radius would nick both ends. This is its own
          box, so it runs edge to edge.

          ⚠ THE OFFSET IS UNCONDITIONAL. It defines where the line sits on all
          six cards, with or without media — the media fills the region above
          it and never moves it. */}
      <div className="mt-[70%] h-px w-full shrink-0 bg-paper/30" aria-hidden="true" />

      {/* ⚠ THE HEADING IS PINNED, NOT THE BLOCK. Kez's — the six headings
          must line up across the rail.

          The block used to be bottom-pinned as a unit, which lined up the
          last line of COPY instead: card two's copy runs to three lines where
          the others take two, so its taller block grew UPWARD and carried its
          heading ~25px above the rest. Bottom-pinning anything whose height
          depends on copy length cannot hold an alignment.

          So the heading is pinned to a fixed line and the copy hangs below it
          at a fixed gap, which is the opposite: `mt-auto` is on the HEADING
          and takes all the slack above it, so the heading lands at the same
          height on every card and a longer copy spends the room BELOW it.

          ⚠ THE SPARE ROOM IS NOW AT THE FOOT, AND IT IS DELIBERATE. pb is the
          MINIMUM clearance; a two-line card simply sits further off the card's
          bottom edge than a three-line one. Keeping both the headings and the
          last copy line aligned is only possible if every copy is the same
          length, which is a content constraint, not a layout one. */}
      <div className="flex min-h-0 flex-1 flex-col px-[clamp(28px,1.5rem+1vw,44px)] pb-[clamp(34px,1.8rem+1.2vw,52px)]">
        {/* ⚠ ONE LINE, NOT TWO — Kez's. The `heading` prop is still the
            [string, string] pair LZ-2 split across a <br />; it is joined
            with a space here instead, so the data is unchanged and the break
            is a rendering decision. `text-balance` keeps a heading that is
            too long for the card from dropping one short word alone. */}
        <h3 className="mt-auto text-[clamp(25px,1.25rem+1vw,36px)] leading-[1.05] tracking-[-0.01em] text-balance">
          {heading.join(" ")}
        </h3>

        {/* ⚠ THREE LINES ARE RESERVED WHETHER OR NOT THEY ARE USED — this is
            what holds the headings level. The copy sits BELOW the pinned
            heading, so without a fixed box card two's third line would push
            its heading up and undo the alignment.

            3 lines x 1.35 leading, in em so it tracks the font size. A copy
            that runs longer than three lines will overflow it — the card
            already clips, and at that point the copy wants shortening rather
            than the box growing, since growing it is what broke the
            alignment. The gap above was clamp(8px, 0.4rem+0.4vw, 14px). */}
        <p
          style={{ blockSize: "calc(3 * 1.35em)" }}
          className="mt-[clamp(16px,0.8rem+0.8vw,26px)] max-w-[34ch] text-[clamp(16px,0.9rem+0.5vw,20px)] leading-[1.35]"
        >
          {copy}
        </p>
      </div>

    </li>
  );
}
