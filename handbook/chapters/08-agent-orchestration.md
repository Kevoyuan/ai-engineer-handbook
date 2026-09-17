# Chapter 08 · Agent、Workflow 与 Orchestration
## Agent, Workflow, and Orchestration

> Canonical semantic chapter. Integrates the former Loop-vs-Graph, Coding Agent Engineering, and LangChain-vs-LangGraph supplements into one orchestration model.

Agent 系统的核心不是“让模型自由行动”，而是把不确定决策放在 Agent，把可重复转换放在 deterministic service，并通过 State、Artifacts、Validation、Recovery 和 Policy 控制执行。

## 8.1 Artifact-driven Workflow

以多媒体生成任务为例，生产系统不应是：

```text
User Prompt → Image API → Video API
```

更可靠的是版本化 Artifact Graph：

```text
Creative Brief
→ Story Outline → Script
→ Character Cards → Scene Cards
→ Shot List → Shot Prompts
→ Images / Clips → Audio
→ Final Timeline
```

每个 Artifact 至少保存：

```text
artifact_id
type
version
dependencies
validation_status
model
prompt_version
cost
timestamp
```

> **Every artifact needs an ID, version, lineage, and validation status.**

Agent 适合 clarification、planning、creative revision、diagnosis、replanning 等不确定决策；Deterministic Service 适合 schema validation、prompt assembly、rendering、subtitle generation、permission checks、file conversion 等可重复转换。

> **Use agents for uncertain decisions and deterministic services for repeatable transformations.**

## 8.2 D-I-R：Root Cause + Minimum-scope Repair

```text
Failure
→ Diagnose earliest incorrect Artifact
→ Invalidate only downstream dependencies
→ Regenerate minimum affected scope
```

例如只修改服装，则产生 Character Costume v2，只失效依赖该服装的 shots，而不是从脚本开始全部重跑。

> **Regenerate from the earliest incorrect artifact, not from the beginning.**

## 8.3 Async State, Idempotency, Parallelism

长任务可以：

```text
Orchestrator → Queue → Worker → Artifact → Event → Resume
```

状态包括：

```text
QUEUED · RUNNING · SUCCEEDED · FAILED · CANCELLED
```

前端可通过 SSE / WebSocket / Polling 获取进度。

所有可能产生副作用或计费的生成任务都需要 `idempotency_key`。Request timeout 不代表任务没开始；重试前先 reconciliation，避免重复计费和重复 Artifact。

可并行的通常是 independent shots、audio variants、preview；continuity-dependent shots 与上游未锁定的任务需要串行。

成本策略：Preview → Validate → Final Render；创意决策稳定前尽量用低成本模型；复用 Character/Scene Assets；限制 Retry；设置项目 Budget。

## 8.4 Workflow State Machine

任务状态属于数据库或 Workflow Engine，不属于 LLM 的隐式“记忆”。例如：

```text
DRAFT
→ BRIEF_VALIDATED
→ STORY_APPROVED
→ ASSETS_LOCKED
→ STORYBOARD_APPROVED
→ GENERATION
→ VALIDATION
→ TARGETED_REPAIR
→ POST
→ REVIEW
→ PUBLISH
```

Human-in-the-loop Gates 可放在 Brief approval、Character approval、高风险内容与 Final publish。

## 8.5 Multi-Agent：按 Operational Boundary 拆

值得拆分的条件包括：

- 权限边界不同；
- 工具/运行环境不同；
- 子任务可独立评估；
- 有真实并行收益；
- 需要独立 Critique；
- 不同模型/成本策略；
- 高风险隔离。

不值得拆的典型情况：只是把角色叫 Researcher / Manager / Critic；所有 Agent 共享同一状态和工具；没有独立验收；通信开销超过专业化收益。

> **I split agents at operational boundaries, not personality boundaries.**

通用 Agent System Skeleton：

```text
User
→ Router
→ Agent / Workflow
→ RAG + MCP / Tools
→ State / Memory
→ Validation / Guardrails

Side channel:
Trace → Eval → Dashboard → Human Escalation
```

## 8.6 Loop vs Graph：局部自治 vs 显式拓扑

Loop 和 Graph 不是互相替代的两代技术。

### Loop

```text
Goal
→ Observe
→ Reason / Plan
→ Act
→ Verify
→ Stop or iterate
```

适合一个连贯目标、共享上下文、统一权限边界、明确验证方式与显式停止条件。

### Graph

```text
Router
→ bounded work units
→ branch / join
→ checkpoint
→ validation
→ recovery
```

适合出现结构性边界：并行轨道、不同 context/memory/permission、branch/join、checkpoint/resume、failure isolation、可审计控制点、高风险 HITL。

Graph Node 不等于 Agent Loop。节点可以是 deterministic function、retrieval、tool execution、policy gate、human approval、sub-workflow，也可以是 agent loop。

