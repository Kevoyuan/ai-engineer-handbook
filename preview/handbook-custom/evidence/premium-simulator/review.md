# Simulator polish review

Scope: refine the existing chapter 06 dark terminal simulator. Retain the user-selected charcoal/terracotta direction and existing Interior controls. No business-policy or execution changes; the widget remains an explicitly labeled deterministic teaching simulation.

Visible changes: serif display heading; larger sans-serif context explanations; mono execution logs; recessed scenario tabs; actual request preview before running; semantic status Badge and stage count in the context title bar; restrained role-tinted messages; current-message emphasis; responsive stacked panes below 760px content width.

Trade-off: clearer text and larger controls use more vertical space, particularly on phones. The terminal and context panes retain bounded internal scrolling to keep controls and permissions separate from accumulating messages.

Rendered review: compared before-desktop.png/before-mobile.png with final-preview.png and preview-idle-390.png. Reviewed loaded desktop screenshot for hierarchy and latest-message visibility. Three widths (390, 1440, 1728), idle/focused/loaded DOM states passed Better Design spacing measurement with zero findings. Copy comprehension passed. Screenshots are browser captures, not mockups.

Validation: 18 bilingual simulator scenario states passed, including all three boundary outcomes, keyboard tabs, automatic playback cancellation, pause, reset, overflow, and WCAG checks. Sixty learning states passed, including canonical content preservation. Production TypeScript/build and local web publishing passed. Official DESIGN.md lint reported zero errors/warnings. Web validation passed for 42 HTML files. See adjacent logs for broader project checks.

Static audit limitation: strict project audit retains the same 30 findings as the before snapshot (unchanged list); no findings target skill-simulator.tsx. Findings include unused generated registry examples, Slot-composed links that the scanner treats as buttons, and pre-existing native-select ownership documentation in concept-diagrams.tsx. No whole-project strict-audit pass is claimed.

Broader runtime results: all 22 page/theme accessibility scans returned zero violations (`full-a11y.json`). The concept suite progressed through its matrix but timed out at its final optional-module failure test: its production chunk URL interception does not match Vite development URLs on default port 4180. The same failure/retry assertions passed against the production preview on 4181 (`production-recovery.json`). `test:ui` failed its pre-existing scroll restoration assertion; UX-CONTRACT.md explicitly states reading positions are neither saved nor restored. These are not reported as full-suite passes, and unrelated reader behavior was not changed to satisfy the stale expectation.

Source review: reduced-motion retains all content and controls; animation is limited to 180ms message arrival. No additional network request, real file access, billing, invented model reasoning or authorization is introduced. All scenario content remains available; full context, learning practice and the architecture disclosure remain reachable.
