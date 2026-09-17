# Chapter 09 · Reliability、Evaluation、Observability 与 Production Monitoring
## Reliability, Evaluation, Observability, and Production Monitoring

> Canonical semantic chapter. Consolidates the former monitoring, sentiment/A-B, security-monitoring, and capstone supplements.

可靠 Agent 的核心不是“模型很聪明”，而是：

```text
State
Validation
Retry
Fallback
Observability
Policy
Release Evidence
```

## 9.1 Structured Outputs + Validation Gates

模型输出优先通过 JSON Schema、Pydantic、Typed Objects、Enums 等结构化契约，而不是直接执行自由文本。

Validation 可以分为：

```text
Schema
Business Rule
Permission
Artifact
Claim Verification
Safety
```

> **The model proposes completion. The harness proves completion.**

失败恢复必须按原因路由：

| Failure | Recovery |
|---|---|
| Transient API error | retry with backoff |
| Invalid JSON | repair / constrained regeneration |
| Missing input | clarify |
| No evidence | retrieve more / refuse |
| Tool unavailable | fallback tool / escalate |
| Permission denied | reject / request approval; do not blind retry |

副作用动作的控制链：

```text
Identity
→ Permission-aware Retrieval
→ Authorized Context
→ Policy Gate
→ Tool Execution
```

send email、delete data、deploy、approve payment 等动作需要 confirmation、approval、idempotency 与 audit log。

## 9.2 Evaluation 是生命周期基础设施

Evaluation ≠ 一个 Judge Prompt ≠ 一张离线准确率表 ≠ 一次 QA。它持续回答：

```text
Is the candidate better than baseline?
Which slices regressed and why?
Is evidence sufficient for Ship / Canary / Hold / Rollback?
```

Observability 与 Evaluation 构成 Build ↔ Test 内环：

```text
Run Agent
→ Read Trace
→ Locate Failure
→ Fix
→ Rerun
```

失败还要进一步固化为可重复资产：

```text
Observed Failure
→ Curated Dataset Case
→ Evaluator
→ Experiment
→ Regression Protection
```

Eval 至少有三个 Scope：

| Scope | 核心问题 | 典型对象 |
|---|---|---|
| Step / Unit | 某个决策或组件是否正确？ | tool call · retrieval query · parsing · SQL/schema check |
| Final Response / E2E | 从输入到最终输出是否完成用户目标？ | correctness · relevance · groundedness · safety · task success |
| Trajectory | 即使最终答案正确，执行路径是否低效、重复或违规？ | step count · tool order · redundant calls · planning · recovery |

> **A correct final answer does not prove a reliable trajectory.**

标准 Eval Loop：

```text
1. Decide what matters
2. Create / curate a dataset
3. Create an evaluator
4. Run an experiment and compare versions
```

## 9.3 Dataset Manager

数据来源：

```text
Synthetic
Human-authored
Historical Production
Online Bad Cases
Boundary
Safety / Permission
Adversarial
No-answer / Clarification
```

一个通用 Example：

```text
inputs                required
reference_outputs     optional; only when evaluator needs them
metadata              optional; slice / version / environment / risk / source
```

Reference Output 是评估依据，不应泄漏给被测 Agent。

Dataset 构建优先从 PRD 与真实 Failure Mode 出发：

```text
PRD / desired behavior
→ derive scenarios
→ write several questions per scenario
→ add references only when needed
→ attach metadata for slicing and provenance
```

开始阶段优先少量高质量案例，而不是盲目追求样本数量。至少覆盖 Happy Path、Edge Case、Out-of-Scope、Adversarial Input 与历史失败。

Dataset 应随真实使用增长：线上 Eval 低分案例、用户负反馈、PRD 未覆盖 Unexpected Input 可以经过隐私检查、去重、归因与裁决后回流。

至少区分：

- **Development**：日常 Prompt / Tool / Workflow 开发；
- **Regression**：每次发布必须通过，优先收录历史真实失败；
- **Holdout**：减少团队重复查看，防止过拟合；
- **Online Shadow**：真实流量上对比新旧版本但不影响用户。