推荐演进：

```text
LLM Call
→ Tool-using Agent
→ Bounded Agent Loop
→ Deterministic Workflow + Loop
→ State Graph
→ Multi-Agent Graph
```

这不是“技术代际排名”，而是协调复杂度逐步增加。

> **Use the least control-flow complexity that still makes state, stopping conditions, permissions, and recovery explicit.**

> **A graph does not repair a broken loop.**

## 8.7 Coding Agent Engineering

Coding Agent 没有消除软件工程流程，而是重新分配工程师注意力：少花时间手写代码，多花时间决定做什么、设计架构、写清 Spec、校准自主权、验证产出，并把运行证据反馈到前面的阶段。

```text
Planning
→ Execution
→ Deployment & Monitoring
↺ verification / monitoring evidence can send work back upstream
```

### Planning

研究问题、理解现有代码库、写需求与技术 Spec、确定架构与约束、定义 Acceptance Criteria、拆执行计划，并审查关键假设、安全风险和过度设计。

### Execution

让 Agent 构建、测试、验证；同时决定哪些步骤需要高频人机往返、哪些可以委托为较大工作块。需要管理 Context、权限、并行 Agent 和人的 Attention Budget。

### Deployment & Monitoring

通过 CI/CD 与必要 Human Gate 部署；Agent 可以辅助观察日志、发现问题与提出修复，但生产副作用仍需显式权限、验证、回滚和审计边界。

Verification failure 不应默认解释成“再生成一次代码”。它可能意味着 Spec 不清、架构假设错误、Context 过期、任务拆分不合理或 Verifier 本身不足。

五项核心能力：

| Skill | 工程师真正决定的事 |
|---|---|
| Directing the workflow | 规划深度、开始/回退时机、速度/成本/技术风险/人工投入权衡 |
| Enabling agent autonomy | 各阶段自主权、并行度、权限与 Blast Radius |
| Reviewing the work | 什么证据能证明完成；自动测试、行为验证、Artifact、Eval、代码/安全/架构审查、人审边界 |
| Customizing agent & environment | Skills、Plugins、MCP、Hooks、项目级 Standing Context、跨 Session 状态、复盘与 Agent-generated debt 治理 |
| Coding agent foundations | 代码搜索、Context Retrieval、Context Window、Tool/Subagent、Harness 如何约束行为 |

自主权应被视为**阶段级控制变量**，不是成熟度徽章：

```text
autonomy level
= f(verifiability, reversibility, blast radius, permission risk, context quality)
```

高自主权更适合可验证、可回滚、Blast Radius 小的工作；高风险规划、权限变更、生产副作用和不可逆动作需要更强 Human Gate。

> **Long-running autonomy is not a quality metric.**

Context 是工程基础设施，不是一次性 Prompt：

```text
Model
+ Harness
+ Code / Context Retrieval
+ Standing Instructions
+ Skills / MCP / Tools
+ Permissions
+ State / Checkpoints
+ Verification
```

> **A coding agent is an execution component inside a human-directed, testable, permissioned engineering loop.**

> **Coding agents lower the cost of implementation; they raise the value of specification, verification, and engineering judgment.**

来源：Andrew Ng, *AI Engineering Skills Map: Using coding agents*（2026-09-04）。

Sources:
- https://x.com/AndrewYNg/status/2095890279865721217
- https://www.andrewng.org/writing

## 8.8 LangChain vs LangGraph：抽象层，而不是二选一框架

把两者概括为：

```text
LangChain = 线性链式调用
LangGraph = 复杂 Agent
```

对当前版本已经过度简化。更准确的关系是：

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

当前 LangChain `create_agent()` 本身建立在 LangGraph 之上，并返回 `CompiledStateGraph`。因此问题不是“LangChain 还是 LangGraph”，而是**需要使用多高层抽象，以及 orchestration 是否已经成为业务逻辑本身。**

> **LangChain and LangGraph are abstraction layers, not mutually exclusive competitors.**

### LangChain：组件抽象 + 高层 Agent API

`langchain-core` 提供 Chat Model、LLM、Vector Store、Retriever、Tool 等统一接口，并通过 Runnable 提供：

```text
invoke / ainvoke
batch / abatch
stream / astream
composition
sequence / parallel / routing
retry / fallback
```

典型：

```python
chain = prompt | model | parser
result = chain.invoke(input)
```

价值在于稳定接口、可组合、可替换、streaming/async/batch 语义和 tracing-friendly execution，而不是 `|` 语法本身。

当前 `create_agent()` 提供标准 Model ↔ Tool loop、middleware、structured output、checkpointer、store、interrupt 等能力；如果标准架构已经满足需求，没有必要为了“看起来高级”手写 Graph。

