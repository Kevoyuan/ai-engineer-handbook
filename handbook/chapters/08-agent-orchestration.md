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

Agent 适合 clarification、planning、creative revision、diagnosis、replanning 等不确定决策；Deterministic Service 适合 schema validation、prompt assembly、rendering、subtitle formatting（字幕文本已确定）、permission checks、file conversion 等可重复转换。

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

所有可能产生副作用或计费的生成任务都需要明确去重 / 幂等 / 对账策略；服务支持时使用 `idempotency_key`，否则通过任务账本、唯一约束和结果查询协调。仅在请求上增加一个未被服务端实现的 key 不会产生幂等保证。Request timeout 不代表任务没开始；重试前先 reconciliation，避免重复计费和重复 Artifact。

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

### 从单次模型调用到有状态应用

把“LLM 很健忘”作为入门直觉可以，但工程上更准确的说法是：

> **A model invocation is not durable application state.**

一次普通 inference / chat-model 调用，只会基于这次请求中可见的输入产生输出。除非应用或服务端显式保存并重新提供 conversation / thread / workflow state，否则模型不会自动拥有业务流程的长期执行状态。

因此复杂 Agent 需要把两个层次分开：

~~~text
Model call
input → model → output

Agent runtime
state
→ node execution
→ state update
→ route
→ checkpoint
→ resume / retry / branch
~~~

即使某个模型 API 提供 conversation / thread abstraction，也不能把“消息历史”直接等同于完整 Workflow State。真实业务通常还要保存：

~~~text
current task
intermediate artifacts
tool results
retry count
approval status
pending action
error state
next node / runnable tasks
execution metadata
~~~

这也是 LangGraph 的核心价值之一：**把原本隐含在代码、Prompt 和临时变量里的执行状态，提升成显式 State + Transition。**

LangGraph 官方当前的“Thinking in LangGraph”文档也明确把 State 描述为所有 Node 都可读写的 shared memory；Node 读取 State、执行工作并返回更新，后续路由再根据更新后的 State 决定下一步。（见 [Thinking in LangGraph](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph)）。

> **Conversation memory answers “what happened before”; workflow state answers “where the execution is now and what may happen next.”**

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

B/C 可以位于同一 super-step 并行执行。Reducer 负责合并字段更新，不等于等待所有分支的 barrier；需要等待 B/C 都完成时，应显式定义 join（例如 `add_edge(["B", "C"], "D")`），不要把不同长度分支的独立边误当作完整 join。

> **A graph is State + Nodes + Reducers + Routing + Scheduler, not merely boxes and arrows.**

### Checkpoint semantics

Checkpointer 按 Thread 保存 Graph State Snapshot，典型关联：

```text
thread_id
→ checkpoint history
→ state snapshot
→ pending / next tasks
```

配置合适的持久化 Checkpointer 后，Checkpoint 可以支持 durable execution、interrupt/resume、HITL、time-travel debugging、fault-tolerant execution 和 conversation state persistence。InMemorySaver 只保存在进程内存中，不能承诺进程崩溃后恢复；实际持久化时机和恢复语义需按所用版本与 durability 配置验证。

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

官方资料校验日期：2026-09-23。来源包括 LangChain / LangGraph 官方 README、Runnable reference、`create_agent` reference、`StateGraph` reference 和 checkpointer documentation。

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

## 8.11 Agent Project Engineering Lifecycle：从 Demo 到可维护系统

能调用模型、接上 Tool、跑通一个 Demo，只说明 **execution path exists**；它还不等于一个可长期维护、可验证、可交接、可上线的 Agent 项目。

真正的工程问题是：

~~~text
What task are we solving?
→ What is deterministic vs uncertain?
→ What capabilities exist?
→ What state must survive?
→ What evidence proves success?
→ What happens on failure?
→ How do production signals return to Build/Test?
~~~

因此，一个 Agent 项目更适合被建模成：

~~~text
Task Contract
+ Repository / Engineering Contract
+ Runtime Topology
+ Agent / Capability Contracts
+ State / Context / Memory
+ Prompt / Policy Configuration
+ Test / Eval
+ Deployment / Observability
+ Production Learning Loop
~~~

> **The goal of Agent engineering is not to maximize autonomy; it is to make uncertain model behavior reliably serve a bounded business task.**

### 8.11.1 Step 1 · 先定义 Task Contract，再选框架

开工前至少写清：

~~~text
Goal
Input
Output
Boundary
Success Criteria
~~~

例如一个研究视频生成任务：

~~~text
Input
→ topic

Goal
→ research reliable evidence
→ produce script
→ produce storyboard

Boundary
→ research / draft may be automatic
→ publish / delete / paid side effect requires approval

Success
→ evidence-backed claims
→ required output schema
→ accepted script / storyboard
~~~

如果目标没有边界，后续通常会出现：

~~~text
more tools
+ more skills
+ more memory
+ bigger prompt
≠
better system
~~~

因为系统在用组件数量弥补需求定义缺失。

> **Define the task before designing the Agent.**

### 8.11.2 Step 2 · Repository Contract：先规定怎么改，再让 Agent 改

一个长期维护的 Agent 项目需要基本工程约定，例如：

~~~text
README
Git history
environment-variable contract
secret-handling rules
build / test / lint commands
dependency policy
review / release rules
agent-facing repository instructions
~~~

真实 Secret 不应进入源码或示例文件。常见模式：

~~~text
.env.example
→ only variable names / safe examples

.env
→ local real values
→ ignored by version control
~~~

如果使用 Coding Agent，还应提供它真正会读取的项目级 instruction mechanism。

以 Codex 为例，官方支持目录层级的 `AGENTS.md` / `AGENTS.override.md`，用于提供项目结构、测试命令、开发约定与限制。它更适合作为**操作地图**，而不是把全部架构知识复制成一个巨大的 instruction blob。

跨工具抽象应该写成：

~~~text
Agent-facing repository instructions
→ repo conventions
→ validation commands
→ safety / permission rules
→ links to deeper source-of-truth docs
~~~

而不是假设所有 Coding Agent 都共享同一个文件名。

> **Repository instructions should point to sources of truth, not become a second source of truth.**

Sources:
- https://developers.openai.com/codex/guides/agents-md
- https://openai.com/index/harness-engineering/

### 8.11.3 Step 3 · Architecture：按职责和失败边界拆，不按“目录看起来专业”拆

来源材料给出一种常见目录：

~~~text
agents/
tools/
skills/
workflows/
prompts/
context/
memory/
tests/
evals/
~~~

这可以作为起点，但不是成熟度标准。

真正值得独立成模块的原因应该是：

~~~text
distinct responsibility
distinct state lifecycle
distinct permission boundary
distinct test surface
distinct owner
distinct failure / recovery path
~~~

因此小项目可以先简单：

~~~text
app/
  runtime.py
  tools.py
  prompts.py
  tests/
~~~

等真实边界出现后再拆。

> **Create modules when responsibilities diverge, not when folder count looks too small.**

### 8.11.4 Workflow 管确定性控制，Agent 管不确定判断

例如：

~~~text
Research
→ Script
→ Storyboard
~~~

“先 Research，再 Script”是 Workflow topology；而这些判断更适合 Agent / model decision：

~~~text
Are sources sufficient?
Is this claim supported?
Should we search again?
Which repair strategy is best?
~~~

失败路径应显式进入 Workflow：

~~~text
Research
→ Evidence Gate
   ├─ insufficient → Search Again
   └─ sufficient   → Script

Script
→ Eval
   ├─ fail under retry budget → Regenerate
   ├─ repeated evidence failure → Back to Research
   └─ pass → Storyboard
~~~

这延续本章已有原则：

> **Use agents for uncertain decisions and deterministic services for repeatable transformations.**

不要让一个“超级 Agent”同时隐式掌握流程、重试、权限、状态和业务判断，否则很难解释：

~~~text
why this step?
why this route?
why retry?
why stop?
what changed?
~~~

### 8.11.5 Step 4 · Agent Contract：角色只是最小部分

一个 Agent Contract 至少应明确：

~~~text
Role
Goal
Instructions
Allowed Tools
Input Schema
Output Schema
Stop Conditions
Escalation Conditions
Permission Boundary
Validation Contract
~~~

例如 Research Agent：

~~~text
Role
→ technical researcher

Goal
→ produce reliable evidence package

Source policy
→ prefer primary / official sources
→ mark conflicts
→ mark unknowns

Tools
→ search
→ fetch
→ repository lookup

Output
→ claims
→ evidence
→ provenance
→ conflicts
→ unresolved questions
~~~

Output Schema 的价值不是“格式漂亮”，而是把 Agent 输出变成后续节点可以稳定消费的 Artifact。

~~~text
free-form prose
→ parsing ambiguity

typed artifact
→ validation
→ downstream composition
→ regression testing
~~~

> **Agent contracts should define handoff semantics, not only persona.**

### 8.11.6 Step 5 · Tool：一个可独立验证的外部能力

Tool 是执行边界，不是任务方法。

好的 Tool 通常具备：

~~~text
single responsibility
clear input schema
stable output schema
explicit error model
timeout / retry policy
permission requirement
idempotency semantics when side effects exist
standalone tests
~~~

例如：

~~~python
def search_web(query: str) -> list[dict]:
    ...
~~~

返回稳定字段：

~~~text
title
summary
url
~~~

不要做：

~~~text
do_everything(task)
→ search
→ write
→ query DB
→ send email
→ generate slides
~~~

因为职责越混杂，Tool description、authorization、failure attribution 和测试都会一起恶化。

排障时先区分：

~~~text
tool selection failure
≠
tool execution failure
~~~

这与 Chapter 06 的 Capability Routing / Tool Failure Taxonomy 对齐。

### 8.11.7 Step 6 · Skill：把验证过的任务方法固化下来

Tool 回答：

~~~text
What operation can the system perform?
~~~

Skill 回答：

~~~text
What repeatable procedure should the system follow to complete this task?
~~~

例如：

~~~text
Tools
→ search web
→ fetch page
→ search repository
→ save artifact

Skill: research_new_ai_product
→ find official site
→ inspect docs / repository
→ collect secondary reporting
→ compare conflicting claims
→ remove duplicates / stale evidence
→ produce sourced research artifact
~~~

所以能力积累不应只表现为“Tool 越来越多”，还应表现为**可复用、可验证、可版本化的 procedure** 越来越多。

> **Tools provide operations; Skills encode reusable methods.**

### 8.11.8 Step 7 · Context 与 Memory：按信息生命周期分，不按存储技术分

首先问：

~~~text
What does this task need now?
~~~

而不是：

~~~text
Which vector database should we add?
~~~

当前任务可能需要：

~~~text
user request
current artifact versions
tool results
workflow position
open questions
retry counters
temporary evidence
~~~

这些属于 Context / Working State。

跨任务仍然有价值的信息才可能进入长期 Memory：

~~~text
stable preference
project rule
validated reusable fact
past approved decision
durable profile
~~~

任务结束后的 Memory Write 应是一个 promotion decision：

