# FDE Stage 07 · 37 previously unlocated concepts, independent source verification

**Date 2026-10-08 · GitHub Draft PR #70 only.** Public [FDE Concept inventory](https://www.fdeinterviews.com/concepts) provides topical context, not paid answer keys. Q40–Q64 are **independently authored prompts**, not claimed verbatim questions or official solutions. First-party documentation supports specific vendor/standard behaviors; architecture decisions, negative-test design and examples are original Handbook synthesis. Where a row links back to a canonical chapter it represents engineering synthesis rather than a sourced platform promise.

## What manual audit found

- 37 topics had no direct keyword/alias evidence in their assigned owners under the earlier lexical scan; **four were in fact already substantively present** in different wording: Prompt Engineering (CH01 §1.9), Tool / Function Calling (CH06 §6.6), Context Window Management (CH07 §7.4/7.7), Numerical Stability (CH01 §1.22 Q26). Expanded explicit semantic pointers rather than inventing a second protocol or claiming absent knowledge.
- **33 remaining titles** received new explanations/owner-header evidence, grouped into 25 original interview prompts Q40–Q64. Some prompts cover multiple closely related topics (e.g. Quantization/PagedAttention/MoE), not a dedicated deep tutorial per title.
- The 167-topic evidence index now has **H136/B31/N0** name-location signals. The only justified reading is 'every topic is locatable under its owner'. No claims of semantic completeness, interview pass rate, third-party penetration test, paid solution consumption or real service rollout.

## Independently researched Q40–Q64

| Q | Canonical owner | Prompt domain | Most relevant evidence |
|---|---|---|---|
| Q40 | CH02 | Vector Databases | [Azure vector filtering](https://learn.microsoft.com/en-us/azure/search/vector-search-filters) |
| Q41 | CH02 | Embedding Versions and Drift | [Azure vector documentation](https://learn.microsoft.com/en-us/azure/search/vector-search-overview) |
| Q42 | CH02 | Index Freshness and Staleness Windows | [Azure ACL documentation](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) |
| Q43 | CH02 | Late-Interaction Retrieval (ColBERT) | [ColBERT original paper](https://arxiv.org/abs/2004.12832) |
| Q44 | CH03 | Query Rewriting, Expansion and HyDE | [HyDE original paper](https://arxiv.org/abs/2212.10496) |
| Q45 | CH06 | AG-UI vs MCP vs A2A | [AG-UI maintainers](https://github.com/ag-ui-protocol/ag-ui/blob/main/docs/introduction.mdx) |
| Q46 | CH06 | AP2 Agent Payments Protocol | [AP2 maintainers](https://ap2-protocol.org/) |
| Q47 | CH07 | Context Window Management | [CH07 existing memory/budget model](../chapters/07-memory-context-engineering.md) |
| Q48 | CH10 | Rate Limiting and REST Integrations | [AWS retry/load background](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) |
| Q49 | CH10 | Consistency and CAP | [CH10 original state-contract synthesis](../chapters/10-serving-deployment-ai-platform.md) |
| Q50 | CH10 | Model Registry, Versioning and Migration | [Databricks UC lifecycle](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/) |
| Q51 | CH10 | Enterprise Model Selection | [CH10 original architecture/eval recommendation](../chapters/10-serving-deployment-ai-platform.md) |
| Q52 | CH10 | Quantization, PagedAttention, MoE | [vLLM official](https://docs.vllm.ai/en/stable/) |
| Q53 | CH10 | Speculative Decoding | [Hugging Face assisted generation](https://huggingface.co/docs/transformers/main/assisted_decoding) |
| Q54 | CH10 | SOC2 vs EU AI Act governance | [EUR-Lex consolidated AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng) |
| Q55 | CH10 | Enterprise SSO SAML and OIDC | [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) |
| Q56 | CH11 | Feature Stores & temporal leakage | [Databricks Feature Store](https://docs.databricks.com/aws/en/machine-learning/feature-store/concepts) |
| Q57 | CH11 | SQL vs NoSQL | [CH11 original query/transaction design](../chapters/11-data-sql-engineering.md) |
| Q58 | CH01 | Prompt Engineering and CoT | [CH01 earlier prompting comparison](../chapters/01-model-api-context-foundations.md) |
| Q59 | CH01 | Inference-Time Compute and Scaling Laws | [Original scaling-laws research](https://arxiv.org/abs/2001.08361) |
| Q60 | CH01 | Multimodal/VLM, Voice and Diffusion | [Hugging Face VLM task](https://huggingface.co/docs/transformers/tasks/image_text_to_text) |
| Q61 | CH01 | Constitutional AI and RLAIF | [Original Constitutional AI study](https://arxiv.org/abs/2212.08073) |
| Q62 | CH01 | Differential Privacy / FL / Interpretability | [Opacus DP tutorial](https://opacus.ai/tutorials/building_image_classifier) |
| Q63 | CH10 | Distributed Training FSDP and parallelism | [PyTorch FSDP2](https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html) |
| Q64 | CH10 | Palantir Foundry/AIP/Gotham/Apollo | [Palantir architecture](https://www.palantir.com/docs/foundry/architecture-center/platforms) |

## Specific version and security boundaries

- **Azure:** security filter != identity authentication; native ACL and index permissions have feature/version constraints. Index alias rollback may bring old permissions; recheck current source ACL.
- **Databricks:** Models in Unity Catalog use aliases; changing Champion alias does not by itself attest that an endpoint serves it. Feature Store point-in-time lookup depends on explicit timestamp key semantics; future/late-arriving events can leak across historical decision boundaries.
- **Serving:** Quantization, KV allocation (PagedAttention), MoE routing and speculative decoding solve distinct bottlenecks. Lossless speculative verification is a property of the appropriate algorithm, not of arbitrary unchecked small-model drafts.
- **Enterprise IAM:** OIDC ID Token identity and API access-token authorization are distinct; host/warehouse enforce tenant entitlements. AG-UI frontend events and AP2 action messages do not independently grant business permissions.
- **Legal:** EU AI Act is an amended, time-dependent regulation; consult current official law and legal counsel. SOC 2 scope and report period cannot be treated as a blanket AI Act compliance certificate.
- **Palantir:** official Foundry/AIP/Apollo architecture provides the platform comparison; Gotham was only described at high level, without a complete product entitlement review.
- **Engineering tests:** the stdlib test lab simulates encoder/index version, ACL revision invalidation, token bucket tenant fairness and bitemporal feature lookup, but does not prove real model quality, production concurrency, source sync or deployment security.

## Follow-up rubric (not completed in this batch)

Each of 167 topics still deserves independent manual scores for (a) causal mechanism, (b) worked example/implementation, (c) trade-offs, (d) negative/failure test, (e) measurable acceptance, (f) fresh first-party evidence. A heading hit alone earns **none** of these scores.

**Release:** No GitHub main merge, no web/site production generation, no Vercel deployment. Only Draft PR #70.
