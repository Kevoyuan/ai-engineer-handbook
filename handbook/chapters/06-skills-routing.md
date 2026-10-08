# Chapter 06 · Skills、MCP、Tools 与 Capability Routing
## Skills, MCP, Tools, and Capability Routing

> Canonical semantic chapter.

当 Skills 超过少量手工配置后，问题不再是 Prompt 怎么写，而是 **Retrieval + Classification + Policy Routing + Governance**。把所有 Skill 放进 Prompt 会增加 Token、延迟、注意力稀释、位置偏差、描述冲突，并可能暴露未授权能力。

## 6.1 Skill Contract

以下是本手册建议的业务 Skill Registry 契约，不是可直接复制为所有平台 `SKILL.md` frontmatter 的标准 Schema；字段和命名规则应适配目标运行时：

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

### 6.5.7 CLI：执行接口，不是任务方法

AI Native 手册把 MCP、CLI 与 Skill 放在同一张能力图里，这个视角有价值，但三者不能被压成同一个抽象。

~~~text
MCP
→ protocol-level capability discovery / invocation

CLI
→ command-oriented execution interface

Skill
→ reusable task procedure / expertise
~~~

CLI 的优势是大量现有工程工具已经具备稳定命令、退出码、stdout/stderr 和脚本组合能力；Agent Runtime 可以直接利用这些成熟接口，而不必把每个操作重新包装成一个专用 Tool。

但 CLI 通常不会自动提供统一的 capability discovery、业务授权、租户隔离或任务方法。不同 CLI 的认证、参数语义、错误码和副作用边界也各不相同。

因此：

> **MCP and CLI expose operations; Skill explains how to use capabilities to complete a task.**

是否使用 MCP、CLI 或直接 API，取决于执行边界；它们都不能替代 Host-side Authorization / Policy。

### 6.5.8 Capability Eval：命中能力之后，还要测“能不能正确完成”

AI Native 手册提出对 MCP / Skill 同时关注“命中率”和“成功率”，这个区分值得保留。

~~~text
Capability Hit
→ did the Agent discover / select the right capability?

Capability Success
→ after selecting it, did execution satisfy the task contract?
~~~

生产 Eval 可以继续拆成：

~~~text
discovery / candidate recall
selection accuracy
argument validity
permission correctness
execution success
result interpretability
recovery success
e2e task success
latency / cost
~~~

这避免一个常见假象：Router Top-1 很高，但参数、权限、依赖或 Tool 输出解释失败，最终任务仍然无法完成。

> **Capability selection quality and capability execution quality must be measured separately.**

### 6.5.9 Source boundary

本节补充材料来自用户提供的视频总结《MCP 与 Skill 的使用场景》，以及《AI Native 研发范式实践手册》3.1.3 对 MCP、Skill、CLI 与工具评测的讨论。

原材料保留的核心：

- MCP 适合连接外部系统 / 数据源与可复用能力服务；
- Skill 适合固化团队内部流程、领域方法和可复用知识；
- MCP 与 Skill 可以组合使用；
- Skill 的按需加载可以降低不必要的上下文消耗；
- CLI 可以作为成熟工程工具的执行接口；
- Capability Eval 应区分能力命中与实际任务成功。

Handbook 做了以下校正与扩展：

- “外部 vs 内部”改成 **protocol interoperability vs reusable procedure**；
- MCP 不要求所有 Tool Schema 每轮都进入模型上下文；
- MCP 统一协议接入面，不自动统一不同后端的业务语义；
- Progressive Disclosure 明确标记为 Agent Skills 等具体 Runtime 的实现能力，而不是所有“Skill”概念的必然属性；
- 增加 Host-side capability retrieval / permission filtering；
- 强化 Skill / MCP / Workflow / Authorization 四层边界；
- 将 CLI 定位为 command-oriented execution surface，而不是 Skill 或统一授权协议；
- 增加 capability discovery/selection 与 execution success 的分层评测。

External verification date: 2026-09-28.

