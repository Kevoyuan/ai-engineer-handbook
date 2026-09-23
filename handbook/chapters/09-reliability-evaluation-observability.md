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

## 9.21 Agent Experience Learning：经验不是自动写回，而是受控晋升

一个常见问题：

~~~text
Agent 怎么积累经验？
是不是每跑完一次任务，就把 trajectory 拿去 fine-tune？
~~~

生产系统真正需要回答的是：

~~~text
What happened?
→ What did we learn?
→ Is this lesson trustworthy?
→ Where should it live?
→ When should it affect future behavior?
→ How do we test and roll it back?
~~~

因此更稳定的架构不是 `Trajectory → Fine-tune`，也不是 `Trajectory → Vector DB`，而是：

~~~text
Production Experience
→ Distillation
→ Validation
→ Promotion Decision
   ├─ Case / Episodic Memory
   ├─ Skill / Procedure
   ├─ Deterministic Rule / Validator
   ├─ Regression Dataset
   └─ Training Dataset
→ Offline Eval
→ Release Gate
→ Runtime / Model Update
~~~

> **Agent self-learning is a controlled experience-promotion system, not an uncontrolled self-modification loop.**

### 9.21.1 为什么不应该“每次任务结束就在线 Fine-tune”

Raw Agent Trace 可能包含用户输入、规划、Tool 调用、重试、错误、Fallback 和最终输出，但它并不天然是高质量训练样本。

~~~text
successful final answer
≠
good trajectory
~~~

一个最终成功的任务仍可能包含错误 Tool、无效重试、越权提议、幸运恢复或过高成本；直接把整条轨迹当示范，会把偶然路径也写进训练数据。

> **Raw success logs are evidence, not ground-truth demonstrations.**

生产流量通常还高度失衡：routine success 很多，真正值得学习的 rare failure / boundary case 很少，因此需要 sampling、dedup、failure slicing、hard-case mining 和 adjudication。

外置经验还有一个重要优势：一条错误 Memory / Skill 可以单独失效或回滚；模型版本当然也可以 rollback，但单条训练样本对参数行为的影响通常不像删除一个外部记录那样容易局部撤销。

持续 Fine-tuning 还存在 forgetting / interference 风险。已有研究在 continual instruction tuning 中观察到 catastrophic forgetting，但这不是“每次 Fine-tune 都一定破坏底座”的定律。风险取决于 model、training method、data mix、learning rate、task similarity、replay / regularization 和 eval coverage。

> **Parameter updates require a slower, better-evaluated promotion path than external experience updates.**

### 9.21.2 Fast Path 与 Slow Path

更准确的生产设计是两速学习：

~~~text
FAST LEARNING PATH
External experience
→ Memory / Skill / Rule / Regression
→ fast release

SLOW LEARNING PATH
Curated experience
→ Training Dataset
→ SFT / preference optimization / RL
→ full regression
→ model release
~~~

Fast Path 更适合需要 traceable、editable、deletable、scope-aware、低更新延迟的业务经验；Slow Path 更适合稳定、重复、可评测的行为缺口。

> **Use external experience for rapid adaptation; use parameter learning for stable repeated behavior that survives evaluation.**

### 9.21.3 Fine-tuning 不是“只适合一次性知识注入”

Fine-tuning 更常见的价值包括 task specialization、format consistency、instruction-following correction、classification / extraction、behavior shaping 和 smaller-model specialization。

对于经常变化的事实，例如价格、库存、项目状态、客户数据、政策版本，通常更适合 RAG / Memory / Tool retrieval，而不是反复写进参数。

> **Fine-tuning primarily changes learned behavior; retrieval and memory are usually better for frequently changing external facts.**

### 9.21.4 Raw Trajectory：保存可观察证据，不依赖隐藏 CoT

轨迹至少记录：

~~~text
request
task / user / tenant scope
model / prompt / workflow versions
structured decision / plan
tool + arguments
tool result
state transition
validator result
retry / fallback
latency / token / cost
final output
task outcome
human feedback
~~~