~~~text
working information
→ validate
→ deduplicate
→ decide durability
→ save / update / expire / reject
~~~

而不是“所有历史全部保存”。

> **Memory is curated durable state, not a dump of past context.**

这部分的深入设计属于 Chapter 07。

### 8.11.9 Step 8 · Prompt：把它当版本化配置和行为逻辑

不要让一个巨大的 System Prompt 同时承担所有职责。

可以拆成：

~~~text
System
→ durable role / global behavior

Task
→ current objective

Constraints
→ boundaries / source / safety / policy

Examples
→ representative behavior

Output Schema
→ machine-consumable contract
~~~

这种拆分的价值是可定位变更：

~~~text
problem = unsupported claims
→ inspect evidence policy / constraints

problem = wrong output shape
→ inspect schema

problem = wrong task objective
→ inspect task spec
~~~

而不是每次“重写整个 Prompt”。

Prompt / instruction bundle 应进入版本管理，并把版本写进 Trace Metadata，便于 Chapter 09 的 A/B / Eval / Monitoring 分析。

> **A prompt is behavior configuration; version it like behavior-changing code.**

### 8.11.10 Step 9 · Test 与 Eval：分别回答“程序对不对”和“任务做得好不好”

传统 Test 可以检查：

~~~text
function
API
tool schema
parser
state reducer
permission rule
retry policy
~~~

但：

~~~text
all tests pass
≠
task succeeded
~~~

Agent 仍可能：

~~~text
cite stale evidence
select wrong tool
invent unsupported facts
miss a required constraint
produce valid JSON with bad content
~~~

因此还需要 Eval。

固定 Eval Case 至少可以保存：

~~~text
input
required context
expected constraints
reference evidence
acceptance criteria
risk slice
expected outcome
~~~

版本变更后重新执行同一批 Case，才能比较：

~~~text
task success
factuality
tool selection
schema validity
latency
cost
human-review rate
~~~

真实生产失败在脱敏、裁决后可以进入 regression dataset：

~~~text
Production Failure
→ Root Cause
→ Curate Case
→ Add Regression
→ Verify Fix
~~~

> **Tests validate program contracts; evals validate task behavior.**

这部分的完整方法属于 Chapter 09。

### 8.11.11 Step 10 · Deploy / Trace / Monitor：上线后才开始获得真实证据

部署目标不只是“服务能启动”。

运行时至少需要关联：

~~~text
request / thread
workflow state
agent decision
tool call
tool input / output
artifact version
prompt / model / workflow version
token / latency / cost
validation result
task outcome
~~~

当用户说“结果错了”，Root Cause 可能在完全不同的层：

~~~text
Prompt?
State?
Router?
Tool selection?
Tool response?
Stale external source?
Model generation?
Validator?
~~~

例如模型选择正确、Prompt 也正确，但搜索 Tool 返回过期网页，此时继续改 Prompt 只是在修错层。

因此：

~~~text
Run
→ Trace
→ Eval
→ Diagnose earliest wrong layer
→ Fix
→ Regression
→ Release
→ Monitor
~~~

> **Observability is useful when it tells you where to repair, not merely that something failed.**

### 8.11.12 十步不是瀑布模型，而是一组工程交付物

来源把流程描述为十步顺序。作为教学路径非常清楚，但生产工程不应把它解释成一次性 waterfall。

更准确的是：

~~~text
DEFINE
Task Contract
Repository Contract
Architecture

BUILD
Agent Contracts
Tools
Skills
Context / Memory
Prompt

VERIFY
Tests
Evals

OPERATE
Deploy
Trace
Monitor

LEARN
Production evidence
→ earlier stage
~~~

例如：

~~~text
Eval finds unsupported claims
→ revise Research contract / source policy

Trace finds stale context
→ revise state lifecycle

Tool incidents
→ revise tool contract / retries / source

Repeated Coding Agent mistakes
→ revise repository instructions
~~~

因此每一步都有**可回流的 ownership boundary**。

### 8.11.13 推荐交付物

| Stage | Durable artifact |
|---|---|
| Requirement | Task Contract / Acceptance Criteria |
| Repository | README + engineering rules + agent-facing instructions |
| Architecture | Runtime topology + module ownership + failure paths |
| Agent | Agent Contract + typed input/output |
| Tools | Tool schemas + unit/integration tests |
| Skills | Versioned reusable procedure |
| Context / Memory | State schema + lifecycle / promotion policy |
| Prompt | Versioned instruction bundle |
| Test / Eval | Test suite + versioned eval dataset |
| Production | Deployment config + trace schema + dashboards/runbook |

这些 Artifact 比“用了什么 Agent framework”更能决定项目是否可以长期维护。

### 8.11.14 一张总图

~~~text
                         TASK / PRODUCT CONTRACT
                    goal · boundary · success criteria
                                  │
                                  ▼
                        REPOSITORY CONTRACT
                 structure · tests · instructions · secrets
                                  │
                                  ▼
┌────────────────────────── RUNTIME DESIGN ────────────────────────────┐
│ Workflow topology                                                   │
│      ↓                                                              │
│ Agent contracts → Skills → Tools                                    │
│      │              │        │                                      │
│      └──────────────┴────────┘                                      │
│                     ↓                                               │
│ Context / Working State ↔ Memory                                    │
│                     ↓                                               │
│ Prompt / Policy / Output Schema                                     │
└─────────────────────┬───────────────────────────────────────────────┘
                      ▼
                TEST + EVALUATION
                      ▼
             DEPLOY / TRACE / MONITOR
                      ▼
           ROOT CAUSE / DATASET / FIX
                      └──────────────↺
~~~

与整本 Handbook 的对应关系：

~~~text
Ch06
→ Tools / Skills / Capability / Authorization

Ch07
→ Context / State / Memory

Ch08
→ Workflow / Agent / Orchestration / Lifecycle

Ch09
→ Test / Eval / Trace / Monitoring / Learning Loop
~~~

### 8.11.15 Source boundary

Primary source:

- 用户提供的视频转录：大昀懂点技术，《十分钟从0到1拆解 AI Agent 的搭建》

Source-derived elements retained:

- 从需求、项目规范、架构、Agent、Tools、Skills、Context/Memory、Prompt、Test/Eval 到部署监控的完整工程路径；
- Goal / Input / Output / Boundary / Success Criteria；
- Workflow 管确定性流程、Agent 管需要判断的部分；
- Agent Contract、Tool 单一职责、Skill = 可复用方法；
- Context 与 Memory 按当前任务/长期价值区分；
- Test 与 Eval 分工；
- Trace 用于定位问题发生在哪一层；
- 生产失败回流改进与回归。

Handbook engineering refinements:

- 把“十步”定义为可回流 lifecycle，而不是固定 waterfall；
- 把目录结构降级为一种实现模板，模块拆分依据真实责任/状态/权限/失败边界；
- 将 AGENTS.md 限定为 Codex 的项目 instruction example，并推广为 tool-specific agent-facing repository instructions；
- 补充 Agent Contract 的 Stop / Escalation / Permission / Validation；
- 补充 Tool 的 error model / timeout / idempotency；
- 补充 Memory promotion lifecycle；
- 把 Prompt 纳入 version metadata；
- 把 Test/Eval/Production Failure 连成 regression learning loop。

External verification:

- OpenAI Codex docs confirm hierarchical `AGENTS.md` / `AGENTS.override.md` project instructions.
- OpenAI Harness Engineering recommends keeping `AGENTS.md` compact and using it as a map into deeper repository sources of truth rather than an encyclopedia.

Sources:
- https://developers.openai.com/codex/guides/agents-md
- https://openai.com/index/harness-engineering/

## 8.12 Agent Architecture Selection：把“7 种架构”改写成可组合 Pattern Matrix

很多架构讨论会把 Agent 系统排成一条线：

~~~text
Single Agent
→ ReAct
→ Plan & Execute
→ Multi-Agent
→ Route + Skill
→ Blackboard
→ Graph Workflow
~~~

这适合作为教学记忆，但不适合作为生产选型模型。

这些名称其实混合了不同维度：

~~~text
Single Agent / Multi-Agent
→ how many decision-making actors?

ReAct / Plan & Execute
→ how does one actor decide and schedule actions?

Route + Skill
→ how are capabilities selected?

Blackboard / Shared State
→ how do workers coordinate through state?

Graph Workflow
→ how is control flow represented and persisted?
~~~

因此更准确的规则是：

> **Agent architectures are composable control patterns, not a maturity ladder.**

一个真实系统完全可能是：

~~~text
Router
→ Skill
→ bounded ReAct loop
→ Graph checkpoint
→ Human approval
~~~

或者：

~~~text
Graph Workflow
├─ deterministic node
├─ planner node
├─ multi-agent subgraph
└─ tool execution node
~~~

### 8.12.1 选型先看控制问题，而不是架构名字

在选 Pattern 前，先回答七个问题：

~~~text
1. Task uncertainty
   任务路径是固定，还是每一步都需要动态判断？

2. Capability cardinality
   能力集合是有限且可描述，还是开放式探索？

3. State topology
   需要单一 working state、多个隔离 context，还是共享 state？

4. Control topology
   是否需要 branch / join / loop / retry / checkpoint / resume？

5. Coordination
   是否存在真实的并行、专业化、权限或工具边界？

6. Reliability requirement
   失败后要从哪里恢复？副作用能否重放？是否需要 HITL？

7. Cost / latency envelope
   每一步调用强模型是否可接受？能否缓存、并行、降级？
~~~

最终选择的不是一个标签，而是一组 control mechanisms。

### 8.12.2 Pattern 1 · Single Agent / Tool-using Agent

最小形态：

~~~text
User
→ Agent
→ Tool(s)
→ Response
~~~

适合 bounded goal、small tool set、short horizon、single permission boundary、limited state 和 clear stop condition。

优势：

~~~text
simple runtime
low coordination overhead
low implementation cost
fast iteration
~~~

风险：

~~~text
too many tools
too much context
unclear stop condition
mixed permissions
long action horizon
~~~

问题不在“一个 Agent 天生弱”，而在它的责任边界不断扩张。

> **Prefer one bounded Agent until real control boundaries justify more structure.**

### 8.12.3 Pattern 2 · ReAct-style iterative loop

ReAct 的稳定抽象不是把隐藏 Chain of Thought 暴露出来，而是：

~~~text
Observe
→ decide next action
→ execute action
→ observe result
→ continue / stop
~~~

它适合 unknown number of steps、interactive information gathering、tool choice depends on previous result 和 exploratory task。

典型代价：

~~~text
one decision cycle per action
longer trajectories
token / latency accumulation
loop drift
stop-condition failure
tool-error propagation
~~~

但不能因此得出“ReAct 不适合生产”。

生产化 ReAct 通常会加：

~~~text
max_steps
tool allowlist
budget
timeout
state schema
validation gate
checkpoint
fallback
human approval
~~~

于是它更像 bounded local Agent loop inside a controlled runtime，而不是无限自主循环。

