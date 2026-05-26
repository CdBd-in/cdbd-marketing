// CdBd 로그인 + 에디터 진입 공통 유틸
import 'dotenv/config';

export async function loginAndEnterEditor(page, context) {
  const EMAIL = process.env.CDBD_EMAIL;
  const PASSWORD = process.env.CDBD_PASSWORD;
  if (!EMAIL || !PASSWORD || EMAIL.startsWith('your-')) {
    throw new Error('.env 파일에 CDBD_EMAIL, CDBD_PASSWORD 를 채워주세요.');
  }

  // 1. 로그인
  await page.goto('https://www.cdbd.in/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/이메일.*입력/).fill(EMAIL);
  await page.getByPlaceholder(/비밀번호.*입력/).fill(PASSWORD);
  await page.getByRole('button', { name: '로그인하기', exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });

  // 2. 대시보드 진입
  await page.goto('https://www.cdbd.in/editor', { waitUntil: 'networkidle' });
  await page.locator('text=새 페이지').first().waitFor({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  return page;
}

export async function enterFirstPageEditor(page, context) {
  // 첫 페이지 카드 hover → "수정하기" 클릭 → 새 탭에서 에디터 열림
  const cardContainer = page.locator('div').filter({
    has: page.getByText('새로운 페이지', { exact: false }),
  }).filter({
    has: page.getByText(/수정됨/),
  }).first();

  await cardContainer.hover();
  await page.waitForTimeout(1500);

  const editButton = cardContainer.getByRole('button', { name: '수정하기', exact: true });
  const popupPromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
  await editButton.click();
  const newPage = await popupPromise;

  const targetPage = newPage || page;
  await targetPage.waitForLoadState('networkidle').catch(() => {});
  await targetPage.waitForTimeout(4000);  // hydration

  return targetPage;
}

export async function extractUITexts(page) {
  return await page.evaluate(() => {
    const result = { buttons: [], links: [], headings: [], tabs: [], navItems: [] };
    document.querySelectorAll('button, [role="button"]').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 80 && text.length > 0) result.buttons.push(text);
    });
    document.querySelectorAll('a').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 80 && text.length > 0) result.links.push(text);
    });
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 80) result.headings.push(text);
    });
    document.querySelectorAll('[role="tab"], [role="dialog"] h2, [role="menuitem"]').forEach(el => {
      const text = el.innerText?.trim();
      if (text) result.tabs.push(text);
    });
    for (const k of Object.keys(result)) result[k] = [...new Set(result[k])];
    return result;
  });
}
