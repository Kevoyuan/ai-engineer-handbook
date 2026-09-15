# AI Engineer System Framework
## 全局知识框架与 2026-09 内容审计

> This document is the system-level knowledge map for the current handbook. It is not a vendor framework. It separates durable engineering layers from product-specific implementations and records the coverage boundary of the current 02–09 chapters.

AI Engineering 不能被压成 RAG、Agent 或某个框架。一个生产 AI 系统至少需要同时回答四类问题：

1. **What outcome are we optimizing?** 用户任务、业务结果、风险与 SLA 是什么？
2. **How does one request execute?** 请求如何路由、取证、调用模型/工具、验证并产生副作用？
3. **What persistent assets support execution?** Knowledge、State、Memory、Skills、Models、Tools、Artifacts 如何版本化和治理？
4. **How does the system improve safely?** Trace、Eval、Monitoring、Release、Cost 与 Production Feedback 如何闭环？

## 1. AI Engineering System Framework

```text
                         PRODUCT / TASK OUTCOME
                  user goal · business KPI · risk · SLA
                                   │
                                   ▼
┌──────────────────────────── RUNTIME PATH ─────────────────────────────┐
│ Request / Identity                                                  │
│      ↓                                                               │
│ Route / Plan / Workflow                                              │
│      ↓                                                               │
│ Context Builder ───────────────┐                                     │
│      ↓                         │                                     │
│ Model / Tool / Service Execute │                                     │
│      ↓                         │                                     │
│ Validate / Policy / HITL       │                                     │
│      ↓                         │                                     │
│ Response / Action / Artifact   │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
      KNOWLEDGE & EVIDENCE   STATE & MEMORY    CAPABILITIES & ACTIONS
      docs · DB · graph      thread · profile  skill · MCP · API
      index · retrieval      working state     tool · deterministic svc
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
┌──────────────────────────── CONTROL PLANE ────────────────────────────┐
│ Validation · Authorization · Safety · Eval · Observability · Cost     │
│ Release Gate · Canary/Rollback · Monitoring · Human Review            │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 ▼
                    PRODUCTION LEARNING LOOP
       Trace / Feedback → Dataset / Root Cause → Build / Test → Release
                                 │
                                 └──────────────→ Runtime

PLATFORM FOUNDATION
Model/API Selection · Model Adaptation · Inference Serving · Deployment
Secrets / Identity · Queue / Storage · Model/Artifact Registry · CI/CD
```

这张图有两个重要边界：

- **Runtime Path** 是一次请求怎么完成；
- **Control Plane + Learning Loop** 是系统如何证明、治理并持续改进 Runtime。

RAG、Memory、MCP、Agent、Eval 都只是这张系统图里的子系统，而不是整张图本身。

> **AI engineering is the engineering of a controlled runtime plus a measurable learning loop.**

## 2. 当前 02–09 如何映射到框架

| Handbook | 系统位置 | 当前覆盖判断 |
|---|---|---|
| 02 Enterprise Retrieval | Knowledge & Evidence | Strong：Exact / BM25 / Dense / Graph / Metadata 的能力边界清楚 |
| 03 Hybrid Retrieval & Routing | Runtime · Route / Context | Strong：Query shape、hybrid、RRF、rerank、budget 分层完整 |
| 04 RAG Reliability | Validate / Decision Policy | Strong：Evidence Sufficiency、Claim Verification、abstention 边界明确 |
| 05 Production PDF RAG | Knowledge ingestion + provenance | Strong：Parse → Structure → Index → Evidence chain；需避免把“page-level”当所有 source format 的唯一 citation 形态 |
| 06 Skills & Routing | Capabilities & Actions | Strong conceptually；MCP 需要按当前 protocol revision 标注 transport/auth/version 边界 |
| 07 Memory & Context | State & Memory | Strong：thread state、long-term store、promotion、compression；六层 taxonomy 属于 handbook synthesis |
| 08 Agent Orchestration | Runtime · Workflow / Execution | Strong：bounded loop、graph、artifact、idempotency、HITL、repair scope |
| 09 Reliability / Eval / Observability | Control Plane + Learning Loop | Strong：Trace、Dataset、Evaluator、Release Gate、Monitoring、Cost 已形成生产闭环 |

## 3. Validation：哪些知识可以继续作为 canonical principle

### Retrieval / RAG

当前 Retrieval 主线是可靠的：lexical search 与 vector search 解决不同 retrieval signals，hybrid retrieval 可通过 RRF 等方式融合，再对候选执行更昂贵的 reranking。不要把不同 retriever raw score 直接假设成同一标尺。

Canonical principles 保留：

- identifiers 优先 deterministic / field-aware retrieval；
- semantic similarity 不等于 operational equivalence；
- retrieval budget 与 context budget 分开；
- evidence relevance 与 evidence sufficiency 分开；
- authorization 应在 evidence 进入 model context 前尽量收紧候选空间。

### Memory / State

当前 Memory 方向与主流 agent runtime 的 thread-scoped persistence / cross-thread store 模式兼容。

需要明确：

- `Session / Working / Profile / Episodic / Semantic / Procedural` 是**本手册的工程 taxonomy**，不是 LangGraph 或行业标准枚举；
- Thread / Checkpoint 是执行状态持久化机制，不自动等于长期用户记忆；
- Long-term memory 应有 provenance、scope、permission、version 和受控 write path。

### Skills / MCP / Tools

`Skill Match ≠ Authorization` 与 `The model proposes; the host executes` 继续保留。

但 MCP 必须按版本理解。到 `2026-07-28` revision，MCP 已转向 stateless protocol core，并继续强化 OAuth / OIDC authorization，同时引入/调整 extensions 与 Tasks。因而正确表述应是：

