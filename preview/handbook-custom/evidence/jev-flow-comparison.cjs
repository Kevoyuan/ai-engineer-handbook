// Chapter 06 Jev vs LLM paired flow: content, controls, accessibility, responsive and reduced-motion.
const { chromium } = require("../node_modules/playwright");
const AxeBuilder = require("../node_modules/@axe-core/playwright").default;
const assert = require("node:assert/strict");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await chromium.launch();
  const issues = [];
  try {
    for (const en of [false, true]) {
      for (const width of [390, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
        await context.addInitScript(enMode => {
          localStorage.setItem("preview-locale", JSON.stringify(enMode));
          window.__name = fn => fn;
        }, en);
        const page = await context.newPage();
        page.on("pageerror", error => issues.push(error.message));
        await page.goto(base + "#read/06-skills-routing");
        const diagram = page.locator(".jev-dfc-root");
        await diagram.waitFor({ timeout: 30000 });
        assert.equal(await diagram.locator(".jev-dfc-path").count(), 2, "two mirrored execution paths");
        assert.equal(await diagram.locator(".jev-dfc-path--llm .jev-dfc-stage").count(), 5);
        assert.equal(await diagram.locator(".jev-dfc-path--typed .jev-dfc-stage").count(), 5);
        assert.equal(await page.locator("#jev-dual-flow-slot").count(), 1, "registered fragment slot");
        assert.equal(await page.locator("#jev-dual-flow-slot .jev-dfc-static-fallback").isVisible(), false, "fallback hidden only when React mounted");
        await diagram.getByRole("button", { name: en ? "Next step" : "下一步" }).click();
        assert.equal(await diagram.locator(".jev-dfc-stage.is-current").count(), 2);
        const third = diagram.getByRole("button", { name: en ? "Jump to stage 3" : "跳至阶段 3" });
        await third.click();
        assert.equal(await diagram.locator(".jev-dfc-path--llm .jev-dfc-example span").count(), 5);
        assert.equal(await diagram.locator(".jev-dfc-path--typed .jev-dfc-example span").count(), 3);
        assert.equal(await diagram.getByRole("button", { name: en ? "Play demonstration" : "播放演示" }).isDisabled(), true, "reduced motion disables autoplay");
        const measured = await diagram.evaluate(node => ({
          clientWidth: node.clientWidth, scrollWidth: node.scrollWidth,
          outside: node.getBoundingClientRect().right > innerWidth + 1
        }));
        assert.equal(measured.scrollWidth > measured.clientWidth + 2 || measured.outside, false, "no mobile/desktop diagram overflow");
        const axe = await new AxeBuilder({ page }).include(".jev-dfc-root").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
        assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => ({ id: v.id, target: v.nodes.map(n => n.target) }))));
        console.log("PASS paired Jev flow:", { en, width, reducedMotion: true });
        await context.close();
      }
    }
    // Explicit playback starts only after user action, advances stages, then can be paused.
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
    await context.addInitScript(() => {
      localStorage.setItem("preview-locale", "false");
      window.__name = fn => fn;
    });
    const page = await context.newPage();
    page.on("pageerror", error => issues.push(error.message));
    await page.goto(base + "#read/06-skills-routing");
    const diagram = page.locator(".jev-dfc-root");
    await diagram.waitFor();
    assert.equal(await diagram.locator(".jev-dfc-stage.is-current").count(), 2);
    await sleep(150);
    assert.match(await diagram.locator(".jev-dfc-explanation").innerText(), /01/);
    await diagram.getByRole("button", { name: "播放演示" }).click();
    await diagram.getByRole("button", { name: "暂停演示" }).waitFor();
    await page.waitForFunction(() => document.querySelector(".jev-dfc-explanation")?.textContent?.includes("02 · CONTRACT"), { timeout: 5000 });
    await diagram.getByRole("button", { name: "暂停演示" }).click();
    const paused = await diagram.locator(".jev-dfc-explanation").innerText();
    await sleep(3100);
    assert.equal(await diagram.locator(".jev-dfc-explanation").innerText(), paused, "pause retains stage");
    await diagram.getByRole("button", { name: "跳至阶段 5" }).click();
    await diagram.getByRole("button", { name: "重播演示" }).click();
    await page.waitForFunction(() => document.querySelector(".jev-dfc-explanation")?.textContent?.includes("01 · INPUT"));
    await diagram.getByRole("button", { name: "暂停演示" }).click();
    assert.equal(issues.length, 0, "no page errors: " + issues.join("; "));
    console.log("PASS paired Jev flow playback/replay/pause");
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
