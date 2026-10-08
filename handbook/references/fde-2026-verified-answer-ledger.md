# FDE interviews · Independently verified answer ledger (2026-10-08)

**Public source boundary:** [FDEInterviews Concepts](https://www.fdeinterviews.com/concepts) provides concepts and some visible public question titles, not the gated official solutions. All nine Q&A questions and answers in this batch were written independently, informed by public concepts and cross-checked against first-party documentation. This ledger **does not claim they are transcripts, exact paid questions or the site's authoritative answers**.

**Verification semantics:** "Checked against docs" means a product behavior or architectural distinction is supported by linked first-party documentation. It **does not mean** an independently executed benchmark, security penetration test or customer production rollout passed. Quantitative gates in the chapter are illustrative and require customer calibration.

| ID | Topic / canonical owner | First-party evidence | Reader anchor |
|---|---|---|---|
| Q1 | CH02 Cross-tenant permission-aware RAG | [Azure document ACL](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview), [security filter pattern](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search) | `#read/02-enterprise-retrieval/fde-verified-permission-rag-title` |
| Q2 | CH02 Vector pre/post-filter | [Azure vector filters](https://learn.microsoft.com/en-us/azure/search/vector-search-filters), [hybrid target filter override](https://learn.microsoft.com/en-us/azure/search/hybrid-search-how-to-query) | same as Q1 |
| Q3 | CH02 ACL revocation/index staleness | [Azure document ACL](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) | same as Q1 |
| Q4 | CH09 Layered RAG evaluation | [Google Cloud RAG evaluation](https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval), [LangSmith evals](https://docs.langchain.com/langsmith/evaluation-types) | `#read/09-reliability-evaluation-observability/fde-verified-eval-harness-title` |
| Q5 | CH09 Golden datasets / shift / contamination | [FDE Golden Datasets (public)](https://www.fdeinterviews.com/concepts/golden-dataset), [Google Cloud RAG eval](https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval) | same as Q4 |
| Q6 | CH09 Agent trajectory grading | [LangSmith eval types](https://docs.langchain.com/langsmith/evaluation-types) | same as Q4 |
| Q7 | CH09 CI / offline / online release | [LangSmith evaluations](https://docs.langchain.com/langsmith/evaluation-types), [OpenAI graders](https://platform.openai.com/docs/api-reference/graders) | same as Q4 |
| Q8 | CH10 Timeout and idempotent tool writes | [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests), [AWS retries](https://docs.aws.amazon.com/wellarchitected/2023-04-10/framework/rel_mitigate_interaction_failure_limit_retries.html) | `#read/10-serving-deployment-ai-platform/fde-verified-retry-idempotency-title` |
| Q9 | CH10 Retry storms, jitter and backpressure | [AWS retries](https://docs.aws.amazon.com/wellarchitected/2023-04-10/framework/rel_mitigate_interaction_failure_limit_retries.html), [AWS Builders Library](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) | same as Q8 |

## Knowledge integrity

- The detailed technical meaning is owned by `handbook/chapters/02-enterprise-retrieval.md` §2.7, `09-reliability-evaluation-observability.md` §9.23, and `10-serving-deployment-ai-platform.md` §10.25.
- Bilingual Reader presentation fragments registered in `web/assets/chapter-additions.json` are derived outputs, not a second semantic book.
- A schema-valid answer is not necessarily true. An LLM judge's score is not an authorization proof. A filter is not an identity provider. A network timeout is not proof of write failure.
- **Unverified aspects:** zero-leak claims in real customer systems; effectiveness of specific thresholds; any numerical performance change; the private FDE answer wording. No such claims are made.
- Further batches should prefer deepening owner chapters and updating this ledger over copy-pasting generic answers into a new interview-only chapter.
