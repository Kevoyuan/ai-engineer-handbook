# Enterprise Order Investigation AI Copilot — executable walking skeleton

This is a **synthetic, deterministic teaching fixture**, not a production customer Copilot, not an AI agent, not a Databricks deployment and not a claim of passing production security tests. It accompanies **Chapter 12.11** in the [AI Engineering Atlas](https://kevoyuan-ai-handbook.vercel.app/#read/12-fde-customer-delivery/fde-order-capstone-title).

## Run with Python 3 (stdlib only)

\`\`\`bash
cd examples/fde-order-copilot
python3 -m unittest discover -s tests -v
python3 copilot.py
\`\`\`

Expected high-level outcome:

\`\`\`text
tenant-a / order 42 → ANOMALY
    evidence: a-del, a-hand
tenant-b / order 42 → CONSISTENT
    evidence: b-hand, b-del
\`\`\`

A status here is about the **recorded event timeline**, not proof about physical shipment chronology.

## What is real in the example?

- Parameterized SQLite SQL with tenant ID from a **TrustedActor** (host-supplied).
- Exact order lookup is **explicitly checked against host-provided allowed_orders** before SQL execution.
- Same order ID in different tenants yields separate timelines/evidence.
- Duplicate source IDs are ignored when payloads match; conflicting event payloads are rejected.
- UTC-timestamp validation, deterministic timeline classification, no-source abstention and read-only response.
- Self-contained unittest suite including negative permission cases, duplicates, late arrival and missing evidence.

## What is intentionally not implemented?

- **Authentication:** creating a TrustedActor in Python is *not* a trusted SSO/JWT verification procedure. In production the backend verifies signatures/session identity, resolves entitlement and injects scope; user/LLM input must never be accepted as identity.
- **Storage enforcement:** SQLite query filters here are a demonstration, **not** substitute for real database row-level security/Unity Catalog permissions. Production must enforce at both trusted service and governed storage policy boundaries.
- **Concurrency/idempotency:** this is single-process in-memory SQLite; do not assume it handles concurrent writers, transactional inbox/outbox, exactly-once cross-system side effects, source delete/tombstone propagation or independent clocks.
- **CDC / Delta Lake:** read the architecture in the chapter; no Databricks account or Delta runtime is needed here. Real pipelines require the committed source offset, schema/correction semantics, retention and replay tests.
- **LLM / retrieval index:** these are intentionally omitted. The anomaly decision is deterministic. An LLM can optionally explain bounded, cited evidence; textual carrier policies may need permission-aware BM25/dense retrieval.
- **Human approval and writes:** no order mutation or refund tool. Production approval must involve a separately authorized human and stable operation-level idempotency.
- **Security proofs / SLAs:** unit tests are not a penetration test, load test, ISO/SOC certification, or proof of tenant isolation for any cloud system.

## Extension challenge

1. Add a tombstone/retraction schema. Make revocations reflect source truth without erasing the audit trail.
2. Implement source **freshness SLI** with a clock-skew-aware contract and test stale/unknown freshness.
3. Introduce an \`OrderRepository\` interface and an authorization policy service. Test denial even if the retrieval index is stale.
4. Build a sealed Golden Dataset with positive, negative, missing evidence, and cross-tenant cases; version each run.
5. Deploy a walking skeleton with real trusted identity, row-level warehouse enforcement and redacted trace IDs. Only then add optional explanation models.

## Official evidence

- [Delta Lake change data feed](https://docs.delta.io/delta-change-data-feed/) — changes begin after enablement, finite retention.
- [Delta streaming and idempotent writes](https://docs.delta.io/delta-streaming/) — checkpoint and writer identity semantics.
- [Databricks Unity Catalog row filters](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks) — query-time enforcement.
- [Azure AI Search document ACL](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) — permissions vs string-filter identity, preview boundaries.
- [AWS idempotent mutations](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html).

**Evidence classification:** Source documentation informs specific technical caveats; all fictional customer requirements, generated events, decision flow and business metrics are original teaching synthesis.
