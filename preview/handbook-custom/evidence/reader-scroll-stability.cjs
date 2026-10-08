// Reader auto-hide regression: chrome must never resize the scroll owner.
// Run with npm run dev -- --port 4180, then node evidence/reader-scroll-stability.cjs.
const { chromium } = require("../node_modules/playwright");
const assert = require("node:assert/strict");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [390, 768, 1440]) {
      for (const reducedMotion of ["reduce", "no-preference"]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion,
        });
        await context.addInitScript(() => {
          localStorage.setItem("preview-locale", "false");
          window.__name = f => f;
        });
        const page = await context.newPage();
        await page.goto(base + "#read/03-hybrid-retrieval-query-routing");
        await page.locator(".canonical-content").waitFor({ timeout: 25000 });
        const workspace = page.locator(".reader-workspace");
        const scroller = page.locator(width <= 767 ? ".reader-workspace" : ".chapter-body");
        const metrics = () => scroller.evaluate(el => ({
          clientHeight: el.clientHeight,
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          headerHeight: document.querySelector(".reader-workspace .topbar").getBoundingClientRect().height,
          headerTransition: getComputedStyle(document.querySelector(".reader-workspace .topbar")).transitionProperty,
          barPosition: getComputedStyle(document.querySelector(".reader-workspace .topbar")).position,
          spacerHeight: parseFloat(getComputedStyle(document.querySelector(".chapter-body"), "::before").height) || 0,
          spacerDisplay: getComputedStyle(document.querySelector(".chapter-body"), "::before").display,
        }));
        const initial = await metrics();
        assert.equal(Math.round(initial.headerHeight), 52);
        assert(!/height|flex-basis|padding|all/.test(initial.headerTransition),
          "Chrome transition must not animate layout: " + initial.headerTransition);
        assert.equal(initial.barPosition, width <= 767 ? "fixed" : "absolute");
        if (width > 767) assert(initial.spacerHeight >= 52, "Initial desktop clearance must scroll away");
        if (width <= 767) assert.equal(initial.spacerDisplay, "none");

        // A large single jump is programmatic, not evidence of a user swipe.
        // Two smaller moves simulate a deliberate downward reading gesture.
        await page.waitForTimeout(500);
        await scroller.evaluate(el => { el.scrollTop = 800; });
        await page.waitForTimeout(120);
        await scroller.evaluate(el => { el.scrollTop += 110; });
        await page.waitForTimeout(300);
        assert(await workspace.evaluate(el => el.classList.contains("reader-chrome-hidden")),
          "Sustained downward movement must hide chrome at " + width);
        const hidden = await metrics();
        assert(Math.abs(hidden.clientHeight - initial.clientHeight) <= 1,
          "Hiding chrome resized scroll owner: " + JSON.stringify({initial, hidden}));
        assert(Math.abs(hidden.scrollTop - 910) <= 3, "Scroll location jumped on hide");
        assert.equal(Math.round(hidden.headerHeight), 52);

        await scroller.evaluate(el => { el.scrollTop += 250; });
        await page.waitForTimeout(250);
        assert(await workspace.evaluate(el => el.classList.contains("reader-chrome-hidden")));
        await scroller.evaluate(el => { el.scrollTop -= 8; });
        await page.waitForTimeout(250);
        assert(await workspace.evaluate(el => el.classList.contains("reader-chrome-hidden")),
          "Small reverse scroll should not jitter chrome");
        await scroller.evaluate(el => { el.scrollTop -= 150; });
        await page.waitForTimeout(300);
        assert(!(await workspace.evaluate(el => el.classList.contains("reader-chrome-hidden"))),
          "Scrolling up must reveal chrome at " + width);
        const shown = await metrics();
        assert(Math.abs(shown.clientHeight - initial.clientHeight) <= 1,
          "Revealing chrome resized scroll owner: " + JSON.stringify({initial, shown}));

        await scroller.evaluate(el => { el.scrollTop = 0; });
        await page.waitForTimeout(250);
        assert(!(await workspace.evaluate(el => el.classList.contains("reader-chrome-hidden"))),
          "Top of chapter must reveal chrome");
        console.log("PASS stable Reader chrome", { width, reducedMotion, initialHeight: initial.clientHeight });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
