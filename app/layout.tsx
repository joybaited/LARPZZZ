import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { PillStyle } from "@/components/pillHover";
import PillTouch from "@/components/PillTouch";
import ViewportHUD from "@/components/ViewportHUD";
import { SITE_URL } from "@/lib/site";

/* the live site's own title, description and share card (larpzwallet.app),
   so a link shared on Telegram or X previews the same as it does today. The
   images are file conventions beside this file: opengraph-image.png,
   twitter-image.png, icon.png, apple-icon.png. */
const SHARE_TITLE = "Larpz Wallet | Larp Wallet - Fake Crypto Wallet App";
const SHARE = "Simulate a Phantom Wallet, fake Trust Wallet, fake Ledger wallet, fake Exodus wallet, Bank app or Fomo app with any custom balance. The #1 larp wallet app — real-looking, 100% fake.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Larp Wallet | Larpz Wallet - Fake Crypto Wallet App",
  description: "Larpz Wallet simulates a Phantom Wallet, fake Trust Wallet, fake Ledger wallet, fake Exodus wallet, Bank app and Fomo app with live prices and custom balances. iOS & Android. From $29.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "Larpz Wallet", locale: "en_US", title: SHARE_TITLE, description: SHARE },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, description: SHARE },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {/* site-wide smooth scroll. Mounted here rather than in page.tsx,
            which CLAUDE.md stubs up front and asks not to edit again. */}
        <SmoothScroll />
        {/* ⚠ THE PILL BUTTON'S STYLESHEET, MOUNTED ONCE AND NOT INSIDE A
            BUTTON. It used to render inside each one, which put the whole
            CSS string into that button's textContent — a probe reading a
            label got the stylesheet's comment back instead. It also made the
            rules a child of a clipping, transformed box. Here it is one
            sheet for every pill on the site. */}
        <PillStyle />
        {/* the finger's trigger for that stylesheet's roll, delegated once for
            every pill. Here for the same reason the sheet is: the markup is
            built in two server components and neither should become client. */}
        <PillTouch />
        <ViewportHUD />
        {children}
      </body>
    </html>
  );
}
