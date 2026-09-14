# Design System — AI Engineer Handbook

Last synchronized: 2026-09-14.

## Product direction

AI Engineer Handbook is a long-lived technical reference for production AI engineering. The primary use cases are deep reading, concept retrieval, architecture review, and engineering decision support. Interview preparation is a secondary downstream use case and should not determine the organization of the core knowledge.

The visual direction is **Industrial-Editorial + Quiet Reader**: cool gray page background, white paper surfaces, blue primary emphasis, orange secondary emphasis, strong typography, hairline borders, generous reading space, and dense but interpretable technical diagrams.

Responsive/mobile work must preserve the existing visual identity. It may change layout, sizing, hierarchy, touch targets, scrolling, and navigation ergonomics, but it must not change the palette unless the user explicitly requests a visual redesign.

Avoid decorative gradients, generic SaaS card walls, meaningless animation, large glowing shapes, and visual simplification that removes technical content.

## Information architecture

The repository separates durable engineering knowledge from interview-specific material.

```text
CORE HANDBOOK
01–10  reusable AI engineering knowledge

SECONDARY MATERIAL
archive/interview  interview scripts, company question banks, recall notes
```

The current interactive HTML still contains the historical 19-section study product. When it is refactored, 1–10 remain the core technical spine and 11–19 become reference/archive layers rather than peer technical chapters.

## Visual tokens

Light:

```text
--bg:     #edf0f4
--paper:  #ffffff
--paper2: #f7f9fb
--ink:    #1a2434
--mut:    #5d6a7c
--line:   #d8dee7
--line2:  #b9c3d0
--blu:    #2456d6
--org:    #e8590c
--grn:    #0e9f6e
--pur:    #7048c8
--red:    #d64545
```

Dark:

```text
--bg:     #0d1220
--paper:  #151c2c
--paper2: #1a2234
--ink:    #e7ecf5
--mut:    #93a1b6
--line:   #28334b
--line2:  #3a4a6b
--blu:    #7398ff
--org:    #ff8f4d
--grn:    #3fd69a
--pur:    #b39aff
--red:    #ff7d72
```

`--blu` is the primary blue emphasis token. Semantic diagram colors keep their existing meaning.

**Palette freeze rule:** mobile/tablet adaptations may not alter these tokens or introduce hard-coded colors that change the overall product appearance unless the user explicitly asks for a redesign.

## Typography

Current implementation uses Noto Sans SC, Noto Serif SC, Space Grotesk, and JetBrains Mono.

- Body: about 17px / 1.95
- Chapter title: 24–32px
- Subsection title: about 21px
- Code/data: JetBrains Mono
- Long prose should use balanced/polite wrapping and stay near 70–80ch when practical.

## Diagram grammar

Use the diagram type that matches the knowledge structure rather than forcing every concept into cards.

- short linear flow → compact numbered rows or horizontal track
- explicit orchestration → visible topology with branch/join/checkpoint boundaries
- hierarchy → pyramid/tree
- state transition → state machine / state patch flow
- comparison → matrix/table
- architecture → layered system diagram

Each diagram should have one dominant topology marker. Semantic color is used for meaning, not decoration.

### Bento Flow Studio / Quiet Topology

Keep using the established BFS grammar where appropriate:

- `.bfs-canvas`
- `.bfs-head`
- `.bfs-tag`
- `.bfs-title`
- `.bfs-subtitle`
- `.bfs-body`
- `.bfs-flow-container`
- `.bfs-card`
- `.bfs-stage-pill`
- `.bfs-card-title`
- `.bfs-card-desc`
- semantic accents: blue / amber / emerald / purple / rose / teal
- density modifiers: compact list / compact track

For Loop / Graph content, use **local bounded loop + outer explicit topology**. Do not depict Loop → Graph as an old-to-new technology progression. Show operational boundaries, branch/join, checkpoint, permission boundary, failure isolation, and recovery.

## Interaction principles

The reading product may support:

- sidebar navigation
- full-text search
- language toggle
- light/dark mode
- font-size controls
- focus reading
- expandable answers/reference notes
- persistent reading position

Interaction must never hide core content by default or require animation to reveal it.

## Mobile Reader

Phone layouts are a distinct reading mode rather than a scaled-down desktop page.

- At ≤900px the header prioritizes **table of contents, current chapter, theme, and language**. The current chapter is single-line and truncates safely.
- A bottom reading dock provides **Previous / Search / Focus / Next** for one-handed navigation. It respects `safe-area-inset-bottom`.
- Full-text search becomes a bottom sheet up to `88dvh`; the search field stays at 16px to avoid iOS auto-zoom.
- Reading controls become a 2×2 grid and interactive targets remain at least 44px tall.
- Wide tables scroll inside their own `.mobile-table-scroll` container rather than widening the document.
- At ≤560px the cover statistics become 2×2 and content spacing tightens without deleting information.
- The standalone back-to-top floating button is hidden on phones so it does not compete with the reading dock.
- Drawer layering must be: content < backdrop < drawer < topbar. The bottom dock sits below the backdrop while the drawer is open.
- Mobile controls inherit the global palette tokens; no mobile-only recoloring is allowed by default.

Current reusable implementation assets:

```text
web/mobile-reader.css
web/mobile-reader.js
```

## Responsive requirements

Validate at least:

```text
1440
1024
768
430
390
375
320
```

No page-level horizontal overflow is allowed. Complex tables may scroll inside their own container. Graphs should reflow rather than compress labels into unreadable blocks.

## Content-preservation rule

Visual redesign must preserve technical meaning, node order, state transitions, parameters, bilingual labels where present, and failure/control boundaries. Do not delete technical details merely to make a diagram cleaner.

## Maintenance rule

When new material arrives:

```text
research / verify
→ extract reusable engineering principle
→ merge into core handbook
→ update interactive HTML
→ validate navigation / IDs / JS / responsive layout
```

Interview-only material should be stored under `archive/interview` rather than expanding the core handbook.