> **A golden set should be curated, deduplicated, versioned, and sliced—not merely accumulated.**

## 9.4 Observability：Run、Trace、Thread

传统应用的大量决策写在显式代码中；Agent 的部分决策由模型在运行时产生。因此失败时不能只扫描异常栈，还需要重建“这一次运行实际做了什么”。

### Run

Run 是一个可观测执行单元，例如一个 Model call、Retriever call、Tool call 或自定义 span。

### Root Run / Child Run / Trace

一个 Root Run 向下包含多个 Child Runs，形成完整 Trace：

```text
Root Run
├─ LLM Run
├─ Retriever Run
├─ Tool Run
└─ Validator Run

= Trace
```

Trace 应尽可能记录：

```text
request
agent / model / prompt / workflow versions
tool-registry / memory / knowledge snapshot
workflow state
structured decisions
tool + arguments
result / validation status
latency
token usage
cost
final output
```

不要把隐藏 Chain-of-Thought 当作必须存储的 Trace。系统应观测模型做了什么、显式 structured decision / reasoning summary 和运行结果，而不是依赖不可见内部推理。

### Thread

多轮 Agent 每一轮可以产生自己的 Trace；多个 Trace 通过 `session_id`、`thread_id` 或 `conversation_id` 关联成 Thread。

```text
Thread
├─ Trace turn 1
├─ Trace turn 2
└─ Trace turn 3
```

必须区分：

```text
Thread metadata = observability grouping
Conversation / state storage = application persistence
```

把多个 Trace 归进同一个 Thread **不会自动让 Agent 拥有跨轮记忆**。

> **Trace makes one run explainable; Thread makes cross-turn behavior inspectable. Neither one replaces application state.**

## 9.5 Tags、Metadata、Feedback

三者承担不同角色：

```text
Tags
= classify / coarse label

Metadata
= structured dimensions for filter / slice / group-by

Feedback
= judgment / outcome signal attached to run / trace / thread
```

例如：

```text
tags: ["support", "refund"]
metadata: {customer_tier, prompt_version, region}
feedback: {user_sentiment, groundedness, pii_leakage}
```

不要把版本、租户、风险这类结构字段塞成不可查询的自由文本 Tag，也不要把 Feedback 当作稳定事实字段。

## 9.6 Evaluator Routing：Code / LLM / Pairwise / Human

先问：

> **Can I write a function that reliably determines what I want to evaluate?**

如果可以，优先 Code-based Evaluator。

### Code-based

适合 Schema、Output Shape、Action / Tool Type、Keyword / Filter、精确数值、SQL、Unit Test、Latency、Cost、Semantic Retrieval Quality 等可稳定程序化判断的问题。

优势：确定性、快速、便宜、容易 Debug。

### LLM-as-Judge

适合很难写成规则、但人类能相对清楚判断的语义标准，例如是否回答原问题、是否正确 Handoff、是否泄漏敏感信息、语气是否专业。

可靠 Judge 至少遵循：

```text
Narrow scope
Binary / categorical output when possible
Human alignment
```

Judge 输出最好包含：

```text
pass / category
failed_criteria
evidence
repair_hint
```

> **Evaluators should produce repair instructions, not only scores.**

### Pairwise

Conciseness、Professionalism、Helpfulness 等指标有时相对比较比绝对评分更稳定。应随机化 A/B 顺序，降低 Position Bias，并避免把“更短”误当成“更简洁”。

### Human Review

高风险、Judge 分歧、标准不稳定或需要 SME 的任务进入 Human Review + Adjudication。人工裁决应继续沉淀成 Calibration Set、Rubric 与 Regression Asset。

Judge 本身也要评估：Human Agreement、Pairwise Consistency、Self-consistency、Position Bias、Verbosity Bias、Reference Leakage、Prompt Sensitivity、Model-version Drift。

## 9.7 Metrics：不要压成一个平均数

至少分五组：

