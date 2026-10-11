import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

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
        {children}
      </body>
    </html>
  );
}
