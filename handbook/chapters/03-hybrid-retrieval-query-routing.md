# Chapter 03 · 混合检索与 Query Routing
## Hybrid Retrieval and Query Routing

> Canonical semantic chapter. Includes conversational retrieval control that previously lived in a separate supplement.

企业搜索通常需要 Exact + BM25 + Dense + Metadata，再按关系型任务选择性接入 Graph / SQL / Tool。真正的工程问题不是“支持多少种检索”，而是**当前请求需要什么证据路径**。

## 3.1 Hybrid Retrieval Pipeline

推荐把系统拆成五层：

```text
1. Index / Field Layer
   Exact / Keyword · BM25 · Dense · Optional Graph

2. Query Analysis
   query_type · domain · entities · identifiers
   time_scope · risk · required_evidence

3. Authorization / Metadata Filter
   Identity → Tenant / Role / ACL → Authorized Candidate Space

4. Candidate Fusion and Reranking
   RRF / fusion → Cross-Encoder or LLM Reranker

5. Evidence + Answer Evaluation
   retrieval metrics + E2E metrics
```

不同 Retriever 的 raw scores 通常不在同一标尺上。不要直接把 BM25 score 与 cosine similarity 相加。

### RRF

Reciprocal Rank Fusion 只依赖名次：

```text
RRF(d) = Σ 1 / (k + rank_i(d))
```

`k=60` 只是常见示例，不是标准答案，应该在自己的评测集上验证。

RRF 解决的是**候选融合**，不是最终相关性证明。融合后仍可能需要 Cross-Encoder / LLM Reranker 与 Evidence Validation。

## 3.2 Query Routing：先判断证据形状

Router 的职责包括：选择数据源、选择检索方式、决定是否并行、决定是否需要工具、决定信息不足时澄清还是停止。

| Query 形状 | 首选路径 |
|---|---|
| 精确 ID / 标识符 | Exact Field / DB / Term Query |
| 术语 / 关键词 | BM25 + Metadata |
| 语义 / 流程问法 | Dense + BM25 fallback / Hybrid |
| 数值聚合 | SQL / OLAP / Analytics Tool |
| 关系 / 多跳 | Graph / DB / Tool + source evidence |
| 同时含 ID 与原因描述 | Exact + BM25 / Dense 组合 |
| 信息不足 | Clarify |
| 非知识库闲聊 | No Retrieval |

Router 可以按四层能力组织：

```text
Layer 1  No Retrieval
Layer 2  Deterministic Retrieval: Exact / DB / SQL / Metadata
Layer 3  Knowledge Retrieval: BM25 / Dense / Graph
Layer 4  Hybrid / Composed: multi-retriever / RRF / reranker / tool chain
```

完整执行链：

```text
User Query
→ Query Analyzer
→ Authorization + Capability Check
→ Route Plan
→ Retriever / Tool Execution
→ Fusion + Reranking (when needed)
→ Evidence Sufficiency + Answer Policy
```

> **Use the cheapest reliable route first, and expand retrieval only when the query or uncertainty requires it.**

## 3.3 Router 演进：不要一开始就用最复杂模型

合理路径通常是：

```text
Deterministic Parsing
→ Rule-based Routing
→ Lightweight Learned Router
→ LLM Fallback for ambiguous long tail
→ Feedback-driven improvement
```

先统计真实 Query 分布，再让规则覆盖高频、低歧义场景；小模型处理可学习的边界；LLM 只接低置信、长尾、组合意图。日志与人工纠错持续构成训练集。

“规则覆盖 80%”“规则超过 20 条再升级”等只能是经验启发，不是通用标准。

Embedding / small-model Router 的优势是低延迟、成本稳定、适合固定意图集；弱点是组合意图与新领域。LLM Router 的优势是 zero-shot、长尾和复杂约束，代价是更高延迟/成本，而且输出仍需 Schema Validation、Capability Check 与 Authorization。

## 3.4 多路并行不是默认答案

“所有路径都走一遍”通常不是路由，而是放弃路由决策。只有 Query 同时有 ID 和自然语言原因、Router 置信度低且风险允许扩大 Recall、离线调查明确以 Recall 为先、建立评测基线、或单一 Retriever 有已知盲区时，才更合理。

