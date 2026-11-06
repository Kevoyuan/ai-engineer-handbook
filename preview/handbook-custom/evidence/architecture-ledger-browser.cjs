/* CH06 / CH10 architecture reading layouts; production-equivalent Vite Reader.
 * Design contract: one timeline for ordered boundaries, one inventory for
 * parallel runtime requirements. Measure rendered descendants, not only CSS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const visualDir = process.env.ARCH_LEDGER_VISUAL_DIR || "";

const specs = [
  { chapter: "06-skills-routing", selector: "#fig-6-a1", type: "ledger", stages: 5 },
  { chapter: "06-skills-routing", selector: "#fig-6-b2", type: "ledger", stages: 3 },
  { chapter: "10-serving-deployment-ai-platform", selector: "#fig-10-r1", type: "matrix", stages: 6 },
  { chapter: "10-serving-deployment-ai-platform", selector: "#fig-10-r2", type: "ledger", stages: 5 },
  { chapter: "10-serving-deployment-ai-platform", selector: "#fig-10-t1", type: "ledger", stages: 5 },
];

async function rectangleChecks(page, selector, width, label) {
  const data = await page.locator(selector).evaluate(root => {
    const frame = root.getBoundingClientRect();
    const things = [...root.querySelectorAll(".bfs-head, .bfs-flow-container, .bfs-grid, .bfs-card, .bfs-card-head, .bfs-card-title, .bfs-card-desc")];
    return {
      frame: { left: frame.left, right: frame.right, width: frame.width },
      overflow: root.scrollWidth - root.clientWidth,
      container: getComputedStyle(root).containerType,
      children: things.map(el => {
        const r = el.getBoundingClientRect();
        return { name: el.className, left: r.left, right: r.right, width: r.width };
      }),
    };
  });
  assert.equal(data.container, "inline-size", label + " must own its breakpoint");
  assert.ok(data.frame.width > 200, label + " collapsed");
  assert.ok(data.overflow <= 3, label + " internal overflow " + JSON.stringify(data));
  for (const r of data.children) {
    assert.ok(r.width > 0, label + " hidden child " + r.name);
    assert.ok(r.left >= data.frame.left - 3 && r.right <= data.frame.right + 3,
      label + " child outside frame at " + width + "px: " + JSON.stringify(r));
  }
}

async function visit(page, chapter, selector) {
  await page.goto(base + "/#read/" + chapter, { waitUntil: "domcontentloaded" });
  await page.locator(".canonical-content " + selector).waitFor({ state: "visible", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
}

async function capture(page, spec, cfg) {
  if (!visualDir) return;
  const isSelected =
    (cfg.width === 390 && !cfg.en && !cfg.dark) ||
    (cfg.width === 1440 && cfg.en && cfg.dark);
  if (!isSelected || !["#fig-6-a1", "#fig-10-r1", "#fig-10-t1"].includes(spec.selector)) return;
  fs.mkdirSync(visualDir, { recursive: true });
  const selector = ".canonical-content " + spec.selector;
  const node = page.locator(selector);
  // Reader desktop and phone use different scroll owners. A full-element
  // locator screenshot of a taller-than-viewport target can capture unrelated
  // prior article content in a nested scroller. Take two real viewport crops.
  for (const position of ["start", "end"]) {
    await node.evaluate((el, block) => {
      el.style.scrollMarginTop = "72px";
      el.scrollIntoView({ block, inline: "nearest", behavior: "instant" });
    }, position);
    await page.evaluate(() => new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const rect = await node.boundingBox();
    assert(rect && rect.y < 880 && rect.y + rect.height > 48,
      spec.selector + " is not visible in its " + position + " viewport crop");
    if (position === "start") {
      const heading = await node.locator(".bfs-title").boundingBox();
      assert(heading && heading.y >= 40 && heading.y < 880,
        spec.selector + " heading must be visible in start screenshot");
    }
    await page.screenshot({
      path: path.join(visualDir, spec.selector.slice(1) + "-" + cfg.width +
        (cfg.en ? "-en" : "-zh") + (cfg.dark ? "-dark" : "-light") +
        "-" + position + ".png"),
      fullPage: false,
      animations: "disabled",
      timeout: 15000,
    });
  }
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const cfg of [
      {width:320,en:false,dark:false},
      {width:390,en:false,dark:false},
      {width:768,en:true,dark:true},
      {width:1152,en:false,dark:true},
      {width:1440,en:true,dark:true},
      {width:1728,en:true,dark:false},
    ]) {
      const context = await browser.newContext({
        viewport: {width:cfg.width,height:880},
        reducedMotion:"reduce",
      });
      await context.addInitScript(({en,dark}) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
      }, cfg);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", err => errors.push(err.message));
      let currentChapter = "";
      for (const spec of specs) {
        if (spec.chapter !== currentChapter) {
          await visit(page, spec.chapter, spec.selector);
          currentChapter = spec.chapter;
        }
        const selector = ".canonical-content " + spec.selector;
        const el = page.locator(selector);
        const cards = el.locator(spec.type === "ledger" ? ".bfs-flow-container > .bfs-card" : ".bfs-grid.bfs-g3 > .bfs-card");
        assert.equal(await cards.count(), spec.stages, "Stage count changed: " + spec.selector);
        const expectedClass = spec.type === "ledger" ? "atlas-stage-ledger" : "atlas-context-matrix";
        assert.ok((await el.getAttribute("class")).includes(expectedClass));
        assert.equal(await el.locator(".bfs-stage-pill").count(), spec.stages);
        assert.equal(await el.locator(".bfs-card-title").count(), spec.stages);
        assert.equal(await el.locator(".bfs-card-desc").count(), spec.stages);
        await rectangleChecks(page, selector, cfg.width, spec.selector);
        const layout = await el.evaluate(root => {
          const r = root.getBoundingClientRect();
          const card = root.querySelector(".bfs-card");
          const grid = root.querySelector(".bfs-grid.bfs-g3");
          return {
            width: r.width,
            cardDisplay: card ? getComputedStyle(card).display : "",
            stageAreas: card ? getComputedStyle(card).gridTemplateAreas : "",
            gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length : 0,
            hoverTransform: card ? getComputedStyle(card).transform : "",
          };
        });
        if (spec.type === "ledger") {
          assert.equal(layout.cardDisplay, "grid");
          assert.ok(layout.stageAreas.includes(layout.width <= 608 ? '"stage"' : '"stage title"'),
            spec.selector + " wrong responsive stage ordering: " + JSON.stringify(layout));
          await cards.first().hover({ force:true });
          const transform = await cards.first().evaluate(node => getComputedStyle(node).transform);
          assert.equal(transform, "none", "Static stage must not jump on hover");
        } else {
          const expected = layout.width < 736 ? 1 : layout.width < 1120 ? 2 : 3;
          assert.equal(layout.gridColumns, expected,
            "Inventory columns must follow figure width, not window: " + JSON.stringify(layout));
        }
        await capture(page, spec, cfg);
      }
      const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(pageOverflow <= 3, "Page horizontal overflow at " + cfg.width);
      assert.deepEqual(errors, [], "Browser errors");
      console.log("Architecture ledgers PASS", cfg.width, cfg.en ? "EN" : "ZH", cfg.dark ? "dark" : "light");
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exitCode=1; });
