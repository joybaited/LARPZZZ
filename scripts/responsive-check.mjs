/**
 * Measures the page at every mainstream viewport and reports geometry
 * failures. It NEVER writes a section — same rule as the tuners. Numbers
 * only, no screenshots: the owner does the visual verification.
 *
 * Fails on: sticker/content overlap, a sticker outside its own section,
 * horizontal page scroll, text taller than the box that clips it.
 *
 *   node scripts/responsive-check.mjs              # needs `npm run dev` up
 *   node scripts/responsive-check.mjs --url=...    # or a preview deploy
 *   node scripts/responsive-check.mjs --self-check # geometry check, no browser
 */
import { chromium } from "playwright";

/* innerWidth x innerHeight — the usable viewport AFTER browser chrome, not the
   screen resolution. A 1536x864 screen is ~1536x742 of page, which is the
   owner's ground truth. Shares are StatCounter worldwide desktop, Sept 2026. */
const VIEWPORTS = [
  { name: "1920x940", w: 1920, h: 940, note: "1080p · 28% of desktop" },
  { name: "1536x742", w: 1536, h: 742, note: "GROUND TRUTH · 10%" },
  { name: "1366x640", w: 1366, h: 640, note: "shallow laptop · 8%" },
  { name: "1440x790", w: 1440, h: 790, note: "MacBook Air" },
  { name: "1280x610", w: 1280, h: 610, note: "small window" },
  { name: "2560x1300", w: 2560, h: 1300, note: "QHD" },
  { name: "3440x1300", w: 3440, h: 1300, note: "ultrawide" },
  { name: "960x1040", w: 960, h: 1040, note: "half-snapped" },
  { name: "843x546", w: 843, h: 546, note: "squished window" },
  { name: "1024x1290", w: 1024, h: 1290, note: "iPad Pro portrait" },
  { name: "820x1100", w: 820, h: 1100, note: "iPad Air" },
  { name: "768x950", w: 768, h: 950, note: "iPad portrait" },
  { name: "1180x740", w: 1180, h: 740, note: "iPad Air landscape" },
  { name: "430x860", w: 430, h: 860, note: "iPhone Pro Max" },
  { name: "412x845", w: 412, h: 845, note: "Pixel / Galaxy" },
  { name: "402x800", w: 402, h: 800, note: "iPhone 16 Pro" },
  { name: "393x780", w: 393, h: 780, note: "iPhone 16" },
  { name: "390x770", w: 390, h: 770, note: "iPhone 13/14/15" },
  { name: "360x730", w: 360, h: 730, note: "Android median" },
  { name: "844x340", w: 844, h: 340, note: "phone landscape" },
];

const SECTIONS = ["hero", "how-it-works", "features", "testimonials", "faq", "pricing"];

/* Two boxes collide only if they intersect on BOTH axes. The tolerance absorbs
   subpixel rounding and the few px of deliberate tuck a designed overlap uses;
   8px is about one line of leading, below which nothing reads as a collision. */
const TOL = 8;
export function overlap(a, b, tol = TOL) {
  const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return x > tol && y > tol ? { x: Math.round(x), y: Math.round(y) } : null;
}

/* --self-check: the geometry is the only non-trivial logic here, so it gets
   the one runnable check. No browser, no dev server. */
if (process.argv.includes("--self-check")) {
  const box = (x, y, w, h) => ({ x, y, w, h });
  let bad = 0;
  const t = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); bad++; } };
  t(overlap(box(0, 0, 100, 100), box(50, 50, 100, 100)), "clear overlap missed");
  t(!overlap(box(0, 0, 100, 100), box(200, 200, 50, 50)), "disjoint boxes reported");
  t(!overlap(box(0, 0, 100, 100), box(100, 0, 50, 100)), "touching edges reported");
  t(!overlap(box(0, 0, 100, 100), box(95, 0, 50, 100)), "5px within tolerance reported");
  t(!overlap(box(0, 0, 100, 10), box(0, 50, 100, 10)), "x-only overlap reported");
  t(overlap(box(0, 0, 100, 100), box(80, 80, 100, 100)).x === 20, "overlap depth wrong");
  console.log(bad ? `self-check: ${bad} failed` : "self-check passed");
  process.exit(bad ? 1 : 0);
}

const urlArg = process.argv.find((a) => a.startsWith("--url="));
const BASE = urlArg ? urlArg.slice(6) : "http://localhost:3000";

