# Chapter 08 Supplement · LangChain vs LangGraph
## 不是“Chain vs Graph”，而是高层 Agent Framework vs 低层 Stateful Orchestration

> Verified against current official LangChain / LangGraph docs and reference pages on 2026-09-17.

很多回答会把两者概括成：

```text
LangChain = 线性链式调用
LangGraph = 复杂 Agent / 图编排
```

这个说法抓住了一部分历史直觉，但对当前版本已经过度简化。今天更准确的关系是：

```text
LangChain
= higher-level agent/application framework
+ standard component interfaces
+ integrations
+ prebuilt agent architecture

LangGraph
= lower-level orchestration runtime
+ explicit state
+ graph control flow
+ persistence / checkpoints
+ durable execution
+ human-in-the-loop
```

更关键的是：**当前 LangChain 的 `create_agent()` 本身建立在 LangGraph 之上，并返回一个 `CompiledStateGraph`。**

因此真正的问题不是“我要 LangChain 还是 LangGraph 二选一”，而是：

> **我需要使用多高层的抽象，以及需要掌握多少控制流、状态、恢复和持久化细节。**

---

## 1. 为什么两者会同时存在

一个真实 Agent 通常不是一次 LLM 调用：

```text
User Request
→ Understand task
→ Retrieve / Query DB
→ Analyze result
→ Decide whether evidence is sufficient
→ Maybe query again
→ Generate output
→ Validate
→ Finish
```

中间还可能出现：

```text
SQL error
→ repair SQL
→ retry

insufficient evidence
→ retrieve more

high-risk action
→ pause for approval

process crash
→ resume from persisted state
```

这类系统至少有两个不同层次的问题：

1. **Capability / component layer**：Model、Prompt、Retriever、Tool、Output Schema、Middleware 等能力怎么统一调用、替换和组合？
2. **Orchestration / runtime layer**：当前状态是什么？下一步执行谁？能否分支、循环、并行、暂停、恢复？

LangChain 更偏第一层和高层 Agent API；LangGraph 更偏第二层。

---

## 2. LangChain：组件抽象 + 高层 Agent API

### 2.1 `langchain-core` 的核心是统一接口

官方 reference 将 `langchain-core` 定义为 LangChain 生态的基础抽象层，包含 Chat Model、LLM、Vector Store、Retriever 等核心接口，也包含统一的 `Runnable` invocation protocol。

一个 `Runnable` 是可执行工作单元，支持：

```text
invoke / ainvoke
batch / abatch
stream / astream
composition
```

典型组合：

```python
chain = prompt | model | parser
result = chain.invoke(input)
```

这里的价值不是 `|` 这个语法本身，而是：

```text
stable interface
→ composability
→ replaceability
→ streaming / async / batch semantics
→ tracing-friendly execution
```

### 2.2 LangChain 不只会“线性 Chain”

`Runnable` 体系本身就有：

```text
RunnableSequence
RunnableParallel
RunnableBranch / routing
retry / fallback
streaming
```

所以“LangChain 只能 A → B → C”是不准确的。

当前 LangChain 还提供高层 `create_agent()`：它可以运行 Model ↔ Tool loop、middleware、structured output、checkpointer、store、interrupt 等能力。

官方 reference 明确显示：

```text
create_agent(...) -> CompiledStateGraph
```

并描述了它的基本执行循环：

```text
Model Node
→ tool_calls?
   ├─ yes → Tool Node → append ToolMessage → Model Node
   └─ no  → finish
```

也就是说，当前 LangChain 的“标准 Agent”本身就是一个预构建的 LangGraph graph。

> **LangChain is not the opposite of LangGraph; its high-level agent API is implemented on top of LangGraph.**

---

## 3. LangGraph：显式 Stateful Orchestration

LangGraph 官方把自己定义为 **low-level orchestration framework for long-running, stateful agents**。

它真正暴露给工程师的是 Agent runtime 的几个核心概念。

### 3.1 State

`StateGraph` 的定义是：节点通过读取和写入共享 State 来通信。

Node 的核心签名可以理解为：

```text
State → Partial<State>
```

Node 不需要返回整个新 State，只返回 State Patch；runtime 再根据每个 State Key 的 reducer 合并更新。

例如：

```python
class State(TypedDict):
    question: str
    sql: str
    rows: list[dict]
    attempts: int
    approved: bool
```

节点可以只更新：

```python
return {"sql": generated_sql, "attempts": state["attempts"] + 1}
```

因此共享 State 更像一张**受 schema 和 reducer 约束的任务状态表**，而不是把所有变量塞进一个 Prompt。

### 3.2 Node

