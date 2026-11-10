/* Full-site design evidence (Chromium). Browser checks source build, not production mutation. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = (process.env.HANDBOOK_URL || 'http://127.0.0.1:4180').replace(/\/$/, '');
const out = process.env.SITEWIDE_AUDIT_DIR || path.join(__dirname,'sitewide-audit-review');
fs.mkdirSync(out,{recursive:true});
const chapters = ['01-model-api-context-foundations','02-enterprise-retrieval','03-hybrid-retrieval-query-routing','04-rag-reliability-selective-answering','05-document-pdf-rag','06-skills-routing','07-memory-context-engineering','08-agent-orchestration','09-reliability-evaluation-observability','10-serving-deployment-ai-platform','11-data-sql-engineering','12-fde-customer-delivery'];
const envs = [
 {w:390,h:844,lang:'zh',theme:'light'},
 {w:1440,h:900,lang:'en',theme:'graphite'},
 {w:320,h:720,lang:'zh',theme:'forest'},
 {w:768,h:900,lang:'en',theme:'ink'}
];
const result = {runAt:new Date().toISOString(),source:'GitHub Actions source-built site',screenshots:[],screens:[],errors:[]};
async function open(page,hash,selector) {
 await page.goto(base+'/'+hash,{waitUntil:'domcontentloaded',timeout:30000});
 try {await page.locator(selector).first().waitFor({state:'visible',timeout:18000});}
 catch(e){result.errors.push({hash,stage:'load',msg:String(e).slice(0,220)});}
 try {await page.evaluate(()=>document.fonts.ready);}catch(e){}
 await page.waitForTimeout(120);
}
async function measure(page,kind,id) {
 return await page.evaluate(({kind,id})=>{
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};
  const shells=[...document.querySelectorAll('.canonical-content :is(.atlas-figure-shell,.lab,.bfs-canvas,.concept-demo,.fig)')].filter(visible).map(el=>({id:el.id,cls:el.className,width:Math.round(el.getBoundingClientRect().width),overflow:el.scrollWidth-el.clientWidth,container:getComputedStyle(el).containerType}));
  const controls=[...document.querySelectorAll('button,summary,[role=button],input')].filter(visible).map(el=>({tag:el.tagName,name:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,65),w:Math.round(el.getBoundingClientRect().width),h:Math.round(el.getBoundingClientRect().height)}));
  const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
  return {kind,id,title:document.title,route:location.hash,viewport:innerWidth,
   rootOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   header:document.querySelector('.topbar, .reader-topbar')?.getBoundingClientRect().height||null,
   heading:document.querySelector('h1')?.textContent?.trim().slice(0,120)||null,
   figureCount:shells.length,figureOverflows:shells.filter(x=>x.overflow>4).slice(0,20),
   figures:shells.filter(x=>x.cls.includes('atlas-figure-shell')).map(x=>({id:x.id,width:x.width,overflow:x.overflow})),
   tinyControls:controls.filter(x=>x.w<40||x.h<40).slice(0,20),controlCount:controls.length,
   duplicateIds:[...new Set(ids.filter((x,i)=>x&&ids.indexOf(x)!==i))].slice(0,12),
   bodyText:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,240)};
 },{kind,id});
}
async function snap(page,name){const file=name+'.png';try {await page.screenshot({path:path.join(out,file),fullPage:false,animations:'disabled',timeout:16000});result.screenshots.push(file);return file;}catch(e){result.errors.push({step:name,stage:'screenshot',msg:String(e).slice(0,190)});return null;}}
async function inspect(page,env,id,hash,selector){await open(page,hash,selector);const info=await measure(page,id.startsWith('CH')?'reader':'surface',id);info.env=env;info.topImage=await snap(page,id+'-'+env.w+'-'+env.lang+'-'+env.theme+'-top');result.screens.push(info);return info;}
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const env of envs){
  const ctx=await browser.newContext({viewport:{width:env.w,height:env.h},reducedMotion:'reduce'});
  await ctx.addInitScript(({lang,theme})=>{localStorage.setItem('preview-locale',JSON.stringify(lang==='en'));localStorage.setItem('preview-theme',JSON.stringify(theme!=='light'));localStorage.setItem('preview-dark-preset',JSON.stringify(theme==='light'?'graphite':theme));},env);
  const page=await ctx.newPage();const runtime=[];page.on('pageerror',e=>runtime.push(String(e).slice(0,220)));
  for(const [id,hash,selector] of [['Atlas','#home/all','.atlas-shell'],['Notebook','#home/saved','.notebook-shell'],['Concept','#concept/query-routing','.concept-page'],['Architecture','#map','.architecture-page']]){
   await inspect(page,env,id,hash,selector);
  }
  await open(page,'#home/all','.atlas-shell');
  const trigger=page.locator('[aria-label="搜索知识系统"],[aria-label="Search the atlas"]').first();
  try{
   if(await trigger.count()){await trigger.click({timeout:5000});const s=await measure(page,'dialog','Search');s.env=env;s.image=await snap(page,'Search-'+env.w+'-'+env.lang+'-open');result.screens.push(s);
    const input=page.locator('input[aria-label="搜索关键词"],input[aria-label="Search keywords"]').first();
    if(await input.count()){await input.fill('RAG');await page.waitForTimeout(300);const q=await measure(page,'dialog','SearchResults');q.env=env;q.image=await snap(page,'Search-'+env.w+'-'+env.lang+'-results');result.screens.push(q);}
    await page.keyboard.press('Escape');}
   else result.errors.push({env,step:'Search',msg:'Search trigger not found'});
  }catch(e){result.errors.push({env,step:'Search',msg:String(e).slice(0,240)});}
  for(let i=0;i<chapters.length;i++){
   const id='CH'+String(i+1).padStart(2,'0');const info=await inspect(page,env,id,'#read/'+chapters[i],'.canonical-content');
   const selectors=['.canonical-content .concept-demo','.canonical-content .atlas-figure-shell','.canonical-content .bfs-canvas'];
   let selected='';for(const sel of selectors){const loc=page.locator(sel).first();if(await loc.count()&&await loc.isVisible()){selected=sel;break;}}
   if(selected){try{await page.locator(selected).first().scrollIntoViewIfNeeded({timeout:10000});await page.waitForTimeout(130);info.figureImage=await snap(page,id+'-'+env.w+'-'+env.lang+'-'+env.theme+'-figure');}catch(e){result.errors.push({id,env,stage:'figure',msg:String(e).slice(0,190)});}}
   else result.errors.push({id,env,stage:'figure',msg:'No visible teaching figure'});
  }
  if(runtime.length)result.errors.push({env,stage:'pageerrors',errors:runtime.slice(0,15)});
  console.log('DESIGN_AUDIT_ENV',env.w,env.lang,env.theme,'screens',result.screens.length,'images',result.screenshots.length);
  await ctx.close();
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'sitewide-design-audit.json'),JSON.stringify(result,null,2));
console.log('DESIGN_AUDIT_DONE',result.screens.length,result.screenshots.length,result.errors.length);
})().catch(e=>{result.errors.push({fatal:String(e).slice(0,700)});fs.writeFileSync(path.join(out,'sitewide-design-audit.json'),JSON.stringify(result,null,2));console.error(e);process.exitCode=1;});
