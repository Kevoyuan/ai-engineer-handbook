const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch();
  try {
    for (const en of [false, true]) {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.addInitScript(
        (language) => localStorage.setItem("preview-locale", JSON.stringify(language)),
        en,
      );
      const page = await context.newPage();
      for (const width of [390, 768, 1440, 1728]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("http://localhost:4181/#read/06-skills-routing/concept-demo");
        const demo = page.locator("#concept-demo");
        await demo.waitFor();
        const panes = await demo.evaluate((element) => {
          const terminal = element.querySelector(".sim-terminal");
          const stream = element.querySelector(".sim-stream");
          const grid = element.querySelector(".sim-grid");
          const mobile = grid && getComputedStyle(grid).gridTemplateColumns.split(" ").length === 1;
          return {
            mobile,
            terminalHeight: terminal.getBoundingClientRect().height,
            streamHeight: stream.getBoundingClientRect().height,
            horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
          };
        });
        assert(!panes.horizontalOverflow, "Simulator overflows horizontally at " + width);
        assert(
          panes.terminalHeight <= (panes.mobile ? 185 : 295),
          "Terminal pane too tall at " + width + ": " + panes.terminalHeight,
        );
        assert(
          panes.streamHeight <= (panes.mobile ? 220 : 255),
          "Context stream too tall at " + width + ": " + panes.streamHeight,
        );
        for (let i = 0; i < 5; i++) {
          await demo.getByRole("button", { name: en ? "Step forward" : "单步执行", exact: true }).click();
        }
        assert.match(
          await demo.locator(".sim-status").innerText(),
          en ? /Complete/ : /已完成/,
        );
        assert.equal(await demo.locator(".sim-stream .sim-message").count(), 7);
        await demo.getByRole("button", { name: en ? "Reset" : "重置", exact: true }).click();
        assert.equal(await demo.locator(".sim-stream .sim-message").count(), 2);
        console.log("compact simulator passed", { en, width, ...panes });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
