# Chapter 06 · Skills、MCP、Tools 与 Capability Routing
## Skills, MCP, Tools, and Capability Routing

> Canonical semantic chapter.

当 Skills 超过少量手工配置后，问题不再是 Prompt 怎么写，而是 **Retrieval + Classification + Policy Routing + Governance**。把所有 Skill 放进 Prompt 会增加 Token、延迟、注意力稀释、位置偏差、描述冲突，并可能暴露未授权能力。

## 6.1 Skill Contract

一个成熟 Skill 至少描述：

```yaml
name: analyze_contract_risk
version: 2.1
when_to_use:
  - user asks to identify risky clauses in a contract
when_not_to_use:
  - general legal advice
  - document is an invoice
  - user asks system to approve contract
required_inputs:
  - contract_content_or_id
  - jurisdiction
required_permissions:
  - CONTRACT_READ
risk_level: medium
requires_human_review: true
```

> **A skill description should define the decision boundary, not advertise the feature.**

命名优先 `Verb + Business Object + Optional Constraint`，例如 `retrieve_invoice_by_id`、`validate_refund_request`、`analyze_contract_risk`。避免 `helper`、`smart_tool`、`analysis`、`process_data` 这类模糊名字。

除了 Positive Examples，也必须提供 Hard Negatives 与容易混淆的邻近 Skill。

> **Positive examples improve recall; hard negatives improve boundaries.**

## 6.2 Soft Hierarchical Routing

可以按：

```text
Domain → Capability → Operation → Version
```

组织 Skill Space，但第一层不要只选一个 Domain。保留 Top-M Domains，避免上层误判让正确 Skill 永久不可见。

> **Hierarchy should reduce the search space without creating an irreversible early decision.**

两阶段路由：

```text
User Request
→ Candidate Generation: Exact / BM25 / Dense / Tags
→ Candidate Fusion
→ Permission / Availability Filter
→ Reranker
→ Decision Gate
```

Reranker 不只看 Query ↔ Description，还要考虑 current goal、task state、available/missing inputs、permission、risk、cost 与 recent tool results。

Decision Gate 应允许：

```text
DIRECT_SKILL
MULTI_SKILL_PLAN
CLARIFY
NO_MATCH
APPROVAL_REQUIRED
REJECT
```

> **A router that always returns a skill is not reliable.**

`NO_MATCH` 是可靠系统的一等结果，否则系统只是在强制分类。

## 6.3 Skill Match ≠ Authorization

完整顺序：

```text
Intent
→ Capability
→ Candidate Skills
→ Skill Match
→ Permission
→ Risk
→ Input Validation
→ Approval
→ Execution
```

> **Skill match is not authorization.**

能力匹配回答“哪个能力适合这个任务”；授权回答“这个用户在这个上下文能不能调用它”。两者必须分离。

## 6.4 Skill Registry & Governance

Registry 可以存：

```text
skill_id · version · domain · tags
input/output schema
when_to_use / when_not_to_use
examples · hard negatives
permissions · risk
owner · health · status · cost
```

对于重叠 Skill，要 Merge / Deprecate / Rename / Narrow Scope / Parameterize / Add Negative Boundaries。例如多个 daily/weekly/monthly report 技能可以合并成 `generate_periodic_report(period)`。

> **Prefer parameterized skills over duplicated skills.**

Routing Eval 应看 Candidate Recall@K、Top-1、MRR、No-Match Accuracy、Clarification Accuracy、Multi-Skill Planning Accuracy、Unauthorized Skill Exposure、E2E Task Success、Latency 与 Cost，并区分 Retriever / Reranker / Input / Execution / Tool Failure。

## 6.5 MCP vs Skill

一个更稳的判断方式不是：

~~~text
MCP = 外部
Skill = 内部
~~~

而是：

~~~text
MCP
= interoperability / capability-access protocol
= 怎么发现、描述、连接、调用一个 capability

Skill
= reusable procedure / expertise package
= 什么时候做、按什么方法做、需要哪些参考资料/脚本、怎样验证
~~~

