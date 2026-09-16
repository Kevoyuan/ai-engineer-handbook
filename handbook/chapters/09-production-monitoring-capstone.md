# Chapter 09 Supplement · Production Monitoring Capstone
## 从 Run / Trace / Thread 到 Cost、Insights、Security 与 Thread-level Eval

> Source-derived semantic supplement for Chapter 09. Based on the LangChain Academy Production Monitoring capstone supplied by the user. Product-specific LangSmith APIs and UI concepts are preserved as implementation examples; handbook synthesis is marked separately.

这份 Capstone 的价值不在于某个 Quiz 答案，而在于它把此前分散的生产监控能力放进同一条操作链：

```text
Production / simulated production traffic
        ↓
Run → Trace → Thread
        ↓
Tags · Metadata · Feedback · Cost
        ↓
Dashboard / Group-by / Filtering
        ↓
Insights / Category Discovery
        ↓
Online Evals
  ├─ PII leakage
  ├─ Credit-card leakage
  └─ Thread-level satisfaction
        ↓
Human investigation / monitoring decision
        ↓
Dataset · Regression · Fix · Release
```

> **Production observability becomes useful when identity, cost, quality, security, and conversation outcome can all be joined back to the same execution hierarchy.**

---

## 1. Run、Root Run、Child Run、Trace、Thread：先把观测层级分清

来源课程给出了一组非常实用的 LangSmith observability definitions。

### Run

Run 是最基本观测单元。一个被 `@traceable` 包装的函数调用会产生一个 Run，记录：

- function name；
- inputs / outputs；
- timing；
- tags；
- metadata；
- cost / usage；
- feedback 等关联信息。

### Root Run

没有 Parent 的 Run。它是一次 Execution 的入口。

在课程示例中：

```text
csa.chat()
```

每次从外部调用时都会形成一个 Root Run。

### Child Run

从另一个 traced function 内部调用的 Run。

来源示例：

```text
chat()                         ← root run
├── query_database()           ← child run
├── _call_llm()                ← child run
├── query_database()           ← child run
└── _call_llm()                ← child run
```

Child Run 让 Tool、LLM、Retrieval 等成本、延迟和失败可以被定位到具体阶段，而不只停留在“整次请求失败/成功”。

### Trace

Trace 是从一个 Root Run 向下展开的完整 Run Tree。

课程示例中：

```text
one csa.chat() call
= one root run
= one trace
```

Trace ID 等于 Root Run ID。

### Thread

Thread 把同一多轮 Conversation 中的多个 Trace 连接起来。

```text
Turn 1 → Trace A
Turn 2 → Trace B
Turn 3 → Trace C
Turn 4 → Trace D

A + B + C + D
        ↓
     Thread
```

来源示例中，一个 4-turn 的 CSA Conversation 会产生 4 个 Trace；每个 Trace 下面又可以有多个 Child Run。所有这些 Trace 通过同一个 CSA `thread_id` 组成一个 Thread。

因此可以得到一个通用层次：

```text
Thread
└── Trace 1
    ├── Root Run
    └── Child Runs
└── Trace 2
    ├── Root Run
    └── Child Runs
...
```

### Handbook synthesis

```text
Run     = smallest execution observation
Trace   = one execution tree
Thread  = multi-turn conversational history of traces
```

它们分别适合回答不同问题：

| Scope | Best for |
|---|---|
| Run | 某个 Tool / LLM / Retrieval step 为什么慢、贵或失败 |
| Trace | 一次请求的完整执行路径 |
| Thread | 多轮体验、重复澄清、最终满意度、conversation outcome |

> **Do not use one observability scope to answer a question that lives at another scope.**

---

## 2. Tags、Metadata、Feedback 是三种不同语义

来源课程同时使用 Tags、Metadata 和 Feedback，它们不应混成一个“附加字段”。

### Tags

简单字符串标签，适合快速 Filter。

来源示例：

```text
"Elmer Fudd"
"scenario:10"
"csa"
"customer"
```

适合：

