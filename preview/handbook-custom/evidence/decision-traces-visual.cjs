// Layout and accessibility evidence; no Vercel calls or publishing.
// Generates scoped screenshots and a small JSON report for the draft PR.
const {chromium} = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const out = process.env.DECISION_VISUAL_DIR || "/tmp/decision-traces-review";
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";
const cases = [
  {short:"03-route-id-mobile-zh-light", slug:"03-hybrid-retrieval-query-routing", width:390, en:false, dark:false, scenario:0, step:3},
  {short:"03-route-graph-desktop-en-dark", slug:"03-hybrid-retrieval-query-routing", width:1440, en:true, dark:true, scenario:2, step:3},
  {short:"04-conflict-tablet-zh-light", slug:"04-rag-reliability-selective-answering", width:768, en:false, dark:false, scenario:1, step:3},
  {short:"04-insufficient-desktop-en-dark", slug:"04-rag-reliability-selective-answering", width:1440, en:true, dark:true, scenario:2, step:3},
  {short:"08-retry-gate-mobile-zh-light", slug:"08-agent-orchestration", width:390, en:false, dark:false, scenario:1, step:3},
  {short:"08-retry-finished-desktop-en-dark", slug:"08-agent-orchestration", width:1440, en:true, dark:true, scenario:1, step:7},
  {short:"08-budget-tablet-zh-dark", slug:"08-agent-orchestration", width:768, en:false, dark:true, scenario:2, step:3},
];
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();
 const report=[];
 try {
  for(const config of cases) {
   const context=await browser.newContext({viewport:{width:config.width,height:2200},reducedMotion:"reduce"});
   await context.addInitScript(({en,dark})=>{
     localStorage.setItem("preview-locale",JSON.stringify(en));
     localStorage.setItem("preview-theme",JSON.stringify(dark));
   },{en:config.en,dark:config.dark});
   const page=await context.newPage();
   const runtime=[];
   page.on("pageerror",e=>runtime.push(e.message));
   await page.goto(base+"#read/"+config.slug+"/concept-demo");
   const trace=page.locator("#concept-demo .decision-trace");
   await trace.waitFor();
   await page.locator("#concept-example").selectOption(String(config.scenario));
   for(let k=0;k<config.step;k++) {
     await page.locator("#concept-demo").getByRole("button",{name:config.en?"Next":"下一步",exact:true}).click();
   }
   await page.evaluate(()=>document.fonts.ready);
   const audit=await trace.evaluate(node=>{
     const rect=node.getBoundingClientRect();
     const leaves=[...node.querySelectorAll("*")].filter(el=>el.childElementCount===0);
     const overflowing=leaves.filter(el=>el.getBoundingClientRect().right>rect.right+3 ||
        el.getBoundingClientRect().left<rect.left-3).slice(0,8).map(el=>({
           text:(el.textContent||"").trim().slice(0,70),outer:el.outerHTML.slice(0,150)
        }));
     return {
       width:rect.width,height:rect.height,right:rect.right,viewport:innerWidth,
       scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,
       smallestNonEmptyFontPx:Math.min(...leaves.filter(x=>(x.textContent||"").trim()).map(x=>parseFloat(getComputedStyle(x).fontSize))),
       overflowing
     };
   });
   const axe=await new AxeBuilder({page}).include(".decision-trace").withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
   await trace.screenshot({path:path.join(out,config.short+".png"),animations:"disabled"});
   report.push({case:config.short,...audit,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target).slice(0,5)})),runtime});
   assert(audit.scrollWidth<=audit.clientWidth+2,config.short+" content scroll overflow");
   assert(audit.right<=audit.viewport+2,config.short+" viewport clipped");
   assert.deepEqual(audit.overflowing,[],config.short+" leaf overflow");
   assert.deepEqual(runtime,[],config.short+" runtime exceptions");
   assert.deepEqual(axe.violations.map(v=>v.id),[],config.short+" WCAG issues: "+JSON.stringify(axe.violations.map(v=>v.id)));
   await context.close();
  }
  fs.writeFileSync(path.join(out,"visual-audit.json"),JSON.stringify(report,null,2));
  console.log("PASS visual and WCAG smoke: "+report.length+" screenshots, no overflow or WCAG tagged violations.");
  console.log(report.map(r=>({case:r.case,contentWidth:Math.round(r.width),contentHeight:Math.round(r.height),minFont:Math.round(r.smallestNonEmptyFontPx),violations:r.violations.length})));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
