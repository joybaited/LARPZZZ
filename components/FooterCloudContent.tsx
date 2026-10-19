import PillButton from "@/components/PillButton";
import { LEGAL, SECTION_LINKS, TELEGRAM, WALLETS } from "@/lib/site";

/* What sits INSIDE the footer's cloud: the sign-off, the CTAs, the link
 * columns and the legal line. A layer on top of @snvzyn's cloud — the cloud,
 * coins, rain and ticket strip underneath are untouched.
 *
 * ⚠ THE WIDTH LIMITS ARE THE CLOUD'S OWN EDGE, MEASURED. The desktop cloud is
 * placed by height (`left: 58.5vw - 100vh*1.161`, `height: 100%`), so how far
 * right its bumpy edge reaches depends on BOTH axes. Read off the png's alpha
 * at 768/1024/1366/1536/1920/2160 wide, its narrowest point:
 *
 *   top 40% of the section    58.5vw - 22.6vh   (732px at 1536x742)
 *   bottom 55% of the section 58.5vw -  8.2vh   (838px at 1536x742)
 *
 * — both within 4px of the measurement at every size. So the sign-off (top)
 * and the columns (bottom) each get the width of THEIR band of the cloud, and
 * neither can cross the outline whatever the window shape.
 *
 * ⚠ PHONES USE THE MOBILE CLOUD, A 48svh BAND ACROSS THE TOP whose scalloped
 * lower edge starts at ~80% of its height (246px of 308 at 360x640). The
 * content stays above that; the Wallets column is dropped and the links fold
 * into one row to fit. */

const INK = "#3D065F";
const VIOLET = "#EAC2FF";
const GAP = "3vw"; // breathing room inside the outline, and the breathe/parallax travel

export default function FooterCloudContent() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[22]"
      style={{
        color: INK,
        ["--edge-top" as string]: `calc(var(--cloud-target-x, 58.5vw) - 22.6vh - ${GAP})`,
        ["--edge-low" as string]: `calc(var(--cloud-target-x, 58.5vw) - 8.2vh - ${GAP})`,
      }}
    >
      <div className="flex h-full flex-col gap-2.5 px-5 pt-[clamp(12px,4.5vw,28px)] md:justify-between md:gap-0 md:py-[clamp(28px,5vh,72px)] md:pl-[clamp(24px,4vw,88px)] md:pr-0">
        {/* ── the sign-off ── */}
        <div className="pointer-events-auto md:w-[calc(var(--edge-top)-clamp(24px,4vw,88px))]">
          <p className="m-0 font-display text-[clamp(24px,7.8vw,40px)] leading-[0.92] uppercase text-balance md:text-[clamp(36px,1.4rem+4.2vw,8.5rem)]">
            Fake it till you make it.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-3 md:mt-[clamp(14px,2.4vh,32px)]">
            <PillButton
              href="#pricing"
              fill={INK}
              color={VIOLET}
              className="min-h-12 px-[clamp(26px,1.2rem+1.2vw,48px)] py-[clamp(12px,0.5rem+0.6vw,20px)] leading-none font-semibold"
              style={{ fontSize: "clamp(17px, 0.7rem + 0.6vw, 1.5rem)" }}
            >
              Buy
            </PillButton>
            <PillButton
              href="/login"
              fill={`color-mix(in srgb, ${INK} 12%, transparent)`}
              color={INK}
              className="min-h-12 px-[clamp(26px,1.2rem+1.2vw,48px)] py-[clamp(12px,0.5rem+0.6vw,20px)] leading-none font-semibold"
              style={{ fontSize: "clamp(17px, 0.7rem + 0.6vw, 1.5rem)" }}
            >
              Login
            </PillButton>
          </div>
        </div>

        {/* ── the columns + legal ── */}
        <div className="pointer-events-auto flex flex-col gap-3 md:w-[calc(var(--edge-low)-clamp(24px,4vw,88px))] md:gap-[clamp(16px,3vh,40px)]">
          {/* phones: one compact row of the section links. Gone below 360,
              where the cloud band is too short to hold it with the legal
              line — the nav carries the same five links. */}
          <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[clamp(13px,3.6vw,15px)] font-semibold max-[359px]:hidden md:hidden">
            {SECTION_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-block py-1 no-underline" style={{ color: INK }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* md up: three columns, wrapping to two where the cloud is narrow */}
          <div className="hidden grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-[clamp(16px,2vw,40px)] gap-y-6 md:grid">
            <Column heading="Product">
              {SECTION_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="no-underline transition-opacity duration-300 hover:opacity-60" style={{ color: INK }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </Column>
            <Column heading="Wallets">
              {WALLETS.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </Column>
            <Column heading="Support">
              <li>
                <a href={TELEGRAM.href} target="_blank" rel="noopener noreferrer" className="no-underline transition-opacity duration-300 hover:opacity-60" style={{ color: INK }}>
                  Telegram
                </a>
              </li>
              <li>
                <a href="/login" className="no-underline transition-opacity duration-300 hover:opacity-60" style={{ color: INK }}>
                  Login
                </a>
              </li>
              <li>
                <a href="#pricing" className="no-underline transition-opacity duration-300 hover:opacity-60" style={{ color: INK }}>
                  Buy a license
                </a>
              </li>
            </Column>
          </div>

          <p className="m-0 border-t-2 pt-3 text-[clamp(11px,0.45rem+0.3vw,0.875rem)] opacity-70" style={{ borderColor: `color-mix(in srgb, ${INK} 25%, transparent)` }}>
            © {new Date().getFullYear()} Larpz Wallet · {LEGAL}
          </p>
        </div>
      </div>
    </div>
  );
}

function Column({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-[clamp(8px,1.2vh,16px)] font-display text-[clamp(16px,0.6rem+0.7vw,1.625rem)] uppercase">{heading}</p>
      <ul className="m-0 flex list-none flex-col gap-[clamp(4px,0.6vh,10px)] p-0 text-[clamp(13px,0.5rem+0.4vw,1.0625rem)]">
        {children}
      </ul>
    </div>
  );
}
