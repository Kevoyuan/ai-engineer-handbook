# FDE Interview Readiness Audit · 36 core interview topics

> **Editorial evidence review · 2026-10-08 · Draft PR #70 only.** This is a **manual, provisional evaluation of existing handbook teaching evidence**, **not a score of the user**, a hiring predictor, verification that a service was deployed, or access to paid FDEInterviews answer keys. Concepts and canonical chapter owners come from the [167-topic public crosswalk](./fde-2026-concept-crosswalk.md). Every row links to an actual owner heading; some sections cover multiple concepts, and a headline is not proof of teaching depth.

## Why 36, not 167?

Prioritize issues a forward-deployed engineer must defend on the whiteboard: authorized enterprise retrieval, agent/tool state, evaluation and regression gates, data correctness, platform choices and customer delivery. Thirty-six is a **curated core sample**, not an exhaustive statistical sample or a ranking of what the FDEInterviews site will ask.

## Six-factor rubric (M E T F G P)

| Dimension | 0 · absent in selected owner evidence | 1 · discussed but incomplete | 2 · concrete/inspectable teaching evidence |
|---|---|---|---|
| M · Mechanism | causal account absent | definition/basic explanation | stepwise mechanism and relevant conditions |
| E · Worked example | no applicable scenario | illustration only | scoped data, pseudocode or executable reference |
| T · Trade-off | no alternative | names another option | explains decision boundary and its cost |
| F · Failure test | no fault/negative case | named risk | explicit fault with expected safe outcome/test |
| G · Acceptance gate | no measurable criterion | metric named | target/denominator/gate/test method specified |
| P · Primary evidence | no direct primary evidence near topic | chapter-level/general source | directly relevant first-party API/spec or original research source |

**A 2 is still not 'proven in production'.** It means this repository has concrete, inspectable guidance (or a reproducible local fixture) for a defined teaching condition. No score claims a real customer identity, Databricks endpoint, cloud index, performance SLO or payment provider was tested. `P` scores indicate reference presence/relevance, not a new live URL verification at audit time. All six dimensions carry equal descriptive weight; **do not use the sum alone to certify readiness**.

## Dimension audit distribution

| Dimension | 0 absent | 1 partial | 2 concrete |
|---|---:|---:|---:|
| M 机制 | 0 | 3 | 33 |
| E 案例 | 0 | 18 | 18 |
| T 取舍 | 0 | 0 | 36 |
| F 失败负例 | 0 | 21 | 15 |
| G 验收 | 0 | 31 | 5 |
| P 一手证据 | 4 | 18 | 14 |

## Priority repairs to improve mock-interview readiness

1. **R20 · SLOs, SLIs and Error Budgets (CH09, 6/12)** — CH09 是 canonical owner，但计算例主要在 CH10；先补 CH09 内部 SLO 的分母、时间窗与 security blocker。
2. **R06 · Reranking and Two-Stage Retrieval (CH03, 6/12)** — Rerank 不是召回；需要固定一阶段候选做召回上限与重排增益实验。
3. **R03 · Model Routing and Cascades (CH01, 6/12)** — 路由 Cascade 需要漏升级成本、上限与反馈闭环的定量决策，不能只画一条路由线。
4. **R36 · Recovering a Failing Live Demo (CH12, 7/12)** — Live demo 的应急脚本和客户透明告知应演练；不能把标记样例伪装为实时结果。
5. **R26 · AI Cost and Unit Economics (CH10, 8/12)** — 单位成本要包含全部 retry/tool/infra/人工复核；补有对照组的实际核算表。
6. **R22 · Circuit Breakers and Backpressure (CH10, 10/12)** — Breaker 需要假故障负载试验和恢复条件，不能只凭“设了重试”判断稳健。
7. **R23 · Idempotency (CH10, 10/12)** — 支付工具的未知结果需要网关 receipt/status 级真实对账，不是 SQLite 测试通过就能放款。
8. **R31 · Text-to-SQL (CH11, 10/12)** — SQL 执行身份需要 UC 行策略真机集成测试；模型或 Prompt 过滤不是边界。
9. **R21 · VPC and Air-Gapped Deployment (CH10, 11/12)** — 客户 BYOC/VPC 承诺前必须实测包括遥测、模型、备份在内的每条 Egress。
10. **R15 · Golden Datasets and Eval Sets (CH09, 10/12)** — Golden 数据需要真实专家一致性/分层争议裁决；示例不能用自己生成的答案验证自己。
11. **R35 · The Walking Skeleton (Thin Slice First) (CH12, 11/12)** — 本地 SQLite fixture 有教育价值，但部署门禁仍缺真实 SSO、授权仓库及回滚演练。
12. **R32 · Feature Stores (CH11, 11/12)** — Feature Store 双时态本地示例通过不代表 Databricks 在线/离线一致；需真实 Workspace 验证。

