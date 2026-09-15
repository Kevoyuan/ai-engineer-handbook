# Chapter 09 Supplement · Production Monitoring
## 从 Test 内环扩展到生产 Monitor 外环

> Source-derived semantic supplement for Chapter 09. This material is based on LangChain Academy Reliable Agents Module 3: Production Monitoring, Insights Agent, Online Evaluations, and Automations, plus the Production Monitoring lessons on token/cost breakdowns, cost tracking, and cost analysis in the UI.

当 Agent 只被开发者自己使用时，可以人工阅读少量 Trace、定位失败并修复；一旦进入 dogfood、beta 或早期生产，Trace 数量从几十增长到几百、几千，人工逐条检查就不再可扩展。

因此 ADLC 从局部 Build ↔ Test 内环扩展为生产外环：

```text
Build
→ Test
→ Deploy
→ Monitor
→ Build
```

Monitor 的目标不是再做一个 Dashboard，而是把真实生产行为变成下一轮 Build 与 Test 的输入。

> **Production monitoring is a learning system: real traffic must become structured evidence for the next engineering iteration.**

## 1. Monitor 阶段的三类基础能力

生产 Monitor 可以拆成三层：

```text
Production Traces
      ↓
Bulk Analysis / Insights
      ↓
Online Evaluation
      ↓
Automation / Routing
      ↓
Human Review · Dataset · Alert · External Action
      ↓
Build / Test
```

- **Bulk Analysis / Insights**：从大量 Trace 中发现使用模式、常见行为和 Failure Mode；
- **Online Evaluation**：在生产 Trace 到达时自动打分，持续产生质量信号；
- **Automation**：根据分数、错误、Metadata 等条件筛选 Trace，并触发后续动作。

Test 阶段已有的 Trace、Dataset、Evaluator 不是一次性测试资产；它们会成为 Monitor 阶段继续运行的基础设施。

## 2. Bulk Trace Analysis：人工 Review 的生产级替代

少量 Trace 可以人工读；大量 Trace 需要先压缩再聚类。

一个通用流程是：

```text
Trace Batch
→ Summarize each trace
→ Cluster similar summaries
→ Generate findings / failure report
→ Select representative traces
→ Engineering action
```

LangSmith 的 Insights Agent 示例采用三步：逐 Trace 摘要、摘要聚类、基于 Cluster 生成报告。课程当前示例说明其一次可处理最多约 1,000 条 Trace；这个数字是**来源课程中的产品/实现能力说明**，不是 Production Monitoring 架构本身的通用上限。

这里应把它理解为一种 **production-scale trace analysis pattern**，而不是必须绑定某个产品。

批量分析适合回答：

- 用户实际上在用 Agent 做什么？
- 哪些失败重复出现？
- 哪些 Tool / Workflow 路径最常见？
- 新行为是否形成新的 Query Slice？
- 哪些 Cluster 值得进入 Dataset 或单独建立 Eval？

> **Do not read every production trace; build a system that surfaces representative patterns and failures.**

Cluster 只是一条调查线索，不应直接等价为 Root Cause。工程上仍要抽取代表 Trace、回到原始 Tool / State / Evidence，验证最早错误决策。

## 3. Online Eval：把生产行为变成连续质量信号

Offline Eval 是主动在一个 Dataset 上运行实验；Online Eval 是对生产 Trace 或 Thread 自动评估。

```text
Offline
Dataset → Agent Version → Evaluator → Experiment

Online
Production Trace / Thread → Evaluator → Continuous Score
```

Online Eval 可以针对全部流量，也可以只针对满足条件的子集。适合持续追踪：

- user sentiment；
- correctness / groundedness；
- policy compliance；
- tool usage quality；
- task completion；
- latency / cost；
- thread-level experience。

Thread-based Eval 很重要，因为有些质量只能跨多轮判断。例如用户情绪、重复澄清、上下文漂移、最终是否真正解决问题。

### 为什么课程用 User Sentiment 作为例子

传统 NPS、问卷、点赞/点踩依赖用户主动反馈，会产生明显的 voluntary-response bias：愿意反馈的人往往不是全部用户的代表。对真实 Conversation 运行 LLM-as-Judge，可以让更多会话获得统一的 Sentiment 信号，因此覆盖面更广。

