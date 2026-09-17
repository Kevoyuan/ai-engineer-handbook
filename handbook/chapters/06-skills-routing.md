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
