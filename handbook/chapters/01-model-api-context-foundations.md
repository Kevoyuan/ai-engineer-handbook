# Chapter 01 · Model / API / Context Foundations

## Model, API, Context, Adaptation, and Inference Fundamentals

> Canonical semantic chapter. This chapter owns the durable model-level concepts that every production AI engineer needs before Retrieval, RAG, Agent, Eval, or Serving architecture. Interview prompts are downstream views of this knowledge, not the semantic source.

一个 AI 应用看起来可能只是：

~~~text
input
→ model API
→ output
~~~

但真正影响质量、延迟、成本、可控性与迁移风险的基础层至少包括：

~~~text
Tokenization
Context Budget
Transformer / Attention
Sampling
Embeddings
Post-training / Alignment
Prompting
Structured Output
Adaptation
Inference Phases
Caching
Model Selection
Evaluation
~~~

本章的目标不是训练一个基础模型，也不是替代 Chapter 10 的 Serving / Platform 深入内容，而是回答：

> **When an AI engineer chooses, prompts, adapts, calls, evaluates, and migrates a model, what model-level mechanics and contracts must be understood?**

---

## 1.1 从字符串到下一个 Token：LLM 生成到底发生了什么

一个典型 autoregressive language model 的生成循环可以抽象为：

~~~text
Text / Messages
      ↓
Tokenizer
      ↓
Token IDs
      ↓
Token + Position Representation
      ↓
Transformer Blocks
      ↓
Logits over vocabulary
      ↓
Sampling / Selection
      ↓
Next Token
      └──────────────→ repeat
~~~

这里最重要的工程事实不是“模型一次生成一段完整答案”，而是：

> **Autoregressive generation repeatedly predicts the next token conditioned on the tokens already available in context.**

Transformer 本身主要负责把当前 token sequence 转成 contextual representation；最终输出层给 vocabulary 中每个候选 token 一个 logit，再由 decoding / sampling policy 决定下一个 token。

### Prefill vs Decode

在线生成通常要区分两个计算阶段：

~~~text
PREFILL
input tokens are processed together
→ build contextual activations / KV cache
→ determines much of TTFT

DECODE
generate token 1
→ token 2
→ token 3
→ ...
→ reuse previous KV states
~~~

因此：

~~~text
long input
→ larger prefill cost

long output
→ more sequential decode steps
~~~

这也是为什么：

- “输入特别长”主要影响 Prefill / TTFT；
- “输出特别长”往往直接拖慢总响应时间；
- KV cache 的主要价值是避免 decode 时重复计算历史 token 的 Key / Value projection；
- Prefix / Prompt Cache 的主要价值是跨请求复用相同或兼容前缀的 Prefill 工作。

KV cache、Prefix Cache、batching、capacity 与 serving engine 的实现细节由 Chapter 10 继续负责。

> **Prefill and Decode are different performance regimes; diagnose them separately.**

---

## 1.2 Transformer 需要理解到什么程度

生产 AI Engineer 不一定需要手推全部矩阵微分，但至少应该理解：

~~~text
tokens
→ representations
→ repeated attention + feed-forward transformations
→ output logits
~~~

以及 Attention 的基本结构：

~~~text
Attention(Q, K, V)
= softmax(QKᵀ / √dₖ) V
~~~

直觉：

- **Q (Query)**：当前位置在找什么；
- **K (Key)**：每个位置提供什么匹配特征；
- **V (Value)**：匹配后真正聚合什么信息；
- QKᵀ 是 compatibility score；
- √dₖ scaling 控制数值尺度；
- softmax 把 score 转成归一化权重；
- 权重再聚合 V。

这并不意味着 Attention 在做“数据库查询”或“事实验证”。它是在当前网络表征空间中计算 token 之间的依赖。

### 1.2.1 Encoder-only、Decoder-only、Encoder–Decoder

三类结构的核心差异之一是 **Attention Mask / information flow**：

| Family | Token visibility | Typical shape | Common use |
|---|---|---|---|
| Encoder-only | bidirectional | whole sequence representation | classification · embedding · token labeling |
| Decoder-only | causal / left-to-right | next-token generation | general-purpose autoregressive LLMs |
| Encoder–Decoder | encoder bidirectional + decoder causal + cross-attention | conditional sequence generation | translation · summarization · seq2seq |

需要修正一个常见面试简化：

~~~text
"generation uses decoder-only"
~~~

不是普遍规律。

Encoder–Decoder 模型也可以做生成；更准确的是：

> **Decoder-only architectures dominate many general-purpose LLMs because causal next-token modeling scales naturally to open-ended generation, but generation is not exclusive to decoder-only models.**

### 1.2.2 Position：模型不仅需要知道“是什么 Token”，还要知道“在哪里”

Attention 本身没有天然顺序概念，因此模型需要 position information。

RoPE（Rotary Position Embedding）是一种常见方案：通过对 Q/K 表征做与位置相关的旋转，把 relative-position dependency 带入 attention score。

需要避免过度表述：

~~~text
RoPE
≠
"模型一定可以无限外推到训练长度之外"
~~~

RoPE 提供了良好的相对位置结构与长度灵活性，但实际 context extrapolation 仍受训练分布、scaling 方法、模型架构和 inference implementation 影响。

> **Positional representation enables order; long-context reliability still requires evaluation.**

### 1.2.3 Pre-Norm vs Post-Norm

LayerNorm / RMSNorm 放在 residual block 的不同位置，会影响优化稳定性。

一个可用的工程直觉：

~~~text
Pre-Norm
→ residual path is easier for gradients to traverse
→ historically improved stability for deep Transformers

Post-Norm
→ normalization after residual combination
→ can require more careful optimization at depth
~~~

但不要记成：

~~~text
all large models = Pre-Norm + LayerNorm
~~~

现代模型可能使用 RMSNorm、modified residual path、sandwich / hybrid normalization 或其他变体。

