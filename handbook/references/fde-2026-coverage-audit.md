# FDE 167 concepts · chapter evidence and coverage-audit baseline

> **Audit mode:** repository-source lexical/heading audit, generated from the public FDE concept-topic inventory and the **canonical Markdown chapters on this feature branch** on 2026-10-08. It is **not** an evaluation of correctness, tutorial completeness, interview readiness, or access to paywalled FDE solutions. The 167 entries preserve source track order and editorial chapter ownership.

**Alias discipline:** Only explicit concept-specific aliases in the manual dictionary are used to rescue known English-title/synonym mismatches (e.g. “Embeddings & Vector Representations” → `embedding`); a generic `AI`, `model`, `data` or `agent` match is not sufficient. An alias match also does not prove depth.

## Interpret the evidence grades
**Current review-branch direct terminology signals (2026-10-08 after semantic audit):** H=136, B=31, N=0; total 167. **Previous:** H99/B31/N37; initial scan H39/B7/N121. These are discoverability signals only, not verification of depth or interview readiness.
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
| Foundations of LLMs & GenAI | Embeddings & Vector Representations | CH01 | H | — | P1 | CH01 L438 (embedding) |
| Foundations of LLMs & GenAI | KV Cache | CH10 | H | — | P1 | CH10 L26 (KV Cache) |
| Foundations of LLMs & GenAI | The Transformer, Intuitively | CH01 | H | — | P1 | CH01 L109 (transformer) |
| Foundations of LLMs & GenAI | Model Routing and Cascades | CH01 | B | — | P1 | CH01 L1117 (cascade) |
| Foundations of LLMs & GenAI | The Context Window | CH01 | H | — | P1 | CH01 L287 (context window) |
| Foundations of LLMs & GenAI | Why LLMs Hallucinate | CH01 | H | — | P1 | CH01 L671 (hallucination) |
| Foundations of LLMs & GenAI | RLHF (Alignment) | CH01 | H | — | P1 | CH01 L592 (RLHF) |
| Foundations of LLMs & GenAI | Reward Models | CH01 | B | — | P1 | CH01 L576 (reward model) |
| Foundations of LLMs & GenAI | Prompt Engineering | CH01 | H | — | P1 | CH01 L1818 (Prompt Engineering) |
| Foundations of LLMs & GenAI | Fine-tuning vs RAG vs Prompting | CH01 | H | — | P1 | CH01 L753 (fine-tuning) |
| Foundations of LLMs & GenAI | Structured Output and Schema Validation | CH01 | H | — | P1 | CH01 L983 (structured output) |
| Foundations of LLMs & GenAI | Tokenization & Tokens | CH01 | H | — | P1 | CH01 L224 (tokeniz) |
| Foundations of LLMs & GenAI | Temperature, Top-p and Sampling | CH01 | H | — | P1 | CH01 L365 (temperature) |
| Foundations of LLMs & GenAI | Multimodal Models and VLMs | CH01 | H | — | P1 | CH01 L1836 (Multimodal Models and VLMs) |
| Foundations of LLMs & GenAI | Direct Preference Optimization (DPO) | CH01 | H | — | P1 | CH01 L592 (DPO) |
| Foundations of LLMs & GenAI | Inference-Time Compute | CH01 | H | — | P1 | CH01 L1828 (Inference-Time Compute) |
| Foundations of LLMs & GenAI | Prompt Caching and Semantic Caching | CH10 | H | — | P1 | CH10 L156 (prefix cache) |
| Foundations of LLMs & GenAI | Model Selection for Enterprise Deployments | CH10 | H | CHECK | P1 | CH10 L2321 (Model Selection for Enterprise Deployments) |
| Foundations of LLMs & GenAI | Attention and Self-Attention | CH01 | H | — | P1 | CH01 L203 (attention) |
| Foundations of LLMs & GenAI | Constrained Decoding | CH01 | H | — | P1 | CH01 L1042 (Constrained Decoding) |
| Foundations of LLMs & GenAI | Constitutional AI and RLAIF | CH01 | H | — | P1 | CH01 L1849 (Constitutional AI and RLAIF) |
| Foundations of LLMs & GenAI | Policy Optimization: PPO and GRPO | CH01 | H | CHECK | P1 | CH01 L592 (GRPO) |
| Foundations of LLMs & GenAI | RoPE and Positional Encodings | CH01 | H | — | P1 | CH01 L1577 (RoPE) |
| Foundations of LLMs & GenAI | Chain-of-Thought Prompting | CH01 | H | — | P1 | CH01 L1818 (Chain-of-Thought Prompting) |
| Foundations of LLMs & GenAI | LoRA and Parameter-Efficient Fine-tuning | CH01 | H | — | P1 | CH01 L867 (LoRA) |
| Foundations of LLMs & GenAI | Mixture of Experts (MoE) | CH10 | H | — | P1 | CH10 L2337 (MoE) |
| Foundations of LLMs & GenAI | Scaling Laws | CH01 | H | — | P1 | CH01 L1828 (Scaling Laws) |
| Foundations of LLMs & GenAI | Speech and Voice AI | CH01 | H | — | P1 | CH01 L1836 (Speech and Voice AI) |
| Foundations of LLMs & GenAI | Autoregressive Decoding | CH01 | B | — | P1 | CH01 L41 (autoregressive) |
| Foundations of LLMs & GenAI | Diffusion Models | CH01 | H | — | P1 | CH01 L1836 (Diffusion Models) |
| Retrieval & Agents | Retrieval-Augmented Generation (RAG) | CH04 | H | — | P1 | CH04 L2 (RAG reliability) |
| Retrieval & Agents | Guardrails | CH09 | H | — | P1 | CH09 L1311 (Guardrail) |
| Retrieval & Agents | Tool / Function Calling | CH06 | H | — | P1 | CH06 L1420 (Tool / Function Calling) |
| Retrieval & Agents | Vector Databases | CH02 | H | — | P1 | CH02 L165 (Vector Databases) |
| Retrieval & Agents | MCP (Model Context Protocol) | CH06 | H | CHECK | P1 | CH06 L2 (MCP) |
| Retrieval & Agents | The ReAct Loop (Reason, Act, Observe) | CH08 | H | — | P1 | CH08 L1804 (ReAct) |
| Retrieval & Agents | Chunking Strategies | CH05 | H | — | P1 | CH05 L79 (chunking) |
| Retrieval & Agents | AI Agents and Tool Use | CH08 | B | — | P1 | CH08 L3578 (tool use) |
| Retrieval & Agents | Agentic Evals: Grading the Trajectory, Not the Answer | CH09 | H | — | P0 | CH09 L950 (trajectory) |
| Retrieval & Agents | Bounded Autonomy and Human-in-the-Loop | CH08 | B | — | P1 | CH08 L100 (human-in-the-loop) |
| Retrieval & Agents | Hybrid Search (Lexical + Vector) | CH03 | H | — | P1 | CH03 L2 (Hybrid Retrieval) |
| Retrieval & Agents | Reranking and Two-Stage Retrieval | CH03 | B | — | P1 | CH03 L23 (rerank) |
| Retrieval & Agents | Agent vs Workflow vs a Single Call | CH08 | H | — | P1 | CH08 L2 (workflow) |
| Retrieval & Agents | Permission-Aware RAG | CH02 | H | — | P0 | CH02 L101 (Permission-Aware RAG) |
| Retrieval & Agents | Agent Memory | CH07 | H | — | P1 | CH07 L2 (memory) |
| Retrieval & Agents | Agent-to-Agent Interoperability (A2A) | CH08 | B | CHECK | P1 | CH08 L5186 (A2A) |
| Retrieval & Agents | Approximate Nearest Neighbor (ANN) | CH02 | B | — | P1 | CH02 L124 (ANN) |
| Retrieval & Agents | Agent Frameworks and How Agents Fail | CH08 | H | — | P1 | CH08 L250 (langgraph) |
| Retrieval & Agents | Embedding Versions and Drift | CH02 | H | — | P1 | CH02 L187 (Embedding Versions and Drift) |
| Retrieval & Agents | Multi-Agent Orchestration | CH08 | H | — | P1 | CH08 L102 (multi-agent) |
| Retrieval & Agents | Context Window Management for FDE Agents | CH07 | H | — | P1 | CH07 L877 (Context Window Management for Agents) |
| Retrieval & Agents | Context Failure Modes | CH07 | H | — | P1 | CH07 L2 (context) |
| Retrieval & Agents | GraphRAG and Contextual Retrieval | CH02 | B | — | P1 | CH02 L41 (GraphRAG) |
| Retrieval & Agents | Query Rewriting, Expansion and HyDE | CH03 | H | — | P1 | CH03 L422 (Query Rewriting, Expansion and HyDE) |
| Retrieval & Agents | Index Freshness and Staleness Windows | CH02 | H | — | P1 | CH02 L208 (Index Freshness and Staleness Windows) |
| Retrieval & Agents | Late-Interaction Retrieval (ColBERT) | CH02 | H | — | P1 | CH02 L223 (Late-Interaction Retrieval) |
| Retrieval & Agents | AG-UI: The Agent-User Interaction Protocol | CH06 | H | CHECK | P1 | CH06 L1420 (AG-UI) |
| Retrieval & Agents | AP2: The Agent Payments Protocol | CH06 | H | CHECK | P1 | CH06 L1420 (AP2) |
| Retrieval & Agents | Text-to-SQL | CH11 | H | CHECK | P0 | CH11 L108 (Text-to-SQL) |
| Retrieval & Agents | Document Parsing and Extraction | CH05 | H | — | P1 | CH05 L24 (parsing) |
| Retrieval & Agents | TF-IDF and BM25 | CH02 | H | — | P1 | CH02 L16 (BM25) |
| Evaluation & ML Foundations | Golden Datasets and Eval Sets | CH09 | H | — | P0 | CH09 L1560 (Golden Dataset) |
| Evaluation & ML Foundations | LLM-as-a-Judge | CH09 | H | — | P1 | CH09 L256 (LLM-as-Judge) |
| Evaluation & ML Foundations | Precision, Recall and F1 | CH09 | H | — | P1 | CH09 L1632 (Precision, Recall and F1) |
| Evaluation & ML Foundations | Offline vs Online Evaluation | CH09 | H | — | P1 | CH09 L312 (offline) |
| Evaluation & ML Foundations | A/B, Canary and Shadow Testing | CH09 | B | — | P1 | CH09 L65 (canary) |
| Evaluation & ML Foundations | Gradient Descent & Learning Rate | CH01 | H | — | P1 | CH01 L1735 (Gradient Descent & Learning Rate) |
| Evaluation & ML Foundations | Bias-Variance Tradeoff | CH01 | H | — | P1 | CH01 L1744 (Bias-Variance Tradeoff) |
| Evaluation & ML Foundations | Information Theory for ML: Entropy, Cross-Entropy, KL and Perplexity | CH01 | H | — | P1 | CH01 L1757 (Information Theory) |
| Evaluation & ML Foundations | Overfitting and Regularization | CH01 | H | — | P1 | CH01 L1744 (Overfitting and Regularization) |
| Evaluation & ML Foundations | Evaluating RAG Systems | CH09 | H | — | P1 | CH09 L398 (rag evaluation) |
| Evaluation & ML Foundations | Calibration and Uncertainty | CH09 | H | — | P1 | CH09 L1648 (Calibration and Uncertainty) |
| Evaluation & ML Foundations | Benchmarks and Their Limits | CH09 | B | — | P1 | CH09 L1614 (benchmark) |
| Evaluation & ML Foundations | Faithfulness vs Answer Relevancy | CH09 | B | — | P1 | CH09 L1545 (faithfulness) |
| Evaluation & ML Foundations | Synthetic Data Generation | CH09 | H | — | P1 | CH09 L1662 (Synthetic Data Generation) |
| Evaluation & ML Foundations | Catastrophic Forgetting | CH01 | H | — | P1 | CH01 L1794 (Catastrophic Forgetting) |
| Evaluation & ML Foundations | Loss Functions | CH01 | H | — | P1 | CH01 L1775 (Loss Functions) |
| Evaluation & ML Foundations | Activation Functions | CH01 | H | — | P1 | CH01 L1775 (Activation Functions) |
| Evaluation & ML Foundations | Neural Network Basics: Perceptron to MLP | CH01 | H | — | P1 | CH01 L1775 (Neural Network Basics) |
| Evaluation & ML Foundations | Semi-Supervised and Self-Training | CH01 | H | — | P1 | CH01 L1794 (Semi-Supervised) |
| Evaluation & ML Foundations | Computer Vision: Classification, Detection, Segmentation | CH01 | H | — | P1 | CH01 L1800 (Computer Vision) |
| Evaluation & ML Foundations | Multi-Armed Bandits | CH09 | H | — | P1 | CH09 L1675 (Multi-Armed Bandits) |
| Evaluation & ML Foundations | Normalization: Batch vs Layer | CH01 | H | — | P1 | CH01 L1775 (Batch vs Layer Normalization) |
| Evaluation & ML Foundations | Handling Imbalanced Data | CH09 | H | — | P1 | CH09 L1628 (Imbalance) |
| Evaluation & ML Foundations | Convex vs Non-Convex Optimization | CH01 | H | — | P1 | CH01 L1800 (Convex vs Non-Convex) |
| System Design for AI in Production | Latency Optimization | CH10 | B | — | P1 | CH10 L87 (latency) |
| System Design for AI in Production | Observability for AI Systems | CH09 | H | — | P1 | CH09 L2 (observability) |
| System Design for AI in Production | VPC and Air-Gapped Deployment | CH10 | H | CHECK | P0 | CH10 L2130 (air-gap) |
| System Design for AI in Production | From Proof-of-Concept to Production | CH12 | H | — | P1 | CH12 L39 (walking skeleton) |
| System Design for AI in Production | Circuit Breakers and Backpressure | CH10 | H | CHECK | P0 | CH10 L2157 (circuit breaker) |
| System Design for AI in Production | The Ontology (Semantic Layer) | CH10 | H | — | P0 | CH10 L2191 (ontology) |
| System Design for AI in Production | Idempotency | CH10 | H | — | P0 | CH10 L2064 (Idempotency) |
| System Design for AI in Production | AI Cost and Unit Economics | CH10 | H | — | P0 | CH10 L2221 (cost per successful) |
| System Design for AI in Production | Retries, Exponential Backoff and Jitter | CH10 | H | — | P0 | CH10 L2068 (retry) |
| System Design for AI in Production | Rate Limiting | CH10 | H | — | P1 | CH10 L2265 (Rate Limiting) |
| System Design for AI in Production | The Walking Skeleton (Thin Slice First) | CH12 | H | — | P0 | CH12 L39 (walking skeleton) |
| System Design for AI in Production | REST API Design for Integrations | CH10 | H | — | P1 | CH10 L2265 (REST API Design for Integrations) |
| System Design for AI in Production | Containers and Kubernetes for Customer Deployments | CH10 | H | CHECK | P1 | CH10 L713 (container) |
| System Design for AI in Production | Consistency, CAP and What Your Workflow Actually Needs | CH10 | H | — | P1 | CH10 L2282 (Consistency, CAP) |
| System Design for AI in Production | Deployment Models: SaaS, BYOC, On-Prem and Air-Gapped | CH10 | H | CHECK | P0 | CH10 L2130 (BYOC) |
| System Design for AI in Production | Message Queues and Pub/Sub | CH10 | H | — | P1 | CH10 L1541 (queue) |
| System Design for AI in Production | Fallbacks and Provider Failover | CH10 | B | — | P1 | CH10 L2104 (fallback) |
| System Design for AI in Production | Palantir's Platform: Foundry, AIP, Gotham and Apollo | CH10 | H | CHECK | P1 | CH10 L2419 (Palantir's Platform) |
| System Design for AI in Production | The Enterprise AI Reference Architecture | CH10 | H | — | P1 | CH10 L810 (control plane) |
| System Design for AI in Production | SLOs, SLIs and Error Budgets | CH09 | H | CHECK | P0 | CH09 L920 (SLO) |
| MLOps & Lifecycle | Data and Concept Drift | CH09 | B | — | P1 | CH09 L287 (drift) |
| MLOps & Lifecycle | CI/CD for Models | CH09 | H | — | P1 | CH09 L340 (release gate) |
| MLOps & Lifecycle | Model Versioning and Migration | CH10 | H | — | P1 | CH10 L2296 (Model Versioning and Migration) |
| MLOps & Lifecycle | Model Monitoring | CH09 | H | — | P1 | CH09 L2 (monitoring) |
| MLOps & Lifecycle | Eval Regression Suites and CI Gates | CH09 | H | — | P0 | CH09 L340 (Release Gate) |
| MLOps & Lifecycle | Feature Stores | CH11 | H | CHECK | P1 | CH11 L430 (Feature Stores) |
| MLOps & Lifecycle | Model Registry and Promotion | CH10 | H | CHECK | P1 | CH10 L2296 (Model Registry and Promotion) |
| ML Infrastructure & Serving | Inference Serving (vLLM, TGI) | CH10 | H | CHECK | P1 | CH10 L129 (vLLM) |
| ML Infrastructure & Serving | GPU Memory and VRAM | CH10 | B | CHECK | P1 | CH10 L583 (GPU) |
| ML Infrastructure & Serving | Knowledge Distillation | CH01 | H | — | P1 | CH01 L867 (distillation) |
| ML Infrastructure & Serving | Quantization | CH10 | H | CHECK | P1 | CH10 L2337 (Quantization) |
| ML Infrastructure & Serving | Noisy Neighbors and KV Fair Share | CH10 | H | — | P1 | CH10 L1600 (noisy neighbor) |
| ML Infrastructure & Serving | Continuous Batching | CH10 | B | — | P1 | CH10 L13 (batching) |
| ML Infrastructure & Serving | PagedAttention | CH10 | H | CHECK | P1 | CH10 L2337 (PagedAttention) |
| ML Infrastructure & Serving | Distributed Training (FSDP, Parallelism) | CH10 | H | — | P1 | CH10 L2400 (Distributed Training) |
| ML Infrastructure & Serving | Speculative Decoding | CH10 | H | CHECK | P1 | CH10 L2348 (Speculative Decoding) |
| ML Infrastructure & Serving | GPU Architecture and Execution | CH10 | B | CHECK | P1 | CH10 L583 (GPU) |
| Data & SQL Engineering | Data Quality and Validation | CH11 | B | — | P0 | CH11 L4 (data quality) |
| Data & SQL Engineering | Idempotent Data Pipelines | CH11 | H | — | P1 | CH11 L41 (idempotency) |
| Data & SQL Engineering | ETL vs ELT | CH11 | H | — | P1 | CH11 L33 (ETL vs ELT) |
| Data & SQL Engineering | Query Optimization and Execution Plans | CH11 | B | — | P0 | CH11 L31 (explain) |
| Data & SQL Engineering | Change Data Capture (CDC) | CH11 | H | CHECK | P0 | CH11 L33 (CDC) |
| Data & SQL Engineering | Lakehouse, Delta and the Medallion Architecture | CH11 | H | CHECK | P0 | CH11 L59 (Lakehouse) |
| Data & SQL Engineering | Batch vs Streaming | CH11 | H | — | P0 | CH11 L33 (streaming) |
| Data & SQL Engineering | Dimensional Modeling and Slowly Changing Dimensions | CH11 | H | CHECK | P1 | CH11 L71 (SCD) |
| Data & SQL Engineering | Orchestration: DAGs, Retries and Backfills | CH11 | B | — | P1 | CH11 L69 (backfill) |
| Data & SQL Engineering | Spark Internals and Performance Tuning | CH11 | H | CHECK | P0 | CH11 L93 (Spark engineering) |
| Data & SQL Engineering | SQL vs NoSQL: Choosing a Data Store | CH11 | H | CHECK | P1 | CH11 L426 (SQL vs NoSQL) |
| Data & SQL Engineering | Deduplication and LSH | CH11 | B | — | P1 | CH11 L15 (dedup) |
| Data & SQL Engineering | SQL Window Functions | CH11 | B | CHECK | P0 | CH11 L73 (window functions) |
| Data & SQL Engineering | Gaps and Islands | CH11 | H | — | P1 | CH11 L71 (Gaps and Islands) |
| AI Security, Privacy & Governance | RBAC, ABAC and Identity at Runtime for Agents | CH10 | H | CHECK | P1 | CH10 L89 (Identity) |
| AI Security, Privacy & Governance | Multi-Tenancy and Data Isolation | CH10 | H | — | P1 | CH10 L433 (multi-tenant) |
| AI Security, Privacy & Governance | Audit Trails and Traceability | CH10 | B | — | P1 | CH10 L1590 (audit trail) |
| AI Security, Privacy & Governance | OAuth 2.0, JWTs and Service Credentials | CH10 | B | CHECK | P1 | CH10 L1506 (OAuth) |
| AI Security, Privacy & Governance | PII Handling and Redaction | CH10 | B | — | P1 | CH10 L1585 (PII) |
| AI Security, Privacy & Governance | IAM and Least Privilege | CH10 | B | — | P1 | CH10 L1355 (IAM) |
| AI Security, Privacy & Governance | AI Incident Response | CH10 | B | — | P1 | CH10 L1724 (incident) |
| AI Security, Privacy & Governance | Prompt Injection and Defense | CH10 | H | — | P1 | CH10 L394 (prompt injection) |
| AI Security, Privacy & Governance | AI Governance (SOC2, EU AI Act) | CH10 | H | CHECK | P0 | CH10 L2363 (AI Governance) |
| AI Security, Privacy & Governance | Enterprise SSO: SAML and OIDC | CH10 | H | CHECK | P1 | CH10 L2379 (Enterprise SSO) |
| AI Security, Privacy & Governance | Data Residency and Sovereignty | CH10 | B | CHECK | P1 | CH10 L2132 (data residency) |
| AI Security, Privacy & Governance | Secrets Management | CH10 | H | — | P1 | CH10 L590 (secret) |
| AI Security, Privacy & Governance | Agent Sandboxing and Execution Isolation | CH10 | H | — | P1 | CH10 L282 (sandbox) |
| AI Security, Privacy & Governance | Differential Privacy | CH01 | H | CHECK | P1 | CH01 L1865 (Differential Privacy) |
| AI Security, Privacy & Governance | Federated Learning | CH01 | H | — | P1 | CH01 L1865 (Federated Learning) |
| AI Security, Privacy & Governance | Mechanistic Interpretability | CH01 | H | — | P1 | CH01 L1865 (Mechanistic Interpretability) |
| Coding & Engineering Craft | Streaming and Backpressure | CH10 | B | — | P1 | CH10 L2112 (backpressure) |
| Coding & Engineering Craft | Big-O That Actually Matters | CH11 | H | — | P1 | CH11 L352 (Big-O That Actually Matters) |
| Coding & Engineering Craft | Parsing Messy, Real-World Data | CH11 | H | — | P1 | CH11 L368 (Parsing Messy, Real-World Data) |
| Coding & Engineering Craft | Heaps and Top-K | CH02 | B | — | P1 | CH02 L84 (heap) |
| Coding & Engineering Craft | Caching and Eviction | CH10 | H | — | P1 | CH10 L26 (cache) |
| Coding & Engineering Craft | Sliding Window and Two Pointers | CH11 | H | — | P1 | CH11 L382 (Sliding Window and Two Pointers) |
| Coding & Engineering Craft | Concurrency and the GIL | CH11 | H | — | P1 | CH11 L401 (Concurrency and the GIL) |
| Coding & Engineering Craft | Numerical Stability | CH01 | H | — | P1 | CH01 L1881 (Numerical Stability) |
| Coding & Engineering Craft | Testability and Dependency Injection | CH08 | H | — | P1 | CH08 L6528 (Testability and Dependency Injection) |
| Coding & Engineering Craft | Graph Traversal and Topological Sort | CH08 | H | — | P1 | CH08 L6512 (Graph Traversal and Topological Sort) |
| The Customer-Facing Craft | Scoping Ambiguous Problems | CH12 | H | — | P0 | CH12 L57 (scope) |
| The Customer-Facing Craft | Requirements Discovery | CH12 | H | — | P1 | CH12 L22 (Requirements Discovery) |
| The Customer-Facing Craft | Explaining Trade-offs to Non-Engineers | CH12 | H | — | P1 | CH12 L83 (trade-offs) |
| The Customer-Facing Craft | Stakeholder Management | CH12 | H | — | P1 | CH12 L83 (stakeholder) |
| The Customer-Facing Craft | Recovering a Failing Live Demo | CH12 | H | — | P1 | CH12 L97 (live demos) |

