# V3.5 Graph-first duplication audit

Scope: `preview/handbook-custom/src/` Reader/Lab content on the source branch; anchored to `DESIGN.md`. This audit distinguishes **duplicated top-level mental models** from **useful complementary details**. It does not remove source-authored markdown, diagrams or cross-links and is not a production publish decision.

| Chapter | Primary model | Secondary visual/control observed | Decision | Reason |
|---|---|---|---|---|
| CH01 Context | Context allocator node/edge graph | Scenario/explanatory copy | Keep | Describes allocation constraints, no second competing topology. |
| CH02 Authorization | Candidate ACL → retrieval → fetch recheck graph | Scenario labels and notes | Keep | Permission proof gates are part of the same model. |
| CH03 Routing | Source-scoped 5-route fan-out graph | Four large step-selector nodes + detailed DecisionTrace | **Fold** four-card selector into `concept-step-inspector`; keep DecisionTrace in `trace-inspection` | Still supports seek/autoplay and reading step evidence, but no duplicate main stage diagram. |
| CH04 Evidence | Six Gates and policy branches | Four large step-selector nodes + detailed EvidenceTrace | **Fold** direct-stage selector; preserve detailed claims and original G0–G5 table behind native disclosure | The full Gate graph takes precedence; claim verification is not silently discarded. |
| CH05 PDF RAG | Version/page → structure → evidence element → claim → citation graph | Chapter source examples | Keep | Source tables, OCR ambiguity and citation examples provide evidence to inspect. |
| CH06 Skills | Skill Registry → trusted policy gate → SKILL.md → Host Tool graph | SkillSimulator terminal + optional Archify full-map link in its existing details | **Keep as distinct layers** | The graph teaches trust boundaries, terminal shows simulated steps, optional Archify is a zoomable reference; does not falsely simulate live tool calls. |
| CH07 Memory | Governed write/read and correction-loop graph | Archify memory poster + full linked external map | Keep | This high-fidelity map is a distinct zoom/navigation experience and the original link remains valuable; not an automatic duplicate removal. |
| CH08 Agent | Bounded Plan → Act → Observe → Check graph with retry | Four-card stage selector, detailed DecisionTrace loop | **Fold** four-card seek navigation, retain detailed frame inspection | Ensures one dominant topology while keeping second-round direct step seeking. |
| CH09 Reliability | Trace spans → curated regression → release gate | Source/incident details | Keep | Validates failures, not just visual state. |
| CH10 Serving | Cache-key gate → prefix reuse vs isolated prefill graph | Token-by-token before/after comparison | Keep under `v2-graph-details` | Token matching demonstrates why two requests share only exact prefix; primary graph explains permission isolation. |
| CH11 Data | CDC source/arrival/version history mapping graph | Bronze/Silver/Gold data contract Lab | Keep | Temporal identity and data materialization address different questions. |
| CH12 FDE Architecture | Five-plane graph with B4/B6 gates | Seven explicit trust-boundary checks | Keep | Seven checks are review criteria, not a redundant second diagram. |

## V3.5 layout correction

Prior CH03 compact Reader screenshot had an authored SVG stage of 1140px. New layout uses 925px, keeping the same five routes, two selected branches, authorization gate, candidate fusion and evidence verification. The outer edge corridors were re-authored together with the compressed Y coordinates; no decorative connections or invented runtime performance claims were added. CH04 / CH06 / CH10 graph tails were trimmed modestly without changing their decision semantics.

## Non-negotiable verification

- All five updated graph chapters must pass 390/768/1440/1728px × zh/en × light/dark edge-state and node-placement checks.
- The original CH03/CH04/CH08 four-step seek controls must remain operable after opening the native details, including CH08 round-two `Observe` seeking; select/next/previous/autoplay remain unchanged.
- Legacy ConceptDiagram and DecisionTrace browser tests run in CI along with the 12-chapter Graph test suite.
- Component-scoped axe, overflow and screenshot reviews help catch regressions; not a claim of whole-site accessibility certification.
- Work stays in draft PR #75, Vercel Git deployment disabled; `publish:web` and `web/site` are excluded.
