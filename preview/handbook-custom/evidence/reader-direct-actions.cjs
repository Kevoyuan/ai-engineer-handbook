const { chromium } = require("../node_modules/playwright");
const assert = require("node:assert/strict");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(() => {
        localStorage.setItem("preview-locale", "false");
        window.__name = f => f;
      });
      const page = await context.newPage();
      await page.goto(base + "#read/06-skills-routing");
      await page.locator(".reader-top-actions > button").first().waitFor();
      const git = page.getByRole("link", { name: "在 GitHub 上查看" });
      const lang = page.getByRole("button", { name: "Switch to English" });
      assert.equal(await git.count(), 1);
      assert.equal(await lang.count(), 1);
      assert.equal(await git.getAttribute("href"), "https://github.com/kevoyuan/ai-engineer-handbook");
      assert(await git.isVisible(), "GitHub must remain a direct topbar action");
      assert(await lang.isVisible(), "Language must remain a direct topbar action");
      const layout = await page.evaluate(() => {
        const header = document.querySelector(".reader-workspace .topbar");
        const link = document.querySelector(".reader-direct-github");
        const locale = document.querySelector(".reader-direct-language");
        return {
          pageWidth: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          linkRight: link.getBoundingClientRect().right,
          localeWidth: locale.getBoundingClientRect().width,
          headerHeight: header.getBoundingClientRect().height,
        };
      });
      assert(layout.pageWidth <= width + 2, "Reader should not overflow at " + width + ": " + JSON.stringify(layout));
      assert(layout.linkRight <= width + 1, "GitHub clipped at " + width);
      assert(layout.localeWidth >= 44, "Language control below touch target");
      await lang.click();
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      await page.getByRole("button", { name: "More reading controls" }).click();
      assert.equal(await page.getByRole("menuitem", { name: "中文" }).count(), 0);
      assert.equal(await page.getByRole("menuitem", { name: /GitHub/ }).count(), 0);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "切换为中文" }).click();
      assert.equal(await page.locator("html").getAttribute("lang"), "zh");
      console.log("PASS direct Reader GitHub/locale", width);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
