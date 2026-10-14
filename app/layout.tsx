import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { PillStyle } from "@/components/pillHover";

export const metadata: Metadata = {
  title: "LARPZZZ",
  description: "LARPZZZ",
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
        {children}
      </body>
    </html>
  );
}
