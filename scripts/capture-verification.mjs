import { chromium } from 'playwright';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.route('**/*', route => route.continue());
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const restPath = 'C:/Users/SREE HARI/.gemini/antigravity-ide/brain/9d981c4b-f987-43d0-926b-b449b804de33/scratch/default-pos-rest.png';
  const restCropPath = 'C:/Users/SREE HARI/.gemini/antigravity-ide/brain/9d981c4b-f987-43d0-926b-b449b804de33/scratch/default-pos-rest-crop.png';
  
  await page.screenshot({ path: restPath });

  // Crop around phone top
  const meta = await sharp(restPath).metadata();
  await sharp(restPath)
    .extract({
      left: Math.round(meta.width * 0.45),
      top: Math.round(meta.height * 0.1),
      width: Math.round(meta.width * 0.35),
      height: Math.round(meta.height * 0.45)
    })
    .png()
    .toFile(restCropPath);

  // Tilt phone
  await page.mouse.move(300, 700);
  await page.waitForTimeout(800);

  const tiltPath = 'C:/Users/SREE HARI/.gemini/antigravity-ide/brain/9d981c4b-f987-43d0-926b-b449b804de33/scratch/default-pos-tilt.png';
  const tiltCropPath = 'C:/Users/SREE HARI/.gemini/antigravity-ide/brain/9d981c4b-f987-43d0-926b-b449b804de33/scratch/default-pos-tilt-crop.png';

  await page.screenshot({ path: tiltPath });

  await sharp(tiltPath)
    .extract({
      left: Math.round(meta.width * 0.45),
      top: Math.round(meta.height * 0.1),
      width: Math.round(meta.width * 0.35),
      height: Math.round(meta.height * 0.45)
    })
    .png()
    .toFile(tiltCropPath);

  await browser.close();
  console.log('Verification screenshots captured successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
