import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);
// force the pill to the last word directly, bypassing scroll entirely
console.log(await p.evaluate(()=>{
  const frame=document.querySelector('#how-it-works div[class*="rounded-full border"]');
  const pill=frame.querySelector('div[aria-hidden="true"]');
  const words=[...frame.querySelectorAll('[data-word]')];
  const want = { x: words[2].offsetLeft-22, w: words[2].offsetWidth+44 };
  // set it directly with inline style - no gsap
  pill.style.transform = `translateX(${want.x}px)`;
  pill.style.width = want.w+'px';
  const pb=pill.getBoundingClientRect(), wb=words[2].getBoundingClientRect();
  return { want, actualLeft:Math.round(pb.left), wordLeft:Math.round(wb.left),
           actualRight:Math.round(pb.right), wordRight:Math.round(wb.right),
           wraps: pb.left<=wb.left+3 && pb.right>=wb.right-3,
           computedW: getComputedStyle(pill).width, maxW: getComputedStyle(pill).maxWidth };
}));
await b.close();
