# Design System — AI Engineer Handbook

Last synchronized: 2026-09-15.

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

Current implementation uses system UI fallbacks together with Noto Sans SC, Noto Serif SC, Space Grotesk, and JetBrains Mono where available.

Desktop reading baseline:

- Body: about 17px / 1.95
- Chapter title: 24–32px
- Subsection title: about 21px
- Code/data: JetBrains Mono / system monospace fallback
- Long prose should use balanced/polite wrapping and stay near 70–80ch when practical.

### Audited mobile scale

The mobile reader uses a deliberately compact technical-reference scale. Do not only reduce `body`; every explicit component font must be checked because later-loaded component CSS can otherwise restore larger desktop values.

At ≤768px:

- Body / lead: **14px** with about **1.66–1.68** line height
- Chapter title: **19px**
- Subsection title: **15.5px**
- Chapter number: **24px**
- Cover title: **30px**
- Index / Search page heading: **24px**
- Chapter-card title: **15px**
- BFS / diagram title: about **15–17px**
- Card title: about **13px**
- Dense explanatory copy: about **11.5px**
- Table text: about **12px**
- Code: about **11.5px**
- Navigation text: about **12–12.5px**
- Interactive Lab title: about **16px**; Lab body / controls mostly **9.5–11.5px**

At ≤480px:

- Body / lead: **13px** with about **1.62** line height
- Chapter title: **18px**
- Subsection title: **14.5px**
- Chapter number: **22px**
- Cover title: **26px**
- Index / Search page heading: **21px**
- Chapter-card title: **14px**
- BFS / diagram title: about **14–15.5px**
- Card title: about **12px**
- Dense explanatory copy: about **10.5px**
- Table text: about **11px**
- Code: about **10.5px**
- Interactive Lab title: about **14.5px**

Exceptions:

- Search / text inputs stay at **16px** where needed to avoid iOS auto-zoom.
- Tap targets stay ≥44px even when their labels are visually smaller.
- Large numbers used as quantitative emphasis may remain larger than body copy, but they should not dominate the reading hierarchy on phones.

Chapter and subsection headings use a reliable system CJK sans stack on phones so mixed Latin/CJK text does not depend on `Georgia` plus an unavailable serif fallback. Mobile browser text auto-adjustment is normalized with `text-size-adjust: 100%`.

The mobile goal is a dense engineering-reader rhythm: no isolated component should jump back to desktop-scale typography simply because it defines its own `font-size`.

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
- A bottom reading dock may provide **Previous / Search / Focus / Next** for one-handed navigation when present. It must respect `safe-area-inset-bottom`.
- Full-text search should use at least a 16px input size to avoid iOS auto-zoom.
- Reading controls should preserve ≥44px touch targets.
- Wide tables scroll inside their own container rather than widening the document.
- At ≤560px the cover statistics become 2×2 and content spacing tightens without deleting information.
- The standalone back-to-top floating button should not compete with phone reading controls.
- Drawer layering must preserve content < backdrop < drawer < topbar.
- Mobile controls inherit the global palette tokens; no mobile-only recoloring is allowed by default.
- Typography follows the audited mobile hierarchy above across prose, navigation, diagrams, tables, code, search, and dynamically loaded labs.

Current effective implementation assets:

```text
web/assets/app.css                    # base responsive primitives
web/assets/home.css                   # cover / index / search primitives
web/assets/reader.css                 # late reading layer + authoritative mobile type overrides
web/assets/handbook-interactions.css  # dynamically loaded interactive labs
web/assets/app.js                     # navigation, i18n, search, runtime chapter additions
```

`handbook-interactions.css` is appended dynamically after runtime chapter additions. If its mobile typography conflicts with the reader scale, the mobile reader layer must use sufficiently specific / important rules or the interaction stylesheet must define matching mobile values.

Do not rely on unlinked legacy responsive assets as the source of truth; verify which stylesheets are actually loaded by the current pages.

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

`MAINTENANCE.md` is the canonical repository maintenance SOP. Presentation changes still follow this local design sequence:

```text
inspect current implementation
→ preserve semantic meaning
→ apply DESIGN.md contract
→ validate responsive + i18n + interactions
→ feature branch / PR
→ CI + Preview
→ main / production verification
```

Interview-only material should be stored under `archive/interview` rather than expanding the core handbook.