- identity class；
- scenario class；
- agent role；
- lightweight filter。

### Metadata

结构化 Key / Value，用于分析、切片和版本归因。

来源示例：

```text
run_id
session_id
scenario
customer_name
agent_name
```

适合：

- Group by；
- experiment/version slice；
- customer / tenant / task slice；
- join downstream analytics。

### Feedback

Feedback 是一个与 Run 关联的独立评价对象。

来源示例：

```text
key   = thumbs_up_down
score = 1 / 0
```

用于表达：

- user feedback；
- evaluator result；
- reviewer label；
- task outcome signal。

### Handbook synthesis

```text
Tag      = fast categorical label
Metadata = structured analytical dimension
Feedback = judgment / outcome signal
```

不要为了“都能 Filter”就把三者当成同一种东西。

> **Identity and version belong in metadata; judgment belongs in feedback; lightweight categorization belongs in tags.**

---

## 3. `langsmith_extra`：把观测上下文注入 Run

来源代码把 Tags 与 Metadata 组合进 `langsmith_extra`：

```python
base_meta = {
    "run_id": run_id,
    "session_id": conversation_id,
    "scenario": scenario["number"],
    "customer_name": customer_name,
}

base_tags = [customer_name, f"scenario:{scenario['number']}"]

csa_extra = {
    "langsmith_extra": {
        "metadata": {**base_meta, "agent_name": "csa"},
        "tags": [*base_tags, "csa"],
    }
}
```

然后在调用时传入：

```python
csa_result = await csa.chat(customer_message, **csa_extra)
```

这是 LangSmith-specific implementation。更通用的模式是：

```text
Runtime request
+ correlation identity
+ analytical metadata
+ categorical tags
        ↓
Tracing context
        ↓
Root / child runs inherit enough context
        ↓
Cross-run analysis becomes possible
```

需要避免的反模式是：等运行结束后才发现 Trace 没有 Version、Tenant、Scenario、Route 等关键分析维度，导致只能靠人工读文本重建上下文。

---

## 4. `get_current_run_tree()` 的三种工程模式

Capstone 给出了一个很实用的 LangSmith tracing primitive：`get_current_run_tree()`。它返回当前 Thread Context 中的 Active Run，可在 `@traceable` function 内或其调用链内使用。

来源里有三种不同模式。

### Pattern A · Capture Run ID for later correlation

```python
run = get_current_run_tree()
run_id = str(run.id) if run else None
```

用途：把当前 Run ID 返回出去，后续再绑定 Feedback、Annotation 或其他事件。

抽象：

```text
Execution
→ capture correlation ID
→ later event
→ attach back to exact run
```

### Pattern B · Enrich model identity for server-side cost resolution

```python
run = get_current_run_tree()
if run:
    run.extra = {
        **(run.extra or {}),
        "metadata": {
            **(run.extra or {}).get("metadata", {}),
            "ls_provider": "openai",
            "ls_model_name": self.model,
        },
    }
```

来源说明：LangSmith 需要 Provider / Model Identity 与 Token Counts 才能按 Pricing Table 计算 LLM 成本。

这和 Chapter 09 已有成本公式一致：

```text
Usage
+ Model Identity
+ Provider Identity
+ Pricing Rule
→ Computed LLM Cost
```

### Pattern C · Attach literal cost to non-LLM tool run

```python
run = get_current_run_tree()
if run:
    run.set(usage_metadata={"total_cost": 0.0007})
```

课程用 Database Query 的固定 `$0.0007` 作为模拟成本。这个价格是 **Capstone fixture**，不是数据库查询的通用价格。

抽象：

```text
LLM Run
→ usage × price table

Tool Run
→ metered / billed literal cost
```

> **A trace can only explain cost if every material child run contributes either measurable usage or attributable literal cost.**

---

## 5. Trace Cost 必须能下钻到 Child Run

Capstone 要求从 Trace 中找到带 `query_database` 的执行，并查看 Database Access 的 Cost。这体现了一个重要的可观测性要求：

