// Browser evidence for context boundaries, practice feedback and native keyboard models.
const { chromium } = require("../node_modules/playwright");
const AxeBuilder = require("../node_modules/@axe-core/playwright").default;
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.HANDBOOK_URL || "http://localhost:4180/";
const out = process.env.LEARNING_AUDIT_DIR || "/tmp/handbook-learning-audit";
const answers = {
  "03-hybrid-retrieval-query-routing": [1, 0],
  "04-rag-reliability-selective-answering": [2, 0],
  "06-skills-routing": [2, 1],
  "07-memory-context-engineering": [0, 1],
  "08-agent-orchestration": [2, 1],
};
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const results = [], spacing = [], errors = [];
  try {
    for (const en of [false, true]) for (const dark of [false, true]) {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.addInitScript(({ en, dark }) => {
        localStorage.setItem("preview-locale", JSON.stringify(en));
        localStorage.setItem("preview-theme", JSON.stringify(dark));
        window.__name = (fn) => fn;
      }, { en, dark });
      const page = await context.newPage();
      page.on("pageerror", e => errors.push(e.message));
      for (const width of [390, 1440, 1728]) for (const [slug, correct] of Object.entries(answers)) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(base + "#read/" + slug);
        const demo = page.locator("#concept-demo");
        await demo.waitFor();
        await page.evaluate(() => document.fonts.ready);
        await demo.evaluate(e => e.scrollIntoView({ block: "start" }));
        assert.equal(await demo.count(), 1);
        // Compare all canonical article text, excluding the newly inserted teaching module.
        const preserved = await page.locator(".canonical-content").evaluate((node) => {
          const clone = node.cloneNode(true);
          clone.querySelectorAll(".concept-slot,[data-arch-title],[data-arch-desc],[data-arch-score]").forEach(n => n.remove());
          return clone.textContent.replace(/\s+/g, " ").trim();
        });
        const payload = JSON.parse(fs.readFileSync(path.join(__dirname, "../public/content", slug + ".json")));
        const expected = await page.evaluate(html => {
          const node = document.createElement("div"); node.innerHTML = html;
          node.querySelectorAll("[data-arch-title],[data-arch-desc],[data-arch-score]").forEach(n => n.remove());
          return node.textContent.replace(/\s+/g, " ").trim();
        }, payload[en ? "en" : "zh"]);
        assert.equal(preserved, expected, slug + " article content preserved");
        if (slug.startsWith("06")) {
          const cases = demo.locator(".sim-scenarios [role=tab]");
          const advance = demo.getByRole("button", { name: en ? "Step forward" : "单步执行", exact: true });
          for (let i = 0; i < 5; i++) await advance.click();
          assert.match(await demo.locator(".sim-stream").innerText(), /TOOL RESULT/);
          for (const scenario of [1, 2]) {
            await cases.nth(scenario).click();
            await advance.click(); await advance.click();
            assert.equal(await advance.isDisabled(), true);
            assert.match(await demo.locator(".sim-status").innerText(), scenario === 1 ? (en ? /Needs input/ : /等待补充输入/) : (en ? /Access denied/ : /权限拒绝/));
            assert.equal((await demo.locator(".sim-stream").innerText()).includes("TOOL RESULT"), false);
          }
          await cases.first().click();
        }
        await demo.locator(".knowledge-trigger").click();
        const quiz = demo.locator(".knowledge-content");
        const check = quiz.getByRole("button", { name: en ? "Check answer" : "检查答案", exact: true });
        assert.equal(await check.isDisabled(), true);
        for (let q = 0; q < 2; q++) {
          const radios = quiz.getByRole("radio");
          await radios.nth((correct[q] + 1) % 3).check(); await check.click();
          assert.match(await quiz.locator(".knowledge-feedback").innerText(), en ? /Try another/ : /再想一想/);
          await radios.nth(correct[q]).check(); await check.click();
          assert.match(await quiz.locator(".knowledge-feedback").innerText(), en ? /Correct/ : /回答正确/);
          await quiz.getByRole("button", { name: q === 0 ? (en ? "Next question" : "下一题") : (en ? "Start again" : "重新练习"), exact: true }).click();
          assert.equal(await check.isDisabled(), true);
          await page.waitForFunction(() => document.activeElement?.matches(".knowledge-content h4"));
        }
        // Roving radio focus and selection are supplied by the installed Radix primitive.
        await quiz.getByRole("radio").first().focus(); await page.keyboard.press("ArrowDown", { delay: 100 });
        await page.waitForFunction(() => document.querySelectorAll(".knowledge-options [role=radio]")[1]?.getAttribute("aria-checked") === "true");
        await check.click();
        await quiz.evaluate(e => e.scrollIntoView({ block: "center" }));
        const overflow = await demo.evaluate(e => ({ outside: e.getBoundingClientRect().right > innerWidth + 1, overflow: e.scrollWidth > e.clientWidth + 1 }));
        assert.equal(overflow.outside || overflow.overflow, false);
        const axe = await new AxeBuilder({ page }).include("#concept-demo").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${slug} ${width} en=${en} dark=${dark}`);
        if (!en && !dark && slug.startsWith("06")) {
          await page.screenshot({ path: path.join(out, `skills-practice-${width}.png`) });
          if (process.env.LEARNING_CAPTURE_SCRIPT) {
            await demo.evaluate(e => [e, ...e.querySelectorAll("*")].forEach((n, i) => {
              const peers = n.matches(".concept-node") ? "nodes" : n.matches(".knowledge-option") ? "options" : n.matches("[role=radio]") ? "radios" : n.matches("[role=tab]") ? "tabs" : "element-" + i;
              n.setAttribute("data-bd-group", "learning-" + peers);
            }));
            const state = await page.evaluate(fs.readFileSync(process.env.LEARNING_CAPTURE_SCRIPT, "utf8"));
            state.elements = state.elements.filter(e => e.groupId?.startsWith("learning-"));
            state.name = "skills-practice-" + width;
            spacing.push(state);
          }
          await demo.locator(".knowledge-trigger").click();
          await demo.evaluate(e => e.scrollIntoView({ block: "start" }));
          await page.screenshot({ path: path.join(out, `skills-lab-${width}.png`) });
        }
        results.push({ slug, width, en, dark, contentPreserved: true, violations: 0 });
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ passed: true, states: results.length, results, errors }, null, 2));
    fs.writeFileSync(path.join(out, "spacing.json"), JSON.stringify(spacing));
    console.log(`PASS: ${results.length} learning states; quiz feedback, context boundaries, content preservation, keyboard and accessibility`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
