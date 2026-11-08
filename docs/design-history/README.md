# AI Engineering Atlas · Design Decision Archive

**Historical only.** This directory preserves the complete design and interaction contracts from the last source-verified release before the 2026-11-08 consolidation. Existing technical and visual design rationale remains available to reviewers, but archived sentences are **not current instructions** when they conflict with the active contract.

| Authority | Document | Purpose |
| --- | --- | --- |
| Current / normative | [../../DESIGN.md](../../DESIGN.md) | Atlas look, Figure Shell, source ownership, accessibility, release rules |
| Current / normative | [../../preview/handbook-custom/UX-CONTRACT.md](../../preview/handbook-custom/UX-CONTRACT.md) | Reader routing, content, interactions and verification |
| Frozen archive | [DESIGN-full-2026-11-06.md](DESIGN-full-2026-11-06.md) | Full 94KB predecessor, saved verbatim, including V2/V3 evolution, screenshot repairs and superseded rationale |
| Frozen archive | [UX-CONTRACT-full-2026-11-06.md](UX-CONTRACT-full-2026-11-06.md) | Full 60KB predecessor, saved verbatim, including historical behavior changes |

## Contribution rule

Update the active file in-place when changing an *existing rule*. Add an archive note only for a decision with lasting explanatory value. Avoid appending another chronological patch to the end of active DESIGN.md or duplicating a rule across multiple chapter-specific CSS files. Runtime CSS and authoritative authored content remain the behavior and factual sources of truth; the documents describe intended contracts.

## 2026-11-08 · Figure Shell consolidation

- Extracted the 2026-11-06 CH06/CH10 architecture rules and CH08/CH09 responsive labs from the end of `src/handbook.css` into `src/teaching-figures.css`.
- Introduced `atlas-figure-shell` for seven CH06/08/10 figure roots with actual shared heading/summary/surface/width behavior; domain-specific geometry and simulations stay distinct.
- The current DESIGN.md and UX-CONTRACT.md now contain normative rules only; the previous complete files were preserved unchanged above.
- Verification includes source sync, browser geometry, visual screenshots, existing lab/scrollbar/Reader checks and exact published asset parity.