### 1.2.4 FlashAttention：改变实现，不改变 Attention 定义

标准 Attention 的主要工程瓶颈不只来自 FLOPs，还来自 HBM ↔ SRAM 的 memory traffic。

FlashAttention 的核心贡献是：

~~~text
tile Q / K / V
→ compute blocks in fast on-chip memory
→ maintain online softmax statistics
→ avoid materializing the full N × N score matrix in HBM
~~~

它是 **IO-aware exact attention algorithm**。

因此：

> **FlashAttention changes how exact attention is computed efficiently; it does not replace attention with an approximate semantic shortcut.**

---

## 1.3 Tokenization：Token 不是“单词”

Token 可以是：

~~~text
whole word
subword
character-like unit
byte / byte sequence
punctuation
whitespace-sensitive fragment
code fragment
~~~

具体划分由 tokenizer / vocabulary 决定。

因此：

~~~text
"one word = one token"
"one Chinese character = one token"
"4 characters = one token"
~~~

都不能当作通用工程规则。

### 为什么 AI Engineer 必须关心 Tokenization

Token 数量直接影响：

~~~text
context capacity
input billing
output billing
prefill work
decode length
cache identity
truncation risk
chunk size
structured-output budget
~~~

并且 tokenizer 会影响：

- 多语言文本的相对成本；
- code / JSON / identifiers 的切分；
- prompt prefix 是否 token-level compatible；
- context migration 时“相同字符数”是否仍然代表相同 token 数。

生产环境应该：

~~~text
exact target model / tokenizer
→ count tokens
→ budget input + reserved output
~~~

而不是依赖固定字符比例估算。

> **Characters are a UI quantity; tokens are a model-runtime quantity.**

---

## 1.4 Context Window：容量不等于有效利用率

Context Window 通常限制一次 inference 中模型可以处理的 token 范围。

但工程上必须区分：

~~~text
advertised context capacity
≠
usable application context
≠
reliably attended evidence
~~~

一个请求的 Context Budget 可能被这些内容共同占用：

~~~text
System / Developer Instructions
Tool Definitions
Conversation History
Working State
Memory
Retrieved Documents
Examples
User Input
Intermediate Artifacts
Reserved Output / Reasoning Budget
~~~

因此不要把 model context limit 全部分给 RAG 文档。

### 1.4.1 Context Overflow 时先问：什么信息真的必须同时出现？

常见手段：

| Technique | Benefit | Cost / Failure mode |
|---|---|---|
| Rerank / reduce top-k | 删除低价值 context | 可能漏掉 evidence |
| Dedup | 去掉重复信息 | 需要 robust similarity / identity |
| Query decomposition | 每一步只看局部 context | 增加调用与 orchestration |
| Compression | 降 token | 可能丢 constraint / provenance |
| Structured state | 把状态从 transcript 中抽离 | 需要 schema / update policy |
| Map–reduce / staged synthesis | 分片处理长输入 | 跨分片关系可能丢失 |
| External retrieval | 按需取证 | 多一层 retrieval failure |
| Larger context model | 降低即时裁剪压力 | cost / latency / reliability 仍需 eval |

### 1.4.2 Lost in the Middle

研究表明，在一些长上下文任务和模型上，相关信息所处位置会显著影响性能；相关信息在 context 中部时可能比出现在开头或结尾更难被可靠利用。

正确工程结论不是：

~~~text
"永远把最重要文档放两头"
~~~

而是：

~~~text
target model
× target context length
× prompt layout
× evidence position
→ evaluate
~~~

可以测试：

~~~text
same evidence
position = beginning / middle / end
→ compare task success / citation support / retrieval-to-answer use
~~~

> **A long context window is capacity; evidence utilization is an empirical property.**

---

## 1.5 Sampling：Temperature、Top-p 与“确定性”

模型先产生 vocabulary logits，再从 distribution 中选择 token。

### Temperature

Temperature 调整 logits 的相对 sharpness：

~~~text
lower temperature
→ distribution sharper
→ less sampling diversity

higher temperature
→ distribution flatter
→ more sampling diversity
~~~

### Top-p / Nucleus Sampling

Top-p 先选择累计概率质量达到阈值 p 的候选集合，再在集合中采样。

因此：

~~~text
temperature
→ reshape distribution

top_p
→ truncate candidate probability mass
~~~

一些 API（例如当前 OpenAI Responses API）建议通常调整其中一个，而不是同时随意调整两个；这是 provider guidance，不是概率论硬规则。

### Temperature = 0 不等于“不会幻觉”

低温 / greedy-like decoding 可以降低 sampling variance，但不会自动修复：

~~~text
missing knowledge
wrong retrieval
ambiguous instructions
bad tool result
incorrect reasoning
stale facts
policy violation
~~~

而且：

~~~text
temperature = 0
≠
bit-for-bit reproducibility across every backend / model version
~~~

生产“确定性”应该来自：

~~~text
structured contract
+ fixed versions where possible
+ deterministic code paths
+ bounded model choices
+ eval
+ validation
~~~

不是只靠 Temperature。

> **Sampling controls variability; it does not create truth.**

---

## 1.6 Embeddings：Semantic Similarity 不是 Correctness

Embedding 把对象映射为 vector：

~~~text
text / item
→ embedding model
→ vector ∈ Rᵈ
~~~

向量之间的距离 / 相似度可以用于：

~~~text
semantic search
clustering
recommendation
classification by similarity
dedup / anomaly detection
~~~

### 1.6.1 Dot Product 与 Cosine

Dot product：

~~~text
x · y
= ||x|| ||y|| cos θ
~~~

同时受到：

~~~text
direction similarity
+
vector magnitude
~~~

影响。

Cosine similarity：

~~~text
cos(x, y)
= (x · y) / (||x|| ||y||)
~~~

只保留方向关系。