- Model Context Protocol TypeScript SDK v2 implements the 2026-07-28 spec and documents servers exposing Tools, Resources, and Prompts to connected MCP hosts/clients.
- Anthropic Agent Skills documentation describes Skills as reusable packages of metadata, instructions, scripts/templates/resources, with progressive disclosure across metadata, triggered instructions, and on-demand resources.

Sources:

- https://ts.sdk.modelcontextprotocol.io/v2/
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

Transient timeout / 可恢复 5xx 可以 bounded retry；4xx 需按语义处理：429 通常按服务端 Retry-After 和退避策略重试，401 可在凭证刷新成功后有限重试，403 / permission denied 不应盲目重试。对有副作用的动作，如果状态不确定，应先 reconciliation，再决定是否重试，避免重复扣款、重复创建或重复发送。

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

从流量经济学看，成熟 Routing Cascade 通常希望形成一个**漏斗**：

~~~text
traffic share        high ───────────────→ low
ambiguity             low ───────────────→ high
task complexity       low ───────────────→ high
unit latency / cost   low ───────────────→ high

L1 deterministic
        ↓ unresolved only
L2 context-aware
        ↓ uncertain / compositional only
L3 structured planner
~~~

这不是要求人为把某个百分比“压到 L1”。真正目标是：

~~~text
simple + stable
→ exit early

context-dependent but routine
→ resolve cheaply with state-aware routing

ambiguous / cross-domain / compositional
→ spend expensive reasoning budget
~~~

因此要同时防两个反模式：

~~~text
Rule Black Hole
→ every new edge case becomes another regex / exception
→ conflict + precedence + ownership debt keeps growing

LLM Front Door
→ every request starts with the most expensive model
→ unnecessary latency + cost + output variance
~~~

> **A routing funnel should reduce average decision cost without hiding uncertainty or turning the fast path into a rule warehouse.**

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

语义示例路由可以按 `state-resolved request → embedding → labeled route examples → aggregate by route → top-1 + runner-up margin → gate` 实现。每条 Route 应包含正例、hard negatives 和邻近意图；相似度不足或候选冲突时保留 CLARIFY / NO_MATCH。相似度不是“该意图正确的概率”，阈值必须按 embedding 版本、业务数据与错误代价验证。关键词命中也要检查否定、引用、实体和上下文，例如“不要退款，只查订单”不能只因出现“退款”就转退款路径。

检索已标注示例作为 few-shot context 是可评测的优化方法。训练/示例库、校准集与最终测试集应隔离，并按模板、用户或时间去重划分；不能把测试题或近重复答案放回示例库。

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

| Signal | 能说明什么 | 不能直接说明什么 |
|---|---|---|
| self-reported confidence | 模型生成的自评文本 | 经验证的正确概率 |
| embedding similarity | 与路由示例的接近程度 | 意图后验概率 |
| token logprobs | 特定 prompt / tokenization 下标签 token 的条件概率 | 自动校准的业务准确率 |
| typed decision probabilities | 预定义候选上的模型分布 | 分布变化后仍可靠的校准或执行授权 |

使用 logprobs 前先核对 model / endpoint / reasoning mode 是否支持；多 token 标签要比较完整标签序列的条件分数，不能只取首 token 或把截断的 top-logprobs 当作完整候选分布。即使候选归一化，也需在留出集上检查 reliability diagram、ECE / Brier、每类 precision / recall，以及 risk–coverage（自动处理覆盖率与错误风险）的取舍。

Jev 的 `confidence` 尤其不能当成 selected-option probability，详见 §6.10.4。低分且缺少用户信息时问一个带具体选项的问题，例如“申请退款还是查询订单？”；模型不确定但信息完整时可升级模型或人工。明确超出范围时返回 NO_MATCH。

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

#### OpenAI Agents SDK：handoff 的实现边界