```text
Outcome
  Task Success · Answer Correctness · No-answer Accuracy · Citation Support

Process
  Tool Selection · Argument Correctness · Plan Completion · Recovery · Loop Rate

Efficiency
  Latency P50/P95/P99 · Tokens · Cost/Success · Retry · Cache Hit

Safety
  Policy Violation · Unauthorized Retrieval · Sensitive Exposure · False Refusal/Allow

Business
  CSAT · Deflection · Conversion · Time Saved · Support Cost
```

同时按 Query Slice、Risk Slice、Language/Region、Tool/Workflow Version、New vs Regression 查看，不让 Overall Average 掩盖高风险 Failure。

## 9.8 Offline + Online Evaluation

离线比较 Prompt / Model / Tool / Memory / Workflow 时，固定 dataset version、judge version、model settings、tool mocks / data snapshot、random seed，确保版本比较可复现。

```text
Target Agent
× Dataset
× Evaluators
→ per-example results
→ aggregate + slice comparison
```

线上关注 Distribution Shift、Tool Reliability、Latency、User Corrections、Fallback、Human Escalation 与 Business Outcomes。

常见路径：

```text
Shadow
→ A/B Test
→ Canary
→ Human Review Sampling
→ Continuous Monitoring + Alerts
```

线上反馈有偏差：点赞不等于正确；没有投诉不等于成功；人工接管也不一定意味着 Agent 失败。要与可验证业务结果、人工审查和系统证据组合。

> **Online evaluation scales judgment; it does not eliminate evaluator uncertainty.**

## 9.9 Release Gate

Evaluation 只有连接到发布决策才形成闭环：

```text
Ship
Canary
Hold
Request Human Review
Rollback
```

Gate 可以定义 task success、high-risk violation、citation support、P95 latency、cost per success 等约束。

> **Overall score improvement cannot compensate for a critical safety regression.**

Dashboard 负责解释变化；Release Gate 把指标转换成发布决策。两者不是一回事。

## 9.10 Error Analysis + Data Flywheel

Failure Taxonomy 至少覆盖：

```text
Input Understanding
Routing
Retrieval
Memory
Planning
Tool Selection
Tool Argument
Tool Execution
Evidence
Generation
Citation
Policy
Recovery
Evaluation
```

> **Fix the earliest incorrect decision, not the final symptom.**

Data Flywheel：

```text
Production Trace
→ Bad-case Detection
→ Root-cause Analysis
→ Privacy Review / Dedup / Label / Adjudication
→ Dataset Split Assignment
→ Fix Agent
→ Offline Regression
→ Shadow / Canary
→ Release
→ New Production Trace
```

每次发布都应能回答：由哪套 dataset、annotation guideline、judge、model、prompt、tool registry、workflow、knowledge snapshot、policy version 得到当前结果。

## 9.11 Layered RAG Evaluation

| Layer | 问题 | 指标 | 常见失败 | 修复 |
|---|---|---|---|---|
| Retrieval | 是否召回答案文档 | Recall@K · MRR · nDCG | keyword mismatch / semantic miss | Query Rewrite · Hybrid · Index Tuning |
| Context | Context 是否有噪声/冗余 | Precision · Coverage · Redundancy | 无关内容挤占预算 | Rerank · Dedup · Dynamic Chunking |
| Generation | 是否忠实于证据 | Correctness · Groundedness · Citation | 幻觉 / 越界推断 | Verification Gate · Rubric Tuning |
| System | SLA 是否满足 | P50/P95 · Cost/Task · Safe Pass Rate | timeout / over-budget / loop | Caching · Fallback · Timeout Guard |

## 9.12 Latency Diagnosis：先 Trace，再归因

当“hello”都很慢时，不要先怪 Embedding，因为问候通常不需要知识库。先拆 End-to-end Latency Budget：

```text
Queue
→ Route
→ Embed
→ Retrieve / Rerank
→ Prompt / Prefill
→ TTFT / Decode
```

第一次慢、后面快，常见是 Model loading、GPU runtime init、index load、cold cache；在线服务应遵循：

```text
Load → Warm-up → Ready → Traffic
```

