# Multi-Agent Consistency · 面试答题卡

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08 §8.16.

## 题目

**生产级 Multi-Agent 怎么保证一致性？**

## 30 秒版本

我不会把一致性简单理解成“Agent 互相同步消息”或者“一主多从 + 分布式锁”。

我会拆四层：

~~~text
State Consistency
→ one authoritative commit path

Execution Consistency
→ dedupe + idempotency + reconciliation

Artifact Consistency
→ validate before commit

Decision Consistency
→ evidence + authority + policy
~~~

中心 Orchestrator 是常见实现，但不是唯一架构。Agent 之间可以直接通信，但消息不能绕过 authoritative state、权限和 side-effect commit path。

另外 Lock 只解决 mutual exclusion，不等于幂等；Validator 也不能保证开放式任务一定有唯一正确答案，它应该识别 conflict / insufficient evidence，并在需要时 escalation。

## 60–90 秒版本

多 Agent 的一致性我会先拆成四个问题。

第一是 State Consistency。必须有 authoritative workflow state，Agent-local memory 或 cache 只是 working view。共享状态更新必须经过明确 commit path，可以是 single-writer orchestrator、database transaction、revision/CAS 或 workflow engine，而不是每个 Agent 都维护自己的 source of truth。

第二是 Execution Consistency。并发和 retry 会让同一个 task 重复 dispatch，因此需要 task id、lease、dedupe、idempotency 和 reconciliation。分布式锁可以用于 mutual exclusion，但 worker 在外部 API 成功后崩溃，即使锁失效，blind retry 仍可能产生重复副作用，所以 lock 不能替代幂等。

第三是 Artifact Consistency。多个 Agent 的输出先是 candidate artifact，要经过 schema、provenance、integrity、conflict detection 和必要的 acceptance validation，之后才能 commit。不能直接 concat。

第四是 Decision Consistency。如果两个 Agent 结论冲突，不是简单多数投票，也不是再叫一个 Judge 选边，而是看 independent evidence、deterministic verifier、authority matrix、policy，必要时 Human escalation。

所以一致性不是让所有 Agent 观点一样，而是：

> 相同 committed state、evidence 和 policy 下，系统有明确、可重复、可审计的 resolution path。

## 为什么“一主多从”不是唯一正确答案？

Orchestrator-worker 很常见，优点是：

~~~text
clear ownership
central progress
controlled fan-out / fan-in
easy budget / policy enforcement
~~~

但它不是唯一架构。

A2A 这类协议说明 peer / cross-framework Agent communication 也可以是生产形态。

关键不是：

~~~text
can agents talk directly?
~~~

而是：

~~~text
can a direct message mutate authoritative state?
can it trigger side effects?
who commits the transition?
who audits the decision?
~~~

所以可以：

~~~text
Agent-to-Agent message
→ coordination / negotiation

authoritative transition
→ control plane
~~~

## 所有 Agent 是否必须看到“最新数据”？

不一定。

例如：

~~~text
parallel research
→ all workers reading snapshot v42
~~~

可能比：

~~~text
Worker A → v42
Worker B → v43
Worker C → v44
~~~

更容易比较和复现。

所以正确问题是：

> 这个 state boundary 需要什么 consistency level？

高风险 inventory / approval / permission 可能要求更强一致性；只读研究可能允许 snapshot 或一定 staleness。

## Lock 和 Idempotency 有什么区别？

~~~text
Lock
→ who can execute now?

Idempotency
→ if it executes again, is business state still correct?
~~~

例子：

~~~text
lock acquired
→ payment API succeeds
→ worker crashes
→ lock expires
→ retry
~~~

如果 payment 本身没有 idempotency / operation reconciliation，仍然可能扣两次。

因此：

~~~text
lock ≠ exactly once
~~~

## Exactly Once 怎么回答？

不要轻易承诺。

更实际：

~~~text
at-least-once delivery
+
dedupe / idempotent execution
+
reconciliation
=
effectively-once business effect
~~~

而且要区分：

~~~text
message delivered once
task started once
business side effect happened once
~~~

它们不是一个保证。

## 结果校验是否保证“唯一准确”？

不能这么说。

开放式任务可能天然有：

~~~text
multiple hypotheses
uncertainty
conflicting evidence
missing evidence
~~~

Validator 更合理的输出是：

~~~text
SUPPORTED_AGREEMENT
RESOLVABLE_CONFLICT
UNRESOLVED_CONFLICT
INSUFFICIENT_EVIDENCE
ESCALATE
~~~

可靠系统应该保留有意义的分歧，直到 evidence / authority 能真正解决它。

## 高频故障测试

~~~text
two workers claim same task
duplicate delivery
stale revision write
worker crashes after remote side effect
lease expires during execution
two valid agents disagree
direct message conflicts with committed state
Judge conflicts with deterministic verifier
~~~

期望：

~~~text
stale mutation rejected
duplicate effect prevented / reconciled
invalid artifact not committed
conflict preserved with evidence
authority path deterministic
high-risk unresolved case escalated
~~~

## 面试金句

> **Multi-Agent consistency is not agreement among models; it is controlled state, execution, artifact, and decision semantics.**

> **Communication may be flexible; commit semantics must be explicit.**

> **Single-Agent quality depends heavily on model capability; Multi-Agent reliability depends heavily on coordination and commit semantics.**

## Canonical references

- Chapter 08 §8.3 · Async State / Idempotency
- Chapter 08 §8.13 · Multi-Agent Conflict Control
- Chapter 08 §8.15 · Long-Running Multi-Agent Handoff
- Chapter 08 §8.16 · Multi-Agent Consistency

External verification date: 2026-09-28.

Sources:

- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/building-effective-agents
- https://a2a-protocol.org/v1.0.0/
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/agent-team.md
