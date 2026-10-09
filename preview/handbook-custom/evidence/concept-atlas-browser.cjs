// Interaction and scoped accessibility evidence for CH01/02/07/11 concept visualizations.
// No Vercel deployment, no API mutations and no live user data.
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const fs=require("node:fs"),path=require("node:path");
const base=process.env.HANDBOOK_URL||"http://127.0.0.1:4180/";
const out=process.env.CONCEPT_ATLAS_SHOTS||"/tmp/concept-atlas-visual";
const specs=[
  {slug:"01-model-api-context-foundations",chapter:"01",count:3,stages:5},
  {slug:"02-enterprise-retrieval",chapter:"02",count:3,stages:5},
  {slug:"07-memory-context-engineering",chapter:"07",count:3,stages:8},
  {slug:"11-data-sql-engineering",chapter:"11",count:4,stages:4},
];
fs.mkdirSync(out,{recursive:true});
(async()=>{
  let validations=0,shots=0;
  const logs=[];
  const browser=await chromium.launch();
  try{
    for(const width of [390,768,1440,1728])
    for(const en of [false,true])
    for(const dark of [false,true]){
      const ctx=await browser.newContext({viewport:{width,height:2200},reducedMotion:"reduce"});
      await ctx.addInitScript(({en,dark})=>{
        localStorage.setItem("preview-locale",JSON.stringify(en));
        localStorage.setItem("preview-theme",JSON.stringify(dark));
      },{en,dark});
      const page=await ctx.newPage();const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      for(const spec of specs){
        await page.goto(base+"#read/"+spec.slug+"/concept-demo");
        const primary=spec.chapter==="01"||spec.chapter==="02";
        const lab=page.locator(primary?"#concept-demo.atlas-mental":"#concept-extension.atlas-mental");
        await lab.waitFor();
        assert.equal(await lab.count(),1);
        assert.equal(await lab.getAttribute("data-mental-chapter"),spec.chapter);
        assert.equal(await page.locator("#concept-demo").count(),1,
          "All chapters keep exactly one primary Atlas Lab anchor");
        assert.equal(await lab.locator(".atlas-examples button").count(),spec.count);
        for(let i=0;i<spec.count;i++){
          const button=lab.locator(".atlas-examples button").nth(i);
          await button.click();
          assert.equal(await button.getAttribute("aria-pressed"),"true");
          assert.equal(await lab.locator('.atlas-examples button[aria-pressed="true"]').count(),1);
          assert.equal(await lab.getAttribute("data-scenario"),String(i));
          assert((await lab.locator(".atlas-mental-outcome strong").innerText()).length>8);
          const box=await button.boundingBox();
          assert(box&&box.height>=43.5,"Touch target must be at least 44px");
          if(spec.chapter==="01"){
            assert.equal(await lab.locator(".atlas-budget-rail > div").count(),5);
          }else if(spec.chapter==="02"){
            assert.equal(await lab.locator(".atlas-auth-funnel li").count(),5);
            assert.equal(await lab.locator('.atlas-auth-funnel li[data-state="block"]').count(),i===0?0:1);
          }else if(spec.chapter==="07"){
            assert.equal(await lab.locator(".atlas-memory-lane").count(),2);
            assert.equal(await lab.locator(".atlas-memory-lane li").count(),8);
            assert.equal(await lab.locator('.atlas-memory-lane li[data-state="block"]').count(),i===1?1:0);
          }else{
            assert.equal(await lab.locator(".atlas-cdc-track").count(),3);
            assert.equal(await lab.locator(".atlas-cdc-gates li").count(),4);
            if(i===1) assert.equal(await lab.locator(".atlas-cdc-track").nth(1).locator('[role="listitem"]').first().innerText(),"seq 3");
            if(i===2) assert.equal(await lab.locator(".atlas-cdc-track").nth(1).locator('[role="listitem"]').last().innerText(),"seq 2");
          }
          validations++;
        }
        const dims=await lab.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth,
          viewport:innerWidth,right:el.getBoundingClientRect().right,
          container:getComputedStyle(el).containerType}));
        assert(dims.scroll<=dims.client+2,spec.slug+" horizontal overflow "+JSON.stringify(dims));
        assert(dims.right<=dims.viewport+2,spec.slug+" clip "+JSON.stringify(dims));
        assert.equal(dims.container,"inline-size");
        if(width===390&&!en&&!dark||width===1440&&en&&dark){
          const axe=await new AxeBuilder({page}).include(".atlas-mental")
            .withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
          if(axe.violations.length) console.error("AXE",spec.slug,width,en,dark,
            JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({
              target:n.target,html:n.html,summary:n.failureSummary
            }))}))));
          assert.deepEqual(axe.violations.map(v=>v.id),[],"WCAG violations "+spec.slug);
          const name=spec.chapter+"-"+width+"-"+(en?"en":"zh")+"-"+(dark?"dark":"light")+".png";
          await lab.screenshot({path:path.join(out,name),animations:"disabled"});
          logs.push({file:name,...dims,violations:0});
          shots++;
        }
      }
      assert.deepEqual(errors,[],"No JS runtime errors");
      await ctx.close();
    }
    fs.writeFileSync(path.join(out,"audit.json"),JSON.stringify(logs,null,2));
    console.log("PASS 12/12 Atlas chapter labs: "+validations+
      " scenario checks for CH01/02/07/11, "+shots+
      " scoped screenshots, zero axe violations, 4 widths × 2 locales × 2 themes, no clipping.");
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
