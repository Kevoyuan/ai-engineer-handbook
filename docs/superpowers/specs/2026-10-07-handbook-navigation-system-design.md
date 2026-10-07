# Handbook Navigation System Redesign

Date: 2026-10-07  
Status: Proposed design, approved direction B  
Scope: Home / navigation information architecture, Chapter 01–10 visual grammar, Knowledge Map entry and preview  
Out of scope: chapter technical content, chapter body typography, technical diagram topology, new UI framework, decorative animation

## 1. Problem

The current product has the correct visual direction—quiet engineering handbook rather than generic AI SaaS—but the homepage exposes too many peer navigation concepts:

~~~text
Top-level Contents / Saved
+ Sidebar chapter hierarchy
+ Homepage domain filters
+ Search
+ Popular-topic shortcuts
+ Knowledge Map CTA
~~~

Each is individually useful, but together they create ambiguity about where a reader should start.

The redesign establishes one explicit navigation model:

~~~text
CHAPTERS = backbone
SEARCH   = shortcut
MAP      = global view
~~~

Everything else becomes subordinate to one of these three.

## 2. Verified current-state issues

Source review of current main confirms:

1. The homepage chapter count is hard-coded as 09, while chapters.json contains 10 chapters.
2. The source currently defines four chapter groups:
   - Model foundations
   - Retrieval & RAG
   - Agent engineering
   - Evaluation & production
3. The homepage filter still exposes only three numeric category values (0, 1, 2) plus saved.
4. The label Production is bound to filter value 2, which currently corresponds to the third group, Agent engineering.
5. The group subtitle arrays contain only three entries, while four groups exist, so the fourth group has no defined subtitle.
6. Saved chapters are represented both as a persistent sidebar entry (我的收藏) and as a homepage filter (收藏).
7. Knowledge Map is currently a low-emphasis footer link / bottom CTA rather than one of the two explicit discovery paths next to Search.
8. The chapter count and filter semantics depend on manual positional assumptions rather than registry-derived data.

These are not only visual inconsistencies; they are information-architecture and data-binding defects.

## 3. Product intent

The homepage should answer three reader intents immediately:

~~~text
"I know what I need."
→ Search

"I am new and need the whole picture."
→ Knowledge Map

"I want to study systematically."
→ Chapters 01–10
~~~

The first viewport should communicate these three modes without creating three competing navigation systems.

## 4. Design principles

### 4.1 Chapters are the backbone

The 01–10 sequence is the canonical information architecture.

The chapter number becomes a stable product signature:
- visible in sidebar navigation;
- prominent in homepage chapter rows;
- stable across language modes;
- aligned to a fixed column;
- visually stronger than secondary metadata but not louder than the chapter title.

### 4.2 Search is the shortcut

Search remains the fastest path for returning readers.

Popular terms are subordinate shortcuts beneath Search, not a fourth navigation system.

### 4.3 Knowledge Map is the global view

Knowledge Map becomes a clear peer to Search at the discovery layer:
- Search = I know what I need.
- Map = Show me the system.

It remains a separate route and does not replace the chapter directory.

### 4.4 Saved is personal state, not taxonomy

Saved chapters remains in the sidebar / personal space.

It is removed from homepage domain filtering so personal state is not mixed with content classification.

### 4.5 Content density over hero branding

The Hero is compacted so a 1440px desktop viewport can reveal:
- headline;
- search;
- Knowledge Map entry;
- beginning of the chapter directory.

No larger brand masthead, illustration, decorative gradient, or animated hero is added.

## 5. Homepage information architecture

Target order:

~~~text
1. Compact Hero
2. Primary Search
3. First-time reader / Knowledge Map entry
4. Chapter directory header
5. 01–10 chapter backbone
6. Compact Knowledge Map preview
~~~

### 5.1 Compact Hero

Keep the current copy direction:

~~~text
把知识串起来，把系统做扎实。
从检索到 Agent，从原理到生产。
~~~

The Hero should use less vertical space than the current version.

No new decorative object should be introduced.

### 5.2 Search block

Search remains visually primary.

Structure:

~~~text
[ Search concepts, chapters, engineering patterns…   ⌘ K ]

Popular:
BM25 · RAG · Agent · Memory
~~~