Node 是具体工作单元，可以是：

```text
LLM call
Retriever
SQL executor
deterministic validation
policy gate
human approval
subgraph
agent loop
```

> **A LangGraph node does not have to be an Agent.**

这和 Chapter 08 的 Loop vs Graph 原则一致：Graph 定义的是控制拓扑，不要求每个 Node 都具备自治推理能力。

### 3.3 Edge

普通 Edge 表示确定性流转：

```text
A → B
```

Conditional Edge 则读取当前 State，再决定下一节点：

```text
Execute SQL
→ route(state)
   ├─ sql_error      → Repair SQL
   ├─ insufficient   → Generate More Query
   └─ sufficient     → Analyze
```

因此 if/else、retry loop、termination rule 都可以成为显式控制结构。

### 3.4 Compile

`StateGraph` 本身是 Builder，不能直接执行；必须先 `compile()` 成 `CompiledStateGraph`。

编译后的 Graph 实现 `Runnable` interface，因此同样可以：

```text
invoke
stream
batch
async
```

这里也说明 LangChain 与 LangGraph 不是两套互斥 runtime 世界；它们共享 Runnable 生态边界。

---

## 4. 底层运行：不要只说“Node + Edge”

如果面试官继续问“Graph 到底怎么跑”，更有区分度的答案是：

```text
Graph Definition
→ compile
→ runtime receives input state
→ schedule runnable nodes
→ execute current super-step
→ collect state patches
→ reducers merge state
→ evaluate outgoing edges / commands
→ schedule next tasks
→ checkpoint state
→ continue until END / interrupt / failure
```

### 4.1 Super-step

官方 Checkpointer 文档把一次 graph tick 称为 **super-step**：当前这一 step 被调度的节点会执行，可能并行，然后 runtime 在 step boundary 形成新的 checkpoint。

简单顺序图：

```text
START → A → B → END
```

会经历多个 super-step，而不是“一次函数调用直接跑到底”。

对于 fan-out：

```text
       → B ─┐
A ─────     ├→ D
       → C ─┘
```

B/C 可以位于同一 super-step 并行执行，再通过 reducer / join 形成后续 State。

### 4.2 Reducer

如果多个 Node 同时更新同一个 State Key，必须定义怎么合并。

抽象成：

```text
(old_value, new_value) → merged_value
```

例如 append message/list，而不是 last-write-wins 覆盖。

所以真正理解 StateGraph，不能只记 Node/Edge，还要理解：

```text
State Schema
+ State Patch
+ Reducer
+ Scheduler
```

---

## 5. Checkpoint：不是“保存聊天记录”这么简单

官方文档说明 Checkpointer 会在每个 super-step 保存 Graph State Snapshot，并按 Thread 组织。

启用 persistence 后：

```text
thread_id
→ checkpoint history
→ state snapshot
→ pending / next tasks
```

调用带 checkpointer 的 graph 时，通常需要指定：

```python
config={"configurable": {"thread_id": "session-123"}}
```

### Checkpoint 能带来什么

```text
durable execution
interrupt / resume
human-in-the-loop
time-travel debugging
fault-tolerant execution
conversation state persistence
```

### 一个重要精度修正

“程序崩了以后从第五步原地继续”只是直觉说法。

更准确地说，恢复依赖 **checkpoint / super-step boundary**。官方文档还说明，在一个 super-step 内，如果部分并行 Node 已完成而另一个失败，成功 Node 的 pending writes 可以保存，恢复时不一定需要重跑已成功任务。

> **Resume semantics are checkpoint semantics, not arbitrary instruction-pointer semantics.**

这也是为什么有副作用的 Tool 仍需要 idempotency / reconciliation；Checkpoint 本身不能神奇地撤销已经发生的外部 Side Effect。

---

## 6. Human-in-the-loop 为什么和 Graph 很契合

高风险工作流通常不是：

```text
LLM decides → execute immediately
```

而是：

```text
Generate action
→ Validate
→ Interrupt
→ Human inspect / edit state
→ Approve / reject
→ Resume
```

因为 State 已持久化，所以 Human Review 不是“另外发一条消息重新跑一遍”，而是对同一个运行实例的显式控制边界。

典型场景：

```text
DELETE / UPDATE database
financial transaction
external email send
production deployment
permission-sensitive tool
```

这与 Chapter 06 的 Tool Authorization 原则一致：

> **The model proposes; the host executes.**

LangGraph 解决的是如何把这个 permission / approval boundary 放进可暂停、可恢复的 runtime topology。

---

## 7. 一个 SQL 分析 Agent，分别怎么看

用户要求：

