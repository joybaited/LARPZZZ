import Link from "next/link";

/**
 * the workbench index. every section has its own route so it can be built and
 * looked at on its own; they are wired together in page.tsx at the end.
 *
 * ADDING A SECTION: a file in sections/, a route folder with four lines in
 * it, and one row here. The route folders are the only thing that makes a
 * section viewable in isolation — page.tsx is the finished page, not the
 * workbench.
 */
const ROUTES = [
  { href: "/hero", name: "Hero", note: "section 1 — nav, headline, the phone" },
  { href: "/features", name: "Features", note: "section 2 — the card carousel" },
  { href: "/how-it-works", name: "How It Works", note: "section 3 — placeholder" },
  { href: "/testimonials", name: "Testimonials", note: "section 4 — the marquee" },
  { href: "/faq", name: "FAQ", note: "section 5 — the pills" },
  { href: "/pricing", name: "Pricing", note: "section 6 — three cards" },
  { href: "/tuner", name: "Tuner", note: "tool — positions the 3D phone" },
  { href: "/hero-tuner", name: "Hero tuner", note: "tool — lays out the hero" },
  { href: "/faq-tuner", name: "FAQ tuner", note: "tool — places the FAQ pills" },
  { href: "/pricing-tuner", name: "Pricing tuner", note: "tool — lays out the pricing cards" },
  { href: "/no-hero", name: "No hero", note: "every section except the hero, in order" },
  { href: "/", name: "Full page", note: "every section, in order" },
];

export default function SectionsIndex() {
  return (
    <main className="mx-auto w-full max-w-(--content-max) px-(--gutter) py-(--space-3xl)">
      <h1 className="font-display text-2 uppercase">Sections</h1>
      <p className="mt-(--space-s) max-w-[48ch] text-base">
        One route per section, so each can be built on its own. They are wired
        together in <code>app/page.tsx</code> at the end.
      </p>

      <ul className="mt-(--space-2xl) flex list-none flex-col gap-(--space-xs) p-0">
        {ROUTES.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="flex flex-wrap items-baseline gap-x-(--space-s) gap-y-1 rounded-lg px-(--space-s) py-(--space-xs) no-underline transition-colors hover:bg-haze"
            >
              <span className="text-3">{r.name}</span>
              <span className="text-base opacity-60">{r.note}</span>
              <span className="ml-auto text-base opacity-40">{r.href}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