但这并不意味着 LLM Judge 就是真值。生产使用仍要管理 Judge Version、Human Agreement、Sampling、Privacy、Prompt / Model Drift，并对高风险或 Judge disagreement 做人工复核。

> **Broader coverage reduces feedback-selection bias, but judge uncertainty still needs calibration.**

Online Eval 只是 **signal generation**。如果分数没有连接到告警、Review、Dataset 或 Release / Build 决策，它仍然只是 Dashboard 数据。

> **Online evals create signals; monitoring becomes operational only when signals route work.**

## 4. Automation：把分数变成动作

一个 Automation 至少包含三个部分：

```text
Filter
→ Sampling Rate
→ Action
```

### Filter

决定哪些 Trace 被匹配，可基于：

- eval score；
- feedback；
- error status；
- metadata；
- route / tool / agent version；
- risk level。

### Sampling Rate

并非所有匹配 Trace 都必须 100% 处理。Sampling 可以控制人工 Review 成本、标注吞吐和数据分布。

### Action

常见动作：

- Add to annotation queue；
- Add to dataset；
- Trigger webhook / external workflow；
- Extend retention；
- Alert / escalation。

来源课程给出的典型模式可以抽象为：

| Pattern | Filter / Sampling | Action | Handbook interpretation |
|---|---|---|---|
| Catch unhappy users | Negative user sentiment | Annotation queue | 低质量信号进入人工 Review，而不是直接当 Ground Truth |
| Build dataset candidates | Positive user sentiment | Add to dataset | 先成为 candidate，再做隐私、去重、代表性与预期行为裁决 |
| Spot-check normal traffic | No filter, sample 10% | Annotation queue | 保留随机样本，避免系统只看到“已知坏例” |

典型生产模式：

```text
Negative sentiment / low quality
→ Human review queue

High-quality representative case
→ Candidate dataset example

Random production sample
→ Human spot-check

Critical policy / permission failure
→ Immediate alert / escalation
```

不要把“Positive score → 自动进入 Golden Set”做成无条件规则。进入长期 Dataset 前仍应经过隐私检查、去重、代表性判断、Root Cause 标签、预期行为确认和 Split Assignment，避免数据污染与过拟合近期流量。

## 5. 从 Production Failure 到 Regression Asset

Monitor 外环真正闭合时，生产失败会变成可重复测试资产：

```text
Production Trace
→ Online Eval / Bulk Insight
→ Automation catches candidate
→ Human / deterministic triage
→ Root Cause
→ Curated Dataset Case
→ Offline Regression Eval
→ Fix Prompt / Tool / Policy / Workflow
→ Shadow / Canary
→ Production
```

这和 Chapter 09 现有 Bad Case Flywheel 一致，但这里补上了生产规模下的 **signal → routing → curation** 层。

> **A production failure is not yet a regression test. It becomes one only after curation, expected behavior, and reproducibility are established.**

## 6. Monitoring 的两个层级：单次 Trace 与总体分布

生产监控不能只看单条 Trace，也不能只看平均 Dashboard。

```text
Micro level
Trace / Thread
→ explain one failure

Macro level
Clusters / Slices / Trends
→ explain population behavior
```

单次 Trace 用来做 Root Cause；Cluster、Slice、趋势与版本比较用来判断系统性 Regression、Distribution Shift 和新的 Failure Mode。

因此 Dashboard 至少应能按 Query Slice、Risk Slice、Language/Region、Agent/Prompt/Tool/Workflow Version、New vs Regression、Online vs Offline 对比，而不是只展示 Overall Average。

## 7. Human Attention 也是预算

生产 Trace 无限增长，但人工 Review 能力有限。Monitoring 系统要显式管理 Human Attention Budget：

- high-risk / severe failures 优先；
- Judge disagreement 进入人工；
- representative samples 代替重复案例；
- random sampling 保留对未知 Failure 的发现能力；
- Automation 控制 annotation queue 的吞吐。

> **Monitoring should optimize what humans inspect, not merely how much telemetry the system stores.**

## 8. LangSmith 是实现示例，不是架构边界

来源课程使用 LangSmith 展示：Insights Agent、Online Evals、Automations、Annotation Queue、Dataset Routing 等能力。手册保留这些概念，但把它们抽象成跨平台设计：

```text
Trace Store
→ Batch / Streaming Analysis
→ Evaluator Service
→ Filter + Sampler
→ Action Router
→ Human / Dataset / Alert / Webhook
```

