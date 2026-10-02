# Concept diagrams

Targeted teaching enhancement for the existing knowledge handbook. Design variance 5, motion intensity 4, density 5. Existing Geist, neutral surfaces, sage actions, Iconoir arrows and installed Button components remain in use.

## Teaching contract

- Chapter 03: query evidence shape selects Exact/BM25, hybrid retrieval or optional Graph. Authorization precedes similarity. Three illustrative questions.
- Chapter 04: simplified six-gate explanation compares supported, conflicting and insufficient evidence. No fabricated confidence percentages or actual refund-policy claims.
- Chapter 08: plan/action/observation/limits demonstrates completion, bounded revision and budget exhaustion. No real tool calls.
- Original diagrams, article text, slugs and section IDs stay intact. New diagrams are inserted next to the relevant static figure. The chapter toolbar provides a shortcut.

## Motion contract

Playback begins only on reader request. Each discrete explanation advances after 2.8 seconds and playback stops at the end. Readers may pause, step, select a node or change examples immediately. Scenario changes cancel playback and reset to the first explanation. Leaving the diagram or hiding the tab pauses it. Unmount cleans up timers, observers, listeners and the portal slot.

Explanation transitions use 200ms ease-out, opacity and a 5px translation. A finite connector marker indicates information passing to the next node. Button press feedback uses a short scale change. There is no scroll hijacking, parallax, decorative autoplay or per-frame React state.

Reduced-motion preference removes playback and animated connectors, while retaining all nodes, scenarios and manual steps. Both themes share the same semantic tokens. Below a 768px reading-pane width, nodes and connecting arrows stack vertically. Transport hit areas are at least 44px in both dimensions.

The concept module loads in a separate chunk only for the three relevant chapters. The shortcut reserves its place before loading to avoid a mobile layout shift, and stays disabled until the portal mounts. A local error boundary preserves the article if the module fails to load.

## Verification

- `npm run test:concepts`: 72 combinations of three chapters, three widths (390/1440/1728), two languages, two themes and two motion preferences. Exercises all examples, manual completion, previous/node navigation, pause/replay, example interruption, lazy readiness and route cleanup. Axe WCAG A/AA checks pass for the diagrams.
- Rendered spacing: six routing-diagram states across both themes and the three widths. Better Design `inspect-spacing` completed with score 100, zero findings. Equivalent node and playback groups are measured separately.
- Final geometry sweep: 36 chapter/theme/language/width combinations with no diagram overflow and transport targets at least 44px.
- All three playback-toolbar comprehension checks pass. Independent motion review and skeptic confirmed two bugs (final-frame pause reset and premature shortcut activation); both were fixed and exercised in browser tests.
- Structural validation passes. Article source and generated content payloads are unchanged.
- Simulated mobile Lighthouse: performance 94, LCP 2.7s, TBT 30ms, CLS 0. A baseline run scored 72, LCP 4.9s, TBT 40ms, CLS 0. These single runs use different local servers and are not a reliable speedup claim. LCP remains above the 2.5s target; INP and real-device Safari were not measured.

Screenshots, geometry, Axe results and Lighthouse JSON are in `/tmp/handbook-concept-audit`. This temporary location is not a durable report archive. Tests default there; set `CONCEPT_AUDIT_DIR` to retain evidence elsewhere, and `HANDBOOK_URL` to test another preview.