## 36 line-grounded interview audit rows

Notation: six digits in the order M / E / T / F / G / P; 0/1/2 rubric above. All snapshots point to the **current feature branch**. Source lines are review aids, not permanent anchors after future edits.

### Model & API (3)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R01 · Structured Output and Schema Validation | [CH01 L983](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/01-model-api-context-foundations.md#L983) | `2 1 2 1 1 1` | 8/12 | Schema 合法与业务真值被混同；缺反例测例及拒判门禁。 |
| R02 · Fine-tuning vs RAG vs Prompting | [CH01 L753](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/01-model-api-context-foundations.md#L753) | `2 1 2 1 1 1` | 8/12 | 有机制比较，缺可执行的逐组成本/成功任务验收。 |
| R03 · Model Routing and Cascades | [CH01 L1217](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/01-model-api-context-foundations.md#L1217) | `1 1 2 1 1 0` | 6/12 | Routing Cascade 没有独立决策阈值与人工标注样本。 |

### Retrieval & RAG (6)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R04 · Permission-Aware RAG | [CH02 L101](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/02-enterprise-retrieval.md#L101) | `2 2 2 2 2 2` | 12/12 | 已有权限边界与负例方案；仍需要真实资源身份集成验证。 |
| R05 · Hybrid Search (Lexical + Vector) | [CH03 L8](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/03-hybrid-retrieval-query-routing.md#L8) | `2 1 2 1 1 1` | 8/12 | 召回融合流程完善，仍需 ID/政策查询分层的实测消融。 |
| R06 · Reranking and Two-Stage Retrieval | [CH03 L8](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/03-hybrid-retrieval-query-routing.md#L8) | `1 1 2 1 1 0` | 6/12 | Rerank 介绍分散，缺候选无法召回时的失败回归和来源验证。 |
| R07 · Query Rewriting, Expansion and HyDE | [CH03 L422](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/03-hybrid-retrieval-query-routing.md#L422) | `2 1 2 1 1 2` | 9/12 | 有具体反例与论文来源；缺可执行的 protected-slot 断言。 |
| R08 · Embedding Versions and Drift | [CH02 L187](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/02-enterprise-retrieval.md#L187) | `2 1 2 2 2 2` | 11/12 | 已有版本契约与本地负例；未验证真实向量索引的迁移收益。 |
| R09 · Index Freshness and Staleness Windows | [CH02 L208](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/02-enterprise-retrieval.md#L208) | `2 1 2 2 1 2` | 10/12 | 索引可见性与权限 SLI 已分离；尚无真实端到端时钟与缓存压测。 |

### Agent & Context (5)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R10 · MCP (Model Context Protocol) | [CH06 L117](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/06-skills-routing.md#L117) | `2 1 2 1 1 1` | 8/12 | 组件边界清楚；缺具体 JSON tool schema 到资源级授权的完整实验。 |
| R11 · Tool / Function Calling | [CH06 L553](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/06-skills-routing.md#L553) | `2 2 2 2 1 1` | 10/12 | 有 Host 模式与隔离设计，缺一次完整真实服务响应验证。 |
| R12 · Agent vs Workflow vs a Single Call | [CH08 L2](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/08-agent-orchestration.md#L2) | `2 2 2 1 1 1` | 9/12 | 多种控制结构论述充分；缺同一任务的消融式接受试验。 |
| R13 · Bounded Autonomy and Human-in-the-Loop | [CH08 L2608](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/08-agent-orchestration.md#L2608) | `2 1 2 2 1 1` | 9/12 | 循环上限与审批存在；端到端支付批准/取消语义未集成验证。 |
| R14 · Agent Memory | [CH07 L8](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/07-memory-context-engineering.md#L8) | `2 1 2 1 1 1` | 8/12 | 治理层明确；长期记忆污染/撤权的可运行回归较少。 |

### Evaluation & Release (6)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R15 · Golden Datasets and Eval Sets | [CH09 L1560](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L1560) | `2 2 2 1 1 2` | 10/12 | 可分层抽样与 Holdout；未有跨客户标注一致率实测。 |
| R16 · Agentic Evals: Grading the Trajectory, Not the Answer | [CH09 L1568](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L1568) | `2 2 2 2 1 2` | 11/12 | 轨迹风险解释充分；需真实 Tool Trace 驱动的回归。 |
| R17 · LLM-as-a-Judge | [CH09 L256](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L256) | `2 1 2 1 1 2` | 9/12 | 列出 Judge Bias，但缺真实人工标注校准误差分布。 |
| R18 · Calibration and Uncertainty | [CH09 L1648](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L1648) | `2 1 2 1 1 2` | 9/12 | 概率概念有来源；缺真实分桶 Calibration 曲线实验。 |
| R19 · Eval Regression Suites and CI Gates | [CH09 L1591](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L1591) | `2 1 2 2 2 2` | 11/12 | 已有 Release Gate 表；阈值需由客户风险批准。 |
| R20 · SLOs, SLIs and Error Budgets | [CH09 L340](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/09-reliability-evaluation-observability.md#L340) | `1 1 2 1 1 0` | 6/12 | CH09 是归属章节，但精确 SLO/分母/预算算式在 CH10 §10.26，存在跨章节依赖。 |

### Production & Security (7)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R21 · VPC and Air-Gapped Deployment | [CH10 L2130](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2130) | `2 2 2 2 1 2` | 11/12 | 网络、数据、运维边界清楚；欠客户真实 Egress 探测。 |
| R22 · Circuit Breakers and Backpressure | [CH10 L2157](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2157) | `2 2 2 2 1 1` | 10/12 | 上限、熔断和测试计划明确；未做真实故障注入/饱和基准。 |
| R23 · Idempotency | [CH10 L2177](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2177) | `2 2 2 2 1 1` | 10/12 | 业务 key 与 UNKNOWN 处理清楚；支付网关副作用未做真实集成测试。 |
| R24 · Multi-Tenancy and Data Isolation | [CH10 L1220](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L1220) | `2 2 2 2 2 1` | 11/12 | 控制面隔离很完整；真实数据层权限与密钥轮换仍是上线前提。 |
| R25 · The Ontology (Semantic Layer) | [CH10 L2191](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2191) | `2 2 2 1 1 1` | 9/12 | 语义层案例有，但缺 business owner 签署后的时态规则回归。 |
| R26 · AI Cost and Unit Economics | [CH10 L2221](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2221) | `2 1 2 1 1 1` | 8/12 | 公式说明了归因，但没有按真实 Cohort 的成本口径和数据校核。 |
| R27 · Model Registry and Promotion | [CH10 L2296](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/10-serving-deployment-ai-platform.md#L2296) | `2 1 2 1 1 2` | 9/12 | Registry alias 与 Endpoint 分离清楚；缺真实 Serving Target 集成测试。 |

### Data & Databricks (6)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R28 · Change Data Capture (CDC) | [CH11 L162](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L162) | `2 2 2 2 1 2` | 11/12 | AUTO CDC 顺序和快照阐述好；实际客户重放/保留配置未测试。 |
| R29 · Lakehouse, Delta and the Medallion Architecture | [CH11 L59](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L59) | `2 2 2 1 1 1` | 9/12 | Bronze/Silver/Gold 解释明确；缺可重放运行工单和故障恢复门槛。 |
| R30 · Spark Internals and Performance Tuning | [CH11 L205](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L205) | `2 2 2 1 1 2` | 10/12 | EXPLAIN/Skew/AQE 故障明确；未跑真实 Spark 同数据基准。 |
| R31 · Text-to-SQL | [CH11 L108](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L108) | `2 2 2 2 1 1` | 10/12 | 强制 Scope 和 AST 已说明；真实 UC RLS 端到端未验证。 |
| R32 · Feature Stores | [CH11 L430](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L430) | `2 2 2 2 1 2` | 11/12 | 双时态负例已可运行；真实 Databricks Workspace 未执行。 |
| R33 · SQL Window Functions | [CH11 L71](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/11-data-sql-engineering.md#L71) | `2 2 2 1 1 1` | 9/12 | ROW_NUMBER/SCD2 例子有；缺真实 Delta 处理多源顺序的运行测试。 |

### FDE Delivery (3)

| ID · Original concept | Owner evidence | M E T F G P | Score | Highest-value gap / interview drill |
|---|---|---|---:|---|
| R34 · Scoping Ambiguous Problems | [CH12 L22](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/12-fde-customer-delivery.md#L22) | `2 2 2 1 1 1` | 9/12 | 发现问题和 MVP 示例明确；缺真实利益相关方签署的范围证据。 |
| R35 · The Walking Skeleton (Thin Slice First) | [CH12 L39](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/12-fde-customer-delivery.md#L39) | `2 2 2 2 2 1` | 11/12 | 现有 SQLite 演示可运行，但不构成真实 SSO/云端纵切部署。 |
| R36 · Recovering a Failing Live Demo | [CH12 L97](https://github.com/Kevoyuan/ai-engineer-handbook/blob/content/fde-02-04-system-data-audit-20261008/handbook/chapters/12-fde-customer-delivery.md#L97) | `2 1 2 1 1 0` | 7/12 | 已有预检与降级方法；缺一套分钟级现场恢复演练和客户验收量化。 |

## Required oral defense (four 12-minute mock rounds)

**Round A · Cross-tenant order leak after ACL revocation (CH02/03/10).** The user may work tenant-A order `42`; tenant B also has `42`. A private carrier document is revoked after vector retrieval but before evidence fetch. Design trusted identity, exact SQL/query path, index-level and fetch-time checks, cache isolation and trace sanitization. **Follow-up:** preFilter versus postFilter recall, revocation propagation delay, reranker candidate leakage. **Pass evidence:** diagram includes resource-side authorization independent of model arguments; a negative test checks no forbidden document ID/payload reaches prompt/log/cache; separate SLI for source freshness and revocation-to-denial. **Fail:** 'put tenant_id in the prompt' or 'vector similarity is permission'.

**Round B · CDC replay and temporal feature leakage (CH11).** Carrier delivery and handoff arrive out of order; a correction and deletion occur; a feature event effective at 11:00 is not ingested until 13:00 but a label is decided at 12:00. Propose source sequencing, a consistent bootstrap offset, tombstone processing, point-in-time SQL and replay reconciliation. **Follow-up:** why MAX(event_time) and generic row_number can be business-wrong, source sequence versus event/ingestion time, when to use Lakeflow AUTO CDC. **Pass evidence:** bitemporal gate rejects unavailable future knowledge; test covers duplicate/conflicting source ID, late event and overlapping initial snapshot; numbers reconcile with source ledger. **Fail:** comparing independent carriers' sequence numbers or claiming CDF is a perpetual audit log.

**Round C · Retry storm and unknown payment outcome (CH08/10).** A refund tool times out after the gateway may have committed; meanwhile a dependency has a 503 outage. Design human approval, stable operation ID, reconcile/receipt, backoff+jitter/attempt budget, circuit breaker and load shedding. **Follow-up:** layered retries magnify demand, half-open recovery, what is a customer-side idempotency key lifetime? **Pass evidence:** UNKNOWN outcome handled without a new key, bounded queue/concurrency, operation-identity audit and injected timeout-after-commit test. **Fail:** treat timeout as confirmed failure or perform autonomous retry with fresh key.

**Round D · Go-live evidence and the failing customer demo (CH09/12).** Pilot accuracy 95%, production-reviewed 70%, but one critical authorization slice regresses; at demo time backend returns 503. Produce a customer discovery revision, stratified golden set, sealed holdout, safety release block, representative canary, truthful degraded-mode demo and incident handoff. **Follow-up:** LLM judge position bias, task cost including review, error budget versus unacceptable permission leak. **Pass evidence:** predeclared cohorts and denominators, owner sign-off, no fake live data, rollout remains paused until critical slice recovers, documented trace/runbook/rollback. **Fail:** justify release on average score alone.

### Candidate self-assessment (not an automated certification)

After each round, record: (a) independent architecture in 3 minutes, (b) mechanism and at least one credible alternative, (c) a precise fault and safe behavior, (d) reproducible test and denominator, (e) first-party caveat, (f) an explicit follow-up the design **cannot** yet prove. Retest with a different order/tenant/constraint so answers are not memorized.

## Honest scope and next pass

- This audit checked **36 of 167** topics qualitatively with a consistent rubric; the other 131 are **not scored**, even though all 167 have terminology location in the separate H/B/N inventory.
- Scores are editorial judgment drawn from canonical Markdown; they require a second subject-matter review. High grades are content evidence, not user knowledge or production validation.
- Recheck currently-changing product references in their owners before deployment. New official research was not performed for every individual concept during this audit.
- Next authoring priority is not adding generic definitions: strengthen weak `F`/`G`/`P` evidence with one real reproducible fault/acceptance artifact per priority topic. Bring mandatory security and payment integration tests to real customer infrastructure before claiming production readiness.
- Changes must remain only on Draft PR #70; no main merge, `web/site` modifications, or Vercel promotion.