> **ReAct is a local decision pattern; production reliability comes from the runtime around the loop.**

Source:
- ReAct: Synergizing Reasoning and Acting in Language Models, Yao et al., 2022.

### 8.12.4 Pattern 3 · Plan & Execute

核心是把：

~~~text
decide one step
→ execute
→ decide one step
~~~

改成：

~~~text
Plan
→ execute plan steps
→ verify
→ re-plan or finish
~~~

适合 multi-step task、dependency-heavy work、longer execution horizon，以及 global decomposition 有帮助的任务。

优势不是“计划一次就永远正确”，而是**把全局分解和局部执行分离**。

生产设计通常需要：

~~~text
plan schema
step dependencies
plan version
step status
verification
re-plan trigger
max re-plans
~~~

如果没有 re-plan / verification，初始计划错误确实容易传播；但成熟 Plan & Execute 本身可以显式重规划。

> **Plan & Execute should separate planning from execution without freezing a bad plan forever.**

LangChain 早期 Plan-and-Execute 资料也明确讨论了重新规划和调整计划的必要性。

### 8.12.5 Pattern 4 · Multi-Agent

Multi-Agent 不等于：

~~~text
Planner Agent
Reviewer Agent
Executor Agent
~~~

然后三个角色用同一个 Context、同一组 Tool、同一权限和同一个 Model。

真正值得拆的依据仍然是本章 8.5 的 Operational Boundary：

~~~text
different context
different permission
different tool environment
different model / cost policy
independent evaluation
parallelizable work
failure isolation
real handoff boundary
~~~

Multi-Agent 可以采用 Supervisor → Workers、Router → Specialists、Handoff、Peer collaboration、Subagent delegation 等模式。

它的成本包括：

~~~text
handoff ambiguity
duplicated context
communication overhead
coordination latency
conflicting state
more tracing surface
more evaluation surface
~~~

所以“多个 Agent 会自动减少 Context Pollution”并不成立。只有明确隔离 Context 和 Handoff Contract 才可能减少污染。

> **Multi-Agent is a coordination pattern, not a cure for an overloaded single Agent.**

### 8.12.6 Pattern 5 · Router + Skill

结构：

~~~text
Request
→ Router
→ Candidate Skill(s)
→ Decision Gate
→ Skill / Workflow
→ Validation
~~~

它特别适合：

~~~text
known capability catalog
clear skill boundaries
high-frequency routing
independent skill evaluation
cacheable / reusable procedures
permission-aware capability selection
~~~

它的真正价值不是“不要让模型想”，而是：

~~~text
open-ended reasoning
→ bounded candidate space
→ explicit capability contract
→ measurable routing decision
~~~

这让系统可以独立测 Candidate Recall@K、Top-1、No-Match Accuracy、Clarification Accuracy、Unauthorized Exposure、E2E Task Success、Latency 和 Cost。

但当任务高度组合式、开放探索、需要动态生成新步骤时，Router + Skill 通常需要再组合 Planner / Graph / Agent Loop。

> **Route + Skill is strongest when the capability space is explicit enough to retrieve, rank, authorize, and evaluate.**

它不是所有 AI Coding 或企业 Agent 的统一最优架构。

### 8.12.7 Pattern 6 · Shared State / Blackboard-like Coordination

经典 Blackboard 思想可以抽象为：

~~~text
Shared State / Workspace
        ↑   ↑   ↑
   Worker A B C
        ↓   ↓   ↓
state change triggers new work
~~~

它适合多个独立处理单元围绕一个共享工作对象协作。

Agent 系统里的类似形态可能是 research findings、draft、review comments、open tasks、artifact status，由不同 Worker 读取和更新。

优势：

~~~text
shared situational awareness
decoupled workers
incremental refinement
~~~

代价：

~~~text
write conflicts
state ownership ambiguity
stale reads
hard causal attribution
large shared state
implicit triggering
~~~

因此需要 typed state、reducer / merge rule、ownership、versioning、event / transition log 和 conflict policy。

LangGraph 有共享 State、Reducer、Checkpoint 等机制，因此可以实现某些 Blackboard-like workflow；但：

> **LangGraph is not synonymous with the Blackboard architecture.**

LangGraph 是更一般的 stateful orchestration runtime。

### 8.12.8 Pattern 7 · Explicit Graph / Workflow Orchestration

Graph / Workflow 的核心不是“最重、最企业级”，而是把控制流显式化：

~~~text
State
→ Node
→ Transition
→ State Update
→ Next Node(s)
~~~

当需要以下能力时价值明显：

~~~text
branch
join
parallelism
loop
retry topology
checkpoint / resume
human approval
failure isolation
long-running execution
explicit audit path
~~~

一个重要校正：

~~~text
Graph Workflow
≠
DAG only
~~~

DAG 适合没有循环依赖的 pipeline，但 Agent Workflow 常常需要 retry loop、repair loop、human resume、re-plan loop。

LangGraph 官方定位是 long-running、stateful agent orchestration，并提供 durable execution、persistence、human-in-the-loop 等能力；它允许循环图，而不是只做 DAG。

> **Use a graph when control-flow topology itself is part of the application contract.**

### 8.12.9 Framework 名称不要和 Pattern 混为一谈

视频把 LangGraph、Temporal、n8n、Perfect 放在 Graph Workflow 一组。这里需要拆开。

#### LangGraph

定位：

~~~text
stateful agent/workflow orchestration
deterministic + agentic control
persistence / checkpoint
HITL
streaming
~~~

适合 Agent-specific stateful orchestration。

#### Temporal

定位更接近：

~~~text
durable workflow execution platform
long-running application workflow
failure recovery
reliable continuation
~~~

Temporal 官方强调工作流在 crash、network failure、infrastructure outage 后继续执行。

它可以承载 Agent workflow，但不是“Agent Graph pattern”的同义词。

#### Prefect

视频里的 Perfect 应为 Prefect。

Prefect 官方把自己定位为 workflow orchestration tool，重点包括 flow / task、dependency tracking、failure handling、deployment、monitoring 和 data pipeline orchestration。

可以编排 AI/Agent 任务，但它的核心定位不是 LLM Agent runtime。

#### n8n

n8n 官方定位为 workflow automation tool，并支持 AI functionality / tools。

它适合 integration-heavy workflow、business automation、low-code orchestration 和 API/app connectivity，也可以包含 Agent 节点，但仍然是更广义的 automation platform。

因此：

> **Choose the runtime for its execution guarantees and integration model, not because all orchestration tools are “Agent frameworks.”**

### 8.12.10 Pattern 不是互斥的：生产系统往往组合

一个更现实的企业系统：

~~~text
Request
  ↓
Route + Skill
  ↓
Graph Workflow
  ├─ deterministic validation
  ├─ bounded ReAct research loop
  ├─ Plan & Execute subflow
  ├─ human approval
  └─ tool execution
  ↓
Checkpoint / Trace / Eval
~~~

也可能有 Multi-Agent subgraph：

~~~text
Graph
├─ Research Agent
├─ Policy Gate
├─ Writer Agent
└─ Reviewer Agent
~~~

这比问“七种架构选哪一个”更接近真实工程。

### 8.12.11 Selection Matrix

| Requirement | First pattern to consider | Why |
|---|---|---|
| 单一、短任务、小 Tool 集 | Bounded Single Agent | 最少协调复杂度 |
| 每步依赖刚获得的信息 | ReAct-style loop | 局部动态决策 |
| 长任务需要先分解 | Plan & Execute | 分离全局规划与局部执行 |
| 能力集合明确、请求高频 | Router + Skill | 可检索、可评估、可缓存 |
| 真实专业化 / 权限 / Context 隔离 | Multi-Agent | 独立 operational boundary |
| 多 Worker 围绕共享工作对象 | Shared State / Blackboard-like | 协同更新共享状态 |
| branch/join/loop/recovery/HITL 是业务规则 | Graph / Workflow | 控制流显式、可持久化 |
| Crash 后必须可靠恢复长流程 | Durable Workflow Runtime | execution guarantee 优先 |

### 8.12.12 Architecture Selection Scorecard

不要用“复杂度高，所以 Multi-Agent”这种单变量判断。

可以按 0–2 做定性评估：

| Axis | 0 | 1 | 2 |
|---|---|---|---|
| Path uncertainty | 固定 | 少量分支 | 高度动态 |
| Tool/capability set | 少且固定 | 中等 | 大且动态 |
| State horizon | 单请求 | 多轮 | 长任务 / durable |
| Branch/join | 无 | 少量 | 核心拓扑 |
| Parallelism | 无 | 可选 | 关键收益 |
| Permission boundaries | 单一 | 少量 | 多角色/高风险 |
| Recovery | 失败重跑即可 | 局部重试 | checkpoint / reconciliation |
| Coordination | 单 actor | delegate | 多 actor / shared state |

它不是自动算分器，而是帮助识别真正需要增加哪一种控制机制。

### 8.12.13 推荐演进路线

与其：

~~~text
Single → ReAct → Plan → Multi-Agent → Graph
~~~

更建议：

~~~text
Start:
minimal deterministic workflow
+ one bounded Agent where uncertainty exists

Then add only when evidence demands it:

unknown step count
→ bounded Agent loop

global decomposition problem
→ planning / replanning

large capability catalog
→ Router + Skill

parallel or isolated operational boundaries
→ Multi-Agent / subgraphs

complex shared state
→ typed shared state / reducers

recovery / branch / join / HITL
→ explicit Graph / durable workflow
~~~

> **Add a control pattern when it solves an observed failure mode—not because it sits later on an architecture diagram.**

### 8.12.14 Failure-driven architecture selection

从失败反推 Pattern 往往更可靠：

~~~text
tool overload
→ capability routing / skill retrieval

loop never stops
→ bounded loop + stop gate

plan drifts
→ verification + re-plan

context pollution
→ context isolation / state schema

permission mixing
→ operational split / policy gate

parallel work serialized
→ branch / join

crash causes full restart
→ checkpoint / durable execution

shared state conflicts
→ typed reducer / ownership / versioning
~~~

架构的目标不是“看起来高级”，而是让 failure mode 有明确 owner 和 recovery path。

### 8.12.15 Source boundary

Primary source:

- 用户提供的视频转录：码首是粘，《如果从零搭一个 Agent 系统，你会选什么架构？》

Source-derived elements retained:

- Single Agent、ReAct、Plan & Execute、Multi-Agent、Route + Skill、Blackboard、Graph Workflow 七类教学框架；
- 架构应按场景选择而不是追求统一最优；
- Route + Skill 强调能力路由；
- Blackboard 强调共享状态；
- Graph 强调显式控制流、重试、并行、恢复。

Handbook corrections / refinements:

- 七类不是同一维度、不是互斥架构，也不是严格成熟度演进链；
- ReAct 不被归类为“天然不适合工程化”，而是需要 bounded runtime；
- Plan & Execute 增加 verification / re-plan，不接受“计划错了必然全盘崩”作为固有属性；
- Multi-Agent 不假设自动消除 Context Pollution；
- Route + Skill 不被描述成 AI Coding / 企业 Agent 的普遍最优方案；
- LangGraph 不等于 Blackboard；
- Graph Workflow 不要求 DAG；
- 视频中的 Perfect 更正为 Prefect；
- LangGraph / Temporal / Prefect / n8n 按各自 execution model 和 product positioning 区分。

