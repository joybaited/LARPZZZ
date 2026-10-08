/* The phone's stand-in. A grey block the exact size and place the 3D phone
 * renders at, so the hero can be laid out without paying for WebGL.
 *
 * ⚠ MEASURED OFF THE RENDER, NOT DERIVED. Projecting the tuned euler
 * angles through the model's bounding box gave a 60% x 15% sliver — the
 * model lies flat in the file (3D.md) and the axis mapping is easy to get
 * backwards. The numbers below come from reading the alpha channel of an
 * actual hero screenshot at 1440x900 and correcting for the tuned
 * fit (0.72 -> 0.71) and offset (0.21, -0.21).
 *
 * ⚠ PERCENTAGES OF THE SECTION, so it holds its place at every width —
 * the same rule the canvas follows (`fit` is a fraction of viewport height).
 *
 * Re-measure if the pose changes: read the canvas alpha and take the
 * bounding box. Do NOT re-derive it from the rotation.
 */
export const PHONE_BOX = {
  x: 52.17, // centre, % of width
  y: 58.53, // centre, % of height
  w: 26.09, // % of width
  h: 82.17, // % of height
  radius: 44, // px — the phone's own corner, roughly, at 1440
};

export default function PhoneBox() {
  return (
    <div
      aria-hidden="true"
      style={{
        left: `${PHONE_BOX.x}%`,
        top: `${PHONE_BOX.y}%`,
        width: `${PHONE_BOX.w}%`,
        height: `${PHONE_BOX.h}%`,
        transform: "translate(-50%, -50%)",
        borderRadius: `${PHONE_BOX.radius}px`,
      }}
      className="pointer-events-none absolute z-0 bg-black/10"
    />
  );
}