> “查一下昨天销售下降的原因，再生成分析报告。”

### 用 LangChain 高层 Agent 看

你更关注：

```text
Model
+ SQL Tool
+ retrieval tools
+ system prompt
+ middleware
+ structured response
```

如果标准 Model ↔ Tool loop 足够，直接使用 LangChain `create_agent()` 可以减少自己编写 orchestration boilerplate。

### 用 LangGraph 看

如果业务要求显式流程：

```text
START
  ↓
Understand Request
  ↓
Generate SQL
  ↓
Execute SQL
  ↓
Validate Result
  ├─ SQL error → Repair SQL ─────┐
  ├─ not enough → More Query ────┤
  └─ sufficient → Analyze        │
                     ↓           │
               Draft Report      │
                     ↓           │
               Human Approval?   │
                 ├─ reject ──────┘
                 └─ approve
                     ↓
                    END
```

并且要求：

```text
retry budgets
state inspection
checkpoint / resume
custom branch / join
human approval
partial failure recovery
```

那么直接使用 LangGraph 会更自然，因为这些控制结构是业务本身的一部分，不应该隐藏在一个巨大 Agent Prompt 里。

---

## 8. 选择原则：不要用“简单/复杂”做唯一判断

更好的决策表：

| Requirement | Prefer |
|---|---|
| 标准 Model / Tool / Retriever integration | LangChain |
| Prompt → Model → Parser / RAG pipeline | LangChain Runnable / LCEL |
| 标准 tool-calling agent loop | LangChain `create_agent()` |
| 需要 middleware / structured output，但控制流仍接近标准 agent | LangChain `create_agent()` |
| 自定义 State Schema / Reducer | LangGraph |
| 显式 branch / join / multi-stage routing | LangGraph |
| deterministic workflow + agentic step 混合 | LangGraph |
| custom retry / recovery topology | LangGraph |
| checkpoint / durable resume 是核心需求 | LangGraph |
| 复杂 HITL / state inspection / state editing | LangGraph |
| 多个 LangChain components 放进显式 workflow | LangChain + LangGraph |

最常见的生产组合其实是：

```text
LangChain components
    inside
LangGraph nodes
```

而不是二选一。

> **Use LangChain to avoid rebuilding common agent/application components; use LangGraph when orchestration itself becomes domain logic.**

---

## 9. 什么时候不要急着上 LangGraph

不是出现两个 if/else 就必须 Graph。

如果你的应用是：

```text
Prompt → Model → Parser
```

或者：

```text
Retriever → Prompt → Model
```

或者一个标准 Tool Calling loop 就足够，那么自定义 Graph 可能只是在增加：

```text
state schema complexity
more routing code
checkpoint storage
more test surface
more operational concepts
```

因此应先问：

```text
Does orchestration complexity exist in the domain,
or am I creating orchestration complexity in the framework?
```

Graph 的价值来自真实控制边界，而不是“架构看起来高级”。

---

## 10. 不用 LangGraph，最小状态机怎么实现

这是比“会不会 API”更能检验理解的问题。

一个最小版 Stateful Agent Runtime 至少要有六部分。

### 10.1 State Store

```python
state = {
    "thread_id": "...",
    "step": 0,
    "messages": [],
    "sql": None,
    "rows": [],
    "status": "running",
}
```

持久化接口：

```text
load(thread_id)
save(thread_id, version, state)
```

生产上还要处理 optimistic concurrency / version conflict。

### 10.2 Node Registry

每个 Node：

```text
State → StatePatch
```

```python
NODES = {
    "generate_sql": generate_sql,
    "execute_sql": execute_sql,
    "validate": validate,
    "analyze": analyze,
}
```

### 10.3 Reducer

```python
def reduce(state, patch):
    return {**state, **patch}
```

真实系统需要按字段定义 reducer，例如 messages append，而不是覆盖。

### 10.4 Router

```python
def route(state):
    if state["status"] == "sql_error":
        return "generate_sql"
    if state["status"] == "insufficient":
        return "execute_sql"
    if state["status"] == "ready":
        return "analyze"
    return "END"
```

### 10.5 Scheduler / Execution Loop

```python
node = "generate_sql"

while node != "END":
    patch = NODES[node](state)
    state = reduce(state, patch)
    save(state)
    node = route(state)
```

这个版本已经解释了最核心的：

```text
execute node
→ patch state
→ persist
→ route
→ repeat
```

但离生产可用还很远。

### 10.6 Production requirements

真正的 runtime 还要补：

```text
retry policy
max-step / recursion limit
timeout
parallel task scheduler
branch / join
idempotency key
side-effect reconciliation
checkpoint versioning
interrupt / resume
human approval
trace / metrics
error state
schema migration
```