> **MCP standardizes capability access. Skill packages reusable task procedure and expertise.**

这两个层次可以重叠，但解决的问题不同。

| 维度 | MCP | Skill |
|---|---|---|
| 核心问题 | 如何让 Host / Client 发现并调用能力 | 如何让 Agent 稳定完成一类任务 |
| 典型单元 | Server · Tool · Resource · Prompt · protocol operation | metadata · instructions · workflow · references · scripts · templates |
| 主要复用边界 | 跨应用 / 跨进程 / 跨工具系统的接入 | 跨任务 / 跨 Agent / 跨团队的任务方法 |
| 是否必须连接外部系统 | 否；也可以连接本地进程或本地能力 | 否 |
| 是否定义业务授权 | 否 | 否 |
| 是否天然包含 Workflow | 否 | 可以编码 procedure，但复杂控制流仍应交给 Workflow / FSM |
| Context 策略 | 由 Host / Client 决定哪些能力描述进入模型上下文 | 某些实现支持 progressive disclosure / 按需加载 |

### 6.5.1 MCP 的三个典型使用场景

#### A. 接入外部系统或数据源

例如：

~~~text
company database
GitHub repository / PR
SaaS API
ticketing system
CRM
internal search service
~~~

可以把能力包装成 MCP Server，通过 Tools / Resources / Prompts 等协议原语向支持 MCP 的 Host 暴露。

这里的价值不是“模型突然会查数据库”，而是：

~~~text
capability exposure
+ discovery
+ schema
+ protocol transport
+ reusable client integration
~~~

#### B. 对外暴露可复用能力服务

如果一项能力希望被多个 Agent Host / IDE / AI Application 重用，可以把它做成 MCP Server，而不是为每个客户端重新维护一套私有 Tool Adapter。

例如：

~~~text
GitHub operations server
internal data query server
document processing server
deployment operations server
~~~

多个 Host 可以复用同一个 protocol surface。

但这并不意味着：

~~~text
one MCP server
= automatically safe for every client
~~~

Server 仍需要处理认证、授权、租户隔离、审计、速率限制等基础设施问题；Host 仍需要执行自己的业务 Policy / Approval Gate。

#### C. 标准化同类能力的接入面

如果系统同时支持多个 Search Provider、Vector Store、Ticket System 或其他后端，MCP 可以减少“每个 Host × 每个 Provider”重复写连接协议的成本。

但要注意：

> **Protocol interoperability ≠ business-semantic interoperability.**

MCP 可以统一：

~~~text
discovery
call shape
transport
capability metadata
~~~

但不会自动统一：

~~~text
provider-specific semantics
query language
filter behavior
permission model
consistency semantics
ranking semantics
error taxonomy
~~~

如果希望上层真的把多个后端当成同一个 Business Capability，通常还需要 Adapter / Capability Contract 做语义归一化。

### 6.5.2 Skill 的三个典型使用场景

#### A. 固化团队内部流程与规范

例如：

~~~text
code review procedure
incident postmortem procedure
research workflow
release checklist
document publication rules
~~~

这类问题重点不是“怎么连接一个外部服务”，而是：

~~~text
what steps should be followed?
what evidence is required?
what rules apply?
what is the expected output?
how is completion verified?
~~~

因此更适合编码成 Skill / Procedure，而不是为了“有标准协议”硬做成一个 MCP Tool。

#### B. 注入领域知识与专家方法

Skill 可以把：

~~~text
domain instructions
reference material
templates
worked examples
checklists
validation steps
scripts
~~~

组织成可复用任务包。

例如合同审查 Skill 可以规定：

~~~text
1. identify jurisdiction
2. inspect mandatory clauses
3. classify risk
4. cite source clause
5. separate unknown from verified fact
6. route high-risk findings to human review
~~~

在法律、医疗、金融等高风险领域，Skill 只能承载 procedure / reference / validation guidance；它不能替代真实业务授权、合规 policy 或必要的人类专业审查。

#### C. Progressive Disclosure / Context Economy