Popular terms remain text-level shortcuts.

### 5.3 Knowledge Map entry

Immediately below / beside Search:

~~~text
第一次来？
从 Knowledge Map 看全貌 →
~~~

English:

~~~text
New here?
Start with the Knowledge Map →
~~~

This is a discovery-mode selector, not a large promotional CTA.

### 5.4 Chapter directory header

Target:

~~~text
知识目录                                  10 CHAPTERS
~~~

The count must derive from chapters.length.

No hard-coded chapter count.

Homepage domain filters are removed from the primary chapter header in the preferred design.

Rationale:
- 10 chapters do not require an additional filter layer;
- sidebar already groups the chapters;
- filtering competes with the sequence;
- the current positional filter implementation has already drifted from the registry.

If future chapter count makes filtering necessary, reintroduce it from group metadata, never manually indexed UI values.

## 6. Chapter visual grammar

Each row uses:

~~~text
01   中文主标题
     English canonical term
     short engineering description
                                             →
~~~

### 6.1 Bilingual title rule

Chinese mode:

~~~text
中文解释标题
English canonical term
~~~

English mode:

~~~text
English canonical term
中文解释标题
~~~

The secondary-language line is visually quieter.

The goal is consistency, not translation duplication.

### 6.2 Number column

Chapter number:
- fixed-width;
- tabular / monospaced numeral treatment is allowed;
- no badge/pill;
- no filled circle;
- no decorative gradient;
- may use muted domain accent through a rule or tiny marker, not a colored card.

### 6.3 Domain grouping

The chapter backbone remains grouped semantically:

~~~text
01      FOUNDATION

02–05   KNOWLEDGE / RETRIEVAL

06–08   AGENT RUNTIME

09      RELIABILITY

10      PLATFORM
~~~

This grouping must come from named group metadata rather than raw array indices where possible.

The visual accent is low saturation and structural:
- thin rule;
- compact label;
- section whitespace.

Do not turn groups into separate large card containers.

## 7. Navigation hierarchy

### Primary product model

~~~text
Chapters
→ canonical learning sequence

Search
→ direct lookup

Knowledge Map
→ system-wide conceptual orientation
~~~

### Sidebar

The sidebar remains the persistent chapter navigation.

Top group:
- Contents
- Saved chapters

Then chapter groups and chapters.

Knowledge Map should be promoted from a tiny footer-caption treatment into a clear navigation action, but remain visually below Chapters.

It should not become equal to every chapter row.

### Homepage

Do not repeat Saved as a homepage filter.

Do not add another tab bar.

Do not add a second chapter hierarchy unrelated to the sidebar.

## 8. Knowledge Map redesign

The full Knowledge Map route remains structurally intact unless rendering QA shows a local issue.

The homepage gets a compact preview that explains the five-level system:

~~~text
FOUNDATION
    ↓
KNOWLEDGE / RETRIEVAL
    ↓
AGENT RUNTIME
    ↓
RELIABILITY
    ↓
PLATFORM
~~~

The preview is not an interactive graph editor.

Each level can link to the relevant chapter group or full Map, but the primary action remains:

~~~text
Open Knowledge Map →
~~~

The preview must:
- use existing neutral surfaces;
- avoid extra shadows;
- use one-pixel rules;
- preserve dark/light theme;
- remain readable at 390px;
- not create horizontal scrolling.

## 9. Visual system

Preserve the current DESIGN.md direction:
- Geist / Geist Mono;
- neutral light / graphite dark surfaces;
- green only for interaction/identity;
- hairline borders;
- restrained radii;
- minimal shadow;
- no decorative gradients;
- no generic SaaS card wall.

The redesign should feel closer to:

~~~text
modern engineering textbook
× quiet technical docs
× disciplined product navigation
~~~

without copying another brand.

The main visible design assets become:
- 01–10 numbering;
- Search;
- chapter typography;
- system-map preview.

## 10. Interaction behavior

### Search

Preserve:
- Command/Ctrl-K;
- search dialog;
- search-index behavior;
- topic shortcut search;
- keyboard behavior.

### Saved chapters

Preserve:
- local storage;
- per-chapter bookmark controls;
- sidebar Saved view.