这是框架实现例，不是意图路由的唯一架构。Python SDK 可以通过 `Agent(..., handoffs=[refund_agent, order_agent])` 暴露接收 Agent；triage agent 是示例中的分诊角色名，不是必需的特殊类。handoff 在模型侧表现为工具，默认名称按 Agent 名称归一化，例如 `Refund Agent → transfer_to_refund_agent`；默认描述为 `Handoff to the {agent.name} agent to handle the request.` 后接 `handoff_description`。`handoff()` 支持 name / description override，名称和模板不是不可变协议。

清晰描述要写适用范围、排除范围和相邻意图的边界，但质量还取决于 state、candidate set、model、policy 与 eval。handoff 仍由模型选择工具；包装成工具不会自动消除 LLM 延迟或保证准确率。小而清晰的能力集合可以直接做模型路由，规模或混淆度增长时再引入候选检索与分层治理。

| SDK pattern | 控制权 | 合适任务 |
|---|---|---|
| handoff | 转移给接收 Agent，接手当前分支 | specialist 接着与用户处理退款 |
| agent as tool | manager 保留最终回复责任 | specialist 返回一个有界分析结果 |

默认 handoff 会传递对话历史；按数据边界筛选/脱敏，而不是把历史当授权。Python `input_type` 约束的是转交 metadata，不替代接收 Agent 主输入，也不动态选择目的地。`is_enabled` 控制可见候选；依赖已解析参数的授权应在 `on_handoff` 开始处检查，并在拒绝时抛出失败，不能正常返回后仍转交。跨 Agent 的业务权限仍由 Host Policy 执行，见 §6.3 / §6.6。

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

### 6.9.8 Recovery、Multi-intent 与 Failure taxonomy

接收 Agent 发现任务超出范围时，应返回结构化 `OUT_OF_SCOPE + reason + unresolved_goal` 或使用显式配置的 return handoff；SDK 不会自动把所有超范围请求送回 triage。Host 维护 `handoff_count`、总 turn / latency budget 和已访问的 `(agent, goal, state_version)`；同一状态无进展地重复转交或预算耗尽时停止循环，转 CLARIFY / ESCALATE。授权失败直接保留拒绝结果，不能换 Agent 绕过 Policy。

多意图要区分“用户同时要求两件事”与“模型分不清是哪件事”：前者按业务优先级、风险和依赖拆成 MULTI_CAPABILITY plan（例如先查订单，再验证退款资格），后者反问。只有确认独立且授权允许的任务才并行；存在顺序或副作用冲突时串行或澄清。

意图数量增长时可采用 §6.2 的 soft hierarchy / Top-M domains。是否分层应由候选召回、混淆矩阵、上下文成本和维护负担决定；“20 个”不是通用技术阈值。每类 precision / recall、混淆对、低置信、多意图、否定和无匹配请求应进入路由评测。

Failure taxonomy:

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
handoff_loop / handoff_budget_exhausted
multi_intent_priority_conflict
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
- 保留“三层漏斗”的流量经济学：越往下请求比例应倾向下降，而歧义、复杂度与单请求成本倾向上升；
- 明确两个反模式：规则层无限扩张形成 **Rule Black Hole**，以及让高成本 LLM 成为所有请求的默认 Front Door；
- 把“上下文层”显式拆成 State / Referent Resolution / Confidence Gate；
- 增加 CLARIFY / NO_MATCH / ESCALATE / MULTI_CAPABILITY 等不确定性出口；
- 区分 Intent、Capability Routing 与 Authorization；
- 增加 calibration、traffic-share、latency、cost、task-success 与 failure taxonomy；
- 把 LLM 层限定为 structured planning / action proposal，而不是自由执行。

补充来源：用户提供的《Agent 意图路由核心设计方案》（2026-10-03）。本轮沿用现有 cascade，只补 semantic example routing、confidence signal 边界、SDK handoff、multi-intent 和 bounded recovery；MCP / Skill 定义仍由 §6.5 单独拥有。

原材料中的“准确性全看 handoff_description”“超过 20 个意图必须分层”和“检索示例让准确率从 71% 到 93%”缺少适用条件或可复现证据，已改成工程假设与验证方法，未作为通用性能结论。官方核验与产品状态见 [2026-10-03 source audit](../verification/2026-10-03-intent-routing.md)。

