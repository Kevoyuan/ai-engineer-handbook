# Chapter 12 · FDE Customer Delivery & Engineering Craft
## From ambiguous customer problems to measurable deployed systems

> Canonical semantic owner for forward-deployed discovery, scope, thin-slice delivery, trade-offs, customer stakeholders, live demos and handoff. This is durable field engineering knowledge, not an interview-only script.

## 12.1 Why FDE is not “the person who knows the most frameworks”

Customer requests rarely arrive as a clean model benchmark. They begin with symptoms, organizational constraints, unclear incentives, existing systems, approval paths and a deadline. The technical problem and **the customer's acceptance condition** must be discovered together.

```text
ambiguous outcome
→ discovery & constraints
→ baseline + acceptance test
→ walking skeleton
→ evaluated thin slice
→ production rollout / safety controls
→ operational handoff + measured impact
```

FDE ownership joins three axes: **technical implementation**, **customer-facing decision process**, and **operability after you leave**. Do not optimize model accuracy before confirming that the proposed task would actually improve the customer's workflow.

## 12.2 Requirements discovery: ask questions that change the architecture

Use a structured but conversational discovery process.

| Lens | Question worth asking | Architectural consequence |
|---|---|---|
| User & workflow | Who does this now? At which step does it fail? | agent assist vs full automation |
| Outcome & baseline | What number changes, relative to what baseline? | measurable success / stop rule |
| Data & permissions | Where does the data live? Who can read which rows? | retrieval, RLS, private deployment |
| Freshness & scale | How late may an answer be? At what concurrency? | batch vs streaming, serving capacity |
| Error tolerance | What is worse: abstaining or being wrong? | confidence threshold and HITL |
| Integration | Which systems, schemas and approvals exist? | walking skeleton, deployment model |
| Decision owner | Who signs off acceptance and funds operations? | release gates and escalation |
| Failure & recovery | What should happen when a dependency is down? | rollback, degraded mode, support plan |

Keep an explicit **assumption log**: statement, evidence, uncertainty, owner, validation action and decision deadline. An assumption is not a requirement just because it appears in meeting notes.

## 12.3 Walking skeleton: reduce integration uncertainty early

A walking skeleton is the **smallest live end-to-end path** through *all critical architectural boundaries*. It may use a trivial dataset and poor initial ranking, but must prove that authentication, network path, ingestion, retrieval, tool execution, logging and rollback can function together.

```text
one real customer identity
→ one authorized data source
→ one realistic task
→ one deployed route
→ one visible trace
→ one acceptance assertion
```

Contrast:
- A polished notebook with a perfect answer but no customer permissions is **not** a deployed skeleton.
- One minimal, traceable slice end to end can expose an SSO/network/security blocker in week one rather than at launch.
- Only add a more complex Agent or Graph when the thin slice proves the need for stateful branching, recovery or human approvals.

## 12.4 Scope control: the thin slice and the non-goals list

Translate a broad request into a **two-sided scope**:

**In:** user persona, exact workflow, data source, authorized action, volume, business metric, test examples, operational owner.

**Out:** adjacent workflows, unavailable integrations, unrestricted tool actions, compliance certifications not in evidence, training a new foundation model without a demonstrated gap.

Build to a vertical slice such as “for one approved support team, explain one order-state discrepancy from two sources, with cited records and human review.” Version scope changes explicitly. Each new customer request must trade off time, risk or functionality rather than silently expanding the commitment.

## 12.5 Acceptance contracts: success is not “the demo worked”

Agree on outcome and technical gates *before* model tuning.

| Dimension | A usable acceptance measure | Anti-pattern |
|---|---|---|
| Business | minutes saved per verified case, resolution quality | number of tokens generated |
| Correctness | labeled cases / reviewed errors / supported citations | one attractive answer |
| Security | unauthorized-read and tool-permission test suite | model says it will not leak |
| Latency | end-to-end p50/p95 and timeout envelope | average LLM response alone |
| Cost | cost per successful, approved task | dollars per token alone |
| Operations | SLO, on-call, rollback time, trace completeness | “we can debug it later” |
| Adoption | real authorized-user task completion | demo attendance |

**Metrics must be cohort-aware**; a single aggregate can hide a tenant, locale, document type or workflow failure. An acceptance sample should include normal cases, boundary cases, missing data, injection attempts, and upstream failures.

## 12.6 Explain trade-offs to stakeholders without jargon

A trade-off explanation should have five parts:

1. **Decision:** the option recommended.
2. **Why now:** the specific customer constraint.
3. **Gain:** which user or operational metric improves.
4. **Cost/risk:** what becomes slower, harder or less capable.
5. **Proof/trigger:** what measurement would change the decision.

