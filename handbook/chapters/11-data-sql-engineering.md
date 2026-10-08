# Chapter 11 · Data & SQL Engineering
## Data pipelines, transactional correctness, SQL and the AI data plane

> Canonical semantic owner for ingestion, CDC, Lakehouse, SQL, Spark and data quality. This is not a second RAG retrieval chapter: CH02–05 own retrieval; CH11 owns the data infrastructure and correctness of the datasets feeding it.

## 11.1 The FDE data path: from raw events to reliable AI context

A customer-facing AI system is only as trustworthy as the operational data feeding it. The data plane has multiple independently testable stages:

```text
Source systems / transactional DB / SaaS APIs
    ↓ capture (CDC, batch extract, events)
Bronze: append-only raw events + source offset
    ↓ parse + schema checks + dead-letter queue
Silver: deduplicated, validated, upserted entities
    ↓ business semantics + temporal joins + contracts
Gold: analytical / operational views
    ├─ SQL / BI / customer workflows
    ├─ feature extraction / training
    └─ document / entity retrieval indexing → RAG
```

**Design rule:** data freshness, correctness, authorization and semantic definitions are separate dimensions. A low-latency agent with a stale or mixed-tenant read is still broken.

| Boundary | What must be specified | Failure to anticipate |
|---|---|---|
| Capture | source ownership, change order, offset checkpoint | missing updates, duplicated events |
| Normalize | schema contract, primary identity, timestamp semantics | wrong units or duplicated business IDs |
| Persist | transaction, merge key, retention, recovery | partial updates, stale aggregates |
| Consume | freshness SLA, temporal snapshot, access control | agent reads obsolete or unauthorized facts |
| Explain | lineage, source version, incident trace | cannot reproduce a customer-facing answer |

## 11.2 ETL vs ELT, CDC, and batch versus streaming

**ETL** transforms before loading the destination, useful where source/egress compliance or fixed transformations demand it. **ELT** lands raw governed data then transforms within a query-capable warehouse or Lakehouse, useful for replayable business logic. Neither is universally superior: choose based on data trust, transform location, cost, governance and recovery.

**CDC** captures row-level changes from a transactional source (commonly log-based). A production pipeline should handle inserts, updates, deletes, transactions, source offsets, out-of-order arrivals and initial snapshot cutover. Capturing a change does not imply exactly-once downstream business effects.

**Batch** is easier to audit and replay with bounded completeness windows. **Streaming** reduces event-to-availability delay but adds watermark, state and recovery complexity. Choose using a declared *freshness objective*, not a blanket claim that streaming is more advanced.

## 11.3 Idempotency and at-least-once delivery: make retries safe

Delivery can repeat; therefore deduplicate by a **stable source event ID or transactional version**, not by arbitrary ingestion time. A practical design:

```text
source event (source_id, entity_id, version, operation, event_time)
    → durable raw append + offset
    → validate schema
    → reject / quarantine impossible records
    → deduplicate by (source_id, source_event_id)
    → merge only if incoming version is newer
    → atomic sink commit + checkpoint
```

Use an **idempotency key scoped to the business operation**. Do not invent “exactly once” guarantees across an HTTP side effect, a stream processor and a different database without a distributed transaction protocol or application-level reconciliation. In at-least-once systems, enforce idempotent *effects*.

Data-quality checks must include uniqueness, referential integrity, nullability, valid ranges, event-time plausibility, schema evolution and reconciliation totals. Observe row counts *and* business invariants, e.g. total invoice amounts before/after a merge.

## 11.4 Delta / Lakehouse and the medallion pattern

A Lakehouse provides file-backed analytical storage plus transactional table semantics. A medallion design names processing responsibilities:

- **Bronze:** immutable landing with provenance; suitable for replays and audit.
- **Silver:** typed, deduplicated, entity-resolved records; controlled updates/deletes.
- **Gold:** consumer contracts and derived business semantics, not a dumping ground for every transformed table.

Delta Lake adds an optimistic transaction log, atomic table commits and snapshot semantics around data files. **ACID at the table boundary does not create cross-system exactly-once delivery or solve dirty source data.** Check the actual engine/version for change data feed, retention, vacuum and streaming-reader semantics.

A reproducible backfill must pin source bounds, transform version, target range and resulting row counts, and avoid blindly appending duplicate output.

## 11.5 SQL: windows, SCD Type 2, gaps and islands

Window functions preserve row identity while computing partition-relative values. For a latest record per entity:

```sql
WITH ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY tenant_id, entity_id
           ORDER BY source_version DESC, ingested_at DESC
         ) AS rn
  FROM normalized_events
)
SELECT * FROM ranked WHERE rn = 1;
```

This query is **not** safe when version ordering is ambiguous or deletions must be honored; tombstones and tie resolution need an explicit contract.

