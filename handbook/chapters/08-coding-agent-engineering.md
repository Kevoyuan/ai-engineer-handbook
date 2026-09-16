# Chapter 08 Supplement · Coding Agent Engineering

> Semantic supplement for §8.7 · source-grounded expansion of Andrew Ng's *AI Engineering Skills Map: Using coding agents*.
>
> Source date: 2026-09-04

Coding Agent 并没有让软件工程流程消失。它改变的是**执行者**与**工程师注意力的分配**：模型和 Agent 可以承担越来越多代码与非代码执行工作，而工程师更需要负责定义目标、选择架构、写清 Spec、校准自主权、验证结果、控制权限，并把生产证据反馈到下一轮 Build/Test。

原文把 Coding Agent 工作组织为一个持续迭代的高层工作流：

```text
Planning
→ Execution
→ Deployment & Monitoring
↺ verification / monitoring evidence can send work upstream
```

不同项目在各阶段投入并不相同。Greenfield 原型可以从轻量 Spec 起步；复杂 Brownfield / production system 需要更严格的规划、上下文、验证与风险控制。这个工作流不是一次性流水线：Verification 失败时可能需要回到 Spec、架构或任务拆分；Monitoring 暴露的问题也可能要求重新 Build/Test，而不是只在生产环境里局部打补丁。

## 1. 五项核心能力

Andrew Ng 将 Coding Agent 的关键能力分为五类：

| Skill | 核心工程问题 |
|---|---|
| Directing the workflow | 每个阶段投入多少人工与 Agent effort；何时研究、规划、执行、回退；如何在 speed / cost / technical risk / human effort 之间权衡；如何选架构、写 planning artifacts / spec，并把工作拆成可验证步骤 |
| Enabling agent autonomy | 哪些任务保持高频交互，哪些可以委托成较大工作块或 loop；如何管理阶段性的 Context、并行 Agent、permissions、gates 与 blast radius |
| Reviewing the work | 什么证据能证明完成：自动测试、行为/功能验证、截图或 artifacts、eval set、LLM-as-judge、agentic code review、安全审计与必要的人审 |
| Customizing the agent and its environment | 如何用 Skills、Plugins、MCP、Hooks、项目级 instruction files / standing context、跨 Session state 与复盘机制，让 Agent 长期在正确环境里工作，同时清理过时配置与 agent-generated debt |
| Coding agent foundations | 理解 code search / retrieval、context window、tool call、subagent、agent harness 与典型 failure modes，才能在 Agent 偏离时知道为什么、在哪里介入 |

这五项不是五个孤立技巧。它们共同构成一个可控的 Engineering Loop：

```text
                    HUMAN / PRODUCT JUDGMENT
          goal · architecture · spec · risk · ownership
                              │
                              ▼
                    DIRECT THE WORKFLOW
                              │
                              ▼
                  ENABLE BOUNDED AUTONOMY
               context · permissions · parallelism
                              │
                              ▼
                    AGENT / HARNESS EXECUTE
                 code · tools · data · operations
                              │
                              ▼
                       REVIEW / VERIFY
          tests · behavior · artifacts · eval · human review
                              │
                              ▼
                    DEPLOY / MONITOR / OPERATE
                              │
                              └──────────────↺

SUPPORTING PLANE
Custom agent/environment · coding-agent foundations
Skills · MCP · Hooks · standing context · retrieval · tools · subagents
```

## 2. Autonomy 是阶段级控制变量

不要把“Agent 连续自主运行多久”当成成熟度指标。更合理的判断是：

```text
autonomy level
= f(verifiability, reversibility, blast radius, permission risk, context quality)
```

适合更高自主权的任务通常具备：目标清晰、可自动验证、失败可回滚、权限范围小、Context 稳定。

需要更强 Human Gate 的任务通常包括：高风险架构决策、权限变更、生产副作用、不可逆动作、敏感数据访问、最终发布或重要业务决策。

> **Long-running autonomy is not a quality metric.**

## 3. Verification 是执行的一部分

Agent 的“完成”声明不是完成证据。Coding Agent 的输出具有不确定性，所以验证不能是事后附加项，而是执行合同的一部分：

```text
Agent proposes completion
→ verifier checks acceptance criteria
→ pass: continue / ship
→ fail: diagnose failure type
→ route repair to the earliest wrong assumption
```

Verification failure 可能来自：

- Spec 不清或 Acceptance Criteria 缺失；
- 架构假设错误；
- Agent 读取了过期/错误 Context；
- 任务拆分不可验证；
- Tool / Environment 不匹配；
- Verifier 本身只测实现细节，没有测真实用户目标。

因此最重要的不是“再生成一次”，而是判断应该回到哪个阶段。

## 4. Context 与 Environment 是工程基础设施

Coding Agent 的能力不只来自 Model。它实际表现取决于：

```text
Model
+ Harness
+ Code / Context Retrieval
+ Standing Instructions
+ Skills / MCP / Tools
+ Permissions
+ State / Checkpoints
+ Verification
```

项目约束、架构决策、编码规范、数据访问规则与当前 Spec 应有稳定、可维护的载体。需求或架构变化时，必须更新 Agent 实际读取的 Context，而不是只更新人的 mental model。

## 5. 与 Chapter 09 的边界

Chapter 08 关注的是 **Coding Agent execution engineering**：如何规划、委托、执行、校准自主权、组织工具和恢复。

Chapter 09 提供其外层 **Reliability Control Plane**：

```text
CH08 · Build / Execute
        │
        ▼
CH09 · Validate / Eval / Observe / Release
        │
        ▼
Production Evidence
        │
        └────────→ Dataset / Root Cause / Build / Test
```

这意味着 Reviewing the work 不应停在本地代码审查。它应继续进入 release gate、production monitoring、incident feedback 与 regression protection。

## 6. Handbook canonical rules

> **A coding agent is an execution component inside a human-directed, testable, permissioned engineering loop.**

> **Coding agents lower the cost of implementation; they raise the value of specification, verification, and engineering judgment.**

> **Autonomy is a design variable, not the goal.**

## Source boundary

### Source-derived

- Coding-agent work is organized around Planning → Execution → Deployment & Monitoring and is highly iterative.
- Effective use depends on five skills: Directing the workflow, Enabling agent autonomy, Reviewing the work, Customizing the agent and its environment, and Coding agent foundations.
- Skilled engineers decide how much human vs agent effort to allocate, how much autonomy to grant, how to verify uncertain output, how to maintain the agent environment/context, and how to understand the underlying harness/tool/context mechanisms.
- Long autonomous runs are not, by themselves, evidence of better engineering.

### Handbook synthesis

The control-loop diagram, stage-level autonomy rule, Chapter 08 ↔ Chapter 09 boundary, and the canonical formulation “human-directed, testable, permissioned engineering loop” are handbook engineering abstractions built from the source plus the handbook's existing reliability model; they are not presented as direct quotations from Andrew Ng.

## Sources

- Andrew Ng, *AI Engineering Skills Map: Using coding agents*, X, 2026-09-04: https://x.com/AndrewYNg/status/2095890279865721217
- Andrew Ng official Writing index, *The AI Engineering Skills Map Part 4 — Coding Agents: How to Use Coding Agents Effectively from Planning to Execution and Monitoring*: https://www.andrewng.org/writing
