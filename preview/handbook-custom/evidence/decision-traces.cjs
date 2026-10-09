// Browser regression for the source-grounded CH03/04/08 visual decision traces.
// Does not access Vercel, tools, models, private data or remote resources.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.HANDBOOK_URL || "http://127.0.0.1:4180/";
const cases = [
  { slug: "03-hybrid-retrieval-query-routing", kind: "query-routing", samples: 3 },
  { slug: "04-rag-reliability-selective-answering", kind: "evidence-gates", samples: 3 },
  { slug: "08-agent-orchestration", kind: "agent-loop", samples: 3 },
];
(async () => {
  const browser = await chromium.launch();
  let verified = 0;
  try {
    for (const width of [390, 768, 1440, 1728])
      for (const en of [false, true])
        for (const dark of [false, true]) {
          const context = await browser.newContext({
            viewport: { width, height: 960 },
            reducedMotion: "reduce",
          });
          await context.addInitScript(({ en, dark }) => {
            localStorage.setItem("preview-locale", JSON.stringify(en));
            localStorage.setItem("preview-theme", JSON.stringify(dark));
          }, { en, dark });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (e) => errors.push(e.message));
          for (const spec of cases) {
            await page.goto(base + "#read/" + spec.slug + "/concept-demo");
            await page.locator(".concept-demo .decision-trace").waitFor();
            const demo = page.locator("#concept-demo");
            const trace = demo.locator(".decision-trace");
            assert.equal(await trace.getAttribute("data-trace"), spec.kind);
            assert.equal(await demo.locator(".concept-flow .concept-node").count(), 4);
            assert.equal(await demo.locator(".knowledge-trigger").count(), 1,
              "Original optional practice remains available");
            assert.equal(await trace.count(), 1);
            const example = demo.locator("#concept-example");
            const next = demo.getByRole("button", {
              name: en ? "Next" : "下一步", exact: true,
            });
            for (let sample = 0; sample < spec.samples; sample++) {
              await example.selectOption(String(sample));
              assert.equal(await trace.getAttribute("data-scenario"), String(sample));
              assert.equal(await trace.getAttribute("data-step"), "0");
              if (spec.kind === "query-routing")
                assert.match(await trace.locator(".trace-decision strong").innerText(),
                  en ? /not executed yet/ : /尚未执行检索/);
              if (spec.kind === "evidence-gates")
                assert.equal(await trace.locator(".trace-evidence-signal strong").innerText(),
                  en ? "Not assessed" : "尚未评估");
              if (spec.kind === "agent-loop")
                assert.match(await trace.locator(".trace-round-head strong").first().innerText(),
                  en ? /Awaiting tool evidence/ : /等待工具验证证据/);
              const total = spec.kind === "agent-loop" && sample === 1 ? 8 : 4;
              for (let step = 1; step < total; step++) {
                await next.click();
                assert.equal(await trace.getAttribute("data-step"), String(step));
              }
              assert.equal(await next.isDisabled(), true);
              if (spec.kind === "query-routing") {
                assert.equal(await trace.locator('.trace-route[data-state="selected"]').count(), 2);
                assert.equal(await trace.locator('.trace-auth[data-state="passed"]').count(), 1);
                assert.equal(await trace.locator(".trace-recovery").count(), 1);
              }
              if (spec.kind === "evidence-gates") {
                assert.equal(await trace.locator(".trace-gates li").count(), 6,
                  "Canonical Gate 0 through Gate 5 must be visible");
                assert.equal(await trace.locator(".trace-evidence-signal strong").innerText(),
                  ["SUPPORT", "CONFLICT", "INSUFFICIENT"][sample]);
                assert.equal(await trace.locator('.trace-policy-options [data-state="selected"]').count(), 1);
                if (sample > 0) assert.equal(await trace.locator('.trace-gates li[data-state="blocked"]').count(), 1);
              }
              if (spec.kind === "agent-loop") {
                assert.equal(await trace.locator(".trace-loop-round").count(), sample === 1 ? 2 : 1);
                assert.equal(await trace.locator('.trace-loop-exits [data-state="selected"]').count(), 1);
                if (sample === 1) {
                  await demo.locator(".concept-node").nth(2).click();
                  assert.equal(await trace.getAttribute("data-step"), "6",
                    "Clicking Observe in round two should stay in round two");
                  assert.equal(await trace.locator('.trace-loop-exits [data-state="passed"] strong').innerText(),
                    "RETRY", "A traversed retry is not the active transition");
                  await next.click();
                }
              }
              verified++;
            }
            const overflow = await trace.evaluate((el) => ({
              width: el.scrollWidth, client: el.clientWidth,
              right: el.getBoundingClientRect().right, viewport: innerWidth,
            }));
            assert(overflow.width <= overflow.client + 2,
              "No horizontal overflow: " + JSON.stringify({width,spec:spec.kind,overflow}));
            assert(overflow.right <= overflow.viewport + 2, "No viewport clipping");
          }
          assert.deepEqual(errors, [], "Browser runtime errors");
          await context.close();
        }
    console.log("PASS DecisionTrace Chromium: " + verified
      + " scenarios across 4 widths, 2 locales and 2 themes; branching, Six Gates, retries, original controls, no clipping.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