**SCD Type 2** retains a historical business attribute per valid-time interval: `effective_from`, `effective_to`, `is_current`. On change, close the prior interval and insert a new version atomically. When joining a historical feature to an event, require `event_time >= effective_from AND event_time < effective_to` (with a defined open-ended upper bound). Avoid future leakage in feature/training joins.

**Gaps and islands** group consecutive dates or event runs; the technique usually uses a row-number/window offset or boundary flag plus a running sum. Decide whether consecutive means “adjacent calendar days,” “adjacent business days” or “gap no larger than N minutes” before writing SQL.

## 11.6 Spark engineering: transformations are not a performance plan

Choose the correct execution abstraction: DataFrame / Spark SQL + Delta for a Databricks-oriented AI FDE path; RDD mechanics only when a specific diagnostic needs them.

```text
source scan → projection / filter pushdown
            → join strategy (broadcast / shuffle / sort-merge)
            → aggregation and possible shuffle
            → write strategy + compaction
```

Inspect `explain`, input sizes, partition skew, shuffle bytes, spill, repeated scans, task stragglers, file count and adaptive query execution. **More partitions are not always better.** Broadcasting a genuinely small table may eliminate a shuffle; broadcasting a too-large one causes memory pressure. `cache()` helps only when reused enough to repay its storage and recomputation cost.

For Structured Streaming, event-time watermark bounds how long late data can update an aggregation or join state *under the given operator and output mode*; it is not a universal auto-delete of all old events. Checkpointing remains required for restart semantics. Capture late-data policy, side outputs and backfill strategy explicitly.

## 11.7 Text-to-SQL is an authorization boundary

An LLM-generated SELECT is not automatically safe. Implement a read-only, schema-scoped, tenant-scoped query service with query validation *and* enforcement at the database identity / row policy layer.

```text
natural-language intent
→ authorized schema / semantic ontology context
→ generate candidate SQL
→ parse / validate allowed operations
→ enforce tenant scope + runtime DB permissions
→ EXPLAIN, cost/timeout/row caps
→ execute on read replica / governed warehouse
→ verify result shape + cite relevant source/refresh timestamp
```

A regular expression rejecting `DROP` is not a complete SQL safety boundary. Schema-restricted execution and immutable credentials matter more than a model promise. Evaluate exact-result correctness and customer-specific semantic definitions, not only whether the SQL executes.

## 11.8 An enterprise order-operations case

**Situation:** support agents ask why orders appeared “delivered” before courier handoff. Source systems include orders, fulfillment events and carrier feeds.

1. Discover which system defines a canonical order status and its update semantics; identify tenant and region boundaries.
2. Ingest raw state changes with source ID, event ID, entity ID and source sequence; retain raw evidence.
3. Validate carrier duplicate/out-of-order data; quarantine unresolved statuses; replay safely.
4. Materialize entity state with ordered version rules; expose freshness and uncertainty.
5. Use row-level permissions in the serving SQL/RAG layer; do not rely solely on retrieval filtering.
6. Compare a golden set of known incident timelines against SQL and generated answers.
7. Release via shadow query checks; monitor missing events, CDC lag, query p95 and task success.

**Acceptance measures:** reconciliation completeness, duplicate-effect rate, p95 event-to-query freshness, row-policy leakage tests, query p95 latency, and per-task correctness from a labeled set. Stakeholders must agree on actual thresholds; numbers are not invented here.

## 11.9 Interview and operating checklist

| Ask before choosing a solution | What to demonstrate |
|---|---|
| What exactly must be fresh? | source-to-usable-data freshness SLI |
| Can the source replay a time interval? | deterministic backfill without duplicate business effects |
| Which key determines identity? | dedupe, ordering, delete contract |
| Which rows may this customer see? | auth enforced at read/execution boundary |
| How is the query correct? | golden SQL cases, reconciliation, EXPLAIN |
| Where does state grow unbounded? | streaming watermark, checkpoint, retention |
| What is the smallest end-to-end deliverable? | one source, one contract, one consumer, measured output |

### Sources and boundary

- FDEInterviews: [Data & SQL Engineering](https://www.fdeinterviews.com/concepts), [cross-track concept map](https://www.fdeinterviews.com/map), consulted 2026-10-08. Their topic list motivates coverage; the pipeline, SQL and teaching case here are **original handbook synthesis**, not direct quotes or claims that premium lessons were read.
- Official source references to verify version-specific guarantees before implementing: [Apache Spark Structured Streaming Guide](https://spark.apache.org/docs/latest/streaming/index.html), [Delta Lake docs](https://docs.delta.io/), [Databricks Delta Lake documentation](https://docs.databricks.com/aws/en/delta/).
- Cross-chapter: CH02 owns retrieval and access-filter ordering; CH09 owns evaluation/monitoring; CH10 owns production serving and platform identity.
