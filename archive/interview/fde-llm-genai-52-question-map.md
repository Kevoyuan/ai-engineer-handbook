# FDE LLM & GenAI · 52-Question Coverage Map

> Interview-only derivative view. Canonical engineering semantics live in Chapters 01–10.  
> Source basis: public GitHub file https://github.com/interview-prep-guides/fdeinterviews.com/blob/main/llm-genai.md  
> The public Markdown contains question prompts, difficulty labels, short teasers, and answer links—not the full expert answers. The answer keys below were independently derived and verified.

## How to use this card

For each question:

~~~text
Topic
→ 30-second answer skeleton
→ correction / trap
→ canonical owner
~~~

Do not memorize vendor-specific numbers unless the interview explicitly asks for a provider/version.

| # | Topic | Answer skeleton | Trap / correction | Canonical owner |
|---:|---|---|---|---|
| 01 | Generation lifecycle | tokenize → transformer → logits → sampling → next token; separate Prefill and Decode | model does not generate the whole answer in one shot | Ch01 §1.1 |
| 02 | Transformer end-to-end | representation → attention + FFN blocks → logits; know Q/K/V and residual/norm | attention is not a fact database | Ch01 §1.2 |
| 03 | Tokens | model-specific units that drive context, billing, prefill, decode and cache identity | no universal chars-per-token ratio | Ch01 §1.3 |
| 04 | Context window | capacity shared by instructions, tools, history, evidence and output reserve | advertised capacity ≠ reliable evidence utilization | Ch01 §1.4 |
| 05 | Temperature / top-p | temperature reshapes distribution; top-p limits candidate probability mass | temperature 0 ≠ truth or universal reproducibility | Ch01 §1.5 |
| 06 | Embeddings | encode items into vectors for semantic candidate retrieval | semantic similarity ≠ correctness | Ch01 §1.6 + Ch02 |
| 07 | Dot vs cosine | dot includes magnitude; cosine normalizes magnitude; normalized vectors make rankings equivalent | attention dot-product and retrieval similarity have different semantics | Ch01 §1.6 |
| 08 | Base vs instruct | base = pretrained continuation behavior; instruct = post-trained behavioral adaptation | instruct ≠ one universal RLHF recipe | Ch01 §1.7 |
| 09 | Hallucination | plausible continuation without sufficient grounded truth; classify source of failure first | “hallucination is random” is too shallow | Ch01 §1.8 |
| 10 | Precision vs recall | choose threshold from FP/FN business cost and review capacity | answer is not always simply “recall” | Ch01 §1.17 |
| 11 | Prompt vs RAG vs fine-tune | prompt for behavior; RAG for changing evidence; fine-tune for repeated behavior gaps | fine-tuning is not a dynamic knowledge store | Ch01 §1.9 |
| 12 | Context overflow | rerank, dedup, compress, structured state, decomposition, staged synthesis, larger context | first ask which information must coexist | Ch01 §1.4 + Ch07 |
| 13 | Related-but-wrong retrieval | dense search returns semantic neighbors; add metadata/exact/lexical/hybrid/rerank | cosine score is not evidence sufficiency | Ch02 / Ch03 |
| 14 | Hallucination mitigations | grounding; abstention/scope; external verification | each mitigation has latency/coverage/cost trade-offs | Ch01 §1.8 + Ch04 |
| 15 | Fine-tune vs few-shot | establish prompt baseline and eval; fine-tune only when repeated stable behavior gap justifies training | no universal example-count threshold | Ch01 §1.10 |
| 16 | Lost in the Middle | relevant evidence position can affect long-context performance; run position-sensitive eval | not a law that every model ignores the middle | Ch01 §1.4 + Ch04 |
| 17 | Tool-call failures | wrong tool, bad args, auth, execution, unknown side effect, result validation; route by failure type | blind retry on permission/unknown side effect is unsafe | Ch06 |
| 18 | Guaranteed JSON | prefer constrained/strict schema where supported, then semantic/business validation | schema-valid ≠ factually or operationally valid | Ch01 §1.11 + Ch06 |
| 19 | When not to use an Agent | deterministic workflow when state transitions and actions are known; use Agent only for real uncertainty | autonomy is not a maturity score | Ch08 |
| 20 | Latency levers | fewer output tokens, faster model, shorter input, fewer sequential calls, parallelism/cache | streaming improves perceived wait, not necessarily total compute | Ch01 §1.12 + Ch10 |
| 21 | Prompt caching | reuse identical/compatible prefixes to reduce repeated prefill | prefix cache ≠ semantic cache or memory | Ch01 §1.13 + Ch10 |
| 22 | Prompt release | version prompt/model/tools/eval set; offline regression → preview/shadow/canary → rollback | a prompt string alone is not the release unit | Ch09 / Ch10 |
| 23 | Model deprecation | replay frozen dataset, diff per example/slice, test tool/schema behavior, shadow/canary | generic benchmark alone misses application regressions | Ch01 §1.15 + Ch09 |
| 24 | PII-sensitive deployment | minimize/redact, contractual controls, private networking, trusted hosted boundary, or self-host where justified | deployment choice follows threat/compliance model, not slogans | Ch10 |
| 25 | Pre-launch support-bot eval | golden/regression set + component + E2E + safety + latency/cost + launch gates | one LLM judge score is not a launch decision | Ch09 |
| 26 | LLM-as-judge | narrow rubric, calibrate against humans, measure bias/agreement, freeze judge version | judge is scalable judgment, not ground truth | Ch01 §1.16 + Ch09 |
| 27 | “Model got worse” | inspect model alias/version, prompt, retrieval, traffic, sampling, cache, dependencies, evaluator | “we changed no code” ≠ system unchanged | Ch01 §1.15 + Ch09 |
| 28 | Email refund prompt injection | untrusted email never grants authority; least privilege, policy/approval gate, scoped credentials, audit | prompt instruction hierarchy alone is insufficient | Ch10 + Ch09 |
| 29 | Cut cost dramatically | measure cost/success; route, cache, shorten context/output, reduce retries, batch, smaller/distilled model | multiplicative savings require eval gates; no fixed 10× recipe | Ch01 §1.12–1.14 + Ch09 |
| 30 | LoRA / full FT / 4-bit | LoRA trains low-rank adapters; QLoRA uses quantized frozen base + adapters | 4-bit weights ≠ total memory exactly 4× smaller | Ch01 §1.10 |
| 31 | Self-host vs API | compare quality, utilization, capacity, ops, security, upgrade, availability, total cost/success | GPU hourly price alone is not TCO | Ch01 §1.14 + Ch10 |
| 32 | Healthcare doc-QA abstention | permission-aware retrieval → evidence sufficiency → grounded answer or abstain → human path | “always refuse” is safe but useless; measure risk–coverage | Ch04 / Ch05 |
| 33 | Architecture experience | explain business target → architecture → evidence → failure/recovery → production result | listing frameworks is not architecture evidence | Ch08 §8.11 |
| 34 | Keep LLM in scope | route/gate before model, restrict context/capabilities, validate output, measure scope violations | system prompt alone is not enforcement | Ch04 / Ch06 / Ch09 |
| 35 | Agent MVP | shrink autonomy; define one bounded workflow with acceptance criteria and human gates | MVP ≠ same agent with fewer UI features | Ch08 |
| 36 | “How do you know it works?” | task/business outcomes + component/process metrics + calibrated human/eval evidence + production feedback | eyeballing outputs is not evaluation | Ch09 |
| 37 | Inference latency diagnosis | network → queue → prompt assembly → prefill/TTFT → decode → tools/post-processing | measure each hop before blaming embeddings/model | Ch01 §1.12 + Ch10 |
| 38 | Upgrade regression suite | frozen representative set, slices, pairwise/per-example diff, safety/format/tool checks, shadow/canary | overall average can hide critical regressions | Ch09 |
| 39 | Quantization vs distillation | quantize first when precision/memory is the bottleneck; distill when architecture itself is too costly; evaluate slices | “cheaper” model can raise cost/success if quality drops | Ch01 §1.10 + Ch10 |
| 40 | Long context vs RAG vs cache | capacity vs evidence selection vs prefix reuse; combine when useful | these are orthogonal axes, not mutually exclusive products | Ch01 §1.18 |
| 41 | Structured output at scale | constrained decoding where supported + semantic validation; retries only bounded/recoverable | retry probability multiplies cost/tail latency; constraints have schema/support limits | Ch01 §1.11 |
| 42 | Multi-model router | cheap reliable route first; uncertainty/quality verifier escalates; evaluate quality floor and total cost | cascade can be slower/worse if every stage runs | Ch06 §6.9 + Ch09 |
| 43 | Jailbreak + hallucination | treat input/evidence as untrusted, minimize authority, ground outputs, verify high-risk actions, monitor | no single prompt filter solves both | Ch09 + Ch10 |
| 44 | RLHF vs DPO | classic SFT → reward model → PPO-style optimization; DPO directly optimizes preferences under its formulation | DPO is not universally superior or immune to proxy failure | Ch01 §1.7 |
| 45 | Preference win-rate ↑, factual QA ↓ | proxy over-optimization / distribution shift; protect factual eval and tighten training/regularization based on method | one preferred-output metric cannot define total quality | Ch01 §1.7 |
| 46 | Transformer families | encoder-only bidirectional representation; decoder-only causal generation; encoder-decoder conditional generation | generation is not exclusive to decoder-only models | Ch01 §1.2 |
| 47 | RoPE | rotate Q/K by position to inject relative-position structure | RoPE does not guarantee unlimited context extrapolation | Ch01 §1.2 |
| 48 | Pre-norm vs post-norm | pre-norm historically improves deep-network gradient path/stability; modern normalization varies | not every current LLM uses LayerNorm pre-norm | Ch01 §1.2 |
| 49 | FlashAttention | IO-aware tiling + online softmax avoids writing full N×N matrix to HBM while computing exact attention | speedup is hardware/workload dependent; algorithm does not change semantics | Ch01 §1.2 |
| 50 | Prefix caching | provider/runtime reuses matching prefix prefill; application can also cache static assembly/results separately | client cache, provider prefix cache and semantic cache are different | Ch01 §1.13 + Ch10 |
| 51 | GRPO vs PPO | original GRPO uses group-relative reward statistics and avoids a separate critic/value model | later GRPO-family objectives vary; name alone is insufficient | Ch01 §1.7 |
| 52 | KV cache | store prior layer K/V so decode avoids recomputing history representations | it removes repeated work but does not make attention over long context constant-cost | Ch01 §1.1 + Ch10 |

## 30-second fundamentals answer template

For a conceptual question:

~~~text
1. Define the mechanism.
2. Explain what problem it solves.
3. Name the production failure mode.
4. Give the decision / measurement rule.
~~~

Example:

~~~text
Context window
→ token capacity for one inference
→ capacity does not guarantee evidence utilization
→ reserve output and system/tool budget
→ evaluate target length × evidence position × task success
~~~

## Verification corrections worth memorizing

~~~text
Temperature 0
≠ truth / universal determinism

Long context
≠ no RAG

Cosine similarity
≠ correctness

Fine-tuning
≠ dynamic knowledge database

Schema-valid
≠ semantically valid
≠ authorized

Decoder-only
≠ only architecture that generates

RoPE
≠ infinite reliable context

4-bit weights
≠ total memory / 4

Prompt Cache
≠ KV Cache
≠ Semantic Cache

KV Cache
≠ long-context attention becomes free
~~~

## Source / verification boundary

The question topics and numbering are derived from the public GitHub question bank. Company-attribution labels, difficulty labels, teaser performance numbers, and locked answer content are not treated as canonical facts.

Independent verification date: 2026-10-04.

Primary references are maintained in Chapter 01 §1.21 and the owning Chapters 02–10.
