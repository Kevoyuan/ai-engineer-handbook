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

## 10.10 Agent Sandbox：把模型能力限制在一个可证明的 Blast Radius 内

Agent Sandbox 不是某一种 VM 产品，而是一套 **受控执行边界**。

它负责回答：

~~~text
What can the Agent see?
What can it modify?
Where can it connect?
What syscalls / processes can it create?
How much CPU / memory / disk can it consume?
Which credentials can it access?
How long does the environment live?
How is every action audited?
~~~

因此更准确的定义是：

> **An Agent sandbox is an execution boundary that constrains capability, data access, network reachability, resource consumption, and blast radius for untrusted or probabilistic agent actions.**

这里的“不可信”不只指恶意代码，还包括：

~~~text
hallucinated command
prompt-injected instruction
wrong tool arguments
dependency supply-chain code
malicious repository content
untrusted user code
unexpected subprocess behavior
stale automation
~~~

### 10.10.1 Sandbox ≠ Permission Prompt

Human approval 是一种控制机制，但不是强隔离边界。

~~~text
Permission Prompt
→ asks whether an action may proceed

Sandbox
→ technically prevents the action from exceeding a boundary
~~~

两者可以组合，但不能互相替代。

例如：

~~~text
Agent wants to write /etc/ssh/sshd_config

Prompt-only
→ user may accidentally approve

Sandbox
→ path is outside writable mount
→ kernel/runtime rejects access
~~~

> **Approval controls intent; sandboxing constrains capability.**

### 10.10.2 Sandbox ≠ VM

Sandbox 是安全目标，VM / container / OS sandbox / gVisor / WASM 是实现手段。

~~~text
Sandbox
├─ OS-level process sandbox
├─ namespace / container isolation
├─ user-space kernel sandbox
├─ microVM / VM
└─ constrained language runtime
~~~

所以不要说：

~~~text
“Sandbox 就是开一台 VM。”
~~~

也不要把所有实现简单排成一个绝对安全等级。

更合理的问题是：

~~~text
Threat model
× shared kernel?
× credential exposure?
× network egress?
× mounted host resources?
× host-side escape hatch?
× runtime compatibility?
× observability?
× startup / density requirement?
~~~

## 10.11 Threat Model：先定义你到底在防什么

一个生产 Sandbox 至少要考虑四类威胁。

### A. Model / Agent error

~~~text
rm wrong directory
bad migration
recursive process fork
wrong deploy command
incorrect API mutation
~~~

### B. Prompt injection / hostile input

攻击内容可能来自：

~~~text
repository README
web page
email
tool result
document
package metadata
retrieved context
~~~

它的目标可能是诱导 Agent：

~~~text
read secret
upload file
disable guardrail
install malware
modify unrelated resource
~~~

### C. Untrusted code / dependency

Agent 运行：

~~~text
pip install
npm install
build script
test suite
user-generated program
third-party binary
~~~

即使 Agent 决策本身正确，执行内容也可能恶意。

### D. Multi-tenant escape / infrastructure abuse

在共享云平台还要防：

~~~text
sandbox → host escape
tenant A → tenant B data access
resource exhaustion
internal metadata service access
credential theft
network pivot
~~~

> **Sandbox design begins with blast radius, not with product selection.**

## 10.12 核心隔离维度

### 10.12.1 Filesystem

至少区分：

~~~text
readable roots
writable roots
read-only mounts
ephemeral scratch
persistent volume
host mounts
secret mounts
~~~

一个常见策略：

~~~text
project workspace
→ read/write

dependencies / base image
→ read-only

host home / SSH keys / credentials
→ not mounted

scratch
→ ephemeral
~~~

不要把 chroot 本身当作可靠安全边界。真正隔离通常还需要 mount namespace、user namespace、capability dropping、seccomp 或更强的 VM boundary。

### 10.12.2 Network / Egress

安全默认值通常应是：

~~~text
default deny
→ explicit allowlist / proxy
→ audited destination
~~~

网络边界必须同时控制：

~~~text
DNS
HTTP / HTTPS
raw socket
cloud metadata
private RFC1918 ranges
internal services
package registry
model API
git host
~~~

只做 filesystem sandbox 而允许自由网络，攻击者仍可能：

~~~text
read available secret
→ exfiltrate over network
~~~

只做 network deny 而让 Agent 读取任意 host file，也可能破坏本机。