因此如果 embedding vectors 已经 L2-normalized：

~~~text
||x|| = ||y|| = 1
→ dot product = cosine similarity
~~~

当前 OpenAI embedding 文档明确说明其 API embedding 输出归一化到 length 1，因此 cosine 与 dot-product ranking 可等价；这是该 provider / embedding family 的实现事实，不应推广成所有 embedding 模型的必然属性。

### 1.6.2 Attention 的 Dot Product ≠ Retrieval 的“语义相似度定义”

两者都可能使用 dot product，但语义不同：

~~~text
Attention QKᵀ
→ token-to-token compatibility inside a learned network
→ scaled by √dₖ
→ followed by softmax

Embedding retrieval
→ vector similarity between separately encoded items
→ may use cosine / dot / L2 / learned reranker
~~~

### 1.6.3 为什么 Vector Search 会召回“相关但错误”

Embedding 通常擅长：

~~~text
topic similarity
paraphrase
semantic neighborhood
~~~

但可能混淆：

~~~text
refund vs cancel
enable vs disable
version 2 vs version 3
positive vs negative condition
same entity, wrong date
same topic, wrong jurisdiction
~~~

所以：

> **Semantic similarity is candidate generation, not evidence sufficiency or action correctness.**

修复路径通常是：

~~~text
Authorization / Metadata Filter
→ Exact / Lexical / Dense Hybrid
→ Candidate Retrieval
→ Rerank / Constraint Check
→ Evidence Validation
~~~

详细 Retrieval 设计由 Chapter 02 / 03 负责。

---

## 1.7 Base、Instruct 与 Post-training：不要把“模型类型”压成一个标签

### Base Model

Base language model 的核心训练目标通常接近：

~~~text
predict next token
~~~

它学到广泛统计结构与世界知识，但不天然意味着：

~~~text
follow user instruction
refuse unsafe request
format answer as requested
use a tool correctly
maintain conversation policy
~~~

### Instruct / Post-trained Model

Instruction-following models 会在 pretraining 之后继续做 post-training，例如：

~~~text
Supervised Fine-Tuning
Preference Data
Reward Modeling
RL-based Optimization
Direct Preference Optimization
Safety / Policy Training
~~~

具体 pipeline 因模型提供商和 generation 不同，不应把：

~~~text
"instruct = RLHF"
~~~

写成通用定义。

> **Base describes pretraining behavior; instruct/aligned describes additional behavioral adaptation, not one universal algorithm.**

### 1.7.1 经典 RLHF、DPO 与 GRPO

一个经典 preference-alignment pipeline：

~~~text
SFT
→ preference data
→ reward model
→ PPO-style policy optimization
→ KL / reference control
~~~

DPO 的关键简化是：在特定 preference modeling 假设下，把 reward-model + RL optimization 改写成直接的 preference classification-like objective，从而不需要单独训练 reward model 再跑 PPO。

这不等于：

~~~text
DPO always > PPO
or
preference optimization cannot reward-hack
~~~

它们仍需要：

~~~text
representative preference data
held-out eval
factual / safety gates
distribution-shift monitoring
~~~

原始 DeepSeekMath 的 GRPO 则通过同一 prompt 下的一组 sampled outputs 建立 group-relative baseline / advantage，避免 PPO 中单独的 critic / value model。

需要带版本边界：

> **“GRPO” is now a family label in practice; always verify the exact objective used by the implementation or paper being discussed.**

### 1.7.2 Reward Proxy 与真实目标会分离

如果：

~~~text
preference win-rate ↑
but factual QA ↓
~~~

不能只庆祝 reward metric。

可能发生：

~~~text
proxy over-optimization
distribution shift
judge bias
style preference dominating factuality
reference drift
training-data imbalance
~~~

因此 Post-training Eval 必须是多目标：

~~~text
preference
+
factuality
+
task success
+
safety
+
format correctness
+
calibration
~~~

> **A model can become more preferred while becoming less correct on a protected capability.**

---

## 1.8 Hallucination：模型优化的是概率，不是真实数据库一致性

“Hallucination”不是一个单一 failure mode。

常见来源：

~~~text
1. Parametric knowledge missing / stale
2. Prompt underspecified
3. Retrieval missing or contradictory
4. Context contains irrelevant or adversarial evidence
5. Tool result is wrong / stale / misread
6. Model makes unsupported inference
7. Decoder chooses plausible continuation
8. Application asks model to answer when it should abstain
~~~

一个语言模型通常优化的是 training objective 下的 token likelihood / preference objective，而不是运行时事实数据库的一致性。

因此：

> **Plausibility is native to generation; truthfulness must be engineered with evidence, constraints, verification, and abstention.**

### 三类常见 mitigation 与代价

#### A. Grounding / Retrieval

~~~text
retrieve trusted evidence
→ answer from evidence
→ cite / verify
~~~

代价：

~~~text
retrieval latency
index / data maintenance
context tokens
retrieval failure
~~~

#### B. Constrain Scope + Abstention

~~~text
insufficient evidence
→ do not guess
→ clarify / refuse / human escalate
~~~

代价：

~~~text
coverage decreases
false refusal risk
needs calibrated threshold / policy
~~~

#### C. Verification / Tool / Secondary Check

~~~text
draft
→ deterministic check / external source / verifier
→ accept / repair / reject
~~~

代价：

~~~text
extra latency
extra cost
new verifier failure mode
~~~

Structured Output 只解决 shape，不解决 truth。

Temperature 只改变 sampling，不解决 evidence sufficiency。

详细 RAG reliability 与 selective answering 由 Chapter 04 / 05 负责。

---

## 1.9 Prompting vs RAG vs Fine-tuning：先诊断 Failure Type

“让模型知道我们的文档”不是一个技术方案。

先问：

~~~text
What exactly is failing?
~~~

### Prompting

适合：

