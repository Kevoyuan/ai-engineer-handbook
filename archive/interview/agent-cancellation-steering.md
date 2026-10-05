# Agent Cancellation / Interruption / Steering · Interview Card

> Interview-only recall guide. Canonical engineering semantics live in Chapter 08 §8.17.

## 30-second version

如果面试官问：

> “用户中途取消，Agent 任务怎么停下来？”

可以回答：

> 我不会把取消等同于断开 SSE 或停止 UI 输出。生产里会给一次 Agent run 建立层级 cancellation scope，模型流、retry/backoff、Tool、前台 Sub-agent 和本地执行任务都拿 child signal/token。父 scope 取消后先停止发起新步骤；所有 blocking boundary 要么原生支持 cancellation，要么和 cancellation signal race。Shell 还要拥有 process group / job boundary，不能只杀最外层 shell。最关键的是取消后区分 Tool 是没开始、执行中被打断，还是已经完成但 result 丢失，因为 cancellation 不会撤销已经发生的副作用；未知结果要先 reconcile，再决定是否 retry。最后还要修复 tool_use/tool_result protocol。若用户只是补充要求，不是停止，就用 steering，在安全边界后、下一次模型调用前注入。

最短记忆：

~~~text
Cancel
= propagate signal
+ stop new work
+ terminate owned execution
+ reconcile side effects
+ repair protocol
+ reach quiescence

Steer
= queue correction
+ inject at safe boundary

Follow-up
= enqueue after run completion
~~~

## 60–90-second version

> 我会先把 Cancel、Disconnect 和 Quiescence 分开。断开客户端连接只代表用户看不到输出，不代表模型请求、Tool、Shell 子进程或远端副作用已经停止。生产 Runtime 应该给每个 run 建 cancellation tree：模型调用、Tool batch、每个 Tool、前台 Sub-agent、retry timer 都处于明确 scope 中，parent cancel 向 descendants 传播，但单个 child cancel 不必杀整个 session。Agent loop 在 model call、tool dispatch、retry/backoff 等 safe point 主动响应 cancellation。
>
> 对 Shell，单纯杀父 shell 不够，因为 npm、node、watcher 等 descendants 可能继续运行，所以要有 process-group/job ownership，通常先 graceful terminate，再在 grace period 后 force kill。Codex 当前实现就是一个例子：CancellationToken 传到 exec，取消时先 terminate process group，给短暂 grace period，再 kill remaining group，但具体 50ms 是它当前实现，不是行业规范。
>
> 中断后不能默认 Tool “没执行”。我会区分 NOT_STARTED、STARTED_ABORTED、COMPLETED_RESULT_LOST、COMPLETED。尤其 HTTP POST、文件写入、部署等可能已经产生 partial/unknown side effect；未知结果要 reconciliation，不能 blind retry。Conversation 也要 repair：每个 unresolved tool call 都要恢复 provider 所要求的 action/result grammar，但 synthetic tool result 必须反映真实 execution state，不能为了让下一轮 API 接受就谎称没有执行。
>
> 如果用户不是取消，只是插话改要求，我会把它当 Steering：当前 tool/action-result protocol 到安全边界后，在下一次模型调用前注入。Follow-up 则等当前 run 正常完成后再执行。这样取消才是完整的 Runtime contract，而不是一个停止按钮。

## Follow-up · 为什么断 SSE / HTTP request 不够？

因为：

~~~text
consumer disconnected
≠
producer stopped
~~~

可能仍在运行：

~~~text
model request
tool request
shell command
child process
subagent
retry timer
remote job
external side effect
~~~

而且 provider billing 也不一定以客户端断开作为成本边界。

**Key line:**

> **Cancellation is a runtime control-plane event, not a UI event.**

## Follow-up · 为什么 global isCancelled 不够？

全局 Boolean 通常只是 passive state。

如果代码已经：

~~~text
await fetch(...)
await sleep(...)
await tool(...)
await subprocess(...)
~~~

变量变化不会自动唤醒这些 await。

另外并发 Sub-agent / Tool 需要知道：

~~~text
which scope was cancelled?
parent?
one child?
whole session?
~~~

所以需要：

~~~text
hierarchical cancellation signal/token
+ explicit ownership
+ cancellation-aware awaits
~~~

## Follow-up · 为什么只杀 Shell 父进程不够？

例如：

~~~text
bash
→ npm run dev
→ node
→ watcher / worker
~~~

父 shell 死后 descendants 可能继续：

~~~text
hold port
write file
consume CPU
modify environment
~~~

所以 process-owning Tool 需要：

~~~text
process group / job / container ownership
→ graceful terminate
→ bounded grace
→ force terminate
→ reap
~~~

不同 OS / sandbox / remote executor 使用的 primitive 不同。

## Follow-up · SIGTERM vs SIGKILL？

~~~text
SIGTERM
→ request graceful termination
→ process may trap it
→ cleanup is possible

SIGKILL
→ force termination
→ cannot be caught by process
→ cleanup code does not run
~~~

所以常见策略是：

~~~text
TERM
→ grace period
→ KILL if still alive
~~~

但 grace period 不是统一常数。

## Follow-up · Tool 被打断后为什么不能直接 Retry？

因为：

~~~text
cancelled locally
≠
side effect did not happen
~~~

