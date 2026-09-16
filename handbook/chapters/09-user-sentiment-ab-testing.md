# Chapter 09 Supplement · User Sentiment & A/B Testing
## 从体验信号到版本化生产实验

> Source-derived semantic supplement for Chapter 09. Based on LangChain Academy Production Monitoring Module 3 lessons: **Tracking User Sentiment** and **A/B Testing Prompt Versions**.

Latency、Error Rate 和基础设施告警只能回答“系统有没有明显故障”，不能证明用户是否真正满意。一个 Agent 可以很快、没有异常、技术上也没有报错，但仍可能误解问题、回答得不实用，或者连续几轮绕圈。

因此 Production Monitoring 还需要一层 **experience signal**：

```text
Operational health
latency · errors · availability

+ Experience quality
explicit feedback · inferred sentiment · thread outcome

→ Root cause / review
→ Fix
→ A/B experiment
→ Release decision
→ Monitor
```

> **Monitoring finds the problem; versioned experiments test the fix.**

---

## 1. User Sentiment 需要两条信号

来源课程给出两种互补方式：

1. **Explicit feedback**：用户主动点击 thumbs up / down；
2. **Inferred sentiment**：对完整 Conversation Thread 做在线评估，推断用户总体是否满意。

这两者解决的是不同覆盖问题：显式反馈来自用户本人，信号直接但稀疏；推断情绪可以覆盖更多会话，但属于 evaluator 判断，不是真值。

```text
Explicit feedback
User reaction
→ trace-linked feedback

Inferred sentiment
Conversation thread
→ LLM-as-Judge
→ sentiment label
```

> **Explicit feedback is sparse but direct; inferred feedback is broad but uncertain.**

### 1.1 Explicit feedback：把用户反应绑定到 Trace

课程的 LangSmith 示例使用 `create_feedback`，把反馈写到具体 Trace：

```python
from langsmith import Client

client = Client()

def handle_feedback(trace_id: str, reaction: str | None):
    if not reaction:
        return

    client.create_feedback(
        key="user_sentiment",
        score=1 if reaction == "liked" else 0,
        trace_id=trace_id,
    )
```

来源中的几个实现要点：

- `trace_id` 把用户反馈链接到具体 Conversation Trace；
- 示例使用 Binary Score：`1 = positive`，`0 = negative`；
- 课程建议优先 Binary，而不是 1–5 Scale，因为用户决策成本更低；
- Root Trace 对多数应用已经足够；需要阶段归因时，也可以把反馈绑定到 Child Run，例如 Retrieval / Generation / Tool Use；
- Python 示例强调传 `trace_id=` 时反馈写入可后台化；TypeScript SDK 调用本身是 async。

这些 API 细节属于 **LangSmith-specific implementation**。跨平台抽象是：

```text
User Feedback Event
+ Trace / Thread Identity
+ Signal Name
+ Categorical / Binary Value
+ Timestamp / Version Metadata
→ Feedback Store
```

工程上不应只保存一个裸 `0/1`。至少要保留它来自 **explicit user feedback** 还是 **inferred evaluator**，否则后续分析会把不同证据来源混成一个分数。

---

## 2. Inferred Sentiment：扩大覆盖，但不替代 Human Truth

显式 Feedback 很有价值，但大多数用户不会点击按钮。来源课程因此使用 **Online Evaluator** 自动对生产 Conversation 评分。

LLM-as-Judge 的三条设计规则在这里非常关键：

1. **Narrow scope**：一个 Judge 只回答一个明确问题，例如“用户是否满意？”；
2. **Binary / categorical output**：返回 `true/false` 或类别，而不是模糊的 1–5 分；
3. **Align with humans**：定期把 Judge Verdict 与 Human Labels 对比，确认它仍在测量你真正关心的东西。

> **Online evaluation scales judgment; it does not eliminate evaluator uncertainty.**

来源课程的 Sentiment Prompt 把以下信号视为 Positive：感谢、问题已解决、没有持续困惑；Negative 包括显式不满、问题仍未修复、隐含消极表达。课程还规定 Neutral 归到 Positive，并提高最终 Human Message 的权重。

这些分类边界是该课程 Evaluator 的具体定义，不是所有产品的统一 Sentiment Taxonomy。不同应用必须根据自己的 Support / Product / Risk 语境重新定义标签。

---

## 3. 为什么 Sentiment 应该做 Thread-based Eval

单个 Trace 适合判断单次输出；用户满意度经常需要跨多轮观察。

| Dimension | Single-turn evaluator | Thread-based evaluator |
|---|---|---|
| Input | Single trace | Full conversation thread |
| Trigger | New trace arrives | Thread goes idle |
| Good for | Safety、format、single-run checks | Topic、user satisfaction、multi-turn experience |

例如：

```text
Turn 1: technically correct but unclear
Turn 2: user asks the same question again
Turn 3: assistant finally resolves it
Turn 4: user says “got it”
```

只看 Turn 1 或 Turn 2 会丢失完整体验；Thread-based Evaluator 等会话进入 idle，再读取整个 Human/AI dialogue，才能判断总体交互结果。

来源课程在 LangSmith 中的配置示例包括：

- Evaluate a multi-turn thread；
- project-level idle time；
- Sampling Rate 30–50% 作为起始建议；
- Gemini 2.5 Flash 或 GPT-4.1 nano 作为示例 Judge；
- Message Format 选择 Human and AI pairs；
- `user_sentiment` Boolean feedback。

