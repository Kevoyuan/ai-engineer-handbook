# LangChain / LangGraph 面试答题卡

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08.

## 题目

**为什么使用 LangChain / LangGraph？两者怎么选？**

## 30 秒版本

LangChain 和 LangGraph 的价值不只是“能调大模型”，而是把 LLM 应用变成可组合、可维护的工程系统。LangChain 更偏组件抽象和高层 Agent API，把 Prompt、Model、Retriever、Tool、Parser 等能力标准化；LangGraph 更偏有状态 orchestration，当业务出现显式 State、条件分支、循环、失败恢复、Checkpoint、长期运行和 Human-in-the-loop 时更合适。当前 LangChain 的 Agent 本身使用 LangGraph primitives，所以它们更像不同抽象层，而不是互斥框架。

## 60–90 秒版本

我选择 LangChain / LangGraph，核心不是因为它们能调用 LLM，而是因为真实 Agent 不是一次 input → model → output 的调用。

单次模型调用本身不是 durable application state。复杂 Agent 还要保存当前任务、中间结果、Tool 返回、失败状态、重试次数、审批状态以及下一步执行位置。

LangChain 主要解决组件标准化和复用。Prompt、Model、Output Parser、Retriever、Tool 都有相对统一的接口，可以通过 Runnable 等抽象组合起来，所以换模型、换 Retriever 或复用一段能力时，不需要把整套应用重写。

当 orchestration 本身变成业务逻辑时，我会更倾向 LangGraph。它把应用建模成显式 State + Node + Edge / Conditional Routing。比如 SQL 执行成功就进入分析，失败回到 SQL repair，证据不足继续检索，满足条件才生成最终答案。这样 loop、if/else、retry 和 termination condition 都变成可检查的控制流。

另外 LangGraph 可以用 Checkpointer 保存执行状态，并配合 interrupt / resume 做 Human-in-the-loop。更准确地说，它是从 checkpoint / graph execution semantics 恢复，而不是任意程序指令位置恢复；已经发生的数据库写入、支付、发邮件等外部副作用仍然要做 idempotency 和 reconciliation。

所以我的选型原则是：标准组件组合或标准 tool-calling agent 优先使用 LangChain；需要自定义 State、branch/join、recovery、durable execution 或复杂 HITL 时下沉到 LangGraph；很多生产系统其实会把 LangChain components 放在 LangGraph nodes 里面一起使用。

## 面试官继续追问：不用 LangGraph，怎么实现最小状态机？

最小 runtime 至少需要：

~~~text
State Store
Node Registry
Node Executor
State Patch
Reducer
Router
Scheduler / Execution Loop
Checkpoint
~~~

最小执行逻辑：

~~~python
node = "generate_sql"

while node != "END":
    patch = NODES[node](state)
    state = reduce(state, patch)
    save_checkpoint(state)
    node = route(state)
~~~

生产版再补：

~~~text
retry policy
timeout / max steps
parallel scheduler
branch / join
interrupt / resume
idempotency
side-effect reconciliation
human approval
trace / metrics
state schema migration
~~~

## 高频追问

### 1. “LLM 是不是完全无状态？”

不要回答成绝对的“是”。

更准确：

- 单次模型 inference 不等于 durable workflow state；
- 应用可以把历史消息重新放入下一次请求；
- 某些平台也提供 conversation / thread 持久化抽象；
- 但任务进度、Tool result、approval、retry、pending action 等仍然是应用 / runtime 层状态问题。

### 2. “Checkpoint 是不是从失败的那一行继续？”

不是这么简单。

Checkpoint 保存 graph execution state / snapshot。恢复发生在 LangGraph 的 checkpoint、node / super-step 与 interrupt/resume 语义里，不是任意 instruction pointer。

### 3. “Checkpoint 之后外部 Tool 不会重复执行吗？”

不能保证。

数据库写入、支付、邮件等 side effect 仍要依赖：

~~~text
idempotency key
transaction semantics
reconciliation
deduplication
~~~

### 4. “是不是简单 Workflow 用 LangChain，复杂 Agent 用 LangGraph？”

可以作为面试速记，但要补一句：

> 当前 LangChain Agent 本身建立在 LangGraph primitives 上，所以更准确的判断是“需要多高层抽象”，而不是两个互斥框架。

## 面试官真正考什么

重点不是 API 记忆，而是能不能解释：

~~~text
state 怎么保存？
node 怎么读写 state？
谁决定 next step？
条件分支和 loop 怎么实现？
失败之后怎么恢复？
什么时候应该停？
HITL 在哪里 interrupt？
外部副作用怎么避免重复？
~~~

如果这些问题能脱离 LangGraph API 解释清楚，才说明真正理解 Agent runtime。

## Canonical references

- Chapter 08 · Agent, Workflow, and Orchestration
- §8.8 LangChain vs LangGraph
- §8.9 Minimal Agent State Machine

Verified against current LangChain / LangGraph official documentation on 2026-09-23:

- https://docs.langchain.com/oss/python/learn
- https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph
- https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/
