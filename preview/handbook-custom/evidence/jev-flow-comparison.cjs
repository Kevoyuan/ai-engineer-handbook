// FIG.6.C4 · Before/After responsibilities, bilingual behavior and access.
const { chromium } = require("../node_modules/playwright");
const AxeBuilder = require("../node_modules/@axe-core/playwright").default;
const assert = require("node:assert/strict");

const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  try {
    for (const en of [false, true]) {
      for (const dark of [false, true]) {
        for (const width of [390, 768, 1440, 1728]) {
          const context = await browser.newContext({
            viewport: { width, height: 950 },
            reducedMotion: "reduce",
          });
          await context.addInitScript(
            ({ en, dark }) => {
              localStorage.setItem("preview-locale", JSON.stringify(en));
              localStorage.setItem("preview-theme", JSON.stringify(dark));
              window.__name = fn => fn;
            },
            { en, dark },
          );
          const page = await context.newPage();
          page.on("pageerror", error => errors.push(error.message));
          await page.goto(base + "#read/06-skills-routing");
          const diagram = page.locator(".jev-dfc-root");
          await diagram.waitFor({ timeout: 30000 });
          assert.equal(await diagram.getByRole("heading", { name: "Jev vs. Generative LLMs" }).count(), 1);
          assert.equal(await diagram.locator(".jev-dfc-before").count(), 1);
          assert.equal(await diagram.locator(".jev-dfc-after").count(), 1);
          assert.equal(await diagram.locator(".jev-dfc-task").count(), 8);
          assert.equal(await diagram.locator(".jev-dfc-role").count(), 3);
          assert.equal(await page.locator("#jev-dual-flow-slot").count(), 1);
          assert.equal(await page.locator("#jev-dual-flow-slot .jev-dfc-static-fallback").isVisible(), false);
          const before = await diagram.locator(".jev-dfc-before").innerText();
          const after = await diagram.locator(".jev-dfc-after").innerText();
          assert.match(before, /Single LLM/);
          assert.match(after, /Generative Model/);
          assert.match(after, /Jev/);
          assert.match(after, /Runtime/);
          const runtime = diagram.getByRole("button", { name: en ? "Inspect Runtime" : "查看 Runtime" });
          await runtime.click();
          assert.equal(await runtime.getAttribute("aria-pressed"), "true");
          assert.match(await diagram.locator("#jev-dfc-insight").innerText(), /Runtime/);
          await diagram.getByRole("button", { name: en ? "Inspect Generative Model" : "查看 Generative Model" }).click();
          assert.match(await diagram.locator("#jev-dfc-insight").innerText(), /Generative Model/);
          await diagram.getByRole("button", { name: en ? "Inspect Jev" : "查看 Jev" }).focus();
          await page.keyboard.press("Enter");
          assert.match(await diagram.locator("#jev-dfc-insight").innerText(), /Jev/);
          assert.equal(await diagram.locator(".jev-dfc-role[aria-pressed=true]").count(), 1);
          const measured = await diagram.evaluate(node => ({
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
            outside: node.getBoundingClientRect().right > innerWidth + 1,
            columns: getComputedStyle(node.querySelector(".jev-dfc-compare")).gridTemplateColumns.split(" ").length,
          }));
          assert.equal(measured.scrollWidth > measured.clientWidth + 2 || measured.outside, false, JSON.stringify({ en, width, measured }));
          assert.equal(measured.columns, width === 390 || width === 768 ? 1 : 2);
          const axe = await new AxeBuilder({ page }).include(".jev-dfc-root").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
          assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => ({ id: v.id, target: v.nodes.map(n => n.target) }))));
          console.log("PASS Jev responsibility comparison", { en, dark, width, columns: measured.columns });
          await context.close();
        }
      }
    }
    assert.equal(errors.length, 0, "No runtime errors: " + errors.join("; "));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