~~~text
instruction
task decomposition
style
output format
few-shot examples
temporary task context
~~~

不适合承担：

~~~text
large dynamic knowledge base
frequently changing private facts
strong provenance requirement
~~~

### RAG / External Context

适合：

~~~text
dynamic knowledge
private / tenant-scoped facts
large corpora
provenance
freshness
selective retrieval
~~~

风险：

~~~text
retrieval miss
ranking error
context noise
permission bug
stale index
~~~

### Fine-tuning / Adaptation

适合学习：

~~~text
repeated behavior
task style
domain pattern
classification boundary
output convention
instruction-following behavior
~~~

通常不应该作为第一选择来“记住每周变化的文档事实”。

风险：

~~~text
training cost
data quality
regression
model lifecycle
base-model deprecation
hard-to-update facts
~~~

### Decision Framework

~~~text
Failure = instruction / behavior?
→ Prompt / Few-shot first

Failure = missing dynamic knowledge?
→ Retrieval / Tool / External Context

Failure = repeated stable behavior gap at scale?
→ consider Fine-tuning / Adaptation

Failure = capability ceiling?
→ stronger / specialized model or architecture change

Failure = latency / cost?
→ smaller model / routing / distillation / caching / adaptation
~~~

这些不是互斥的：

~~~text
Prompt
+ RAG
+ Tool
+ Fine-tuned model
~~~

可以共同存在。

> **Use prompting to specify behavior, retrieval to supply changing evidence, and fine-tuning to change repeated model behavior—not to replace a data system.**

---

## 1.10 Fine-tuning、LoRA、QLoRA、Quantization、Distillation

### 1.10.1 Few-shot vs Fine-tuning

不存在跨任务通用的：

~~~text
N examples → fine-tuning definitely wins
~~~

应先建立 baseline 与 eval。

一个稳健顺序：

~~~text
Prompt baseline
→ Few-shot baseline
→ Representative Eval
→ Fine-tune candidate
→ Compare quality / cost / latency / robustness
→ Release gate
~~~

当前 OpenAI SFT 文档给出的 provider-specific 经验是：某些任务可以从 50–100 个高质量 examples 开始看到改善，并建议先从约 50 个 well-crafted demonstrations 评估；这个数字只能作为某个平台 / 模型家族的经验起点，不是行业定律。

而且该平台本身在 2026-10 已处于 winding-down 状态，所以 Handbook 不把其 availability 当作 durable architecture rule。

> **Fine-tuning data quality and task coverage matter more than memorizing a universal sample-count threshold.**

### 1.10.2 Full Fine-tuning vs LoRA

Full Fine-tuning：

~~~text
update many / all model parameters
→ maximum adaptation freedom
→ high optimizer / gradient / checkpoint cost
~~~

LoRA：

~~~text
freeze pretrained weights
+ train low-rank update matrices
→ far fewer trainable parameters
~~~

LoRA 的价值主要是 Parameter-Efficient Fine-Tuning，不是“压缩模型本体”。

### 1.10.3 QLoRA

QLoRA：

~~~text
quantized frozen base model
+
LoRA adapters
+
backprop through quantized representation
~~~

原始 QLoRA 工作使用 4-bit quantized pretrained model + LoRA adapters，以显著降低 fine-tuning memory。

但：

~~~text
4-bit weights
≠
total training memory exactly 1/4
~~~

因为总内存还包括：

~~~text
activations
adapter weights
optimizer state
temporary buffers
KV / batch-related memory
~~~

### 1.10.4 Quantization vs Distillation

Quantization：

~~~text
same model family / weights
→ lower numeric precision
→ less memory bandwidth / footprint
→ possible quality degradation
~~~

Distillation：

~~~text
teacher behavior / targets
→ train smaller student
→ potentially much lower inference cost
→ requires training + coverage design
~~~

固定 latency / cost budget 下：

~~~text
measure baseline
→ quantize
→ evaluate quality slices
→ if architecture still too expensive:
   distill / route / smaller model
→ optionally quantize student
~~~

不要只看平均 benchmark；要看 hardest / high-risk slice。

---

## 1.11 Structured Outputs：Schema Correct ≠ Semantically Correct

生产应用经常需要：

~~~text
free text
→ typed object
~~~

控制层次可以粗略分为：

~~~text
Prompt-only JSON
→ JSON mode
→ Structured Output / constrained decoding
→ application validation
→ business validation
~~~

当前 OpenAI Structured Outputs 在支持的 API / schema subset 上可以通过 strict: true 约束输出遵循 supplied JSON Schema；当前官方文档也明确区分 JSON Mode 与 Structured Outputs：

~~~text
JSON Mode
→ valid JSON

Structured Outputs
→ schema adherence
~~~

但即使 schema 完全正确：

~~~json
{
  "approved": true,
  "amount": 1000000
}
~~~

也可能业务上完全错误。

因此：

> **Syntax validity is not semantic validity, and semantic validity is not authorization.**

完整执行链：

~~~text
Model Output
→ Schema Validation
→ Semantic / Business Validation
→ Permission / Risk Gate
→ Host Execution
→ Result Validation
~~~

这与 Chapter 06 的 canonical rule 一致：

> **The model proposes; the host executes.**

### Constrained Decoding vs Validate-and-Retry

高流量场景下要比较：

~~~text
constrained decoding cost / support limits
vs
retry probability × model cost × tail latency
~~~

常见组合：

~~~text
constrain structure when supported
+
always validate business semantics
+
bounded repair / retry for recoverable failure
~~~

副作用动作不能因为 schema valid 就直接执行。

---

## 1.12 Latency：先拆链路，再谈“模型慢”

End-to-end latency 可能包括：

~~~text
Client / Network
→ Gateway
→ Queue
→ Tokenization / Prompt Assembly
→ Retrieval / Tool pre-step
→ Prefill
→ First Token
→ Decode
→ Tool call(s)
→ Post-validation
→ Final delivery
~~~

