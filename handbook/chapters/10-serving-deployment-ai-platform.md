# Chapter 10 · Serving、Deployment、Security 与 AI Platform
## Serving, Deployment, Security, and AI Platform

> Canonical semantic chapter. Chapter 10 starts with inference serving and will expand incrementally into deployment lifecycle, security operations, registry/lineage, and AI platform concerns.

Agent 应用最终要落到一个推理系统上。到了 Serving 层，很多“Agent 性能问题”其实不再是 Prompt 或 Workflow 问题，而是：

~~~text
Prefill cost
Decode cost
KV cache memory
Prefix reuse
Batching / scheduling
Concurrency
Tenant isolation
Failure recovery
Capacity
~~~

本章第一部分聚焦一个常见面试与生产问题：**多个 Agent / 请求能不能复用同一段 KV Cache？**

答案不是简单的 yes / no。更准确的问题是：

> **Can requests reuse immutable prefix computation under the serving engine's cache-key, lifecycle, and isolation rules?**

## 10.1 Prefill、Decode 与 KV Cache

Decoder-only Transformer 推理可以粗略拆成：

~~~text
Prompt tokens
→ Prefill
→ produce K/V states for prompt tokens
→ first generated token
→ Decode token by token
~~~

KV Cache 保存每层注意力中历史 token 的 Key / Value，使后续 Decode 不必为每个新 token 重新计算全部历史上下文。

因此要区分两种复用：

~~~text
Within-request KV reuse
→ one request reuses its own past K/V during decoding

Cross-request prefix reuse
→ a later request reuses K/V already computed for an identical token prefix
~~~

没有跨请求 Prefix Cache 时，即使两个请求前缀相同，它们也通常会分别进行 Prefill，并维护各自的运行时 KV 状态。

但不要把“默认不能共享”写成跨框架通则。现代 inference engines 可能提供 Automatic Prefix Caching / Radix-style caching，并且不同版本的默认开关可能变化。工程上应检查 **engine + version + config + workload**。

## 10.2 Prefix KV Cache：共享的是已计算前缀，不是一个可变会话对象

假设两个请求经过同一个 tokenizer / chat template 后是：

~~~text
Request A
[SYSTEM + TOOL SCHEMA + SHARED POLICY] + User A

Request B
[SYSTEM + TOOL SCHEMA + SHARED POLICY] + User B
~~~

如果前半段 token 序列完全一致，Prefix Cache 可以让第二个请求跳过共享前缀的 Prefill：

~~~text
shared token prefix
→ cache hit
→ reuse cached KV blocks
→ prefill only uncached suffix
→ decode normally
~~~

因此“多个 Agent 共享 KV Cache”更准确地说是：

> **Multiple requests can reference reusable cached prefix blocks for the common immutable prefix; each request still owns its divergent suffix and subsequent decode state.**

这通常带来：

- 更低的 shared-prefix Prefill 计算；
- 更低的 TTFT（Time To First Token）；
- 更高的 Prefill throughput；
- 在采用共享 block/ref-count 设计的实现中，避免重复保存相同前缀 block。

但 Prefix Caching **不会让生成阶段本身变快**。如果 workload 主要耗在长输出 Decode，而共享输入很短，收益可能很有限。

## 10.3 Prefix Match 必须是 token-level identity，不是语义相似

KV Cache 与模型内部激活直接相关，所以复用条件比“文本看起来一样”严格得多。

常见 Cache Key / compatibility factors 包括：

~~~text
model / model revision
tokenizer + chat template
exact prefix token IDs
position / attention semantics
LoRA / adapter identity
multimodal input identity
cache namespace / salt
engine-specific block granularity
~~~

以下情况都会降低命中：

- System Prompt 中加入动态 timestamp / request id；
- Tool Schema 顺序不稳定；
- 相同工具被不同 JSON serialization 输出；
- tenant-specific 信息放在公共前缀之前；
- Agent role prompt 在最前面就发生分叉；
- 使用不同 adapter / multimodal input；
- Cache isolation salt 不同。

