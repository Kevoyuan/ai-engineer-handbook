/* Browser smoke test for CH04 parameterized teaching lab.
 * Run with a Vite server available at HANDBOOK_URL and Playwright Chromium installed.
 */
const assert = require("node:assert/strict");
const { captureLabReview } = require("./capture-parameter-lab.cjs");
const visualDir = process.env.PARAMETER_VISUAL_DIR;
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180/").replace(/\/$/, "");
const target = base + "/#read/04-rag-reliability-selective-answering/concept-demo";

async function readMetric(page, index) {
  return (await page.locator(".risk-lab-measures > div").nth(index).locator("strong").innerText()).trim();
}

async function verify(page, threshold) {
  const input = page.locator("#risk-lab-threshold");
  assert.equal(await input.inputValue(), String(threshold));
  assert.equal(await page.locator("#concept-demo").count(), 1, "Keep a single CH04 concept-demo");
  assert.equal(await page.locator(".risk-lab-ledger li").count(), 8, "Every case remains visible");
  assert.equal(await page.locator(".risk-lab-figure svg[role=img]").count(), 1, "Plot has a readable SVG label");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const { width, language, theme } of [
      { width: 390, language: false, theme: false },
      { width: 768, language: true, theme: false },
      { width: 1440, language: false, theme: true },
      { width: 1728, language: true, theme: true },
    ]) {
      const context = await browser.newContext({
        viewport: { width, height: 930 },
        reducedMotion: "reduce",
        colorScheme: theme ? "dark" : "light",
      });
      await context.addInitScript(({ language, theme }) => {
        localStorage.setItem("preview-locale", JSON.stringify(language));
        localStorage.setItem("preview-theme", JSON.stringify(theme));
      }, { language, theme });
      const page = await context.newPage();
      await page.goto(target, { waitUntil: "domcontentloaded" });
      await page.locator("#risk-coverage-lab").waitFor({ state: "visible", timeout: 45000 });
      await verify(page, 70);
      assert.equal(await readMetric(page, 0), "62.5%");
      assert.equal(await readMetric(page, 1), "20%");
      assert.equal(await readMetric(page, 2), "3");

      const input = page.locator("#risk-lab-threshold");
      await input.focus();
      await input.press("End");
      await verify(page, 100);
      assert.equal(await readMetric(page, 0), "0%");
      assert.equal(await readMetric(page, 1), "—", "Zero answers must NOT be 0% risk");
      assert.equal(await readMetric(page, 2), "8");
      assert.equal(await page.locator(".risk-lab-selected circle").count(), 0);

      await input.press("Home");
      await verify(page, 0);
      assert.equal(await readMetric(page, 0), "100%");
      assert.equal(await readMetric(page, 1), "37.5%", "3 wrong of 8 accepted");

      await page.locator(".risk-lab-limits button").click();
      await verify(page, 70);
      const overflow = await page.locator("#risk-coverage-lab").evaluate(
        (node) => node.scrollWidth - node.clientWidth
      );
      assert.ok(overflow <= 2, "Lab content overflows horizontally at " + width + "px: " + overflow);
      if (visualDir && (width === 390 || width === 1440)) {
        await captureLabReview(page, "#risk-coverage-lab", visualDir, `ch04-${width}-${language ? "en" : "zh"}`);
      }
      console.log("CH04 lab verified", width, language ? "EN" : "ZH", theme ? "dark" : "light");
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
