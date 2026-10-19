import Section from "@/components/Section";
import PillButton from "@/components/PillButton";
import { StickerLayer, CardStickers, type Sticker } from "@/components/Stickers";

/* Pricing. Three tier cards in a row from lg, one column below it.
 *
 * Built on the tier-card pattern (pricingpages.design's gallery, osmo.supply's
 * own pricing): name and badge, the price with the full one struck through,
 * the button ABOVE the features so all three line up, then a check / cross
 * list. One house pair — grape cards, violet ink — on the section's #f7ecff.
 *
 * THE LIST IS NOT THE LAYOUT. A <ul> of <li>, each holding an <article>:
 * three of the same kind of thing is a list, and a tier makes sense alone.
 */

/* ⚠ THE SHARED ELEMENT TYPE STAYS HERE. Hero's nav, stage and buttons are
 * <PriceEl> elements, and Hero, PriceEl, /hero-tuner and /pricing-tuner all
 * import this type from this file. Pricing itself no longer uses it. */
export type PriceEl = {
  name: string;
  kind: "text" | "box" | "line" | "ellipse";
  /* optional: the tuner omits it when empty, and a box or line often has
     no label at all. */
  text?: string;
  /* centre, % of card */
  x: number;
  y: number;
  /* box/line/ellipse only, % of card. text hugs its content. */
  w?: number;
  h?: number;
  /* px or fluid css clamp */
  size?: number | string;
  radius?: number;
  /* 0-100 */
  opacity?: number;
  rotate?: number;
  weight?: number;
  align?: "left" | "center" | "right";
  fill?: string;
  color?: string;
  border?: number;
  borderColor?: string;
  italic?: boolean;
  strike?: boolean;
  caps?: boolean;
  tracking?: number;
  /* the face. omitted = the body font (Neue Montreal), which is what every
     existing element already renders as, so adding this changes nothing that
     is already laid out. "display" is Megion. */
  font?: "display" | "sans";
  show?: boolean;
  /* a box that is a BUTTON: takes metamask.io's hover (the fill scales up
     behind the label while the label rolls over). A box without it is just a
     shape, so existing tuned elements are unaffected. */
  btn?: boolean;
  /* HERO ONLY. `in: "nav"` means x/y are percentages OF THE NAV BAR, not of
     the section — the nav is the nearest positioned ancestor, so <PriceEl>
     resolves against it with no change to the renderer. `in: "menu"` is the
     same thing for the nav's dropdown panel. Unused by Pricing; it lives
     here because this is where the shared element type lives. */
  in?: "nav" | "menu";
};

/* ── THE PLANS ────────────────────────────────────────────────────────────
 *
 * ⚠ THE COPY IS THE OWNER'S — copy.md's three cards, the same as the live
 * site (larpzwallet.app). `was` is the full price the live page shows; `price`
 * is copy.md's discounted one. Six features are shared by every plan and each
 * plan includes the first `has` of them, which is exactly how copy.md ticks
 * them off — so a seventh feature is one line here, not three.
 *
 * The cards used to be absolutely-positioned elements from /pricing-tuner.
 * They are a flow layout now, so the text can never spill a card at any width
 * and the three buttons line up by construction. /pricing-tuner keeps the old
 * arrangement as its own copy and no longer drives this section. */
const FEATURES = [
  "Full app access on iOS & Android",
  "All wallets (Ghost, Ledger, Trust Wallet, Exodus, Bank, Fomo)",
  "Free PDF money guide",
  "Unlimited custom balances & tokens",
  "Priority Telegram support",
  "Early access to new features",
];

const PLANS = [
  { name: "Starter", access: "7 days access", was: 29, price: 14, has: 4 },
  { name: "Monthly", access: "1 month access", was: 99, price: 44, has: 5, badge: "Most popular" },
  { name: "Lifetime", access: "Lifetime access", was: 299, price: 199, has: 6, badge: "Best value" },
];

