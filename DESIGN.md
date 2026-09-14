# Design System — AI Engineer Handbook

Last synchronized: 2026-09-14.

## Product direction

AI Engineer Handbook is a long-lived technical reference for production AI engineering. The primary use cases are deep reading, concept retrieval, architecture review, and engineering decision support. Interview preparation is a secondary downstream use case and should not determine the organization of the core knowledge.

The visual direction is **Quiet Editorial + Industrial-Editorial technical diagrams**: warm paper surfaces, restrained green emphasis, strong typography, hairline borders, generous reading space, and dense but interpretable technical diagrams.

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
--bg:     #f6f5f0
--paper:  #fffefa
--paper2: #eeeee7
--ink:    #263b35
--mut:    #63716b
--line:   #dedfd5
--line2:  #b7c2b8
--blu:    #22634f
--org:    #ad6038
```

Dark:

```text
--bg:     #141c19
--paper:  #1b2621
--paper2: #24312a
--ink:    #e4ebe3
--mut:    #a8b7ac
--line:   #34433a
--line2:  #586c5e
--blu:    #91c9ac
--org:    #e3aa80
```

Historical variable `--blu` now represents the primary green emphasis color.

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