每次都慢则检查 repeated loading、GPU 未真正使用、CPU/Disk Offload、长 Context、输出过长、Queueing、无条件执行完整 RAG。

Runbook：

```text
1. 禁用 RAG 单测简单请求
2. 连续调用 3–5 次比较 Cold / Warm
3. 记录 Queue / TTFT / Decode / Total
4. 确认 LLM / Embedding / Index 只加载一次
5. 检查 GPU / VRAM / Offload / Quantization
6. 单测 Query Embedding
7. 单测 Retrieval / Document Fetch
8. 单测 Reranker
9. 比较空 Context 与真实 RAG Context
10. 建立 P50 / P95 性能回归
```

> **Measure before attribution; preload before traffic; route trivial requests away from RAG.**

## 9.13 Production Agent Harness

Harness 的职责是把 Authority 留在模型之外：

```text
Input Boundary
  State / Memory
  Tool Registry
  Context Builder
       ↓
LLM / Agent Policy
  structured proposal only
       ↓
Validation & Control
  Schema Validation
  Permission / Risk Gate
  Retry / Fallback / HITL
       ↓
Execution
```

权限、验证、恢复、预算、可观测性应该由 Host / Workflow 控制，而不是依赖模型自律。

需要持续追踪 Trace、Eval、Latency/Token/Cost Budget、Permission/Side-effect Audit。

## 9.14 Cost per Successful Task

模型价格低，不等于任务成本低。弱模型如果导致更多重试、更多轮次、更多检索和更长 Context，总 Token 量可能上升，Task Success 也可能下降。

```text
cost_per_attempt
= tokens_per_attempt / 1,000,000 × blended_token_price

cost_per_task
= cost_per_attempt × average_attempts

cost_per_successful_task
= cost_per_task / task_success_rate
```

成本有两根杠杆：

1. **Token Volume**：检索、文件读取、推理、Context、输出、重试、重新规划；
2. **Blended Price**：通过 model-family / model-tier routing，让普通步骤用便宜模型，只在真正困难的少数步骤使用强模型。

> **Optimize cost per successful task, not price per model call.**

### Cost attribution first

成本优化前必须先能回答“钱花在哪里”：

```text
Task Cost
→ Trace Cost
→ Child Run Cost
   ├─ LLM
   ├─ Database
   ├─ Search
   └─ Tool / API
```

在 LangSmith Capstone 示例中，`get_current_run_tree()` 被用于：

```text
capture run id
inspect ls_provider / ls_model_name for model pricing
attach usage_metadata.total_cost for literal non-LLM/tool cost
```

其中课程给数据库查询人工注入固定成本只是教学模拟，不是数据库查询的通用价格。

> **Attribution first → aggregation second → optimization third.**

## 9.15 Production Monitoring：把真实流量变成 Build / Test 输入

ADLC 可以看成两个嵌套循环：

```text
Inner loop
Build ↔ Test

Outer loop
Deploy → Monitor → Build → Test → Deploy
```

### Batch Trace Mining

当 Trace 从几十条增长到几千条，人工逐条阅读不再可扩展。通用流程：

```text
Production Traces
→ summarize each run
→ cluster similar behavior / failures
→ generate findings and candidate actions
```

它适合发现 Usage Pattern、常见 Tool Path、重复 Failure Mode、异常长 Trajectory、集中发生的 Policy / Retrieval / Handoff 问题。

Cluster 是调查线索，不等于 Root Cause。批量分析仍要管理敏感字段、模型/Prompt 版本、Sampling / Stratification 与 Human Review。

### Online Evaluation

```text
Offline
Dataset → Candidate Version → Evaluators → Release Evidence

Online
Production Trace / Thread → Evaluator → Score / Category → Trend / Routing Signal
```

Online Eval 可以覆盖单 Trace，也可以覆盖 Thread 级行为。

### Automation = Filter + Sampling + Action

```text
Filter
→ which traces / threads deserve handling?

Sampling Rate
→ how much of the matching population?

Action
→ annotation queue / dataset candidate / webhook / incident / retention
```