外部核对（2026-09-23；以下 SDK / 产品项于 2026-10-03 补核）：

- LangChain / LangGraph 当前官方 Learn 与 Thinking in LangGraph 文档继续把 routing、shared state、显式 transitions 与可定制 workflow 作为核心 orchestration primitive；这与本节的 state-aware cascade 一致。
- OpenAI Structured Outputs / Function Calling: models can produce schema-constrained structured outputs and tool arguments; this supports typed action proposals but does not replace application authorization.

Sources:

- https://docs.langchain.com/oss/python/learn
- https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph
- https://openai.com/index/introducing-structured-outputs-in-the-api/



## 6.10 System-One Decision Models：Jev 作为 Typed Probabilistic Fast Path

§6.9 的 Routing Cascade 不要求“轻量 Router”必须是传统 classifier、embedding similarity 或小型 LLM。只要一个组件能够在明确边界内，以足够低的 latency / cost 给出**可校准、可验证、可拒绝升级**的决策，它就可以占据 fast decision layer。

TypeSafe AI 在 2026-09-15 发布的 Jev 是这一设计空间中的一个具体实现。TypeSafe 将它称为 **System One Model**：输入可以是自然语言或结构化 program state，但输出不是自由文本，而是预先定义的 typed probabilistic decisions。

官方当前公开三类 decision primitive（Noul 是正式名称，不是 Bool 的拼写错误）：

| Primitive | 语义 | 典型用途 |
|---|---|---|
| **Noul** | 返回命题为真的概率 `noul ∈ [0,1]`，业务 yes/no 由阈值策略决定 | 风险判断、条件 gate、是否升级 |
| **Choice** | 从给定候选集合中选择，并返回候选分布 / confidence | Intent、Route、Tool / Capability selection |
| **Score** | 在给定 scale 上输出 rating，并返回 level distribution / confidence | 质量、风险、优先级、相关性评分 |

因此更合适的心智模型不是：

~~~text
Jev = a smaller chat LLM
~~~

而是：

~~~text
unstructured / structured state
→ typed probabilistic decisions
→ deterministic workflow logic
~~~

这类模型特别适合**答案空间可以提前定义、但边界无法可靠写成硬规则**的判断任务。例如：

~~~text
intent routing
content / risk gate
ticket triage
tool / capability choice
quality scoring
agent trace evaluation
high-volume filtering
~~~

### 6.10.1 System-One + System-Two：不是替代，而是分工

在 Agent 架构里，System-One decision model 更适合承担高频、封闭、低延迟的前置判断；开放式生成、多步骤规划与长上下文推理仍交给通用 LLM / planner。

~~~text
User / Program State
        ↓
Typed Decision Layer
Noul · Choice · Score
        ↓
Confidence / Policy Gate
   ├─ confident + low risk → deterministic branch / tool route
   ├─ missing / uncertain  → clarify / review
   └─ complex / open task  → System-Two LLM Planner
                                ↓
                         Tool / Workflow Proposal
                                ↓
                    Authorization + Validation
                                ↓
                              Host
~~~

这与 §6.9 的核心原则一致：

> **Escalate by uncertainty, task complexity, and risk—not by a fixed technology ladder.**

Jev 这类模型可以替换或补充 Context-aware Router、scorer、verifier 或 guardrail，但它不替代 Authorization、Workflow State、Host Execution，也不替代真正需要开放推理的 Planner。

### 6.10.2 Type-safe ≠ Semantically correct

这里最容易出现一个危险误解：

~~~text
schema-valid output
≠
correct business decision
~~~

TypeSafe 官方所说的“no type errors / zero hallucinations”主要指：输出被限制在预定义类型和候选空间中，不会生成 schema 外的任意字符串。这个性质对自动化非常重要，但它**不意味着每次分类、选择或评分都一定正确**。

因此生产系统仍需要：

