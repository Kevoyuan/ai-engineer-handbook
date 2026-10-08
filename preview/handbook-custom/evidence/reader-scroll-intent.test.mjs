// Run with Node 22+: node --experimental-strip-types evidence/reader-scroll-intent.test.mjs
import assert from "node:assert/strict";
import {
  advanceScrollChrome,
  makeScrollChromeState,
  resetScrollChrome,
} from "../src/reader-scroll-intent.ts";

let now = 2000;
let y = 300;
const state = makeScrollChromeState(y, true);
const changes = [];
function scroll(delta, delay = 25, locked = false) {
  y += delta;
  now += delay;
  const visibility = advanceScrollChrome(state, y, now, locked);
  if (visibility !== null) changes.push(visibility);
  return visibility;
}
for (let i = 0; i < 10; i++) scroll(9);
assert.deepEqual(changes, [false], "Sustained downward motion hides chrome");

for (let i = 0; i < 12; i++) scroll(i % 2 === 0 ? -6 : 5);
assert.deepEqual(changes, [false], "Alternating reverse jitter cannot flash chrome");

for (let i = 0; i < 10; i++) scroll(-8);
assert.deepEqual(changes, [false], "Short reverse gesture leaves chrome hidden");

for (let i = 0; i < 7; i++) scroll(-8);
assert.deepEqual(changes, [false, true], "Sustained reverse motion reveals chrome");

for (let i = 0; i < 12; i++) scroll(9, 12);
assert.deepEqual(changes, [false, true], "Cooldown prevents immediate re-hide");

for (let i = 0; i < 15; i++) scroll(9, 35);
assert.deepEqual(changes, [false, true, false], "Deliberate renewed scroll hides again");

y = 45;
now += 20;
assert.equal(advanceScrollChrome(state, y, now), true, "Chapter top always reveals");

resetScrollChrome(state, 1240, true, now);
now += 1;
assert.equal(advanceScrollChrome(state, 1300, now), null);
assert.equal(advanceScrollChrome(state, 2050, now + 1), null, "Large programmatic jump is ignored");

resetScrollChrome(state, 1200, false, now);
assert.equal(advanceScrollChrome(state, 1200, now + 1, true), true, "Open dialog forces toolbar visible");

console.log("PASS Reader scroll intent: nine anti-flicker/edge cases");
