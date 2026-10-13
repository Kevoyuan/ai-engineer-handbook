# Agent Context Budget · Compaction vs Offloading vs Prefix Cache

> Interview-only recall; canonical engineering semantics: Chapter 07 §7.13. Prefix KV serving internals: Chapter 10 §10.1–10.5.

## Original question

字节二面 Agent 应用开发岗：

> “Agent 上下文快撑满了，怎么办？”

## 30-second answer

> 我不会只说 summarize。先按重要性把 Context 分层：精确 ID、否定条件、当前目标与决策理由保留成结构化 Working State；超长 Tool stdout、报错栈和大文档作为受治理的 Artifact 落盘，模型只持有引用与必要证据；稳定的 System Prompt / Tool Schema 尽量保持有序、可缓存的 Prefix。如果 Context 仍然超预算，再对可替代历史做 Compaction，并用原始快照校验重要约束。Prefix Cache 的规则是从首次变化位置开始，后续原缓存可能不能复用，但此前稳定 System / Tool Prefix 不一定失效。最终对比 read/write/uncached tokens、TTFT、摘要/检索成本与任务成功率，优化 cost per successful task。

口诀：

~~~text
Preserve decisions.
Offload bulk.
Stabilize prefix.
Compact selectively.
Measure the task, not just tokens.
~~~

## 90-second answer

> Context 有三种预算：容量——本轮还能塞多少 Token；保真——关键决策、约束和原始证据是否能保留或恢复；计算——哪些 Prompt Prefix 可以复用已计算 KV。我会先判断历史哪些信息后面会复用，哪些是决策依据、哪些只是大体积 Tool 流水账，以及哪些内容处于稳定前缀中。小而关键的状态保留成字段，原始日志/文件外置成带版本和权限的 Artifact ID，再按需读取。稳定 System / Tool Schema 置于 Prompt 前部，动态问题、检索片段和用户修正放在后面。
>
> 压缩是有效策略，但它改写了 history Tail，可能导致旧 conversation cache 从变化点以后无法匹配；只要前面的前缀和缓存断点等条件不变，系统部分仍可能命中。因此不能说一次 summarize 让所有缓存全部失效。必要时先保存可追溯的原始证据，再生成摘要，并验证订单号、预算、否定词、当前计划等 invariants。子 Agent 可以隔离 verbose work，但要计入新增模型调用和证据校验成本。最后我会跑 Full / Compaction-only / Offload-only / Combined 的 A/B Eval，观察质量、缓存 read/write、TTFT 和总成功成本，而不是只看 Context Token 降了多少。

## Comparison table

| Topic | Compaction | Offloading |
|---|---|---|
| Active view | Rewrite older history into summary | Keep pointers / relevant excerpts |
| Source of truth | Requires separate raw record | Raw source retained in governed storage |
| Cache consequence | Rewritten tail no longer matches old prefix from that point | Stable prefix can remain unchanged; re-reading data adds suffix |
| Cost | Summary generation + possible writes | Store / retrieve / I/O / re-reading tokens |
| Primary risk | Loss of exact constraints and rationale | Failure to retrieve or authorize needed evidence |

## Follow-up · “Prefix Cache 被打碎”到底是什么意思？

~~~text
Before:
[SYSTEM + TOOLS][TURN1...TURN30]

After:
[SYSTEM + TOOLS][SUMMARY][RECENT TURN]
                 ^ first changed token
~~~

缓存只可能复用仍满足 provider 匹配规则的完整稳定前缀。旧 Conversation Tail 无法按原样复用，但前面的 System / Tools 仍可能命中。需考虑 model、tools/schema、cache breakpoints、TTL、minimum eligible length 和实际供应商配置。

**Key line:** Compaction rewrites part of a prompt, not necessarily the entire cacheable prefix.

## Follow-up · “缓存读取 1/10 价格”能直接套吗？

不可以。Anthropic 常规模型的 cache read 常见为基础输入价格的 0.1×，但具体模型有例外；5 分钟写入通常是 1.25×，一小时写入通常是 2×。这些是特定 token 类别的倍率，不能用它们直接推出整次请求的成本或 TTFT。

**重要：缓存读过的 Tokens 仍计入 Context Window 长度。**

## Follow-up · 反复会用的信息一定不能压缩吗？

不对。

- 小而关键的约束：保留精确结构化字段。
- 大而经常被检索的证据：外置原件、留下索引。
- 很长的重复对话：可以摘要，但要保留来源与关键语义并跑回归。

真正不能丢的是决策依据和不可重新推导的事实，不是每一句原话。

## Follow-up · “失败日志只是流水账”吗？

不总是。大量 stdout 可以卸载；但错误签名、已失败方案、根因假设、重试禁令等仍可能影响下一轮决策，应以短结构化 failure state 保留。

## Follow-up · “摘要必须可逆”？

自然语言摘要一般不是无损/可逆的。应当保留原始 Event Log / Artifact，使系统能通过引用恢复证据。原始记录还受权限、数据保留/删除、安全隔离约束。

## Follow-up · Sub-agent 真的省钱吗？

它能避免主 Context 接收所有中间 Tool 输出，但其独立模型请求和失败重试仍耗 Token、时间与钱。最后结果必须有 Artifact / Evidence ID 和验收依据。

## Follow-up · 如何做 A/B 性能验证？

~~~text
A. Full history
B. Rolling compaction
C. Externalized evidence + structured state
D. Combined + stable cacheable prefix
~~~

同时记录：

~~~text
- context occupancy + overflow rate
- constraint adherence, negative constraints, exact ID fidelity
- evidence retrieval and source recovery
- cache read/write/uncached tokens
- time to first token (p50/p95), end-to-end latency
- compaction / retrieval / retry costs
- cost per successful task
~~~

## Key pitfalls

- “一次 Compaction 导致所有 cache 永久失效” — 错；需按首次变化位置与有效 cache breakpoint 判断。
- “Cached Tokens 不占 Context Window” — 错。
- “Offloading 不要钱” — 错。
- “历史可全部摘要，原始不重要” — 错。
- “只省 input tokens，就一定总成本下降” — 错。
- “缓存优化可以忽略权限变更和租户隔离” — 错。

## Source boundary

Primary material: 用户视频《字节二面Agent上下文预算面试题完整解析》。其中压缩与卸载的对比、三问四招、Prefix Cache 的成本提醒是 source-derived。

Handbook corrections / synthesis:
- 跨请求 Prefix Match 是 first-divergence dependent，而不是全局永久失效；
- 持久化原始记录使信息可恢复，但摘要本身不是 reversible；
- Compaction 与 offloading 不是严格二选一；
- Token 成本需叠加 cache writes, summary, output, tool/retrieval and retries；
- caching does not increase context capacity；
- tool / subagent offloading must preserve permission and evidence contracts.

Official verification 2026-10-13:
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://platform.claude.com/docs/en/build-with-claude/compaction
- https://platform.claude.com/docs/en/build-with-claude/context-windows
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://claude.com/blog/reducing-cost-and-improving-performance-with-claude-platform
- https://developers.openai.com/api/docs/guides/prompt-caching

No claim is made about the provenance of the ByteDance interview or any measured outcome from the user-supplied video.