```text
Task Cost
  ↓
Trace Cost
  ↓
Child Run Cost
  ├─ LLM
  ├─ Database
  ├─ Search
  ├─ Tool/API
  └─ Other service
```

如果 Dashboard 只有 Project-level 总成本，你能知道“贵了”，却不知道为什么贵。

反过来，只看单个 Run 也不够；生产优化需要把 Child Run 成本重新聚合到：

- Trace；
- Thread；
- Customer / Tenant；
- Route / Tool；
- Agent Version；
- Successful Task。

这就是为什么来源课程随后用 Monitor Dashboard：

```text
Group By
→ metadata.customer_name
```

来比较不同 Customer Slice 的总成本。

### Handbook synthesis

```text
Attribution first
→ aggregation second
→ optimization third
```

> **Do not optimize a cost aggregate you cannot attribute back to execution structure.**

---

## 6. Thread View：多轮问题必须用 Conversation Scope 分析

来源课程要求把 Trace View 切换到 Thread View，按 Customer Tag Filter Conversation。

这不是 UI 操作细节而已，它体现：

```text
Trace question
"What happened in this turn?"

Thread question
"What happened across this conversation?"
```

Thread-level scope 适合：

- satisfaction；
- repeated clarification；
- unresolved task；
- escalation；
- long conversation cost；
- state drift；
- cumulative tool use。

因此 Monitor Dashboard 最好同时支持：

```text
Run / Trace slice
Thread slice
Population slice
```

而不是只围绕 Request-level Metric 设计。

---

## 7. Group-by Metadata：Dashboard 的关键不是图，而是 Slice

Capstone 用 `metadata.customer_name` 做 Group By，以比较 Customer Cost。

通用模式：

```text
Metric
÷ Analytical Dimension
→ Comparable slices
```

例如：

```text
cost by customer / tenant
latency by route
quality by prompt_version
failure by tool
sentiment by language
security flag by agent_version
```

Dashboard 的真正价值来自切片能力，而不是图表数量。

> **An overall average hides the engineering decision; a well-chosen slice exposes it.**

---

## 8. Insights：先发现真实流量中的 Topic Distribution

Capstone 使用 Category-driven Insights 来回答：

```text
What are the main categories of user conversations?
```

来源说明 Insights 会自动 Cluster Conversation，并要求工程师选择最接近的 Category Set。由于生成结果可能每次变化，因此它不是固定 Taxonomy。

这再次说明：

```text
Clustering
≠ canonical taxonomy
≠ root cause
```

更可靠的用途是：

```text
Production conversations
→ Cluster / category discovery
→ candidate slices
→ inspect representative traces
→ stabilize taxonomy if useful
→ create dedicated eval / dataset / dashboard slice
```

### Handbook synthesis

> **Insights are a discovery mechanism for latent slices, not a substitute for a curated production taxonomy.**

---

## 9. Security Layer：Broad Detector + Specific Detector

Capstone 同时配置：

- PII leakage evaluator；
- Credit-card detection evaluator。

这是一个重要模式：

```text
Broad policy detector
PII leakage

+

Specific high-severity detector
Credit-card leakage
```

为什么两者都需要？

Broad Evaluator 可以覆盖多类个人信息，但 Specific Evaluator 可以针对特别高风险、可定义更窄的问题建立更明确的 Signal、Alert 与 Regression Set。

通用化：

```text
Broad safety / policy eval
        ↓
find problem family
        ↓
Specific evaluator
        ↓
higher precision routing / alert / regression
```

> **When a broad evaluator reveals a recurring severe subtype, promote that subtype into its own named signal.**

这和上一节 Security Monitoring 的 `prompt_injection` / `pii_leakage` 设计是一致的。

---

## 10. Thread-level Satisfaction 与 Explicit Feedback 是不同证据

Capstone 要求比较：

```text
thumbs_up_down feedback
vs
thread-level satisfaction evaluator
```

来源材料要求观察二者是否完全对齐，但没有在给定文本中提供 Quiz Answer。因此手册不记录具体答案。

工程上应保留两种信号的来源：

