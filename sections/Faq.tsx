"use client";

import Section from "@/components/Section";
import FaqItem from "@/components/FaqItem";
import { StickerLayer, type Sticker } from "@/components/Stickers";

/* Section five. FAQ — the wordmark centred over one column of equal rows.
 *
 * Megion is one weight (Bold) and display-only, so `font-display` is already
 * the bold cut — there is no font-weight to set.
 */

/* ⚠ THE COPY IS THE OWNER'S, ALL TEN FROM `copy.md` — DO NOT REWRITE IT.
 * Questions and answers verbatim; the one change is typographic: straight
 * apostrophes become curly to match the rest of the site.
 *
 * ⚠ `x`, `y`, `tilt`, `openW` AND `size` ARE DEAD FIELDS — the layout is a
 * stack and every row takes the column's width and type size. They are filled
 * in only because /faq-tuner imports PILLS and reads them. */
const QA: [string, string][] = [
  ["What is Larpz Wallet used for?", "It is a display app for content and entertainment. People use it to film larp clips for TikTok, YouTube and Instagram, to screenshot a portfolio that does not exist, to prank friends, and to show what a wallet interface looks like without touching real funds. Every number on screen is a value you typed in yourself."],
  ["Do I need a seed phrase or a real wallet to use it?", "No, never. Larpz Wallet does not ask for a seed phrase, a private key, or a connection to any real wallet — and it has no blockchain connection to use one with. You set your own balances, and they are displayed on top of live market prices."],
  ["How many devices can I use one license key on?", "It depends on your plan: the weekly key works on one device, the monthly key on two, and the lifetime key on three. Every plan includes all six apps, and you can switch between them from your dashboard whenever you want."],
  ["Is Larpz Wallet a real crypto wallet?", "No. Larpz Wallet is an entertainment app only — it does not hold, send, receive, or interact with any real crypto assets. No seed phrases or private keys are ever asked for or stored. It is a display app that shows custom balances on a realistic wallet interface."],
  ["Will it look exactly like the real crypto apps?", "Yes. Each wallet is designed to be pixel-perfect — identical to the real app on mobile. Prices are pulled live from CoinGecko, the 24-hour chart is interactive, and the send flow screens look and behave like the real thing."],
  ["Does it work on iPhone and Android?", "Yes. Larpz Wallet is a PWA (Progressive Web App) that installs directly to your home screen. Use Safari on iOS or Chrome on Android — no App Store download required."],
  ["Can I add custom tokens or memecoins?", "Yes. On the apps, you can add any Solana or Ethereum token by contract address. The app fetches the live price and token image from DexScreener automatically."],
  ["How do I receive my license key after purchase?", "Delivery is fully automated. Once your crypto payment is detected on-chain, your unique license key is generated and displayed on the order status page — usually within a few minutes. No manual steps needed."],
  ["What’s the difference between the wallets?", "All plans include all six apps. The fake Ghost Wallet supports custom memecoins. The fake Trust Wallet has a multi-chain look with BTC, ETH, SOL, TRX, and BNB. The fake Ledger wallet mimics the hardware wallet interface with BTC/SOL/ETH/TRX/BNB. The fake Exodus wallet shows a multi-chain portfolio view. The Bank app looks like a mobile banking app with crypto, and the fake Fomo app recreates a social memecoin trading app with a leaderboard. Switch between them anytime from your dashboard."],
  ["Is my payment anonymous?", "Crypto payments (SOL, ETH, BNB, BTC, TRX, USDT, USDC) require no personal information at all — no account, no email. Card payments (credit card, Apple Pay, Google Pay) require an email address, which is passed directly to the payment processor and is not stored by us. Either way, your license key is all you need to use the app."],
];

export const PILLS = QA.map(([q, a]) => ({ q, a, x: 0, y: 0, tilt: 0, openW: 0, size: 20 }));


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

          {/* ⚠ THE COLUMN WIDTH IS THE ANSWER'S MEASURE. 54rem at 24px type is
              ~80 characters a line — past that body copy stops being readable,
              so it is capped rather than full-bleed. rem above lg, so it
              scales with the root like the rest of the page. */}
          <div className="flex w-full max-w-[38rem] flex-col gap-3 text-[17px] md:max-w-[44rem] md:text-[20px] lg:max-w-[54rem] lg:gap-4 lg:text-[1.5rem]">
            {PILLS.map((p) => (
              <FaqItem key={p.q} q={p.q} a={p.a} tilt={0} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