同样的架构可以映射到 LangSmith、Langfuse、OpenTelemetry + 自研分析管线或其他 Agent Observability 平台。

## 9. Cost Observability：先把成本记对，再谈 Cost per Successful Task

Chapter 09 的核心成本目标仍然是 **Cost per Successful Task**。这组课程补充的是它的上游记账层：真实生产成本必须先从 Run / Trace 中可靠采集，再解析价格，最后才能与任务结果连接。

一个通用成本观测链可以写成：

```text
Run / Trace
→ Usage Capture
→ Pricing Resolution
→ Run Cost
→ Trace / Project Aggregation
→ Slice / Trend Analysis
→ Join Task Outcome
→ Cost per Successful Task
```

这意味着要把两个问题分开：

1. **Usage measurement**：到底消耗了多少 Token、调用了哪些 Tool / API、产生了哪些非 LLM 成本？
2. **Pricing resolution**：这些使用量在当时的 Model / Provider / Token Type / Contract 下应该按什么价格计算？

> **Usage is telemetry; cost is usage resolved against a pricing contract.**

只记录一个 `total_tokens` 很难解释成本变化，因为不同 Token 类型可能有不同价格；只记录一个 `total_cost` 又很难定位成本到底来自 Prompt、Reasoning、Tool、Retrieval 还是 Retry。

## 10. Token Breakdown：Input / Output / Other

来源课程把成本拆成三类：

| Category | 典型内容 | 工程意义 |
|---|---|---|
| Input | prompt、text/image input、cache reads 等 | 解释 Context、Prompt、重复前缀与 Prefill 成本 |
| Output | generated text/image、reasoning token 等 | 解释 Decode / Reasoning 与输出长度成本 |
| Other | tool、retrieval、第三方 API、自定义 Run | 补齐非模型调用成本，避免“LLM 成本 = 总任务成本”的错觉 |

生产系统应尽量保留 Token Subtype，而不是把所有 Input / Output 合成单个数字。例如 Cache Read 与普通 Input Token 即使都属于 Input，也可能有不同单价；Reasoning Token 也可能需要单独观察。

### Cache Read 的正确读法

课程强调 Prompt Caching 会让重复的前缀——例如 System Prompt、Tool Definitions、较早 Conversation Prefix——以更低价格复用。来源中将 Cache Read 描述为通常显著低于普通 Input Token 的价格，实际折扣取决于 Provider。

因此：

```text
large cache-read token share
≠ large cache-read cost share
```

如果某 Trace 的 Input Token 大部分来自 Cache Read，Token 数可以很高，但成本占比可能仍较小。优化时不要只看 Token Share，要同时看 **Token Type × Effective Price**。

> **Token share is not cost share when token subtypes have different prices.**

## 11. LLM 与 Non-LLM 成本的记账方式不同

来源课程中的 LangSmith 实现把两类 Run 分开处理：

### LLM Run

```text
Token Counts
+ Model / Provider Identity
+ Pricing Table
→ Computed LLM Cost
```

Token 数据可以由 SDK / Provider Response 自动提取，也可以由应用手工上报。关键不是“自动还是手动”，而是成本计算最终仍需要：

```text
usage
model identity
provider identity
pricing rule
```

对于无法自动提取 Usage 的模型，可以手工上报 `usage_metadata`；对于 Custom / Self-hosted Model，即使已经有 Token Count，如果 Pricing Table 没有匹配的 Model / Provider 规则，也无法得到正确成本。

### Non-LLM Run

Tool、Search API、Retrieval、Database、第三方服务等不一定有 Token Price。来源课程采用的方式是直接为 Run 上报 literal cost，例如 `usage_metadata.total_cost`。

抽象到跨平台系统，就是：

```text
LLM cost       = measured usage × resolved unit price
Non-LLM cost   = metered / billed literal cost
Trace cost     = Σ child run costs
Task cost      = Σ trace / attempt costs + other attributable costs
```

因此真正的 Agent Cost Model 不能只有 Token：Search、OCR、Browser、Vector DB、GPU、Storage、Human Review 等都可能进入任务成本。

## 12. Pricing Table：价格配置本身也是 Versioned Artifact

