import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const chapters = JSON.parse(read("../src/chapters.json"));
const canonical = JSON.parse(read("../../../web/chapters.json"));
const metadata = JSON.parse(read("../src/atlas-metadata.json"));
assert.equal(metadata.length, canonical.length, "Authored Atlas metadata must match canonical chapter count");
assert.equal(new Set(metadata.map((entry) => entry.slug)).size, canonical.length,
  "Authored Atlas metadata slugs must be unique");
assert.deepEqual(
  chapters,
  canonical.map((chapter) => {
    const record = metadata.find((entry) => entry.slug === chapter.slug);
    assert(record, chapter.slug + ": missing Atlas metadata");
    const {slug, ...details} = record;
    return {...chapter, ...details};
  }),
  "Generated chapters must exactly match canonical source + authored Atlas metadata",
);
const main = read("../src/main.tsx");
const reader = read("../src/reader.tsx");
const styles = read("../src/handbook.css");
const demo = read("../src/concept-diagrams.tsx");
const simulator = read("../src/skill-simulator.tsx");
const visualGuides = read("../src/visualization-guides.tsx");
const structuralGuides = read("../src/structural-guides.tsx");

const expectedGroups = ["model", "retrieval", "agent", "production"];
const expectedLabs = ["03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const numbers = new Set(chapters.map((chapter) => chapter.number));
const slugs = new Set(chapters.map((chapter) => chapter.slug));

assert.equal(chapters.length, 12, "All 12 canonical chapters must be represented");
assert.equal(numbers.size, chapters.length, "Chapter numbers must be unique");
assert.equal(slugs.size, chapters.length, "Chapter slugs must be unique");
assert.deepEqual([...new Set(chapters.map((c) => c.group))], expectedGroups);
assert.deepEqual(chapters.filter((c) => c.interactive).map((c) => c.number), expectedLabs);

for (const chapter of chapters) {
  assert(expectedGroups.includes(chapter.group), chapter.number + ": unknown group");
  for (const field of ["slug", "zh", "en", "summaryZh", "summaryEn",
    "decisionZh", "decisionEn", "failureZh", "failureEn"]) {
    assert.equal(typeof chapter[field], "string", chapter.number + ": " + field);
    assert(chapter[field].trim(), chapter.number + ": blank " + field);
  }
  assert(Array.isArray(chapter.relatedNumbers), chapter.number + ": relatedNumbers");
  assert(chapter.relatedNumbers.length, chapter.number + ": missing related chapter");
  assert.equal(new Set(chapter.relatedNumbers).size, chapter.relatedNumbers.length,
    chapter.number + ": duplicate related chapter");
  for (const related of chapter.relatedNumbers) {
    assert(numbers.has(related), chapter.number + ": invalid related number " + related);
    assert.notEqual(related, chapter.number, chapter.number + ": self-reference");
  }
}

assert(main.includes("ch.group === g.id"), "Atlas must use registered chapter groups");
assert(main.includes("ch.summaryEn : ch.summaryZh"), "Atlas must use registered summaries");
assert(main.includes("ch.interactive"), "Atlas must use registered interactive flags");
assert(main.includes("selectedAtlas.relatedNumbers"), "Inspector must use registered related chapters");
assert(main.includes('chapterHref(i, "concept-demo")'), "Atlas labs need direct chapter deep links");
assert(reader.includes('location.hash.split("/")[2] !== "concept-demo"'),
  "Reader must defer the lab deep link until lazy content is ready");
assert(demo.includes('id="concept-demo"') && simulator.includes('id="concept-demo"') && visualGuides.includes('id="concept-demo"') && structuralGuides.includes('id="concept-demo"'),
  "Both regular diagrams and the skill simulator must expose the deep-link anchor");
assert(styles.includes(".atlas-inspector-details") && styles.includes(".atlas-node-actions"),
  "Inspector and node actions must have shared styles");

console.log("Atlas contract OK: 12 chapters, 4 layers, 10 labs, valid bilingual metadata and links.");