至少区分：

~~~text
TTFT
= time to first token / first visible output

Decode speed
= tokens per second after generation begins

Total latency
= full task completion time
~~~

### 五类高价值优化杠杆

#### 1. Generate Fewer Tokens

输出 token 是 sequential decode work。

~~~text
shorter answer
structured concise output
stop early
~~~

通常能直接降低总 latency 与 cost。

#### 2. Use a Faster / Smaller Model where Quality Allows

需要：

~~~text
quality floor
+ router / cascade
+ regression eval
~~~

而不是直接替换所有流量。

#### 3. Reduce Unnecessary Input

~~~text
rerank
dedup
compress
remove dead examples
route trivial requests away from RAG
~~~

输入超长时尤其影响 Prefill。

#### 4. Fewer Sequential Requests / Parallelize Independent Work

~~~text
A → B → C
~~~

如果不需要真实依赖，就不应该机械串行。

#### 5. Cache / Reuse

包括：

~~~text
application cache
prompt / prefix cache
retrieval cache
tool-result cache
compiled artifact cache
~~~

不同 cache 的 correctness boundary 不同。

### Streaming 的正确定位

Streaming 可以显著改善：

~~~text
perceived latency
time-to-visible-progress
~~~

但：

> **Streaming can improve user wait perception without reducing total model compute or task completion latency.**

---

## 1.13 Prompt / Prefix Caching：复用的是前缀工作，不是“模型记住了你”

当前 OpenAI Prompt Caching 文档描述的核心行为是：

~~~text
requests share the same prompt prefix
→ provider can reuse prior prefix processing
→ reduce input processing latency / cached-input cost
~~~

因此 prompt layout 会影响 cache hit：

~~~text
stable system instructions
stable tool schemas
stable long reference prefix
dynamic user / retrieval content later
~~~

更容易形成 reusable prefix。

需要区分：

~~~text
Client-side application cache
→ caches data / assembled prompt / result at application layer

Provider prompt / prefix cache
→ reuses model-side processing of matching prefix

KV cache within one generation
→ reuses past K/V during autoregressive decode

Semantic cache
→ reuses answers / tool results for semantically similar requests
~~~

它们不是同一个机制。

> **Cache identity and invalidation are correctness problems, not only performance tricks.**

详细 Prefix Cache / KV Cache 与 multi-tenant isolation 由 Chapter 10 负责。

---

## 1.14 Model Selection：不要只按“最聪明”排序

Model Selection 是 multi-objective engineering decision。

至少看：

~~~text
Task quality
Reasoning depth
Modality
Tool / structured-output support
Context behavior
Latency
Throughput
Input / Output cost
Hosting model
Data residency
Privacy
Safety / policy behavior
Version lifecycle
Vendor concentration
Fine-tuning / adaptation options
~~~

一个模型在 benchmark 上更强，不代表：

~~~text
your task success is higher
your tail latency is acceptable
your schema adherence is better
your tool behavior is safer
your total cost per success is lower
~~~

因此：

> **Select a model against the task contract and production constraints, not against a single leaderboard.**

### API vs Self-host Open Weights

Self-host 决策不能只比较：

~~~text
API token price
vs
GPU hourly price
~~~

还要算：

~~~text
GPU utilization
capacity headroom
autoscaling
serving software
on-call / SRE
security
model loading / upgrades
observability
batching / queueing
data governance
availability
quality gap
migration cost
~~~

真正的经济指标：

~~~text
total platform cost
/
successful production tasks
~~~

而不是“GPU 买下来就免费”。

---

## 1.15 Eval：模型变化之前先定义“不允许退化什么”

任何下面变化：

~~~text
Prompt
Model
Model Version
Tokenizer
Tool Schema
RAG Index
Fine-tune Dataset
Sampling Config
Structured-output Schema
Serving Runtime
~~~

都可能改变系统行为。

因此 baseline 需要被版本化：

~~~text
Task Dataset
+ Slice Definitions
+ Evaluators
+ Model / Prompt / Tool / Knowledge Versions
+ Latency / Cost Budget
+ Safety Gates
~~~

### Model Migration / Deprecation

迁移流程：

~~~text
Current Production Version
       ↓ replay
Candidate Version
       ↓
Per-example diff
       ↓
Slice metrics
       ↓
Tool / schema compatibility
       ↓
Latency / cost comparison
       ↓
Shadow / Canary
       ↓
Ship / Hold / Rollback
~~~

特别要观察：

~~~text
task success
refusal behavior
structured-output adherence
tool-selection drift
citation / grounding
safety
latency
cost
~~~

### “模型变差了，但我们什么都没改”怎么查

“我们没改代码”不等于系统没有变化。

检查：

~~~text
model alias / provider version
prompt template
system instructions
tool registry
retrieval index
knowledge snapshot
traffic mix
user language / domain drift
sampling config
cache behavior
dependency / API
judge / eval definition
~~~

先用 frozen cases replay，再和 production trace 分层对比。

> **Model behavior is a versioned dependency; treat migration like a production release.**

详细 Evaluation、LLM-as-Judge、Release Gate、Monitoring 与 A/B Test 由 Chapter 09 负责。

---

## 1.16 LLM-as-Judge：可扩展判断，不是 Ground Truth

LLM-as-Judge 适合：

~~~text
semantic correctness rubric
style / professionalism
pairwise preference
groundedness review
handoff quality
~~~

但存在：

~~~text
position bias
verbosity bias
self-preference
reference leakage
prompt sensitivity
judge-version drift
~~~

因此需要：

~~~text
Human-labeled calibration set
→ run judge
→ compare agreement / error slices
→ revise rubric
→ freeze judge version
→ monitor drift
~~~

如果可以写 deterministic function 判断，就优先 code-based evaluator。

> **A judge scales judgment; it does not eliminate uncertainty.**

