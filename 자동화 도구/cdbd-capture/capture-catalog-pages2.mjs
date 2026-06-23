// 멀티페이지 카탈로그 viewer를 페이지별로 스와이프하며 캡처
// 사용: node capture-catalog-pages2.mjs <viewer-url> <prefix> [pages=4]
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const URL = process.argv[2];
const PREFIX = process.argv[3] || 'cat';
const PAGES = parseInt(process.argv[4] || '4', 10);
const VW = 390, VH = 838;
const OUT = resolve('./screenshots/catalog'); if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

async function swipeNext(){
  // 오른쪽→왼쪽 스와이프 (다음 페이지)
  await page.mouse.move(340, 430); await page.mouse.down();
  for(let s=1;s<=12;s++){ await page.mouse.move(340-(300*s/12), 430); }
  await page.mouse.up();
  await page.waitForTimeout(1100);
}
for (let i=1;i<=PAGES;i++){
  await page.waitForTimeout(700);
  const f = `${OUT}/${PREFIX}-p${i}.png`;
  await page.screenshot({ path: f });
  console.error(`captured p${i} -> ${f}`);
  if (i<PAGES) await swipeNext();
}
await browser.close();
console.log('done');