以上是 **课程 / 产品配置建议**，不是跨平台统一参数。30–50% Sampling 与具体模型选择应按流量、成本、Conversation 长度、隐私与 Human Review Budget 重新校准。

来源还指出：LangSmith Online Evaluator 命中的 Trace 会自动升级到 extended data retention，因此会影响 Trace Pricing。这同样属于 LangSmith-specific operational behavior，不能泛化为所有 Observability 平台的规则。

---

## 4. 从 Sentiment Signal 到工程动作

Sentiment 只有进入 Routing 才有工程价值。

来源给出的典型闭环：

```text
Negative sentiment
→ Annotation Queue
→ Human Review / Root Cause

Recurring negative pattern
→ Insights / Trend Report
→ Engineering investigation
```

显式和推断信号最好使用相同的 Binary / Categorical 语义，方便 Dashboard 与 Automation，但**不要丢掉 signal provenance**。

推荐记录：

```text
signal_name      = user_sentiment
signal_value     = positive | negative
signal_source    = explicit_user | online_evaluator
trace_id / thread_id
prompt_version
agent_version
evaluator_version
model_version
timestamp
```

这样才能回答：

- 用户主动点踩的问题和 Judge 推断负面的问题是否一致？
- 某个 Prompt Version 是否只改善了 Judge Score，却没有改善 Explicit Feedback？
- 某次 Evaluator 升级是否导致 Sentiment Trend 发生“测量漂移”？

> **A sentiment score without provenance is hard to interpret and easy to misuse.**

---

## 5. A/B Testing Prompt Versions：用真实流量验证修复

发现问题后，不能只“上线新 Prompt，希望它更好”。来源课程把 A/B Testing 的核心压缩成一件事：**给每个 Run 打上版本 Metadata，然后按版本比较真实生产指标**。

示例：

```python
import random
import langsmith as ls

version = random.choice(["control", "variant"])

with ls.trace(
    name="support-agent",
    metadata={"prompt_version": version},
) as rt:
    response = run_agent(version, user_question)
    rt.end(outputs={"response": response})
```

每条 Trace 因此携带：

```text
metadata.prompt_version = control | variant
```

已有 Online Evaluator 会自动给两个版本打分，不需要为每个 Prompt Version 单独再建一套 Evaluator。

在 LangSmith Monitor 中，来源课程使用：

```text
Group by
→ metadata.prompt_version
```

从而并排比较：

- feedback score；
- error rate；
- latency；
- 其他 dashboard metric。

跨平台抽象是：

```text
Real Traffic
→ Experiment Assignment
→ Version Metadata
→ Same Observability / Evaluators
→ Slice by Version
→ Compare Outcomes
→ Release Decision
```

> **Version metadata turns production traffic into comparable experiment evidence.**

---

## 6. Handbook Generalization：Version 是一等 Observability Dimension

来源课程用 `prompt_version` 做示例。手册把这个模式推广到：

```text
prompt_version
agent_version
workflow_version
tool_registry_version
retrieval_index_version
policy_version
experiment_id
```

这是 Handbook 的工程化抽象，不是来源课程逐项列出的标准字段。

核心原则：任何会改变系统行为的版本，都应该能进入 Trace Metadata，并在 Dashboard / Eval / Cost / Error / Latency / Feedback 中被切片比较。

```text
Versioned Change
→ Trace Metadata
→ Eval / Feedback / Ops Metrics
→ Slice Comparison
→ Release / Rollback Decision
```

这样 Monitoring 才不只是“发现现在变差了”，而能回答：

```text
what changed?
which version caused it?
did the fix actually improve the target outcome?
what trade-off moved elsewhere?
```

---

## 7. Sentiment + A/B Testing 补全 Production Learning Loop

这两课和 Chapter 09 现有 Monitoring 外环连接起来：

```text
Real Traffic
→ Explicit Feedback + Thread Eval
→ Negative / Low-quality Signal
→ Annotation / Insights / Root Cause
→ Prompt / Tool / Workflow Fix
→ Control vs Variant
→ Version Metadata
→ Online Eval + Error + Latency + Feedback
→ Release / Hold / Rollback
→ Monitor
```

这说明 Production Monitoring 有三个不同问题：

```text
1. Detection
   What is going wrong?

2. Diagnosis
   Why is it going wrong?

3. Experimentation
   Did the proposed fix actually improve it?
```

只有前两步没有 A/B / Version Comparison，工程团队仍然可能把一个“看起来合理”的修复直接上线；只有 A/B 没有 Sentiment / Root Cause，又可能优化错误指标。

> **Experience signal → Root cause → Fix → Versioned experiment → Release decision → Monitor.**

---

## Source Notes

Source-derived from the user-provided LangChain Academy Production Monitoring lessons:

- Tracking User Sentiment
  - https://langchain-ai.github.io/lca-lessons/production-monitoring/module-3/user-sentiment
- A/B Testing Prompt Versions
  - https://langchain-ai.github.io/lca-lessons/production-monitoring/module-3/ab-testing

LangSmith-specific details preserved as implementation examples include `create_feedback`, `trace_id`, thread-based evaluator configuration, extended data retention behavior, `metadata.prompt_version`, and Monitor Group by behavior.

Handbook-specific generalizations are explicitly labeled above and should not be attributed to the course as direct claims.