Chapter 09 owns the full Eval architecture.

---

## 1.17 Precision vs Recall：不是选指标，而是定义错误成本

对于 binary classifier：

~~~text
Precision
= TP / (TP + FP)

Recall
= TP / (TP + FN)
~~~

“高风险合同条款检测应该优化 Recall”通常只是第一层答案。

真正问题：

~~~text
What is the cost of a false negative?
What is the cost of a false positive?
Who reviews flagged cases?
Can threshold change by risk slice?
~~~

例如：

~~~text
miss a dangerous clause
→ potentially high legal risk

flag too many benign clauses
→ human review load increases
~~~

因此可设计：

~~~text
risk-sensitive threshold
→ high-risk clause family: recall-first
→ low-risk clause family: balanced
→ human-review capacity constraint
→ precision / recall curve
→ business cost
~~~

> **Choose thresholds from error economics, not from metric ideology.**

---

## 1.18 Long Context vs RAG vs Prompt Cache：三者解决不同问题

它们经常被放在一起比较，但不是同一维度。

| Mechanism | Main problem solved | Main risk |
|---|---|---|
| Long Context | “一次能放多少信息” | cost · latency · utilization quality |
| RAG | “从大知识空间选哪些 evidence” | retrieval miss · stale / unauthorized evidence |
| Prompt / Prefix Cache | “重复 prefix 是否需要重新计算” | cache miss · invalidation · isolation |

因此：

~~~text
Long Context
can still use RAG

RAG
can still benefit from Prompt Cache

Prompt Cache
does not improve factual relevance by itself
~~~

> **Capacity, selection, and reuse are separate design axes.**

---

## 1.19 Interview Topic Ownership：52 道题不应该全部塞进 Chapter 01

用户提供的公开 fdeinterviews.com/llm-genai.md 包含 52 道 LLM / GenAI interview prompts，但问题跨越整个 Handbook。

Canonical ownership：

| Questions | Primary canonical owner |
|---|---|
| Q1–Q12 | Chapter 01 + Chapter 02/03 for retrieval-specific parts |
| Q13 | Chapter 02 / 03 |
| Q14–Q16 | Chapter 01 + Chapter 04 |
| Q17 | Chapter 06 |
| Q18 | Chapter 01 + Chapter 06 |
| Q19 | Chapter 08 |
| Q20–Q24 | Chapter 01 + Chapter 09/10 |
| Q25–Q27 | Chapter 09 |
| Q28 | Chapter 10 + Chapter 09 |
| Q29–Q31 | Chapter 01 + Chapter 10 |
| Q32 | Chapter 04 / 05 |
| Q33–Q35 | Chapter 08 |
| Q36 | Chapter 09 |
| Q37 | Chapter 10 + Chapter 09 |
| Q38 | Chapter 09 |
| Q39–Q41 | Chapter 01 + Chapter 10 |
| Q42 | Chapter 06 + Chapter 09 |
| Q43 | Chapter 09 + Chapter 10 |
| Q44–Q49 | Chapter 01 |
| Q50–Q52 | Chapter 10 + Chapter 01 baseline |

因此 interview archive 可以保留逐题答题卡，但 durable knowledge 应继续由对应 canonical chapter 拥有。

---

## 1.20 常见“面试速记”需要收紧的地方

### “Temperature 0 = deterministic”

更准确：

> Lower sampling variance; not a universal guarantee of identical outputs or correctness.

### “Context window 越大，RAG 越不需要”

错误。

> Long context increases capacity; RAG still solves selection, freshness, permission, and provenance.

### “Embedding cosine 越高，就越正确”

错误。

> Similarity ranks semantic neighborhood; correctness requires constraints and evidence validation.

### “Fine-tuning 可以让模型记住公司最新文档”

通常不是最佳首选。

> Dynamic facts belong in retrievable / queryable external sources.

### “Structured Output = 不会出错”

错误。

> Schema adherence controls shape, not truth or permission.

### “Decoder-only 才能生成”

错误。

> Encoder–Decoder models also generate; decoder-only dominates many open-ended LLMs.

### “RoPE 天然支持无限长 Context”

错误。

> RoPE gives useful relative-position structure; extrapolation remains empirical.

### “4-bit = 总内存正好减少 4×”

错误。

> Weight precision is only one part of total runtime / training memory.

### “GRPO = PPO 去掉 value model”

方向接近，但要带实现边界。

> Original GRPO uses group-relative reward statistics to avoid a separate critic; later GRPO-family implementations vary.

### “KV Cache 让整个 Decode 从 O(n²) 变成 O(n)”

过度简化。

KV cache 避免对历史 token 的 K/V projection 和历史 hidden-state computation 做重复工作；但当前 token 仍要 attend over growing cached sequence，因此每一步 attention work 随 context length 增长，整个 sequence 的 attention accumulation 仍不是常数成本。

> **KV cache removes massive recomputation; it does not make long-sequence attention free.**

---

## 1.21 Source boundary · FDE LLM / GenAI question bank

Primary source:

- interview-prep-guides/fdeinterviews.com/llm-genai.md
- https://github.com/interview-prep-guides/fdeinterviews.com/blob/main/llm-genai.md

The public Markdown contains:

~~~text
52 interview questions
difficulty labels
reported-company labels
short answer teasers
links to fdeinterviews.com answer pages
~~~

It does **not** contain the full expert answers.

Therefore this chapter does not copy or reconstruct locked answer content. The question bank is used only as:

~~~text
coverage checklist
→ identify durable concepts
→ answer independently
→ verify externally
→ assign canonical owner
~~~

### Source-derived themes retained

