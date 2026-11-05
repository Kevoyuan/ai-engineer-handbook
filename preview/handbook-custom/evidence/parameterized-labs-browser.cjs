/* CH03/CH08 parameterized concept experiments: real browser regression.
 * Run with Vite at HANDBOOK_URL and installed Playwright Chromium.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const base = (process.env.HANDBOOK_URL || "http://127.0.0.1:4180").replace(/\/$/, "");
const slug = {
  route: "03-hybrid-retrieval-query-routing",
  agent: "08-agent-orchestration",
};

async function navigate(page, chapter, root) {
  await page.goto(base + "/#read/" + slug[chapter] + "/concept-demo", { waitUntil: "domcontentloaded" });
  await page.locator(root).waitFor({ state: "visible", timeout: 45000 });
  assert.equal(await page.locator("#concept-demo").count(), 1, "One primary concept-demo deep link per chapter");
  assert.equal(await page.locator(".concept-examples select").count(), 1, "Keep the original diagram example selector");
  assert.equal(await page.locator("#concept-demo .concept-takeaway").count(), 1);
}

async function values(page, root) {
  return page.locator(root + " .parameter-lab-output strong").allInnerTexts();
}
async function assertFit(page, root, width) {
  const dimensions = await page.locator(root).evaluate((node) => ({
    inner: node.clientWidth,
    scroll: node.scrollWidth,
  }));
  assert.ok(
    dimensions.scroll <= dimensions.inner + 2,
    root + " has horizontal overflow at " + width + "px: " + JSON.stringify(dimensions)
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const config of [
      { width: 390, en: false, dark: false },
      { width: 768, en: true, dark: false },
      { width: 1440, en: false, dark: true },
      { width: 1728, en: true, dark: true },
    ]) {
      const context = await browser.newContext({
        viewport: { width: config.width, height: 940 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(({ en, dark }) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
      }, config);
      const page = await context.newPage();

      // CH03: semantic evidence needs BM25 after Dense in this authored fixture.
      await navigate(page, "route", "#route-budget-lab");
      const route = page.locator("#route-budget-lab");
      assert.equal(await route.locator("#route-case-select").inputValue(), "semantic");
      assert.equal(await route.locator("#route-budget-range").inputValue(), "1");
      assert.equal((await values(page, "#route-budget-lab"))[0].trim(), "1 / 5");
      assert.equal((await values(page, "#route-budget-lab"))[1].trim(), "0 / 1");
      assert.equal(await route.locator('li[data-state="planned"]').count(), 1);

      const range = route.locator("#route-budget-range");
      await range.focus();
      await range.press("ArrowRight");
      assert.equal(await range.inputValue(), "2");
      assert.equal((await values(page, "#route-budget-lab"))[1].trim(), "1 / 1");
      await range.press("End");
      assert.equal(await range.inputValue(), "5");
      assert.equal(await route.locator('li[data-state="planned"]').count(), 3);
      await route.locator("#route-case-select").selectOption("relation");
      await range.press("Home");
      assert.equal((await values(page, "#route-budget-lab"))[1].trim(), "1 / 2");
      await range.press("ArrowRight");
      assert.equal((await values(page, "#route-budget-lab"))[1].trim(), "2 / 2");
      await route.locator("#route-case-select").selectOption("clarify");
      assert.equal((await values(page, "#route-budget-lab"))[0].trim(), "0 / 5");
      assert.equal(await route.locator('li[data-state="planned"]').count(), 0);
      await assertFit(page, "#route-budget-lab", config.width);

      // CH08: two verified attempts when both permission and work budget permit.
      await navigate(page, "agent", "#agent-budget-lab");
      const agent = page.locator("#agent-budget-lab");
      assert.equal(await agent.locator("#agent-case-select").inputValue(), "recoverable");
      let result = await values(page, "#agent-budget-lab");
      assert.equal(result[0].trim(), "2 / 3");
      assert.equal(result[1].trim(), "6 / 3");
      assert.match(result[2], /STOP/);
      assert.equal(await agent.locator('li[data-state="verified"]').count(), 1);

      const attempts = agent.locator("#agent-attempt-limit");
      await attempts.focus();
      await attempts.press("Home");
      result = await values(page, "#agent-budget-lab");
      assert.equal(result[0].trim(), "1 / 1");
      assert.match(result[2], /HANDOFF/);
      await attempts.press("End");
      await agent.locator("#agent-case-select").selectOption("persistent");
      assert.match((await values(page, "#agent-budget-lab"))[2], /HANDOFF/);
      const budget = agent.locator("#agent-work-budget");
      await budget.focus();
      await budget.press("Home");
      assert.equal((await values(page, "#agent-budget-lab"))[0].trim(), "0 / 4");
      await budget.press("End");
      await agent.locator("#agent-case-select").selectOption("approval");
      assert.equal((await values(page, "#agent-budget-lab"))[0].trim(), "0 / 4");
      assert.match((await values(page, "#agent-budget-lab"))[2], /BLOCKED/);
      await agent.locator(".parameter-lab-actions button").click();
      assert.equal(await agent.locator("#agent-case-select").inputValue(), "recoverable");
      assert.equal(await attempts.inputValue(), "3");
      assert.equal(await budget.inputValue(), "9");
      await assertFit(page, "#agent-budget-lab", config.width);

      console.log("CH03 + CH08 parameterized labs PASS", config.width, config.en ? "EN" : "ZH", config.dark ? "dark" : "light");
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
