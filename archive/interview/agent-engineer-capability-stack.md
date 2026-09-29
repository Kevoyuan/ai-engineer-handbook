# Agent Engineer Capability Stack · 面试答题卡

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08 §8.11.15.

## 题目

**一个成熟的 Agent Engineer 需要哪些核心能力？**

## 30 秒版本

我会分四层回答，而不是报框架名。

~~~text
1. Business Decomposition
2. Runtime & Capability Architecture
3. Reliability & Evaluation
4. Engineering Delivery & Iteration
~~~

第一层把“客服成本高、响应慢”这类业务问题拆成 Task Contract、automation boundary、human gate 和 success metric；第二层决定 Workflow、Agent、Tool、State、Context、Memory、Permission 和 failure path；第三层用 task success、tool failure、latency、cost per successful task、human escalation、Trace 和 Regression Eval 证明系统可用；第四层用版本管理、CI/CD、环境隔离、发布、回滚、监控和 incident learning 保证长期运行。

所以我理解的 Agent 开发岗不是“会几个 Agent 框架”，而是能把一个模糊业务目标交付成 bounded、testable、observable、operable system。

## 60–90 秒版本

我觉得可以把 Agent Engineer 的能力分成 build 和 operate 两半，但更准确是四层。

第一，Business Decomposition。拿到的通常不是“做一个 Agent”，而是业务 KPI 问题。我会先梳理 current workflow，判断哪些步骤 deterministic、哪些需要模型判断、哪些必须 human approval，再定义 Goal / Input / Output / Boundary / Acceptance Criteria。这里不会把所有问题强行套成 ReAct，固定流程就用 Workflow，开放式局部判断才需要 Agent loop。

第二，Runtime & Capability Architecture。包括 Tool schema、permission、timeout、error model、idempotency，Workflow 的 branch/retry/fallback，State/Checkpoint、Context/Memory、Routing 和必要的 Multi-Agent。Function Calling 的价值不是保证模型永远不犯错，而是让合法动作更容易表达、非法动作可拒绝、失败可定位。

第三，Reliability & Evaluation。至少看 task success、tool selection/argument/execution failure、P95 latency、cost per successful task、retry/loop、human escalation 和 safety violation。通过 Test、Eval、Trace、Alert、Fallback、Rate Limit、Rollback、Human Escalation 建立证据闭环。

第四，Engineering Delivery。Prompt、Model、Tool、Workflow 都要版本化；模型升级不能假设旧 Prompt 继续有效，要用固定 regression suite 比较 task success / safety / latency / cost，再决定是否发布。上线后把 production failure 变成 regression case，持续迭代。

## 追问：业务拆解是不是就是 ReAct？

不是。

~~~text
Business problem
→ choose control model
~~~

不是：

~~~text
Business problem
→ force into ReAct
~~~

例如：

~~~text
approval flow
→ deterministic workflow

data transformation
→ deterministic service

uncertain diagnosis
→ Agent / model decision

exploratory research
→ bounded ReAct-style loop
~~~

所以业务拆解决定架构，而不是框架反过来定义业务。

## 追问：Function Schema 能解决工具幻觉吗？

只能解决一部分。

Schema 可以减少：

~~~text
missing field
wrong type
invalid enum
malformed argument
~~~

但不保证：

~~~text
right tool chosen
semantic correctness
authorization
business invariant
side-effect safety
~~~

所以还要 Tool Contract + Permission + Validation + Error Policy。

## 追问：稳定性指标看什么？

按层看：

~~~text
Task
→ task success
→ business outcome
→ human escalation

Agent / Trajectory
→ completion
→ retry / loop
→ redundant actions
→ recovery

Tool
→ selection accuracy
→ argument validity
→ execution failure
→ timeout

System
→ P50/P95/P99
→ availability
→ tokens
→ total cost
→ cost per successful task

Safety
→ unauthorized action rejection
→ approval / rollback / incident
~~~

## 追问：模型升级后怎么保证旧 Prompt 还能用？

不能“保证”，只能验证。

~~~text
new model / prompt / tool / workflow
→ fixed regression suite
→ compare task success
→ safety
→ latency
→ cost
→ release gate
~~~

面试里说“模型升级后旧 Prompt 依然可用”太绝对。

更好的说法：

> **Compatibility should be tested, not assumed.**

## 追问：为什么会框架还不够？

框架解决 implementation convenience，不自动解决：

~~~text
business boundary
acceptance criteria
permission
failure semantics
eval
release
rollback
incident response
production learning
~~~

Anthropic 当前也明确建议只有在结果确实改善时才增加 Agentic complexity，而不是用复杂框架本身证明成熟度。

## 面试金句

> **Agent engineering competence is the ability to turn an ambiguous business objective into a bounded, testable, observable, operable system.**

> **Architecture quality is visible in explicit boundaries and failure semantics, not framework count.**

> **Compatibility should be tested, not assumed.**

## 关于“35K / 80%”说法

来源视频用“35K offer”和“80% 开发者忽略评估”等作为传播 framing，但没有提供可验证市场数据。

因此面试可以借用四项能力结构，不要把具体薪资或比例当作事实引用。

## Canonical references

- Chapter 08 §8.11 · Agent Project Engineering Lifecycle
- Chapter 06 · Skills / MCP / Tools / Routing
- Chapter 07 · Context / Memory
- Chapter 09 · Eval / Observability / Cost
- Chapter 10 · Deployment / Security / Platform

External verification date: 2026-09-29.

Sources:

- https://openai.com/index/harness-engineering/
- https://www.anthropic.com/engineering/building-effective-agents
