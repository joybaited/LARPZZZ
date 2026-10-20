/* Shared sticker types + the one render layer every section uses.

   ⚠ TWO ANCHOR MODES, AND THE DIFFERENCE IS THE WHOLE POINT.

   `stage`  — x/y are percentages of the section's stage box. Free-floating
              decoration. A percentage is only proportional while the box it
              measures keeps the same SHAPE, so a stage sticker is correct at
              every width ONLY if that stage is ratio-locked (Testimonials
              does this) or the drift is accepted below lg by hiding it.

   `card`   — x/y are percentages of ONE CARD, and the sticker renders inside
              that card's own container. The card carries
              `[container-type:inline-size]`, so the size is in `cqi` — a
              fraction of the card, not the viewport. This is the only mode
              that survives a layout reflow, because the card is not a fixed
              fraction of the screen (one column at 390, two at 640, three at
              1280). How it works learned this the hard way: a stage-percentage
              width measured 212x184 on a 402x280 card at 1920 — a badge over
              half the card — while the SAME percentage cleared the copy at
              1366. No single tuned number can fix that; the unit has to change.

   ⚠ THE WIDTH OF A STAGE STICKER IS CAPPED IN px. `w` is a percentage of a
   stage that grows faster than the content inside it, so an uncapped
   percentage is the bug above. The cap is the guard rail, not the design —
   tune the proportion, leave the cap alone. */

export type StickerAnchor = "stage" | "card" | "phone" | "heading";

export type Sticker = {
  name: string;
  src: string;
  alt?: string;
  /** % of the stage (anchor "stage"), of the card (anchor "card"), of the phone (anchor "phone"), or of the heading (anchor "heading") */
  x: number;
  y: number;
  /** % of the stage, cqi of the card, % of the phone, or % of the heading */
  w: number;
  rotate?: string;
  z?: number;
  anchor?: StickerAnchor;
  /** anchor "card" only: which card index this rides. */
  card?: number;
  /** px ceiling for a stage sticker's width. */
  cap?: number;
  /** hide below lg. Free-floating stickers have no anchor once the layout
      reflows, so they default to desktop-only; card stickers ride their card
      and default to visible everywhere. */
  desktopOnly?: boolean;
};

/** Stage-anchored, phone-anchored, or heading-anchored stickers for a section. Mount inside the SAME box the
    tuner measures, as a child of the section's stage, phone, or heading. */
export function StickerLayer({
  stickers,
  hide,
  anchor = "stage",
}: {
  stickers?: Sticker[];
  hide?: boolean;
  anchor?: StickerAnchor;
}) {
  if (hide || !stickers?.length) return null;
  return (
    <>
      {stickers
        .filter((s) => (s.anchor ?? "stage") === anchor)
        .map((s) => (
          <div
            key={s.name}
            aria-hidden="true"
            className={`pointer-events-none absolute ${
              s.desktopOnly === false || s.anchor === "heading" ? "block" : "hidden lg:block"
            }`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.cap && (s.anchor ?? "stage") === "stage" ? `min(${s.w}%, ${s.cap}px)` : `${s.w}%`,
              zIndex: s.z ?? 20,
              transform: `translate(-50%, -50%) rotate(${s.rotate ?? "0deg"})`,
            }}
          >
            <img
              loading="lazy"
              decoding="async"
              src={s.src}
              alt={s.alt ?? ""}
              className="block h-auto w-full max-w-none select-none drop-shadow-xl"
            />
          </div>
        ))}
    </>
  );
}

/** Card-anchored stickers for ONE card. Mount inside the card's positioning
    box — which must carry `[container-type:inline-size]` — and OUTSIDE any
    `overflow-hidden`, or a sticker on an outside corner is clipped. */
export function CardStickers({
  stickers,
  index,
  hide,
}: {
  stickers?: Sticker[];
  index: number;
  hide?: boolean;
}) {
  if (hide || !stickers?.length) return null;
  return (
    <>
      {stickers
        .filter((s) => s.anchor === "card" && s.card === index)
        .map((s) => (
          <div
            key={s.name}
            aria-hidden="true"
            className={`pointer-events-none absolute ${
              s.desktopOnly ? "hidden lg:block" : "block"
            }`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              /* cqi: a fraction of the CARD. The clamp keeps it legible on a
                 narrow card and stops it eating a wide one. */
              width: `clamp(28px, ${s.w}cqi, ${s.cap ?? 160}px)`,
              zIndex: s.z ?? 20,
              transform: `translate(-50%, -50%) rotate(${s.rotate ?? "0deg"})`,
            }}
          >
            <img
              loading="lazy"
              decoding="async"
              src={s.src}
              alt={s.alt ?? ""}
              className="block h-auto w-full max-w-none select-none drop-shadow-xl"
            />
          </div>
        ))}
    </>
  );
}