/* the plan the live site gives the solid button. The cards themselves stay
   one colour — Kez's call — so the badge and the button carry the emphasis. */
const FEATURED = "Monthly";

export const PRICING_STICKERS: Sticker[] = [];

export default function Pricing({
  children,
  stickers = PRICING_STICKERS,
  hideStickers,
  stageRef,
}: {
  children?: React.ReactNode;
  stickers?: Sticker[];
  hideStickers?: boolean;
  stageRef?: React.Ref<HTMLDivElement>;
  tuning?: boolean;
} = {}) {
  return (
    <Section id="pricing" heading="Pricing" className="bg-[#f7ecff] text-grape">
      {/* ⚠ THE SEAM INTO THE FOOTER. Eased smootherstep cross-fade to Footer ground colour (#e3b5fb). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-1 z-0 h-[clamp(140px,22vh,300px)]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(227,181,251,0) 0%, rgba(227,181,251,0.015) 8%, rgba(227,181,251,0.06) 16%, rgba(227,181,251,0.14) 25%, rgba(227,181,251,0.25) 34%, rgba(227,181,251,0.38) 43%, rgba(227,181,251,0.54) 52%, rgba(227,181,251,0.70) 62%, rgba(227,181,251,0.83) 72%, rgba(227,181,251,0.92) 81%, rgba(227,181,251,0.97) 90%, rgba(227,181,251,0.995) 96%, #e3b5fb 100%)",
        }}
      />
      {/* ⚠ FULL --section-fill ONLY ON A LANDSCAPE SCREEN: on a portrait one
          the cards are their own height and centring in a full fill pooled
          the surplus under the heading (331px at 1024x1290). */}
      <div
        ref={stageRef}
        className="relative z-10 flex flex-col items-center justify-center py-8 [@media(min-aspect-ratio:1/1)]:min-h-[var(--section-fill)]"
      >
        <StickerLayer stickers={stickers} hide={hideStickers} />
        {children}
        {/* one column up to lg, capped at 30rem so a phone-width card does not
            stretch across a tablet; three equal columns from lg. `items-
            stretch` makes the three cards one height, and since everything
            above each button is the same height in every card, the buttons
            sit on one line. */}
        <ul
          role="list"
          className="m-0 grid w-full max-w-[30rem] list-none gap-[clamp(16px,0.6rem+1.2vw,40px)] p-0 lg:max-w-[min(120rem,calc(1200px*var(--scale-factor,1)))] lg:grid-cols-3"
        >
          {PLANS.map((plan, ci) => {
            const featured = plan.name === FEATURED;
            const save = Math.round((1 - plan.price / plan.was) * 100);
            return (
              <li
                key={plan.name}
                data-sticker-card={ci}
                className="relative z-10 flex min-w-0 flex-col rounded-[20px] border-[3px] border-grape bg-grape p-[clamp(20px,0.8rem+1.2vw,2.5rem)] text-violet [container-type:inline-size]"
              >
                <article className="flex flex-1 flex-col">
                  {/* name + badge. The badge is shorter than the name's line,
                      so a card without one is the same height. */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="m-0 font-display text-[clamp(22px,0.9rem+0.9vw,2.25rem)] leading-none uppercase">{plan.name}</h3>
                    {plan.badge && (
                      <span className="shrink-0 rounded-full bg-violet px-[0.9em] py-[0.5em] text-[clamp(11px,0.4rem+0.3vw,0.875rem)] leading-none font-semibold tracking-[0.08em] text-grape uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* ⚠ THE PRICE IS SIZED IN cqi — A FRACTION OF THE CARD. At
                      1024 a card's content box is ~230px; a vw size put "$199"
                      plus its struck "$299" past that and wrapped the row in one
                      card only, which knocked that card's button off the line. */}
                  <p className="m-0 mt-[clamp(18px,0.8rem+1.2vw,2.5rem)] flex items-baseline gap-[0.25em] whitespace-nowrap">
                    {/* ⚠ NOT MEGION. The Megion file is the free personal-use
                        cut and its 5, 6, 7, 8 and 9 are each a "PERSONAL USE
                        ONLY" stamp, not a digit — "$199" rendered as "$1" and
                        a badge. Checked glyph by glyph: 0-4 and every letter
                        are real, 5-9 are 78-contour stamps. Neue Montreal
                        Medium has real numerals; Megion stays for words. */}
                    <span className="font-sans text-[clamp(44px,22cqi,6rem)] leading-[0.85] font-medium tracking-[-0.045em]">${plan.price}</span>
                    <s className="text-[clamp(17px,7cqi,1.875rem)] opacity-55">
                      <span className="sr-only">Regular price </span>${plan.was}
                    </s>
                  </p>
                  <div className="mt-[clamp(8px,0.3rem+0.4vw,1rem)] flex items-center justify-between gap-3 text-[clamp(14px,0.55rem+0.35vw,1.125rem)]">
                    <span className="opacity-75">{plan.access}</span>
                    <span className="shrink-0 rounded-full border-2 border-current px-[0.6em] py-[0.2em] text-[0.85em] font-semibold">Save {save}%</span>
                  </div>

                  {/* the same pill and hover as every other button on the site.
                      Solid on the featured plan, a tint on the others — the
                      live site's primary / ghost pair. */}
                  <PillButton
                    href="/buy"
                    fill={featured ? "var(--color-violet)" : "color-mix(in srgb, var(--color-violet) 14%, transparent)"}
                    color={featured ? "var(--color-grape)" : "var(--color-violet)"}
                    className="mt-[clamp(18px,0.8rem+1vw,2.25rem)] min-h-12 w-full py-[clamp(14px,0.6rem+0.5vw,1.25rem)] leading-none font-semibold tracking-[0.04em] uppercase"
                    style={{ fontSize: "clamp(15px, 0.6rem + 0.4vw, 1.25rem)" }}
                  >
                    Buy {plan.name}
                  </PillButton>

                  <hr className="my-[clamp(18px,0.8rem+1vw,2.25rem)] border-0 border-t-2 border-violet/20" />

                  <ul className="m-0 flex list-none flex-col gap-[clamp(10px,0.4rem+0.5vw,1.125rem)] p-0 text-[clamp(14px,0.55rem+0.4vw,1.1875rem)] leading-snug">
                    {FEATURES.map((f, fi) => {
                      const ok = fi < plan.has;
                      return (
                        <li key={f} className={`flex items-start gap-[0.7em] ${ok ? "" : "opacity-45"}`}>
                          <span
                            aria-hidden="true"
                            className={`mt-[0.08em] grid size-[1.25em] shrink-0 place-items-center rounded-full ${ok ? "bg-violet text-grape" : "border-2 border-violet/60"}`}
                          >
                            <svg viewBox="0 0 16 16" className="size-[0.7em]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                              {ok ? <path d="M3 8.5 6.5 12 13 4.5" /> : <path d="M4.5 4.5l7 7m0-7-7 7" />}
                            </svg>
                          </span>
                          <span>
                            <span className="sr-only">{ok ? "Included: " : "Not included: "}</span>
                            {f}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
                {/* card-anchored stickers sit outside the article so an outside
                    corner is not clipped by the card's radius. */}
                <CardStickers stickers={stickers} index={ci} hide={hideStickers} />
              </li>
            );
          })}
        </ul>

        {/* the two questions a buyer has at the button, answered from the
            FAQ's own copy (payment methods, automated key delivery). */}
        <p className="m-0 mt-[clamp(20px,0.8rem+1.2vw,2.75rem)] max-w-[40ch] text-center text-[clamp(13px,0.5rem+0.35vw,1.0625rem)] text-balance opacity-75">
          Pay with crypto or card. Your license key is delivered automatically, usually within minutes.
        </p>
      </div>
    </Section>
  );
}