不要把隐藏 Chain-of-Thought 当作经验系统的必需数据。经验学习应建立在 observable action、structured decision、explicit reasoning summary when needed、environment feedback 和 outcome 上。

> **Experience learning should be built on observable behavior and outcomes, not hidden Chain-of-Thought.**

### 9.21.5 Trace ≠ Experience

Trace 是“发生了什么”；Experience 是“从发生过的事情里抽象出一条经过验证、可复用、带适用边界的知识”。

例如一个很长的 Coding Agent Trace，最后可能只提炼成：

~~~text
Task family:
Python package upgrade with async client

Failure:
library v3 removed implicit event-loop creation

Applicable condition:
Python >= 3.12 + library >= v3

Lesson:
create / enter async runtime before client initialization

Evidence:
test id + docs ref + trace_id

Do not apply when:
sync client path
~~~

这一步叫 **Experience Distillation**。

### 9.21.6 Candidate Experience Schema

一个可治理经验条目至少可以包含：

~~~text
experience_id
task_family
trigger_conditions
problem_pattern
recommended_action
anti_pattern
evidence_refs
source_trace_ids
outcome
confidence
validation_status
tool / workflow / model compatibility
environment constraints
scope: global / team / project / tenant / user
created_at
last_validated_at
valid_to
supersedes
version
~~~

特别要有 trigger_conditions 和 do_not_apply_when。

> **A lesson without applicability boundaries becomes a future source of context pollution.**

### 9.21.7 成功案例和失败案例都不能直接照抄

成功案例应继续问：哪个 decision 真正有因果价值？哪些步骤只是偶然？哪些 Tool output 真正决定结果？哪些步骤可以删除？

失败案例则要先归因：

~~~text
agent mistake
tool outage
bad data
permission denied
environment drift
unanswerable task
evaluator bug
~~~

例如 API timeout 不一定是 Planning lesson；wrong tool arguments 才更可能是 Tool / Planner lesson；stale index 导致答案错误则应修 ingestion / retrieval。

### 9.21.8 Promotion Router：经验应该去哪里

| Experience type | Best promotion target | Example |
|---|---|---|
| 一次性用户偏好 | Profile Memory | “答案保持三句话以内” |
| 项目临时约束 | Project / Working Memory | “Atlas 暂时不能升级 SDK” |
| 相似任务历史案例 | Episodic / Case Memory | “这类迁移曾因 schema mismatch 失败” |
| 稳定可复用任务方法 | Skill / Procedure | “调查生产事故的标准步骤” |
| 必须满足的业务不变量 | Code / Policy / Validator | “付款 > X 必须审批” |
| 历史真实失败 | Regression Dataset | “不能再次出现这个失败” |
| Judge 校准案例 | Calibration Dataset | “人类裁决认为此输出越权” |
| 稳定、重复的参数层行为缺口 | Training Dataset | “模型长期无法稳定完成该结构化任务” |

> **Not every experience should become memory, and not every memory should become training data.**

### 9.21.9 Case Bank 不是“全局向量库”

经验库需要的是 retrieval key + scope + validity + provenance + applicability + ranking。Backend 可以是 relational store、document store、vector index、graph、hybrid，甚至 exact lookup。

新任务检索经验时更合理的是：

~~~text
Current Task
→ task-family / intent
→ scope filter
→ environment / tool-version filter
→ permission filter
→ retrieve candidates
→ applicability rerank
→ contradiction / stale check
→ context budget
~~~

只做 embedding similarity 容易召回“语义像、但环境不兼容”的旧经验。

### 9.21.10 Experience Retrieval 的三类风险

**Stale Experience**：旧 SDK / Tool 行为在升级后仍被召回，因此经验应记录 tool_version、environment、valid_to、last_validated_at。

**Self-reinforcing Error**：bad experience → retrieved → bad behavior → new trace reinforces same lesson。因此 Candidate 不能只靠 Agent 自我反思就直接变 Active，需要 validation、counter-example、regression 与 promotion gate。

