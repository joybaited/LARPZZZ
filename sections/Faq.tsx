"use client";

import Section from "@/components/Section";
import FaqItem from "@/components/FaqItem";
import { StickerLayer, type Sticker } from "@/components/Stickers";

/* Section five. FAQ — the wordmark centred over one column of equal rows.
 *
 * Megion is one weight (Bold) and display-only, so `font-display` is already
 * the bold cut — there is no font-weight to set.
 */

/* ⚠ `x`, `y` AND `tilt` ARE DEAD FIELDS — THE LAYOUT IS A STACK NOW. They
 * are kept only because /faq-tuner imports this export and would fail
 * without them; the section ignores all three. `openW` and `size` are
 * likewise unused, since every row takes the column's width and the
 * column's font-size. Editing any of them changes nothing on the page.
 * The live dials are the column cap, gap and type size in the markup below.
 *
 * ⚠ THE ANSWERS ARE THE OWNER'S, FROM `copy.md` — DO NOT REWRITE THEM.
 * copy.md carries ten questions; these are its 1, 2, 5, 6, 7 and 10, which
 * are the six that were already scattered here. The four it has that this
 * section does not (device count, "is it a real wallet", key delivery, and
 * the difference between the wallets) are NOT dropped by accident — six
 * pills is the arrangement, and adding a seventh is a tuner job, not a copy
 * edit. The questions keep their existing wording rather than copy.md's,
 * because `openW` and the scatter were tuned against these exact strings.
 *
 * The answer text is verbatim from copy.md. The one change is typographic:
 * straight apostrophes become curly to match the rest of the site.
 */
export const PILLS = [
  { q: "What is Larpzwallet?", a: "It is a display app for content and entertainment. People use it to film larp clips for TikTok, YouTube and Instagram, to screenshot a portfolio that does not exist, to prank friends, and to show what a wallet interface looks like without touching real funds. Every number on screen is a value you typed in yourself.", x: 6.0, y: 14.0, tilt: 0, openW: 550, size: 27.5 },
  { q: "Do i need a seed phrase or a real wallet to use it ?", a: "No, never. Larpz Wallet does not ask for a seed phrase, a private key, or a connection to any real wallet — and it has no blockchain connection to use one with. You set your own balances, and they are displayed on top of live market prices.", x: 62.0, y: 14.0, tilt: 0, openW: 490, size: 20 },
  { q: "Will it look exactly like the real crypto apps?", a: "Yes. Each wallet is designed to be pixel-perfect — identical to the real app on mobile. Prices are pulled live from CoinGecko, the 24-hour chart is interactive, and the send flow screens look and behave like the real thing.", x: 4.0, y: 44.0, tilt: 0, openW: 520, size: 20 },
  { q: "Does it work on Iphone and Android?", a: "Yes. Larpz Wallet is a PWA (Progressive Web App) that installs directly to your home screen. Use Safari on iOS or Chrome on Android — no App Store download required.", x: 66.0, y: 44.0, tilt: 0, openW: 520, size: 20 },
  { q: "Can i add custom tokens and memecoins?", a: "Yes. On the apps, you can add any Solana or Ethereum token by contract address. The app fetches the live price and token image from DexScreener automatically.", x: 6.0, y: 74.0, tilt: 0, openW: 520, size: 20 },
  { q: "Is my payment anonymous", a: "Crypto payments (SOL, ETH, BNB, BTC, TRX, USDT, USDC) require no personal information at all — no account, no email. Card payments (credit card, Apple Pay, Google Pay) require an email address, which is passed directly to the payment processor and is not stored by us. Either way, your license key is all you need to use the app.", x: 66.0, y: 74.0, tilt: 0, openW: 520, size: 20 },
];


export const FAQ_STICKERS: Sticker[] = [];

export default function Faq({
  children,
  stickers = FAQ_STICKERS,
  hideStickers,
  stageRef,
  tuning,
}: {
  children?: React.ReactNode;
  stickers?: Sticker[];
  hideStickers?: boolean;
  stageRef?: React.Ref<HTMLDivElement>;
  tuning?: boolean;
} = {}) {
  return (
    /* bleed: the column centres itself against the full section, and the
       sticker stage is the whole section so x/y keep meaning what the tuner
       showed. */
    /* ⚠ `!min-h-0`: THE SECTION IS AS TALL AS ITS CONTENT, so opening a row
       pushes Pricing down by exactly the answer's height. With the standard
       one-viewport min-height the slack below the list swallowed the growth —
       measured, the section grew 0px at 768x1024 and 2160x1440 and 0-28px at
       1024x768 while a row opened. */
    <Section id="faq" bleed className="!min-h-0 bg-[#c98ef0] text-[#3D065F]">
      {/* ⚠ ONE STACKED COLUMN AT EVERY WIDTH, every row the column's width.
          It was a desktop scatter, then a centred stack of pills that each
          hugged its own question — a ragged edge on both sides. Equal rows
          with the question left and the + right read as one list. A row only
          ever grows DOWN when it opens; see FaqItem. */}
      <div
        ref={(el) => {
          if (typeof stageRef === "function") stageRef(el);
          else if (stageRef) (stageRef as React.RefObject<HTMLDivElement | null>).current = el;
        }}
        className="relative mx-auto w-full max-w-[var(--canvas-max-width,120rem)]"
      >
        <StickerLayer stickers={stickers} hide={hideStickers} />
        {children}

        <div className="relative z-10 flex flex-col items-center px-(--gutter) py-8">
          <h2 className="mb-8 text-center font-display text-[clamp(3.5rem,14vw,12.5rem)] leading-[0.9] uppercase select-none">
            FAQ
          </h2>

          {/* ⚠ THE COLUMN WIDTH IS THE ANSWER'S MEASURE. 46rem at 22px type is
              ~75 characters a line — past that body copy stops being readable,
              so it is capped rather than full-bleed. rem above lg, so it
              scales with the root like the rest of the page. */}
          <div className="flex w-full max-w-[36rem] flex-col gap-3 text-[16px] md:max-w-[38rem] md:text-[18px] lg:max-w-[46rem] lg:gap-4 lg:text-[1.375rem]">
            {PILLS.map((p) => (
              <FaqItem key={p.q} q={p.q} a={p.a} tilt={0} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
