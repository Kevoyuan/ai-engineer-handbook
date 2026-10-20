# Chapter 07 · Memory、State 与 Context Engineering
## Memory, State, and Context Engineering

> Canonical semantic chapter.

Memory 不是“把聊天记录永久保存”。可靠设计必须区分生命周期、语义类型、读写策略、权限与版本。

## 7.1 六层 Memory Structure

### 1. Session Metadata

```text
conversation_id · user_id · tenant_id · locale · current_task · permissions
```

这里保存的是单次请求/会话的上下文引用；user_id / tenant_id 对应的身份本身可以长期存在。权限必须来自可信授权系统并按需重新校验，不能由模型写入的 Memory 授予。

### 2. Working Memory

```text
current plan · intermediate results · open questions · tool outputs
```

面向当前任务，任务结束可以过期。

### 3. Structured Profile

```text
language preference · role · approved tools · report format
```

保存稳定、显式维护的偏好与配置。`approved tools` 若作为视图保存，只能引用授权系统的状态，不能作为独立授权依据。

### 4. Episodic Memory

记录“发生过什么”：user asked X、system did Y、result Z、feedback ±。它更像 Event Log，需要 provenance。

### 5. Semantic Memory

组织/项目事实、定义、政策等稳定知识。

### 6. Procedural Memory

“How to perform task X”、validated workflow、repair strategy 等可复用过程。

短期层（Session / Working）可以随会话快速流动；长期层（Profile / Episodic / Semantic / Procedural）不应让模型自由写入，必须进入受控 Write Pipeline。

> **Memory is a governed storage and retrieval system, not a longer prompt.**

## 7.2 Ledger + Views + Policy

Append-only Event Log + Materialized View 是本手册建议的一种审计设计，不是所有 Memory 系统的必要实现。正常纠正通过新事件表达，当前 Profile / State 可从日志派生；敏感内容仍需支持保留期限、删除、脱敏和派生缓存失效，append-only 不意味着永久保存原始个人数据。

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

Letta V1 SDK / MemGPT lineage 存在 persistent memory blocks、message/context state 与 archival memory；Mem0 又以 memory extraction、update / contradiction handling、semantic retrieval / graph memory 为主要机制。

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

Letta V1 SDK 文档中，memory blocks 是持久、可编辑、可以长期附着在 Agent Context 中的结构；archival memory 则可以通过搜索按需召回。