> **Filesystem isolation and network isolation are complementary boundaries.**

### 10.12.3 System calls / Kernel surface

Linux 下常见控制：

~~~text
seccomp-bpf
Linux capabilities
Landlock
user namespace
mount namespace
PID namespace
network namespace
cgroup namespace
LSM policy
~~~

需要警惕的系统调用 / capability 可能包括：

~~~text
mount
ptrace
setns
unshare
clone variants
bpf
device access
raw socket
~~~

具体 deny list 必须按 runtime 和 workload 设计，不能机械复制。

### 10.12.4 Process

至少控制：

~~~text
PID visibility
max process count
UID / GID
privilege escalation
subprocess inheritance
daemon persistence
~~~

防止：

~~~text
fork bomb
orphan process
host process introspection
privileged child
~~~

### 10.12.5 Resources

限制：

~~~text
CPU
memory
process count
disk size
IOPS / bandwidth
execution time
network bandwidth
open files
GPU quota
~~~

Linux 常通过 cgroups / rlimits / quota 等实现。

Sandbox 如果只有“权限隔离”而没有资源预算，仍可能被 DoS。

### 10.12.6 Credentials / Secrets

这是最容易被忽略的一层。

不应把长期凭证直接放进 Sandbox：

~~~text
GitHub PAT
cloud root credential
production DB password
signing key
SSH private key
~~~

更成熟的模式：

~~~text
Sandbox
→ scoped request
→ host-side broker / proxy
→ short-lived credential
→ destination-specific action
~~~

> **The safest secret in a sandbox is the secret that never enters it.**

### 10.12.7 Lifecycle / Ephemerality

Ephemeral sandbox 的优点：

~~~text
clean state
reduced persistence
easy reset
smaller post-compromise residue
~~~

但并不是所有 Agent 都应该每次全新环境。

长任务 / coding agent 可能需要：

~~~text
persistent workspace
package cache
build artifacts
session resume
~~~

因此更准确的是：

~~~text
ephemeral compute
+ explicitly scoped persistent state
~~~

而不是“生产环境必须每个任务全部销毁”。

### 10.12.8 Audit / Observability

至少记录：

~~~text
sandbox_id
tenant / user / task
image / template version
command
exit code
stdout / stderr reference
file diff
network request
tool call
resource usage
policy decision
approval
termination reason
snapshot / restore event
~~~

安全日志最好与 Agent Trace 关联：

~~~text
Trace
→ Tool proposal
→ Sandbox execution
→ OS / network evidence
→ Validator
~~~

## 10.13 五类实现模式

### Pattern A · OS-level Process Sandbox

典型技术：

~~~text
macOS Seatbelt
Linux bubblewrap
Landlock
seccomp
namespaces
~~~

特点：

~~~text
low startup overhead
native local filesystem integration
good developer ergonomics
shares host kernel
configuration-sensitive security
~~~

适合：

~~~text
local coding agent
developer workstation
trusted / semi-trusted repository
low-latency command execution
~~~

但不要把它写成“只适合可信环境”。合理配置的 OS sandbox 可以提供非常实际的强制边界；只是它的 threat model 与独立 Guest Kernel 不同。

### Pattern B · Container / Namespace Isolation

典型：Docker / OCI container。

优点：

~~~text
excellent ecosystem
custom images
fast provisioning
resource controls
portable deployment
~~~

风险边界：

~~~text
shared host kernel
privileged container
host socket mount
device mount
capability leakage
unsafe bind mount
~~~

所以：

> **Container security depends more on configuration than on the word “container”.**

### Pattern C · User-space Kernel / Hardened Container

例如 gVisor 一类架构，把大量 Linux syscall surface 放到用户态 kernel / sandbox runtime 中实现，减少 guest workload 直接触达 host kernel 的范围。

它处于传统 container 与 full VM 之间的一类设计空间。

### Pattern D · MicroVM / VM

典型：

~~~text
Firecracker
Cloud Hypervisor / RustVMM
KVM-based microVM
~~~

优势：

~~~text
dedicated guest kernel
stronger tenant boundary for shared-kernel threats
VM-level snapshot / restore
clear machine lifecycle
~~~

成本：

~~~text
virtualization support
image / snapshot management
higher orchestration complexity
host density trade-offs
longer or more complex startup path than pure process sandbox
~~~