并行时必须同时约束 concurrency、timeout、permission filtering、dedup / fusion、degradation path 和 cost budget。

## 3.5 路由失败与恢复

```text
Primary Route
→ no trustworthy candidates
→ Query Rewrite / Alias Expansion
→ Secondary Route
→ Hybrid Retrieval
→ Clarify / Refuse / Escalate
```

不要把所有失败统称为 Router 错误：

- `routing_failure`：选错数据路径；
- `retrieval_failure`：路径正确但没有召回有用证据；
- `data_failure`：数据缺失、过期或没有权限；
- `generation_failure`：证据正确但答案生成错误。

Router 评估除了 Top-1 / Top-K Accuracy，还应看 No-route / Clarify Accuracy、Identifier Extraction Accuracy、Per-route Recall@K / NDCG、Oracle-route Gap / Route Regret、E2E Answer Correctness、Task Success、Fallback Rate、Latency P50/P95、Cost/query 与 Unauthorized Route Rate。

Cache Key 至少应包含：

```text
normalized_query
user / tenant / role
router_version
capability_registry_version
index_version
knowledge_snapshot
```

知识库或能力注册表变化后，应通过 TTL 或版本号主动失效。

## 3.6 Retrieval Budget ≠ Context Budget

“召回 20 个文档但 Context 放不下”不能只靠降低 TopK 解决。至少分三个独立预算：召回广度、精排候选、最终上下文容量。

```text
Broad Retrieval (K_retrieve, protect recall)
→ ACL / Metadata Filter + Dedup
→ Rerank (K_rerank, improve precision)
→ Coverage Selection (diversity / MMR / sub-question coverage)
→ Context Packing (K_context, explicit token budget)
```

召回的目标是避免漏证据；Context 的目标是把最有用、覆盖最完整的证据在 Token 预算内交给模型。两者不应混成一个 TopK 参数。

## 3.7 Conversational Retrieval Control：先恢复可检索语义

多轮 RAG 的关键问题不是“要不要把历史对话全部放进 Prompt”，而是：**当前用户输入是否包含足够、正确、未过期的检索语义。**

用户经常只说：

```text
它怎么样？
这个还能申请吗？
第二条呢？
那刚才那个部门呢？
```

这些表达对人类可以依赖会话理解，但对 Retriever 往往是不完整 Query。直接用于 BM25 / Dense Retrieval，容易产生空召回、错误实体召回或噪声。

因此在 Retrieval 之前增加 Conversational Retrieval Control Layer：

```text
Current User Turn
      +
Conversation State
      ↓
Topic / Correction Check
      ↓
Referent Resolution
      ↓
Standalone Retrieval Query
      ↓
Query Routing
      ↓
Retriever / Hybrid Route
      ↓
Entity / Constraint Validation
      ↓
Evidence
```

> **Conversation history is not retrieval state. Convert conversation into explicit retrieval state before searching.**

### Five common failure modes

1. `referent_resolution_failure`：pronoun、ellipsis、ordinal reference 指错对象；
2. `rewrite_constraint_loss`：改写漏掉时间、部门、版本、产品等关键约束；
3. `state_staleness`：用户纠正前提或切换话题后旧实体继续生效；
4. `context_pollution`：全量历史带来无关上下文、冲突前提和注意力负担；
5. `evidence_entity_mismatch`：Query 已消解，但召回证据仍属于错误实体或版本。

成本方面，对话变长通常会增加 token / latency 风险，但不能把“轮次”直接当成固定线性成本公式。实际成本取决于 history length、prompt caching、模型调用次数、rewrite policy、retrieval strategy 与 context compression。

> **Conversation length is a cost driver, not a universal linear cost law.**

## 3.8 Structured conversational state

不要让 Retriever 承担“理解整段会话”的责任。会话文本是 observation；结构化 State 才是下一轮执行输入。

可维护：

```text
topic_domain
current_intent
confirmed_entities
active_product
active_department
policy_type
time_scope
ordinal_reference_set
user_corrections
conversation_constraints
```

每轮更像：

```text
state = reduce(previous_state, new_turn)

ADD
UPDATE
CONFIRM
INVALIDATE
CLEAR
```