所以 Serving 优化经常要求重新组织 Prompt Layout：

~~~text
stable global prefix
→ stable tool / policy prefix
→ agent-specific role
→ user / task-specific context
~~~

前提是这种重排不改变语义与安全边界。

> **Prefix-cache hit rate is partly an application prompt-layout property, not only an inference-engine property.**

## 10.4 SGLang RadixAttention 与 vLLM Automatic Prefix Caching

### SGLang · Radix-style prefix reuse

SGLang 的 RadixAttention / Radix Cache 思路是把历史请求的 token prefix 组织成 compact prefix tree，使新请求可以匹配最长公共前缀并复用对应 KV。它特别适合 multi-turn、few-shot、agentic program 等存在重复前缀的 workload。

可以抽象为：

~~~text
Prefix Tree
├─ System + Tools + Policy
│  ├─ Agent A suffix
│  ├─ Agent B suffix
│  └─ Agent C suffix
└─ Other prefix
~~~

### vLLM · Automatic Prefix Caching

vLLM 的 APC 采用 block-oriented cache。当前设计通过包含 parent prefix + current block tokens + extra identity information 的 block hash 查找已计算 KV blocks，新请求命中后直接复用已计算 block。

两者实现数据结构不同，但工程目标相同：

> **Avoid redundant Prefill for exact shared prefixes.**

不要把 `RadixAttention` 当成 Prefix Caching 的通用名；它是 SGLang 的具体机制/实现语境。其他 runtime 可能使用 hash-block、paged KV 或不同索引结构。

## 10.5 Prefix Cache ≠ Semantic Cache

这两个概念经常在面试回答里被混在一起。

| Cache | Key | Reuse | Model call? | Main risk |
|---|---|---|---|---|
| KV / Prefix Cache | exact compatible token prefix | intermediate K/V computation | still needed for suffix/decode | memory / isolation / eviction |
| Exact Response Cache | exact request key | final response | hit can skip model | stale answer / key design |
| Semantic Cache | embedding / semantic similarity | prior response or tool result | hit can skip model | false semantic hit / stale context |

Semantic Cache 的典型路径是：

~~~text
new query
→ embedding / similarity lookup
→ similar cached request?
   ├─ yes → return cached response
   └─ no  → run model → store response
~~~

它属于 application / response cache，不是 Transformer KV Cache 管理。

> **Prefix caching reuses computation. Semantic caching reuses an answer.**

因此视频中把“Prefix Cache 是否命中”和“Semantic Cache 是否命中”并列成同一个 KV 共享判断条件并不准确。它们应该是两层独立优化。

## 10.6 Multi-Agent 怎么设计才能提高 Prefix Reuse

多 Agent 服务如果确实共享大量系统指令、工具定义或组织级 policy，可以考虑：

~~~text
Common System Policy
+ Common Tool Schema
+ Common Safety / Formatting Rules
        ↓ shared prefix
Agent-specific Role / Skill Context
        ↓ divergence
User / Task Context
~~~

但是不要为了 Cache Hit 强行让所有 Agent 共用同一个角色 Prompt。

首先保证：

~~~text
semantic correctness
permission isolation
agent responsibility boundary
prompt maintainability
~~~

然后再优化 prefix layout。

一个更成熟的 Serving 设计会同时观察：

~~~text
prefix reuse benefit
vs
context specialization
vs
tenant isolation
vs
cache memory pressure
~~~

## 10.7 Security：共享 Cache 也是隔离边界

跨请求 Prefix Cache 会让 latency 取决于是否命中共享前缀，因此多租户系统需要考虑 timing side channel 与 cache namespace 隔离。

vLLM 当前提供 request-level `cache_salt`：salt 进入 Prefix Cache key，不同 salt 的请求不会共享 KV blocks。这样可以按 user / tenant / trust group 定义复用边界。

这产生一个直接 trade-off：

~~~text
more sharing
→ better cache hit rate / throughput
→ larger cross-tenant inference surface

more isolation
→ lower sharing
→ stronger privacy boundary
~~~

所以：

> **Cache sharing is a performance policy and a security policy at the same time.**

