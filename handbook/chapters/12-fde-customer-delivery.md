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


## 12.11 End-to-end capstone · Enterprise Order Investigation AI Copilot

> **Status and provenance · 2026-10-08.** This is an **original, synthetic teaching case**, not a real customer implementation, FDEInterviews' paywalled exercise, measured benchmark, or deployed enterprise application. References support *specific component claims*; architecture choices, diagrams, example data, budgets and acceptance thresholds are design proposals. A standard-library Python + SQLite walking-skeleton implementation is maintained at \`examples/fde-order-copilot/\`; it intentionally does **not** implement a Delta Lake service, a hosted LLM, production authentication, or a real payment API.

### 12.11.1 Customer problem, discovery and the decision not to start with multi-agent

**Customer says:** “Our support team spends too long figuring out why an order says DELIVERED before the carrier recorded HANDOFF. Give every agent an AI copilot that investigates and tells them what to do.”

Do not begin by selecting LangGraph, RAG, or a vector DB. First ask:

| Discovery axis | Concrete question | Decision changed |
|---|---|---|
| Business outcome | Time from ticket opening to **human-verified** resolution? What is the current baseline? | whether AI improves the actual bottleneck |
| System of record | Which of OMS, WMS and carrier feed owns each status? Are timestamps event time or ingestion time? | source precedence, ordering and uncertainty |
| Identity | Can an agent work only on assigned orders? Are orders shared across subsidiaries? | row-level policy, query identities, log redaction |
| Corrections | Are duplicate, late, reversed or deleted events expected? | CDC, dedup, versioning, reconciliation |
| Customer action | Explain only, create a draft, or issue a refund? Who approves? | tool scope, human-in-the-loop and write idempotency |
| Latency / freshness | How long after a carrier update is the investigation useful? | scheduled batch vs streaming CDC |
| Deployment | SaaS acceptable? Customer data restricted to customer-managed VPC? | BYOC/private network and vendor feasibility |

**Thin-slice contract (proposed, not customer-approved):** For an authenticated, authorized support user, investigate one known order across OMS + carrier timeline, return evidence-backed status and cited event IDs, **without modifying the order or issuing refunds**. One customer tenant, one task, one read-only deployment, one operational trace.

**Explicit non-goals:** autonomous refunds, unrestricted SQL, multi-agent self-delegation, model fine-tuning, all-carrier integration, real-time guarantees without a freshness SLO.

### 12.11.2 Four planes, seven boundaries: architecture before framework choice