> **Monitoring without routing is telemetry; monitoring with curated feedback becomes learning infrastructure.**

> **The production loop closes only when monitored behavior becomes reproducible test evidence.**

## 9.16 User Sentiment：显式 + 推断两条证据通道

Latency、Error Rate 和基础设施告警不能证明用户是否满意。Production Monitoring 还需要 Experience Signal：

```text
Operational health
latency · errors · availability

+ Experience quality
explicit feedback · inferred sentiment · thread outcome
```

两条互补方式：

1. **Explicit feedback**：用户 thumbs up/down，信号直接但稀疏；
2. **Inferred sentiment**：Thread-based evaluator 自动判断总体体验，覆盖广但不是真值。

> **Explicit feedback is sparse but direct; inferred feedback is broad but uncertain.**

### LangSmith implementation example

课程示例使用：

```python
client.create_feedback(
    key="user_sentiment",
    score=1 if reaction == "liked" else 0,
    trace_id=trace_id,
)
```

`trace_id` 把反馈绑定到具体 Trace。课程采用 Binary Score，并允许在需要阶段归因时把反馈挂到 Child Run。

跨平台抽象：

```text
User Feedback Event
+ Trace / Thread Identity
+ Signal Name
+ Binary / Categorical Value
+ Signal Source
+ Version Metadata
→ Feedback Store
```

不要只保存裸 `0/1`，至少保留：

```text
signal_source = explicit_user | online_evaluator
trace_id / thread_id
prompt_version
agent_version
evaluator_version
model_version
timestamp
```

> **A sentiment score without provenance is hard to interpret and easy to misuse.**

### Thread-based Eval

满意度常常需要跨轮判断。Thread evaluator 等会话 idle 后读取完整 Human/AI dialogue，再给出总体标签。

课程示例中的“Neutral 归 Positive”“final human message 权重更高”、30–50% sampling、Gemini 2.5 Flash / GPT-4.1 nano 都是具体课程配置，不是通用标准。

## 9.17 A/B Testing：用版本 Metadata 验证修复

发现问题后，不能只“上线新 Prompt 希望它更好”。核心是：给每个 Run 打上版本 Metadata，然后按版本比较真实生产指标。

```text
Real Traffic
→ Experiment Assignment
→ Version Metadata
→ Same Observability / Evaluators
→ Slice by Version
→ Compare Outcomes
→ Release Decision
```

LangSmith 课程示例：

```python
with ls.trace(
    name="support-agent",
    metadata={"prompt_version": version},
) as rt:
    ...
```

然后 Monitor 按 `metadata.prompt_version` Group by。

手册将 Version 维度推广到：

```text
prompt_version
agent_version
workflow_version
tool_registry_version
retrieval_index_version
policy_version
experiment_id
```

这是 Handbook generalization，不是课程逐项规定。

> **Monitoring finds the problem; versioned experiments test the fix.**

## 9.18 Security Monitoring：Detection ≠ Prevention

生产环境需要检测 Prompt Injection、PII leakage 等安全信号，但必须明确：

> **Online security evaluation detects what happened in production; it does not prevent the attack from happening.**

真正 prevention 仍来自授权、最小权限、数据最小化、工具边界、sandbox、policy gate、output constraints 等运行时防线。

完整闭环：

```text
Production Request
→ Runtime Defenses
→ Trace
→ Online Security Evaluation
→ Security Signal
→ Dashboard / Alert / Human Investigation
→ Root Cause / Dataset / Rule / Policy Fix
→ Offline Regression
→ Release
```

### Code-based + LLM-as-Judge

Code-based evaluator 适合 email、payment-card-like number、known forbidden token、schema / deterministic policy 等结构模式。

LLM-as-Judge 适合：合法偏好修改 vs malicious override、System Prompt extraction、authorization-aware PII exposure、role-play / encoding / translation bypass 等需要语境判断的问题。

> **Use deterministic checks for structured evidence and contextual judges for policy interpretation.**

### Prompt Injection detector

