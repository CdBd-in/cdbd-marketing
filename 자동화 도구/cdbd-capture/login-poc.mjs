// CdBd 로그인 + 에디터 진입 PoC
// 사용법: node login-poc.mjs
// 사전 준비: .env 파일에 CDBD_EMAIL, CDBD_PASSWORD 입력

import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const EMAIL = process.env.CDBD_EMAIL;
const PASSWORD = process.env.CDBD_PASSWORD;
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = parseInt(process.env.SLOW_MO || '0', 10);
const OUT_DIR = resolve(process.env.CAPTURE_OUTPUT_DIR || './screenshots');

if (!EMAIL || !PASSWORD || EMAIL.startsWith('your-')) {
  console.error('❌ .env 파일에 CDBD_EMAIL, CDBD_PASSWORD 를 채워주세요.');
  console.error('   .env.example 파일을 참고하세요.');
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'ko-KR',
});
const page = await context.newPage();

try {
  console.log('▶ 1) 로그인 페이지 진입');
  await page.goto('https://www.cdbd.in/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(OUT_DIR, '01-login-page.png'), fullPage: false });

  console.log('▶ 2) 이메일·비밀번호 입력');
  // placeholder 기반 selector — DOM 구조 변경에 비교적 강함
  await page.getByPlaceholder(/이메일.*입력/).fill(EMAIL);
  await page.getByPlaceholder(/비밀번호.*입력/).fill(PASSWORD);
  await page.screenshot({ path: join(OUT_DIR, '02-login-filled.png'), fullPage: false });

  console.log('▶ 3) 로그인 버튼 클릭 (Google·Apple 제외, 메인 "로그인하기" 버튼만)');
  // 메인 로그인 버튼은 type=submit, 정확히 "로그인하기" 텍스트
  await page.getByRole('button', { name: '로그인하기', exact: true }).click();

  // 로그인 후 리다이렉트 대기 (URL 변경)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 }).catch(async () => {
    // URL이 안 바뀌면 에러 메시지 확인
    const errMsg = await page.locator('text=/잘못|틀렸|일치하지|오류/').first().textContent().catch(() => null);
    if (errMsg) throw new Error(`로그인 실패 — 페이지 메시지: "${errMsg}"`);
    throw new Error('로그인 후 URL 변화 없음 (캡차·2FA 등 추가 인증 가능성)');
  });
  console.log(`✅ 로그인 성공 — 현재 URL: ${page.url()}`);
  await page.screenshot({ path: join(OUT_DIR, '03-after-login.png'), fullPage: true });

  console.log('▶ 4) 에디터 진입 시도 (cdbd.in/editor)');
  await page.goto('https://www.cdbd.in/editor', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(OUT_DIR, '04-editor.png'), fullPage: true });
  console.log(`현재 URL: ${page.url()}`);
  console.log(`페이지 타이틀: ${await page.title()}`);

  console.log('\n🎉 PoC 완료. screenshots/ 폴더 확인하세요.');
} catch (err) {
  console.error('❌ 에러 발생:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'error.png'), fullPage: true });
  console.log('   error.png 에 현재 상태 저장됨');
  process.exit(1);
} finally {
  await browser.close();
}
