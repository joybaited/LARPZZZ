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

         --card-h  the restyle took it down ~12%; Kez asked for the cards
                   enlarged again, so it is back to clamp(500px, 24rem +
                   34vh, 880px) and the type inside went up with it.
         --card-r  was 5/7 = 0.714 inline. Now 0.84 — wider. */
      style={{
        "--card-h": "clamp(430px, 20rem + 29vh, 720px)",
        "--card-r": "0.88",
        /* ⚠ ONE TOKEN, TWO USERS. The media's height and the spacer's margin
           both have to land on this exact fraction or they stop meeting — the
           comments below said so, but nothing enforced it and it was written
           twice, as 0.7 and as 70%.

           ⚠ THIS IS THE GAP ABOVE THE HEADING, and it is the dial for it.
           Raising it moves the media's bottom edge DOWN, toward the text, so
           the heading crowds the video; lowering it opens that gap. The foot
           padding cannot do this job — `mt-auto` on the heading means the
           text block is pinned to the card's floor, so changing pb slides the
           whole block rather than the space above it. */
        "--card-m": "0.70",
        blockSize: "var(--card-h)",
        inlineSize: "calc(var(--card-h) * var(--card-r))",
      } as React.CSSProperties}
      /* below lg the card is width-led instead: a fixed width and the ratio
         derives the height, so the same 0.84 holds at every size rather than
         the old 5/7 surviving on mobile. */
      /* `relative` is what the media anchors to — it is absolute and spans
         from the card's top to the media/text boundary. */
      className="relative flex max-w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] bg-[#EAC2FF] text-[#3D065F] [container-type:inline-size] max-lg:!h-auto max-lg:!w-[min(82vw,21.5rem)] max-lg:aspect-[0.88]"
    >
      {/* ⚠ THE MEDIA FILLS THE REGION ABOVE THE TEXT — Kez's.
          It used to sit AFTER the copy and climb back up into it with a
          negative margin, which is LZ-2's arrangement; the restyle moved the
          text to the card's foot, so that space no longer exists and the
          negative-margin dials went with it.

          ⚠ ABSOLUTE, SO IT ADDS NO HEIGHT. The spacer's own `mt-[70%]` is
          what defines where the boundary sits, and the media must not be the
          thing that decides it — as a flex child it would push the boundary
          down by its own height and the offset would stop meaning anything.
          It is taken out of flow and told to span from the card's top to that
          boundary instead, so the boundary stays exactly where its margin
          puts it and the media sizes itself to whatever room that leaves.

          `bottom: 30%` is the spacer's `mt-[70%]` expressed from the other
          end — both resolve against the card's WIDTH, so they meet at the
          same place and track each other. Move the spacer and this follows.

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
             that is what the spacer's `mt-[70%]` resolves against — a
             percentage margin uses the containing block's INLINE size in both
             axes. Using 100cqw matches both desktop and mobile inline size. */
          style={{
            insetInline: `calc(clamp(28px, 1.5rem + 1vw, 44px) - ${BLEED[media.kind]})`,
            blockSize: "calc(var(--card-m) * 100cqw)",
          }}
          /* `isolate` gives it its own stacking context so nothing inside can
             paint over the text below, and `clip` crops the wheel's phones,
             which are deliberately taller than their box. */
          className="absolute top-0 isolate overflow-clip"
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
              /* ⚠ THE SOURCES ARE TRANSPARENT (VP9 + yuva420p) AND HAVE NO
                 RADIUS. They used to be opaque with a black surround, which
                 was invisible on the old `bg-ink` card and became a black box
                 the moment the card went purple. They were re-encoded from the
                 1080px originals with the alpha plane kept.

                 ⚠ ffprobe REPORTS `yuv420p` ON A TRANSPARENT VP9 FILE. The
                 alpha rides in a side-channel the probe does not report, so
                 the pixel format is NOT how you check this — the repo's old
                 files and the transparent originals both read `yuv420p`.
                 Decode a frame with `-vcodec libvpx-vp9 -pix_fmt rgba` and
                 read the alpha values; opaque gives one value, transparent
                 gives ~250 with the corners at 0.

                 No `rounded-*` here any more: the radius existed to round the
                 black box's corners. With transparency there is no box, and a
                 radius would clip the subject instead.

                 ⚠ `object-contain`, AND THE REASON FLIPPED WHEN THEY GAINED
                 ALPHA. This used to be `cover` at 78% width, because the
                 sources were opaque: `contain` in a region wider than it is
                 tall fits them to the HEIGHT and pillarboxes the rest, and a
                 pillarbox of BLACK read as the video being small in a box.

                 Transparent, a pillarbox is nothing at all — just card. So
                 `contain` now costs nothing and is strictly better: `cover`
                 on a square in a wide region crops the phone's top and
                 bottom, which is the one thing that must not happen to the
                 subject. 88% so it fills the region rather than floating in
                 it.

                 ⚠ NO UPSCALING PAST THE SOURCE. 720px is the native frame.
                 At 1440 the card is ~580 wide, so 88% is ~510 CSS px and
                 `contain` fits to the region's HEIGHT (~311) anyway — well
                 inside the source even at 2x DPR. Nothing is re-encoded and
                 the files are untouched; the enlargement is CSS layout, not
                 a resample. */
              className="absolute top-1/2 left-1/2 block aspect-square w-[88%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
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

      {/* THE MEDIA/TEXT BOUNDARY. The visible rule that used to sit here is
          gone — Kez's, the line between the copy and the media above it was
          removed. The SPACER stays, because it is not decoration: it is what
          defines where the media region ends and the text block begins, and
          the media's own `blockSize` is stated against the same 70% so the
          two meet. Delete this and the media has no bottom edge to size to.

          ⚠ THE OFFSET IS A PERCENTAGE OF THE CARD'S WIDTH, NOT ITS HEIGHT.
          A percentage margin resolves against the containing block's INLINE
          size in both axes — that is CSS, not a typo — so this is the dial
          but it is not a height fraction. At --card-r 0.84 the card is 0.84
          as wide as it is tall, so 50% of the width lands at ~42% of the
          height, and each point here moves the boundary ~0.84 points down
          the card. 70% sits it at ~59% of the height, above the heading.

          ⚠ THE OFFSET IS UNCONDITIONAL. It defines the boundary on all six
          cards, with or without media — the media fills the region above it
          and never moves it. */}
      <div style={{ marginBlockStart: "calc(var(--card-m) * 100%)" }} className="shrink-0" aria-hidden="true" />

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
      <div className="flex min-h-0 flex-1 flex-col px-[clamp(26px,1.4rem+0.9vw,40px)] pb-[clamp(12px,0.6rem+0.4vw,18px)]">
        {/* ⚠ ONE LINE, NOT TWO — Kez's. The `heading` prop is still the
            [string, string] pair LZ-2 split across a <br />; it is joined
            with a space here instead, so the data is unchanged and the break
            is a rendering decision. `text-balance` keeps a heading that is
            too long for the card from dropping one short word alone. */}
        <h3 className="mt-auto font-display text-[clamp(27px,1.35rem+1.1vw,39px)] leading-[1.0] tracking-[-0.015em] text-balance uppercase">
          {heading.join(" ")}
        </h3>

        {/* ⚠ THREE LINES ARE RESERVED WHETHER OR NOT THEY ARE USED — this is
            what holds the headings level. The copy sits BELOW the pinned
            heading, so without a fixed box card two's third line would push
            its heading up and undo the alignment.

            3 lines x 1.4 leading, in em so it tracks the font size. ⚠ THIS
            MUST MATCH  BELOW — they are the same number stated
            twice, and a box shorter than the leading clips every copy. A copy
            that runs longer than three lines will overflow it — the card
            already clips, and at that point the copy wants shortening rather
            than the box growing, since growing it is what broke the
            alignment. The gap above was clamp(8px, 0.4rem+0.4vw, 14px). */}
        <p
          style={{ blockSize: "calc(3 * 1.4em)" }}
          className="mt-[clamp(10px,0.5rem+0.5vw,16px)] max-w-[36ch] text-[clamp(16px,0.9rem+0.45vw,20px)] leading-[1.4]"
        >
          {copy}
        </p>
      </div>

    </li>
  );
}
