/* Responsive Reader chrome and editorial pagination regression.
 * This test captures the actual reader scroll container, not a mock shell.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const visualDir = process.env.PARAMETER_VISUAL_DIR;

async function visit(page, chapter) {
  await page.goto(base + "/#read/" + chapter, { waitUntil: "domcontentloaded" });
  await page.locator("nav.reader-bottom").waitFor({ state: "visible", timeout: 45000 });
  await page.locator(".reader-top-title").waitFor({ state: "visible" });
}

async function dimensions(page, selector) {
  return page.locator(selector).evaluate((node) => ({
    client: node.clientWidth,
    scroll: node.scrollWidth,
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    x: node.getBoundingClientRect().x,
    y: node.getBoundingClientRect().y,
  }));
}

async function scrollToFooter(page) {
  // The Reader has mobile/workspace and desktop/chapter-body scroll owners.
  // Use Playwright's locator scroller and a real rendered component snapshot;
  // a full viewport screenshot is not proof the footer has been reached.
  const nav = page.locator(".reader-bottom");
  await nav.scrollIntoViewIfNeeded({ timeout: 15000 });
  await page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const cfg of [
      { width: 320, en: false, dark: false },
      { width: 390, en: true, dark: true },
      { width: 768, en: false, dark: true },
      { width: 1440, en: true, dark: false },
    ]) {
      const context = await browser.newContext({
        viewport: { width: cfg.width, height: 850 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(({ en, dark }) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
      }, cfg);
      const page = await context.newPage();
      await visit(page, "03-hybrid-retrieval-query-routing");

      const nav = page.locator(".reader-bottom");
      assert.equal(await nav.count(), 1, "Exactly one chapter footer");
      assert.equal(await nav.locator("a.reader-bottom-link").count(), 2);
      assert.equal(await nav.locator(".reader-bottom-caption").count(), 1);
      assert.equal(await nav.locator(".chapter-page-count").innerText(), "03 / 12");
      const prev = nav.locator(".reader-bottom-prev");
      const next = nav.locator(".reader-bottom-next");
      assert.equal(await prev.getAttribute("href"), "#read/02-enterprise-retrieval");
      assert.equal(await next.getAttribute("href"), "#read/04-rag-reliability-selective-answering");
      assert.ok((await prev.locator(".reader-bottom-title").innerText()).length >= 4);
      assert.ok((await next.locator(".reader-bottom-title").innerText()).length >= 4);
      assert.ok((await prev.getAttribute("aria-label")).includes(
        await prev.locator(".reader-bottom-title").innerText()));
      assert.ok((await next.getAttribute("aria-label")).includes(
        await next.locator(".reader-bottom-title").innerText()));

      const header = page.locator(".workspace.reader-workspace .topbar");
      const initial = await dimensions(page, ".workspace.reader-workspace .topbar");
      assert.ok(initial.width <= cfg.width + 2);
      if (cfg.width <= 767) {
        assert.ok(initial.height <= 50,
          "Mobile topbar exceeded 50px: " + JSON.stringify(initial));
        assert.equal(await page.locator(".reader-direct-github").isVisible(), false);
        assert.equal(await page.locator(".workspace.reader-workspace .appearance-picker").isVisible(), false);
        assert.equal(await page.getByRole("button", {
          name: cfg.en ? "More reading controls" : "更多阅读设置",
        }).isVisible(), true);
      }

      await scrollToFooter(page);
      const after = await dimensions(page, ".workspace.reader-workspace .topbar");
      assert.ok(Math.abs(after.y - initial.y) <= 1.5,
        "Topbar moved/disappeared after deep reading: " + JSON.stringify([initial,after]));
      assert.equal(await header.isVisible(), true);
      const footer = await dimensions(page, ".reader-bottom");
      assert.ok(footer.scroll <= footer.client + 2,
        "Footer overflow at " + cfg.width + "px: " + JSON.stringify(footer));
      const links = await dimensions(page, ".reader-bottom-links");
      assert.ok(links.scroll <= links.client + 2, "Chapter links overflow");
      assert.equal(await page.locator(".reader-chrome-hidden").count(), 0,
        "The Reader must not hide its persistent header");

      if (visualDir && (cfg.width === 390 || cfg.width === 1440)) {
        fs.mkdirSync(visualDir, { recursive: true });
        await page.evaluate(() => document.fonts.ready);
        await nav.screenshot({
          path: path.join(visualDir,
            `reader-footer-${cfg.width}-${cfg.en ? "en" : "zh"}.png`),
          animations: "disabled",
        });
        await header.screenshot({
          path: path.join(visualDir,
            `reader-topbar-${cfg.width}-${cfg.en ? "en" : "zh"}.png`),
          animations: "disabled",
        });
      }

      if (cfg.width <= 767) {
        const more = page.getByRole("button", { name: cfg.en ? "More reading controls" : "更多阅读设置" });
        await more.click();
        const github = page.getByRole("menuitem", { name: cfg.en ? "View on GitHub" : "在 GitHub 上查看" });
        assert.ok((await github.getAttribute("href")).includes("github.com/kevoyuan/ai-engineer-handbook"));
        const ink = page.getByRole("menuitem", { name: cfg.en ? "Ink black" : "纯黑" });
        await ink.click();
        assert.equal(await page.locator("html").getAttribute("data-dark-preset"), "ink");
        assert.equal(await page.locator("html.dark").count(), 1);
        await more.click();
        await page.getByRole("menuitem", { name: cfg.en ? "Focus reading" : "专注阅读" }).click();
        assert.equal(await page.locator(".top-focus-exit").isVisible(), true);
        assert.ok((await dimensions(page, ".top-focus-exit")).width <= 46);
        await page.locator(".top-focus-exit").click();
        assert.equal(await page.locator(".top-focus-exit").count(), 0);
      }

      // Native chapter link still drives the canonical Reader route.
      await next.click();
      await page.waitForURL(/#read\/04-rag-reliability-selective-answering/);
      await page.locator("nav.reader-bottom").waitFor({ state: "visible" });

      if (cfg.width === 320) {
        await visit(page, "01-model-api-context-foundations");
        assert.equal(await page.locator(".reader-bottom-prev").getAttribute("href"), "#home/all");
        await visit(page, "12-fde-customer-delivery");
        assert.equal(await page.locator(".reader-bottom-next").getAttribute("href"), "#home/all");
      }
      console.log("Persistent Reader + chapter footer PASS", cfg.width, cfg.en ? "EN" : "ZH", cfg.dark ? "dark" : "light");
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
