# FDE 02–04 · Verified-answer and curriculum-audit provenance (2026-10-08)

> **Scope:** The [public FDE Concepts catalog](https://www.fdeinterviews.com/concepts) supplies topic names and organization, not paid answer keys. **Q10–Q23 are original research-derived interview prompts and responses** added to canonical chapters on this branch. Do not present them as verbatim official FDEInterviews questions or premium solutions. Earlier original answers Q1–Q9 are tracked in [the first ledger](./fde-2026-verified-answer-ledger.md).

## Phase 02: CH10 system-design decision drill (Q10–Q16)

| Prompt | First-party verification | Not established without customer tests |
|---|---|---|
| Q10 · SaaS / Private Link / BYOC / air-gap | [Microsoft private PaaS](https://learn.microsoft.com/en-us/azure/networking/design-guide/private-platform-as-a-service), [hybrid](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/hybrid-considerations) | Specific customer's egress/identity policy or deployment compatibility |
| Q11 · Circuit breaker and retry storm | [AWS Builders Library](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) | Actual breaker benefit, overload recovery or max concurrency |
| Q12 · Unknown write and idempotency | [AWS idempotency reliability](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html), [Stripe API](https://docs.stripe.com/api/idempotent_requests) | Generic connector exactly-once behavior |
| Q13 · Ontology / GraphRAG / semantic metric | [Databricks metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/yaml-reference) | A customer's canonical business ontology or graph consistency |
| Q14 · SLI / SLO / error budget | [Google SRE SLO workbook](https://sre.google/workbook/implementing-slos/) | Customer acceptance threshold or reliability achieved |
| Q15 · AI task unit economics | [AWS cost reliability practice](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) for reliability trade-off context; formula is handbook synthesis | Actual savings, review overhead, ROI |
| Q16 · Walking skeleton | [Azure private access](https://learn.microsoft.com/en-us/azure/networking/design-guide/private-platform-as-a-service) for network constraints; walking-skeleton definition is handbook synthesis | Production throughput, security certification, egress proof |

Canonical technical ownership: [Chapter 10 §10.26](../chapters/10-serving-deployment-ai-platform.md). Bilingual Reader presentation: `web/assets/ch10-fde-system-design.html`, registered at `#read/10-serving-deployment-ai-platform/fde-system-design-02-title` when generated content is deployed.

## Phase 03: CH11 Databricks and data engineering (Q17–Q23)

| Prompt | First-party verification | Not established without execution |
|---|---|---|
| Q17 · AUTO CDC vs MERGE and out-of-sequence events | [Lakeflow AUTO CDC](https://docs.databricks.com/aws/en/ldp/cdc), [Python API](https://docs.databricks.com/aws/en/ldp/developer/ldp-python-ref-apply-changes) | Sample code compiling in an unverified workspace / key sequence correctness |
| Q18 · CDF bootstrap and replay | [Delta CDF](https://docs.delta.io/delta-change-data-feed/), [CDC snapshots](https://docs.databricks.com/aws/en/ldp/what-is-change-data-capture) | 30-day replay or retention without a customer policy |
| Q19 · Slow Spark joins | [Spark SQL tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html) | Any expected speed-up absent workload benchmark |
| Q20 · Watermarks / checkpoint state | [Spark Structured Streaming](https://spark.apache.org/docs/latest/streaming/index.html) | End-to-end exactly-once across external sinks / any lateness guarantee |
| Q21 · Wrong SQL from timeline/order logic | [Databricks CDC semantics](https://docs.databricks.com/aws/en/ldp/what-is-change-data-capture) | Correct business status without source contract |
| Q22 · Unity Catalog / ABAC / RLS | [ABAC vs table filters](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm), [requirements](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/requirements) | End-user identity propagation when queries use service credentials |
| Q23 · Metric view / ontology / Text-to-SQL | [Metric view YAML](https://docs.databricks.com/aws/en/uc-semantics/metric-views/yaml-reference), [feature availability](https://docs.databricks.com/aws/en/uc-semantics/metric-views/feature-availability) | Approved numerator/denominator, SQL run results or model accuracy |

Canonical technical ownership: [Chapter 11 §11.10](../chapters/11-data-sql-engineering.md). Bilingual Reader presentation: `web/assets/ch11-fde-databricks-drills.html`, registered at `#read/11-data-sql-engineering/fde-databricks-03-title` when generated content is deployed.

**Version note:** At the 2026-10-08 review, official Databricks documentation describes `AUTO CDC` replacing `APPLY CHANGES` while retaining prior API compatibility; support and compute constraints are product/edition-specific. SQL shown in the chapter was **not run in a customer Databricks workspace**. No source was used to assert measured performance or customer access.

## Phase 04: 167-concept audit

- [Original source-track and single-owner crosswalk](./fde-2026-concept-crosswalk.md).
- [167-row owner-chapter evidence audit](./fde-2026-coverage-audit.md): per-concept **H** (owner heading), **B** (owner prose), **N** (no direct term signal), plus an official-source-check flag and editorial priority.
- The audit grades are **location signals, not completed-depth verdicts**. English names can mismatch Chinese explanations; reviewed aliases reduce false negatives but do not remove all of them.
- **No concept is declared fully covered** simply because its term is present. Follow-up manual deep review must verify answer, architecture, failure/negative case, metric/gate and supporting source.
- Source-check flag is a *need for version-sensitive verification*, not evidence a claim is currently wrong.

## Next drill policy

Publish nothing directly to Vercel from this phase. Keep all changes on a feature branch until the user explicitly authorizes deployment. Content sync and preview builds may produce *repository artifacts* without asserting that the production site changed.

For any further independent answer: first inspect canonical chapter ownership, search primary sources, label implementation claims and uncertainty, then add scenario, explicit trade-off, test protocol and evidence reference. Never invent premium-site answer content.
