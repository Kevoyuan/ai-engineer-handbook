// Graph-first browser contract: CH03, CH04, CH06, CH08, CH10.
// Confirms route/gate/return edges, not just the presence of decorative arrows.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const base=process.env.HANDBOOK_URL||"http://127.0.0.1:4180/";
const out=process.env.REMAINING_GRAPH_SHOTS||"/tmp/remaining-graph-evidence";
const chapters=[
 {slug:"03-hybrid-retrieval-query-routing",id:"routing",samples:3},
 {slug:"04-rag-reliability-selective-answering",id:"evidence-gates",samples:3},
 {slug:"06-skills-routing",id:"skills",samples:3},
 {slug:"08-agent-orchestration",id:"agent-loop",samples:3},
 {slug:"10-serving-deployment-ai-platform",id:"serving",samples:3},
];
const info=[];
fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch();
let samples=0,images=0;
try{
 for(const width of [390,768,1440,1728])
 for(const en of [false,true])
 for(const dark of [false,true]){
  const context=await browser.newContext({viewport:{width,height:1900},reducedMotion:"reduce"});
  await context.addInitScript(({en,dark})=>{
   localStorage.setItem("preview-locale",JSON.stringify(en));
   localStorage.setItem("preview-theme",JSON.stringify(dark));
  },{en,dark});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  for(const spec of chapters){
   await page.goto(base+"#read/"+spec.slug+"/concept-demo");
   const demo=page.locator("#concept-demo");
   const graph=demo.locator('[data-graph="'+spec.id+'"]');
   await graph.waitFor();
   assert.equal(await graph.count(),1,"A single graph must be primary for "+spec.id);
   assert.equal(await graph.locator(".atlas-graph-svg").count(),1);
   assert((await graph.locator("[data-edge]").count())>=6,"Must have real directed edges");
   assert((await graph.locator("[data-node]").count())>=7,"Must have real architecture nodes");
   for(let i=0;i<spec.samples;i++){
    if(spec.id==="serving"){
      const button=demo.locator(".v2-scenarios .v2-scenario").nth(i);
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"),"true");
    }else if(spec.id==="skills"){
      // CH06 is owned by SkillSimulator, not the generic LessonPlayer.
      const tab=demo.locator(".sim-scenarios button").nth(i);
      await tab.click();
      assert.equal(await tab.getAttribute("data-state"),"active");
      const forward=demo.getByRole("button",{name:en?"Step forward":"单步执行",exact:true});
      for(let k=0;k<(i===0?5:2);k++)await forward.click();
      assert.equal(await forward.isDisabled(),true,
        "Skill input/permission gates terminate the simulator early");
      assert.equal(await demo.locator(".knowledge-trigger").count(),1);
    }else{
      await demo.locator("#concept-example").selectOption(String(i));
      const next=demo.getByRole("button",{name:en?"Next":"下一步",exact:true});
      const steps=spec.id==="agent-loop"&&i===1?8:4;
      for(let n=1;n<steps;n++)await next.click();
      assert.equal(await next.isDisabled(),true);
      assert.equal(await demo.locator(".concept-flow .concept-node").count(),4,
        "Original 4-node lesson and practice remain");
      assert.equal(await demo.locator(".knowledge-trigger").count(),1);
    }
    if(spec.id==="routing"){
      const selected=[["exact","bm25"],["bm25","dense"],["graph","docs"]][i];
      assert.equal(await graph.locator('[data-node="router"]').getAttribute("data-state"),"active");
      for(const id of ["exact","bm25","dense","graph","docs"]){
       const expected=selected.includes(id)?"active":"idle";
       assert.equal(await graph.locator('[data-edge="route-'+id+'"]').getAttribute("data-state"),expected);
      }
      assert.equal(await graph.locator('[data-edge="fusion-evidence"]').getAttribute("data-state"),"active");
    }
    if(spec.id==="evidence-gates"){
      assert.equal(await graph.locator('[data-node="g4"]').getAttribute("data-state"),i===0?"active":"blocked");
      const chosen=["answer","resolve","abstain"][i];
      assert.equal(await graph.locator('[data-edge="policy-'+chosen+'"]').getAttribute("data-state"),
        i===0?"active":"blocked");
      assert.equal(await graph.locator('[data-node="g5"]').getAttribute("data-state"),"active");
    }
    if(spec.id==="skills"){
      assert.equal(await graph.locator('[data-node="tool"]').getAttribute("data-state"),i===0?"active":"idle");
      assert.equal(await graph.locator('[data-edge="skill-exit-clarify"]').getAttribute("data-state"),i===1?"blocked":"idle");
      assert.equal(await graph.locator('[data-edge="skill-exit-reject"]').getAttribute("data-state"),i===2?"blocked":"idle");
    }
    if(spec.id==="agent-loop"){
      assert.equal(await graph.locator('[data-edge="retry-return"]').count(),i===1?1:0);
      if(i===1){
       assert.equal(await graph.locator('[data-edge="retry-return"]').getAttribute("data-state"),"active");
       assert.equal(await graph.locator('[data-node="check2"]').getAttribute("data-state"),"active");
      }
      assert.equal(await graph.locator('[data-node="handoff"]').getAttribute("data-state"),i===2?"blocked":"idle");
      assert.equal(await graph.locator('[data-node="stop"]').getAttribute("data-state"),i===2?"idle":"active");
    }
    if(spec.id==="serving"){
      assert.equal(await graph.locator('[data-edge="namespace-isolation"]').getAttribute("data-state"),i===2?"blocked":"idle");
      assert.equal(await graph.locator('[data-node="scope"]').getAttribute("data-state"),i===2?"blocked":"active");
      assert.equal(await graph.locator('[data-node="decode"]').getAttribute("data-state"),"active");
      assert.equal(await demo.locator(".v2-graph-details").count(),1);
    }
    const geometry=await graph.evaluate(el=>{
      const rect=el.getBoundingClientRect();
      const nodes=[...el.querySelectorAll(".atlas-graph-node")];
      const outside=nodes.filter(n=>{
        const r=n.getBoundingClientRect();
        return r.left<rect.left-2||r.right>rect.right+2;
      }).map(n=>n.dataset.node);
      return {position:getComputedStyle(nodes[0]).position,
       stageWidth:el.querySelector(".atlas-graph-stage").clientWidth,
       right:rect.right,viewport:innerWidth,scroll:el.scrollWidth,client:el.clientWidth,
       outside};
    });
    assert.equal(geometry.position,"absolute","Node positions must align to SVG viewBox");
    assert.equal(geometry.outside.length,0,"Nodes must remain within canvas "+JSON.stringify({spec:spec.id,width,geometry}));
    assert(geometry.scroll<=geometry.client+2,"Graph overflow "+JSON.stringify({spec:spec.id,width,geometry}));
    assert(geometry.right<=geometry.viewport+2,"Graph clips viewport");
    if((width===390&&!en&&!dark)||(width===1440&&en&&dark)){
      if(i===spec.samples-1){
       const axe=await new AxeBuilder({page}).include('[data-graph="'+spec.id+'"]')
        .withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
       if(axe.violations.length)console.error("AXE",spec.id,
         JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
       assert.equal(axe.violations.length,0,"Scoped WCAG violations "+spec.id);
       const name=spec.id+"-"+width+"-"+(en?"en":"zh")+"-"+(dark?"dark":"light")+".png";
       await graph.screenshot({path:path.join(out,name),animations:"disabled"});
       info.push({name,scenario:i,...geometry,axeViolations:0});
       images++;
      }
    }
    samples++;
   }
  }
  assert.deepEqual(errors,[],"No JS runtime errors");
  await context.close();
 }
 fs.writeFileSync(path.join(out,"graph-audit.json"),JSON.stringify(info,null,2));
 console.log("PASS Graph-first CH03/04/06/08/10: "+samples+
  " scenarios across 4 widths × 2 languages × 2 themes, "+images+
  " screenshot/axe scopes, no horizontal overflow or missing graph endpoints.");
} finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