- generation / Transformer / Tokenization / Context Window；
- Temperature / Top-p；
- Embeddings / Dot Product / Cosine；
- Base vs Instruct；
- Hallucination；
- Precision / Recall；
- Prompt vs RAG vs Fine-tuning；
- long-context overflow / Lost in the Middle；
- tool / structured-output failure；
- latency / prompt caching / cost；
- model migration / privacy / eval；
- LoRA / Quantization / self-host；
- RLHF / DPO / GRPO；
- RoPE / normalization / FlashAttention；
- KV / Prefix Cache。

### Handbook corrections / synthesis

- 不采用题库 teaser 中的任何未验证 rough number / 固定性能倍率作为 canonical fact；
- 不把 company labels / difficulty labels 当作可验证招聘统计；
- Temperature 0 不等于 truth 或绝对 deterministic；
- Context capacity 不等于 long-context evidence utilization；
- Decoder-only 不是唯一 generation architecture；
- RoPE 不保证无限 context extrapolation；
- Fine-tuning sample count 不存在跨任务 universal threshold；
- 4-bit weights 不代表 total memory 恰好缩小 4×；
- Structured Output 保证结构约束时，仍需 semantic / business / authorization validation；
- Prompt Cache、KV Cache、application cache、semantic cache 明确分层；
- Original GRPO 与后续同名变体区分；
- KV cache 的复杂度收益不压成错误的 “O(n²) → O(n) everywhere”。

### External verification · 2026-10-04

Primary / first-party or original research sources:

- Vaswani et al., **Attention Is All You Need**
  - https://arxiv.org/abs/1706.03762
- Liu et al., **Lost in the Middle**
  - https://arxiv.org/abs/2307.03172
- Su et al., **RoFormer / RoPE**
  - https://arxiv.org/abs/2104.09864
- Dao et al., **FlashAttention**
  - https://arxiv.org/abs/2205.14135
- Hu et al., **LoRA**
  - https://arxiv.org/abs/2106.09685
- Dettmers et al., **QLoRA**
  - https://arxiv.org/abs/2305.14314
- Rafailov et al., **DPO**
  - https://arxiv.org/abs/2305.18290
- Shao et al., **DeepSeekMath / original GRPO**
  - https://arxiv.org/abs/2402.03300
- OpenAI API docs · Structured Outputs
  - https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI API docs · Prompt Caching
  - https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI API docs · Latency Optimization
  - https://developers.openai.com/api/docs/guides/latency-optimization
- OpenAI API docs · Embeddings
  - https://developers.openai.com/api/docs/guides/embeddings
- OpenAI API docs · Supervised Fine-tuning
  - https://developers.openai.com/api/docs/guides/supervised-fine-tuning
- OpenAI API docs · Evaluation Best Practices
  - https://developers.openai.com/api/docs/guides/evaluation-best-practices

---

## Canonical rules

> **Autoregressive generation predicts one next token at a time; Prefill and Decode have different performance characteristics.**

> **Characters are a UI quantity; tokens are a model-runtime quantity.**

> **A long context window is capacity; evidence utilization is empirical.**

> **Sampling controls variability; it does not create truth.**

> **Semantic similarity is candidate generation, not correctness.**

> **Use prompting to specify behavior, retrieval to supply changing evidence, and fine-tuning to change repeated model behavior.**

> **Syntax validity is not semantic validity, and semantic validity is not authorization.**

> **Streaming can reduce perceived wait without reducing total task compute.**

> **Cache identity and invalidation are correctness problems, not only performance tricks.**

> **Select a model against the task contract and production constraints, not against a single leaderboard.**

> **Model behavior is a versioned dependency; treat migration like a production release.**

> **Capacity, selection, and reuse are separate design axes.**

> **Optimize cost per successful task, not price per token or GPU hour.**

 
## 1.21 FDE ML foundations · 从优化机制到数据泄漏（Q24–Q29）

