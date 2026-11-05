/* Atlas scrollbar regression: rendering, active feedback, touch and accessibility.
 * Runs against the real Vite Reader/Atlas shell, with no mocked scroll owners.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const visualDir = process.env.SCROLLBAR_VISUAL_DIR;

function appearance(page, selector) {
  return page.locator(selector).evaluate((el) => {
    const css = getComputedStyle(el);
    return {
      scrollbarWidth: css.scrollbarWidth,
      scrollbarColor: css.scrollbarColor,
      scrollbarGutter: css.scrollbarGutter,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      backgroundTrack: getComputedStyle(el, "::-webkit-scrollbar-track").backgroundColor,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    };
  });
}

async function loadReader(page) {
  await page.goto(base + "/#read/03-hybrid-retrieval-query-routing", {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".canonical-content").waitFor({ state: "visible", timeout: 45000 });
  await page.locator(".reader-bottom").waitFor({ state: "visible", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const samples = [
      { width: 320, theme: "light", coarse: true },
      { width: 390, theme: "graphite", coarse: true },
      { width: 768, theme: "forest", coarse: false },
      { width: 1440, theme: "light", coarse: false },
      { width: 1440, theme: "ink", coarse: false },
    ];
    for (const cfg of samples) {
      const context = await browser.newContext({
        viewport: { width: cfg.width, height: 850 },
        reducedMotion: "reduce",
        ...(cfg.coarse ? { isMobile: true, hasTouch: true } : {}),
      });
      await context.addInitScript((theme) => {
        localStorage.setItem("preview-locale", JSON.stringify(false));
        localStorage.setItem("preview-theme", JSON.stringify(theme !== "light"));
        localStorage.setItem("preview-dark-preset", JSON.stringify(theme === "light" ? "graphite" : theme));
      }, cfg.theme);
      const page = await context.newPage();
      await loadReader(page);

      const scroller = cfg.width <= 767
        ? ".workspace.reader-workspace"
        : ".chapter-body";
      await page.locator(scroller).evaluate((el) => {
        el.blur();
        delete el.dataset.scrolling;
      });
      const idle = await appearance(page, scroller);
      assert.equal(idle.scrollbarWidth, "thin",
        "The editor's scrollbar must use the thin platform variant");
      assert.notEqual(idle.scrollbarColor, "auto");
      assert.ok(idle.scrollHeight > idle.clientHeight,
        "The selected scroller should contain enough content to scroll");

      // Merely hovering the reading container should not reveal every nested thumb.
      await page.locator(scroller).hover({ force: true });
      const hovered = await appearance(page, scroller);
      assert.equal(hovered.scrollbarColor, idle.scrollbarColor,
        "Container hover must not boost scrollbar contrast");

      await page.locator(scroller).evaluate((el) => {
        el.scrollTop = Math.min(el.scrollHeight, el.scrollTop + 480);
      });
      await page.waitForFunction((selector) =>
        document.querySelector(selector)?.dataset.scrolling === "true",
        scroller, { timeout: 5000 });
      const engaged = await appearance(page, scroller);
      assert.notEqual(engaged.scrollbarColor, idle.scrollbarColor,
        "Direct scroll should make the thumb more visible");
      assert.equal(await page.locator(".reader-top-title").isVisible(), true,
        "The compact fixed Reader header must stay visible");

      // Keyboard focus should preserve an accessible stronger scrollbar even
      // after scroll activity has ended.
      await page.locator(scroller).evaluate((el) => {
        delete el.dataset.scrolling;
      });
      await page.locator(".chapter-body").focus();
      const focused = await appearance(page, scroller);
      assert.equal(focused.scrollbarColor, engaged.scrollbarColor);

      assert.ok(focused.scrollWidth <= focused.clientWidth + 2,
        "Reader pane overflow at " + cfg.width + ": " + JSON.stringify(focused));
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 2, "Page horizontal overflow: " + overflow);

      const nested = page.locator(".canonical-content .tw, .canonical-content .table-scroll, .canonical-content pre").first();
      if (await nested.count()) {
        const nestedStyle = await appearance(page, ".canonical-content .tw, .canonical-content .table-scroll, .canonical-content pre");
        assert.equal(nestedStyle.scrollbarWidth, "thin",
          "Nested technical scrollers must share the same quiet treatment");
      }
      if (visualDir && (cfg.width === 390 || cfg.width === 1440)) {
        fs.mkdirSync(visualDir, { recursive: true });
        await page.screenshot({
          path: path.join(visualDir, `scrollbar-reader-${cfg.width}-${cfg.theme}.png`),
          animations: "disabled",
        });
      }

      // Atlas is a different scroll owner and must inherit the same grammar.
      await page.goto(base + "/#home/all", { waitUntil: "domcontentloaded" });
      await page.locator(".atlas-page").waitFor({ state: "visible", timeout: 45000 });
      const atlas = await appearance(page, cfg.width <= 767 ? ".workspace" : ".atlas-page");
      assert.equal(atlas.scrollbarWidth, "thin");
      console.log("Scrollbar PASS", cfg.width, cfg.theme, cfg.coarse ? "touch" : "pointer");
      await context.close();
    }

    const forced = await browser.newContext({
      viewport: { width: 1440, height: 850 },
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    const highContrast = await forced.newPage();
    await loadReader(highContrast);
    const highContrastStyle = await appearance(highContrast, ".chapter-body");
    assert.equal(highContrastStyle.scrollbarWidth, "auto");
    assert.equal(highContrastStyle.scrollbarColor, "auto");
    console.log("Scrollbar PASS forced-colors");
    await forced.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
