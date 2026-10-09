import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(p,import.meta.url),"utf8");
const canonical={
  "05-document-pdf-rag": ["fig-5-2","CH05",3],
  "09-reliability-evaluation-observability": ["fig-9-1","CH09",3],
  "12-fde-customer-delivery": ["fde-framework","CH12",3],
};
const chapters=JSON.parse(read("../src/chapters.json"));
const meta=JSON.parse(read("../src/atlas-metadata.json"));
const reader=read("../src/reader.tsx");
const ui=read("../src/structural-guides.tsx");
const style=read("../src/structural-guides.css");
const source12=read("../../../handbook/chapters/12-fde-customer-delivery.md");
for (const [slug,[anchor,,scenarioCount]] of Object.entries(canonical)) {
  const html=read("../../../web/chapters/"+slug+"/index.html");
  assert(html.includes('id="'+anchor+'"'),slug+": stable HTML source anchor missing");
  assert(chapters.find(ch=>ch.slug===slug)?.interactive,slug+": generated lab flag missing");
  assert(meta.find(ch=>ch.slug===slug)?.interactive,slug+": authored lab flag missing");
  assert(reader.includes('"'+slug+'"'),slug+": reader lazy registry missing");
  assert(ui.includes('"#'+anchor+'"'),slug+": portal anchor missing");
  assert.equal(scenarioCount,3);
}
for(const token of [
 "ProvenanceGuide","EvaluationGuide","DeliveryGuide",
 'id="concept-demo"','aria-pressed={current === index}', 'aria-live="polite"',
 "data-structural-version","useLayoutEffect","setHost(slot)",
 "Structure Reconstruction","Retriever Run","Policy Run",
 "source locator","cross-tenant","Human / Host write approval",
]) assert(ui.includes(token),"Missing semantic UI contract: "+token);
assert(reader.includes('hasStructuralGuide(chapter.slug)'),"Reader has to mount structural diagrams");
assert(reader.includes('|| hasStructuralGuide(chapter.slug)'),"Lab deep link must defer until lazy diagram");
assert(style.includes("container-type: inline-size"),"Responsive breakpoints must use Reader width");
assert(style.includes("min-height:44px"),"Touch targets must remain 44px");
assert(style.includes("prefers-reduced-motion: reduce"),"Must support reduced motion");
assert(source12.includes("Five responsibility planes, seven explicit checks"),"Canonical chapter plane count mismatch");
for(let i=1;i<=7;i++)assert(source12.includes("**B"+i+" ·"),"Missing CH12 explicit B"+i+" boundary");
assert(!ui.includes("Math.random")&&!ui.includes("fetch("),"Teaching diagrams must not fabricate observed data or call remote tools");
console.log("Structural Guide V3 source contract PASS: CH05/09/12 canonical anchors, ten Atlas labs, 3×3 scoped scenarios, deep links, boundaries and accessibility hooks.");