以 Anthropic Agent Skills 为具体实现例子：

~~~text
Level 1
metadata
→ always available for discovery

Level 2
SKILL.md instructions
→ loaded when the Skill is triggered

Level 3+
references / scripts / templates
→ loaded or executed only as needed
~~~

这种 Progressive Disclosure 的价值是：

~~~text
large reusable knowledge package
≠
all content must occupy every request context
~~~

因此 Skill 很适合承载“可能很大，但只在相关任务中才需要”的 instruction / reference package。

但要注意：

> **Progressive disclosure is a runtime / Skill implementation property, not a universal law of the word “Skill”.**

不同 Agent framework 对 Skill 的发现、加载、缓存和执行方式可能不同。

### 6.5.3 “MCP 会把全部 Tools 塞进 Prompt”不是协议定义

这是视频材料里最需要修正的一点。

MCP 提供的是能力发现与调用原语，例如：

~~~text
tools/list
tools/call
resources/list
resources/read
prompts/list
prompts/get
~~~

这些原语让 Host / Client 可以知道 Server 暴露了什么能力。

但：

~~~text
Server exposes N tools
≠
the model must receive all N tool schemas on every turn
~~~

真正决定模型上下文中出现哪些 Tool Definition 的是：

~~~text
Host / Agent runtime
→ discovery
→ permission / availability filter
→ capability retrieval / routing
→ model-visible candidate set
~~~

一个简单 Host 确实可能把所有 Tool Schema 一次性传给模型，从而产生：

~~~text
token overhead
tool-selection confusion
description collision
unauthorized capability exposure
~~~

但这是 **Host architecture choice**，不是 MCP 协议强制要求。

因此更成熟的设计是：

~~~text
MCP Server exposes capability catalog
        ↓
Host discovers capabilities
        ↓
Permission / availability filter
        ↓
Capability retrieval / routing
        ↓
Only relevant model-visible tools
        ↓
Model proposes tool call
~~~

这与本章前面的 Skill Routing 完全一致。

### 6.5.4 MCP 与 Skill 可以组合

最常见的生产组合是：

~~~text
User Goal
→ Skill / Procedure
→ Workflow / State
→ capability required
→ MCP / Function Interface
→ Host
→ Tool / API / DB
→ result validation
→ continue Skill / Workflow
~~~

例如：

~~~text
Skill: investigate-production-incident
    ↓
Step 1 read logs
    ↓ MCP → observability server

Step 2 inspect recent deploy
    ↓ MCP → GitHub / deployment server

Step 3 compare known runbook
    ↓ Skill reference file

Step 4 propose remediation
    ↓ Policy / Approval Gate
~~~

这里：

~~~text
Skill
= defines how the incident should be investigated

MCP
= provides standardized access to the systems needed by the investigation
~~~

两者不是替代关系。

### 6.5.5 快速选型

先问：

~~~text
Q1. 我的主要问题是不是“Agent 怎么连接 / 发现 / 调用一个独立系统能力”？
    → yes: consider MCP / API / Function Interface

Q2. 我的主要问题是不是“这类任务应该按什么成熟方法完成”？
    → yes: consider Skill

Q3. 任务是否包含确定性的多步分支 / retry / approval / recovery？
    → yes: add Workflow / State Machine

Q4. 是否涉及权限或真实副作用？
    → yes: add Authorization / Risk / Approval / Host Gate
~~~

因此不要用：

~~~text
MCP or Skill?
~~~

替代真正的系统设计问题。

更合理的问题是：

> **Which layer owns interoperability, which layer owns reusable procedure, which layer owns control flow, and which layer owns authority?**

### 6.5.6 Source boundary

本节补充材料来自用户提供的视频总结《MCP 与 Skill 的使用场景》。

原材料保留的核心：

- MCP 适合连接外部系统 / 数据源与可复用能力服务；
- Skill 适合固化团队内部流程、领域方法和可复用知识；
- MCP 与 Skill 可以组合使用；
- Skill 的按需加载可以降低不必要的上下文消耗。

Handbook 做了以下校正与扩展：

