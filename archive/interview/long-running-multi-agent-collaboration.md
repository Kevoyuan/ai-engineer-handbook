# Long-Running Multi-Agent Collaboration · 面试答题卡

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08 §8.15.

## 题目

**多个 Agent 能不能各自维护进度，接力跑几小时甚至几天，最后把结果直接拼起来？**

## 30 秒版本

如果是互相独立的 Map-style 子任务，最后 deterministic merge，可以。

但如果是有依赖关系的长周期接力任务，我不会让每个 Agent 只维护自己的局部进度，也不会把自然语言输出直接交给下一个 Agent。生产上需要统一的 durable workflow state / state machine，每个阶段读取 committed state 和 versioned input artifacts，产出 candidate artifact 后先做 schema、semantic invariant、artifact integrity 和必要的 acceptance validation，通过后才提交 artifact 和 state transition，再让下一阶段变成 runnable。

Agent 崩溃后从最后 committed state 恢复；共享状态并发可以用 revision/CAS，也可以用 single writer / transaction / workflow engine。外部副作用还要做 idempotency、reconciliation 或 compensation，因为 checkpoint 不能自动撤销现实世界。

## 60–90 秒版本

长周期 Multi-Agent 的关键不是“每个 Agent 都记得自己做到哪”，而是把 Agent 进程和 Durable Workflow State 分开。

我会至少拆三层：

~~~text
Workflow State
→ stage / status / revision / owner / lease / retry / approval

Artifact Store
→ versioned output / lineage / checksum / validation status

Agent-local Context
→ 当前 Agent 的 prompt、retrieved context、tool result、scratch state
~~~

每次 handoff 不直接传一句“我做完了”，而是：

~~~text
read committed state
→ execute bounded task
→ write candidate artifact
→ schema validation
→ semantic validation
→ referential / integrity validation
→ acceptance validation when needed
→ commit artifact
→ atomic state transition
→ publish next task
~~~

状态写入要有明确 concurrency model，例如 CAS：

~~~text
read revision = N
→ update only if revision is still N
→ otherwise reject stale write
~~~

但 CAS 只是一个实现，也可以用 single-writer orchestrator、transaction、serialized queue 或 workflow-engine-owned state。

长任务还要处理 lease / heartbeat。Worker 崩溃后 lease 过期，Orchestrator 才能安全 reclaim task；但 Worker 崩溃不等于外部 API 没成功，所以重试前还要 reconciliation。

如果 validation 失败，也不是一律从头跑。应该找到 earliest invalid artifact，只重跑最小受影响范围；如果是支付、部署、邮件等外部副作用，则需要 idempotency / compensation。

最后我会监控 handoff failure rate、resume success、stale-write rejection、duplicate side effects、time in stage 和 cost per successful workflow。

## 最短记忆

~~~text
Durable State
+ Versioned Artifact
+ Handoff Contract
+ Validate-before-Commit
+ Concurrency Control
+ Lease / Heartbeat
+ Checkpoint / Event History
+ Idempotency / Reconciliation
+ Recovery / Escalation
~~~

## 追问：为什么不能只用共享文件夹？

共享文件夹只能解决：

~~~text
where files live
~~~

但不能自动回答：

~~~text
which artifact version is authoritative?
has it passed validation?
which task owns it?
which transition is legal?
has another worker already updated the state?
what happens after a crash?
what external side effect already occurred?
~~~

所以共享存储可以是 Artifact Store，但不能替代 Workflow State Machine。

## 追问：为什么不能每个 Agent 自己存 progress.json？

因为这会产生多个 source of truth。

例如：

~~~text
Agent A progress = stage 3 done
Agent B progress = stage 2 retrying
Orchestrator = stage 2 running
~~~

生产系统必须有一个 authoritative state owner，Agent 只能通过受控 transition 修改它。

## 追问：乐观锁是不是必须？

不是。

乐观并发 / revision CAS 很适合冲突较少的共享 task state：

~~~text
expected revision = 7
→ update succeeds only if current revision = 7
~~~

但还可以：