所以 LangGraph 的价值不是“会画图”，而是把这些 stateful execution responsibilities 做成可复用 runtime。

---

## 11. 常见错误回答与修正

### 错误 1：LangChain 只能线性执行

修正：Runnable 支持 sequence、parallel、branch；LangChain `create_agent()` 自身也是 graph-backed agent。

### 错误 2：LangGraph 是 LangChain 的完全替代品

修正：它们是不同 abstraction layer。LangGraph 可以独立使用，也经常直接复用 LangChain model/tool components。

### 错误 3：Checkpoint = 保存 Message History

修正：Checkpoint 保存的是 Graph State Snapshot / execution state；Message History 只是 State 中可能存在的一部分。

### 错误 4：有 Checkpoint 就不需要处理 Tool Side Effect

修正：外部 DB / API / payment 已发生的副作用不会被 Checkpoint 自动回滚；恢复执行仍需 idempotency / reconciliation。

### 错误 5：Graph 的每个 Node 都是一个 Agent

修正：Node 可以是 deterministic function、policy check、tool、human approval、subgraph 或 agent loop。

---

## 12. 90 秒工程回答

> LangChain 和 LangGraph 不是简单的“链式调用 vs 复杂 Agent”。当前 LangChain 更偏高层 Agent Framework 和组件生态，它用统一接口封装 model、tool、retriever、Runnable、middleware 等常见能力；而 LangGraph 是更低层的 stateful orchestration runtime。实际上现在 LangChain 的 `create_agent()` 本身就是基于 LangGraph 构建的，并返回 `CompiledStateGraph`。
>
> 如果我的需求是标准 RAG、Prompt/Model/Parser 组合，或者标准 tool-calling agent，我会优先用 LangChain 的高层抽象，减少 orchestration boilerplate。如果业务控制流本身很重要，例如有自定义 State、条件分支、循环、branch/join、长运行任务、checkpoint/resume、Human-in-the-loop 或复杂 failure recovery，我会直接用 LangGraph，把这些控制边界显式建模。
>
> LangGraph 里 Node 读取共享 State 并返回 State Patch，Reducer 合并更新，Edge 或 Conditional Edge 决定下一步。Graph 编译后由 runtime 按 super-step 调度任务，并可在 step boundary 通过 Checkpointer 持久化 State。真正理解这套机制，关键不是会写 `add_node()`，而是理解 State、Reducer、Scheduler、Routing、Checkpoint 和 Side Effect Recovery 怎么一起工作。

---

## 13. Canonical rules

> **LangChain and LangGraph are abstraction layers, not mutually exclusive competitors.**

> **Current LangChain agents are built on LangGraph; use LangChain for the standard architecture and LangGraph when orchestration itself becomes application logic.**

> **A graph is State + Nodes + Reducers + Routing + Scheduler, not merely boxes and arrows.**

> **Checkpointing persists execution state; it does not automatically make external side effects transactional.**

> **Use the highest-level abstraction that still makes important control boundaries explicit.**

---

## Verified official references

- LangChain GitHub README: https://github.com/langchain-ai/langchain
- LangGraph GitHub README: https://github.com/langchain-ai/langgraph
- LangChain `create_agent` reference: https://reference.langchain.com/python/langchain/agents/factory/create_agent
- LangChain Core `Runnable` reference: https://reference.langchain.com/python/langchain-core/runnables/base/Runnable
- LangChain Core overview: https://reference.langchain.com/python/langchain-core/langchain_core
- LangGraph `StateGraph` reference: https://reference.langchain.com/python/langgraph/graph/state/StateGraph
- LangGraph checkpointer docs: https://docs.langchain.com/oss/python/langgraph/checkpointers

## Source boundary

用户提供的初稿正确抓住了组件标准化、State、Node、Conditional Edge、Checkpoint 与 HITL 这些工程重点。经官方资料核验后，本手册做了几项关键修正：

- 不再把 LangChain 描述成只能做线性 Chain；
- 明确当前 `langchain.agents.create_agent()` 建立在 LangGraph 上；
- 将选择标准从“简单 vs 复杂”改成“高层标准架构 vs orchestration 是否成为业务逻辑”；
- 把 LangGraph runtime 补全为 State Patch、Reducer、Scheduler、Super-step、Checkpoint；
- 将“从第五步原地恢复”修正为 checkpoint / super-step semantics；
- 补充 Side Effect 的 idempotency / reconciliation 边界；
- 增加不用 LangGraph 时最小 State Machine 的实现职责，用来检验是否真正理解底层运行机制。
