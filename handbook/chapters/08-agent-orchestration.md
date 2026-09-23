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
- https://langchain-ai.github.io/langgraph/reference/
- https://langchain-ai.github.io/langgraph/reference/checkpoints/
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

- https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
- https://docs.anthropic.com/en/docs/claude-code/cli-usage
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/agent-team.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-catalog.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/feature/2026-08-05-agent-teams.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/architecture/2026-06-26-file-context-as-event-gate.md
- https://www.deepseek.com/harness/en/