External verification:

- ReAct paper: Yao et al., 2022.
- LangChain Plan-and-Execute / Planning Agents material.
- LangGraph official reference and checkpoint documentation.
- Temporal official documentation.
- Prefect official documentation.
- n8n official documentation.

Sources:
- https://arxiv.org/abs/2210.03629
- https://www.langchain.com/blog/plan-and-execute-agents
- https://blog.langchain.dev/planning-agents/
- https://docs.langchain.com/oss/python/langgraph/graph-api
- https://docs.langchain.com/oss/python/langgraph/persistence
- https://docs.temporal.io/
- https://docs.prefect.io/v3/get-started/quickstart
- https://docs.n8n.io/

## 8.13 Multi-Agent Conflict Control：不要用“投票”代替 Harness

Multi-Agent 系统里出现分歧并不奇怪。真正需要工程化的是：

~~~text
What kind of conflict is this?
→ Who has authority?
→ What evidence can resolve it?
→ Which state transition is allowed?
→ What happens if it still cannot be resolved?
~~~

一个实用分类是：

~~~text
Authority Conflict
→ 主 Agent / Worker / Reviewer 对“应该做什么”意见不一致

Quality Conflict
→ Worker 与 Reviewer 对“结果是否合格”意见不一致

Resource Conflict
→ 多个 Worker 同时修改同一任务、文件或共享状态
~~~

它们分别需要不同的 Control Plane：

~~~text
Authority
→ role / policy / escalation

Quality
→ validator / evidence / bounded repair

Resource
→ ownership / isolation / versioning / concurrency control
~~~

> **Multi-Agent conflict is not one problem. It is an authority problem, an evidence problem, or a shared-state concurrency problem.**

### 8.13.1 为什么“少数服从多数”通常不是默认答案

假设三个 Agent 都输出：

~~~text
“应该重构鉴权模块”
~~~

这不意味着你获得了三份独立证据。

如果它们：

~~~text
same model
same prompt family
same retrieved context
same tool results
same hidden assumptions
~~~

那么：

~~~text
3 votes
≠
3 independent observations
~~~

多数投票可以是有用的 ensemble 技术，但前提是你明确设计了：

~~~text
diverse evidence
diverse model / prompt policy
independent sampling
calibrated aggregation
known error correlation
~~~

否则“3:1”可能只是 correlated error。

因此 Harness 应优先聚合：

~~~text
evidence
tests
tool observations
source provenance
policy constraints
~~~

而不是先聚合 vote count。

> **Count independent evidence before counting Agent opinions.**

### 8.13.2 “裁判 Agent”不是错，Opinion-only Judge 才危险

另一个常见极端是：

~~~text
Worker says A
Reviewer says B
→ call Judge Agent
→ Judge chooses one
~~~

如果 Judge 只读取两段自然语言意见，再凭主观判断选边，它只是把 conflict 移到第三个模型调用。

但 Judge / Evaluator 可以很有价值，如果它被限制为：

~~~text
fixed rubric
explicit acceptance criteria
read-only evidence
reproducible commands
structured output
confidence / unverified fields
no direct mutation authority
~~~

更稳的层级是：

~~~text
deterministic check
        ↓
structured evidence evaluator
        ↓
contextual model judge
        ↓
human / policy escalation
~~~

而不是默认：

~~~text
Agent disagreement
→ more Agent opinion
~~~

> **A reviewer becomes reliable when it produces inspectable evidence, not merely a stronger opinion.**

### 8.13.3 Conflict A · Authority Conflict：主从分歧

例子：

~~~text
Lead:
“重构 authentication module”

Research Sub-Agent:
“当前耦合严重，缺少测试，建议先补 characterization tests”
~~~

这里首先要区分：

~~~text
truth authority
≠
execution authority
~~~

Sub-Agent 可能更接近局部事实，但不一定拥有改变全局计划的权限。

推荐结构：

~~~text
Sub-Agent
→ return finding
→ include evidence / uncertainty / blocking risk

Lead / Orchestrator
→ must incorporate finding
→ re-evaluate plan

Policy / Authority Gate
→ within delegated authority?
   ├─ yes → Lead decides
   └─ no  → user / human / policy owner
~~~

一个 Authority Matrix 可以是：

| Decision | Default authority |
|---|---|
| 局部调研结论 | Specialist / evidence owner |
| Task routing / reassignment | Lead / Orchestrator |
| 高风险 destructive action | Policy + Human approval |
| 超出预算 / Scope | User / business owner |
| Security exception | Security policy owner |
| Final factual claim | Evidence + Validator, not role rank |

所以：

> **The Lead may own orchestration without owning truth.**

### 8.13.4 Context Isolation：Sub-Agent 应该带独立上下文边界

Sub-Agent 的一个真实价值是隔离：

~~~text
local instructions
local task context
local tool surface
local execution history
local failure
~~~

Anthropic 当前公开 guidance 也建议在以下场景使用 subagents：

~~~text
parallel work
isolated context
independent workstreams
~~~

但不要把某个内部函数名当成稳定架构契约。

更稳定的工程抽象是：

~~~text
spawn subtask
→ choose fresh / inherited context
→ choose tool permissions
→ run independently
→ return bounded artifact
~~~

对于只负责调研 / 验证的 Agent，最好限制 mutation surface：

~~~text
read
search
run tests / diagnostics

but no:
edit
commit
deploy
delete
~~~

具体工具权限机制因 runtime 而异。Claude Code CLI 公开支持 allowed / disallowed tool policy；这比依赖未经公开保证的内部实现名更适合作为 Handbook 知识。

### 8.13.5 Conflict B · Quality Conflict：Worker vs Reviewer 死循环

典型坏循环：

~~~text
Worker
→ implement

Reviewer
→ “还有问题”

Worker
→ modify

Reviewer
→ “仍然有问题”

↺ forever
~~~

问题通常不是“缺少更聪明的 Reviewer”，而是缺少：

~~~text
acceptance criteria
evidence contract
repair budget
state transition
stop / escalation policy
~~~

推荐把 Reviewer 拆成 Verifier / Evaluator：

~~~text
Input:
artifact
acceptance criteria
test plan

Allowed actions:
read
run deterministic commands
probe boundary cases
inspect traces

Output:
PASS
FAIL
PARTIAL

+ evidence
+ exact command
+ observed output
+ failed criterion
+ unverified criterion
~~~

对于 Coding Agent，Verifier 可以主动测试：

~~~text
unit / integration
concurrency
boundary values
idempotency
permission failure
timeout / cancellation
migration / rollback
~~~

但它最好默认不修改被审查 Artifact。

> **Verification should produce repair instructions backed by evidence, not free-form criticism.**

这与本章已有原则一致：

> **Evaluation should produce repair instructions, not only scores.**

### 8.13.6 Bounded Repair Loop：任何 Review 都必须有停止条件

将 Worker / Reviewer 建模成状态机：

~~~text
READY
  ↓
IMPLEMENTING
  ↓
VERIFYING
  ├─ PASS → COMPLETED
  ├─ FAIL + repairable → REPAIR
  │                       ↓
  │                  IMPLEMENTING
  └─ FAIL + exhausted / ambiguous
                          ↓
                       ESCALATE
~~~

至少显式保存：

~~~text
attempt_count
max_attempts
failed_criteria
last_evidence
artifact_version
owner
status
~~~

如果任务从 COMPLETED 被重新打开，应明确：

~~~text
old completion invalidated
→ previous owner retained or released by policy
→ new revision
→ fresh verification required
~~~

不要让 Agent 自己在自然语言里隐式决定状态。

### 8.13.7 Dependency Gate：先阻止不该开始的工作

很多所谓“Agent 冲突”其实是调度错误。

例如：

~~~text
Task B depends on Task A
~~~

如果 A 还没有稳定输出，B 就开始写代码：

~~~text
parallelism
→ stale assumption
→ rework
→ reviewer conflict
~~~

更好的做法：

~~~text
Task DAG

A
↓
B

B.ready = false
until
A.status = completed
~~~

DeepSeek Harness 当前实验性 Agent Teams 就采用 durable task DAG：blockedBy 保存任务依赖，只有 blocker 满足后任务才 ready。

因此：

> **The cheapest conflict resolution is preventing an invalid concurrent schedule.**

### 8.13.8 Conflict C · Resource Conflict：多个 Worker 同时写共享资源

这是最接近传统并发控制的问题。

不要靠 Prompt：

~~~text
“大家注意不要改同一个文件”
~~~

应使用多层控制：

~~~text
1. Ownership partition
2. Write-scope detection
3. Isolated workspace where needed
4. Version / CAS check
5. Merge / validation gate
~~~

#### Layer 1 · Read parallel, write deliberately

可以并行的通常包括：

~~~text
search
read files
run independent analysis
query read-only systems
~~~

需要谨慎并发：

~~~text
edit same file
write shared state
run formatter on shared tree
generate overlapping artifacts
deploy
mutate database
~~~

一些 Agent runtime 会直接把 Tool 标成 parallel-safe 或 exclusive。DeepSeek Harness 当前 Tool runtime 就区分可安全并行的调用与 ordering-barrier 式 exclusive calls。

#### Layer 2 · Explicit Ownership

任务至少带：

~~~text
owner
write_scope
dependencies
artifact ids
~~~

例如：

