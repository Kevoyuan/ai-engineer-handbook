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


## 7.10 Cross-session Memory：跨会话记住的不是“原句”，而是受治理的约束

一个常见面试问题：

~~~text
用户在第 3 轮说：
“预算不能超过 5000。”

第 30 轮，甚至下一次会话，
Agent 还能不能准确遵守？
~~~

不能只回答“把历史都塞进 Prompt”，也不能只回答“存到向量数据库”。

真正的问题是：

> **这条信息是什么类型、作用域是什么、是否值得持久化、以后什么时候应该召回、如果被用户修改又该如何失效？**

### 7.10.1 Transcript-only memory 为什么不可靠

把全部历史不断追加到 Prompt，至少会遇到：

~~~text
context growth
irrelevant history
position sensitivity
constraint dilution
token / latency cost
conflicting old statements
~~~

Lost in the Middle 研究表明，长上下文模型对信息位置并不总是等价利用：相关信息位于长输入中部时，任务表现可能明显下降。

但要注意：

> **Lost in the Middle explains one failure mode of long-context use; it is not the definition of cross-session memory failure.**

如果新会话根本没有 durable store / persisted state，早期约束甚至不会出现在新请求 Context 中，这不是 attention 问题，而是 memory lifecycle 根本不存在。

### 7.10.2 “三层记忆”是教学模型，不是统一框架标准

视频给出的：

~~~text
Working Memory
Short-term Memory
Long-term Memory
~~~

适合作为快速解释，但不同 runtime 的 taxonomy 并不一致。

例如 LangGraph 当前官方明确区分：

~~~text
Short-term memory
= thread-level state / persistence
= checkpointer

Long-term memory
= user-specific or application-specific data across conversations
= Store
~~~

Letta / MemGPT 系列则存在 persistent memory blocks、message/context state 与 archival memory；Mem0 又以 memory extraction、update / contradiction handling、semantic retrieval / graph memory 为主要机制。

因此 Handbook 不把“三层”当标准，而映射到已有六层结构：

| 视频术语 | Handbook 对应 |
|---|---|
| Working Memory | Session + Working State |
| Short-term Memory | Thread persistence + compressed conversation view |
| Long-term Memory | Structured Profile + Episodic + Semantic + Procedural |

> **Memory taxonomy is an engineering model. The stable boundary is lifecycle and scope, not the number of layers.**

### 7.10.3 “预算 ≤ 5000”先判断 Scope

同一句话可以代表完全不同的 memory semantics。

#### Case A · 当前任务约束

~~~text
“这次礼物采购预算不能超过 5000。”
~~~

更像：

~~~text
scope = current_task
durability = task lifetime
→ Working State
~~~

任务结束后通常不需要继续保存。

#### Case B · 当前项目的长期约束

~~~text
“Project Atlas 整个季度的广告预算不能超过 5000。”
~~~

可能是：

~~~text
scope = project:atlas
durability = until quarter end / explicit correction
→ durable project constraint
~~~

跨会话仍需要召回。

#### Case C · 用户稳定偏好

~~~text
“以后你帮我安排旅行时，单次预算都控制在 5000 以内。”
~~~

可能是：

~~~text
scope = user preference
durability = until user changes it
→ Structured Profile
~~~

所以：

> **The same sentence can belong to working state, project memory, or profile memory depending on scope and durability.**

### 7.10.4 Memory Write：不要直接把模型总结写进长期记忆

一个更可靠的写入链：

~~~text
Conversation / Tool Observation
        ↓
Candidate Memory Extraction
        ↓
Classify
  fact / preference / constraint / inference / event
        ↓
Resolve Scope
  task / thread / project / user / tenant
        ↓
Validate Durability
  temporary / stable / expires / unknown
        ↓
Normalize + Deduplicate
        ↓
Conflict / Supersession Check
        ↓
Permission + Sensitivity Gate
        ↓
Persist with provenance
~~~

建议长期 Memory 至少保存：

~~~text
memory_id
subject
predicate / type
value
scope
source_event_id
source_kind
  user_explicit
  tool_observed
  model_inferred
confidence
recorded_at
valid_from
valid_to
supersedes
status
sensitivity
owner
~~~

其中 source_kind 比简单的“事实 / 推断”二分类更实用。

例如：

~~~text
user_explicit
“预算不能超过 5000”
→ authoritative for that user's declared constraint

tool_observed
CRM says plan = enterprise
→ authoritative only if that system is current source of truth

model_inferred
“用户可能偏好低预算”
→ inference, not equivalent to an explicit constraint
~~~

> **An inferred memory must not silently acquire the authority of an explicit user instruction.**

