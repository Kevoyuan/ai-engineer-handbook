// Cross-surface UI regression: inspect shipped Atlas, Notebook, Search, Concept,
// Architecture and all ten Reader chapters. DOM geometry is measured in a real browser.
const { chromium } = require("../node_modules/playwright");
const AxeBuilder = require("../node_modules/@axe-core/playwright").default;
const assert = require("node:assert/strict");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";
const routes = [
  "#home/all", "#home/saved", "#concept/query-routing", "#map",
  "01-model-api-context-foundations", "02-enterprise-retrieval",
  "03-hybrid-retrieval-query-routing", "04-rag-reliability-selective-answering",
  "05-document-pdf-rag", "06-skills-routing",
  "07-memory-context-engineering", "08-agent-orchestration",
  "09-reliability-evaluation-observability", "10-serving-deployment-ai-platform",
].map(x => x.startsWith("#") ? x : "#read/" + x);
const errors = [];
const records = [];
(async () => {
  const browser = await chromium.launch();
  try {
    // Two high-value combinations for every route at every target width:
    // include both locales and both visual themes across the complete spine.
    for (const { en, dark } of [{ en:false, dark:false }, { en:true, dark:true }]) {
      const context = await browser.newContext({ reducedMotion:"reduce" });
      await context.addInitScript(({en,dark}) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
        window.__name = fn => fn;
      }, {en,dark});
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      for (const width of [390, 768, 1440, 1728]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of routes) {
          await page.goto(base + route);
          await page.locator("#content").waitFor();
          if (route.includes("#read/") && /03-|04-|06-|07-|08-/.test(route))
            await page.locator("#concept-demo").waitFor({ timeout: 25000 });
          await page.evaluate(() => document.fonts.ready);
          const state = await page.evaluate(() => {
            const content = document.querySelector("#content");
            const demo = document.querySelector("#concept-demo");
            const poster = document.querySelector(".archify-poster");
            const flow = document.querySelector(".concept-flow");
            const feedback = document.querySelector(".knowledge-feedback");
            const tooltip = document.querySelector(".search-dialog");
            return {
              pageOverflow: document.documentElement.scrollWidth > innerWidth + 2,
              contentOverflow: content && content.getBoundingClientRect().right > innerWidth + 2,
              demoOverflow: demo && demo.scrollWidth > demo.clientWidth + 2,
              posterHeight: poster && Math.round(poster.getBoundingClientRect().height),
              posterLinks: document.querySelectorAll(".archify-overview a[href$='.html']").length,
              nodeHeights: flow ? [...flow.querySelectorAll(".concept-node")].map(x => Math.round(x.getBoundingClientRect().height)) : [],
              feedbackHeight: feedback && Math.round(feedback.getBoundingClientRect().height),
              route: location.hash, viewWidth: innerWidth,
              hasHeading: !!content?.querySelector("h1"),
            };
          });
          assert(!state.pageOverflow && !state.contentOverflow && !state.demoOverflow,
            "Unintended page/component overflow: " + JSON.stringify({route,width,en,dark,state}));
          assert(state.hasHeading, "Missing primary heading: " + route);
          if (state.posterHeight !== null) {
            assert(state.posterHeight <= 274,
              "Architecture thumbnail too tall: " + JSON.stringify({route,width,height:state.posterHeight}));
            assert.equal(state.posterLinks, 1, "Overview must have one explicit open-map action");
          }
          if (state.nodeHeights.length) {
            assert.equal(state.nodeHeights.length, 4);
            assert(state.nodeHeights.every(n => n <= (width < 768 ? 150 : 180)),
              "Teaching nodes exceed compact target: " + JSON.stringify({route,width,state}));
          }
          if (state.feedbackHeight !== null && state.feedbackHeight > 0)
            assert(state.feedbackHeight < 126,
              "Unanswered practice reserves blank space: " + JSON.stringify({route,width,h:state.feedbackHeight}));
          records.push({route,width,en,dark,state});
        }
      }
      await context.close();
    }

    // Cross-surface keyboard search and actual Notebook save/remove flow.
    const context = await browser.newContext({ viewport:{width:1440,height:900} });
    await context.addInitScript(() => {
      localStorage.setItem("preview-locale", JSON.stringify(false));
      localStorage.setItem("preview-theme", JSON.stringify(false));
      localStorage.removeItem("handbook-bookmarks");
      window.__name = fn => fn;
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "#home/all");
    await page.keyboard.press("Control+k");
    await page.getByRole("dialog").waitFor();
    await page.getByRole("textbox",{name:"搜索关键词"}).fill("BM25");
    await page.locator(".result").first().waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(),0);
    await page.locator(".atlas-node-row").first().getByRole("button").click();
    await page.goto(base + "#home/saved");
    await page.locator(".notebook-row").first().waitFor();
    assert.equal(await page.locator(".notebook-row").count(),1);
    await page.locator(".notebook-row").first().getByRole("button").click();
    await page.getByText("还没有收藏").waitFor();
    await context.close();

    // Full semantic/accessibility pass for representative surface families.
    const access = await browser.newContext({viewport:{width:390,height:900},reducedMotion:"reduce"});
    await access.addInitScript(() => { window.__name=fn=>fn; });
    const a11y = await access.newPage();
    for(const route of ["#home/all","#home/saved","#concept/bm25","#map","#read/03-hybrid-retrieval-query-routing","#read/06-skills-routing"]){
      await a11y.goto(base+route);
      if(route.includes("#read/0"))await a11y.locator("#concept-demo").waitFor();
      const axe=await new AxeBuilder({page:a11y})
        .include("#content")
        .withTags(["wcag2a","wcag2aa","wcag21aa"])
        .analyze();
      assert.equal(axe.violations.length,0,
        "Accessibility: "+route+" "+JSON.stringify(axe.violations.map(x=>({id:x.id,targets:x.nodes.map(n=>n.target)}))));
    }
    await access.close();
    assert.deepEqual(errors,[],"Unexpected browser runtime exceptions");
    console.log("PASS: "+records.length+" route/viewport/locale/theme layouts, "
      +"search and Notebook interactions, six WCAG surface families.");
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exit(1); });