四种状态：

| State | Meaning | Next action |
|---|---|---|
| NOT_STARTED | 未执行 | 可重新决策 |
| STARTED_ABORTED | 途中停止 | 检查 partial effect |
| COMPLETED_RESULT_LOST | 可能完成但 ack/result 丢失 | reconcile first |
| COMPLETED | 有可信 result | 正常继续 |

例如 payment / deploy / file write / ticket mutation：

~~~text
server commits effect
→ response lost
→ caller retries
→ duplicate effect
~~~

**Key line:**

> **Cancellation changes control flow; it does not retroactively erase side effects.**

## Follow-up · 中断后怎么修 tool_use / tool_result？

不要只做：

~~~text
delete partial messages
~~~

也不要统一补：

~~~text
"tool did not run"
~~~

更安全：

~~~text
unresolved tool call
→ determine execution state
→ synthesize protocol-valid result
→ preserve uncertainty / side-effect status
→ reconcile if needed
→ only then next model call
~~~

同时区分：

~~~text
audit history
≠ active model context
≠ UI transcript
~~~

**Key line:**

> **Repair protocol structure without lying about execution reality.**

## Follow-up · Cancel vs Steer vs Follow-up？

~~~text
Cancel
→ current execution scope should stop

Steer
→ current run stays alive
→ change the next model decision

Follow-up
→ current run finishes first
→ start queued request afterward
~~~

Pi 当前官方 API/SDK 就把三者拆开。

典型 Steering 顺序：

~~~text
current tool/action unit
→ result becomes coherent
→ queued steering input
→ next model call
~~~

不能把普通用户消息随意插进尚未闭合的 tool_use / tool_result 中间。

## Follow-up · Foreground / Background Sub-agent 怎么处理？

按 ownership / lifetime，而不是按“是不是 Sub-agent”决定。

~~~text
Foreground child
→ exists to finish parent task
→ usually inherits parent cancellation

Detached / Background
→ intentionally outlives parent turn
→ independent lifetime
→ explicit job id / cancel handle / status

Remote durable job
→ cancel through remote API
→ not by killing local PID
~~~

**Key line:**

> Cancel all work owned by the scope, not every process you can see.

## Follow-up · Cancellation State Machine 怎么设计？

~~~text
RUNNING
→ CANCEL_REQUESTED
→ STOP_NEW_WORK
→ TERMINATING
→ RECONCILING
→ QUIESCENT
   ├─ CANCELLED
   ├─ FAILED
   └─ HUMAN_ACTION
~~~

不要：

~~~text
RUNNING
→ user clicks stop
→ CANCELLED
~~~

因为 tool / process / side effect 可能还没稳定。

两个不同指标：

~~~text
cancel_ack_latency
→ 多快接受取消

cancel_to_quiescence_latency
→ 多久真正停止并恢复可信状态
~~~

## Follow-up · 怎么测试 Cancellation？

故意打断不同边界：

~~~text
cancel during model stream
cancel before tool starts
cancel during file write
cancel after remote POST commit but before response
cancel shell with grandchildren
cancel during retry sleep
cancel parent with two child tasks
cancel one child only
steer during parallel tool batch
follow-up while run remains active
host crash during cancellation
~~~

观察：

~~~text
orphan process?
post-cancel new work?
unknown side effect?
duplicate retry effect?
conversation protocol broken?
steering delivered at correct boundary?
~~~

## Interview sayings

> **Cancellation is a runtime control-plane event, not a UI event.**

> **Cancellation changes control flow; it does not retroactively erase side effects.**

> **Repair protocol structure without lying about execution reality.**

> **Steering is a context-control mechanism, not a transaction rollback mechanism.**

> **Cancellation is complete only when the execution scope is quiescent and its state is trustworthy.**

## Source boundary

Primary source:
- 用户提供的视频完整文本《用户中途取消，Agent 任务怎么停下来？》

Source concepts retained:
- cancellation signal propagation
- cooperative checks in the Agent loop
- process-group termination
- transcript repair after interrupted tool calls
- separation of cancellation from steering
- Pi steer/follow-up queue distinction

Handbook corrections:
- disconnect / cancel / quiescence are different states
- global Boolean is not sufficient as a cancellation primitive
- “kill process group” generalized to owned execution tree / job containment
- Codex 50ms grace is version-specific implementation evidence, not a standard
- interrupted tool is not automatically “never executed”
- unknown side effects require reconciliation before retry
- synthetic tool results must encode execution uncertainty honestly
- background lifetime follows ownership contract
- steering does not roll back already-started side effects

External verification date: 2026-10-06.

Verified evidence:
- Anthropic Tool Use protocol requires coherent tool_use/tool_result ordering.
- Anthropic TypeScript SDK BetaToolRunner supports AbortSignal for API requests and tool runs.
- Anthropic billing guidance states client disconnect/timeout can still be charged in some in-progress successful calls.
- OpenAI Codex current source uses hierarchical CancellationToken values and current exec cancellation uses process-group termination followed by a 50ms grace period and force kill if needed.
- Pi current docs distinguish abort, steer, and follow-up.

Vendor-internal Claude Code cancellation topology and specific foreground/background signal wiring are not treated as stable canonical facts because the public implementation contract is insufficiently stable.