### 7.10.5 Rolling Summary 是 Context View，不等于长期 Memory

滚动摘要很适合压缩 thread history：

~~~text
raw transcript
→ summarize stable decisions / unresolved items
→ compact thread view
→ continue conversation
~~~

但它仍有两个风险：

~~~text
summary omission
summary drift
~~~

因此：

~~~text
summary
≠ source of truth
~~~

更稳的设计是：

~~~text
Event Log / raw evidence
        ↓
Structured State + Durable Memory
        ↓
Summary / Compact View
        ↓
Prompt Context
~~~

摘要是可重建的 Materialized View；关键约束应有结构化字段和 provenance，而不是只存在某段自然语言摘要里。

### 7.10.6 Memory Read：按当前 Decision 检索，不是“搜相似句子”

跨会话召回应先确定当前问题需要哪类记忆：

~~~text
Current Turn
→ Intent / Task / State
→ Memory Route
~~~

例如：

~~~text
output style request
→ Profile Memory

current project budget
→ project-scoped constraint

“上次发生了什么？”
→ Episodic Memory

“公司退款政策是什么？”
→ Semantic / Knowledge source

current retry / approval status
→ Working State
~~~

然后再做：

~~~text
scope filter
→ permission filter
→ validity filter
→ retrieve
→ rank
→ conflict resolve
→ context assemble
~~~

因此：

> **Memory retrieval is scoped evidence retrieval, not a global vector search over everything the Agent has ever seen.**

向量搜索只是某些 Memory 类型的 retrieval mechanism，不是 Memory Architecture 本身。

### 7.10.7 Conflict Resolution：时间戳不够

视频提出“按时间戳和来源可信度仲裁”，方向是对的，但生产系统不能只用：

~~~text
newer wins
~~~

因为：

~~~text
a newer inference
should not override
an explicit authoritative policy
~~~

冲突可以综合：

~~~text
scope specificity
explicit correction
source authority
valid time
recorded time
confidence
business source-of-truth
permission / ownership
~~~

例如：

~~~text
M1
user_explicit
Project Atlas budget <= 5000
valid_from = 2026-09-01

M2
model_inferred
User probably accepts 8000
recorded_at = 2026-09-20
~~~

M2 虽然更新，但不应该覆盖 M1。

如果用户后来明确说：

~~~text
“Atlas 预算改成 7000。”
~~~

则应：

~~~text
create new memory/event
→ mark old constraint superseded / expired
→ preserve lineage
~~~

而不是直接删掉历史事实。

> **Correction should create a new authoritative version, not erase provenance.**

### 7.10.8 Cross-session Architecture

一个可操作的架构：

~~~text
                    NEW TURN
                       │
                       ▼
                Thread / Working State
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
     Context Compression      Memory Read Router
                                   │
                  ┌────────────────┼─────────────────┐
                  ▼                ▼                 ▼
             Profile Store    Episodic Store    Semantic / Project
                  └────────────────┼─────────────────┘
                                   ▼
                         Conflict / Validity Gate
                                   ▼
                         Prompt Context Builder
                                   ▼
                               Model / Agent
                                   │
                                   ▼
                         Candidate Memory Write
                                   │
                         Promotion / Policy Gate
                                   └──────────────↺
~~~

核心不是“存得更多”，而是：

~~~text
write selectively
read selectively
expire explicitly
correct with lineage
~~~

### 7.10.9 Letta / Mem0 / LangGraph 分别说明什么

这些系统不代表统一标准，但可以说明不同设计重点。

#### LangGraph

官方把 thread-level short-term memory 与 cross-conversation long-term memory 明确分开：前者通过 checkpointer / graph state 持久化，后者通过 Store 等长期存储跨 conversation 使用。

这验证了：

> **Thread persistence and cross-thread memory are different lifecycles.**

#### Letta / MemGPT lineage

Letta 当前文档中，memory blocks 是持久、可编辑、可以长期附着在 Agent Context 中的结构；archival memory 则可以通过搜索按需召回。

这说明长期记忆不必只有“Vector DB Top-K”，还可以区分：

~~~text
always-visible durable state
vs
retrievable archival state
~~~

#### Mem0

Mem0 当前文档强调 memory extraction、store、update / contradiction handling、semantic / graph retrieval，并支持按 user / agent / run 等维度组织记忆。

它说明：

> **The hard part of memory is not persistence alone; it is lifecycle management around persistence.**

### 7.10.10 Eval：怎么证明第 30 轮真的“记住了”

不要只做一个 Demo 问：

~~~text
“你还记得我预算多少吗？”
~~~

至少要测：