### LangGraph：显式 Stateful Orchestration

LangGraph 把 Agent runtime 的关键控制面暴露出来：

```text
State
Nodes
Reducers
Edges / Conditional Routing
Scheduler
Checkpoint
```

`StateGraph` Node 的核心模型可以理解为：

```text
State → Partial<State>
```

Node 返回 State Patch；Runtime 根据 State Key 的 reducer 合并更新。

Node 可以是 LLM、Retriever、SQL executor、deterministic validation、policy gate、human approval、subgraph 或 agent loop。

普通 Edge：

```text
A → B
```

Conditional Edge：

```text
Execute SQL
→ route(state)
   ├─ sql_error    → Repair SQL
   ├─ insufficient → Generate More Query
   └─ sufficient   → Analyze
```

因此 if/else、retry loop、termination rule 成为显式控制结构。

### Compile / execution model

`StateGraph` 是 Builder，需要 `compile()` 成 `CompiledStateGraph` 后执行。一个可理解的运行模型是：

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

对于 fan-out：

```text
       → B ─┐
A ─────     ├→ D
       → C ─┘
```

B/C 可以位于同一 super-step 并行执行，再通过 reducer / join 形成后续 State。

> **A graph is State + Nodes + Reducers + Routing + Scheduler, not merely boxes and arrows.**

### Checkpoint semantics

Checkpointer 按 Thread 保存 Graph State Snapshot，典型关联：

```text
thread_id
→ checkpoint history
→ state snapshot
→ pending / next tasks
```

Checkpoint 可以支持 durable execution、interrupt/resume、HITL、time-travel debugging、fault-tolerant execution 和 conversation state persistence。

但“从第五步原地继续”只是直觉说法；更准确的是从 checkpoint / super-step semantics 恢复，不是任意 instruction pointer resume。

> **Checkpointing persists execution state; it does not automatically make external side effects transactional.**

已经执行的外部 Side Effect 仍需要 idempotency / reconciliation / transaction semantics。

### Selection matrix

| Requirement | Prefer |
|---|---|
| 标准 Model / Tool / Retriever integration | LangChain |
| Prompt → Model → Parser / RAG pipeline | LangChain Runnable / LCEL |
| 标准 tool-calling agent loop | LangChain `create_agent()` |
| middleware / structured output，控制流接近标准 agent | LangChain `create_agent()` |
| 自定义 State Schema / Reducer | LangGraph |
| 显式 branch / join / multi-stage routing | LangGraph |
| deterministic workflow + agentic step 混合 | LangGraph |
| custom retry / recovery topology | LangGraph |
| checkpoint / durable resume 是核心需求 | LangGraph |
| 复杂 HITL / state inspection / state editing | LangGraph |
| LangChain components 放入显式 workflow | LangChain + LangGraph |

> **Use LangChain to avoid rebuilding common agent/application components; use LangGraph when orchestration itself becomes domain logic.**

官方资料校验日期：2026-09-17。来源包括 LangChain / LangGraph 官方 README、Runnable reference、`create_agent` reference、`StateGraph` reference 和 checkpointer documentation。

## 8.9 不用框架，最小 Agent State Machine 怎么设计

理解框架的最好测试，是能否脱离 API 描述最小 runtime。

至少需要：

```text
State Store
→ Node Registry
→ Node Execution
→ State Patch
→ Reducer
→ Router
→ Scheduler / Execution Loop
→ Checkpoint
```

最小伪代码：

```python
node = "generate_sql"

while node != "END":
    patch = NODES[node](state)
    state = reduce(state, patch)
    save(state)
    node = route(state)
```

生产版继续补：

```text
retry policy
timeout
max steps
parallel scheduler
branch / join
checkpoint versioning
interrupt / resume
idempotency
side-effect reconciliation
human approval
trace / metrics
schema migration
```

这也是为什么会不会写 LangGraph API 不是关键；真正需要理解的是**状态如何流转、谁决定下一步、执行如何持久化，以及副作用如何被约束。**

## 8.10 Chapter 08 ↔ Chapter 09

Chapter 08 负责 execution engineering；Chapter 09 提供外层 Reliability Control Plane：

```text
CH08 · Plan / Execute / Orchestrate
        ↓
CH09 · Validate / Eval / Observe / Release
        ↓
Production Evidence
        └────→ Root Cause / Dataset / Build / Test
```

Reviewing 不应停在“代码看起来没问题”。它最终应进入 release gate、production monitoring、incident feedback 和 regression protection。

## Canonical rules

> **Use the least control-flow complexity necessary.**

> **A graph does not repair a broken loop.**

> **Autonomy is a design variable, not the goal.**

> **Use the highest-level abstraction that still makes important control boundaries explicit.**

> **Checkpointing does not make external side effects transactional.**