~~~text
confidence calibration
threshold tuning
fallback / escalation
slice-based evaluation
drift monitoring
human review for high-risk cases
~~~

例如 Choice 永远可以返回一个合法候选，但候选可能是错误的业务 Route；Score 永远可以返回合法分值，但评分可能偏离 ground truth。

> **Type safety removes one failure class; it does not remove semantic error.**

### 6.10.3 Jev vs traditional LLM：比较的是任务形状

| Dimension | System-One / Jev-shaped task | General LLM / System-Two-shaped task |
|---|---|---|
| Output space | predefined, typed | open-ended text / code / plan |
| Core operation | classify · choose · score · gate | generate · reason · synthesize · plan |
| Integration | direct software branch | parser / tool proposal / workflow orchestration |
| Best fit | high-volume closed decisions | open or compositional tasks |
| Uncertainty | probability / confidence is part of the interface | often requires explicit calibration strategy |
| Main limitation | cannot freely generate arbitrary answers | higher latency/cost; output freedom adds validation burden |

关键不是“新模型是否比 LLM 更先进”，而是：

> **Is the task fundamentally a closed decision or an open generation / reasoning problem?**

如果候选答案无法提前定义，或者任务的核心产物本身就是文章、代码、报告、计划，那么把它硬塞进 System-One primitive 反而会丢失必要表达能力。

### 6.10.4 三问选择法：Code、Decision Model 还是 Generative LLM？

“closed decision” 还不够，因为很多封闭问题根本不需要模型。

更稳健的选型顺序是：

~~~text
Q1. 输出空间能否在 inference 前定义？
    ├─ No
    │   → Generative LLM / planner
    │
    └─ Yes
        ↓
Q2. 判断能否用确定性规则可靠计算？
    ├─ Yes
    │   → deterministic code
    │
    └─ No
        ↓
Q3. 是否需要模糊语义判断 / 概率性判断？
        ├─ Yes
        │   → decision model / classifier / scorer
        │
        └─ No
            → ordinary software logic
~~~

因此：

~~~text
finite answer space
≠
decision model required
~~~

真正的 Jev-shaped task 更接近：

> **Predefined output space + fuzzy semantic judgment + software needs a typed decision.**

例如：

~~~text
"amount > 1000?"
→ code

"这条退款请求是否像欺诈?"
→ decision model

"解释为什么这条请求可疑，并写调查摘要"
→ generative LLM
~~~

这个三问法也能避免另一个常见错误：把权限和硬约束交给模型。

~~~text
"is this action semantically risky?"
→ model judgment can help

"is this user allowed to execute it?"
→ deterministic authorization / policy
~~~

所以：

> **Use code for deterministic truth, decision models for fuzzy bounded judgment, and generative LLMs for open-ended work.**

### 6.10.5 Parallel sampling 的边界：并行的是独立判断，不是整个 Workflow

TypeSafe 当前资料强调 Jev 可以在一次 query 中并行回答多个 typed questions。这个优势在下列形状最明显：

~~~text
same state
├─ intent?
├─ risk?
├─ urgency?
└─ needs_review?
~~~

这些判断都直接读取同一份 state，不依赖彼此的输出。

但如果任务是：

~~~text
A. 先根据上下文生成一个候选方案
        ↓
B. 再判断方案是否满足约束
        ↓
C. 再根据 B 的结果决定下一步
~~~

那么依赖图仍然是串行的。

因此：

> **Parallel decision sampling removes unnecessary token-by-token generation; it does not remove true data dependencies in the workflow.**

工程上先画 dependency graph：

~~~text
independent judgments
→ batch / parallelize

dependent judgments
→ preserve causal order
~~~

不要为了追求“一次回答所有问题”而把后一个 decision 所需的前置 evidence 省掉。

### 6.10.6 Confidence、Benchmark 与 Product boundary

官方核验日期：2026-10-03。Jev 官网与发布文仍提供 early access 入口。TypeSafe 报告 70–500 ms 响应范围，并说明公开 eval 通常从美国西海岸访问服务；这是 vendor observation，未在本次维护中独立复现，不是地域无关的 P95 或 SLA。工作流 benchmark 也不能当成用户业务的绝对正确率。