~~~text
worker-a
→ src/auth/**

worker-b
→ tests/payment/**
~~~

但：

> **Write scope is a warning / coordination contract unless the storage layer actually enforces it.**

DeepSeek Harness 当前 Agent Teams 的 writeScopes 就明确是 advisory path prefixes：会产生 overlap warning，但不是 lock，也不授予写权限。

#### Layer 3 · Workspace Isolation

跨 Agent 并行修改代码时，一个通用方案是：

~~~text
Worker A → worktree / branch A
Worker B → worktree / branch B

                 ↓
             Merge Gate
                 ↓
          conflict / tests / review
~~~

这把：

~~~text
concurrent mutation conflict
~~~

推迟成：

~~~text
explicit merge conflict
~~~

更容易审计和恢复。

但要区分 runtime guarantee 与 deployment strategy：DeepSeek Harness 当前 Agent Teams 官方文档明确说明不会自动创建 worktree；所有成员默认共享 checkout。Worktree isolation 可以由 deployment / prompt / external harness 安排，但不是它当前 Team runtime 的内建保证。

#### Layer 4 · Compare-and-Set / stale-write rejection

共享任务或状态更新可以采用：

~~~text
read version = 17
modify
write(expected_version = 17)

if current_version != 17:
    reject stale update
~~~

DeepSeek Harness 的 Team Task 当前就是这种语义：

~~~text
task.revision
+ expectedRevision
→ compare-and-set
~~~

陈旧 mutation 会被拒绝。

需要注意：

> **Task-board CAS does not automatically prevent file-content races.**

DeepSeek Harness 还在 filesystem observation policy 中实现了基于已观察版本的 stale-write rejection；但 Bash、formatter、generator 或外部 writer 仍可能绕过这一层。

所以生产系统仍需：

~~~text
CAS
+ ownership
+ isolation
+ final diff / merge validation
~~~

而不是单靠一个 revision number。

### 8.13.9 DeepSeek Harness：哪些视频细节有一手依据

当前官方 / source-backed Agent Teams 设计确实包括：

~~~text
Lead + durable teammates
durable mailbox
shared task DAG
task ownership
blockedBy dependencies
monotonic task revision
CAS mutation
write-scope overlap warnings
Lead-only teammate creation / interruption
~~~

而且官方文档明确写出：

~~~text
writeScopes
= advisory
≠ lock
~~~

以及：

~~~text
shared checkout
= default

automatic worktree isolation
= not runtime behavior
~~~

这两个细节非常重要，因为它们避免把“warning”误写成“并发安全保证”。

### 8.13.10 Cordis Reversible Effects：解决的是生命周期污染，不是观点冲突

DeepSeek Harness 建在 Cordis plugin system 上。当前官方架构说明：

~~~text
plugin registers service / listener / tool / resource
→ registration owned by plugin context
→ plugin unloads
→ reversible effects unwind
~~~

这很适合防止：

~~~text
failed plugin
stale registration
dangling timer
orphan listener
resource leakage
~~~

但它解决的是 runtime lifecycle cleanup，不是：

~~~text
Lead vs Worker disagreement
Reviewer disagreement
file merge conflict
~~~

所以更准确的说法是：

> **Reversible effects prevent lifecycle residue; they are not a conflict-resolution policy by themselves.**

### 8.13.11 Conflict Control Matrix

| Conflict | Bad default | Better control |
|---|---|---|
| Lead vs Specialist | role rank ignores evidence | authority matrix + evidence + escalation |
| Agent vote | majority = truth | evidence diversity + calibrated aggregation |
| Worker vs Reviewer | endless critique loop | evidence-producing verifier + repair budget |
| Task dependency | everybody starts immediately | DAG readiness / blocker gate |
| Same-file edit | prompt-based coordination | ownership + isolation + merge gate |
| Shared task mutation | last-write-wins | revision / CAS |
| Write scope overlap | assume owner = lock | warning + real storage/workspace control |
| Runtime cleanup | trust agent to undo | lifecycle-owned reversible effects |

### 8.13.12 Observability：每次冲突都要能解释为什么这样解决

Trace 至少记录：

~~~text
conflict_type
actors
task / artifact ids

authority_before
authority_after

evidence_refs
validator_result

revision_before
revision_after

retry_count
repair_count

escalation_reason
human_decision

workspace / branch
merge_result
~~~

否则你只能看到：

~~~text
Agent A said X
Agent B said Y
final = X
~~~

却无法回答：

~~~text
why X?
what evidence?
who had authority?
what changed?
was the losing evidence preserved?
~~~

### 8.13.13 Eval：测试的不只是最终答案

至少建立这些 slices：

~~~text
correlated-majority trap
specialist correctly blocks unsafe Lead plan
specialist wrong, Lead correctly overrides
reviewer hallucinates a bug
reviewer finds reproducible bug
repair budget exhausted
blocked task cannot start
stale task revision rejected
overlapping write scopes detected
isolated parallel edits merge cleanly
merge conflict routed to owner
high-risk decision escalates to human
~~~

指标：

~~~text
conflict-resolution accuracy
unsupported-review rate
evidence-backed rejection rate
repair-loop length
escalation precision
stale-write rejection rate
write-conflict rate
merge-failure rate
time-to-resolution
cost per successful task
~~~

> **A reliable Multi-Agent system is not one where Agents rarely disagree; it is one where disagreement has a deterministic resolution path.**

### 8.13.14 面试回答模板

如果面试官问：

> “生产级 Multi-Agent 怎么解决冲突？”

可以回答：

> 我不会把所有冲突都交给投票或另一个裁判 Agent，因为同源 Agent 的票数不等于独立证据。生产上我会先把冲突分成三类。第一类是 Authority Conflict，例如 Lead 和 Specialist 对下一步有分歧，我会让 Specialist 返回带证据的 finding，Lead 负责全局编排，但高风险或超出授权的决策交给 Policy / Human Gate；Lead 有 orchestration authority，不代表它天然拥有 truth authority。第二类是 Worker 和 Reviewer 的 Quality Conflict，我会用只读 Verifier 执行测试、边界值和并发探测，输出 PASS / FAIL / PARTIAL、命令和实际 evidence，再通过有 max-attempts 的 repair state machine 控制回退，避免无限打回。第三类是多个 Worker 的 Resource Conflict，读操作可以并行，写操作要做 ownership / write scope 管理；必要时每个 Worker 使用独立 worktree / branch，最后通过 Merge Gate；共享 task board 或状态再加 revision / CAS，拒绝 stale update。像 DeepSeek Harness 当前 Agent Teams 就有 task DAG、revision CAS 和 write-scope overlap warning，但它明确说明 writeScopes 不是 lock，默认也是 shared checkout，所以还需要真正的 workspace / storage isolation。核心不是让 Agent 不冲突，而是让每类冲突都有明确 authority、evidence、state transition 和 recovery path。

### 8.13.15 Source boundary

Primary source:

- 用户提供的视频总结：字节跳动 Agent 面试题，围绕 Multi-Agent 主从分歧、Worker/Reviewer 质检对抗和并发写冲突。

Source-derived elements retained:

- 多数投票可能受同源错误影响；
- 主从意见冲突需要显式裁决与 escalation；
- Reviewer 应产出可验证证据；
- Review / Repair 需要状态机和停止条件；
- 并行写需要串行化、隔离或版本控制；
- Git worktree 是 Coding Agent 隔离写工作区的一种可行策略；
- CAS / optimistic concurrency 和路径重叠检测可以降低共享状态冲突。

Handbook corrections / synthesis:

- 多数投票不是绝对错误；在真正独立、多样、可校准的 ensemble 中仍可能有价值；
- Judge Agent 也不是绝对错误；关键是 rubric、证据、可复现验证和权限边界；
- “Lead 最终裁决”改成 authority matrix：Lead 可以拥有 orchestration authority，但高风险决策仍由 Policy / Human Gate 控制；
- 未保留未经公开一手资料支持的 Claude Code 内部函数名 createSubagentContext；
- Anthropic 官方公开 guidance 支持将 subagent 用于 isolated context / independent workstream，并公开 Tool allow/disallow policy；
- DeepSeek Harness 当前实验性 Agent Teams 一手资料确认 task DAG、CAS revision、write-scope overlap warning、Lead-only teammate lifecycle；
- 明确 DeepSeek writeScopes 只是 advisory，不是 lock；
- 明确 DeepSeek Harness 当前不会自动创建 Git worktree，worktree isolation 是 deployment / external harness strategy；
- 区分 task-board CAS 与真实 filesystem write conflict；
- Cordis reversible effects 被定位为 lifecycle cleanup，而不是 Agent disagreement 的通用仲裁机制。

External verification:

- Anthropic Claude prompting / subagent orchestration guidance.
- Anthropic Claude Code CLI tool allow/disallow policy.
- DeepSeek Harness Agent Teams subsystem / tool catalog / implementation notes.
- DeepSeek Harness filesystem stale-version policy.
- DeepSeek Harness Cordis architecture and reversible effects.

Sources:

- https://code.claude.com/docs/en/sub-agents
- https://docs.anthropic.com/en/docs/claude-code/cli-usage
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/agent-team.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-catalog.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/feature/2026-08-05-agent-teams.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/architecture/2026-06-26-file-context-as-event-gate.md
- https://www.deepseek.com/harness/en/

## 8.14 Effective Agent Harness：Simplicity、Transparency 与 ACI

“模型更强 + Tool 更多 + Prompt 更长”并不会自动得到更好的 Agent。模型能力只是一个输入变量，真实系统效果还取决于 Harness 如何组织 Context、Tool、Environment Feedback、State、Validation 与 Human Control。

Anthropic 在 Building Effective Agents 中把 Agent 实现原则压缩成三点：

~~~text
Simplicity
→ maintain simplicity in agent design

Transparency
→ explicitly expose planning / execution progress

ACI · Agent-Computer Interface
→ carefully design and test the interface between model and environment
~~~

这三点与本章已有原则是一致的：

> **Use the least control-flow complexity necessary.**

更完整地说：

~~~text
Capable Model
      │
      ▼
Harness
├─ Prompt / Context
├─ Tool Surface / ACI
├─ State / Session
├─ Environment Feedback
├─ Permission / Sandbox
├─ Validation
└─ Trace / Eval
      │
      ▼
Reliable Task Execution
~~~

因此：

> **Model capability determines what may be possible; the harness determines how reliably that capability can be turned into repeatable work.**

### 8.14.1 Simplicity：只为已经观察到的控制问题增加复杂度

一个常见错误是从目标倒推框架名：

~~~text
Need AI feature
→ Agent
→ Graph
→ Multi-Agent
→ many tools
→ many abstractions
~~~

更合理的升级顺序是：

~~~text
single model call
→ retrieval / structured output
→ tool-using loop
→ explicit workflow
→ state graph
→ multi-agent coordination
~~~

只有当下一层复杂度能解决一个**已经明确存在**的问题时才升级，例如：

~~~text
fixed pipeline cannot express retry
→ add explicit retry state

single context causes permission collision
→ split context / worker boundary

one agent cannot safely parallelize writes
→ add ownership / isolation

simple tool loop cannot resume long task
→ add durable checkpoint
~~~

框架本身不是问题；真正的问题是 abstraction 是否把关键边界藏起来：

~~~text
actual prompt?
actual model input?
tool schema?
state transition?
retry policy?
stop condition?
permission decision?
tool result?
~~~

如果这些问题难以回答，生产调试成本会快速上升。

> **Use the highest-level abstraction that still leaves important control boundaries inspectable.**

Anthropic 的原始建议也是：从简单 Prompt 开始，先做 comprehensive evaluation，只有简单方案确实不足时才加入 multi-step agentic system。

### 8.14.2 Tool Minimalism：减少语义重叠，不是机械减少 Tool 数量

“工具越少越好”是有用直觉，但不应变成绝对规则。

真正的问题是 **tool decision boundary**：

~~~text
search
grep
find
ls
scan
lookup
browse
~~~

如果这些 Tool 的适用边界高度重叠，模型每轮都必须额外解决：

~~~text
which one?
which parameter shape?
which path semantics?
which one returns enough evidence?
~~~

这会增加 tool-selection entropy。

更好的目标是：

> **Minimize overlapping ways to express the same action; keep distinct capabilities when their boundaries are operationally meaningful.**

例如一个 Coding Agent 可以让 Bash 承担多种成熟 shell 操作，从而减少重复 file-search tools；但如果专用 search tool 能提供更安全的权限、更稳定的结构化输出、更好的远端执行语义或明显更高的成功率，那么保留专用 Tool 反而合理。

所以 Tool Registry 应同时考虑：

~~~text
semantic overlap
model familiarity
schema complexity
permission boundary
failure semantics
latency / cost
observability
environment portability
~~~

而不是只优化 tool_count。

### 8.14.3 Pi：Minimal Harness 的一个当前实现例

截至 2026-09-28，Pi 当前源码默认给 coding agent 启用：

~~~text
read
bash
edit
write
~~~

另外还存在 grep / find / ls 等可选 built-in tools。

Pi 的 system prompt 会根据当前 selected tools 组装 Tool 描述和 guidelines。例如只有 Bash 而没有 grep / find / ls 时，会追加：

~~~text
Use bash for file operations like ls, rg, find
~~~

这个设计展示了两个可复用原则：

~~~text
tool surface
→ should match actual enabled capability

prompt guidance
→ should be generated from the same capability state
~~~

否则会出现：

~~~text
Prompt says a tool exists
but runtime disabled it

or

Runtime exposes a tool
but Prompt gives no usage boundary
~~~

> **Prompt inventory and executable capability inventory should not drift apart.**

但 Pi 只是实现案例，不是“优秀 Agent 必须只有四个工具”的证据。

### 8.14.4 Transparency：展示可观察执行证据，不等于暴露 Hidden Chain-of-Thought

Anthropic 所说的 transparency 包括显式显示 Agent 的 planning steps；同时在 Agent loop 中，每一步应从环境获得 ground truth，例如：

~~~text
tool result
code execution output
test result
file diff
retrieval result
browser observation
policy decision
~~~

然后再决定下一步。

生产系统应该让用户和工程师看到足够的**可操作证据**：

~~~text
current plan / todo
current step
tool being invoked
important arguments
tool result summary
artifact / diff
state transition
retry / fallback
approval request
completion evidence
~~~

但不要把 transparency 误解为“必须暴露模型隐藏 Chain-of-Thought”。

更安全、也更工程化的规则是：

> **Expose plans, actions, state transitions, evidence, and concise reasoning summaries when useful; do not make hidden Chain-of-Thought an observability dependency.**

这与 Chapter 09 的经验学习原则一致：可靠 Trace 应建立在 observable behavior / outcomes，而不是隐藏 CoT。

### 8.14.5 Environment Feedback：Agent 不能只靠自己的文本判断成功

一个 Agent Loop：

~~~text
Plan
→ Act
→ Observe
→ Update
→ Verify
→ Continue / Stop
~~~

其中 Observe / Verify 必须尽量来自真实环境，而不是：

~~~text
model generated code
→ model says "looks correct"
→ done
~~~

对于 Coding Agent，更强证据通常是：

~~~text
tests pass
typecheck pass
lint pass
app behavior reproduced
bug no longer reproduces
diff matches scope
runtime logs support claim
~~~

对于 RAG / Business Agent：

~~~text
retrieval evidence
API result
database state
workflow status
policy result
human approval
~~~

> **The agent's claim of success is not completion evidence.**

### 8.14.6 ACI：把 Tool Interface 当作给模型使用的 HCI

ACI 的核心不是“有 Function Calling API”，而是：

~~~text
Can the model understand what this tool does?
Can it distinguish it from neighboring tools?
Can it construct valid arguments?
Can the interface prevent predictable mistakes?
Can failures teach the model how to recover?
~~~

一个 Tool Contract 至少应该考虑：

~~~text
name
description
input schema
examples
edge cases
when_to_use
when_not_to_use
error model
permission / side effect
result shape
recovery hint
~~~

Anthropic 的类比很重要：

~~~text
HCI
→ reduce human interaction error

ACI
→ reduce model interaction error
~~~

因此参数名和 schema 本身就是 Prompt Engineering。

### 8.14.7 Poka-yoke：把常见错误从 Prompt 提醒升级成 Interface Constraint

仅仅写：

~~~text
"Please be careful."
~~~

通常不如改变接口。

Anthropic 在 SWE-bench Agent 上给出的具体案例是：模型在工作目录变化后容易错误使用 relative filepath，因此他们把相关 Tool 改成**要求 absolute filepath**，从接口层移除了这一类错误。

这里要注意产品边界：

~~~text
Anthropic SWE-bench tool example
→ required absolute paths

Pi current edit tool
→ accepts relative OR absolute path
→ resolves it against cwd
~~~

因此“绝对路径”不是所有 Coding Agent 的通用规范。

真正可复用的原则是：

> **When the same model error repeats, first ask whether the interface can make that error impossible or easier to diagnose.**

其他 Poka-yoke 例子：

~~~text
free-form status string
→ enum

arbitrary resource id
→ scoped typed handle

delete(path)
→ delete(resource_id, expected_version)

ambiguous amount
→ amount + currency

implicit destructive action
→ explicit confirm / approval token

edit by line number
→ exact unique text / structured patch
~~~

### 8.14.8 Pi edit：从实现里看 ACI 防呆

Pi 当前 edit tool 是一个很好的 ACI 例子。

其关键约束包括：

~~~text
oldText
→ exact match
→ must be unique

multiple edits
→ matched against the same original file
→ not incrementally against already-mutated content

overlapping / nested edits
→ rejected / discouraged

result
→ returns diff + unified patch
~~~

这种设计把很多“模型自己维护行号 / offset / mutation ordering”的隐式负担移到 deterministic tool implementation。

注意当前 Pi 的 path schema 是：

~~~text
relative or absolute
~~~

所以 Handbook 不把“Pi edit 强制绝对路径”作为事实。

可复用原则是：

> **Move bookkeeping that software can perform deterministically out of the model's action space.**

### 8.14.9 Session Transparency：原始历史、Active Context 与 Summary 不要混成一件事

Pi 当前 Session 使用 JSONL，entry 通过 id / parentId 组成树，可以从历史节点分叉。

它同时区分：

~~~text
Raw Session History
→ append-style persisted entries

Active Model Context
→ current leaf → root path
→ compaction / context edit semantics

Compaction
→ summary replaces older material in model context
→ raw source entries remain in session history
~~~

这个设计展示了一个很重要的生产原则：

> **Context compaction should not require destroying the audit history.**

更一般地：

~~~text
audit history
≠
model context
≠
UI summary
≠
long-term memory
~~~

它们生命周期和用途不同。

树状 Session 还有一个工程优势：用户从早期分叉探索另一条路线时，不一定需要覆盖或删除原始路径，可以保留：

~~~text
what was tried
what evidence existed
where branch happened
what summary carried forward
~~~

这对 debugging、replay、comparison 和 human steering 都有价值。

### 8.14.10 Harness ≠ Feature Checklist

把 Agent Harness 写成：

~~~text
browser
computer use
memory
hooks
plugins
worktree
subagents
skills
MCP
~~~

很容易再次陷入“组件越多越成熟”。

更好的问题是每个组件解决什么 failure mode：

| Mechanism | It should exist when... |
|---|---|
| Browser / computer use | task requires environment interaction that APIs cannot adequately expose |
| Memory | information must survive beyond current task/context with a clear lifecycle |
| Hooks | deterministic lifecycle events need policy/automation |
| Skills | validated reusable procedures need bounded activation |
| Worktree / isolated workspace | concurrent writers or risky changes need write isolation |
| Subagent | context/permission/tool boundary or genuine parallel specialization exists |
| Checkpoint | long-running execution must survive interruption |
| Sandbox | untrusted execution needs a physical capability boundary |

> **Add harness mechanisms to solve explicit operational problems, not to complete an Agent feature checklist.**

OpenAI 的 Harness Engineering 也给出类似证据：他们的 Agent 效果并不只来自模型，而依赖 agent-legible repository、工具、可执行环境、worktree 级应用实例、日志/指标、自动化验证和反馈循环。该文章同时明确提醒，这种高自主能力依赖特定 repository structure / tooling investment，不能无条件外推。

### 8.14.11 ACI Eval Loop：用真实 Tool Failure 改接口

Tool 设计不应该一次完成。

一个生产迭代循环：

~~~text
Representative Task Set
→ Agent Runs
→ Tool-call Trace
→ Failure Clustering
→ Root Cause
   ├─ description ambiguity
   ├─ schema ambiguity
   ├─ overlapping tools
   ├─ bad default
   ├─ missing validation
   ├─ poor error message
   └─ model capability limit
→ ACI Change
→ Regression Eval
→ Release
~~~

值得记录的 Tool metrics：

~~~text
tool_selection_accuracy
argument_validity
first-attempt_success
tool_error_rate
recovery_success
duplicate / redundant tool calls
wrong-tool-with-correct-intent rate
latency
cost
task success after tool use
~~~

不要看到所有 Tool Failure 都去改 Prompt。可能的修复位置包括：

~~~text
rename tool
split / merge tools
change schema
add enum
remove optional ambiguity
change default
add validation
improve error message
add permission gate
change environment
remove the tool
~~~

Anthropic 明确建议用大量 example inputs 测试模型如何使用 Tool，然后迭代参数、描述与边界。

Chapter 09 负责把这些失败样本进入 Eval / Regression / Release Control Plane。

### 8.14.12 12-Factor Agents：Own Prompt / Context 的正确边界

12-factor-agents 提出的 “Own your prompts” 与 “Own your context window” 对生产系统有一个很有价值的提醒：

~~~text
do not outsource critical behavior
to an opaque abstraction you cannot inspect / test / version
~~~

这不意味着“不要使用框架”。

更准确的 Handbook 原则是：

> **Own the behaviorally critical interfaces even when a framework implements them.**

至少应该能检查和版本化：

~~~text
prompt
context assembly
tool schemas
state
routing
policy
model / provider config
eval metadata
~~~

框架可以减少样板代码，但不应该让关键行为变得不可观测。

### 8.14.13 Source boundary · Effective Agent Harness / ACI

Primary input:

- 用户提供的视频总结：字节面试题“如何设计像 Pi 一样优秀的 Agent”，以 Anthropic Building Effective Agents 的 Simplicity / Transparency / ACI 三原则为骨架，并使用 Pi、Claude cookbook、12-factor-agents 等作为实现参考。

Source-derived ideas retained:

- Agent 设计优先保持简单；
- 显式展示 planning / execution progress；
- Agent 每一步从真实环境结果获得 feedback；
- ACI / Tool Definition 需要像 HCI 一样精心设计；
- Poka-yoke 应把重复模型错误转化为 interface constraint；
- Anthropic SWE-bench 案例将易错 relative filepath 改为 required absolute filepath；
- Pi 当前默认 coding tools 为 read / bash / edit / write；
- Pi prompt 根据 enabled tools 组装相关 tool inventory / guideline；
- Pi session 当前使用 JSONL + id / parentId tree；
- Pi compaction 可以改变 active model context，而 raw session history 仍保留；
- Pi edit 要求 oldText 唯一，多处 edits 对同一 original file 匹配；
- claude-cookbooks 提供 Prompt Chaining、Orchestrator-Workers、Evaluator-Optimizer 等 Building Effective Agents reference implementations；
- 12-factor-agents 强调 own prompts / own context window。

Handbook corrections / synthesis:

- Transparency 不解释为暴露 hidden Chain-of-Thought，而是暴露 plan、action、state transition、environment evidence 与必要的 concise reasoning summary；
- “工具越少越好”改写成减少 semantic overlap 与 choice ambiguity，而不是机械最小化 tool count；
- 不把 Pi 当前 edit 写成“必须绝对路径”：当前源码明确支持 relative or absolute；absolute-path requirement 是 Anthropic SWE-bench tool 的具体 ACI 案例；
- Pi 被定位为 minimal-harness implementation example，不作为通用 Agent 标准；
- Harness feature list 被改写成 failure-driven mechanism selection；
- ACI 优化进入 task-set → trace → failure clustering → interface repair → regression loop；
- 12-factor-agents 的 “own” 被解释为关键行为接口必须 inspectable / testable / versionable，而不是拒绝框架；
- Harness 与 Model 的关系被定义为 capability 与 reliability conversion 的分工，而不是二选一。

External verification date: 2026-09-28.

Sources:

- https://www.anthropic.com/engineering/building-effective-agents
- https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents
- https://github.com/earendil-works/pi
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/system-prompt.ts
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/tools/edit.ts
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md
- https://github.com/humanlayer/12-factor-agents
- https://openai.com/index/harness-engineering/




## 8.15 Long-Running Multi-Agent Handoff：状态、契约、检查点与恢复

“多个 Agent 各自记进度，最后把结果拼起来”可以完成短小、低耦合任务，但它不是可靠的长周期协作模型。

问题不在于 Agent 是否“聪明”，而在于系统缺少统一回答这些问题的地方：

~~~text
What is the current global state?
Which task is committed as complete?
Which artifact version is authoritative?
Who owns the next transition?
Which output has actually passed validation?
What can be retried safely?
What external side effect already happened?
Where should execution resume after a crash?
~~~

如果这些答案只存在于每个 Agent 的局部上下文：

~~~text
Agent A local memory
Agent B local memory
Agent C local memory
~~~

那么长任务一旦跨进程、跨小时、跨天或发生重试，就很容易出现：

~~~text
handoff mismatch
stale state
duplicate execution
lost progress
invalid artifact propagation
ambiguous recovery point
~~~

更稳定的架构是：

~~~text
Durable Workflow State
        │
        ├─ Task State Machine
        ├─ Version / Ownership
        ├─ Checkpoint / Event History
        └─ Next Transition
        │
        ▼
Agent A
  → Candidate Artifact
  → Handoff Validation
  → Commit
        │
        ▼
Agent B
  → Candidate Artifact
  → Handoff Validation
  → Commit
        │
        ▼
Agent C
~~~

> **Agents may be ephemeral; workflow state and validated artifacts must be durable.**

### 8.15.1 “不能直接拼接”不是绝对不能，而是没有可靠性边界

对于真正独立的 Map-style 子任务：

~~~text
Task 1 → Result 1
Task 2 → Result 2
Task 3 → Result 3
          ↓
deterministic merge
~~~

直接拼接可以合理。

但对于存在 dependency / state transition 的接力任务：

~~~text
A output
→ becomes B input
→ affects C decision
→ changes external system
~~~

“把上一段自然语言直接交给下一个 Agent”会同时混合：

~~~text
task state
business data
reasoning summary
artifact
control instruction
error state
~~~

于是下游必须重新猜：

~~~text
which field is authoritative?
what is complete?
what is provisional?
what should be retried?
which value is stale?
~~~

因此问题不是：

~~~text
Can Agent B read Agent A's output?
~~~

而是：

> **Can the runtime distinguish committed workflow state from unvalidated model output?**

### 8.15.2 三种状态必须分开：Workflow State、Artifact、Agent-local Context

长周期协作至少分三层：

~~~text
Workflow State
→ 当前执行在哪里
→ 谁拥有 task
→ 当前 revision
→ 哪些 transition 合法
→ retry / approval / cancellation 状态

Artifact Store
→ 上一步实际产物
→ immutable/versioned object
→ lineage / checksum / validation status

Agent-local Context
→ 当前 Worker 为完成本节点所需的 prompt / retrieved context / scratch state
~~~

不要把三者都塞进一个共享 Conversation。

一个可用的 Task State 可以包含：

~~~text
workflow_id
task_id
stage
status
owner
lease_expires_at

revision
workflow_version
schema_version

input_artifact_refs
output_artifact_refs

validation_status
retry_count
last_error

next_allowed_transitions
updated_at
~~~

Artifact 则至少需要：

~~~text
artifact_id
artifact_type
version
producer_task
producer_agent
dependency_refs
storage_uri
checksum
schema_version
validation_status
created_at
~~~

这样 Agent 崩溃并不会让全局状态一起消失。

### 8.15.3 Task State Machine：控制“接下来允许发生什么”

生产接力流程不应是：

~~~text
A done
→ message B
→ B done
→ message C
~~~

更稳健：

~~~text
INVESTIGATING
→ ROOT_CAUSE_VALIDATED
→ REMEDIATION_PROPOSED
→ CHANGE_APPROVED
→ CHANGE_EXECUTED
→ EFFECT_VALIDATED
→ COMPLETE
~~~

每个 transition 有明确 guard：

~~~text
current_state
expected_revision
required_input_artifacts
validation_status
permission / approval
retry_budget
~~~

例如：

~~~text
REMEDIATION_PROPOSED
→ CHANGE_APPROVED
~~~

只有在：

~~~text
proposal schema valid
risk classification present
evidence refs readable
approval policy satisfied
~~~

时才允许提交。

> **The state machine owns legal transitions; Agents propose work inside those boundaries.**

### 8.15.4 Checkpoint：保存的是可恢复执行边界，不只是“当前第几步”

Checkpoint 至少应该让 Runtime 恢复：

~~~text
workflow state
task ownership / runnable set
artifact references
validation result
retry counters
approval state
workflow / schema version
execution metadata
~~~

但不要把 Checkpoint 理解成：

~~~text
save program counter
→ crash
→ continue from exact source-code line
~~~

不同 Runtime 的恢复模型不同。

LangGraph 当前文档将 Checkpoint 定义为 thread graph state 的持久化 snapshot，用于 interruption resume、failure recovery、HITL 和 fault tolerance；生产环境还需要使用 persistent checkpointer，而不是 in-memory saver。

Temporal 的 Durable Execution 则主要依赖 durable Event History + deterministic replay 恢复 Workflow State；Worker 崩溃后可以恢复执行，它不要求应用自己把每一步都实现成传统 snapshot。

所以通用抽象应该写成：

> **Persist enough durable execution evidence to reconstruct the last committed workflow state.**

而不是：

> “所有长任务都必须使用同一种 snapshot checkpoint。”

### 8.15.5 Handoff Contract：交接的是 Typed Artifact，不是自由文本承诺

一个正式 handoff 至少应定义：

~~~text
producer
consumer
input schema
output schema
artifact type
semantic invariants
required evidence
validation policy
failure policy
version compatibility
~~~

例如 Root Cause Agent 输出：

~~~json
{
  "incident_id": "inc_123",
  "root_cause": "...",
  "confidence": 0.86,
  "evidence_refs": ["log_17", "trace_88"],
  "affected_services": ["billing-api"],
  "recommended_next_stage": "REMEDIATION_PROPOSAL"
}
~~~

下游不应该依赖：

~~~text
"我已经分析完了，应该是 billing service 的问题，下一步你修一下。"
~~~

因为自然语言无法稳定承担：

~~~text
state transition
artifact identity
validation status
version compatibility
~~~

> **A handoff should transfer a typed, validated artifact plus explicit workflow state—not just a message.**

### 8.15.6 三层 Handoff Validation

视频里提出的三层校验可以保留，并更严格地定义为：

#### Layer 1 · Structural / Schema Validation

验证：

~~~text
required fields
type
enum
schema_version
format
serialization
~~~

回答：

~~~text
Can the next stage parse this artifact deterministically?
~~~

#### Layer 2 · Semantic / Invariant Validation

验证：

~~~text
business range
cross-field invariant
policy constraint
domain rule
state compatibility
~~~

例如：

~~~text
confidence in [0,1]
change risk requires approval
service_id must belong to incident scope
end_time >= start_time
next_stage must be legal from current state
~~~

回答：

~~~text
Is the artifact internally and operationally meaningful?
~~~

#### Layer 3 · Referential / Integrity Validation

验证：

~~~text
artifact exists
object is readable
checksum matches
dependency version still exists
evidence ref resolves
required file / dataset is complete
~~~

回答：

~~~text
Does the claimed evidence and output actually exist in the environment?
~~~

生产上通常还会增加：

#### Layer 4 · Acceptance / Outcome Validation

验证：

~~~text
does the artifact actually satisfy the stage objective?
~~~

例如：

~~~text
test passes
root cause reproduces symptom
patch fixes failing scenario
deployment health returns to SLO
~~~

这与 Chapter 09 的 Validator / Eval Control Plane 对接。

### 8.15.7 Handoff 应采用 Validate-before-Commit

一个更安全的 handoff transaction：

~~~text
1. Worker reads committed state revision N
2. Worker executes task
3. Worker writes candidate artifact
4. Structural validation
5. Semantic validation
6. Referential / acceptance validation
7. Commit artifact as VALIDATED
8. Atomically transition state N → N+1
9. Next task becomes runnable
~~~

而不是：

~~~text
Worker says "done"
→ immediately schedule next Agent
→ validation happens later
~~~

因为后一种做法会让 invalid result 先污染下游。

可以把它理解成：

~~~text
produce
→ validate
→ commit
→ publish downstream
~~~

> **Downstream Agents should consume committed artifacts, not optimistic claims of completion.**

### 8.15.8 Optimistic Lock / CAS：一种并发控制，不是唯一答案

视频里“状态变更用乐观锁保证并发安全”方向是合理的，但不能写成唯一方案。

典型 CAS：

~~~text
read revision = 17

UPDATE task
SET state = ..., revision = 18
WHERE task_id = ...
  AND revision = 17
~~~

如果 affected rows = 0：

~~~text
someone else already changed state
→ reject stale write
→ reload / reconcile
~~~

适合：

~~~text
conflict relatively rare
shared task board
distributed workers
short state mutations
~~~

但其他合法方案还包括：

~~~text
single-writer orchestrator
transaction + row lock
serialized queue
database transaction
distributed lease
partition ownership
workflow-engine-owned state transition
~~~

所以通用原则是：

> **Shared workflow state needs an explicit concurrency model; CAS is one implementation, not the definition of multi-Agent coordination.**

这与 §8.13 的 task-board revision / stale-write rejection 是同一个底层机制；本节把它放到 long-running handoff context 中。

### 8.15.9 Lease / Heartbeat：长周期 Worker 还必须回答“谁现在拥有这个任务”

如果任务可以跑数小时，只保存：

~~~text
status = RUNNING
owner = agent_7
~~~

不够。

如果 Agent 7 已经崩溃，系统怎么知道任务是否可以重新分配？

常见做法：

~~~text
owner_id
lease_token
lease_expires_at
heartbeat_at
attempt
~~~

执行流程：

~~~text
claim task
→ acquire lease
→ heartbeat while executing
→ commit / release on success
→ lease expires on worker loss
→ orchestrator reconciles
→ safe retry / reassignment
~~~

要区分：

~~~text
worker process is dead
≠
external side effect did not happen
~~~

例如 Agent 在调用云 API 后崩溃：

~~~text
request may have succeeded
but local acknowledgement was lost
~~~

因此重新分配前仍需要 idempotency / reconciliation。

### 8.15.10 Recovery：从“最后已提交状态”恢复，而不是机械回滚

视频里的：

~~~text
validation fail
→ rollback to previous checkpoint
→ original Agent reruns
~~~

可以作为教学直觉，但生产上需要更细。

恢复目标通常是：

~~~text
find earliest invalid state/artifact
→ preserve valid upstream work
→ invalidate only affected downstream
→ repair / rerun minimum scope
~~~

例如：

~~~text
A validated
B output schema valid but evidence file missing
C not started
~~~

不需要重跑 A。

可以：

~~~text
repair B artifact reference
or rerun B
→ validate
→ continue C
~~~

如果失败发生在外部副作用：

~~~text
payment
deploy
email
ticket mutation
cloud resource change
~~~

Checkpoint 本身不能“撤销现实世界”。

需要：

~~~text
idempotency
reconciliation
compensation
saga
human escalation
~~~

Temporal 当前 Durable AI guidance 也把 Saga compensation 作为分布式副作用恢复模式之一。

> **Checkpoint restores orchestration state; side-effect recovery requires its own transaction semantics.**

### 8.15.11 Version Compatibility：跑几天的 Workflow 会跨代码版本

长周期任务常见：

~~~text
Day 1
→ workflow v12

Day 3
→ deploy workflow v13

Day 5
→ old workflow resumes
~~~

如果状态 / Artifact Schema 已变化，就可能出现：

~~~text
old checkpoint
+ new worker
→ incompatible decode / transition
~~~

因此状态至少记录：

~~~text
workflow_version
schema_version
prompt_version
tool_registry_version
model / provider version when material
policy_version
~~~

升级策略可以是：

~~~text
backward-compatible reader
state migration
workflow version pinning
patch/version marker
finish-old-version-first
explicit incompatible-state escalation
~~~

Temporal 官方文档明确强调长期 Workflow 需要考虑 deterministic replay 与 Workflow code versioning / patching。

> **Durability without version compatibility turns yesterday's checkpoint into tomorrow's incident.**

### 8.15.12 Long-running Multi-Agent Handoff Protocol

把以上机制压缩成一个 production protocol：

~~~text
ORCHESTRATOR
    │
    ├─ durable state
    ├─ task DAG / state machine
    ├─ ownership / lease
    └─ revision
    │
    ▼
WORKER / AGENT
    │
    ├─ reads committed inputs
    ├─ performs bounded work
    └─ writes candidate artifact
    │
    ▼
HANDOFF GATE
    ├─ schema
    ├─ semantic invariant
    ├─ referential integrity
    └─ acceptance evidence
    │
    ├─ FAIL
    │    → repair / retry / escalate
    │
    └─ PASS
         → commit artifact
         → CAS / atomic state transition
         → checkpoint / event
         → publish next runnable task
~~~

这个顺序特别重要：

~~~text
Candidate
≠
Committed Artifact

Agent says done
≠
Workflow transition committed
~~~

### 8.15.13 自动化运维例子

一个跨小时甚至跨天的 incident remediation workflow：

~~~text
Incident Created
      ↓
Investigation Agent
      ↓
Evidence Package
      ↓ validate
ROOT_CAUSE_VALIDATED
      ↓
Remediation Agent
      ↓
Change Proposal
      ↓ validate + risk policy
CHANGE_APPROVED
      ↓
Execution Agent
      ↓
Deployment / Config Change
      ↓ reconcile external effect
CHANGE_EXECUTED
      ↓
Validation Agent
      ↓
SLO / Test / Metric Evidence
      ↓
EFFECT_VALIDATED
      ↓
COMPLETE
~~~

每个 Stage 的责任不同：

| Stage | Durable artifact | Commit gate |
|---|---|---|
| Investigation | evidence package | evidence resolves + root-cause invariant |
| Root cause | diagnosis | reproducibility / evidence |
| Remediation | change proposal | schema + risk + approval |
| Execution | change receipt / deployment id | idempotency + reconciliation |
| Validation | metric / test report | acceptance criteria |

如果 Validation 失败：

~~~text
do not restart incident from zero

diagnose earliest invalid artifact / transition
→ remediation incorrect?
→ execution incomplete?
→ environment changed?
→ validator wrong?
~~~

然后进入 bounded repair / escalation。

### 8.15.14 Observability：接力系统要观测 Handoff，不只看 Agent Token

至少记录：

~~~text
workflow_id
task_id
stage
agent / worker
attempt
lease
revision_before / after

input artifact refs
candidate artifact
validation results
committed artifact

state_before / after
transition reason

retry / repair
reassignment
checkpoint / event id

external side_effect id
reconciliation result

latency
token / cost
~~~

关键指标：

~~~text
handoff_schema_failure_rate
handoff_semantic_failure_rate
artifact_integrity_failure_rate
acceptance_failure_rate

resume_success_rate
mean_recovery_time
stale_write_rejection_rate
lease_expiry / reassignment rate

duplicate_side_effect_rate
reconciliation_failure_rate

workflow_completion_rate
time_in_stage
cost_per_successful_workflow
~~~

长周期系统最危险的不是单个 Agent 偶尔答错，而是：

~~~text
small invalid handoff
→ silently propagates through many stages
→ becomes expensive late-stage failure
~~~

因此：

> **Measure handoff quality at every boundary, not only final-task quality.**

### 8.15.15 面试回答：从“共享进度”升级成 Durable Handoff Protocol

如果面试官问：

> 多个 Agent 能不能各自维护进度，然后接力跑几天，最后直接拼结果？

更完整的回答是：

> 如果只是多个独立 Map-style 子任务，各自输出后 deterministic merge，可以。但对于有依赖的长周期接力任务，我不会让每个 Agent 只维护自己的局部进度，也不会把自然语言结果直接传给下一个 Agent。生产上会把全局执行状态放到 durable workflow state / state machine 中，Agent 进程可以是临时的；每个阶段读取已提交 state 和 versioned input artifacts，执行后先写 candidate artifact，再经过 schema、semantic invariant、referential integrity 和必要的 acceptance validation，通过后才原子提交 artifact 和 state transition。共享状态并发可以用 revision/CAS，也可以用 single-writer workflow engine、transaction 或 lease，重点是有显式 concurrency model。Worker 崩溃时从最后 committed state 恢复；如果是外部副作用，Checkpoint 不够，还要做 idempotency、reconciliation 或 compensation。这样长周期 Multi-Agent 才能做到状态可追溯、交接可验证、失败可恢复，而且不会把上游小错误静默传播到整个链路。

最短记忆：

~~~text
Durable State
+ Versioned Artifact
+ Handoff Contract
+ Validate-before-Commit
+ Concurrency Control
+ Checkpoint / Event History
+ Idempotency / Reconciliation
+ Recovery / Escalation
~~~

### 8.15.16 Source boundary · Long-Running Multi-Agent Handoff

Primary input:

- 用户提供的视频总结《多Agent长周期协作面试题解析》：独立 Agent 局部进度无法可靠支撑长任务接力；统一任务状态机 + Checkpoint；handoff schema；格式 / 语义 / 完整性校验；失败恢复；自动化运维示例。

Source-derived ideas retained:

- 长周期 Multi-Agent 需要统一任务状态；
- Agent-local progress 不能替代全局 Workflow State；
- 每个 Agent 的输入输出需要明确 handoff contract；
- handoff 应做结构、语义与产物完整性校验；
- 长任务需要持久化恢复边界；
- 自动化运维等多阶段任务适合 durable handoff architecture。

Handbook corrections / synthesis:

- “不能各自维护进度并直接拼接”改写为：对独立 Map-style 子任务可以，但对 dependency-heavy long-running workflow 不可靠；
- 状态机、Artifact Store 与 Agent-local Context 明确分层；
- Checkpoint 抽象为“可恢复 committed execution state”，不限定为 snapshot；Temporal 等 Runtime 可以通过 Event History + replay 提供 durable execution；
- “乐观锁保证并发安全”改写为 explicit concurrency model；revision/CAS 只是一个实现，还可以 single writer、transaction、lease、serialized queue；
- Handoff 增加 Validate-before-Commit，避免 invalid candidate 先污染下游；
- 三层校验扩展为 structural / semantic / referential，必要时增加 acceptance / outcome validation；
- “校验失败回滚到上一步由原 Agent 重跑”改写成 D-I-R：找到最早失效 state/artifact，最小范围 repair / rerun / escalation；
- Checkpoint 不等于外部副作用事务；支付、部署、邮件、云资源等需要 idempotency / reconciliation / compensation；
- 增加长周期 Worker 的 lease / heartbeat / reassignment；
- 增加跨天 Workflow 的 schema / workflow / prompt / tool / policy version compatibility；
- 增加 handoff-level observability 与 reliability metrics。

External verification date: 2026-09-28.

Verified implementation examples:

- LangGraph current Persistence docs: checkpointers persist thread graph state and support interruption resume, failure recovery and fault tolerance; in-memory saver does not survive process restart and production should use persistent persistence.
- Temporal current Durable AI / Workflow docs: workflows can resume after Worker crashes or multi-day waits; workflow state can be recovered from durable Event History through replay; long-running workflow code requires deterministic/version-compatible evolution; Saga compensation is a pattern for external side effects.

Sources:

- https://docs.langchain.com/oss/python/langgraph/persistence
- https://docs.temporal.io/ai
- https://docs.temporal.io/tasks
- https://docs.temporal.io/workflow-definition


## Verification boundary · 2026-09-28

幂等 key 需要服务端实现。Reducer 合并状态，不替代分支 join；InMemorySaver 不支持进程重启恢复。DeepSeek writeScopes 是提示，不是锁；Pi / DeepSeek 的具体行为均受源码版本约束。

核对依据：[LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)。完整范围、逐节结论与未验证项见 [本次审计](../verification/2026-09-28.md)。

补充一手资料（仅支持对应概念/实现，不证明整章方案普遍最优）：

- [LangChain agents](https://docs.langchain.com/oss/python/langchain/agents)
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Cordis lifecycle](https://github.com/deepseek-ai/deepseek-harness/blob/21638c56315ae6a2b552d6091945d3144c9af32e/docs/cordis-primer.md)