但现代 microVM 可以非常快，不能简单写成“VM 一定秒级”。Firecracker 的当前 specification 在特定测试条件下要求：1 vCPU / 128 MiB guest 的 VMM memory overhead ≤5 MiB，从 InstanceStart 到 Linux user-space /sbin/init ≤125 ms。

### Pattern E · Constrained Runtime

例如：

~~~text
WASM
V8 isolate
language sandbox
restricted interpreter
~~~

优势：

~~~text
small capability surface
fast startup
fine-grained host functions
high density
~~~

限制：

~~~text
native binary compatibility
system package support
POSIX coverage
debugging / tool ecosystem
~~~

它不能简单标成“隔离性较弱”。在 capability-based design 下，它对特定 workload 可能拥有非常清晰的安全边界；只是通用 Linux compatibility 较弱。

## 10.14 生产 Sandbox Control Plane

一个更完整的架构：

~~~text
                    AGENT / WORKFLOW
                           │
                     action proposal
                           │
                           ▼
                 Permission / Risk Gate
                           │
                           ▼
                   Sandbox Scheduler
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   Image / Template   Resource Policy   Network Policy
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                   ISOLATED RUNTIME
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Filesystem      Process       Network Proxy
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    Execution Evidence
                           │
                           ▼
               Validator / Artifact Gate
                           │
                           ▼
                  Result / State Update
~~~

这里必须把：

~~~text
model decision
≠
execution authority
~~~

Agent 可以提议：

~~~text
run command
install package
write file
connect endpoint
~~~

但 Host / Sandbox Policy 决定真正能不能执行。

> **The model proposes an action; the sandbox enforces the physical capability boundary.**

## 10.15 Network Broker 与 Secret Broker

高安全生产环境不建议：

~~~text
Sandbox
→ unrestricted internet
→ raw production credentials
~~~

更推荐：

~~~text
Sandbox
→ controlled proxy
→ destination allowlist
→ request validation
→ scoped credential injection
→ upstream service
~~~

例如 Git 操作：

~~~text
git push
→ sandbox-side client
→ trusted proxy
→ validate repo / branch / operation
→ attach real credential outside sandbox
→ Git host
~~~

Anthropic 公开说明 Claude Code on the web 采用类似模式：敏感 Git credential 不进入 sandbox，而由外部代理验证目标后附加。

这比“把 PAT 作为环境变量塞进去”安全得多。

## 10.16 代表性实现：哪些事实可以稳定写进 Handbook

### Claude Code · Local

Anthropic 当前公开的本地 sandbox：

~~~text
macOS
→ Seatbelt

Linux
→ bubblewrap
~~~

重点边界：

~~~text
filesystem
network
subprocess inheritance
human approval for escape / expansion
~~~

官方描述中，workspace 内可以写，workspace 外修改被限制；网络可通过外部 proxy 做 domain policy。

因此它更准确的定位是：

> **low-latency OS-level developer sandbox**,

而不是“Claude Code = 轻量容器”或“Claude Code = VM”。

### Claude Code · Web

Claude Code on the web 每个 session 运行在隔离云端 sandbox 中，并把敏感 Git credential 留在 sandbox 外，通过 scoped proxy 完成 Git 操作。

不要把 Local 和 Web 的 sandbox architecture 混成一个实现。

### OpenAI Codex

Codex Cloud 当前公开资料确认：

~~~text
isolated cloud container
network disabled by default
workspace-scoped execution
~~~

Codex Local 则按平台使用不同 OS sandbox：

~~~text
macOS → Seatbelt
Linux → Landlock + seccomp
~~~

并提供：

~~~text
read-only
workspace-write
danger-full-access
~~~

等 sandbox policy。

因此没有公开依据把 Codex 统一写成“container + microVM”。

### E2B

E2B 当前开源 Runtime 明确使用 Firecracker microVM；每个 sandbox 是隔离 Linux VM，支持 template snapshot、pause / resume、copy-on-write rootfs 和 lazy memory loading。

它展示的是：

~~~text
VM isolation
+ snapshot-based fast restore
+ agent-oriented control plane
~~~

### CubeSandbox

CubeSandbox 当前公开仓库描述为 RustVMM + KVM 的 hardware-isolated sandbox，每个 sandbox 有 dedicated guest kernel，并提供 E2B SDK compatibility。

官方 benchmark 声称：

~~~text
<60 ms serviceable sandbox creation
<5 MB memory overhead
~~~