## Stage 05–06 manual evidence-pointer update

- CH01 §1.22 now explains optimization, bias/variance, data leakage, information-theory loss, normalization, catastrophic forgetting, semi-supervision, convexity and vision labels with first-party PyTorch/scikit-learn references.
- CH09 §9.24 now separately explains rare-class recall, probability calibration, synthetic-eval leakage and adaptive online experiment risks.
- CH11 §11.11 now contains the coding cost/CSV/sliding-window/GIL contracts; CH08 §8.18 owns DAG/topological scheduling and injected tool-test boundaries.
- **23 named owner-chapter items** were manually remapped to explicit heading evidence. A positive signal means **the concept now has a discoverable section**, not that it has passed rigorous model benchmarking or a hiring interview.
- The runnable stdlib mini-lab includes positive and negative test cases. These cover narrow deterministic behavior but not customer deployment/real ML model performance.

**Detailed first-party source and non-claim ledger:** [Stage 07 Q40–Q64 source provenance](./fde-2026-answers-07-provenance.md). Local example tests demonstrate only narrow deterministic correctness; no real cloud service was exercised.

## Stage 07 · Manual review of all previous 37 N entries

**Interpretation:** Every previously N-marked topic now has an explicit term/approved synonym in its assigned canonical chapter heading, with reasoned content or an explicit pointer to existing coverage. **N=0 is a heading-location property, not “167 concepts complete”.** Some sections cover several concepts and are shorter than a dedicated tutorial; depth, correctness, hands-on proficiency and independent first-party validation require continued testing.