当前 TypeSafe 文档区分 `probabilities` 与 `confidence`。Choice 的 confidence 是候选概率相对均匀分布的归一化集中度：

~~~text
confidence = (p_max - 1/n) / (1 - 1/n)
3 candidates: p_max = 0.6 → confidence = 0.4
~~~

它不是经验正确率；Score 的 confidence 还使用有序等级的距离，Noul 没有单独 confidence 字段。“报 90% confidence 就有 90% 正确率”应删除。概率校准是同一分布上的群体统计性质，需要本地留出集和分片验证，不是单次决定的保证。

OpenAI Decisions API 的存在可由 2026-09-29 官方 DevDay recap 核实：使用 Luna，对 text/image context 和预定义答案做封闭决策，发布时为 limited preview。此次未找到可核验的公开 endpoint contract 或“150 ms”官方性能依据，也没有核实广泛开放；只保留有限预览的实现例，不提供猜测接口、不把第三方同名站点当 OpenAI 文档，更不假设其 schema 与 Jev 相同。

模型名称方面，Anthropic 官方已列出 Claude Sonnet 5.5 与 Claude Opus 5.5，并将 Sonnet 定位为较快、较低成本的补充。它们可作为按任务难度升级的当期例子，但“简单/困难”分界仍应由自己的 eval 决定，不能从名称推导固定路由准确率或延迟。主设计保持 model-agnostic。

工程选型应自己验证：

~~~text
decision accuracy / macro F1
calibration / ECE / Brier score
abstain or escalation quality
P50 / P95 latency
cost / request
cost / successful decision
task success after downstream execution
failure slices
~~~

尤其要把“输出永远合法”与“输出足够正确”分别评估。

### 6.10.7 Agent Loop Decision Checkpoints：把 Jev 放在决策边界，而不是替代执行器