~~~text
single-writer orchestrator
database transaction / row lock
serialized queue
partition ownership
distributed lease
workflow-engine state
~~~

面试重点不是背“必须用乐观锁”，而是说明：

> shared workflow state needs an explicit concurrency model.

## 追问：Checkpoint 恢复是不是从失败代码行继续？

不一定。

不同 Runtime 语义不同。

~~~text
LangGraph
→ graph-state checkpoint

Temporal
→ durable event history + deterministic replay
~~~

通用说法应该是：

> 恢复到最后一个可重建的 committed workflow state，而不是假设保存了任意程序 instruction pointer。

## 追问：为什么 Checkpoint 不能解决所有恢复问题？

因为：

~~~text
checkpoint
→ restores orchestration state

external side effect
→ changes the real world
~~~

例如：

~~~text
Agent calls deploy API
→ deployment succeeds
→ worker crashes before saving success
~~~

恢复后如果 blind retry，可能重复执行。

所以还需要：

~~~text
idempotency key
external operation id
result lookup
reconciliation
compensation / saga
human escalation
~~~

## 追问：Handoff 校验有哪几层？

~~~text
1. Structural / Schema
   → 能不能稳定解析？

2. Semantic / Invariant
   → 字段和业务规则是否合理？

3. Referential / Integrity
   → 声称存在的文件、证据、Artifact 是否真实存在且匹配？

4. Acceptance / Outcome
   → 当前阶段真正的目标是否达成？
~~~

前三层验证“产物是否合法”，第四层验证“任务是否真的完成”。

## 追问：失败后是不是一定让原 Agent 重做？

不是。

更合理：

~~~text
failure
→ locate earliest invalid artifact / state
→ invalidate dependent downstream work
→ minimum-scope repair / rerun
→ bounded retries
→ escalate when needed
~~~

而且“原 Agent”不是可靠性要求；如果 Artifact Contract 和 State 都持久化了，可以由另一个兼容 Worker 接手。

## 追问：跑几天还会有什么新问题？

版本兼容。

~~~text
Day 1 → workflow v12
Day 3 → deploy v13
Day 5 → old task resumes
~~~

因此需要保存：

~~~text
workflow_version
schema_version
prompt_version
tool_registry_version
policy_version
~~~

并有 backward compatibility、migration、pinning 或 explicit escalation 策略。

## 自动化运维示例

~~~text
Incident
→ Investigation Agent
→ Evidence Artifact
→ validate
→ Root Cause

→ Remediation Agent
→ Change Proposal
→ validate + approval

→ Execution Agent
→ Deployment ID
→ reconcile

→ Validation Agent
→ SLO / Test Evidence
→ COMPLETE
~~~

如果最终验证失败，不从 Incident 开始全部重跑，而是判断最早出错的是：

~~~text
diagnosis?
remediation?
execution?
environment drift?
validator?
~~~

然后最小范围修复。

## 面试官真正考什么

重点不是“会不会说 State Machine”：

~~~text
Does the system have one authoritative workflow state?
Are artifacts versioned and validated?
Is handoff validate-before-commit?
What is the concurrency model?
How is task ownership reclaimed after worker loss?
Can execution resume after crash?
Are retries idempotent?
How are external side effects reconciled?
Can old checkpoints survive code/schema upgrades?
Does failure trigger minimum-scope repair?
Can every transition be audited?
~~~

## Canonical references

- Chapter 08 §8.1 · Artifact-driven Workflow
- Chapter 08 §8.2 · D-I-R Minimum-scope Repair
- Chapter 08 §8.3 · Async State / Idempotency
- Chapter 08 §8.8 · Checkpoint Semantics
- Chapter 08 §8.13 · Multi-Agent Conflict Control
- Chapter 08 §8.15 · Long-Running Multi-Agent Handoff
- Chapter 09 · Validation / Eval / Observability

External verification date: 2026-09-28.

Sources:

- https://docs.langchain.com/oss/python/langgraph/persistence
- https://docs.temporal.io/ai
- https://docs.temporal.io/tasks
- https://docs.temporal.io/workflow-definition
