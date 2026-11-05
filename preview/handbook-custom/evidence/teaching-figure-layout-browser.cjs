/* Browser QA: interactive teaching figures own their responsive layout.
 * The screenshot's failure was a nested CH08 graph expanding beyond the
 * 608px lab. Test actual DOM rects and state transitions, not CSS presence.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const visualDir = process.env.TEACHING_VISUAL_DIR || "";

function chapter(id) {
  return base + "/#read/" + id;
}

async function load(page, slug, selector) {
  await page.goto(chapter(slug), { waitUntil: "domcontentloaded" });
  await page.locator(selector).waitFor({ state: "visible", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
}

async function measure(page, selector) {
  return page.locator(selector).first().evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      containerType: getComputedStyle(node).containerType,
    };
  });
}

async function assertContained(page, rootSelector, children, label) {
  const root = await measure(page, rootSelector);
  assert.ok(root.width > 0, label + " root width is zero");
  for (const child of children) {
    const rects = await page.locator(rootSelector + " " + child).evaluateAll(nodes =>
      nodes.map(node => {
        const r = node.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width };
      })
    );
    for (const rect of rects) {
      assert.ok(rect.width > 0, label + " hidden " + child);
      assert.ok(rect.left >= root.left - 3 && rect.right <= root.right + 3,
        label + " overflow in " + child + ": " + JSON.stringify({ root, rect }));
    }
  }
  const wholePage = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  assert.ok(wholePage.scroll <= wholePage.width + 3,
    label + " page-level horizontal overflow " + JSON.stringify(wholePage));
}

async function capture(page, selector, name) {
  if (!visualDir) return;
  fs.mkdirSync(visualDir, { recursive: true });
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded({ timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await target.screenshot({
    path: path.join(visualDir, name + ".png"),
    animations: "disabled",
    timeout: 15000,
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const configurations = [
      { width: 320, en: false, dark: false },
      { width: 390, en: false, dark: false },
      { width: 768, en: true, dark: true },
      { width: 1152, en: false, dark: false },
      { width: 1440, en: true, dark: true },
      { width: 1728, en: false, dark: true },
    ];
    for (const cfg of configurations) {
      const context = await browser.newContext({
        viewport: { width: cfg.width, height: 880 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(({ en, dark }) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
      }, cfg);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", err => errors.push(err.message));

      // CH08 source-authored interactive Explorer.
      await load(page, "08-agent-orchestration", ".lab[data-architecture-explorer]");
      const root = ".lab[data-architecture-explorer]";
      const lab = page.locator(root);
      assert.equal((await measure(page, root)).containerType, "inline-size");
      assert.equal(await lab.locator("input[data-arch-signal]").count(), 7);
      assert.equal(await lab.getAttribute("data-mode"), "loop");
      await assertContained(page, root,
        [".lab-grid", ".lab-controls", ".lab-result", ".lab-topology", ".lab-seq", ".lab-graph-grid", ".lab-node"],
        "CH08 " + cfg.width + " initial");
      if (cfg.width === 390 || cfg.width === 1440) {
        await capture(page, root + " .lab-topology-loop", "ch08-loop-" + cfg.width + "-" + (cfg.en ? "en" : "zh"));
        await capture(page, root + " .lab-topology-graph", "ch08-graph-" + cfg.width + "-" + (cfg.en ? "en" : "zh"));
      }

      const choice = lab.locator("input[data-arch-signal]");
      await choice.nth(1).check();
      assert.equal(await lab.getAttribute("data-mode"), "gated");
      await choice.nth(0).check();
      assert.equal(await lab.getAttribute("data-mode"), "graph");
      assert.match(await lab.locator("[data-arch-title]").innerText(), /Graph/);
      await assertContained(page, root,
        [".lab-result", ".lab-topology", ".lab-graph-grid", ".lab-node"],
        "CH08 " + cfg.width + " graph");
      await lab.locator("[data-arch-reset]").click();
      assert.equal(await lab.getAttribute("data-mode"), "loop");
      assert.equal(await lab.locator("input[data-arch-signal]:checked").count(), 0);
      if (cfg.width === 390 || cfg.width === 1440) {
        await capture(page, root + " .lab-controls", "ch08-controls-" + cfg.width + "-" + (cfg.en ? "en" : "zh"));
      }

      // CH09 reuses the original .lab/.lab-grid/.lab-result composition.
      await load(page, "09-reliability-evaluation-observability", ".lab[data-cost-simulator]");
      const costRoot = ".lab[data-cost-simulator]";
      assert.equal((await measure(page, costRoot)).containerType, "inline-size");
      await assertContained(page, costRoot,
        [".lab-grid", ".lab-controls", ".lab-result", ".lab-equation", ".lab-metrics", ".lab-node"],
        "CH09 cost " + cfg.width);
      if (cfg.width === 390 || cfg.width === 1440) {
        await capture(page, costRoot + " .lab-equation", "ch09-cost-" + cfg.width + "-" + (cfg.en ? "en" : "zh"));
      }
      const initialCost = await page.locator("[data-cost-per-success]").innerText();
      const price = page.locator("[data-cost-price]");
      await price.focus();
      await price.press("End");
      const newCost = await page.locator("[data-cost-per-success]").innerText();
      assert.notEqual(initialCost, newCost, "CH09 simulator result should respond to inputs");

      assert.equal(errors.length, 0, "Page errors: " + errors.join("; "));
      console.log("Figure layout PASS", cfg.width, cfg.en ? "EN" : "ZH", cfg.dark ? "dark" : "light");
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