但这两个数字必须带测试条件理解：其 README 明确说明 cold-start benchmark 取自 bare-metal，且 memory overhead 也有指定 sandbox size / implementation assumptions。

> **Vendor benchmark numbers are evidence about a tested configuration, not universal cross-platform constants.**

### Firecracker

Firecracker 是 microVM VMM building block，不是完整 Agent Sandbox 平台。

当前 specification 的典型性能边界：

~~~text
1 vCPU + 128 MiB guest
VMM memory overhead <= 5 MiB
InstanceStart → Linux /sbin/init <= 125 ms
~~~

这些是受明确测试配置约束的指标。

### Bubblewrap

Bubblewrap 是低层 Linux sandbox 工具。

它可以提供：

~~~text
mount namespace
user namespace
PID namespace
network namespace
UTS namespace
optional seccomp
~~~

但项目文档明确强调：最终安全性取决于调用参数和暴露了哪些 mount / service。

所以：

> **Bubblewrap is a sandbox construction primitive, not a security policy by itself.**

### Sandock

Sandock 当前公开资料显示它是 Docker-based sandbox platform，提供 isolated container、resource limits、network isolation、persistent volumes 和 SDK/API。

它适合需要完整 POSIX / Docker ecosystem 的 Coding Agent。

但因为它本质是 container-level isolation，所以在“宿主共享内核”这一 threat model 上，与 dedicated guest-kernel microVM 不是同一边界。

### Devin

当前没有足够公开一手资料支持把 Devin 稳定写成“Firecracker microVM implementation”。因此 Handbook 不保留这个具体实现断言。

## 10.17 不要做简单的“沙箱强弱排行榜”

比起：

~~~text
process < container < microVM
~~~

更有用的是矩阵：

| Pattern | Host kernel shared? | Native Linux compatibility | Startup tendency | Isolation boundary | Typical fit |
|---|---|---|---|---|---|
| OS sandbox | Yes | Very high | Very fast | OS policy / namespace / syscall | Local coding agent |
| Container | Yes | Very high | Fast | Namespace / cgroup / LSM | General cloud execution |
| gVisor-like | Reduced direct host-kernel exposure | High | Fast–medium | User-space kernel + host sandbox | Multi-tenant container workloads |
| MicroVM | No guest/host kernel sharing | High | Fast–medium | Hypervisor + dedicated guest kernel | Untrusted code / multi-tenant Agent |
| WASM / isolate | Runtime-defined | Limited–medium | Very fast | Capability/runtime boundary | Constrained compute / plugins |

这张表不是“谁绝对更安全”，因为真实安全还取决于：

~~~text
mounts
credentials
network egress
host services
kernel / hypervisor patching
escape hatch
image provenance
runtime configuration
~~~

## 10.18 Sandbox Security Checklist

上线前至少问：

~~~text
[Filesystem]
□ writable roots 是否最小？
□ host home / ssh / cloud config 是否未挂载？

[Network]
□ default deny？
□ metadata / internal ranges 是否封锁？
□ package registry / model API 是否走 proxy？

[Process]
□ non-root？
□ capabilities dropped？
□ process limit？
□ ptrace / mount / namespace escape surface reviewed？

[Resources]
□ CPU / memory / disk / time / PID quota？

[Secrets]
□ long-lived credential 是否留在 sandbox 外？
□ token 是否 short-lived + scoped？

[Lifecycle]
□ ephemeral / persistent state 边界明确？
□ snapshot / image provenance 可追踪？

[Audit]
□ command / file diff / network / resource / policy decision 可关联到 Agent Trace？

[Recovery]
□ timeout / kill / rollback / workspace reset？
□ sandbox compromise 是否能快速 discard？
~~~

## 10.19 面试回答模板

如果面试官问：

> “怎么设计一个安全的 Agent Sandbox？”

可以回答：

