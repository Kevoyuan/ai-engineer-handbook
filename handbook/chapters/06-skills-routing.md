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

MCP 解决的是**协议层能力接入**：Tools / Resources / Context 的 exposure、discovery、schema、connection 和 transport。

Skill 解决的是**能力契约**：一类任务什么时候适用、需要什么输入、如何执行、怎样验证、如何版本治理。

两者不是替代关系：

```text
Business Goal
→ Skill Contract
→ Workflow / FSM
→ MCP / Function Interface
→ Host
→ Tool / API / DB Execution
```

MCP 可以提供协议级接入和 transport-level authorization mechanisms，但它不替代应用业务授权、policy、approval、idempotency、transaction semantics 或 task verification。Skill 也不定义跨进程通信协议。

> **Protocol exposes capabilities; skills encode reusable task procedures. Neither one replaces authorization, validation, or orchestration.**

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
- 保留“三层漏斗”的流量经济学：越往下请求比例应倾向下降，而歧义、复杂度与单请求成本倾向上升；
- 明确两个反模式：规则层无限扩张形成 **Rule Black Hole**，以及让高成本 LLM 成为所有请求的默认 Front Door；
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



## 6.10 System-One Decision Models：Jev 作为 Typed Probabilistic Fast Path

§6.9 的 Routing Cascade 不要求“轻量 Router”必须是传统 classifier、embedding similarity 或小型 LLM。只要一个组件能够在明确边界内，以足够低的 latency / cost 给出**可校准、可验证、可拒绝升级**的决策，它就可以占据 fast decision layer。

TypeSafe AI 在 2026-09-15 发布的 Jev 是这一设计空间中的一个具体实现。TypeSafe 将它称为 **System One Model**：输入可以是自然语言或结构化 program state，但输出不是自由文本，而是预先定义的 typed probabilistic decisions。

官方当前公开三类 decision primitive：

| Primitive | 语义 | 典型用途 |
|---|---|---|
| **Noul** | yes / no，并返回概率 | 风险判断、条件 gate、是否升级 |
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

### 6.10.4 Benchmark / vendor boundary

截至 2026-09-23，Jev 仍处于 early access。TypeSafe 官方公开材料报告了其在 System-One-shaped workflows 上显著更低的 latency / cost，并展示了并行 decision sampling；这些数字是**厂商在其特定 workflow 与评测设置下的结果**，不能直接外推成“所有业务都快两个数量级”或固定 SLA。

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

### 6.10.5 Source boundary

本节的触发材料来自用户提供的视频总结，核心观点是：Jev 面向预定义闭环决策，适合与传统 LLM 形成 System-One + System-Two 分工。

Handbook 对其做了以下工程化整理：

- 把 Jev 放入既有 **cost-aware routing cascade**，而不是创建独立架构；
- 将 Noul / Choice / Score 视为 typed decision primitives；
- 明确 **type safety ≠ semantic correctness**；
- 把厂商 benchmark 与可复用架构原则分开；
- 将选型标准归结为 **closed decision vs open generation / reasoning**；
- 保留 confidence、fallback、authorization、evaluation 与 human review 边界。

官方核对日期：2026-09-23。

Sources:

- https://typesafe.ai/blog/introducing-system-one-models-and-jev
- https://api.typesafe.ai/docs
- https://evals.typesafe.ai/
