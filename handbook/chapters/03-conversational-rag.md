# Chapter 03 Supplement · Conversational RAG Referential Resolution
## 多轮 RAG 的指代消解、状态与检索控制

> Source-derived semantic supplement for Chapter 03. The source material focuses on production failure modes caused by pronouns, ellipsis, ordinal references, stale conversational state, and indiscriminate history concatenation in multi-turn RAG.

多轮 RAG 的关键问题不是“要不要把历史对话放进 Prompt”，而是：**当前用户输入是否已经包含足够、正确、未过期的检索语义。**

用户在第 2、3、4 轮经常只说：

```text
它怎么样？
这个还能申请吗？
第二条呢？
那刚才那个部门呢？
```

这些表达对人类来说可以借助会话状态理解，但对 Retriever 来说往往是不完整 Query。直接拿原始问句做 BM25 / Dense Retrieval，容易出现空召回、错误实体召回或语义噪声。

因此，多轮 RAG 应在 Retrieval 之前增加一个 **Conversational Retrieval Control Layer**。

```text
Current User Turn
      +
Conversation State
      ↓
Topic / Intent Check
      ↓
Referent Resolution
      ↓
Standalone Retrieval Query
      ↓
Retriever / Hybrid Route
      ↓
Entity / Constraint Validation
      ↓
Evidence
      ↓
Answer Context
```

> **Conversation history is not retrieval state. Convert conversation into explicit retrieval state before searching.**

---

## 1. 五类常见失效

### 1.1 Retrieval-side referent loss

当前 Query 包含 pronoun、ellipsis、ordinal reference 等不完整表达：

```text
它
这个
那个
第二条
刚才那个
```

如果 Retriever 看不到它们所指向的 entity / policy / product / document section，语义检索本身没有足够信号。

这是 **query incompleteness**，不是单纯 Retriever 质量差。

### 1.2 Query rewrite corruption

Query Rewrite 本身也可能失败：

- 把代词解析到错误实体；
- 丢失时间、部门、版本、产品等关键约束；
- 把无关历史混进新 Query；
- 把用户当前意图改写成旧意图。

一旦独立检索 Query 在这里被写错，后续 reranker 很难恢复，因为候选空间已经偏离。

> **Bad rewrite creates bad candidate space. Reranking cannot recover evidence that was never retrieved.**

### 1.3 Stale-state conflict

用户可能纠正前提或切换话题：

```text
前面我说错了，不是销售部，是法务部。
换个问题，第二个产品支持海外吗？
```

如果系统仍保留旧 `department=sales` 或旧 product entity，就会把 stale state 继续注入 Retrieval。

因此会话状态必须支持：

```text
confirm
update
invalidate
clear-on-topic-switch
```

而不是只允许 append。

### 1.4 History overload

全量历史拼接会同时扩大：

- irrelevant context；
- entity ambiguity；
- contradictory statements；
- prompt length；
- model attention burden。

多轮系统需要的是**相关历史**与**结构化状态**，不是所有原始消息。

### 1.5 Latency / cost growth

如果每轮都把不断增长的历史重新送入 rewrite、retrieval planning、reranking 和 generation，Token 与 latency 往往随会话变长而上升。

来源材料把这一风险描述成“轮次越多，成本可能线性增长”。手册将其保留为**实现风险**而不是固定公式：实际成本取决于 history length、prompt caching、模型调用次数、rewrite policy、retrieval strategy 和 context compression。

> **Conversation length is a cost driver, not a universal linear cost law.**

---

## 2. 核心方案：Structured State + Standalone Retrieval Query

不要让 Retriever 直接承担“理解整段对话”的责任。把会话理解与检索输入拆开。

### 2.1 Structured conversational state

可以维护：

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

每轮不是简单：

```text
history.append(message)
```

而是：

```text
state = reduce(previous_state, new_turn)
```

其中 reducer 可以显式处理：

```text
ADD
UPDATE
CONFIRM
INVALIDATE
CLEAR
```

这和 Chapter 07 的 Working State / Context Engineering 相连：**会话文本是 observation，结构化 state 才是下一轮执行输入。**

### 2.2 Referential resolution

在 Retrieval 前把不完整用户表达恢复为独立检索语义。

示例：

```text
History state:
active_product = "Enterprise Plus"
current_policy = "refund policy"

User:
“它的第二条呢？”

Resolved intent:
product = "Enterprise Plus"
policy = "refund policy"
ordinal = 2
```

然后生成：

```text
Standalone retrieval query:
“Enterprise Plus refund policy second clause”
```

注意这个 Query 是 **retrieval representation**，不是对用户原话的永久替代，也不一定直接展示给用户。

### 2.3 Only relevant state enters rewrite

Query Rewrite 不应默认接收全部历史。优先输入：

```text
current turn
+ active topic
+ confirmed entities
+ unresolved references
+ recent relevant turns
```

而不是：

```text
all messages from turn 1 to N
```

> **Rewrite from relevant state, not from raw history volume.**

---

## 3. Topic shift and correction handling

Topic detection 的目的不是给聊天分类，而是决定**哪些旧状态仍然有效**。

```text
New Turn
↓
Same topic?
├─ Yes → retain compatible state
└─ No  → invalidate topic-scoped entities
```

状态最好区分作用域：