**Scope Leakage**：用户 A 的私人偏好不能晋升成 global SOP，因此必须区分 user / tenant / project / team / global。

### 9.21.11 从 Case 晋升为 Skill

如果 Case Bank 中反复出现相同 validated pattern，例如“升级前先读 migration guide → 查 breaking changes → 跑 compatibility tests”，就不应永远检索多个历史案例。

更合理的是：

~~~text
Repeated validated pattern
→ Skill candidate
→ consolidate steps
→ define trigger / non-trigger
→ attach references / scripts
→ eval against representative tasks
→ versioned Skill
~~~

> **Cases remember what happened; Skills encode how to act repeatedly.**

### 9.21.12 有些经验最终应该退出 LLM

如果系统反复学到：

~~~text
transfer_amount > threshold
→ human approval required
~~~

最成熟的落点不是继续把这条经验塞进 Prompt，而是把它变成 Policy Gate。

类似地：HTTP 401 不 blind retry → Tool Error Policy；SQL DELETE 必须确认 → Permission Gate；Artifact 必须过 Schema → Validator。

> **The most mature lesson may become code, not memory.**

### 9.21.13 失败首先应该晋升为 Regression Asset

任何值得记住的生产失败，都应该先问：能否复现？能否评估？能否阻止再次发生？

~~~text
Production Failure
→ Root Cause
→ Curated Regression Case
→ Evaluator
→ Candidate Fix
→ Release Gate
~~~

> **Learning is incomplete until the lesson becomes testable.**

### 9.21.14 什么经验才值得进入 Training Dataset

通常至少满足：stable task distribution、repeated behavior gap、high-quality labels / preference signal、clear evaluator、representative cases、low policy volatility、acceptable regression risk。

训练方法也应按问题选，而不是默认 DPO：

~~~text
known good demonstrations
→ SFT

preference pairs / relative quality
→ preference optimization

verifiable reward / grader
→ RL / reinforcement fine-tuning style approach

small specialist decision
→ distill / train smaller decision model
~~~

任何 Training Promotion 都必须经过 holdout、regression、safety/policy、cost/latency 和 release gate。

> **No training promotion without an evaluation contract.**

### 9.21.15 “只训练小模型、不动底座”不是通用规则

合理选择可以包括：冻结 foundation model + external memory / skills；训练 small specialist；训练 adapter / LoRA；fine-tune selected model；或进行 preference / reinforcement optimization。

选择取决于 task stability、data quality、model ownership、latency、cost、privacy、release cadence 和 regression risk。

> **Freeze-by-default is a useful operational bias, not a universal law.**

### 9.21.16 Reflexion、ExpeL、Voyager 分别说明什么

这些研究不代表统一生产标准，但说明了三种不改底座权重的 Experience Promotion 路径：

~~~text
Reflexion
feedback → verbal reflection → episodic memory

ExpeL
trajectories → distilled natural-language insight → inference-time retrieval

Voyager
experience → executable skill library → retrieval / composition
~~~

因此经验学习不应该被缩成一个 Vector DB。

### 9.21.17 Production Architecture

~~~text
Production Task
→ Agent / Workflow Run
→ Observable Trace / Outcome
→ Eval + Root Cause
→ Experience Distillation
→ Candidate Experience
   ├─ Memory / Case
   ├─ Skill / Procedure
   ├─ Deterministic Rule
   ├─ Regression Asset
   └─ Training Candidate
→ Offline Eval / Shadow
→ Release Gate
→ New Production
↺
~~~

不同目标应该有不同 release cadence：Working/Local memory 可以分钟级；Case/Skill/Rule/Regression 可以小时到天级；训练与模型发布通常更慢。

> **Different learning targets deserve different release cadences.**

### 9.21.18 Promotion State Machine

不要让 Agent 自己说“I learned this”然后直接生效。

~~~text
OBSERVED
→ CANDIDATE
→ VALIDATED
→ SHADOW
→ ACTIVE
→ DEPRECATED
→ RETIRED
~~~