- **Prior substantive content, reconciled rather than re-created:** Prompt Engineering; Tool / Function Calling; Context Window Management for FDE Agents; Numerical Stability.
- **Newly expanded thematic explanations:** 33 titles routed to CH01/02/03/06/07/10/11; explanatory prompts Q40–Q64, architecture alternatives, negative cases and sources are documented under the canonical chapter owners.
- **Current implementation evidence:** the stdlib lab adds index/embedding/ACL revision consistency, per-tenant quota admission and bitemporal feature lookup negative tests. All still need service-specific integration validation.
- **Flag:** `CHECK` in the 167-row table means the product/standard/law is version-sensitive and must be reverified; it does not certify legal compliance, accuracy or performance.
- **Important remaining work:** develop a true six-criterion semantic rubric for *all 167 topics* (mechanism, example, choice/trade-off, failure, metric, first-party evidence) and close insufficient topics only on explicit evidence, not lexical tags.

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
| Foundations of LLMs & GenAI | 27 | 3 | 0 | 30 |
| Retrieval & Agents | 25 | 6 | 0 | 31 |
| Evaluation & ML Foundations | 21 | 3 | 0 | 24 |
| System Design for AI in Production | 18 | 2 | 0 | 20 |
| MLOps & Lifecycle | 6 | 1 | 0 | 7 |
| ML Infrastructure & Serving | 7 | 3 | 0 | 10 |
| Data & SQL Engineering | 9 | 5 | 0 | 14 |
| AI Security, Privacy & Governance | 10 | 6 | 0 | 16 |
| Coding & Engineering Craft | 8 | 2 | 0 | 10 |
| The Customer-Facing Craft | 5 | 0 | 0 | 5 |