- “外部 vs 内部”改成 **protocol interoperability vs reusable procedure**；
- MCP 不要求所有 Tool Schema 每轮都进入模型上下文；
- MCP 统一协议接入面，不自动统一不同后端的业务语义；
- Progressive Disclosure 明确标记为 Agent Skills 等具体 Runtime 的实现能力，而不是所有“Skill”概念的必然属性；
- 增加 Host-side capability retrieval / permission filtering；
- 强化 Skill / MCP / Workflow / Authorization 四层边界。

External verification:

- Model Context Protocol official SDK/docs: Hosts/Clients discover and call server Tools, Resources, and Prompts through protocol operations.
- Anthropic Agent Skills documentation: Skills package metadata, instructions, scripts/templates/resources and use progressive disclosure to load content in stages.

Sources:

- https://ts.sdk.modelcontextprotocol.io/v2/
- https://py.sdk.modelcontextprotocol.io/zh/client/
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

## 6.6 Function Calling：模型提议，Host 执行

```text
Tool Schema
→ Model Proposal: tool + args
→ Schema Validate
→ Authorization / Risk / HITL Gate
→ Host Execute
→ Result Validate
→ Continue / Retry / Fallback / Clarify / Escalate
```

Function Calling 是 Structured Action Proposal，不是授权系统。模型不应因为“选择了一个 Tool”就自动获得执行权。

> **The model proposes; the host executes.**

Transient timeout / 5xx 可以 bounded retry；4xx / permission denied 一般不应盲目重试。对有副作用的动作，如果状态不确定，应先 reconciliation，再决定是否重试，避免重复扣款、重复创建或重复发送。

## 6.7 Capability architecture

一个可扩展 Capability Plane 可以抽象为：

```text
User / Agent Intent
        ↓
Capability Discovery / Retrieval
        ↓
Skill / Tool Candidate Set
        ↓
Permission + Availability + Risk Filter
        ↓
Capability Router
        ↓
Workflow / Skill Contract
        ↓
MCP / Function Interface
        ↓
Host Execution
        ↓
Result Validation
        ↓
State / Trace / Eval
```

其中：

- Discovery 决定“哪些能力可能相关”；
- Router 决定“这一次该使用哪个或哪些能力”；
- Policy 决定“是否允许执行”；
- Host 承担真实 Side Effect；
- Validation 判断工具结果能否继续进入下一步。

## 6.8 Failure taxonomy

不要把 Tool/Skill 问题都记成 `tool_error`：

```text
capability_discovery_failure
skill_match_failure
permission_failure
missing_input
schema_validation_failure
approval_failure
transport_failure
tool_execution_failure
result_validation_failure
side_effect_reconciliation_failure
```

不同失败的恢复路径不同。匹配错误要修 Router/Contract；权限失败不应靠重试；执行状态不确定则优先 reconciliation。

## Canonical rules

> **Skill match is not authorization.**

> **The model proposes; the host executes.**

> **A router that always returns a skill is not reliable.**

> **Protocol-level access does not replace business authorization or task verification.**

> **MCP standardizes capability access, not business semantics.**

> **The Host decides which discovered capabilities become model-visible context.**

## 6.9 Intent Routing：把意图识别设计成 Cost-aware Routing Cascade

“把用户输入丢给大模型做 Intent Classification”技术上可行，但工程上还必须回答：

~~~text
accuracy
latency
cost
stability
maintainability
confidence
recovery
~~~

因此 Intent Routing 不应先问“规则、分类模型还是 LLM 谁最好”，而应先问：

> **What is the cheapest reliable decision mechanism for this request?**

一个常见的生产设计是分层 Routing Cascade：

~~~text
User Turn
   ↓
State / Context Update
   ↓
Fast Deterministic Gate
   ├─ high-confidence match → direct route
   └─ unresolved
          ↓
Context-aware Router
   ├─ high-confidence intent / capability → route
   ├─ missing information → clarify
   └─ ambiguous / compositional
          ↓
Structured LLM Planner
   ↓
