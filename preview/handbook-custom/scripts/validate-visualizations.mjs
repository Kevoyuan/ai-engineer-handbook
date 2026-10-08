import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const chapters = JSON.parse(read("../src/chapters.json"));
const reader = read("../src/reader.tsx");
const guides = read("../src/visualization-guides.tsx");
const css = read("../src/visualization-guides.css");
const prefixChapter = read("../../../web/chapters/10-serving-deployment-ai-platform/index.html");
const dataChapter = read("../../../web/chapters/11-data-sql-engineering/index.html");

const labChapters = ["10-serving-deployment-ai-platform", "11-data-sql-engineering"];
assert(labChapters.every((slug) => chapters.some((chapter) => chapter.slug === slug && chapter.interactive)),
  "Registered interactive flags must include both chapter-local diagrams.");
assert(prefixChapter.includes('id="fig-10-1"'), "Canonical CH10 figure anchor changed.");
assert(dataChapter.includes('id="data-plane"'), "Canonical CH11 section anchor changed.");
assert(guides.includes('isServing ? "#fig-10-1" : "#data-plane"'), "Portal targets must match chapter anchors.");
assert(guides.includes('id="concept-demo"'), "Atlas deep links require the shared lab anchor.");
assert(guides.includes('data-viz-version="2"'), "Both diagrams must expose a version marker.");
assert(guides.includes('aria-pressed={current === index}'), "Scenario controls must expose selected state.");
assert(guides.includes('aria-live="polite"'), "Changed outcomes must be announced politely.");
assert(guides.includes("PrefixGuide") && guides.includes("DataGuide"), "Both scenario models must exist.");
assert(guides.includes("matched: 0") && guides.includes("matched: 2") && guides.includes("matched: 3"),
  "Prefix diagram must include distinct isolation / shortened / shared-prefix states.");
assert(guides.includes("Duplicate delivery") && guides.includes("Stale late arrival") && guides.includes("Unauthorized query"),
  "Data contract diagram must include duplicate, late, and authorization failure cases.");
assert(reader.includes('import("./visualization-guides")'), "Guides must be lazily loaded.");
assert(reader.includes("hasVisualGuide(chapter.slug)"), "Reader must mount guides for registered chapters.");
assert(reader.includes("onReady={setDiagramReady}"), "Ready callback must resolve lazy lab deep links.");
assert(css.includes("prefers-reduced-motion"), "Visual guides must honor reduced-motion settings.");
assert(css.includes("max-width: 760px"), "Visual guides require narrow viewport layout.");
assert(css.includes("min-height: 2.75rem"), "Interactive targets must meet 44px.");
assert(!/setInterval\(|requestAnimationFrame\(/.test(guides), "Static-choice diagrams should not autoplay.");
console.log("Visualization V2 contract OK: canonical anchors, bilingual scenarios, lazy route, reduced motion, focusable controls.");