> 我会先定义 threat model，而不是先选 Docker 还是 Firecracker。Sandbox 本质是执行边界，需要同时限制 filesystem、network、syscall/process、resource、credential 和 lifecycle。模型只能 proposal，Host/Sandbox Policy 才有真实执行权。对于本地 Coding Agent，可以用 Seatbelt、bubblewrap、Landlock/seccomp 这类低延迟 OS sandbox；对于高风险多租户不可信代码，可以考虑 dedicated guest kernel 的 microVM，例如 Firecracker/E2B/CubeSandbox。但 microVM 也不等于自动安全，真正风险经常来自 host mount、网络代理、长期 credential 和 orchestration escape hatch。网络我会 default deny，通过 egress proxy 做 allowlist；敏感 secret 尽量不进 sandbox，而由 host-side broker 注入短期 scoped credential；CPU、memory、PID、disk 和 timeout 做硬限制。最后所有 command、file diff、network request、resource usage 和 policy decision 都关联到 Agent Trace。选型看的是 blast radius、compatibility、startup、density 和运维复杂度，而不是简单说 microVM 一定最好。

## 10.20 Source boundary · Agent Sandbox

Primary source:

- 用户提供的 Agent 沙箱技术总结：定义、隔离维度、进程/容器/microVM/runtime 分层、Claude Code / Codex / E2B / CubeSandbox / Firecracker / Bubblewrap / Sandock 对比与面试问题。

Source-derived ideas retained:

- Agent 生成的代码 / 命令应视为潜在不可信执行；
- 文件系统、网络、系统调用、进程和资源隔离是核心边界；
- microVM 可用于更强的多租户 Guest Kernel 隔离；
- CPU / memory / disk 等资源必须限制；
- 操作应可审计；
- ephemeral lifecycle 能降低状态残留；
- Sandbox 选型需要在安全、启动、资源与兼容性之间权衡。

Handbook corrections / synthesis:

- Sandbox 定义为 execution boundary，而不是 VM 同义词；
- 不保留“Anthropic 三层沙箱”这一未经官方统一定义的产品架构；
- Claude Code Local 明确为 Seatbelt / bubblewrap OS sandbox，Claude Code Web 单独视为云端 isolated sandbox；
- Codex Cloud 明确为 isolated cloud container；Codex Local 按平台使用 Seatbelt 或 Landlock/seccomp，不写成统一的 container + microVM；
- E2B 当前开源 Runtime 确认为 Firecracker microVM；
- CubeSandbox <60ms / <5MB 只作为其官方指定测试条件下 benchmark，不做跨产品绝对比较；
- Firecracker ≤125ms / ≤5MiB 只按当前 specification 对应测试条件引用；
- Bubblewrap 安全性依赖实际 mount / namespace / seccomp 配置；
- 不把 chroot 本身当强安全边界；
- 不把 WASM / V8 简单归类为“隔离性较弱”；
- 未保留缺少公开一手证据的 Devin = Firecracker 断言；
- 增加 credential broker、egress proxy、audit、snapshot/image provenance、recovery 与 Trace correlation。

External verification:

- Anthropic engineering: Claude Code sandboxing uses filesystem + network boundaries, Seatbelt on macOS and bubblewrap on Linux; Claude Code on the web uses isolated cloud sandboxes with credentials kept outside.
- Anthropic containment review: different products use different containment patterns including gVisor container, local OS sandbox, and sealed VM.
- OpenAI Codex: cloud agents run in isolated containers with network disabled by default; local Codex uses platform-specific filesystem/network sandbox policies.
- E2B Runtime: Firecracker microVM, snapshot resume, lazy memory, copy-on-write rootfs.
- Firecracker specification: bounded VMM overhead and startup under defined test configuration.
- CubeSandbox official repository: RustVMM/KVM dedicated-kernel sandbox with published benchmark conditions.
- Bubblewrap README: namespaces, optional seccomp, and configuration-sensitive security boundary.
- Sandock docs: Docker-based isolated container platform with resource limits.

Sources:

- https://www.anthropic.com/engineering/claude-code-sandboxing
- https://www.anthropic.com/engineering/how-we-contain-claude
- https://openai.com/index/introducing-codex/
- https://github.com/openai/codex
- https://github.com/e2b-dev/runtime/blob/main/docs/ARCHITECTURE.md
- https://github.com/firecracker-microvm/firecracker/blob/main/SPECIFICATION.md
- https://github.com/TencentCloud/CubeSandbox
- https://github.com/containers/bubblewrap
- https://sandock.ai/docs
## 10.21 Source boundary · Prefix Cache

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

> **Approval controls intent; sandboxing constrains capability.**

> **The safest secret in a sandbox is the secret that never enters it.**

> **The model proposes an action; the sandbox enforces the physical capability boundary.**

> **Vendor benchmark numbers describe tested configurations, not universal constants.**