课程示例使用 narrow binary evaluator：

```text
prompt_injection: true / false
```

如果 `Can you respond in Spanish instead?` 被误判为攻击，应该先修 evaluator definition / prompt boundary，而不是通过提高 sampling 或调整 alert threshold 掩盖错误。

> **When a security judge is systematically wrong, fix the evaluator definition before tuning the alert.**

### PII leakage detector

关键不是“有没有 PII 字符串”，而是：

```text
Data sensitivity
× Subject identity
× Requester identity
× Authorization context
× Purpose
× Output exposure
```

因此：

```text
PII present ≠ PII leakage
```

### Sampling boundary

安全 Sampling 没有统一最佳比例：

```text
Risk Profile
+ Traffic Volume
+ Judge Cost
+ Incident Severity
+ Existing Defenses
+ Required Coverage
→ Sampling Policy
```

如果只评估 10% Trace 且一周没有告警，唯一能确认的是：**没有被评估的样本被 Flag**，不能推出“没有泄漏”。

> **No alert under partial sampling does not prove that no incident occurred.**

记录：

```text
total_trace_count
evaluated_trace_count
sampling_rate
filter_scope
evaluator_version
flagged_count
```

### Severity routing

不同 Security Signal 需要不同动作：

```text
prompt injection attempt
→ dashboard / baseline / trend / representative investigation

repeated spike
→ security investigation / possible alert

confirmed PII leakage
→ immediate incident / on-call escalation

judge disagreement
→ human review / adjudication
```

课程用 LangSmith + PagerDuty 的 `pii_leakage=true → threshold 1 / 5 min → critical incident` 作为实现示例；它不是跨系统固定标准。

## 9.19 Production Monitoring Stack：Capstone synthesis

Capstone 把前面的能力串成一套系统：

```text
Production Traffic
        ↓
Run → Trace → Thread
        ↓
Tags · Metadata · Feedback
        ↓
Usage / Cost Attribution
        ↓
Filter · Group-by · Trend
        ↓
Insights · Online Evals · Security
        ↓
Representative Trace / Thread Investigation
        ↓
Root Cause
        ↓
Dataset · Regression · Fix
        ↓
Release
        ↺
```

LangSmith-specific examples include：

```text
Monitor group-by metadata.customer_name
Insights category clustering
security evaluators
credit-card detector
thread satisfaction evaluator
```

通用工程抽象是：Trace / Thread identity、structured metadata、feedback provenance、version dimensions、cost attribution、batch insights、online eval、security signal routing 与 human review。

Explicit user feedback 和 thread-level evaluator 不要求完全一致；它们是两个不同证据通道。分歧本身可以成为调查信号。

## 9.20 Production Learning Loop

```text
Real Traffic
→ Trace / Thread
→ Online Eval + Batch Insights + Explicit Feedback
→ Filter / Sample / Route
→ Human Review / Root Cause
→ Curated Dataset / Regression Asset
→ Build Fix
→ Offline Experiment
→ Release Gate / Canary
→ Production
→ New Traffic
```

> **Monitoring must produce learning assets.**

## Source notes

LangChain Academy 课程在本章中作为 implementation evidence，而不是通用架构定义。涉及内容包括 Reliable Agents 与 Production Monitoring 中的 observability、datasets、experiments、online evals、automations、sentiment、A/B testing、security monitoring、dashboards/alerts 和 capstone。

Representative sources:

- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-1/observability
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/evaluating-agents
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-3/user-sentiment
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-3/ab-testing
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-4/online-evals-for-security
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-4/setting-up-alerts

## Canonical rules

> **The model proposes completion; the harness proves completion.**

> **Traces make failures visible; evals make them durable.**

> **Monitoring without routing is telemetry.**

> **Online evaluation scales judgment; it does not eliminate evaluator uncertainty.**

> **Optimize cost per successful task.**

> **Online security eval is detection, not prevention.**

> **No alert under partial sampling does not prove zero incidents.**

> **Production monitoring closes the loop only when signals become curated learning assets and repeatable regression tests.**
