// Real-browser smoke gate for Visualization V2. Runs against Vite at port 4180.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";
const cases = [
  ["10-serving-deployment-ai-platform", 3],
  ["11-data-sql-engineering", 4],
];

(async () => {
  const browser = await chromium.launch();
  let checked = 0;
  try {
    for (const width of [390, 768, 1440, 1728]) {
      for (const en of [false, true]) {
        for (const dark of [false, true]) {
          const context = await browser.newContext({
            viewport: { width, height: 960 },
            reducedMotion: "reduce",
          });
          await context.addInitScript(({ en, dark }) => {
            localStorage.setItem("preview-locale", JSON.stringify(en));
            localStorage.setItem("preview-theme", JSON.stringify(dark));
            window.__name = (fn) => fn;
          }, { en, dark });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (err) => errors.push(err.message));
          for (const [slug, count] of cases) {
            await page.goto(base + "#read/" + slug + "/concept-demo");
            await page.locator("#concept-demo .v2-guide-header h3").waitFor();
            const demo = page.locator("#concept-demo");
            assert.equal(await demo.count(), 1, "Exactly one diagram per Reader page");
            assert.equal(await demo.locator(".v2-scenario").count(), count);
            const controls = demo.locator(".v2-scenario");
            for (let i = 0; i < count; i++) {
              const control = controls.nth(i);
              await control.click();
              assert.equal(await control.getAttribute("aria-pressed"), "true");
              assert.equal(await demo.locator('.v2-scenario[aria-pressed="true"]').count(), 1);
              assert((await demo.locator(".v2-insight strong").innerText()).trim().length > 15,
                "Scenario must provide a meaningful decision");
              const box = await control.boundingBox();
              assert(box && box.height >= 43.5, "Scenario target must be 44px high");
            }
            // Available layout width is controlled by Reader; diagrams must not clip.
            const overflow = await demo.evaluate((e) => {
              const rect = e.getBoundingClientRect();
              return { right: rect.right, viewport: window.innerWidth, scroll: e.scrollWidth, client: e.clientWidth };
            });
            assert(overflow.right <= overflow.viewport + 2,
              JSON.stringify({ width, en, dark, slug, overflow }));
            assert(overflow.scroll <= overflow.client + 2, "Diagram content overflow");
            checked++;
          }
          assert.deepEqual(errors, [], "No browser runtime errors");
          await context.close();
        }
      }
    }
    console.log("Visualization V2 browser smoke PASS: " + checked
      + " rendered states (4 widths × 2 locales × 2 themes × 2 chapters), all scenarios and deep links.");
  } finally {
    await browser.close();
  }
})().catch((err) => { console.error(err); process.exitCode = 1; });