> **独立研究边界 · 2026-10-08：** 这些题目是根据 [FDEInterviews 公开 Concepts](https://www.fdeinterviews.com/concepts) 独立组织的问答，**不是付费答案**。下述算式和教学数据是通用数学与原创例子；PyTorch/scikit-learn 行为以所附一手文档为准。模型学习示意不等于实测训练实验。

### 1.21.1 Q24 · Gradient Descent & Learning Rate：loss 下降，为什么不保证验证集变好？

**面试结论。** Gradient descent 在当前参数处沿负梯度方向更新：θ(next) = θ - η∇L(θ)，其中学习率 η 调整步长。它直接最小化选择的训练目标，不自动最小化客户任务风险。学习率过大可能振荡/发散，过小可能慢；非凸问题无法一般保证全局最优。

- **优化层证据：** 看训练 loss、梯度范数、NaN、有效 batch size、学习率调度以及运行时的数值精度。
- **泛化层证据：** 用固定、独立的 validation 按数据来源/时间/客户切片分析；不能用 test set 调学习率。
- **工程选择：** 对知识过期导致的答错，先修 RAG/源数据；对模型输出格式或风格稳定性不足，才考虑有证据的微调。不要因为 loss 下降就宣布 production RAG 正确。
- **反例：** 在过去一周的重复订单上训练得到更小 loss，却在下周未见过的 carrier 格式上变差。源分布和抽样不是同一回事。

### 1.21.2 Q25 · Bias-Variance Tradeoff、Overfitting and Regularization：怎么诊断“线下 98%，线上 70%”？

**Bias–variance 是分析近似概念而非每种网络都可完全拆成一个单一数字。** 高偏差（欠拟合）常在训练集和验证集都差；高方差（过拟合）常表现为训练好、独立验证差。但离线线上差异还可能来自**数据泄漏、源端漂移、用户群切换、标签错误和授权过滤**，不能只凭两个百分数确诊。

| 根因假设 | 需要的证据 | 正确动作 |
|---|---|---|
| 欠拟合 / 高 bias | train、validation 均弱 | 检查标签和特征，再调容量/优化 |
| 过拟合 / 高 variance | train 好、同分布 holdout 差 | 数据覆盖、正则化、早停/模型复杂度 |
| 数据泄漏 | “未来”信息/同订单进入 train 和 test | 按时间、实体或客户划分；**先 split 后 fit preprocessing** |
| 分布/概念漂移 | 不同周/客户错误集中 | 时间窗/客群切片 + 版本归因 |

**关键反例：** 特征标准化若在全量数据上先 fit 再 train/test split，会把测试集统计信息泄漏给训练过程；scikit-learn 官方 Common Pitfalls 明确要求预处理参数只能在训练折里学习。时间序列则采用适合时间的数据分割与 gap，而不是随机打乱。正则化缓解过拟合，但**修不了泄漏**。

### 1.21.3 Q26 · Information Theory：Entropy、Cross-Entropy、KL、Perplexity 与数值稳定

- 熵 H(p) = -Σ p(x)log p(x)，刻画分布的不确定性（单位取决于对数底）。
- 交叉熵 H(p,q) = -Σ p(x)log q(x)：用模型 q 为目标分布 p 编码的平均代价。在常见分类训练中衡量目标与预测差异。
- KL(p||q) = Σ p(x)log[p(x)/q(x)] = H(p,q) - H(p)，**不对称**，不等于一种普通距离。
- 语言模型 perplexity = exp(平均以自然对数计的 token NLL)，需要相同 tokenization、样本和归约定义才适合对比。

**数值稳定：** 不要先手工算 exp(1000) 再除和，应该使用 log-sum-exp：
~~~~python
import math
def logsumexp(values):
    if not values:
        raise ValueError("empty logits")
    m = max(values)
    return m + math.log(sum(math.exp(v - m) for v in values))
~~~~
对多个类使用 logits 输入 PyTorch CrossEntropyLoss；二分类以 logits 输入 BCEWithLogitsLoss，而不是先 sigmoid 再不稳定地计算两个 log。PyTorch 文档明确指出后者组合使用了 log-sum-exp 技巧。**困惑度下降 ≠ grounded RAG 成功率必然上升**。

### 1.21.4 Q27 · Neural Network Basics, Activation Functions, Loss Functions, Batch vs Layer Normalization

从最小 MLP 出发：
~~~~text
features x → Linear(Wx+b) → activation(ReLU/GELU) → Linear
           → logits → task-specific loss → backprop/optimizer
~~~~

| 组件 | 作用 | 高频误解 |
|---|---|---|
| Linear / Perceptron → MLP | 学习特征的仿射映射与非线性组合 | 再堆 Linear 而无非线性仍只是仿射组合 |
| ReLU / GELU / sigmoid | 非线性激活、输出形状受任务影响 | sigmoid 不是所有网络的默认 hidden activation |
| CrossEntropyLoss | 多类目标，对原始 logits 求损失 | 不需要预先对 logits 做 softmax |
| BCEWithLogitsLoss | 二分类/multilabel 的稳定 logits 损失 | naive sigmoid + log 会数值不稳定 |
| BatchNorm | 依训练 batch 统计量；通常追踪运行统计用于 eval | 小批量分布变化可能影响行为 |
| LayerNorm | 沿指定特征维归一化（每样本），无需批间统计 | 不代表“所有归一化都相同” |

**选择原则：** 先搞清楚输出是什么——多类互斥、多个独立标签、回归还是 next-token prediction，再确定激活与 loss 的契约。batch/layer normalization 的轴、训练/推理状态不应凭直觉互换。

### 1.21.5 Q28 · Catastrophic Forgetting、Semi-Supervised / Self-Training：新客户微调会有什么风险？

**Catastrophic forgetting** 指顺序训练新任务后旧任务能力退化的现象；是否发生取决于模型、数据、训练设置，不是 fine-tuning 的必然定律。LoRA 等 PEFT 降低可训练参数量，**不能自动证明不遗忘**。必须在旧任务/新任务/越权拒绝/客户语言切片上保留回归测试。

**Semi-supervised learning** 混合少量标签和大量未标注样本；**self-training** 用模型为未标注样本生成伪标签再迭代。最大风险是错误自增强与分布偏差，尤其当低置信度数据被无差别回写。合格流程：隔离 test holdout → 过滤/校准伪标签 → 人工抽检高风险切片 → 评估新旧任务 → 按回归门禁决定是否推广。对于订单事实错误，应先追踪数据库和事件定义，**不是默认采取自训练**。

### 1.21.6 Q29 · Convex vs Non-Convex Optimization 与 Computer Vision 任务边界

凸优化目标在定义域为凸且满足凸性时，局部最优也是全局最优；一般深层网络是非凸问题，训练能取得有用解不表示有严格全局最优保证。对生产 AI Engineer，更实际的问题是优化器/损失是否稳定、泛化是否可信、数据契约是否正确。

Computer Vision 三种不同任务：**Classification** 输出图片类别；**Detection** 输出目标位置及类别；**Segmentation** 为像素分配标签/实例。文档影像 OCR/VLM 场景要选择与标注粒度一致的 metric（文档级准确率、bbox IoU、像素级 IoU、字段 exact match），不能拿图片分类 accuracy 代替表格抽取质量。

**Source boundary & follow-ups (reviewed 2026-10-08):**
- [scikit-learn Common Pitfalls and data leakage](https://scikit-learn.org/stable/common_pitfalls.html), [time-series split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html): preprocessing and evaluation separation.
- [PyTorch CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html), [BCEWithLogitsLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html), [LayerNorm](https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html), [BatchNorm1d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html): framework contracts.
- The mathematical distinctions and synthetic scenarios are handbook teaching synthesis. **No training experiment or production performance claim was made.**

**Ownership:** CH01 owns model/ML fundamentals. CH09 owns customer eval, metrics/calibration/experimental design. CH11 owns malformed data and time-aware SQL. The Python fixture at examples/fde-interview-engineering exercises deterministic algorithms, not a foundation-model training run.