Capability / Tool Proposal
   ↓
Permission + Risk + Input Validation
   ↓
Host Execution
~~~

这里的“层”不是固定标准。两层、三层或四层都可以；核心是把**便宜、稳定、可验证的判断放在前面，把昂贵、开放式的推理留给真正需要它的长尾请求**。

### 6.9.1 Layer 1 · Deterministic fast path

适合：

~~~text
stable command
low ambiguity
high frequency
clear schema
clear precedence
~~~

实现可以包括：

~~~text
exact mapping
keyword / regex
FSM
explicit UI action
typed command
metadata gate
~~~

例如“打开设置”“转人工”“查看余额”这类高度稳定的动作，没有必要默认调用大模型。

但规则层必须有准入标准。能写成规则，不代表应该永久写成规则。每条规则都会增加：

~~~text
precedence
conflict surface
test surface
ownership
deprecation cost
~~~

因此规则治理的核心不是不断扩张，而是保持 **small, explicit, testable**。

> **Rules are valuable when the decision boundary is stable; they become debt when they encode a growing pile of exceptions.**

### 6.9.2 Layer 2 · Context-aware routing

真实对话里的 Intent 经常不是单轮完整表达：

~~~text
“那取消吧”
“第二个呢？”
“还是不行”
“那个退款到哪里了？”
~~~

因此这一层首先需要的是 State，而不是更大的模型。

可以维护：

~~~text
current_task
active_entity
filled_slots
recent_action
topic
user_corrections
required_inputs
candidate_capabilities
~~~

每轮先做：

~~~text
new turn
→ update / invalidate state
→ resolve referent / missing entity
→ detect continuation vs topic shift
→ classify / retrieve candidate capability
~~~

然后再用轻量 classifier、embedding similarity、small model 或 deterministic scoring 判断常规意图。

这和 Chapter 07 的原则一致：

> **The transcript is not the state.**

状态过期、状态污染和错误指代都会直接造成 Routing Failure；增加模型参数不能自动修复错误 State。

### 6.9.3 Confidence Gate：不要强制分类

每层都应该有显式 Exit Condition，而不是永远给出一个标签：

~~~text
ROUTE
CLARIFY
NO_MATCH
ESCALATE
PLAN_MULTI_CAPABILITY
~~~

一个可解释的 Gate 可以综合：

~~~text
top1_score
top1 - top2 margin
entity completeness
required-slot completeness
candidate agreement
state freshness
risk
permission availability
~~~

具体阈值必须从真实流量和 Eval Set 校准，而不是复制固定数字。

> **A routing cascade is only reliable if uncertainty has somewhere to go.**

### 6.9.4 Layer 3 · Structured LLM planner / tool route

进入这一层的请求通常具有一种或多种特征：

~~~text
ambiguous language
compositional intent
cross-domain task
multi-step dependency
dynamic tool choice
external-data requirement
~~~

例如：

~~~text
“帮我分析上个月最大的一笔消费，并按类别导出。”
~~~

只返回：

~~~text
intent = analyze_spending
~~~

信息不够。

更合理的是得到结构化计划：

~~~text
1. query transactions for last month
2. select maximum transaction
3. classify/category enrichment
4. aggregate / format
5. export artifact
~~~

再转成受 Schema 约束的 Tool / Capability Proposal。

Function Calling / Structured Output 的价值是：

~~~text
natural-language understanding
→ typed action proposal
→ deterministic validation
→ host execution
~~~

但它仍然不是授权：

~~~text
LLM proposes
→ schema validate
→ permission / risk / approval
→ host executes
~~~

> **Do not use an LLM merely to emit an intent label when the real task requires a structured execution plan.**

### 6.9.5 Intent Routing ≠ Capability Routing ≠ Authorization

这三个决策不要混在一起：

~~~text
Intent understanding
“What is the user trying to achieve?”

Capability routing
“Which skill / workflow / tool can satisfy it?”

Authorization
“May this user invoke that capability in this context?”
~~~

完整链路：