## 10.8 Serving Metrics：别只看“显存省了多少”

Prefix Cache 是否值得，应从 workload 指标验证：

~~~text
prefix_cache_hit_rate
cached_prefix_tokens / request
prefill_tokens recomputed
TTFT P50 / P95 / P99
prefill throughput
request throughput
KV-cache utilization
cache eviction rate
hit-length distribution
end-to-end latency
cost per successful task
~~~

还要按 workload slice 看：

~~~text
single-turn
multi-turn
multi-agent shared system prompt
long-document QA
short-prefix / long-decode
multi-tenant
~~~

只看整体平均值会掩盖 Prefix Caching 真正有收益的场景。

## 10.9 面试回答模板

如果面试官问“多个 Agent 能不能复用同一份 KV Cache”，可以这样回答：

> 多个 Agent 是否能复用 KV Cache，要看它们是否落在同一个 serving engine 的 Prefix Cache 机制里，以及请求是否拥有兼容且完全一致的 token prefix。没有跨请求 Prefix Caching 时，每个请求会独立做 Prefill；开启或使用 APC / Radix-style prefix caching 后，已计算的共享前缀 KV blocks 可以被后续请求复用，只计算分叉后的 suffix。这里共享的是 immutable prefix computation，不是多个 Agent 共用一份可变会话状态。SGLang 可用 Radix tree 管理共享前缀，vLLM 使用 block-hash APC。它主要降低 Prefill 和 TTFT，不会直接减少 Decode 时间。Semantic Cache 是另一层，它复用最终回答，不属于 KV Cache。生产上还要检查 Prompt token 对齐、adapter / multimodal identity、cache eviction 以及多租户 isolation / cache salt。

这比简单回答“默认不行，开 RadixAttention 就行”更准确，也更不容易被追问击穿。

## 10.10 Source boundary

Primary source:

- 用户提供的视频总结：多个 Agent 是否能够复用同一份 KV Cache / Prefix Cache。

Source-derived ideas retained:

- 多 Agent 中重复 System Prompt / Tool Schema 会造成重复 Prefill 的性能机会；
- Prefix Cache 可以让共享前缀只计算一次并被后续请求复用；
- SGLang / Radix-style prefix management 是典型实现；
- 高并发 Agent workload 中 Prefix Reuse 可以降低重复计算。

Handbook corrections / synthesis:

- 不把“默认不能共享”当成所有 inference engine 的通用默认值；
- 把“共享 KV Cache”改写为跨请求复用 immutable cached prefix blocks；
- Prefix Cache 要求 token-level compatible prefix，不是文本语义相似；
- SGLang RadixAttention 与 vLLM APC 是不同具体实现；
- Semantic Cache 单独归类为 response/tool-result reuse，不属于 KV Cache；
- 明确 Prefix Cache 主要优化 Prefill / TTFT，而不是 Decode；
- 增加 Prompt Layout、Cache Eviction、Metrics 和 multi-tenant isolation / timing-side-channel 边界。

External verification:

- vLLM Automatic Prefix Caching documentation and design notes.
- Hugging Face Transformers KV-cache / prefilled cache documentation.
- SGLang paper / runtime material on RadixAttention and shared-prefix workloads.
- Redis semantic caching documentation.
- vLLM security documentation for prefix-cache salting and timing-side-channel mitigation.

Sources:
- https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/
- https://docs.vllm.ai/en/latest/design/prefix_caching/
- https://docs.vllm.ai/en/latest/usage/security/
- https://huggingface.co/docs/transformers/en/kv_cache
- https://arxiv.org/abs/2312.07104
- https://docs.sglang.ai/developer_guide/bench_serving
- https://redis.io/docs/latest/develop/use-cases/semantic-cache/

## Canonical rules

> **Prefix caching reuses computation; semantic caching reuses an answer.**

> **A cache hit requires compatible token-level identity, not semantic similarity.**

> **Prefix caching primarily reduces Prefill / TTFT; Decode remains a separate cost.**

> **Cache sharing is both a performance policy and a security policy.**