每个经验应有 version、owner、evidence、release history 和 rollback path。

### 9.21.19 Experience Eval

至少评估：

~~~text
Retrieval
  experience Recall@K
  applicability precision
  stale-experience rate
  scope leakage rate

Behavior
  task success
  first-attempt success
  recovery success
  tool-call correctness
  trajectory length

Learning quality
  positive-transfer rate
  negative-transfer rate
  experience-induced failure rate
  counter-example robustness

Efficiency
  context tokens
  latency overhead
  retrieval cost
  cost per successful task
~~~

尤其要测 negative transfer：被召回或晋升的经验是否让原本正确的任务变差。

> **Experience systems must measure harm from remembered lessons, not only benefit from recalled lessons.**

### 9.21.20 面试回答模板

> Agent 的经验积累我会分成快慢两条路径。生产 Trace 先作为原始证据保存，通过 Eval 和 Root Cause 抽取 Candidate Experience；经验经过去重、适用条件、scope、版本和证据验证后，由 Promotion Router 决定进入 Case Memory、Skill、Deterministic Policy 还是 Regression Dataset。新任务只检索当前 task / environment 真正适用的经验，不做全局相似度乱召回。只有长期稳定、重复出现、且有明确 Eval Contract 的行为缺口才进入训练数据，再根据数据形式选择 SFT、preference optimization 或 RL，并经过完整 Regression 和 Release Gate。Fine-tuning 不是不能用，而是不应该成为每条生产轨迹的实时第一落点。核心是让经验可追溯、可验证、可失效、可回滚，并且只有成熟经验才晋升到参数层。

### 9.21.21 Source boundary

Primary source:

- 用户提供的视频提取：《王二讲Agent｜Agent怎么做经验积累和自我学习？》

Source-derived ideas retained:

- 保存 Agent 执行轨迹；
- 从长轨迹中过滤并提炼成功 SOP、失败教训和任务模式；
- 新任务检索历史经验作为上下文；
- Fine-tuning / preference optimization 放在更慢的离线路径；
- Experience Bank 要做去重、坏案例过滤和 scope 区分。

Handbook corrections / synthesis:

- “不能 Fine-tune”改成“不应把每条生产轨迹直接在线晋升成参数更新”；
- catastrophic forgetting 定位为 continual fine-tuning 的真实风险，而非必然结果；
- Fine-tuning 定位为 task / behavior specialization，而不是“只做一次性知识注入”；
- 模型版本可 rollback，但单条训练样本影响不像外置 Memory 那样容易局部删除；
- “只训练小模型、不动底座”改成一种策略，而非统一规则；
- Promotion target 扩展为 Memory / Skill / Deterministic Rule / Regression Dataset / Training Dataset；
- 增加 applicability、version compatibility、staleness、scope leakage 和 negative transfer；
- Raw Trace 不把隐藏 Chain-of-Thought 当作必要资产。

External verification:

- Reflexion: verbal feedback can be stored in episodic memory to improve later trials without weight updates.
- ExpeL: trajectories can be distilled into experiential knowledge and recalled at inference time.
- Voyager: experience can become a reusable executable skill library without fine-tuning the underlying LLM.
- Continual fine-tuning research documents catastrophic forgetting as a real risk.
- Current OpenAI model-optimization guidance treats evals, prompt/context methods, and fine-tuning as complementary optimization mechanisms.

Sources:

- https://arxiv.org/abs/2303.11366
- https://arxiv.org/abs/2308.10144
- https://arxiv.org/abs/2305.16291
- https://arxiv.org/abs/2308.08747
- https://developers.openai.com/api/docs/guides/model-optimization
- https://developers.openai.com/api/docs/guides/supervised-fine-tuning
- https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning
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

> **Agent self-learning is a controlled experience-promotion system, not an uncontrolled self-modification loop.**

> **Not every experience should become memory, and not every memory should become training data.**

> **Learning is incomplete until the lesson becomes testable.**