Example: “For invoice lookup, start with permission-filtered exact/BM25 retrieval rather than an autonomous multi-agent planner. It makes the path auditable and cheaper; it may miss paraphrases, which we will measure on a labeled query set. Add dense retrieval only if recall demands it.”

This is a situational architecture recommendation, **not** a rule that keyword search always beats semantic search.

## 12.7 Live demos: design for graceful degradation

A live customer demo should have a known-safe path and visible failure handling. Prepare:
- real but approved test identities and synthetic/redacted examples;
- a preflight for data freshness, auth, service health and known good query;
- an explicit fallback to a cached **clearly labeled** sample when live systems fail;
- a single named narrator and incident owner;
- a 60-second technical explanation of what was live, what failed and what is being fixed.

Never present replayed output as a successful live call. If the service fails, show the exact boundary, explain the impact, preserve logs, and offer a next decision. **Trust is recovered through transparency and an actionable recovery path**, not theatrical confidence.

## 12.8 Production handoff: “it works without the FDE”

Delivery isn't complete when the FDE leaves the customer call.

```text
Source contracts + data owner
Security + tenant access policy
Runbook + known degradation
SLIs, SLOs + dashboard
Versioned eval regression suite
Cost and capacity budget
Release and rollback procedure
Named on-call and escalation owner
```

Treat the **first incident with a different engineer operating the service** as a test of handoff quality. When a production failure yields a reusable regression case, record the case and repair the earliest failing stage (source quality, routing, tool call, evidence or output).

## 12.9 Worked interview/design case: municipal emergency dispatch

This is an **illustrative design exercise**, not a claim that an LLM should autonomously dispatch responders.

A municipality asks to reduce delayed emergency response. Start by asking for the baseline latency breakdown: call intake, triage, location/geocoding, dispatch queue, travel and reporting. Confirm geography, language, accessibility, legal and public-safety constraints, and what decisions require a trained human dispatcher.

An acceptable first slice might be **non-authoritative** call transcription, structured incident fields and a human-reviewed dashboard to reduce manual clerical delay. Use controlled data, audited source timestamps, no automated high-stakes dispatch authority, and explicit human override. If the data show that actual delay is travel time rather than intake time, an LLM-based intake assistant is likely the wrong investment.

Sequence:

```text
measure stage-level response time
→ find dominant bottleneck
→ propose smallest safe intervention
→ human review + audited integration
→ shadow-test on historical approved cases
→ observe p95, corrections, safety incidents
→ decide expand / stop / pivot
```

The credible answer is the discovery and safety reasoning, not “I would use RAG and LangGraph.”

## 12.10 Concept ownership across the FDE curriculum

The [FDEInterviews Concepts catalog](https://www.fdeinterviews.com/concepts) presents **167 concepts in ten tracks**. The Atlas maps the track **topics**, not the vendor's proprietary learning material, to long-lived technical owners:

| FDE original track | Atlas primary home |
|---|---|
| Foundations of LLMs & GenAI | CH01; serving-specific → CH10 |
| Retrieval & Agents | CH02–08; eval → CH09; Text-to-SQL → CH11 |
| Evaluation & ML Foundations | CH01 fundamentals; CH09 quality and eval |
| System Design for AI in Production | CH10 runtime; delivery / walking skeleton → CH12 |
| MLOps & Lifecycle | CH09 and CH10; feature correctness → CH11 |
| ML Infrastructure & Serving | CH10; distillation → CH01 |
| Data & SQL Engineering | CH11 |
| AI Security, Privacy & Governance | CH10; foundational privacy techniques → CH01 |
| Coding & Engineering Craft | CH01, CH02, CH08, CH10, CH11 |
| The Customer-Facing Craft | CH12 |

The exhaustive one-to-one owner index is in `handbook/references/fde-2026-concept-crosswalk.md`. A concept being assigned to a chapter is **not evidence it is fully covered**: further work must review canonical depth and implementation-specific facts.

### Sources and scope

- FDEInterviews: [Concepts curriculum](https://www.fdeinterviews.com/concepts), [Concept Map](https://www.fdeinterviews.com/map), accessed 2026-10-08. The source defines track/topic scope and highlights discovery, stakeholder communication and handling failed demos. All workflows, acceptance contracts and the municipal scenario here are handbook **engineering synthesis**; no paywalled course text is reproduced.
- Cross-chapter: CH08 owns tool runtime/orchestration, CH09 metrics/evals, CH10 deployment and security, CH11 customer data plane.
