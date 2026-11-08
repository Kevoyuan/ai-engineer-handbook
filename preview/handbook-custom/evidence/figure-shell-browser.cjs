/* Atlas Figure Shell: one source-aligned presentation owner, seven instances.
 * Verifies DOM geometry, mobile readability, dark/light and original behavior.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const visualDir = process.env.FIGURE_SHELL_VISUAL_DIR;
const chapters = [
  { slug: "06-skills-routing", ids: ["#fig-6-a1", "#fig-6-b2"] },
  { slug: "08-agent-orchestration", ids: ["#fig-8-loop-vs-graph", ".lab[data-architecture-explorer]"] },
  { slug: "10-serving-deployment-ai-platform", ids: ["#fig-10-r1", "#fig-10-r2", "#fig-10-t1"] },
];

async function openChapter(page, chapter) {
  await page.goto(base + "/#read/" + chapter.slug, { waitUntil: "domcontentloaded" });
  await page.locator(".canonical-content " + chapter.ids[0]).waitFor({
    state: "visible", timeout: 45000,
  });
  await page.evaluate(() => document.fonts.ready);
}

function assertNumber(value, min, message) {
  assert(Number.isFinite(value) && value >= min, message + " (" + value + ")");
}

async function checkFigure(page, selector, cfg) {
  const root = page.locator(".canonical-content " + selector);
  assert.equal(await root.count(), 1, "Figure must exist once: " + selector);
  const info = await root.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const styles = getComputedStyle(node);
    const header = node.querySelector(".bfs-head, .lab-head");
    const title = node.querySelector(".bfs-title, .lab-title");
    const summary = node.querySelector(".bfs-subtitle, .lab-sub");
    const content = [...node.querySelectorAll(".bfs-card-title, .bfs-card-desc, .lab-grid, .lab-result")];
    return {
      shellClass: node.classList.contains("atlas-figure-shell"),
      container: styles.containerType,
      width: rect.width, scroll: node.scrollWidth, client: node.clientWidth,
      figure: {left:rect.left,right:rect.right},
      header: header ? header.getBoundingClientRect().toJSON() : null,
      title: title ? { ...title.getBoundingClientRect().toJSON(),
        px:parseFloat(getComputedStyle(title).fontSize),
        font:getComputedStyle(title).fontFamily } : null,
      summary: summary ? { ...summary.getBoundingClientRect().toJSON(),
        px:parseFloat(getComputedStyle(summary).fontSize),
        text:summary.textContent.trim() } : null,
      sample: content.map(x => {
        const r=x.getBoundingClientRect();
        return { name:x.className, left:r.left, right:r.right, width:r.width };
      }),
    };
  });
  assert(info.shellClass, selector + " does not use the unified Figure Shell");
  assert.equal(info.container, "inline-size");
  assertNumber(info.width, 200, selector + " figure collapsed");
  assert(info.scroll <= info.client + 3, selector + " internal overflow");
  assert(info.header && info.title, selector + " missing visible authored title");
  assert(info.title.right <= info.figure.right + 3
    && info.title.left >= info.figure.left - 3,
  selector + " title crossed boundary");
  assertNumber(info.title.px, 17, selector + " title typography became tiny");
  assert.match(info.title.font.toLowerCase(), /geist|sans/,
    selector + " technical figure must be sans-serif");
  if(info.summary) {
    assert(info.summary.text.length > 3, selector + " empty summary");
    assert(info.summary.right <= info.figure.right + 3,
      selector + " summary overflow");
    if(info.width <= 640) assertNumber(info.summary.px, 14.7,
      selector + " mobile summary should be comfortably readable");
  }
  for(const child of info.sample) {
    assert(child.width > 0, selector + " invisible " + child.name);
    assert(child.left >= info.figure.left-3 && child.right <= info.figure.right+3,
      selector + " descendant exceeds shell: " + JSON.stringify(child));
  }
  return info;
}

async function screenshot(page, selector, basename) {
  if(!visualDir) return;
  fs.mkdirSync(visualDir, { recursive:true });
  const root=page.locator(".canonical-content " + selector);
  const heading=root.locator(".bfs-head, .lab-head");
  await heading.scrollIntoViewIfNeeded({timeout:15000});
  await heading.screenshot({
    path:path.join(visualDir,basename+"-heading.png"),
    timeout:15000,animations:"disabled",
  });
  const body = selector.includes("data-architecture-explorer")
    ? root.locator(".lab-controls")
    : root.locator(".bfs-flow-container > .bfs-card, .bfs-grid.bfs-g3 > .bfs-card").first();
  if(await body.count()) {
    await body.scrollIntoViewIfNeeded({timeout:15000});
    await body.screenshot({
      path:path.join(visualDir,basename+"-content.png"),
      timeout:15000,animations:"disabled",
    });
  }
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const configs=[
      {width:320,en:false,dark:false},
      {width:390,en:false,dark:false},
      {width:768,en:true,dark:true},
      {width:1440,en:true,dark:true},
      {width:1728,en:false,dark:true},
    ];
    for(const cfg of configs) {
      const context=await browser.newContext({
        viewport:{width:cfg.width,height:880},reducedMotion:"reduce",
      });
      await context.addInitScript(({en,dark})=>{
        localStorage.setItem("preview-locale",JSON.stringify(en));
        localStorage.setItem("preview-theme",JSON.stringify(dark));
      },cfg);
      const page=await context.newPage(),errors=[];
      page.on("pageerror",error=>errors.push(error.message));
      let count=0;
      for(const chapter of chapters) {
        await openChapter(page,chapter);
        for(const selector of chapter.ids) {
          const info=await checkFigure(page,selector,cfg);
          count++;
          if((cfg.width===390||cfg.width===1440)
            && (selector==="#fig-6-a1"||selector===".lab[data-architecture-explorer]"||selector==="#fig-10-t1")) {
            await screenshot(page,selector,
              "shell-"+chapter.slug.slice(0,2)+"-"+cfg.width+"-"+(cfg.en?"en-dark":"zh-light"));
          }
        }
        if(chapter.slug.startsWith("08")) {
          const root=page.locator(".lab[data-architecture-explorer]");
          assert.equal(await root.locator("input[data-arch-signal]").count(),7);
          assert.equal(await root.getAttribute("data-mode"),"loop");
          await root.locator("input[data-arch-signal]").nth(1).check();
          assert.equal(await root.getAttribute("data-mode"),"gated");
          await root.locator("input[data-arch-signal]").nth(0).check();
          assert.equal(await root.getAttribute("data-mode"),"graph");
          await root.locator("[data-arch-reset]").click();
          assert.equal(await root.getAttribute("data-mode"),"loop");
        }
      }
      assert.equal(count,7,"Must check all seven migrated shells");
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert(overflow<=3,"Page-level horizontal overflow at "+cfg.width);
      assert.deepEqual(errors,[],"Browser runtime errors");
      console.log("Figure Shell PASS",cfg.width,cfg.en?"EN":"ZH",cfg.dark?"dark":"light",count);
      await context.close();
    }
    const contrast=await browser.newContext({
      viewport:{width:390,height:880},forcedColors:"active",reducedMotion:"reduce",
    });
    const contrastPage=await contrast.newPage();
    await openChapter(contrastPage,chapters[0]);
    assert((await contrastPage.locator("#fig-6-a1").getAttribute("class")).includes("atlas-figure-shell"));
    await contrast.close();
    console.log("Figure Shell forced-colors PASS");
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
