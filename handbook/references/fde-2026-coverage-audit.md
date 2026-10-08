# FDE 167 concepts · chapter evidence and coverage-audit baseline

> **Audit mode:** repository-source lexical/heading audit, generated from the public FDE concept-topic inventory and the **canonical Markdown chapters on this feature branch** on 2026-10-08. It is **not** an evaluation of correctness, tutorial completeness, interview readiness, or access to paywalled FDE solutions. The 167 entries preserve source track order and editorial chapter ownership.

## Interpret the evidence grades
**Computed scan counts:** H=39, B=7, N=121; total 167. These are signals, not completion counts.
**Public reference:** [FDE topics](https://www.fdeinterviews.com/concepts) · [FDE concept map](https://www.fdeinterviews.com/map) · [Atlas crosswalk](./fde-2026-concept-crosswalk.md).


- **H — 专节信号 / heading signal:** the owning chapter has a Markdown heading with the named concept or reviewed alias. A heading is **not** proof of full explanation or official verification.
- **B — 正文信号 / body signal:** concept label or explicitly declared alias appears in the owning chapter prose, but no matching heading was found. Review for substantive depth.
- **N — 无直接字面信号 / no direct text signal:** none of the declared search terms were found in the owning canonical chapter. This is **not necessarily absent knowledge**: Chinese synonyms and cross-chapter material may exist.
- **SOURCE CHECK:** current product/API/standard/regulatory claims need fresh primary documentation when authored; it does not say a claim is currently false.
- **P0:** editorial interview priority. Neither this priority nor owner assignments are FDEInterviews hiring statistics.

**Anti-gaming rule:** A keyword match cannot promote a concept to `fully-covered`. Formal deep coverage requires a supported answer, architecture/implementation, trade-offs, failure test, measure/acceptance, and verifiable source where material. This report shows discoverability signals and the next review path only.

## Track-by-track ledger

| Track | Concept | Owner | Evidence | Verification | Priority | Evidence location / next check |
|---|---|---|---|---|---|---|
| Foundations of LLMs & GenAI | Embeddings & Vector Representations | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | KV Cache | CH10 | H | — | P1 | CH10 L26 (KV Cache) |
| Foundations of LLMs & GenAI | The Transformer, Intuitively | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Model Routing and Cascades | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | The Context Window | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Why LLMs Hallucinate | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | RLHF (Alignment) | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Reward Models | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Prompt Engineering | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Fine-tuning vs RAG vs Prompting | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Structured Output and Schema Validation | CH01 | H | — | P1 | CH01 L983 (structured output) |
| Foundations of LLMs & GenAI | Tokenization & Tokens | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Temperature, Top-p and Sampling | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Multimodal Models and VLMs | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Direct Preference Optimization (DPO) | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Inference-Time Compute | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Prompt Caching and Semantic Caching | CH10 | N | — | P1 | CH10 semantic/synonym review |
| Foundations of LLMs & GenAI | Model Selection for Enterprise Deployments | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| Foundations of LLMs & GenAI | Attention and Self-Attention | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Constrained Decoding | CH01 | H | — | P1 | CH01 L1042 (Constrained Decoding) |
| Foundations of LLMs & GenAI | Constitutional AI and RLAIF | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Policy Optimization: PPO and GRPO | CH01 | N | CHECK | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | RoPE and Positional Encodings | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Chain-of-Thought Prompting | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | LoRA and Parameter-Efficient Fine-tuning | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Mixture of Experts (MoE) | CH10 | N | — | P1 | CH10 semantic/synonym review |
| Foundations of LLMs & GenAI | Scaling Laws | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Speech and Voice AI | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Autoregressive Decoding | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Foundations of LLMs & GenAI | Diffusion Models | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Retrieval & Agents | Retrieval-Augmented Generation (RAG) | CH04 | H | — | P1 | CH04 L2 (RAG reliability) |
| Retrieval & Agents | Guardrails | CH09 | H | — | P1 | CH09 L1311 (Guardrail) |
| Retrieval & Agents | Tool / Function Calling | CH06 | N | — | P1 | CH06 semantic/synonym review |
| Retrieval & Agents | Vector Databases | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Retrieval & Agents | MCP (Model Context Protocol) | CH06 | N | CHECK | P1 | CH06 semantic/synonym review |
| Retrieval & Agents | The ReAct Loop (Reason, Act, Observe) | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Chunking Strategies | CH05 | N | — | P1 | CH05 semantic/synonym review |
| Retrieval & Agents | AI Agents and Tool Use | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Agentic Evals: Grading the Trajectory, Not the Answer | CH09 | H | — | P0 | CH09 L950 (trajectory) |
| Retrieval & Agents | Bounded Autonomy and Human-in-the-Loop | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Hybrid Search (Lexical + Vector) | CH03 | H | — | P1 | CH03 L2 (Hybrid Retrieval) |
| Retrieval & Agents | Reranking and Two-Stage Retrieval | CH03 | N | — | P1 | CH03 semantic/synonym review |
| Retrieval & Agents | Agent vs Workflow vs a Single Call | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Permission-Aware RAG | CH02 | H | — | P0 | CH02 L101 (Permission-Aware RAG) |
| Retrieval & Agents | Agent Memory | CH07 | H | — | P1 | CH07 L2 (memory) |
| Retrieval & Agents | Agent-to-Agent Interoperability (A2A) | CH08 | B | CHECK | P1 | CH08 L5186 (A2A) |
| Retrieval & Agents | Approximate Nearest Neighbor (ANN) | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Retrieval & Agents | Agent Frameworks and How Agents Fail | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Embedding Versions and Drift | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Retrieval & Agents | Multi-Agent Orchestration | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Retrieval & Agents | Context Window Management for FDE Agents | CH07 | N | — | P1 | CH07 semantic/synonym review |
| Retrieval & Agents | Context Failure Modes | CH07 | N | — | P1 | CH07 semantic/synonym review |
| Retrieval & Agents | GraphRAG and Contextual Retrieval | CH02 | B | — | P1 | CH02 L41 (GraphRAG) |
| Retrieval & Agents | Query Rewriting, Expansion and HyDE | CH03 | N | — | P1 | CH03 semantic/synonym review |
| Retrieval & Agents | Index Freshness and Staleness Windows | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Retrieval & Agents | Late-Interaction Retrieval (ColBERT) | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Retrieval & Agents | AG-UI: The Agent-User Interaction Protocol | CH06 | N | CHECK | P1 | CH06 semantic/synonym review |
| Retrieval & Agents | AP2: The Agent Payments Protocol | CH06 | N | CHECK | P1 | CH06 semantic/synonym review |
| Retrieval & Agents | Text-to-SQL | CH11 | H | CHECK | P0 | CH11 L108 (Text-to-SQL) |
| Retrieval & Agents | Document Parsing and Extraction | CH05 | N | — | P1 | CH05 semantic/synonym review |
| Retrieval & Agents | TF-IDF and BM25 | CH02 | H | — | P1 | CH02 L16 (BM25) |
| Evaluation & ML Foundations | Golden Datasets and Eval Sets | CH09 | H | — | P0 | CH09 L1560 (Golden Dataset) |
| Evaluation & ML Foundations | LLM-as-a-Judge | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Precision, Recall and F1 | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Offline vs Online Evaluation | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | A/B, Canary and Shadow Testing | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Gradient Descent & Learning Rate | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Bias-Variance Tradeoff | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Information Theory for ML: Entropy, Cross-Entropy, KL and Perplexity | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Overfitting and Regularization | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Evaluating RAG Systems | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Calibration and Uncertainty | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Benchmarks and Their Limits | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Faithfulness vs Answer Relevancy | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Synthetic Data Generation | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Catastrophic Forgetting | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Loss Functions | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Activation Functions | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Neural Network Basics: Perceptron to MLP | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Semi-Supervised and Self-Training | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Computer Vision: Classification, Detection, Segmentation | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Multi-Armed Bandits | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Normalization: Batch vs Layer | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Evaluation & ML Foundations | Handling Imbalanced Data | CH09 | N | — | P1 | CH09 semantic/synonym review |
| Evaluation & ML Foundations | Convex vs Non-Convex Optimization | CH01 | N | — | P1 | CH01 semantic/synonym review |
| System Design for AI in Production | Latency Optimization | CH10 | B | — | P1 | CH10 L87 (latency) |
| System Design for AI in Production | Observability for AI Systems | CH09 | H | — | P1 | CH09 L2 (observability) |
| System Design for AI in Production | VPC and Air-Gapped Deployment | CH10 | H | CHECK | P0 | CH10 L2130 (air-gap) |
| System Design for AI in Production | From Proof-of-Concept to Production | CH12 | H | — | P1 | CH12 L39 (walking skeleton) |
| System Design for AI in Production | Circuit Breakers and Backpressure | CH10 | H | CHECK | P0 | CH10 L2157 (circuit breaker) |
| System Design for AI in Production | The Ontology (Semantic Layer) | CH10 | H | — | P0 | CH10 L2191 (ontology) |
| System Design for AI in Production | Idempotency | CH10 | H | — | P0 | CH10 L2064 (Idempotency) |
| System Design for AI in Production | AI Cost and Unit Economics | CH10 | H | — | P0 | CH10 L2221 (cost per successful) |
| System Design for AI in Production | Retries, Exponential Backoff and Jitter | CH10 | H | — | P0 | CH10 L2068 (retry) |
| System Design for AI in Production | Rate Limiting | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | The Walking Skeleton (Thin Slice First) | CH12 | H | — | P0 | CH12 L39 (walking skeleton) |
| System Design for AI in Production | REST API Design for Integrations | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | Containers and Kubernetes for Customer Deployments | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | Consistency, CAP and What Your Workflow Actually Needs | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | Deployment Models: SaaS, BYOC, On-Prem and Air-Gapped | CH10 | N | CHECK | P0 | CH10 semantic/synonym review |
| System Design for AI in Production | Message Queues and Pub/Sub | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | Fallbacks and Provider Failover | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | Palantir's Platform: Foundry, AIP, Gotham and Apollo | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | The Enterprise AI Reference Architecture | CH10 | N | — | P1 | CH10 semantic/synonym review |
| System Design for AI in Production | SLOs, SLIs and Error Budgets | CH09 | H | CHECK | P0 | CH09 L920 (SLO) |
| MLOps & Lifecycle | Data and Concept Drift | CH09 | N | — | P1 | CH09 semantic/synonym review |
| MLOps & Lifecycle | CI/CD for Models | CH09 | H | — | P1 | CH09 L340 (release gate) |
| MLOps & Lifecycle | Model Versioning and Migration | CH10 | N | — | P1 | CH10 semantic/synonym review |
| MLOps & Lifecycle | Model Monitoring | CH09 | H | — | P1 | CH09 L2 (monitoring) |
| MLOps & Lifecycle | Eval Regression Suites and CI Gates | CH09 | H | — | P0 | CH09 L340 (Release Gate) |
| MLOps & Lifecycle | Feature Stores | CH11 | N | CHECK | P1 | CH11 semantic/synonym review |
| MLOps & Lifecycle | Model Registry and Promotion | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Inference Serving (vLLM, TGI) | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | GPU Memory and VRAM | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Knowledge Distillation | CH01 | N | — | P1 | CH01 semantic/synonym review |
| ML Infrastructure & Serving | Quantization | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Noisy Neighbors and KV Fair Share | CH10 | N | — | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Continuous Batching | CH10 | N | — | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | PagedAttention | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Distributed Training (FSDP, Parallelism) | CH10 | N | — | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | Speculative Decoding | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| ML Infrastructure & Serving | GPU Architecture and Execution | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| Data & SQL Engineering | Data Quality and Validation | CH11 | B | — | P0 | CH11 L4 (data quality) |
| Data & SQL Engineering | Idempotent Data Pipelines | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Data & SQL Engineering | ETL vs ELT | CH11 | H | — | P1 | CH11 L33 (ETL vs ELT) |
| Data & SQL Engineering | Query Optimization and Execution Plans | CH11 | N | — | P0 | CH11 semantic/synonym review |
| Data & SQL Engineering | Change Data Capture (CDC) | CH11 | H | CHECK | P0 | CH11 L33 (CDC) |
| Data & SQL Engineering | Lakehouse, Delta and the Medallion Architecture | CH11 | H | CHECK | P0 | CH11 L59 (Lakehouse) |
| Data & SQL Engineering | Batch vs Streaming | CH11 | H | — | P0 | CH11 L33 (streaming) |
| Data & SQL Engineering | Dimensional Modeling and Slowly Changing Dimensions | CH11 | H | CHECK | P1 | CH11 L71 (SCD) |
| Data & SQL Engineering | Orchestration: DAGs, Retries and Backfills | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Data & SQL Engineering | Spark Internals and Performance Tuning | CH11 | H | CHECK | P0 | CH11 L93 (Spark engineering) |
| Data & SQL Engineering | SQL vs NoSQL: Choosing a Data Store | CH11 | N | CHECK | P1 | CH11 semantic/synonym review |
| Data & SQL Engineering | Deduplication and LSH | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Data & SQL Engineering | SQL Window Functions | CH11 | B | CHECK | P0 | CH11 L73 (window functions) |
| Data & SQL Engineering | Gaps and Islands | CH11 | H | — | P1 | CH11 L71 (Gaps and Islands) |
| AI Security, Privacy & Governance | RBAC, ABAC and Identity at Runtime for Agents | CH10 | H | CHECK | P1 | CH10 L89 (Identity) |
| AI Security, Privacy & Governance | Multi-Tenancy and Data Isolation | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Audit Trails and Traceability | CH10 | B | — | P1 | CH10 L1590 (audit trail) |
| AI Security, Privacy & Governance | OAuth 2.0, JWTs and Service Credentials | CH10 | B | CHECK | P1 | CH10 L1506 (OAuth) |
| AI Security, Privacy & Governance | PII Handling and Redaction | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | IAM and Least Privilege | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | AI Incident Response | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Prompt Injection and Defense | CH10 | H | — | P1 | CH10 L394 (prompt injection) |
| AI Security, Privacy & Governance | AI Governance (SOC2, EU AI Act) | CH10 | N | CHECK | P0 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Enterprise SSO: SAML and OIDC | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Data Residency and Sovereignty | CH10 | N | CHECK | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Secrets Management | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Agent Sandboxing and Execution Isolation | CH10 | N | — | P1 | CH10 semantic/synonym review |
| AI Security, Privacy & Governance | Differential Privacy | CH01 | N | CHECK | P1 | CH01 semantic/synonym review |
| AI Security, Privacy & Governance | Federated Learning | CH01 | N | — | P1 | CH01 semantic/synonym review |
| AI Security, Privacy & Governance | Mechanistic Interpretability | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Coding & Engineering Craft | Streaming and Backpressure | CH10 | N | — | P1 | CH10 semantic/synonym review |
| Coding & Engineering Craft | Big-O That Actually Matters | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Coding & Engineering Craft | Parsing Messy, Real-World Data | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Coding & Engineering Craft | Heaps and Top-K | CH02 | N | — | P1 | CH02 semantic/synonym review |
| Coding & Engineering Craft | Caching and Eviction | CH10 | N | — | P1 | CH10 semantic/synonym review |
| Coding & Engineering Craft | Sliding Window and Two Pointers | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Coding & Engineering Craft | Concurrency and the GIL | CH11 | N | — | P1 | CH11 semantic/synonym review |
| Coding & Engineering Craft | Numerical Stability | CH01 | N | — | P1 | CH01 semantic/synonym review |
| Coding & Engineering Craft | Testability and Dependency Injection | CH08 | N | — | P1 | CH08 semantic/synonym review |
| Coding & Engineering Craft | Graph Traversal and Topological Sort | CH08 | N | — | P1 | CH08 semantic/synonym review |
| The Customer-Facing Craft | Scoping Ambiguous Problems | CH12 | H | — | P0 | CH12 L57 (scope) |
| The Customer-Facing Craft | Requirements Discovery | CH12 | H | — | P1 | CH12 L22 (Requirements Discovery) |
| The Customer-Facing Craft | Explaining Trade-offs to Non-Engineers | CH12 | H | — | P1 | CH12 L83 (trade-offs) |
| The Customer-Facing Craft | Stakeholder Management | CH12 | H | — | P1 | CH12 L83 (stakeholder) |
| The Customer-Facing Craft | Recovering a Failing Live Demo | CH12 | H | — | P1 | CH12 L97 (live demos) |

## Next editorial review (not automatically inferred coverage)

### P0 · Cross-organization FDE system design

- CH10 §10.26 now adds first-party-evidenced answers to seven common architecture issues: VPC/BYOC/private links, retry/circuit, idempotency, ontology, SLO, economics and walking skeleton. Verify in customer network/incident tests rather than assuming framework features.
- CH12 §12.11 owns the synthetic end-to-end order investigation. Confirm it is **not** mistaken for a measured VPC deployment or a production auth test.

### P0 · Data & Databricks

- CH11 §11.10 now covers AUTO CDC, SCD2, CDF, Spark plans, streaming watermarks, temporal SQL, UC ABAC and metric semantics. The code snippets need a **real workspace/runtime** to be considered executed; this audit does not mark them deployed.
- Backfill, source sequence correctness, late data distribution, UC policy propagation, feature availability and performance require workload-specific tests.

### P0 · Independent answer verification and gaps

- CH02 §2.7, CH09 §9.23, CH10 §10.25 and §10.26, CH11 §11.10 hold independently researched FDE-style questions **Q1–Q23**. These are our prompts and answers, not private course answers or certified benchmarks.
- Prioritize concepts with **N** as manual search candidates in both Chinese and English; then supplement only after confirming a real semantic gap.
- For topics with **H** or **B**, review quality against: mechanism → when to choose → counterexample → failure test → measurable gate → primary evidence.
- Version-sensitive current claims should be re-checked against first-party docs at implementation time; feature names and availability can change.

## Track counts (signals only)

| FDE track | H | B | N | Total |
|---|---:|---:|---:|---:|
| Foundations of LLMs & GenAI | 3 | 0 | 27 | 30 |
| Retrieval & Agents | 8 | 2 | 21 | 31 |
| Evaluation & ML Foundations | 1 | 0 | 23 | 24 |
| System Design for AI in Production | 10 | 1 | 9 | 20 |
| MLOps & Lifecycle | 3 | 0 | 4 | 7 |
| ML Infrastructure & Serving | 0 | 0 | 10 | 10 |
| Data & SQL Engineering | 7 | 2 | 5 | 14 |
| AI Security, Privacy & Governance | 2 | 2 | 12 | 16 |
| Coding & Engineering Craft | 0 | 0 | 10 | 10 |
| The Customer-Facing Craft | 5 | 0 | 0 | 5 |

## Audit method and limitations

1. Each original concept is classified in the **assigned** canonical chapter only, using its source title and a finite declared alias dictionary; matches from a different chapter are intentionally not mistaken for owner coverage.
2. H needs a markdown section heading match; B is a title/alias found in other lines; N indicates no such direct text. This is a reproducible text scan, **not human semantic validation**.
3. New canonical sections are included from the current feature branch. Changing owners, aliases, or rewriting content changes these results; **regenerate the audit** rather than hand-editing status to manufacture progress.
4. A concept with two lines of discussion may be H and still be insufficient; a deeply explained Chinese concept can be N if its English label is absent. No item is yet certified 'fully covered' from these signals.
5. This document cites **GitHub source file line numbers** as location hints, not externally verified behavioral guarantees.

