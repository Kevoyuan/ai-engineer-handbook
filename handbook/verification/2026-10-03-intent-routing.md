# Intent routing source audit · 2026-10-03

Owner: Chapter 06 §§6.9–6.10. Baseline main: `1fe11214793925d2e0ba01e162b56fb49b808ace`.
Input: user-provided “Agent 意图路由核心设计方案”. Existing cascade, soft hierarchy, MCP/Skill separation, Jev primitives and authorization rules remain the semantic home; no duplicate supplement or interview card was needed.

| Input claim | Disposition | Primary evidence / boundary |
|---|---|---|
| SDK wraps specialists as tools | Narrowed | Registered **handoffs** appear as tools; `Agent.as_tool()` is a separate manager pattern. [Official orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration) |
| `transfer_to_<agent>` and description template | Verified as Python defaults | Names are normalized; defaults are overridable. [SDK reference source](https://openai.github.io/openai-agents-python/ref/handoffs/) |
| Accuracy depends entirely on description | Corrected | Description helps define boundaries; candidate selection, state, model and evaluation also matter. No universal accuracy guarantee. |
| Putting descriptions into a prompt is always wrong | Corrected | Small, clear sets can use direct model routing. Tool representation also consumes context and requires model inference. Cascade is a synthesis, not an SDK latency promise. |
| Rules → vectors → decision model → LLM → ask | Integrated as configurable mechanisms | Existing §6.9 owns the cascade. Semantic examples add route aggregation and margins; clarification is available at every layer. |
| Jev 70–500 ms | Retained with vendor attribution | [TypeSafe launch](https://typesafe.ai/blog/introducing-system-one-models-and-jev) reports that range and West Coast evaluation location. No local benchmark, SLA or P95 verification. |
| OpenAI Decisions API exists | Verified, status qualified | [Official DevDay recap](https://openai.com/index/devday-2026-recap/) announces Luna, text/image context, finite answers and **limited preview** on September 29. No broad-access confirmation or public endpoint contract found in this check. |
| Decisions API 150 ms | Unverified; removed from guidance | Official announcement does not establish this figure. Same-name independent websites are not official OpenAI API specifications. No guessed endpoint or Jev schema equivalence. |
| Sonnet 5.5 / Opus 5.5 | Names verified | [Anthropic launch](https://www.anthropic.com/claude-sonnet-5-5) positions Sonnet as faster/lower-cost than Opus. Suitability remains task-specific; no intent-routing benchmark inferred. |
| Jev 90% confidence means 90% accuracy | Corrected | [Official confidence definition](https://docs.typesafe.ai/confidence): Choice concentration is `(p_max − 1/n)/(1 − 1/n)`; Score uses ordered distances; Noul has no separate confidence. Calibration is a population property, tested locally. |
| logprobs provide reliable option confidence | Qualified | Token probabilities are conditional scores, not automatically calibrated intent probabilities. Multi-token and truncated-candidate handling matters. [Current OpenAI compatibility](https://developers.openai.com/api/docs/guides/latest-model) documents unsupported logprobs settings for reasoning modes. |
| Return specialist to triage with limit | Integrated as host policy | Return transfer must be configured or a structured out-of-scope result handled. Bound count/turns/latency and detect no-progress cycles; do not reroute authorization denial. |
| Multi-intent priority | Integrated | Distinguish simultaneous tasks from ambiguity; order by dependencies, risk and business policy. |
| More than 20 intents requires hierarchy | Removed as universal threshold | Reuse §6.2 soft hierarchy / Top-M candidates; decide using recall, confusion and context/maintenance cost. |
| Retrieved examples improve 71%→93% | Unverified; not adopted as benchmark | No identifiable primary experiment, dataset, split, baseline or reproducible result supplied. Retain the evaluation method with isolated example/calibration/test sets and near-duplicate controls. |

This is public-document verification, not live API access, latency replication, or a claim that the cascade is universally optimal. Handbook synthesis includes the mechanism matrix, abstention gates, multi-intent policy, recovery budgets and evaluation checklist. Implementation facts are labeled and sourced separately.

Derived presentation: existing `ch06-intent-routing.html` and `ch06-system-one-jev.html`, registered once in `chapter-additions.json`. The published React reader also requires synchronized `content/06-skills-routing.json` and its section search index; updating legacy fragments alone does not update `web/site`.