## Separate six-dimensional interview-readiness review

The [core 36-topic source-evidence review](./fde-2026-readiness-core36.md) is a **manual, provisional depth assessment** of a prioritized sample and includes 4 interview scenarios; [structured grading data](./fde-2026-readiness-core36.json) and [source-pointer tests](../../scripts/verify_fde_readiness.py) allow mechanical consistency verification. It is **not** a reclassification of all 167 topics; another **131 topics have no such depth score**. The previous H136/B31/N0 names-only signal remains unchanged and should never be described as full topic coverage.

## Audit method and limitations

1. Each original concept is classified in the **assigned** canonical chapter only, using its source title and a finite declared alias dictionary; matches from a different chapter are intentionally not mistaken for owner coverage.
2. H needs a markdown section heading match; B is a title/alias found in other lines; N indicates no such direct text. This is a reproducible text scan, **not human semantic validation**.
3. New canonical sections are included from the current feature branch. Changing owners, aliases, or rewriting content changes these results; **regenerate the audit** rather than hand-editing status to manufacture progress.
4. A concept with two lines of discussion may be H and still be insufficient; a deeply explained Chinese concept can be N if its English label is absent. No item is yet certified 'fully covered' from these signals.
5. This document cites **GitHub source file line numbers** as location hints, not externally verified behavioral guarantees.

