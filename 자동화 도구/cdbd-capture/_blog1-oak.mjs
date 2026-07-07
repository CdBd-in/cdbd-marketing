
import { chromium } from 'playwright';
const url='https://www.cdbd.in/templates/catalog/oak_table/viewer';
const OUT='/Users/designer/Documents/GitHub/design/cdbd-marketing/.temp/blog-thumb';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:390,height:860},locale:'ko-KR',deviceScaleFactor:2,isMobile:true});
const p=await ctx.newPage();
await p.goto(url,{waitUntil:'load',timeout:60000});
await p.waitForTimeout(5000);

// hero clip (top)
await p.screenshot({path:OUT+'/oak-hero.png',clip:{x:0,y:0,width:390,height:860}});
// scroll inner container via wheel, then content clip
await p.mouse.move(195,430);
for(let i=0;i<6;i++){ await p.mouse.wheel(0,220); await p.waitForTimeout(300);}
await p.waitForTimeout(600);
await p.screenshot({path:OUT+'/oak-content.png',clip:{x:0,y:0,width:390,height:860}});
// scroll more for a lower section
for(let i=0;i<8;i++){ await p.mouse.wheel(0,240); await p.waitForTimeout(280);}
await p.waitForTimeout(600);
await p.screenshot({path:OUT+'/oak-lower.png',clip:{x:0,y:0,width:390,height:860}});
console.log('done');
await b.close();