而不是：

```text
history.append(message)
```

### Referential resolution

例如：

```text
State:
active_product = "Enterprise Plus"
current_policy = "refund policy"

User:
“它的第二条呢？”

Resolved intent:
product = "Enterprise Plus"
policy = "refund policy"
ordinal = 2

Standalone retrieval query:
“Enterprise Plus refund policy second clause”
```

这个 Standalone Query 是 **retrieval representation**，不是对用户原话的永久替代，也不一定展示给用户。

Query Rewrite 优先输入：

```text
current turn
+ active topic
+ confirmed entities
+ unresolved references
+ recent relevant turns
```

而不是所有历史消息。

> **Rewrite from relevant state, not from raw history volume.**

## 3.9 Topic switch / correction handling

Topic detection 的目的不是给聊天分类，而是决定哪些旧状态仍然有效：

```text
New Turn
↓
Same topic?
├─ Yes → retain compatible state
└─ No  → invalidate topic-scoped state
```

| State type | Topic switch 后 |
|---|---|
| user identity / tenant / permissions | retain |
| stable profile preference | usually retain |
| current product / document / policy | clear or re-resolve |
| ordinal reference | clear |
| recent local constraints | revalidate |
| corrected fact | replace old value |

因此换题时不应该“清空所有 Memory”。应清理 topic-scoped working state，而不是跨会话 Profile / Authorization State。

## 3.10 Context pruning and evidence-side validation

Context Builder 至少区分：

```text
Structured State
Recent Relevant Turns
Retrieved Evidence
Answer Instructions
Current User Turn
```

压缩质量不应只看删掉多少 Token，而应看保留了多少 decision-relevant information。

候选返回后继续检查：

```text
entity match
product / department match
policy / document type match
time / version match
ordinal / section match
authorization / tenant match
```

字段结构化时优先 deterministic metadata/schema check；非结构化语义再使用 reranker feature 或 LLM verifier。

> **Referent resolution fixes the query side; entity validation protects the evidence side.**

## 3.11 Full conversational RAG loop

```text
User Turn
→ Conversation State Reducer
→ Topic / Correction Detection
→ Referent Resolution
→ Standalone Retrieval Query
→ Query Router
→ Exact / BM25 / Dense / Hybrid / Tool
→ Rerank
→ Entity + Constraint Validation
→ Evidence Sufficiency
→ Context Packing
→ Answer
→ State Update
```

Referent Resolution 与 Query Router 不是替代关系：前者先恢复可路由、可检索的语义；后者再决定走哪条证据路径。

## 3.12 Multi-turn evaluation

除了普通 Recall@K / NDCG，应建立 multi-turn conversational retrieval set：

```text
conversation history
current user turn
expected referent
expected standalone-query semantics
expected target entity / document
expected evidence
```

重点 slice：pronoun reference、ordinal reference、ellipsis、entity correction、topic switch、multiple candidate referents、long conversation、cross-turn constraint retention。

可测：

```text
Referent Accuracy
Entity Resolution Accuracy
Standalone Query Constraint Recall
Target-document Recall@K
Entity-mismatch Rate
Topic-switch State Leakage Rate
E2E Answer Correctness
Latency / Cost per turn
```

> **Evaluate the rewritten retrieval intent, not only the final answer.**

## 3.13 Latency trade-off

指代消解不意味着每轮必须额外调用大模型：

```text
No ambiguous reference
→ skip rewrite

Simple explicit referent
→ deterministic state substitution

Ambiguous referent
→ lightweight resolver

Complex / conflicting history
→ LLM resolver
```

极低延迟场景可以限制 conversation horizon、维护 compact state、缓存 stable entity state，并只在检测到 pronoun / ellipsis / ambiguity 时触发 rewrite。

## Canonical rules

> **Do not retrieve with an incomplete conversational query if the missing referent can be resolved first.**

> **Conversation history is raw evidence; structured conversational state is operational context.**

> **Bad rewrite creates bad candidate space; reranking cannot recover evidence that was never retrieved.**

> **Topic changes invalidate topic-scoped state, not every form of memory.**

> **Use the cheapest reliable route first.**