| Slice | Example |
|---|---|
| Delayed recall | 第 3 轮约束，第 30 轮任务仍遵守 |
| Cross-session recall | 新 Thread 中正确召回 project/user durable memory |
| Scope isolation | Project A 的预算不污染 Project B |
| Correction | 5000 → 7000 后新值生效，旧值保留 lineage 但不再执行 |
| Inference vs explicit | 模型推断不能覆盖用户显式约束 |
| No-recall | 当前任务不需要的偏好不进入 Context |
| Compression | 摘要后关键 constraint 不丢失 |
| Unauthorized read | 无权限用户无法看到其他 user / tenant memory |
| Stale memory | 已过 valid_to 的约束不再应用 |

指标可以包括：

~~~text
constraint adherence
cross-session recall accuracy
scope leakage rate
stale-memory application rate
correction propagation accuracy
memory precision
memory recall
unnecessary-memory injection rate
context tokens / turn
~~~

> **A memory system is good when it recalls the right durable fact at the right decision and ignores the rest.**

### 7.10.11 面试回答模板

如果面试官问：

> “Agent 能不能跨会话记住第三轮说的预算不能超过 5000？”

可以回答：

> 能不能记住，首先取决于这条信息是不是被定义成 durable memory，而不是聊天窗口够不够长。如果它只是当前任务约束，我会放在 Working State；如果它是项目或用户跨会话仍有效的硬约束，就通过 Memory Write Pipeline 做类型、scope、有效期和 provenance 判断后晋升到长期存储。下一次会话不会全量加载历史，而是根据当前 task / project / user scope 做 Memory Routing，先做权限和有效性过滤，再召回相关约束。用户后来把 5000 改成 7000 时，不是简单按最新时间戳覆盖，而是记录新的 authoritative version，让旧值 superseded，同时保留 lineage。长对话摘要可以减少 Context，但关键约束不能只存在自然语言 summary 中。LangGraph 可以用 checkpointer 保存 thread state、用 Store 保存跨 thread memory；Letta 和 Mem0 则展示了 persistent blocks、archival retrieval、memory update / contradiction handling 等不同实现。核心不是 Vector DB，而是 write、read、conflict、scope 和 lifecycle governance。

### 7.10.12 Source boundary

Primary source:

- 用户提供的视频总结：Agent 跨会话记忆、“预算不能超过 5000”、三层记忆、写入治理、冲突处理，以及 MemGPT / Mem0 示例。

Source-derived ideas retained:

- 不应依赖无限 transcript 堆叠；
- Working / Short-term / Long-term 的分层思路；
- Rolling summary 用于长会话压缩；
- 长期记忆按需召回；
- 事实/推断、来源、时间和冲突治理很重要；
- 跨会话记忆适合用户偏好、项目事实与长期约束。

Handbook corrections / synthesis:

- “三层记忆”定义为教学抽象，不宣称是框架统一标准；
- Lost in the Middle 只解释 long-context positional sensitivity，不等价于所有跨会话遗忘；
- 把“事实 vs 推断”扩成 user_explicit / tool_observed / model_inferred 等 provenance class；
- 冲突仲裁不能只按 timestamp，需要结合 scope、explicit correction、source authority 与 valid time；
- Vector DB 只是 retrieval backend，不是 Memory Architecture；
- Rolling Summary 是可重建 Context View，不应成为关键约束的唯一 source of truth；
- 增加 project / task / user scope，以及 no-recall / stale / unauthorized 等 Eval slices。

External verification:

- LangGraph official memory docs: short-term memory is thread-level state/persistence; long-term memory stores user/application data across conversations.
- Letta docs: persistent memory blocks can remain attached to agents, while archival memory supports searchable persistent passages.
- Mem0 docs: persistent user memory includes extraction, update/contradiction handling, semantic search, and optional graph memory.
- Liu et al., Lost in the Middle: long-context performance varies with the position of relevant information.

Sources:

- https://docs.langchain.com/oss/python/langgraph/add-memory
- https://docs.letta.com/
- https://docs.mem0.ai/platform/quickstart
- https://docs.mem0.ai/features/contextual-add
- https://arxiv.org/abs/2307.03172

## Canonical rules

> **The transcript is not the state.**

> **Short-term context does not automatically become long-term memory.**

> **Preserve provenance when compressing or materializing memory views.**

> **Memory writes and memory reads both require policy.**

> **Topic-scoped working state can be invalidated without deleting stable profile or authorization state.**

> **The same statement may require different memory lifetimes depending on task, project, user, or tenant scope.**

> **Correction should supersede a memory with lineage; newer does not automatically mean more authoritative.**
