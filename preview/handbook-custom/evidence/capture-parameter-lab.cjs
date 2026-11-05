/* Screenshot the ACTUAL visible Reader viewport, not the entire tall lab element.
 * The Reader is a nested scroll container. Locator.screenshot() can rasterize
 * the clipped/offscreen region as blank dark/light space, creating misleading
 * "visual evidence". Capture the viewport after explicit scroll alignment.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

async function settleVisuals(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
}

async function captureLabReview(page, selector, directory, basename) {
  fs.mkdirSync(directory, { recursive: true });
  const lab = page.locator(selector);
  const heading = lab.locator("h4").first();

  for (const position of ["start", "end"]) {
    await lab.evaluate((node, block) => {
      node.scrollIntoView({ block, inline: "nearest", behavior: "instant" });
    }, position);
    await settleVisuals(page);

    // A CSS-visible element may still be offscreen inside a nested scroller.
    // Require the appropriate part of the teaching lab to intersect the viewport.
    const box = await lab.boundingBox();
    const viewport = page.viewportSize();
    assert(box && viewport, "Expected a rendered lab and viewport");
    assert(
      box.y < viewport.height && box.y + box.height > 0,
      selector + " did not intersect the viewport for " + position + " capture"
    );
    if (position === "start") {
      const h = await heading.boundingBox();
      assert(h && h.y >= -4 && h.y < viewport.height,
        selector + " heading must appear in the first viewport screenshot");
    }

    await page.screenshot({
      path: path.join(directory, basename + "-" + position + ".png"),
      animations: "disabled",
      fullPage: false,
    });
  }
}

module.exports = { captureLabReview };
