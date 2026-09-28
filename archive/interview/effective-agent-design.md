# Effective Agent Design · 面试答题卡

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08 §8.14.

## 题目

**如何设计一个优秀的 Agent？为什么有些 Agent 使用同样的模型，实际效果却差很多？**

## 30 秒版本

我不会先从“换更强模型、加更多工具、上更复杂框架”开始。优秀 Agent 的关键是 Harness。Anthropic 在 Building Effective Agents 里给了三个很实用的原则：Simplicity、Transparency 和 ACI。

Simplicity 是先用最少控制结构解决问题，只有当真实 failure mode 出现时才加 Graph、Multi-Agent 或更多工具；Transparency 是把 Plan、Tool Call、Environment Result、State Transition 和 Completion Evidence 显式化，而不是依赖模型自己说“完成了”；ACI 是把 Tool name、schema、参数、错误信息和返回格式当成给模型使用的 HCI，通过 poka-yoke 从接口上减少模型反复犯错。

所以我会把 Agent 设计成一个可观察、可验证、可迭代的 execution loop，而不是一个“模型 + 一堆工具”的黑盒。

## 60–90 秒版本

我觉得优秀 Agent 的上限当然受模型影响，但真正决定生产效果的是 Harness 能不能把模型能力稳定转成任务完成。

第一是 Simplicity。一次模型调用、RAG 或简单 Tool Loop 能解决的问题，我不会为了架构感直接上 Graph 或 Multi-Agent。复杂度只有在解决明确问题时才值得增加，例如需要 branch/retry、durable checkpoint、并行隔离或不同 permission boundary。

第二是 Transparency。Agent 每一步应该从真实环境拿 ground truth，比如 Tool Result、Test、Diff、Browser Observation、Retrieval Evidence，再决定下一步。用户和工程师至少应该看到当前 Plan、正在执行什么、重要结果、Retry/Fallback 和完成证据。这里的透明不是要求暴露 hidden Chain-of-Thought，而是让 observable execution 可以审计和纠偏。

第三是 ACI，也就是 Agent-Computer Interface。Tool 本质上是模型的 GUI。Tool name、description、schema、default、error message 都会直接影响模型成功率。Anthropic 在 SWE-bench Agent 上就发现 relative filepath 容易出错，于是把工具改成要求 absolute filepath，这就是 poka-yoke：不要只在 Prompt 里提醒“别犯错”，而是改接口让错误更难发生。

我还会用真实 task set 跑 Agent，统计 wrong tool、invalid args、重复调用和 recovery failure，再根据 trace 去改 Tool boundary / schema / error message，并做 regression eval。

最终我的原则是：**Model capability determines what may be possible; the harness determines how reliably that capability becomes repeatable work.**

## 如果面试官追问：工具是不是越少越好？

不是绝对的。

更准确的目标是：

~~~text
minimize semantic overlap
not mechanically minimize tool count
~~~

如果 search / grep / find / lookup 几个 Tool 的能力几乎一样，模型会多承担一次 tool-selection problem。

但专用 Tool 如果带来：

~~~text
stronger permission boundary
better structured output
safer execution
clearer failure semantics
better remote portability
higher success rate
~~~

就可能值得保留。

所以评估的是 Tool decision boundary，不只是数量。

## 如果追问：Pi 有什么值得学？

当前 Pi 可以作为 minimal harness 的实现案例：

~~~text
default coding tools
→ read / bash / edit / write

system prompt
→ follows enabled tool inventory

edit
→ exact unique oldText
→ multi-edit matched against same original file
→ returns diff / patch

session
→ JSONL
→ id / parentId tree
→ branching
→ compaction changes active context
→ raw history remains available
~~~

但要注意：

~~~text
Pi current edit path
→ relative OR absolute
~~~

所以“强制 absolute path”是 Anthropic SWE-bench 的 ACI 案例，不是 Pi 当前 edit 的事实。

## 如果追问：Transparency 是不是让用户看到模型思维链？

不是。

面试里应该明确：

~~~text
Transparency
= plan
+ action
+ tool result
+ state transition
+ evidence
+ retry / fallback
+ concise reasoning summary when useful

≠ hidden Chain-of-Thought dependency
~~~

生产系统不应该因为看不到 hidden CoT 就无法 debug。

## 如果追问：Harness 里功能是不是越多越好？

也不是。

每个 mechanism 应该对应 failure mode：

~~~text
Memory
→ information must survive current context

Checkpoint
→ long task must resume

Worktree / workspace isolation
→ concurrent writers need isolation

Subagent
→ real context / tool / permission boundary