当前 [Agent SDK memory](https://docs.letta.com/agent-sdk/memory) 则使用 agent-owned Git repository / MemFS：初始化记忆成为 `system/` 下的 Markdown 文件，其他文件按需读取，编辑经 commit / push 后持久化。迁移时应按 SDK 版本核对存储与提交语义。

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
- Letta V1 SDK docs: persistent memory blocks can remain attached to agents, while archival memory supports searchable persistent passages.
- Mem0 docs: persistent user memory includes extraction, update/contradiction handling, semantic search, and optional graph memory.
- Liu et al., Lost in the Middle: long-context performance varies with the position of relevant information.

Sources:

- https://docs.langchain.com/oss/python/langgraph/add-memory
- https://docs.letta.com/agent-sdk/memory
- https://docs.letta.com/v1-sdk/memory/memory-blocks
- https://docs.mem0.ai/platform/quickstart
- https://docs.mem0.ai/features/contextual-add
- https://arxiv.org/abs/2307.03172

## 7.11 Enterprise Knowledge Context：企业知识不是“再建一个向量库”

《AI Native 研发范式实践手册》把企业知识库定位成 Agent 基础设施，而不只是一次 RAG 检索：组织概念、规则、流程、案例、关系和边界需要形成可治理、可追溯、可更新的外部知识层。

一个更通用的抽象：

~~~text
Knowledge Sources
→ Organize
→ Process
→ Serve
→ Govern
→ Agent Context
~~~

### 7.11.1 四个作用

企业知识层至少承担四件事：

1. **Domain World Model**：把组织概念、规则、流程、案例、关系与边界组织起来，让 Agent 理解“这里的世界是什么”。
2. **Externalized Knowledge**：把需要更新、纠正、撤回、分级和授权的知识放在模型参数之外。
3. **Evidence + Constraint**：不仅回答“事实是什么”，还告诉 Agent 在什么条件下可以行动、依据什么行动、何时应停止或升级人工。
4. **Shared Auditable Memory**：不同 Agent / 系统基于同一套权威知识协作，并保留 provenance、version、owner 与 permission lineage。

> **Enterprise knowledge is governed context, not merely retrieved text.**

### 7.11.2 Knowledge Supply 不等于 RAG

面向当前任务，知识可以通过不同通道提供：

~~~text
RAG
→ fuzzy / semantic document evidence

Structured Query / API
→ exact current business facts

Local File / Repo Search
→ project-scoped engineering context

Live Business System
→ current status / inventory / workflow state
~~~

选择依据是数据形状、时效性、权限、可验证性和失败语义，而不是统一把所有内容向量化。

### 7.11.3 Knowledge Lifecycle

一个企业知识资产应至少回答：

~~~text
what is it?
where did it come from?
who owns it?
who may read it?
which version is current?
when does it expire?
what supersedes it?
which other knowledge depends on it?
~~~

因此可以建立：

~~~text
Raw Source
→ normalize / classify / relate
→ provenance + owner + validity
→ index / API / file bundle
→ permission-aware retrieval
→ usage feedback
→ correction / supersede / retire
~~~

这与本章已有 Memory Ledger 原则一致：关键事实不能只有“相似度”，还需要来源、版本、有效期和纠错关系。

### 7.11.4 OKF：一个实现例，不是企业知识的唯一格式

手册引用 Open Knowledge Format（OKF）作为一种人和 Agent 都可读取的知识组织方式。当前 OKF 公开规范仍是 draft；它使用 Markdown + YAML frontmatter + index 组织 typed knowledge bundle，强调 git-friendly 和 agent-readable。

这说明一种可复用方向：

> **Agent-facing knowledge should be inspectable and versionable by humans as well as consumable by machines.**

但企业知识治理并不依赖 OKF；数据库、知识图谱、数据目录、RAG index、API 与文件 bundle 都可以是实现载体。

### 7.11.5 Source boundary · AI Native Enterprise Knowledge

Primary source:

- 《AI Native 研发范式实践手册》3.1.2“企业知识库”。

Source-derived ideas retained:

- 企业知识帮助 Agent 形成领域世界模型；
- 知识应从模型参数中外置，以便更新、纠正、撤回、分级和授权；
- 企业知识可以为行动提供证据与约束；
- 知识治理需要版本、责任、权限、安全边界和使用反馈；
- 知识供给可以通过 RAG、API / 结构化查询、本地文件检索或实时系统完成。

Handbook synthesis:

- 将“企业知识库”提升为 governed context layer，不限定为某种存储产品；
- 与 Memory Ledger / Provenance / Correction 统一；
- 将 retrieval mechanism 与 knowledge governance 分离；
- OKF 只作为可读、可版本化知识 bundle 的实现例，不作为唯一标准。

External verification date: 2026-09-30.

Sources:

- https://okf.md/
- https://okf.md/spec/


## Canonical rules

> **The transcript is not the state.**

> **Short-term context does not automatically become long-term memory.**

> **Preserve provenance when compressing or materializing memory views.**

> **Memory writes and memory reads both require policy.**

> **Topic-scoped working state can be invalidated without deleting stable profile or authorization state.**

> **The same statement may require different memory lifetimes depending on task, project, user, or tenant scope.**

> **Correction should supersede a memory with lineage; newer does not automatically mean more authoritative.**


## Verification boundary · 2026-09-28

六层记忆是本手册 taxonomy。身份/权限来源于可信安全上下文；Memory 不授予权限。Append-only 不等于永久保留敏感内容；纠正、删除、保留期限和派生视图失效都需单独设计。

核对依据：[LangGraph memory](https://docs.langchain.com/oss/python/langgraph/add-memory)。完整范围、逐节结论与未验证项见 [本次审计](../verification/2026-09-28.md)。


## 7.12 FDE Context Window Management for Agents: budget without losing obligations (Q47)

> **Semantic audit:** CH07 already explains context compression, read/write budgets and memory (§7.4, §7.7); the public FDE title did not literally occur. This adds an explicit testable decision rule, **not a claim that context management was absent**.

### Q47 · 128k context window 就不用做 context engineering 了吗？

No. Max tokens is a **capacity limit**, not a guarantee of retrieval quality, instruction priority or cost-effective use. A practical host separates:

| Context category | Retain / drop policy | Can it be summarized? |
|---|---|---|
| Signed policy, trusted caller/tenant | trusted state outside generated prompt; attach authorized minimum | **Never** allow model summary to change identity or rights |
| Current user task and protected exact entities | pin task ID, negation, order ID, deadlines | only after invariants verified |
| Tool observations and cited evidence | provenance ID + version + source timestamp | summarize with reversible evidence pointers |
| Chat history and optional examples | recency/relevance budgeting | yes, but validate fidelity and injection risk |
| Memory learned from prior runs | explicit promotion rules and TTL | yes, after access scope and consent checks |

~~~~text
total_context_budget
  = protected instructions + task + tool schemas
  + authorized evidence + bounded history + response reserve

if exhausted: omit low-value history → compact with provenance
→ reretrieve authorized evidence → ask for clarification / abstain
~~~~

**Failure drill:** after several turns, user says “Actually order 43, NOT order 42.” Compression mistakenly retains 42. Tests must assert the new exact ID and negation survive, no previously authorized-but-now-revoked document persists in carried context, and essential evidence IDs remain verifiable.

**Operational metrics:** overflow/refusal rate, context tokens per approved success, evidence citation retention, correction fidelity, p95 end-to-end latency and unauthorized-context rate. Large windows may lower routing complexity for small tasks, but do not fix stale document ACLs or non-relevant retrieved material.

**Source/ownership:** CH01 §1.4 covers context capacity and lost-in-middle. CH07 §7.4/7.7 owns compression/memory policy. CH02 §2.8 owns index freshness. This is design synthesis to the public FDE topic, not a proprietary solution or quantitative benchmark.


## 7.13 Agent Context Budget：Compaction、Offloading 与 Prefix Cache 的共同优化

面试问题：

> “Agent 跑着跑着，Context 快撑满了，你怎么办？”

只回答“做 summarize”不够；只回答“把记录写到文件”也不够。Context Engineering 需要同时管理 **容量、信息保真、可恢复性、Prefix Cache 复用、延迟和总成本**。

### 7.13.1 三种不同预算

~~~text
Capacity Budget
→ 当前请求还能容纳多少 model-visible tokens？

Fidelity / Evidence Budget
→ 哪些事实、约束、决策理由必须无损保留或可恢复？

Cache / Compute Budget
→ 哪一段稳定前缀可以复用已计算的 KV？
~~~

其中：

~~~text
cached prompt tokens
still occupy context-window capacity
~~~

Prompt Caching 降低重复 Prefill 的价格和延迟，但不会把命中缓存的 tokens 从模型 Context Window 的长度限制中扣除。

> **A cache hit reduces repeated computation; it does not create extra context capacity.**

### 7.13.2 Compaction vs Offloading：不是二选一

| 维度 | Compaction / Summary | Offloading / Externalization |
|---|---|---|
| 操作 | 把较旧历史转成更短的 active context view | 原始 tool result、artifact、trace 或文档移到外部存储 |
| 目的 | 降低下一轮实际输入 tokens，维持任务连续性 | 不让低频、大体积原始材料常驻 Context |
| 信息保真 | 摘要可能遗漏隐性约束、否定或决策理由 | 原始证据可以保留，但未来能否召回取决于索引、权限、版本与生命周期 |
| Prefix Cache | 改写发生位置之后的 token 前缀匹配会变化；更早的稳定段仍可能命中 | 稳定 Prompt 可不变；但重新读取外部材料也会形成新的 suffix |
| 主要成本 | 摘要生成、后续缓存写入、摘要漂移风险 | 存储、检索、I/O、重读后的 tokens、访问控制 |
| 适合 | 连续聊天、冗余长历史、接近窗口上限的任务 | 长日志、大文档、工具 stdout、需要核验的原始证据 |

二者可以组合：

~~~text
Raw Event / Tool History (durable + access-controlled)
               │
     ┌─────────┴─────────┐
     ▼                   ▼
Structured Working State  External Artifact Store
constraints / reasons     logs / files / tool outputs
     │                   │
     └─────────┬─────────┘
               ▼
       Context Assembler
               ▼
Stable Prefix + Compact View + Retrieved Evidence
               ▼
           Model / Agent
~~~

**压缩后的摘要不可从自身“逆向还原”完整历史。** 如果任务需要可回溯，应在摘要以外保存受权限与保留政策治理的原始记录、Artifact ID、版本与来源；这才是 operationally recoverable，而非数学意义上的可逆压缩。

> **Compact the model-visible view; do not confuse that view with the authoritative execution record.**

### 7.13.3 Prefix Cache：首次变化位置决定可复用区间

对于相同模型/配置下兼容的 Prompt：

~~~text
Before compaction

[ STABLE SYSTEM + TOOLS ][ TURN 1 … TURN 28 ][ TURN 29 ]
├──────── reusable prefix ────────────────────┘

After compaction

[ STABLE SYSTEM + TOOLS ][ NEW COMPACT SUMMARY ][ TURN 29 ]
├── still matching ──┘  └── new suffix ───────┘
~~~

若首次不同 token 出现在 Summary 开头，旧的 Conversation Tail 便不能按原前缀继续命中；**这不表示 stable system/tool prefix 自动失效**。缓存系统按模型/厂商的有效断点、最小长度、TTL 与路由策略匹配最长可复用前缀，不保证任意前缀都能被缓存。

Anthropic 官方 Compaction 文档甚至明确建议：给稳定 System Prompt 单独设置 cache breakpoint，使 Compaction 重写 conversation 后，System Prefix 仍有机会独立命中。

易错说法：

~~~text
"一旦 summarize，之后所有请求的 cache 都失效"
→ too absolute
~~~

更准确：

> **Compaction breaks reuse from the earliest rewritten prefix position, subject to cache breakpoints, TTL, model compatibility and provider behavior.**

Prompt / Tool Schema 顺序、模型、推理配置和其他影响渲染前缀的设置也可能导致匹配变化。不应为“命中缓存”而把租户授权、会话新事实或动态安全策略固定在不可更新的缓存内容中。

**滑动窗口并不天然保住旧历史的前缀缓存。** 从 `[System][A][B][C]` 变成 `[System][B][C][D]` 时，首次变化就在 System 后；`B/C` 的相对顺序虽未变，它们也不是旧输入从起点延伸的相同前缀。System 段是否可复用仍受服务商规则约束。这里讨论请求级 Prefix Caching，不等同于某个推理引擎内部的 sliding-window attention / KV eviction。

同样，外部记忆召回或 Rerank 改变动态证据 suffix，并不必然使前面的稳定指令全部失效；应测实际 cache read、未缓存输入与任务质量，而非按“摘要/截断/检索”的名称断言命中率。

### 7.13.4 TTL 与价格：0.1× 不等于整体调用成本 0.1×

按 2026-10-13 的官方公开说明，Anthropic 的常见 Prompt Cache 定价倍率为：

~~~text
Uncached input     1.00× base input rate
5-minute write     1.25× base input rate
1-hour write       2.00× base input rate
Cache read         commonly 0.10× base input rate
~~~

某些具体模型的 read multiplier 不同。5 分钟是通常的默认 TTL，并存在一小时选项；TTL / 兼容模式和计费应以调用时的模型与供应商文档为准。

**这些是对应 token 类别的价格倍率，不是完整请求价格，也不是 TTFT 保证。**

可测量的近似核算：

~~~text
C_request =
    uncached_input_tokens × input_rate
  + cache_write_tokens   × write_rate
  + cache_read_tokens    × read_rate
  + output_tokens        × output_rate
  + model / tool / storage / retrieval costs

C_successful_task =
    sum(all attempts, compaction and recovery costs)
    / successful_task_count
~~~

比较两种候选策略时，应在同一任务与成功质量约束下计算未来多轮总成本：

~~~text
Strategy A
→ compact immediately
→ shorter future prompts
→ possibly lower prefix reuse
→ extra summary/write cost

Strategy B
→ externalize low-value bulk
→ stable prefix reused
→ retrieval cost when evidence is needed
→ possibly longer retained constraints
~~~

因此不能只看：

~~~text
tokens removed
cache hit ratio
one-request TTFT
~~~

而应同时测：剩余任务轮数、缓存生命周期、summary 频率、re-read 次数、任务成功率和恢复重试代价。

### 7.13.5 面试“三问”：信息价值与缓存位置

**Q1 · 之后是否会被反复使用？**

不要直接得出“反复使用就一律不压缩”。先分清：

~~~text
small, durable, decision-critical fact
→ preserve as structured working state
→ perhaps pin a compact exact representation

large evidence repeatedly queried by reference
→ persist externally + keep ID / index
→ fetch exact slices when needed

long redundant chat repeatedly revisited
→ compaction can still be useful
→ keep fidelity tests and original evidence
~~~

**Q2 · 它是决策依据还是低价值流水账？**

~~~text
decision rationale / confirmed constraints / active plan
→ preserve exact meaning, provenance, supersession and version

giant stdout / full stack trace / temporary observation
→ offload original + short pointer / excerpt

failed attempts
→ may still matter when preventing repeated mistakes
→ preserve concise failure signature / chosen recovery
~~~

失败记录不总是可以随意删；重要的是保留**失败教训与不可重复条件**，而非全量噪声。

**Q3 · 它在 Prompt 里是稳定前缀还是动态尾部？**

~~~text
system / stable tool schemas / reusable instructions
→ place in stable ordered prefix
→ use supported cache breakpoints

current task / user correction / retrieved evidence
→ append in dynamic suffix

tenant / policy / entitlement
→ resolve from trusted up-to-date runtime
→ no stale permission reuse
~~~

由此得到选择规则：

> **Preserve decision-critical state, externalize bulky evidence, stabilize cacheable instructions, and compact replaceable history when the quality/cost balance justifies it.**

### 7.13.6 四条落地手段

**1. Tool output rightsizing**

~~~text
Shell / Search / API returns 20,000 lines
→ write raw output to versioned artifact
→ return artifact_id + path + bounded excerpt + status
→ later read relevant slice when necessary
~~~

应保存来源、时间、权限、checksum/version；路径本身不代表模型有权读取，更不代表报告一定正确。输出里可能包含 secret / prompt injection，应过滤敏感信息并隔离信任级别。

**2. Stable Prefix Layout**

~~~text
Stable: system instructions + consistent tool definitions
---
Dynamic: current task + retrieved material + new messages
~~~

固定只应固定真正稳定的部分。不要因为优化缓存而拒绝必要的工具版本、安全策略或授权更新。

**3. Sub-agent Context Isolation**

~~~text
Main agent
→ delegate bounded task + acceptance criteria
    → subagent handles verbose scratch/tool history
    → stores artifacts / citations
    → returns validated result + references
→ main agent merges result into structured state
~~~

Sub-agent 隔离不代表“免费减少 tokens”；新增的模型调用、并发、校验、失败重试和额外 cache scope 都可能增加成本。主 Agent 不应只拿一个不可验证的“已完成”。

**4. Compaction with Snapshot / Provenance**

~~~text
capture raw transcript / checkpoint under retention policy
→ extract invariants + decision rationale + open items
→ compact active view
→ validate constraints / exact IDs / negative conditions
→ continue
→ retrieve original source only when needed
~~~

Snapshot 要权限受控、具备生命周期；摘要不是事实源。服务端 Compaction 若提供专用 compaction block，应按 API 协议完整回传，不能只保留可见文字。

### 7.13.7 Production State：先降噪，后压缩，必要时重新分配任务

一个不依赖厂商的阈值触发器：

~~~text
if input_budget_near_limit:
    protect current task + verified constraints
    detect oversized tool outputs
    externalize / trim low-value bulk
    preserve raw evidence pointers
    consider safe bounded subtask isolation
    if still above threshold:
        snapshot + compact
        validate state invariants
    reassemble only needed evidence
    ensure response/output headroom
~~~

除了触发阈值，还要留出最大工具返回、下一轮输入和预计输出的 headroom，避免某个工具突然返回超大内容时再来不及压缩。

可用一个保守的、按具体 API 计数规则校验的请求准入预算表达这种约束：

~~~text
assembled_input_tokens + reserved_output_tokens + safety_margin
    <= model_context_limit

before next tool result / user turn:
    reserve bounded incoming payload or truncate/offload it before assembly
~~~

`assembled_input_tokens` 包括实际会发送的 system、tools、消息、检索结果和模型可见的摘要；不要再把已经包含的工具结果重复计算。输出/思考 token、隐藏封装开销及独立输入/输出上限应按模型/API 检查；有条件时使用其 token counting 接口。原文的“75%～80% 预警、100% 再截断”不是通用安全线：应在发请求前拒绝或重组超预算输入，并为压缩操作本身预留空间。

裁剪时还应保留 provider 要求的消息结构：不要留下无配对的 tool result，或删掉仍在使用的 tool call；保留当前目标、精确 ID、否定约束与证据指针。若仍无法安全装配，就暂停、缩小任务或请求用户选择，不能静默删除关键约束继续执行。这是本手册的工程建议，具体消息配对规则取决于所用协议。

缓存 TTL 不应成为牺牲任务正确性或跳过必须重新授权的理由。

### 7.13.8 Eval：怎么证明“更省”且没忘东西

| Dimension | Example measurement |
|---|---|
| Capacity | live context occupancy; overflow / refusal rate |
| Quality | constraint retention; exact ID/negation fidelity; plan consistency |
| Evidence | provenance recovery success; artifact retrieval precision |
| Prefix Cache | read/write/uncached tokens; effective hit ratio; invalidation frequency |
| Cost | summed input, cached-input, write, output, summary, retrieval and retry costs |
| Latency | TTFT P50/P95; end-to-end success latency |
| Reliability | recovery success; duplicate work after compaction; authorization leakage |

至少做四种对照：

~~~text
A: Full transcript until overflow
B: Rolling compaction only
C: Offload + structured state
D: Offload + structured state + selective compaction + stable prefix
~~~

Eval slices：

~~~text
Turn 3: "订单是 43，不是 42"
Turn 30: confirm 43 and negative constraint still hold

Large tool output
→ check exact traceback still retrievable by artifact ID

Stable prefix + compacted tail
→ check cache-read token count before/after

Long subagent run
→ account for its tokens, latency and evidence quality
~~~

不能把缓存的 read/write tokens 误当作“Context Window 没占用”。也不能只报告输入 token 降低而忽略输出、摘要生成、重试与检索成本。

### 7.13.9 面试答题版

> 我不会上来就无限 Summarize，也不会全量把历史塞进外部向量库。Context Budget 要同时考虑窗口容量、信息保真和 Prefix Cache。我会先分三类：当前任务目标、精确 ID、否定条件和决策依据进入结构化 Working State；大体积日志和 Tool 输出存入受治理的 Artifact Store，只留指针、短摘要和必要 evidence；稳定 System Prompt 与 Tool Schema 放在前缀，动态检索和用户补充放在后面。窗口仍接近阈值时，再对可替代的历史做 Compaction，但保留原始证据并验证重要约束。Compaction 改写旧会话 Tail 后，旧 Tail 的 Prefix Cache 可能无法复用，但前面未变的 System / Tool Prefix 仍可能命中，所以不能说“压缩会永久打碎所有缓存”。Sub-agent 能隔离 verbose scratch，但新增调用也要计成本。最终用输入缓存 read/write、uncached tokens、TTFT、摘要/检索开销、证据保真和 cost per successful task 的 A/B Eval 决定策略。

最短记忆：

~~~text
Preserve decisions.
Offload bulk.
Stabilize prefix.
Compact selectively.
Measure total successful-task cost.
~~~

> **The best context policy is not the one that removes the most tokens; it is the one that preserves decision quality at the lowest total successful-task cost.**

### 7.13.10 Source boundary · Agent Context Budget

Primary user-supplied material:
- 视频文本《字节二面Agent上下文预算面试题完整解析》：Compaction vs Offloading、Prefix Cache、三问四招、面试追问。

Source-derived ideas retained:
- Context 逼近上限时 Compaction 与 Offloading 都可用；
- Prompt Prefix 稳定性影响 KV Prefix Cache；
- 决策依据应与大体积低价值流水账分开；
- Tool 输出落盘、静态内容前置、Sub-agent 隔离与压缩前保留原始快照；
- Token 节约要和 Prefill/缓存成本一起分析。

Handbook corrections / synthesis:
- 不采纳“压缩以后所有缓存全部失效”：保留变化位置之前、仍满足 provider 规则的 cacheable prefix；
- 不采纳“频繁复用的信息永远不能摘要”：区分小而关键的状态与大量可检索原始证据；
- 不采纳“流水账可随意删除”：错误签名、否定条件和 failure lesson 可能是 decision-critical；
- 不把 Summary 称为可逆压缩：可恢复性来自独立保存的原始记录；
- 不把 Offloading / Sub-agent 视为零成本；
- 将缓存价格倍率、TTL 与 server-side Compaction 标成模型/供应商/版本依赖；
- 明确 Cache Hit 并不增加 Model Context Window 容量；
- 通过 cost-per-successful-task + quality regression 选策略，而不看单轮 token 数。

External verification: 2026-10-13. Sources:
- Anthropic, Effective Context Engineering for AI Agents: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, Compaction overview / on-demand / threshold: https://platform.claude.com/docs/en/build-with-claude/compaction
- Anthropic, Context windows: https://platform.claude.com/docs/en/build-with-claude/context-windows
- Anthropic, Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Anthropic, Reducing cost and improving performance: https://claude.com/blog/reducing-cost-and-improving-performance-with-claude-platform
- OpenAI, Prompt caching: https://developers.openai.com/api/docs/guides/prompt-caching

Technical cross-reference: Chapter 10 §10.1–10.5 owns KV / Prefix Cache serving internals. Chapter 07 owns what to place in the context, what to externalize and when to compact.

2026-10-20 补充核对：[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 的相同前缀与变化 suffix 边界、[Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) 的输入/输出容量计数。新增用户笔记与已有本节高度重合；本轮只补充滑动窗口反例、预留容量与安全裁剪规则，未采纳“外部记忆让任务无限运行”“结构化摘要必然更少幻觉”“缓存必定省显存”等无实测保证的断言。详见 [处理记录](../verification/2026-10-20-inbox-rerank-context.md)。

### 7.13.11 按内容类型压缩与 Compaction Receipt

本节补充 §7.13.6 的输出裁剪与快照契约；上游 evidence selection 归 CH02/03，端到端对照实验归 §9.25。检索、压缩与精确前缀缓存仍是三个独立杠杆。

来源：[Headroom 新闻介绍](https://aiengineering.beehiiv.com/p/reduce-ai-agent-token-costs-by-95) 提供产品线索；实现限制以 [官方 README](https://github.com/headroomlabs-ai/headroom) 与 LIMITATIONS 为准。[Agentic Context Management 预印本](https://arxiv.org/abs/2607.21503) 提出管理上下文生命周期的思路，其自报 benchmark 不作为本手册的生产保证。

#### Headroom：按内容类型做有损压缩，保留原件恢复通道

~~~text
Tool outputs (JSON rows, logs, source code, prose)
           ↓
Guardrails: protected messages / active debugging context
           ↓
ContentRouter
  ├─ structured arrays → sampling + anomalies + dedup
  ├─ plain text        → content-dependent semantic compaction
  └─ code              → AST-aware only when safe; often passthrough
           ↓
Small evidence view + pointer to original (CCR / retrieval)
           ↓
LLM may request original when summary is insufficient
~~~

**实现版本修正（2026-10-08 核对项目 README / LIMITATIONS）**：新闻稿提到的 IntelligentContext 已在上游项目后续版本退役；当前 README 明确将 CacheAligner → ContentRouter → compressors 作为流水线，并指出 CacheAligner 标记易变内容以保护精确 prefix，不应写成“自动修改任何 Prompt 就会提高 cache hit”。配置、压缩器与保护逻辑会随项目版本变化，部署时必须固定版本验证。

[Headroom 官方限制文档](https://github.com/headroomlabs-ai/headroom/blob/main/wiki/LIMITATIONS.md) 给出的示例范围体现巨大类型差异：JSON 对象数组 86–100%、结构化日志 82–95%、纯文本文档约 43–46%，而某些代码及 RAG 文档上下文默认 passthrough；这些是**项目自报的分场景指标**，不是随机企业 Agent 的保证。该项目还保护近期代码和调试相关内容，以免删除正在排查的行与错误。

推荐的生产 Compaction Receipt：

~~~yaml
compaction:
  source_event_range: [start_event_id, end_event_id]
  input_context_hash: source_digest
  compact_view_version: v3
  preserved:
    - active_goal
    - confirmed_entities_with_source_ids
    - nonnegotiable_constraints
    - permission_and_scope_refs
    - unresolved_questions
    - critical_errors_and_tool_results
  recoverable_sources: [event_log_pointer, artifact_pointer]
  validation:
    constraint_recall: pass
    entity_and_number_checks: pass
    source_pointer_integrity: pass
    permission_scope_check: pass
  on_failure: retry_with_more_context_or_reopen_raw
~~~

Receipt 是**本手册建议的实现契约**，并非文章或 Headroom 固定 API。原则是关键事实和 provenance 仍可从受控原文重建；摘要既不是授权来源，也不能覆盖最新的可信系统状态。

**失败处理**：关键事实校验失败或原始指针不可恢复时，按当前权限重新打开原件或扩大上下文；不得以压缩率代替正确性与授权检查。