\`\`\`text
                              CUSTOMER / WORKFLOW PLANE
     human agent → SSO / IAM → trusted user & tenant → review UI / approval
                                      │
                                      ▼
                                 CONTROL PLANE
             policy decision → tool allowlist → deadlines / budgets
                                      │
       ┌──────────────────────────────┴─────────────────────────┐
       ▼                                                        ▼
   DATA PLANE                                               EXECUTION PLANE
   OMS / carrier events                                     task router
       ↓ CDC + checkpoints                                    ├─ exact order lookup
   Bronze: raw + immutable provenance                          ├─ tenant-scoped SQL
       ↓ schema / dedup / delete / replay                       └─ optional document RAG
   Silver: versioned event timeline                                   ↓
       ↓ business contract                                   evidence sufficiency check
   Gold: authorized order state                               ↓ if missing → abstain
       ↓ governed tenant read                                grounded explanation
   (optional) document index                                 ↓ draft / human review
                                      │
                                      ▼
                            EVIDENCE & OPERATIONS PLANE
                trace IDs + source versions + golden eval + SLO
                canary / rollback + incident runbook + cost/success
\`\`\`

No **identity**, **authoritative order state**, or **write permission** may originate from prompt text. Customer-facing final explanations must separate **observed facts** (event IDs/timestamps), **inference** (the anomaly), and **recommendation** (investigate upstream ordering). An event timestamp alone does not prove physical delivery chronology; clock skew and source semantics may produce apparent anomalies.

| Layer | Owns | Failure / gate | Handbook owner |
|---|---|---|---|
| Discovery & acceptance | baseline, non-goals, human owner | wrong problem → stop project | CH12 |
| CDC / Lakehouse | raw provenance, dedup, tombstones, replay | missing / duplicated / reordered events | CH11 |
| Authorized retrieval | exact order lookup, optional BM25/semantic docs | cross-tenant / ungrounded evidence | CH02–05 |
| Agent host | branch and tool execution, HITL | unsafe write / infinite retry | CH06, CH08 |
| Evaluation | golden timelines, safety regression | no evidence or unacceptable slice regression | CH09 |
| Serving & security | SSO, RLS, resilience, isolation | tenant leak, latency, queue saturation | CH10 |

### 12.11.3 Data contract and state reconciliation

**Illustrative event schema**:

\`\`\`json
{
  "tenant_id": "tenant-a",
  "source": "carrier",
  "source_event_id": "c-102",
  "order_id": "42",
  "source_version": 2,
  "event_type": "DELIVERED",
  "event_time_utc": "2026-10-07T10:20:00Z",
  "ingested_at_utc": "2026-10-07T10:35:00Z"
}
\`\`\`

For this teaching case, the unique deduplication key is **(tenant_id, source, source_event_id)**. Conflicting payloads under the same event ID must be quarantined, not silently overwritten. \`source_version\` is comparable **within its declared source/order stream**, not necessarily across different vendors. Event-time order and ingestion order are different. The source-of-truth decision is a separate business contract.

Bronze keeps raw source and offsets. Silver enforces schema and idempotent upserts of source events, preserving late events and tombstones. Gold exposes a consistent **point-in-time, permission-scoped** view of the order and its causal evidence. **Delta CDF only records changes after it is enabled and has finite retention; it is not automatically a permanent audit log.** Archive material if long-term replay is contractual.

**Do not** compute status by a global \`MAX(event_time)\` if one carrier's clock is unreliable. If a delivered event appears at 10:20 and a handoff event at 10:30, the system should say “recorded order appears inconsistent,” not declare that delivery physically happened before handoff. If either event is missing, use \`INSUFFICIENT_EVIDENCE\`, not a fabricated chronology.

### 12.11.4 Retrieval and authorization route

\`\`\`text
customer asks "Why was order 42 delivered before handoff?"
 → detect exact order ID / structured workflow
 → trusted policy: tenant, user, allowed order assignments
 → read-only parameterized SQL / governed semantic view
 → optional document retrieval only for carrier SLA/policy explanations
 → validate source freshness, timestamp semantics and evidence IDs
 → grounded answer / abstain
\`\`\`

**Why not vector-search everything?** An order ID requires exact, deterministic lookup. Embedding similarity cannot enforce unique order identity or permission. Dense/hybrid retrieval can help find **text policies** after identity-scoped SQL established the concrete order facts. Azure AI Search documents permission filtering and native ACL features (some are preview), but a string security filter is not authentication. Databricks Unity Catalog supports row filters, column masks and ABAC for governed query-time access. Application checks and storage enforcement should not be confused.

A proposed OpenAI/LLM tool request such as \`{"tenant_id":"other", "order_id":"42"}\` must **not** override the authenticated principal. Every tool call receives a trusted scope from the host; deny when order assignment is missing. Partition caches, retrieval context and traces by policy/tenant boundary.

### 12.11.5 Agent vs workflow: minimum necessary control flow

Start with a **deterministic workflow**:
1. Normalize the customer task and extract exact order identifier (validated).
2. Authorize the user and relevant order **before retrieval**.
3. Call read-only timeline service; validate source evidence and freshness.
4. Classify: \`ANOMALY\` / \`CONSISTENT\` / \`INSUFFICIENT_EVIDENCE\`. Return observed evidence IDs.
5. Optionally ask an LLM to **explain** the evidence in approved wording; pass validated, bounded facts only.
6. If the customer requests an action, create a **draft** and obtain explicit human approval. The host—not the model—authorizes and executes any write.

The example code does not call an LLM. This is deliberate: anomaly detection based on two typed events is deterministic and more testable than asking a model to improvise. A multi-agent graph would add state and coordination without an established gain. Add a durable workflow/checkpointer if work crosses approvals or long-running retries. A write timeout produces **unknown outcome**; consult operation status or retry only with a documented stable idempotency contract (CH10).

### 12.11.6 A runnable walking skeleton: SQLite, not simulated “production Delta”

The repository contains a **real executable** Python 3 standard-library fixture:

\`\`\`bash
cd examples/fde-order-copilot
python3 -m unittest discover -s tests -v
python3 copilot.py
\`\`\`

The example creates in-memory SQLite data for **two tenants that reuse the same order ID**; inserts out-of-order and duplicate events; uses a trusted actor scope (a test representation, **not an SSO implementation**) and parameterized SQL; applies read-only order scope; classifies a time-order anomaly with explicit evidence IDs and no LLM. Tests cover normal, anomaly, insufficient evidence, duplicates/conflicts, denied cross-tenant/assignment lookup and no unauthorized audit evidence. It is a *walking-skeleton logic exercise*, not a running cloud deployment or proof of data security. The test harness intentionally excludes external services, so it can be run without credentials.

A production port would replace SQLite with a governed warehouse and tested identity provider, replace in-memory events with persisted CDC/Delta tables, attach a real index/document fetcher only when needed, and add traces/eval dashboards. **Do not promote demo assertions to real-service SLAs.**

### 12.11.7 Failure matrix: fix the earliest wrong decision

| Injected fault | Expected system behavior | Validation and repair |
|---|---|---|
| Carrier event arrives late | event-time timeline correct; ingest lag reported | replay out-of-order fixture, p95 source-to-query lag |
| Duplicate or conflicting event ID | identical retry no-op; conflicting content rejected/quarantined | idempotency and conflict regression |
| User asks for another tenant's ID | return denied, no tool prompt/cache exposure | negative tenant and cache replay suite |
| Handoff evidence is absent | \`INSUFFICIENT_EVIDENCE\`; no chronology claim | refusal confusion matrix |
| Source ACL revoked after indexing | refuse at read/fetch if policy stale | revoke-between-search-and-fetch test |
| Warehouse / carrier unavailable | no fabricated answer; bounded timeout and graceful fallback | dependency-fault scenario, error budget |
| LLM writes “refund approved” | text has no authority; host write gate denies | forbidden-tool-action eval |
| Tool write times out (later phase) | unknown status; same idempotency key or reconcile | duplicate-effect negative tests |
| High concurrent retries | bounded queue, backoff+jitter, circuit breaker / shedding | load and recovery test |

### 12.11.8 Acceptance and cost model: numbers are targets to negotiate

Define a **reviewed** case as successful only if it is authorized, grounded, correct by adjudicated business rules, and accepted by an eligible human. Denominator must include errors, timeouts and refusals as separately tagged outcomes.

\`\`\`text
task_success_rate = accepted_correct_tasks / all_eligible_tasks
cost_per_successful_task = all_attributed_run_cost / accepted_correct_tasks
source_freshness_lag = query_visible_time - source_commit_time
\`\`\`

| Gate | How to measure | Release decision |
|---|---|---|
| Permission and row isolation | every attempted cross-tenant/assignment negative case | any observed leak blocks |
| Evidence completeness | gold event IDs vs retrieved IDs by risk slice | missing mandatory records → refuse |
| Anomaly / abstention accuracy | sealed labeled cases; business adjudication | threshold must be customer-agreed |
| Source freshness | per-source ingest-to-query lag distribution | stale state labeled or blocks high-risk action |
| Latency | p50/p95/p99 **end to end** including SQL and review | compare to workflow objective |
| Reliability | timeout, queue depth, retries and degraded-mode rate | staged canary/rollback |
| Business benefit | median reviewed investigation minutes vs comparable baseline | stop if no operational improvement |
| Economics | cost per approved successful investigation | compare with manual effort and alternatives |

**Illustrative budget exercise (not measured):** suppose a human-only case averages 12 minutes and a copilot-assisted case is hypothesized to need 5 minutes including review. The **arithmetic saving would be 7 minutes** *if measured on comparable task cohorts*. The system is **not** validated merely because those assumptions were written down; a fair pilot must record the actual distribution and regression/safety incidents.

### 12.11.9 Deployment choice: SaaS, BYOC or private/VPC

| Decision | Start with | Switch when |
|---|---|---|
| Deployment | customer-acceptable managed SaaS for fastest pilot | residency, network, contractual constraints require BYOC/VPC/on-prem |
| Storage/read access | governed row/column controls, trusted service identity | customer-managed keys or local-only access required |
| Workflow execution | one host-controlled workflow | durable state / human approval / independent execution stages justify graph |
| Retrieval | exact/SQL order facts | text-heavy policies require ACL-aware lexical/dense retrieval |
| Model | no LLM for anomaly classification; optional explanation only | measured semantic ambiguity warrants model path |
| CDC cadence | lowest-complexity batch that meets agreed freshness | proven lag requires streaming and checkpointed replay |

The architecture must preserve auditability, security boundaries, rollback and customer ownership regardless of deployment venue. Provider portability is not free: authentication, network egress, policy distribution and observability must each be revalidated after switching.

### 12.11.10 Customer handoff and five-minute FDE answer

**Handoff artifact checklist:** scope and non-goals; source/tenant contracts; event identity and replay policy; runbook for delayed carrier feed; IAM/row policy matrix; golden cases and risk slices; trace schema and redaction; SLO/incident owner; cost budget; version + rollback; consent-approved demo identity; stakeholder sign-off.

**Interview summary:** “I would first quantify where support investigation time is spent and verify which source system is authoritative. For the first thin slice, I would deliver an authorized read-only investigation of one order, using CDC/Lakehouse for traceable events and SQL exact lookup for structured IDs. I would compute the chronology deterministically and only use an LLM, if necessary, to explain vetted evidence. I would measure correctness, permission leakage, freshness, p95 latency and time saved against a baseline, with a human-reviewed acceptance gate. I would not add multi-agent autonomy or refund tools until we prove the workflow needs them. Then I would deploy to the customer-approved security boundary and hand over an eval suite, runbook and rollback plan.”

**Source-verification boundaries (first-party, checked 2026-10-08):**
- [Delta Lake CDF](https://docs.delta.io/delta-change-data-feed/) — opt-in, captures changes only after enablement, change data subject to retention.
- [Delta streaming reads/writes](https://docs.delta.io/delta-streaming/) — checkpoint and \`txnAppId + txnVersion\` options for idempotent writer behavior, with restart caveats.
- [Apache Spark Structured Streaming](https://spark.apache.org/docs/4.0.3/streaming/apis-on-dataframes-and-datasets.html) — late data/watermarks with operator-specific limits.
- [Databricks Unity Catalog row filters and masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks) — query-time row filtering, column masking and ABAC trade-offs.
- [Azure AI Search document-level access](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) — trusted identity vs string filters; native ACL/RBAC preview/version limits.
- [AWS Well-Architected retries](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html) and [bounded backoff](https://docs.aws.amazon.com/wellarchitected/2023-04-10/framework/rel_mitigate_interaction_failure_limit_retries.html) — idempotent writes and limited retry amplification.

This section is the **canonical system-level case owner**. Refer to CH11 for CDC/Spark/SQL detail, CH02–05 for authorized retrieval/grounding, CH08 for workflow orchestration, CH09 for evaluation and CH10 for runtime identity/serving. The presentation fragment in \`web/assets/ch12-order-investigation-capstone.html\` is **derived content**.

## 12.12 FDE Curriculum Coverage Audit: topic signals are not readiness scores

The source curriculum lists **167 concepts in ten original FDE tracks**. The [single-owner concept crosswalk](../references/fde-2026-concept-crosswalk.md) maps each item to CH01–12. The [per-concept evidence audit](../references/fde-2026-coverage-audit.md) examines **each assigned canonical chapter**, including this branch's new CH10 §10.26 and CH11 §11.10, to locate direct terminology/alias evidence:

| Source-text audit grade | 2026-10-08 branch baseline | What it actually means |
|---|---:|---|
| H — owning chapter section heading | 136 | An explicit concept-specific name or reviewed alias occurs in a heading. **Not** a proof of deep coverage. |
| B — owning chapter body | 31 | A concept name or reviewed alias is mentioned without a corresponding heading. Review for depth. |
| N — no direct owner-chapter term signal | 0 | No reviewed English/alias term was found in that chapter. Could be a true content gap **or** Chinese/equivalent wording; manually check before calling it missing. |

**This is a reproducible evidence-location scan, not a scored interview exam and not a verified 167-topic textbook.** Unlike a naive keyword-count completion chart, this audit does not label any concept “fully covered”. The next semantic audit should independently check whether each topic has:

1. A correct causal/mechanistic answer grounded in the owning chapter.
2. A concrete system/SQL/agent or business example with conditions.
3. A design alternative and its trade-off.
4. A failure injection / negative test / counterexample.
5. An observable metric or acceptance criterion.
6. A primary-source reference when implementation/version detail matters.

**Editorial priority:** P0 production architecture (CH10 §10.26), data engineering (CH11 §11.10), customer discovery and handoff (CH12 §12.11), authorization (CH02), and eval gates (CH09). Fill true technical gaps instead of creating duplicate “interview” chapters. The [Q10–Q23 research ledger](../references/fde-2026-answers-02-04-provenance.md) documents primary-source checks and unexecuted limitations; earlier [Q1–Q9 ledger](../references/fde-2026-verified-answer-ledger.md) remains separate.

**Release boundary:** this phase is pushed to a feature branch for review. The source, bilingual Reader fragment, report and local build artifacts do not imply Vercel production has been deployed. No production release should occur without an explicit later request.

## 12.13 Interview readiness vs evidence discoverability · Stages 05–06

On the 2026-10-08 review branch, we added **independently researched Q24–Q39** across CH01/08/09/11, with an executable stdlib mini-lab. These cover ML optimization, leakage, calibrated prediction, rare-class metrics, synthetic evaluation, CSV input integrity, sliding windows, heap-based Top-K, DAG dependency validation and negative tool-authorization tests. See the [Q24–Q39 provenance ledger](../references/fde-2026-answers-05-06-provenance.md).

**Audit updated:** 136 heading signals, 31 body signals, zero remaining direct-name gaps out of 167. This is *not* a claim that 130 topics are completely taught. Some were already correctly explained using different terminology; the new sections add concrete counterexamples and first-party references, but no customer deployment or proprietary question-answer key was accessed.

A strong FDE candidate still needs to solve an unseen problem under constraints: choose a safe data path, explain the failure mode, implement or sketch working code, and defend the metric and security boundary. A growing keyword index is not a substitute for those capabilities.

The changes are retained on a **GitHub Draft PR only**. Do not infer Vercel publication from generated Reader content or a passing offline build.

## 12.14 Stage 07: 37 previously unlocated concepts independently reviewed

The 2026-10-08 branch previously had **37 N-class lexical/no-direct-title signals**. Manual owner-chapter review showed **four existing-but-mismatched naming cases** (Prompt Engineering, Tool/Function Calling, Context Window Management, Numerical Stability); the other 33 have now received domain-specific explanations and design/negative-test boundaries across CH01/02/03/06/07/10/11. Original technical questions **Q40–Q64** and first-party provenance are indexed in [the Stage-07 source ledger](../references/fde-2026-answers-07-provenance.md).

The 167-row audit now reports **H136 / B31 / N0**, which means all 167 topic names or reviewed equivalent aliases are **locatable in their owning chapter**, not that every topic is complete, verified, production-implemented, or mastered. Several H rows share one topical heading and require their own future depth review. In particular, the Palantir Gotham content here is limited to grounded platform distinctions, not an exhaustive product entitlement audit.

Verification assets: the [stdlib mini-lab](../../examples/fde-interview-engineering/) now adds negative tests for index/encoder version mismatch, ACL revocation, fair per-tenant token bucket and bitemporal feature training lookups. These tests simulate invariants; real identity verification, distributed concurrency, embedding quality, privacy compliance, EU legal interpretation and customer performance remain untested.

**Release boundary:** Changes remain on Draft PR #70 only. Do not merge main, build web/site production assets or deploy/promote Vercel without explicit later user instructions.


## 12.15 FDE Interview Readiness Audit: 36 prioritized concepts, six evidence dimensions

> **Review scope · 2026-10-08.** The FDE 167-concept index is only a **topic-location crosswalk**; it does not measure explanation depth or candidate ability. The [core-36 editorial readiness matrix](../references/fde-2026-readiness-core36.md) is an independent **manual, provisional review of this Handbook's canonical chapter teaching evidence**, not a ranking of candidates or an FDEInterviews official answer key. The machine-checkable review input is [core36.json](../references/fde-2026-readiness-core36.json). Sources from the canonical chapters are evaluated as documented evidence, not newly tested current deployments.

### Six-dimensional evidence rubric

| Dimension | 0 | 1 | 2 (inspectable teaching evidence, not real production proof) |
|---|---|---|---|
| M · Mechanism | absent causal mechanism | named/outlined mechanism | conditions and stepwise behavior explained |
| E · Worked Example | no scoped task | illustration only | typed example, code or reproducible fixture |
| T · Trade-off | no alternative | names alternative | decision boundary and downside explicit |
| F · Failure Test | no negative case | risk mentioned | fault injection with expected safe result |
| G · Acceptance Gate | no quantified criterion | metric named | explicit denominator, guardrail or reproducible test protocol |
| P · Primary Evidence | no applicable primary evidence | general/indirect chapter-level source | direct first-party API/spec or original research on the relevant behavior |

For each of **36 deliberately selected FDE core concepts** (3 Model, 6 Retrieval, 5 Agent, 6 Evaluation, 7 Production, 6 Data, 3 Delivery), the audit records the **exact assigned canonical owner**, a heading and repository line pointer, the six provisional grades, the *specific weak aspect*, a realistic interview follow-up, and pass criteria. **Thirty-six of 167 were qualitatively assessed; the other 131 were not scored.**

### Findings: the bottleneck is acceptance evidence

The audit's descriptive dimension counts are:

| Dimension | Concrete evidence = 2 | Partial = 1 | Absent = 0 |
|---|---:|---:|---:|
| Mechanism | 33 | 3 | 0 |
| Worked example | 18 | 18 | 0 |
| Trade-off | 36 | 0 | 0 |
| Failure test | 15 | 21 | 0 |
| Acceptance criterion | **5** | **31** | 0 |
| Primary evidence | 14 | 18 | 4 |

These are **subjective repository-content evidence assessments** with explicitly defined grades—not test results, official course scores or evidence that these subjects are interview-ready. A source citation is not a production integration test. The practical priority is to strengthen G/F/P with reproducible, risk-sensitive acceptance cases rather than add generic definitions.

### Four oral mock rounds grounded in the order-investigation capstone

1. **Authorized RAG revoked between vector retrieval and paragraph fetch:** same order ID in tenant A and B; require trusted scope, zero unauthorized context/cache/log access, separate freshness and revocation-denial SLIs.
2. **Out-of-order CDC and bitemporal feature leakage:** duplicated/corrected/tombstone events and a feature arriving after decision time; require source sequence, consistent snapshot boundary, history replay, source reconciliation and feature effective/available time.
3. **Refund timeout + retry storm:** unknown result after possible commit, carrier dependency 503; require explicit human approval, durable operation ID, receipt reconciliation, retry budgets, circuit breaker and bounded queue.
4. **Pilot quality regresses and live customer demo fails:** pilot versus production cohort mismatch, security slice worsens, live 503; require stratified sealed gold dataset, risk-blocking eval gate, truthful fallback, canary/rollback and incident handoff.

**Exercises are interview designs, not reported customer incidents.** See [complete rehearsal prompts and source-linked matrix](../references/fde-2026-readiness-core36.md), as well as runnable local tests in [examples/fde-interview-engineering](../../examples/fde-interview-engineering/) and the [order investigation walking skeleton](../../examples/fde-order-copilot/). The local tests support narrower programming contracts and do **not** validate deployed identity, cloud VPC networking, vector ACLs, payment gateway idempotency or Databricks integration.

### Handoff: turn a green documentation signal into a testable answer

For each gap, an FDE candidate should be able to answer without simply quoting the Handbook:

```text
business outcome + source of truth + authorized identity
  → chosen architecture and a rejected alternative
  → failure injection with expected safe behavior
  → measurable gate / denominator / rollback trigger
  → primary docs and explicitly unverified assumptions
```

The bilingual DESIGN-aligned presentation fragment is `web/assets/ch12-fde-interview-readiness.html`, registered as `fde-readiness-audit-08`. This phase remains on **Draft PR #70 only**, with no `main` merge, production `web/site` regeneration, or Vercel release.