~~~text
User Turn
→ Context / State Resolution
→ Intent / Task Shape
→ Capability Candidate Retrieval
→ Router / Planner
→ Permission + Risk + Input Gate
→ Execute
→ Validate Result
~~~

如果 Intent 判断正确但用户没有权限，结果应该是 REJECT / APPROVAL_REQUIRED，而不是重新猜另一个 Intent。

### 6.9.6 Cascading 不是“规则 → 小模型 → 大模型”的固定顺序

实际系统可以按业务分布调整：

~~~text
exact command → direct
known semantic intent → lightweight router
uncertain / multi-intent → LLM
high-risk → human / deterministic policy
~~~

也可以：

~~~text
cheap model first
→ confidence low
→ stronger model
~~~

或：

~~~text
capability retrieval
→ top-K candidates
→ reranker / LLM planner
~~~

因此真正稳定的抽象是：

> **Escalate by uncertainty, task complexity, and risk—not by a fixed technology ladder.**

LangGraph 官方把 deterministic + agentic workflow、heavy customization 与 latency control 列为使用低层 orchestration 的典型场景，这与这里的“显式 cascade + state + gate”模式一致。

### 6.9.7 Evaluation：别只测 Top-1 Intent Accuracy

至少拆成：

| Layer | Metrics |
|---|---|
| Deterministic | rule precision · conflict rate · unmatched rate |
| Context | continuation accuracy · referent accuracy · stale-state leakage |
| Router | Top-1 / Top-K · macro F1 · no-match / clarify accuracy · calibration |
| Planner | tool/capability selection · argument correctness · plan completeness |
| Policy | unauthorized-route rate · approval correctness |
| System | task success · fallback rate · P50/P95 latency · cost/request · cost/success |

还应看流量分布：

~~~text
fast_path_rate
context_router_rate
llm_escalation_rate
clarification_rate
no_match_rate
human_escalation_rate
~~~

这些比例不是越低或越高越好。它们的意义是解释**系统在哪一层花钱、在哪一层失败、哪个版本改变了请求分布**。

> **Optimize routing for task success under latency, cost, and risk constraints—not for a single classifier score.**

### 6.9.8 Failure taxonomy

~~~text
rule_conflict
intent_misclassification
context_state_staleness
referent_resolution_failure
low_confidence_forced_route
capability_retrieval_failure
planner_failure
unauthorized_route
tool_execution_failure
result_validation_failure
~~~

修复应落在最早错误层：

~~~text
wrong state
→ fix state reducer

wrong intent boundary
→ fix labels / examples / classifier

correct intent, wrong skill
→ fix capability registry / router

correct tool, invalid args
→ fix schema / planner / validator
~~~

不要把所有问题都归因成“LLM 不稳定”。

### 6.9.9 Source boundary

本节的原始材料来自用户提供的视频转录：张宇技术栈，《手把手带你解 Agent 意图识别怎么实现！》。原材料提出“规则层 → 上下文层 → 工具/大模型兜底层”的三层漏斗，并强调准确率、成本、延迟与可控性的权衡。

Handbook 做了以下工程化扩展：

- 把固定三层改写成可配置的 **cost-aware routing cascade**；
- 把“上下文层”显式拆成 State / Referent Resolution / Confidence Gate；
- 增加 CLARIFY / NO_MATCH / ESCALATE / MULTI_CAPABILITY 等不确定性出口；
- 区分 Intent、Capability Routing 与 Authorization；
- 增加 calibration、traffic-share、latency、cost、task-success 与 failure taxonomy；
- 把 LLM 层限定为 structured planning / action proposal，而不是自由执行。

外部核对：

- LangGraph official reference: low-level orchestration for long-running stateful agents; deterministic + agentic workflows, customization, and latency control are explicit use cases.
- OpenAI Structured Outputs / Function Calling: models can produce schema-constrained structured outputs and tool arguments; this supports typed action proposals but does not replace application authorization.

Sources:

- https://langchain-ai.github.io/langgraph/reference/
- https://openai.com/index/introducing-structured-outputs-in-the-api/

