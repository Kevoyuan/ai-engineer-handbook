// Real-browser regression checks for the teaching diagrams. No real tools are called.
const { chromium } = require("../node_modules/playwright");
const AxeBuilder = require("../node_modules/@axe-core/playwright").default;
const assert = require("node:assert/strict");
const fs = require("node:fs");
const out = process.env.CONCEPT_AUDIT_DIR || "/tmp/handbook-concept-audit";
const base = process.env.HANDBOOK_URL || "http://localhost:4180/";
const routes = [
  "03-hybrid-retrieval-query-routing",
  "04-rag-reliability-selective-answering",
  "08-agent-orchestration",
];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const states = [],
    geometry = [],
    errors = [];
  try {
    for (const reduce of [false, true])
      for (const dark of [false, true])
        for (const en of [false, true]) {
          const context = await browser.newContext({
            reducedMotion: reduce ? "reduce" : "no-preference",
          });
          await context.addInitScript(
            ({ dark, en }) => {
              localStorage.setItem("preview-theme", JSON.stringify(dark));
              localStorage.setItem("preview-locale", JSON.stringify(en));
              window.__name = (fn) => fn;
            },
            { dark, en },
          );
          const page = await context.newPage();
          page.on("pageerror", (e) => errors.push(e.message));
          for (const width of [390, 1440, 1728])
            for (const slug of routes) {
              await page.setViewportSize({ width, height: 1000 });
              await page.goto(base + "#read/" + slug);
              await page.reload();
              const demo = page.locator("#concept-demo");
              await demo.waitFor();
              await page.evaluate(() => document.fonts.ready);
              await demo.evaluate((e) =>
                e.scrollIntoView({ block: "start", behavior: "instant" }),
              );
              assert.equal(await page.locator("#concept-demo").count(), 1);
              assert.equal(
                await page
                  .getByRole("button", {
                    name: en ? "Interactive diagram" : "交互图解",
                    exact: true,
                  })
                  .isEnabled(),
                true,
              );
              for (const example of ["0", "1", "2"]) {
                await demo.locator("select").selectOption(example);
                assert.match(
                  await demo.locator(".concept-position").innerText(),
                  /^1 \/ /,
                );
                const count = slug.startsWith("08") && example === "1" ? 8 : 4;
                for (let i = 1; i < count; i++)
                  await demo
                    .getByRole("button", {
                      name: en ? "Next" : "下一步",
                      exact: true,
                    })
                    .click();
                assert.match(
                  await demo.locator(".concept-position").innerText(),
                  new RegExp("^" + count + " / " + count),
                );
                assert.equal(
                  await demo
                    .getByRole("button", {
                      name: en ? "Next" : "下一步",
                      exact: true,
                    })
                    .isDisabled(),
                  true,
                );
                await demo
                  .getByRole("button", {
                    name: en ? "Previous" : "上一步",
                    exact: true,
                  })
                  .click();
                assert.match(
                  await demo.locator(".concept-position").innerText(),
                  new RegExp("^" + (count - 1) + " /"),
                );
                await demo.locator(".concept-node").first().click();
                assert.match(
                  await demo.locator(".concept-position").innerText(),
                  /^1 \/ /,
                );
              }
              await demo.locator("select").selectOption("0");
              await page.waitForTimeout(250);
              const layout = await demo.evaluate((e) => ({
                outside: e.getBoundingClientRect().right > innerWidth + 1,
                overflow: e.scrollWidth > e.clientWidth + 1,
                opacity: getComputedStyle(
                  e.querySelector(".concept-explanation > div"),
                ).opacity,
                nodeColumns: getComputedStyle(
                  e.querySelector(".concept-flow"),
                ).gridTemplateColumns.split(" ").length,
              }));
              assert.equal(
                layout.outside || layout.overflow,
                false,
                JSON.stringify({ slug, width, layout }),
              );
              assert.equal(layout.opacity, "1");
              assert.equal(layout.nodeColumns, width === 390 ? 1 : 4);
              assert.equal(
                await demo
                  .getByRole("button", {
                    name: en ? "Play" : "播放",
                    exact: true,
                  })
                  .count(),
                reduce ? 0 : 1,
              );
              const axe = await new AxeBuilder({ page })
                .include("#concept-demo")
                .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                .analyze();
              assert.deepEqual(
                axe.violations.map((v) => ({
                  id: v.id,
                  nodes: v.nodes.length,
                })),
                [],
                slug + " accessibility",
              );
              states.push({
                slug,
                width,
                dark,
                en,
                reduce,
                layout,
                violations: 0,
              });
              if (!reduce && !en) {
                await page.screenshot({
                  path:
                    out +
                    "/" +
                    slug +
                    "-" +
                    width +
                    "-" +
                    (dark ? "dark" : "light") +
                    ".png",
                });
                if (process.env.CONCEPT_CAPTURE_SCRIPT) {
                  await demo.evaluate((e) =>
                    [e, ...e.querySelectorAll("*")].forEach((n) =>
                      n.setAttribute("data-bd-group", "concept-demo"),
                    ),
                  );
                  const capture = fs.readFileSync(
                    process.env.CONCEPT_CAPTURE_SCRIPT,
                    "utf8",
                  );
                  const state = await page.evaluate(capture);
                  state.elements = state.elements.filter(
                    (e) =>
                      e.groupId === "concept-demo" ||
                      e.selector?.includes("concept-"),
                  );
                  state.name =
                    slug + "-" + width + "-" + (dark ? "dark" : "light");
                  geometry.push(state);
                }
              }
            }
          await context.close();
        }
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/concept-diagrams-*.js", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await r.continue();
    });
    await page.goto(base + "#read/" + routes[0]);
    const shortcut = page.getByRole("button", {
      name: "交互图解",
      exact: true,
    });
    await shortcut.waitFor();
    if (!(await page.locator("#concept-demo").count()))
      assert.equal(await shortcut.isDisabled(), true);
    await page.locator("#concept-demo").waitFor();
    await shortcut.click();
    const demo = page.locator("#concept-demo");
    await demo.getByRole("button", { name: "播放", exact: true }).click();
    await assert.doesNotReject(() =>
      page.waitForFunction(
        () =>
          document
            .querySelector(".concept-position")
            ?.textContent.startsWith("4 / 4"),
        {},
        { timeout: 12000 },
      ),
    );
    await demo.getByRole("button", { name: "暂停", exact: true }).click();
    assert.match(
      await demo.locator(".concept-position").innerText(),
      /^4 \/ 4/,
    );
    await demo.getByRole("button", { name: "重播", exact: true }).click();
    assert.match(
      await demo.locator(".concept-position").innerText(),
      /^1 \/ 4/,
    );
    await demo.getByRole("button", { name: "暂停", exact: true }).click();
    await page.waitForTimeout(3100);
    assert.match(
      await demo.locator(".concept-position").innerText(),
      /^1 \/ 4/,
    );
    await demo.getByRole("button", { name: "播放", exact: true }).click();
    await demo.locator("select").selectOption("1");
    assert.equal(
      await demo.getByRole("button", { name: "播放", exact: true }).count(),
      1,
    );
    await page.goto(base + "#home");
    await page.waitForTimeout(3000);
    assert.equal(await page.locator("#concept-demo").count(), 0);
    assert.deepEqual(errors, []);
    // A failed optional module must not take down the chapter.
    const failurePage = await browser.newPage();
    const blockModule = r => r.abort("failed");
    await failurePage.route("**/concept-diagrams-*.js", blockModule);
    await failurePage.goto(base + "#read/" + routes[0]);
    await failurePage.getByRole("alert").waitFor();
    assert.equal(await failurePage.locator(".canonical-content").isVisible(), true);
    assert.equal(await failurePage.getByRole("button", { name: "交互图解", exact: true }).isDisabled(), true);
    await failurePage.unroute("**/concept-diagrams-*.js", blockModule);
    await failurePage.getByRole("button", { name: "重新加载", exact: true }).click();
    await failurePage.locator("#concept-demo").waitFor();
    assert.equal(await failurePage.getByRole("button", { name: "交互图解", exact: true }).isEnabled(), true);
    await failurePage.close();
    fs.writeFileSync(
      out + "/results.json",
      JSON.stringify(
        {
          states,
          errors,
          playback:
            "pause/replay/scenario interruption/route cleanup/lazy readiness/module failure and retry passed",
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(out + "/spacing.json", JSON.stringify(geometry));
    console.log(
      "PASS: " +
        states.length +
        " responsive/theme/language/reduced-motion states, accessibility and playback lifecycle.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