```text
Explicit feedback
→ user / scenario-derived label

Inferred satisfaction
→ evaluator-derived label
```

即使它们都使用 Binary Score，也不能因为数值同为 `0/1` 就视为同一种 Ground Truth。

推荐至少保存：

```text
signal_name
signal_value
signal_source
trace_id / thread_id
evaluator_version
prompt_version
timestamp
```

### Handbook synthesis

> **Agreement is evidence of alignment; disagreement is evidence to investigate, not a reason to silently overwrite one signal with the other.**

---

## 11. 为什么要在 Trace 上传前先配置 Online Evaluators

来源 Capstone 特意要求：先创建 Project 与 Online Evaluators，再上传 Trace。

原因很直接：新 Trace 到达时就自动获得评价，不需要之后 Backfill。

通用的 deployment pattern 是：

```text
Evaluator / Monitor config ready
        ↓
Traffic begins
        ↓
Trace arrives
        ↓
Evaluation attached immediately
```

对于生产 Release，可以进一步抽象为：

```text
Deploy monitoring config
→ verify evaluator / alert / routing
→ release traffic
```

这与“先部署 Agent，再想起来补监控”正好相反。

> **Monitoring configuration is part of release readiness, not post-release cleanup.**

---

## 12. Capstone 形成的完整 Production Monitoring Stack

把课程各步骤合并后，可以得到：

```text
                     PRODUCTION TRAFFIC
                            │
                            ▼
                    RUN / TRACE / THREAD
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
   TAGS / METADATA       USAGE / COST       FEEDBACK
          │                 │                  │
          └─────────────────┼──────────────────┘
                            ▼
                     MONITOR / SLICING
              filter · group-by · trend
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ▼               ▼                ▼
         INSIGHTS       ONLINE EVALS       SECURITY
     latent topics      satisfaction       PII / specific
            │               │                │
            └───────────────┼────────────────┘
                            ▼
                 INVESTIGATE REPRESENTATIVE
                         TRACE / THREAD
                            │
                            ▼
                   ROOT CAUSE / CURATION
                            │
                            ▼
                 DATASET / REGRESSION / FIX
                            │
                            ▼
                         RELEASE
                            │
                            └──────────────↺
```

这张图的核心不是 LangSmith，而是 Production Monitoring 的信息架构：

```text
Execution identity
+ Analytical dimensions
+ Cost attribution
+ Quality/security signals
+ Population discovery
+ Human investigation
→ Learning loop
```

---

## 13. Source-specific vs Handbook Generalization

### LangSmith-specific implementation from the source

- `@traceable` creates Runs；
- `langsmith_extra` carries Tags / Metadata；
- `get_current_run_tree()` accesses the active Run；
- `ls_provider` / `ls_model_name` support model cost resolution；
- `usage_metadata.total_cost` can attach literal cost to Tool Runs；
- Thread View groups traces by `thread_id`；
- Dashboard can Group By Metadata；
- Feedback is attached with `create_feedback()`；
- Insights clusters conversations；
- Online Evaluators score traces / threads。

### Handbook generalization

```text
Execution hierarchy
Run → Trace → Thread

Context dimensions
Tags + Metadata

Judgment signals
Feedback + Evaluator outputs

Economics
Usage / literal cost → attribution → aggregation

Population understanding
Group-by slices + clustering

Quality / Security
broad signals + specific signals

Learning
investigation → curated regression asset → fix → release
```

---

## 14. Canonical rules

> **Run, Trace, and Thread are different observability scopes; choose the scope that matches the question.**

> **Tags classify, metadata slices, feedback judges.**

> **Cost must be attributable to child execution before it can be meaningfully optimized at task level.**

> **Insights discover candidate slices; they do not establish root cause or canonical taxonomy by themselves.**

> **Explicit feedback and inferred evaluation are separate evidence channels, even when they share the same score scale.**

> **Monitoring configuration is part of release readiness.**

> **A production monitoring system is complete only when traces, costs, quality, security, and conversation outcomes can route back into investigation, regression assets, and the next release.**
