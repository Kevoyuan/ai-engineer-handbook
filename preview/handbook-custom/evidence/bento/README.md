# Skills terminal simulator review

The user requested the supplied dark terminal/context screenshot and explicitly invoked the bento terminal style plugin. Chapter 06 was structurally redesigned: its prominent map and node-card player became a 1:2 terminal/context simulator, with five phases, three existing teaching scenarios, permissions/assets, illustrative metrics and run/pause/resume/step/reset controls. Context-layer inspection and the Archify map remain available behind a disclosure. Chapter prose is preserved.

The single React source is `../../src/skill-simulator.tsx`. Scoped charcoal/terracotta styling follows the user reference. Installed Interior Button, Tabs and underline progress primitives, Iconoir ArrowRight, and the existing Collapsible/RadioGroup quiz provide the controls. The progress indicator is a dependent workflow attached to a teaching simulation, not an operational dashboard. No real model reasoning, tool calls, file access, tokens or billing are represented as real activity.

## Evidence

- `before-390.png`, `before-1440.png`, `after-390.png` and `after-1440.png`: matching viewport comparisons. `final-preview.png` captures the full actual simulator at 1440×1500 without altering DOM layout or overflow.
- `integration.json`: 18 scenario states at 390/1440/1728 in Chinese and English; successful execution, missing-input and denied access; terminal outcome, no tool results for blocked cases; keyboard scenario navigation, timed playback, pause and reset cancellation.
- `axe-*.json`: no WCAG A/AA violations in tested scenario states.
- `measured-states.json` and `spacing-review.json`: actual DOM capture at all three widths for idle, keyboard focus and loaded instructions. Better Design returned completed for all states with zero findings. Spacing scale includes the installed registry's 6px control gap.
- `test:learning`: 60 states across five chapters, two locales and themes, three widths. Canonical source-to-render prose equality, correct/incorrect quiz feedback, radio keyboard interaction, reset, boundary cases and accessibility passed.
- `../archify/integration.json`: 24 overview states, including the new Skills disclosure and Memory overview; image loading, no overflow, language-aware links and accessibility passed.
- `npm run publish:web`: TypeScript/Vite build passed and exact current application copied to `web/site`. No external deployment performed.
- `node web/validate.mjs`: 42 HTML documents and all local references passed. Its DOM ID matcher was corrected to distinguish `id` attributes from repeated `data-edge-id` relationship metadata in Archify exports.

Image review inspected desktop and mobile screenshots, including loaded-context state. The visible hierarchy follows the reference: scenario selection and send command first, user-visible terminal versus illustrative internal context, then permissions/assets. Mobile stacks the panes and wraps the progress labels. All operations are local demonstrations; quiz answers are not persisted.

The existing full UI suite has an unrelated back/scroll-restoration failure recorded in `../learning-review.md`; this focused review does not claim that suite passes. No callable `review-ui-code` tool was available; the review used the loaded Better Design rules, source inspection, rendered evidence, comprehension check, measured spacing and accessibility instead.

The three exact Archify viewers also passed supplementary node passport, Escape/clear closure, stable-ID finder and theme/topology checks. `../archify/viewer-interactions.json` binds these manual browser checks to each artifact digest; it does not replace the independent automated `visual-check` status.

Final regression: `test:concepts` passed all 96 responsive/theme/language/reduced-motion states, accessibility and playback lifecycle. The final build, simulator checks, 60 learning states, 24 overview states, three supplementary viewer checks, structural audit and whitespace check all passed. This does not change the documented limitation of the unrelated full UI suite.