AI Engineering 2026-09-23 的 [《Jev Clearly Explained》](https://aiengineering.beehiiv.com/p/jev-clearly-explained) 从 Coding Agent 的运行过程解释 System-One 的位置。它不是一个 Jev 端到端实测，而是一个 **decision-layer architecture example**：主 LLM 负责找 Bug、读代码、提出修复；周围的 harness 反复做 bounded judgments，且必须保留确定性执行边界。

| Agent stage | Bounded question（可交给 decision model） | Evidence / 输入状态 | 决策后仍由代码负责的边界 |
|---|---|---|---|
| **Pre-step routing** | 这一步适合哪个模型？哪些工具可能相关？ | 当前目标、步骤复杂度、工具描述、历史失败 | Tool allowlist、实际工具可见范围、model / cost budget |
| **Pre-action gate** | 这次具体 Tool Call 风险多大？是否值得人工复核？ | **完整命令 + 参数 + 目标路径 + 任务上下文** | 文件权限、sandbox、删除禁令、审批策略；模型分数不能授权 |
| **Post-tool check** | 返回结果是否足以继续？是否存在语义异常？ | Exit code、HTTP status、artifact、test result、trace | 先用确定性规则核验成功/失败，再对模糊质量作模型判断 |
| **Loop control** | 是否在有效推进？是否重复搜索？是否该停止/升级？ | 唯一动作数、最近错误、进度增量、时间/token预算 | 最大循环次数、超时、成本上限、重试次数、人工接管 |
| **Final acceptance** | 用户目标是否真正完成？最终回答是否有依据？ | 修复 diff、测试、需求验收项、引用 / evidence | 由测试与 acceptance contract 做最终验证；不能只信 Agent 自评 |

把上面变成可落地的 harness，需要区分两种不同问题：

~~~text
"Does this proposed action look dangerous?"
→ fuzzy bounded judgment（decision model）

"Is this user authorized to execute this command?"
→ deterministic authorization（code）

"Did the shell process exit with code 0?"
→ deterministic observation（code）

"Does this outcome substantively satisfy the user's request?"
→ bounded semantic evaluation + external evidence gate
~~~

例子：`rm -rf ./build` 在临时构建目录里可能合理，面对不受信任路径则可能危险。模型可以输出“需要审批”的**风险信号**，却不能把“97% safe”转换为绕过权限检查的执行许可。同样，连续执行 `search → open → search → open` 不等于有进展；可用语义判断辅助识别停滞，但硬性的 loop / spend cap 始终要在代码中生效。

**Structured Output ≠ Decision Model：** 让通用 LLM 返回 `{"urgent": true}` 仍属于受 schema 约束的生成；Jev 的产品定位是直接对预定义问题返回类型化值及概率。无论哪一种，schema 合法都不能证明语义判断正确。对照实验应包含 routing quality、false approval / false block、stuck-loop recall、completion false-positive、P95 latency，以及下游 task success。

> **Decision models produce evidence for a branch; the runtime owns the branch, permissions, and side effects.**

### 6.10.8 Source boundary

本节最初由用户提供的视频总结触发；2026-10-08 补充核对 AI Engineering 在 2026-09-23 发布的《Jev Clearly Explained》，并沿用 2026-10-07 对其 2026-09-25 后续文章《Jev vs LLM Clearly Explained》的核验。三份材料的共同核心是：Jev 面向预定义闭环决策，适合与传统 LLM 形成 System-One + System-Two 分工。后者进一步强调了 open-output vs bounded-decision 的对比，以及 decision model 在 agent harness 中用于 routing / gating / progress / completion checks 的位置。

Handbook 对其做了以下工程化整理：

- 把 Jev 放入既有 **cost-aware routing cascade**，而不是创建独立架构；
- 将 Noul / Choice / Score 视为 typed decision primitives；
- 明确 **type safety ≠ semantic correctness**；
- 把厂商 benchmark 与可复用架构原则分开；
- 将选型标准从 **closed decision vs open generation / reasoning** 进一步细化为 **deterministic code vs fuzzy bounded decision vs open generation**；
- 明确 parallel sampling 只消除独立 decision 的不必要串行生成，不消除 workflow 的真实数据依赖；
- 保留 confidence、fallback、authorization、evaluation 与 human review 边界。

官方核对日期：2026-10-08（补充核对 09-23 原文；公开来源核验，未进行 live inference benchmark）。同篇 newsletter 的 GitHub Voice Agent 是基于语音转录、LLM 工具调用和 GitHub API 的独立实作，并非 Jev 集成案例，不应用它推断 Jev 的性能。AI Engineering 文中的 Jev latency / price / speed 数字来自 TypeSafe 官方公开材料，Handbook 将其视为 vendor-reported evidence，不升级为跨地区 SLA 或独立 benchmark。

Sources:

- https://aiengineering.beehiiv.com/p/jev-clearly-explained
- https://aiengineering.beehiiv.com/p/jev-vs-llm-clearly-explained
- https://typesafe.ai/blog/introducing-system-one-models-and-jev
- https://docs.typesafe.ai/introduction
- https://api.typesafe.ai/docs
- https://evals.typesafe.ai/
- https://docs.typesafe.ai/confidence
- https://openai.github.io/openai-agents-python/handoffs/
- https://openai.github.io/openai-agents-python/ref/handoffs/
- https://developers.openai.com/api/docs/guides/agents/orchestration
- https://developers.openai.com/api/docs/guides/latest-model
- https://openai.com/index/devday-2026-recap/
- https://www.anthropic.com/claude-sonnet-5-5


## Verification boundary · 2026-09-28

Skill Contract 是业务注册表建议，不是通用 SKILL.md Schema。429 可按 Retry-After 重试。Noul 是官方名称，返回 [0,1] 概率；yes/no 由业务阈值决定。Jev 性能仍是厂商报告，未独立复现。

核对依据：[TypeSafe primitives](https://docs.typesafe.ai/introduction)。完整范围、逐节结论与未验证项见 [本次审计](../verification/2026-09-28.md)。

补充一手资料（仅支持对应概念/实现，不证明整章方案普遍最优）：

- [HTTP retry semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)


## 6.11 FDE Tool / Function Calling, AG-UI and AP2 protocol boundaries (Q45–Q46)

> **Provenance:** Tool/function calling already has a substantial owner explanation in §6.6: the earlier missing-term mark in the 167-topic audit was a **label mismatch, not absence of the concept**. AG-UI and AP2 are versioned external protocols, verified against their maintainers' public documentation as of 2026-10-08. Questions below are original, not paywalled FDE answer text.

### Tool / Function Calling · Owner reconciliation, not a new protocol

Model-produced function name and JSON arguments are **proposals**, not authorized actions; the host validates schema, trusted caller/tenant scope, resource policy, idempotency/approval, tool availability, then executes and appends the observed tool response. A schema-valid tool invocation may still have wrong business meaning. See §6.6 and CH08/CH10 for existing deeper examples.

### Q45 · AG-UI vs MCP vs A2A：这三个协议替代关系是什么？

AG-UI is an **agent↔user-facing app interaction/event stream**, not by default a tool API or an agent-agent interoperability standard. It handles UI update semantics, streamed events, shared state and human participation between a frontend and an agent backend. Its maintainers distinguish **A2UI** (agent-delivered UI description/widgets) from **AG-UI** (the transport/event interface); neither means the frontend should be trusted to grant tool permissions.

| Boundary | Protocol role | What it does NOT supply |
|---|---|---|
| MCP | Host/tool or resource interface and capability discovery | end-user authenticated policy for every tool side effect |
| A2A | Agent-to-agent interoperation/task interaction | UI event stream by itself |
| AG-UI | Agent runtime ↔ frontend events, state and user interactions | source-of-truth permissions or business transactions |
| A2UI | Generated UI component specification | trustworthy workflow approval on its own |

**Architecture**: trusted SSO host → policy-aware Agent/Tool Broker → observed structured events → AG-UI stream → browser. UI can render a NEEDS_APPROVAL state; actual approval must be authenticated, scoped to immutable operation parameters and revalidated by the host **at commit**. Cancel signal does not necessarily undo a side effect that already committed (CH08 §8.17).

**Failure drill:** browser replays tool_success, changes a displayed order ID or fakes an approval widget. Require the host to ignore browser-generated claims about tool execution and authenticate the actual approval before any write. Stream reconnection needs ordered IDs/replay behavior appropriate to the chosen library version.

### Q46 · AP2 Agent Payments Protocol：为什么普通 Tool Calling 不等于可审计支付？

AP2 (Agent Payments Protocol) is a public protocol effort for **agent-initiated commerce/payment interactions and interoperable authorization evidence**, available as an extension to agent interoperability/commercial protocols in its published ecosystem. It does **not** turn free-form assistant text into legally sufficient authorization, nor replace payment processor settlement, risk controls or enterprise approval policy.

~~~~text
User intent + explicit scope
 → verify payer and permitted merchant/payment method
 → host records immutable amount/currency/beneficiary/operation ID
 → delegated authorization / user approval where required
 → payment rail / gateway executes with documented idempotency
 → independent receipt reconciliation + dispute/audit
~~~~

**Release non-goals:** never allow “the LLM thought payment approved” to trigger a transfer; never reuse a prompt assertion as the approval credential. On write timeout treat outcome as **unknown**, and reconcile under the gateway's own idempotency contract (CH10 §10.25–26). Confirm protocol version, mandate formats, issuer/merchant support and legal policy independently before implementing.

**Sources:** [AG-UI protocol reference (maintainer repository)](https://github.com/ag-ui-protocol/ag-ui/blob/main/docs/introduction.mdx); [AP2 reference website](https://ap2-protocol.org/); [MCP specification](https://modelcontextprotocol.io/specification/2025-11-25); [A2A protocol](https://a2a-protocol.org/latest/). Cross-chapter: CH08 owns task/control state; CH10 owns trusted identity, approval and idempotency.