| State type | Topic switch 后 |
|---|---|
| user identity / tenant / permissions | retain |
| long-lived profile preference | usually retain |
| current product / document / policy | clear or re-resolve |
| ordinal reference | clear |
| recent local constraints | revalidate |
| corrected fact | replace old value |

因此“清空所有 Memory”同样过于粗糙。应该清理 **topic-scoped working state**，而不是跨会话 Profile / Authorization State。

---

## 4. Context pruning

多轮 RAG 的 Context Builder 至少应区分：

```text
Structured State
Recent Relevant Turns
Retrieved Evidence
Answer Instructions
```

而不是把它们混成一个越来越长的 conversation transcript。

一个更稳定的输入结构是：

```text
[State]
confirmed entities / topic / constraints

[Recent dialogue]
only locally relevant turns

[Evidence]
retrieved chunks with provenance

[Current user turn]
raw user wording
```

这与 Chapter 07 的 Context Compression 相连：压缩目标不是单纯减少 token，而是**保留当前决策真正依赖的信息**。

> **Compression quality is measured by decision-relevant information retained, not tokens removed.**

---

## 5. Post-retrieval entity / constraint validation

Rewrite 成功并不保证 Retrieval 一定正确。候选返回后仍应检查其实体和约束是否与已消解 Query 一致。

可以验证：

```text
entity match
product / department match
policy / document type match
time / version match
ordinal / section match
authorization / tenant match
```

例如：

```text
Resolved entity = Product B
Retrieved chunk = Product A
→ reject / down-rank
```

这可以由 deterministic metadata check、schema match、reranker feature 或 LLM verifier 完成，取决于字段是否结构化。

> **Referent resolution fixes the query side; entity validation protects the evidence side.**

---

## 6. Full production loop

```text
User Turn
   ↓
Conversation State Reducer
   ↓
Topic / Correction Detection
   ↓
Referent Resolution
   ↓
Standalone Retrieval Query
   ↓
Query Router
   ↓
Exact / BM25 / Dense / Hybrid / Tool
   ↓
Rerank
   ↓
Entity + Constraint Validation
   ↓
Evidence Sufficiency
   ↓
Context Packing
   ↓
Answer
   ↓
State Update
```

这里 Query Router 仍负责 Chapter 03 已有的“走哪条证据路径”；Referent Resolution 负责的是更早一步：**先把当前会话输入恢复成可路由、可检索的语义。**

因此两者不是替代关系：

```text
Conversation understanding
→ Retrieval query formation
→ Query routing
→ Evidence retrieval
```

---

## 7. Failure taxonomy

把所有问题统称为“多轮 RAG 不准”会很难定位。

| Failure | Meaning |
|---|---|
| `referent_resolution_failure` | “它/这个/第二条”指错对象 |
| `state_staleness` | 用户纠正/换题后旧实体仍生效 |
| `rewrite_constraint_loss` | 改写漏掉关键约束 |
| `retrieval_failure` | Query 正确但没召回 |
| `evidence_entity_mismatch` | 召回文档实体与目标实体不一致 |
| `context_pollution` | 无关历史/旧前提干扰 generation |
| `generation_failure` | Evidence 正确但答案错误 |

这类标签应进入 Trace / Evaluation，以便区分“检索器坏了”和“会话理解坏了”。

---

## 8. Evaluation

除了普通 Recall@K / NDCG，还应建立 multi-turn conversational retrieval set。

一个 Case 至少包含：

```text
conversation history
current user turn
expected referent
expected standalone query semantics
expected target entity / document
expected evidence
```

重点 slice：

```text
pronoun reference
ordinal reference
ellipsis
entity correction
topic switch
multiple candidate referents
long conversation
cross-turn constraint retention
```

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

否则最终 Answer 错了，很难知道问题发生在 state、rewrite、retrieval、rerank 还是 generation。

---

## 9. Latency trade-off

单独做指代消解可能增加一次模型调用，但不意味着每轮必须调用大模型。

可以逐步优化：

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

这延续 Chapter 03 Router 的同一工程原则：

> **Use the cheapest reliable route first.**

对极低延迟场景，可限制 conversation horizon、维护 compact state、缓存 stable entity state，并让 rewrite 只在检测到 pronoun / ellipsis / ambiguity 时触发。

---

## 10. Canonical rules

> **Do not retrieve with an incomplete conversational query if the missing referent can be resolved first.**

> **Conversation history is raw evidence; structured conversational state is operational context.**

> **Rewrite from relevant state, not from the entire transcript.**

> **Topic changes invalidate topic-scoped state, not every form of memory.**

> **Bad rewrite creates bad candidate space; reranking cannot recover absent evidence.**

> **Referent resolution fixes the query side; entity validation protects the evidence side.**

> **Evaluate referent resolution and standalone-query semantics separately from final-answer quality.**

---

## Source boundary

来源材料采用“面试回答”形式，提出五类多轮 RAG 失败与“结构化状态 + 指代消解 Query Rewrite + Topic Detection + Context Pruning + Post-retrieval Entity Validation”的工程方案。

本手册保留其问题框架，并做以下工程化处理：

- 把“全量历史导致成本线性增长”降级为实现风险，而不是固定成本定律；
- 把 topic switch 清理限定为 topic-scoped working state，而不是清空所有 Memory；
- 把指代消解定位在 Query Routing 之前；
- 增加 failure taxonomy 与独立 evaluation slices；
- 与 Chapter 07 Working State / Context Compression 建立边界。
