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
- https://developers.openai.com/docs/agent-configuration/agents-md
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
- https://developers.openai.com/docs/agent-configuration/agents-md
- https://openai.com/index/harness-engineering/