> **MCP standardizes protocol-level capability access and includes transport-level authorization mechanisms, but it still does not replace application business authorization, policy, approval, idempotency, transaction semantics, or task verification.**

不要再用早期 MCP “sessionful transport + no auth in core” 的 mental model 解释当前实现。

### Observability / Evaluation / Cost

当前 Ch09 主线正确：Trace 解释 trajectory，Eval 把 desired behavior 变成可重复证据，Monitoring 把 production signal 路由回 Build/Test。

Observability 不应绑定单一平台。平台实现可以是 LangSmith，也可以映射到 OpenTelemetry GenAI traces / metrics / events 加其他分析与评测系统。

Cost 的 canonical sequence 应继续是：

```text
Usage Capture
→ Pricing Resolution
→ Run / Trace Cost
→ Slice / Trend
→ Join Task Outcome
→ Cost per Successful Task
```

## 4. 需要收紧的表述

### 4.1 Page-level citation 不是所有系统唯一的 hard requirement

对于 PDF / scanned document，page number + bbox 是非常强的 provenance anchor；但 HTML、数据库记录、代码仓库、知识图谱或结构化 API 可能更适合 section / row / record / commit / entity provenance。

更通用的 canonical rule 应是：

> **Every important claim needs resolvable source provenance at the finest stable granularity the source supports.**

PDF 章节继续使用 page-level citation 没问题，但不要把它外推成所有 RAG 的唯一 citation 形式。

### 4.2 Framework-specific behavior 必须带 version boundary

MCP、LangGraph、LangSmith、模型 pricing、provider token subtype、SDK API 都会变化。它们应是 implementation example，而不是 architecture law。

### 4.3 “AI Engineer” 当前 edition 的 scope 需要更诚实

当前 02–09 深度集中在 **Applied AI / RAG / Agent / Evaluation / Reliability**。这部分已经可以形成高质量 production application engineering spine，但还不足以声称完整覆盖 AI Platform / Model Engineering。

## 5. 当前真正缺的核心知识

### Gap A · Model Selection & Adaptation

至少应覆盖：

```text
Model capability / modality / context / structured output
→ quality / latency / cost / privacy / hosting constraints
→ prompt / few-shot / tool use baseline
→ fine-tuning / PEFT / LoRA when justified
→ eval before and after adaptation
```

Fine-tuning 不是默认第一步；它应该与 prompt/context/tool design 和 retrieval 一起按 failure mode 决策。

### Gap B · Inference Serving

这是当前 “AI Platform” 最大缺口：

```text
Request Queue
→ Scheduler / Dynamic or Continuous Batching
→ Model Instance
→ KV / Prefix Cache
→ Streaming Decode
→ Rate Limit / Timeout / Admission Control
→ Metrics
```

需要理解 latency vs throughput、TTFT vs decode、batching、concurrency、GPU utilization、quantization、warm-up、autoscaling、fallback 与 capacity planning。

### Gap C · Deployment / Model & Artifact Lifecycle

至少需要：

```text
Experiment / Eval Evidence
→ Versioned Prompt / Model / Tool / Workflow / Dataset
→ Registry / Artifact Lineage
→ Staging / Shadow / Canary
→ Release Gate
→ Production
→ Rollback
```

Model / Prompt / Workflow / Dataset / Pricing Config 都应可追踪版本和 lineage。

### Gap D · Security Operations

当前权限原则分散在 Retrieval、Skills、Memory、Harness 中，但缺一张完整 security threat model：

- identity / tenant isolation；
- secrets / token handling；
- prompt injection / indirect injection；
- tool permission / approval / sandbox；
- data exfiltration；
- supply-chain / untrusted MCP server / tool descriptions；
- audit / incident response。

Security 应成为 cross-cutting control plane，而不是某一章最后的注意事项。

## 6. 建议的 01–10 durable spine

```text
00  AI Engineering System Framework            ← global map, not a normal chapter
01  Model / API / Context Foundations           ← missing
02  Enterprise Retrieval Foundations
03  Hybrid Retrieval & Query Routing
04  RAG Reliability & Selective Answering
05  Production Document / Multimodal RAG
06  Skills · MCP · Tools · Capability Routing
07  State · Memory · Context Engineering
08  Agent · Workflow · Orchestration
09  Reliability · Eval · Observability · Cost
10  Serving · Deployment · Security · AI Platform ← missing
```

这样 02–09 不需要推倒重写；它们会成为全局框架里的中间主干，而不是整本 AI Engineering 的全部。

## Verification sources

Primary/current references used for this audit:

- Elastic · Hybrid search / ranking and reranking
  - https://www.elastic.co/docs/solutions/search/hybrid-search
  - https://www.elastic.co/docs/solutions/search/ranking
- Model Context Protocol · 2026-07-28 specification release / current SDK line
  - https://blog.modelcontextprotocol.io/posts/2026-07-28/
  - https://ts.sdk.modelcontextprotocol.io/v2/
- LangGraph · Persistence and Memory
  - https://docs.langchain.com/oss/python/langgraph/persistence
  - https://docs.langchain.com/oss/python/concepts/memory
- LangSmith · Cost tracking
  - https://docs.langchain.com/langsmith/cost-tracking
- OpenTelemetry · GenAI observability / semantic conventions
  - https://opentelemetry.io/blog/2026/genai-observability/
  - https://opentelemetry.io/docs/specs/semconv/
- NVIDIA Triton · inference scheduling / batching / serving architecture
  - https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html
  - https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html
- MLflow · Model Registry
  - https://mlflow.org/docs/latest/ml/model-registry
- Hugging Face PEFT / LoRA
  - https://huggingface.co/docs/peft/index
