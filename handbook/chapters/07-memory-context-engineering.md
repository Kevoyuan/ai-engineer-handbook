# Chapter 07 · Memory、State 与 Context Engineering
## Memory, State, and Context Engineering

> Canonical semantic chapter.

Memory 不是“把聊天记录永久保存”。可靠设计必须区分生命周期、语义类型、读写策略、权限与版本。

## 7.1 六层 Memory Structure

### 1. Session Metadata

```text
conversation_id · user_id · tenant_id · locale · current_task · permissions
```

作用域是单次请求/会话，属于 ephemeral context。

### 2. Working Memory

```text
current plan · intermediate results · open questions · tool outputs
```

面向当前任务，任务结束可以过期。

### 3. Structured Profile

```text
language preference · role · approved tools · report format
```

保存稳定、显式维护的偏好与配置。

### 4. Episodic Memory

记录“发生过什么”：user asked X、system did Y、result Z、feedback ±。它更像 Event Log，需要 provenance。

### 5. Semantic Memory

组织/项目事实、定义、政策等稳定知识。

### 6. Procedural Memory

“How to perform task X”、validated workflow、repair strategy 等可复用过程。

短期层（Session / Working）可以随会话快速流动；长期层（Profile / Episodic / Semantic / Procedural）不应让模型自由写入，必须进入受控 Write Pipeline。

> **Memory is a governed storage and retrieval system, not a longer prompt.**

## 7.2 Ledger + Views + Policy

建议事件与事实 append-only，不原地改写历史；当前 Profile / Current State 作为 Materialized View 从事件日志派生。

每条长期 Memory 需要明确：

```text
source
confidence
owner
scope
validity
sensitivity
version
```

并区分 Valid Time 与 Transaction Time。

### Write Pipeline

```text
Conversation / Event
→ Candidate Extraction
→ Normalize + Deduplicate
→ Conflict Check
→ Permission / Policy Check
→ Store with provenance and validity
→ Update Views
```

### Read Pipeline

```text
Current Query
→ Query Classification
→ Access Filter
→ Retrieve Relevant Memory
→ Rank by Relevance + Recency + Quality
→ Assemble Context
```

多用户系统必须按 tenant_id、user_id、resource ACL 与 memory scope 隔离。未授权 Memory 不应进入 Retriever 候选、不应进入模型 Context，也不应在拒答中泄漏其存在。

## 7.3 Short-term → Long-term Promotion

短期记忆不会自动“变成”长期记忆。Promotion 过程应是：

```text
Working State
→ Candidate Extraction
→ Importance + Stability
→ Dedup + Conflict Check
→ Long-term Store + Provenance
```

只晋升稳定、可复用、用户授权、低冲突的信息。临时 Tool Output、未验证推断、敏感信息默认不晋升。

## 7.4 Context Compression

典型触发条件：

```text
Token budget approaching threshold
Topic / task phase changes
Stable decision reached
Repeated transcript with little new information
Large tool result but only small evidence subset is needed
Long-running session checkpoint
```

不要无限做“摘要的摘要”。保留 Event Log 和关键 provenance，再从可验证原始记录重新构建 Compact View。

> **I do not treat the transcript as the state. I maintain structured state and compress views while preserving provenance.**

压缩质量应按 decision-relevant information retained 衡量，而不是只看 tokens removed。

## 7.5 State ≠ Transcript

真实 Agent 的执行状态通常包含：

```text
current objective
plan / phase
confirmed entities
constraints
open questions
tool results
approval status
retry budget
artifact references
```

Conversation transcript 只是 State Reducer 的输入之一。

```text
New observation
→ State reducer
→ explicit state patch
→ next decision
```

这与 Chapter 03 的 Conversational RAG 相连：用户说“它”“第二条”时，Retriever 不应该从完整聊天历史里猜，而应先通过 structured working state 恢复 referent，再形成 standalone retrieval query。

> **The transcript is raw evidence; state is an operational representation used to make the next decision.**

## 7.6 Thread persistence vs cross-thread memory

需要区分至少两种生命周期：

```text
Thread / execution persistence
= current conversation or workflow can resume

Cross-thread memory
= reusable information survives beyond one thread
```

在 LangGraph 等实现里，checkpointer 常用于 thread-level execution state；Store 或其他长期存储用于跨 thread memory。具体 API 会变化，但生命周期边界不应混淆。

一个 Thread 能恢复，不代表其中所有内容都应该晋升为长期 Memory。

## 7.7 Read budget and write budget

Memory 系统不仅需要存储容量，还需要显式预算：

```text
Write budget
what is allowed to become durable?

Read budget
what is allowed to enter this decision context?
```

写得太多会制造 stale / conflicting memory；读得太多会重新退化成“把所有历史塞进 Prompt”。

因此 Memory Policy 应同时约束：

- retention；
- promotion；
- retrieval scope；
- permission；
- recency / validity；
- conflict resolution；
- context token budget。

## 7.8 Provenance and correction

长期 Memory 必须可回答：

```text
where did this fact come from?
when was it observed?
who is allowed to use it?
is it still valid?
has the user corrected it?
what version superseded it?
```

用户纠正事实时，应创建新的事件/状态更新并使旧 View 失效，而不是把历史证据偷偷改写掉。

## 7.9 Failure taxonomy

```text
stale_memory
memory_scope_leak
unauthorized_memory_read
bad_promotion
conflicting_memory
missing_provenance
context_overload
compression_loss
state_reconstruction_failure
```

把这些 Failure 单独记录在 Trace / Eval，才能判断问题来自记忆写入、读取、权限、压缩还是下游生成。

## Canonical rules

> **The transcript is not the state.**

> **Short-term context does not automatically become long-term memory.**

> **Preserve provenance when compressing or materializing memory views.**

> **Memory writes and memory reads both require policy.**

> **Topic-scoped working state can be invalidated without deleting stable profile or authorization state.**
