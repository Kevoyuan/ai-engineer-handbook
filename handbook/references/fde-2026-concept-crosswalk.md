# FDE Concepts 2026 → AI Engineering Atlas crosswalk

**Source inventory:** [FDE Concepts](https://www.fdeinterviews.com/concepts) and [FDE Concept Map](https://www.fdeinterviews.com/map), read 2026-10-08.

**Status and evidence boundary:** The source provides a 167-concept / ten-track curriculum with brief explanatory blurbs. This table is **a routing inventory, not a claim that the Atlas already explains or independently verified every concept**. Chapter owners and P0/P1 are handbook editorial judgments, not rankings from FDEInterviews. Links to paywalled lessons do not imply their full content was accessed.

## Independent chapter ownership

| Atlas chapter | Knowledge boundary |
|---|---|
| 10 | Serving, platform & security |
| 11 | Data & SQL engineering |
| 12 | Customer delivery & FDE craft |
| 01 | Model & ML foundations |
| 02 | Enterprise retrieval |
| 03 | Hybrid retrieval & routing |
| 04 | RAG reliability |
| 05 | Document RAG |
| 06 | Skills, tools & protocols |
| 07 | Memory & context |
| 08 | Agent orchestration |
| 09 | Evals & observability |

## 167 concepts by original FDE track

The concept titles and original track organization are retained for attribution; technical explanations belong only in canonical `handbook/chapters/*.md` files. Reassess older chapter depth during later semantic merges. DO NOT bulk-copy the original teaching text.

### Foundations of LLMs & GenAI · 30

| Concept (source title) | Canonical owner |
|---|---|
| Embeddings & Vector Representations | CH01 — Model & ML foundations |
| KV Cache | CH10 — Serving, platform & security |
| The Transformer, Intuitively | CH01 — Model & ML foundations |
| Model Routing and Cascades | CH01 — Model & ML foundations |
| The Context Window | CH01 — Model & ML foundations |
| Why LLMs Hallucinate | CH01 — Model & ML foundations |
| RLHF (Alignment) | CH01 — Model & ML foundations |
| Reward Models | CH01 — Model & ML foundations |
| Prompt Engineering | CH01 — Model & ML foundations |
| Fine-tuning vs RAG vs Prompting | CH01 — Model & ML foundations |
| Structured Output and Schema Validation | CH01 — Model & ML foundations |
| Tokenization & Tokens | CH01 — Model & ML foundations |
| Temperature, Top-p and Sampling | CH01 — Model & ML foundations |
| Multimodal Models and VLMs | CH01 — Model & ML foundations |
| Direct Preference Optimization (DPO) | CH01 — Model & ML foundations |
| Inference-Time Compute | CH01 — Model & ML foundations |
| Prompt Caching and Semantic Caching | CH10 — Serving, platform & security |
| Model Selection for Enterprise Deployments | CH10 — Serving, platform & security |
| Attention and Self-Attention | CH01 — Model & ML foundations |
| Constrained Decoding | CH01 — Model & ML foundations |
| Constitutional AI and RLAIF | CH01 — Model & ML foundations |
| Policy Optimization: PPO and GRPO | CH01 — Model & ML foundations |
| RoPE and Positional Encodings | CH01 — Model & ML foundations |
| Chain-of-Thought Prompting | CH01 — Model & ML foundations |
| LoRA and Parameter-Efficient Fine-tuning | CH01 — Model & ML foundations |
| Mixture of Experts (MoE) | CH10 — Serving, platform & security |
| Scaling Laws | CH01 — Model & ML foundations |
| Speech and Voice AI | CH01 — Model & ML foundations |
| Autoregressive Decoding | CH01 — Model & ML foundations |
| Diffusion Models | CH01 — Model & ML foundations |

### Retrieval & Agents · 31

| Concept (source title) | Canonical owner |
|---|---|
| Retrieval-Augmented Generation (RAG) | CH04 — RAG reliability |
| Guardrails | CH09 — Evals & observability |
| Tool / Function Calling | CH06 — Skills, tools & protocols |
| Vector Databases | CH02 — Enterprise retrieval |
| MCP (Model Context Protocol) | CH06 — Skills, tools & protocols |
| The ReAct Loop (Reason, Act, Observe) | CH08 — Agent orchestration |
| Chunking Strategies | CH05 — Document RAG |
| AI Agents and Tool Use | CH08 — Agent orchestration |
| Agentic Evals: Grading the Trajectory, Not the Answer | CH09 — Evals & observability |
| Bounded Autonomy and Human-in-the-Loop | CH08 — Agent orchestration |
| Hybrid Search (Lexical + Vector) | CH03 — Hybrid retrieval & routing |
| Reranking and Two-Stage Retrieval | CH03 — Hybrid retrieval & routing |
| Agent vs Workflow vs a Single Call | CH08 — Agent orchestration |
| Permission-Aware RAG | CH02 — Enterprise retrieval |
| Agent Memory | CH07 — Memory & context |
| Agent-to-Agent Interoperability (A2A) | CH08 — Agent orchestration |
| Approximate Nearest Neighbor (ANN) | CH02 — Enterprise retrieval |
| Agent Frameworks and How Agents Fail | CH08 — Agent orchestration |
| Embedding Versions and Drift | CH02 — Enterprise retrieval |
| Multi-Agent Orchestration | CH08 — Agent orchestration |
| Context Window Management for FDE Agents | CH07 — Memory & context |
| Context Failure Modes | CH07 — Memory & context |
| GraphRAG and Contextual Retrieval | CH02 — Enterprise retrieval |
| Query Rewriting, Expansion and HyDE | CH03 — Hybrid retrieval & routing |
| Index Freshness and Staleness Windows | CH02 — Enterprise retrieval |
| Late-Interaction Retrieval (ColBERT) | CH02 — Enterprise retrieval |
| AG-UI: The Agent-User Interaction Protocol | CH06 — Skills, tools & protocols |
| AP2: The Agent Payments Protocol | CH06 — Skills, tools & protocols |
| Text-to-SQL | CH11 — Data & SQL engineering |
| Document Parsing and Extraction | CH05 — Document RAG |
| TF-IDF and BM25 | CH02 — Enterprise retrieval |

### Evaluation & ML Foundations · 24

| Concept (source title) | Canonical owner |
|---|---|
| Golden Datasets and Eval Sets | CH09 — Evals & observability |
| LLM-as-a-Judge | CH09 — Evals & observability |
| Precision, Recall and F1 | CH09 — Evals & observability |
| Offline vs Online Evaluation | CH09 — Evals & observability |
| A/B, Canary and Shadow Testing | CH09 — Evals & observability |
| Gradient Descent & Learning Rate | CH01 — Model & ML foundations |
| Bias-Variance Tradeoff | CH01 — Model & ML foundations |
| Information Theory for ML: Entropy, Cross-Entropy, KL and Perplexity | CH01 — Model & ML foundations |
| Overfitting and Regularization | CH01 — Model & ML foundations |
| Evaluating RAG Systems | CH09 — Evals & observability |
| Calibration and Uncertainty | CH09 — Evals & observability |
| Benchmarks and Their Limits | CH09 — Evals & observability |
| Faithfulness vs Answer Relevancy | CH09 — Evals & observability |
| Synthetic Data Generation | CH09 — Evals & observability |
| Catastrophic Forgetting | CH01 — Model & ML foundations |
| Loss Functions | CH01 — Model & ML foundations |
| Activation Functions | CH01 — Model & ML foundations |
| Neural Network Basics: Perceptron to MLP | CH01 — Model & ML foundations |
| Semi-Supervised and Self-Training | CH01 — Model & ML foundations |
| Computer Vision: Classification, Detection, Segmentation | CH01 — Model & ML foundations |
| Multi-Armed Bandits | CH09 — Evals & observability |
| Normalization: Batch vs Layer | CH01 — Model & ML foundations |
| Handling Imbalanced Data | CH09 — Evals & observability |
| Convex vs Non-Convex Optimization | CH01 — Model & ML foundations |

### System Design for AI in Production · 20

| Concept (source title) | Canonical owner |
|---|---|
| Latency Optimization | CH10 — Serving, platform & security |
| Observability for AI Systems | CH09 — Evals & observability |
| VPC and Air-Gapped Deployment | CH10 — Serving, platform & security |
| From Proof-of-Concept to Production | CH12 — Customer delivery & FDE craft |
| Circuit Breakers and Backpressure | CH10 — Serving, platform & security |
| The Ontology (Semantic Layer) | CH10 — Serving, platform & security |
| Idempotency | CH10 — Serving, platform & security |
| AI Cost and Unit Economics | CH10 — Serving, platform & security |
| Retries, Exponential Backoff and Jitter | CH10 — Serving, platform & security |
| Rate Limiting | CH10 — Serving, platform & security |
| The Walking Skeleton (Thin Slice First) | CH12 — Customer delivery & FDE craft |
| REST API Design for Integrations | CH10 — Serving, platform & security |
| Containers and Kubernetes for Customer Deployments | CH10 — Serving, platform & security |
| Consistency, CAP and What Your Workflow Actually Needs | CH10 — Serving, platform & security |
| Deployment Models: SaaS, BYOC, On-Prem and Air-Gapped | CH10 — Serving, platform & security |
| Message Queues and Pub/Sub | CH10 — Serving, platform & security |
| Fallbacks and Provider Failover | CH10 — Serving, platform & security |
| Palantir's Platform: Foundry, AIP, Gotham and Apollo | CH10 — Serving, platform & security |
| The Enterprise AI Reference Architecture | CH10 — Serving, platform & security |
| SLOs, SLIs and Error Budgets | CH09 — Evals & observability |

### MLOps & Lifecycle · 7

| Concept (source title) | Canonical owner |
|---|---|
| Data and Concept Drift | CH09 — Evals & observability |
| CI/CD for Models | CH09 — Evals & observability |
| Model Versioning and Migration | CH10 — Serving, platform & security |
| Model Monitoring | CH09 — Evals & observability |
| Eval Regression Suites and CI Gates | CH09 — Evals & observability |
| Feature Stores | CH11 — Data & SQL engineering |
| Model Registry and Promotion | CH10 — Serving, platform & security |

### ML Infrastructure & Serving · 10

| Concept (source title) | Canonical owner |
|---|---|
| Inference Serving (vLLM, TGI) | CH10 — Serving, platform & security |
| GPU Memory and VRAM | CH10 — Serving, platform & security |
| Knowledge Distillation | CH01 — Model & ML foundations |
| Quantization | CH10 — Serving, platform & security |
| Noisy Neighbors and KV Fair Share | CH10 — Serving, platform & security |
| Continuous Batching | CH10 — Serving, platform & security |
| PagedAttention | CH10 — Serving, platform & security |
| Distributed Training (FSDP, Parallelism) | CH10 — Serving, platform & security |
| Speculative Decoding | CH10 — Serving, platform & security |
| GPU Architecture and Execution | CH10 — Serving, platform & security |

### Data & SQL Engineering · 14

| Concept (source title) | Canonical owner |
|---|---|
| Data Quality and Validation | CH11 — Data & SQL engineering |
| Idempotent Data Pipelines | CH11 — Data & SQL engineering |
| ETL vs ELT | CH11 — Data & SQL engineering |
| Query Optimization and Execution Plans | CH11 — Data & SQL engineering |
| Change Data Capture (CDC) | CH11 — Data & SQL engineering |
| Lakehouse, Delta and the Medallion Architecture | CH11 — Data & SQL engineering |
| Batch vs Streaming | CH11 — Data & SQL engineering |
| Dimensional Modeling and Slowly Changing Dimensions | CH11 — Data & SQL engineering |
| Orchestration: DAGs, Retries and Backfills | CH11 — Data & SQL engineering |
| Spark Internals and Performance Tuning | CH11 — Data & SQL engineering |
| SQL vs NoSQL: Choosing a Data Store | CH11 — Data & SQL engineering |
| Deduplication and LSH | CH11 — Data & SQL engineering |
| SQL Window Functions | CH11 — Data & SQL engineering |
| Gaps and Islands | CH11 — Data & SQL engineering |

### AI Security, Privacy & Governance · 16

| Concept (source title) | Canonical owner |
|---|---|
| RBAC, ABAC and Identity at Runtime for Agents | CH10 — Serving, platform & security |
| Multi-Tenancy and Data Isolation | CH10 — Serving, platform & security |
| Audit Trails and Traceability | CH10 — Serving, platform & security |
| OAuth 2.0, JWTs and Service Credentials | CH10 — Serving, platform & security |
| PII Handling and Redaction | CH10 — Serving, platform & security |
| IAM and Least Privilege | CH10 — Serving, platform & security |
| AI Incident Response | CH10 — Serving, platform & security |
| Prompt Injection and Defense | CH10 — Serving, platform & security |
| AI Governance (SOC2, EU AI Act) | CH10 — Serving, platform & security |
| Enterprise SSO: SAML and OIDC | CH10 — Serving, platform & security |
| Data Residency and Sovereignty | CH10 — Serving, platform & security |
| Secrets Management | CH10 — Serving, platform & security |
| Agent Sandboxing and Execution Isolation | CH10 — Serving, platform & security |
| Differential Privacy | CH01 — Model & ML foundations |
| Federated Learning | CH01 — Model & ML foundations |
| Mechanistic Interpretability | CH01 — Model & ML foundations |

### Coding & Engineering Craft · 10

| Concept (source title) | Canonical owner |
|---|---|
| Streaming and Backpressure | CH10 — Serving, platform & security |
| Big-O That Actually Matters | CH11 — Data & SQL engineering |
| Parsing Messy, Real-World Data | CH11 — Data & SQL engineering |
| Heaps and Top-K | CH02 — Enterprise retrieval |
| Caching and Eviction | CH10 — Serving, platform & security |
| Sliding Window and Two Pointers | CH11 — Data & SQL engineering |
| Concurrency and the GIL | CH11 — Data & SQL engineering |
| Numerical Stability | CH01 — Model & ML foundations |
| Testability and Dependency Injection | CH08 — Agent orchestration |
| Graph Traversal and Topological Sort | CH08 — Agent orchestration |

### The Customer-Facing Craft · 5

| Concept (source title) | Canonical owner |
|---|---|
| Scoping Ambiguous Problems | CH12 — Customer delivery & FDE craft |
| Requirements Discovery | CH12 — Customer delivery & FDE craft |
| Explaining Trade-offs to Non-Engineers | CH12 — Customer delivery & FDE craft |
| Stakeholder Management | CH12 — Customer delivery & FDE craft |
| Recovering a Failing Live Demo | CH12 — Customer delivery & FDE craft |

## Prioritized editorial path

- **P0 / author first:** CH11 Data Quality → idempotent ingestion → CDC → Lakehouse / Delta → window queries → operational checks; CH12 discovery → scope → walking skeleton → acceptance → stakeholder trade-offs → demo incident.
- **P0 / deepen existing owners:** CH09 golden datasets / trajectory evaluation / offline-online release gates; CH02 permission-aware retrieval; CH10 resilience and identity boundary.
- **P1 / source verification:** provider-dependent model serving, protocol versions, OAuth/SSO configuration, platform vendor claims, and governance regulation details require primary documentation before stronger assertions.

## Coverage discipline

- Inventory owner != tutorial completeness. Assess a chapter by runnable example, failure mode, metric, production boundary, and verifiable source.
- Do not reclassify a concept as covered merely because its name appears in Search.
- Update this crosswalk whenever an owning chapter changes; original FDE track names and counts should stay source-accurate.
- Avoid conflating **AI Governance** with actual compliance or certification; legal requirements depend on jurisdiction and use case.