来源中的 LangSmith Model Pricing Table 通过 `ls_model_name`、可选 `ls_provider`、价格和 Activation Date 解析成本；Custom Model 可以增加 Match Pattern 与自定义价格，也可以覆盖默认价格。

当 Token Subtype 有更具体的价格时，来源实现采用 **most-specific first**：先按 subtype 价格计算，再把剩余 Token 按默认价格计算。例如：

```text
input_tokens = 20
cache_read = 5

default input rate = $2 / 1M
cache_read rate     = $1 / 1M

input cost
= 5 × cache_read_rate
+ (20 - 5) × default_input_rate
```

工程上可把这个规则理解为：

> **Price specific buckets first; price only the residual usage with the default rate.**

否则容易把 Cache Read 同时按 subtype price 和 default input price 重复计费。

来源课程还明确说明：LangSmith 的 Pricing Table 更新**不 retroactive**，只影响价格变更后记录的 Trace，目前不支持对历史 Trace 自动 backfill 新价格。

这带来一个重要的跨平台工程原则：Pricing Config 应保留 `version / effective_from / provider / model / token_type / unit_price`。如果要跨价格变更比较历史成本，应明确自己是在比较“当时实际计价”还是“按统一价格表重算后的 normalized economics”。

## 13. Cost UI 的三个观察尺度

来源课程在 LangSmith 中给出三个入口：

| Scope | LangSmith UI | 适合回答的问题 |
|---|---|---|
| Micro | Trace Tree | 这一次 Trace / Child Run 的钱花在哪里？ |
| Aggregate | Project Stats | 当前项目总体花了多少？ |
| Slice / Trend | Dashboard | 哪个 Model、Tool、Customer、App Version、Environment 或时间段推动了成本变化？ |

这和 Chapter 09 的可观测性层级一致：

```text
Trace Tree
→ explain one expensive run

Project Aggregate
→ measure total spend

Dashboard Slice / Trend
→ explain population-level cost movement
```

如果目标是理解“过去一个月哪个 Tool 最贵”，单条 Trace 太细，Project Total 又太粗，需要按 Tool Name 或其他 Metadata 做 Dashboard 分组与时间趋势分析。

> **Cost debugging needs both attribution depth and population slicing.**

## 14. 从 Cost Breakdown 回到工程动作

成本数据只有能连接到修复动作才有价值。常见映射：

| Observation | 可能原因 | 下一步调查 |
|---|---|---|
| Input cost 高 | Context 太长、重复 Tool Schema、无效 Retrieval | Context Packing、Prompt Prefix、Retriever / Tool Routing |
| Cache Read Token 高但 Cost 低 | 重复 Prefix 被成功复用 | 不要把高 Token Share 误判为成本热点 |
| Output / Reasoning cost 高 | 输出过长、复杂推理路径、模型层级过高 | Max Output、Task Decomposition、Model Routing |
| Tool / Other cost 高 | Search/API/DB 调用过多或单价高 | Tool Call Count、Caching、Batching、Fallback |
| Cost/task 低但 Cost/success 高 | 失败 / Retry / Replan 多 | Task Success、Retry Rate、Root Cause、Model/Workflow Quality |
| 某版本成本突然上升 | Prompt / Tool / Model / Pricing Config 变化 | 按 Version Slice 对比 Trace 与 Pricing Effective Date |

最终仍回到 Chapter 09 的核心指标：

```text
Cost breakdown
→ Root-cause attribution
→ Engineering change
→ Eval / Canary
→ Task Success + Cost
→ Cost per Successful Task
```

> **A cost dashboard is useful only when it can explain what changed and what engineering lever to pull.**

## Source Notes

- LangChain Academy · Reliable Agents · Module 3 · Production Monitoring
- Scaling Analysis with Insights Agent
- Online Evaluations
- Automations
- LangChain Academy · Production Monitoring · Token and Cost Breakdowns
- LangChain Academy · Production Monitoring · Setting Up Cost Tracking
- LangChain Academy · Production Monitoring · Viewing Costs in the UI

Source roots:
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-3/scaling
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-3/insights-agents
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-3/online-evals
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-3/automations
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-1/token-and-cost-breakdowns
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-1/setting-up-cost-tracking
- https://langchain-ai.github.io/lca-lessons/production-monitoring/module-1/viewing-costs-in-the-ui
- https://docs.langchain.com/langsmith/cost-tracking
