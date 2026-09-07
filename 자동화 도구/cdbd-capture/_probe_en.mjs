import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
for (const loc of ['en-US','ko-KR']) {
  const c=await b.newContext({viewport:{width:430,height:900},locale:loc});
  const p=await c.newPage();
  await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(3500);
  const t = await p.evaluate(()=>document.body.innerText.slice(0,400));
  console.log('=== locale',loc,'===');
  console.log(t.replace(/\n{2,}/g,'\n'));
  console.log('URL now:', p.url());
  await c.close();
}
await b.close();