Sandbox
→ untrusted execution needs capability containment

Hook
→ deterministic lifecycle automation

Skill
→ validated reusable procedure
~~~

如果说不清某个 feature 在解决什么 failure mode，就不应该仅为了“Agent 看起来完整”加入它。

## Tool / ACI Eval Checklist

至少观察：

~~~text
tool_selection_accuracy
argument_validity
first_attempt_success
tool_error_rate
recovery_success
duplicate_tool_calls
wrong_tool_with_correct_intent
latency / cost
end-to-end task success
~~~

失败之后先定位：

~~~text
model limitation?
tool description?
schema?
overlapping tools?
bad default?
error message?
permission boundary?
environment?
~~~

而不是统一归因成“Prompt 不够好”。


## 如果追问：模型越来越强，Harness 还需要吗？

需要，但职责会迁移。

更准确的回答是：

~~~text
Weak-model era
→ Harness compensates for weak cognition

Strong-model era
→ Harness increasingly governs powerful action
~~~

会减少的是：

~~~text
malformed tool-call repair
rigid format retry
simple planning scaffolds
basic argument normalization
some self-correction
~~~

因为这些能力可能被：

~~~text
model
provider API
agent SDK
workflow runtime
~~~

吸收。

但模型越强，我们通常越敢让 Agent：

~~~text
run longer
touch production resources
call more APIs
modify files / databases
coordinate with other agents
operate with less supervision
~~~

于是这些 Harness 保证反而更重要：

~~~text
permission / policy
sandbox / workspace isolation
durable state / checkpoint
budget / rate / timeout
human approval
side-effect control
trace / audit
failure recovery
multi-tenant boundary
~~~

所以我不会问“这段 Harness 代码还要不要自己写”，而会问：

> 这个系统 guarantee 现在由哪一层负责？

可能是 model、SDK、workflow engine、sandbox platform，也可能是我们自己的 runtime。

最终一句：

> **Model improvement removes some scaffolding; it does not remove the need for runtime guarantees.**

## 如果追问：Harness 是不是 LangGraph 这类框架？

不是。

~~~text
Framework
→ one implementation vehicle

Harness
→ runtime controls around model execution
~~~

Harness 可以由：

~~~text
LangGraph
OpenAI Agents SDK
Temporal
custom runtime
sandbox platform
or a combination
~~~

共同承担。

即使直接调用模型 API、完全不用 Agent Framework，只要系统自己实现：

~~~text
tool dispatch
state
permission
sandbox
budget
retry
trace
approval
recovery
~~~

这些依然是 Harness。

## 如果追问：模型足够聪明以后，权限和治理能不能交给模型自己？

不能把 capability 和 authority 混在一起。

~~~text
Capability
→ can the model decide what to do?

Authority
→ is the system allowed to execute it?
~~~

模型规划能力再强，也不应该因为“判断更准”就自动获得：

~~~text
production credentials
tenant-wide access
unbounded token budget
irreversible deployment permission
right to ignore policy
~~~

所以模型越能自主行动，越需要把权限和 blast radius 写成明确 runtime boundary。

## 如果追问：轨迹记录是不是把模型每一步思考都存下来？

不是。

生产 Trace 应记录 observable execution：

~~~text
model / prompt version
tool call
tool args where allowed
tool result
handoff
guardrail result
state transition
checkpoint
retry / error
approval
latency
token / cost
artifact / evidence
~~~

不要把 hidden Chain-of-Thought 当成 Harness 的必要日志。

调试、审计和 Eval 应尽量建立在：

~~~text
observable actions
environment results
state transitions
artifacts
evidence
~~~

而不是 private reasoning internals。

## 如果追问：Agent = LLM + Harness 吗？

可以当面试记忆公式，但不要说成严格定义。

更准确：

~~~text
Agent capability
≈ model intelligence
+ runtime / harness guarantees
+ environment / tool access
~~~

不同产品对 Agent 边界定义不一样。

面试时可以总结成：

> **Model capability and Harness guarantees are complementary system dimensions, not substitutes.**

## Canonical references

- Chapter 08 §8.14 · Effective Agent Harness
- Chapter 06 · Capability / Tool authorization
- Chapter 09 · Trace / Eval / Regression

External verification date: 2026-09-28.

Sources:

- https://www.anthropic.com/engineering/building-effective-agents
- https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents
- https://github.com/earendil-works/pi
- https://github.com/humanlayer/12-factor-agents
- https://openai.com/index/harness-engineering/
- https://openai.github.io/openai-agents-python/
- https://openai.github.io/openai-agents-python/tracing/
- https://openai.github.io/openai-agents-js/