Remove only the redundant homepage Saved filter.

Legacy hash home/saved should continue to open the Saved view or redirect coherently; do not strand bookmarked URLs.

### Knowledge Map

Preserve #map.

Homepage entry and sidebar entry both point to #map.

### Chapters

All 10 chapters render exactly once in the all-chapters directory.

Chapter count is computed from registry data.

## 11. Data model

Avoid positional UI assumptions.

Preferred group metadata:

~~~ts
type ChapterGroup = {
  id: string;
  zh: string;
  en: string;
  chapterSlugs: string[];
  zhIntent: string;
  enIntent: string;
  role: "foundation" | "knowledge" | "agent" | "reliability" | "platform";
}
~~~

If the implementation retains ranges temporarily, no user-facing filter or label may depend on gi matching manually authored arrays.

Descriptions can remain parallel arrays only if tests guarantee exact chapter-count parity; a slug-keyed map is preferred for drift resistance.

## 12. Accessibility

Required:
- semantic heading order;
- all chapter rows keyboard reachable;
- Knowledge Map entry has descriptive text, not icon-only;
- Search retains explicit accessible name;
- bookmark buttons retain per-chapter labels;
- chapter numbering is not the only carrier of meaning;
- domain accent is not the only group indicator;
- minimum interactive target sizes remain 44px;
- no page-level horizontal overflow at 390px.

No full WCAG compliance claim is made from visual QA alone.

## 13. Responsive behavior

Principal widths:
- 390px
- 768px
- 1440px
- 1728px

### Desktop

At 1440px, the first viewport should show:
- Hero;
- Search;
- Map entry;
- Chapter directory heading;
- at least the beginning of Chapter 01.

### Mobile

At 390px:
- Hero collapses vertically;
- Search remains full width;
- Map entry becomes one clear row;
- chapter number remains aligned without causing title squeeze;
- chapter row does not use horizontal scrolling;
- secondary-language title can wrap normally;
- Knowledge Map preview stacks vertically.

## 14. Tests

Implementation must follow test-first behavior for code changes.

Required behavioral tests / checks:

1. Chapter count is derived from chapters.length and renders 10.
2. Chapters 01 through 10 each render once in the default directory.
3. Homepage does not expose a Saved content-filter control.
4. Sidebar still exposes Saved chapters.
5. Search remains a primary homepage action.
6. Knowledge Map has a primary homepage discovery entry.
7. Knowledge Map still resolves through #map.
8. Chapter rows render both primary and secondary-language title treatment.
9. Group labels / intents do not resolve to undefined for any chapter group.
10. Legacy #home/saved remains valid.
11. 390px rendered page has no page-level horizontal overflow.
12. Build and repository structural validation pass.

## 15. Visual QA

After implementation:
- render light/dark;
- Chinese/English;
- 390 / 768 / 1440 / 1728;
- inspect first viewport hierarchy;
- verify Search → dialog;
- verify Knowledge Map → route;
- verify Chapter 01 → reader;
- verify Saved remains accessible from sidebar;
- check console warnings/errors;
- capture desktop and mobile screenshots for PR evidence.

## 16. Files expected to change

Primary:
- preview/handbook-custom/src/main.tsx
- preview/handbook-custom/src/handbook.css
- DESIGN.md

Possible:
- a small homepage-specific component extracted from main.tsx;
- test / evidence scripts under preview/handbook-custom/evidence/;
- generated web/site output through the existing publish pipeline.

Avoid:
- chapter Markdown changes;
- technical diagram content changes;
- new runtime dependency;
- new UI framework.

## 17. Non-goals

This redesign does not:
- replace the existing sidebar with a new navigation framework;
- redesign chapter readers;
- rebrand the color palette;
- introduce decorative motion;
- remove bookmarks;
- merge Search and Knowledge Map into one control;
- turn Knowledge Map into the homepage itself;
- add personalization or recommendation logic.

## 18. Acceptance criteria

The redesign is accepted when a reader can infer, without explanation:

~~~text
Know the term?
→ Search

Need the whole system?
→ Knowledge Map

Want to learn the handbook?
→ 01–10
~~~

And the implementation has no manually drifted chapter count, category label, or positional navigation assumption in the homepage path.
