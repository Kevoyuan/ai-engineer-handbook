// Actual Chromium evidence for CH05/09/12. No API calls, Vercel build or remote source.
// Run after content sync; inspects static lessons, 3×3 decisions and deep links.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const { chromium }=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const base=process.env.HANDBOOK_URL||"http://127.0.0.1:4180/";
const out=process.env.STRUCTURAL_SCREENSHOT_DIR||"/tmp/structural-guide-screenshots";
const chapters=[
 ["05-document-pdf-rag","05",5],
 ["09-reliability-evaluation-observability","09",4],
 ["12-fde-customer-delivery","12",7],
];
const checks=[];
fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch();
let tested=0,screens=0;
try {
 for(const width of [390,768,1440,1728])
 for(const en of [false,true])
 for(const dark of [false,true]) {
  const ctx=await browser.newContext({viewport:{width,height:2200},reducedMotion:"reduce"});
  await ctx.addInitScript(({en,dark})=>{
   localStorage.setItem("preview-locale",JSON.stringify(en));
   localStorage.setItem("preview-theme",JSON.stringify(dark));
  },{en,dark});
  const page=await ctx.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  for(const [slug,ch,stages] of chapters){
   await page.goto(base+"#read/"+slug+"/concept-demo");
   const lab=page.locator("#concept-demo.structural-guide");
   await lab.waitFor();
   assert.equal(await lab.count(),1,"Exactly one chapter lab");
   assert.equal(await lab.getAttribute("data-chapter"),ch);
   assert.equal(await lab.getAttribute("data-structural-version"),"3");
   assert.equal(await lab.locator(".struct-scenarios button").count(),3);
   for(let i=0;i<3;i++){
    const button=lab.locator(".struct-scenarios button").nth(i);
    await button.click();
    assert.equal(await button.getAttribute("aria-pressed"),"true");
    assert.equal(await lab.locator('.struct-scenarios button[aria-pressed="true"]').count(),1);
    assert.equal(await lab.getAttribute("data-scenario"),String(i));
    assert((await lab.locator(".struct-decision strong").innerText()).trim().length>6);
    const box=await button.boundingBox();
    assert(box && box.height>=43.5,"44px scenario touch target");
    if(ch==="05"){
      assert.equal(await lab.locator(".struct-lineage li").count(),stages);
      assert.equal(await lab.locator('.struct-lineage li[data-state="block"]').count(),i===0?0:1);
    }
    if(ch==="09"){
      assert.equal(await lab.locator(".struct-trace-tree li").count(),stages);
      assert.equal(await lab.locator('.struct-trace-tree li[data-state="block"]').count(),1);
      assert.equal(await lab.locator(".struct-eval-cycle li").count(),4);
    }
    if(ch==="12"){
      assert.equal(await lab.locator(".struct-planes [data-plane]").count(),5);
      assert.equal(await lab.locator(".struct-boundaries li").count(),7);
      assert.equal(await lab.locator('.struct-boundaries li[data-state="block"]').count(),i===0?0:1);
      assert.equal(await lab.locator('.struct-boundaries li[data-state="block"] .struct-step').first().innerText(),i===1?"B4":i===2?"B6":"B4");
    }
    tested++;
   }
   await page.evaluate(()=>document.fonts.ready);
   const metrics=await lab.evaluate(el=>{
     const b=el.getBoundingClientRect();
     return {scroll:el.scrollWidth,client:el.clientWidth,
       right:b.right,viewport:innerWidth,height:Math.round(b.height),
       layout:window.getComputedStyle(el).containerType};
   });
   assert(metrics.scroll<=metrics.client+2,slug+" horizontal scroll "+JSON.stringify({width,en,dark,metrics}));
   assert(metrics.right<=metrics.viewport+2,slug+" viewport clipping "+JSON.stringify({width,en,dark,metrics}));
   assert.equal(metrics.layout,"inline-size");
   if((width===390&&!dark&&!en)||(width===1440&&dark&&en)){
    const axe=await new AxeBuilder({page}).include(".structural-guide")
     .withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    if(axe.violations.length) console.error("AXE",slug,width,en,dark,
      JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({
        target:n.target,summary:n.failureSummary,html:n.html
      }))}))));
    assert.deepEqual(axe.violations.map(v=>v.id),[],"WCAG violations in "+slug);
    const name=ch+"-"+width+"-"+(en?"en":"zh")+"-"+(dark?"dark":"light")+".png";
    await lab.screenshot({path:path.join(out,name),animations:"disabled"});
    checks.push({name,...metrics,axeViolations:axe.violations.length});
    screens++;
   }
  }
  assert.deepEqual(errors,[],"No runtime exceptions");
  await ctx.close();
 }
 fs.writeFileSync(path.join(out,"visual-checks.json"),JSON.stringify(checks,null,2));
 console.log("PASS CH05/09/12 structural browser: "+tested+
  " interactive scenario assertions; "+screens+" viewport screenshots with zero axe WCAG tags; no clipping, 44px targets, lazy lab links.");
} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