const browser = await chromium.launch();
const failures = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  try {
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  } catch {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  /* The stickers drift on a float animation and the marquees translate, so a
     box read on frame 1 is not the box the user sees. Settle first. */
  await page.waitForTimeout(1500);

  const report = await page.evaluate(
    ({ SECTIONS, TOL }) => {
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
      };
      /* ⚠ MEASURE THE GLYPHS, NOT THE ELEMENT BOX. The section <h2> is a
         full-width pointer-events-none band (1536px wide, 196px tall at the
         baseline) but the word "Testimonials" inside it is 562px starting at
         x=487. Comparing against the element box reported every heading-band
         sticker as a collision on the owner's own approved layout — 24 false
         positives at ground truth. A Range over the text node gives the box
         the letters actually occupy, which is what can be obscured. */
      const textRect = (el) => {
        try {
          const rng = document.createRange();
          rng.selectNodeContents(el);
          const r = rng.getBoundingClientRect();
          if (r.width > 1 && r.height > 1) {
            return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
          }
        } catch {}
        return rect(el);
      };
      const visible = (el) => {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      };
      const ov = (a, b) => {
        const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        return x > TOL && y > TOL ? { x: Math.round(x), y: Math.round(y) } : null;
      };
      const label = (el) => (el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
      const fileOf = (el) => (el.querySelector("img")?.getAttribute("src") || "?").split("/").pop();

      const out = { hscroll: null, sections: [] };

      /* Horizontal page scroll is the one failure that is always a bug. */
      const de = document.documentElement;
      if (de.scrollWidth > window.innerWidth + 1) {
        out.hscroll = { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, worst: null };
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1 && (!out.hscroll.worst || r.right > out.hscroll.worst.right)) {
            out.hscroll.worst = {
              right: Math.round(r.right),
              tag: el.tagName.toLowerCase(),
              cls: String(el.className || "").slice(0, 70),
            };
          }
        }
      }

      for (const id of SECTIONS) {
        const sec = document.querySelector(`[data-section="${id}"]`);
        if (!sec) { out.sections.push({ id, missing: true }); continue; }
        const sr = rect(sec);
        const res = { id, overlaps: [], escapes: [], clipped: [] };

        /* A sticker is an aria-hidden wrapper holding an img — that is exactly
           how all five sticker layers are built. Content is what must stay
           legible underneath them.
           ⚠ TWO IMAGES ARE NOT STICKERS AND MUST NOT BE FLAGGED:
           - the hero ImageTrail (`/images/cursor/01.webp`..18, set in
             HERO.trail) follows the cursor and is DESIGNED to pass over the
             headline — its own `exclude` selector already keeps it off the nav,
             buttons and subtitle. Flagging it produced 5-9 failures per
             viewport that are the feature working as intended.
           - `mockup-phone` is a card's own artwork sitting in its own card, not
             a free-floating sticker. The owner has confirmed it may shrink
             proportionally, which the ratio-locked stage already does. */
        const NOT_STICKERS = /mockup-phone|\/images\/cursor\//;
        const stickers = [...sec.querySelectorAll('[aria-hidden="true"]')]
          .filter((el) => {
            if (!visible(el)) return false;
            const img = el.querySelector("img");
            return img && !NOT_STICKERS.test(img.getAttribute("src") || "");
          })
          .map((el) => ({ el, box: rect(el) }));

        const content = [...sec.querySelectorAll("h1,h2,h3,p,button,a")]
          .filter((el) => visible(el) && !el.closest('[aria-hidden="true"]'))
          .map((el) => ({ el, box: textRect(el) }));

        for (const s of stickers) {
          for (const c of content) {
            const hit = ov(s.box, c.box);
            if (hit) res.overlaps.push({ sticker: fileOf(s.el), over: label(c.el), by: hit });
          }
          if (s.box.y + s.box.h < sr.y - TOL || s.box.y > sr.y + sr.h + TOL) {
            res.escapes.push({
              sticker: fileOf(s.el),
              y: Math.round(s.box.y),
              from: Math.round(sr.y),
              to: Math.round(sr.y + sr.h),
            });
          }
        }

        /* Text taller than the box that clips it = a cut-off line. This is the
           check a plain bounding-box comparison misses — HANDOVER session 17. */
        for (const c of content) {
          const el = c.el;
          if (getComputedStyle(el).overflow === "visible") continue;
          if (el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 2) {
            res.clipped.push({ text: label(el), scroll: el.scrollHeight, client: el.clientHeight });
          }
        }
        out.sections.push(res);
      }
      return out;
    },
    { SECTIONS, TOL }
  );

  const probs = [];
  if (report.hscroll) {
    const w = report.hscroll.worst;
    probs.push(
      `h-scroll ${report.hscroll.scrollWidth}>${report.hscroll.innerWidth}` +
        (w ? ` worst:<${w.tag} class="${w.cls}"> right=${w.right}` : "")
    );
  }
  for (const s of report.sections) {
    if (s.missing) { probs.push(`[${s.id}] section not rendered`); continue; }
    for (const o of s.overlaps) probs.push(`[${s.id}] ${o.sticker} over "${o.over}" by ${o.by.x}x${o.by.y}px`);
    for (const e of s.escapes) probs.push(`[${s.id}] ${e.sticker} outside section (y=${e.y}, section ${e.from}..${e.to})`);
    for (const c of s.clipped) probs.push(`[${s.id}] clipped "${c.text}" ${c.scroll}>${c.client}px`);
  }

  console.log(`\n${probs.length ? "FAIL" : "ok  "}  ${vp.name.padEnd(10)} ${vp.note}`);
  for (const p of probs) console.log(`        ${p}`);
  if (probs.length) failures.push({ vp: vp.name, count: probs.length });
  await page.close();
}

await browser.close();
console.log(`\n${"=".repeat(60)}`);
if (failures.length) {
  console.log(`${failures.length}/${VIEWPORTS.length} viewports with problems:`);
  for (const f of failures) console.log(`  ${f.vp.padEnd(12)} ${f.count}`);
  process.exit(1);
}
console.log(`clean across all ${VIEWPORTS.length} viewports`);
