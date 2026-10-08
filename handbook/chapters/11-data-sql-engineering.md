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


## 11.10 Databricks FDE deep dive: CDC, SCD2, Spark plans, streaming and safe SQL

> **Research boundary · 2026-10-08:** Q17–Q23 are original interview-style questions inspired by publicly visible FDE topics, not membership answers. Current Databricks and Spark behaviors are checked against first-party docs linked below. All examples use fictional orders. **SQL/PySpark snippets are teaching examples, not executed against a live Databricks workspace.** Runtime, editions, API signatures and feature availability must be checked against the customer's workspace.

### 11.10.1 Q17 · Customer's orders stream arrives late and out of order: MERGE or AUTO CDC?

A raw event replay can reorder arrival while preserving logical business ordering. Distinguish three timestamps/IDs:

- `source_sequence` or log offset: stable **per-source entity** mutation order (must satisfy that source's ordering contract);
- `event_time`: claimed real-world occurrence time, subject to clock skew and semantics;
- `ingested_at`: pipeline observation time, useful for freshness but **not a source of business truth**.

Databricks **Lakeflow AUTO CDC** processes changes by a declared `SEQUENCE BY`, supports out-of-order changes, SCD Type 1 and Type 2, and deletion rules. In its current documentation `AUTO CDC` supersedes `APPLY CHANGES` (which still exists), and `AUTO CDC FROM SNAPSHOT` is for ordered snapshots where a native CDC feed is unavailable. For SCD2 targets, `__START_AT` / `__END_AT` represent the chosen sequencing domain. These **need not be real wall-clock timestamps**.

Conceptual pipeline SQL (requires supported Lakeflow pipeline and a correctly defined upstream streaming source):

```sql
CREATE OR REFRESH STREAMING TABLE order_status_history;

CREATE FLOW apply_order_cdc AS AUTO CDC INTO order_status_history
FROM stream(ops.silver.order_changes)
KEYS (tenant_id, order_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY source_sequence
COLUMNS * EXCEPT (operation, source_sequence)
STORED AS SCD TYPE 2;
```

**Not copy-paste production SQL:** It assumes `ops.silver.order_changes` exists, the target is in a Lakeflow pipeline, and the source sequence is **strictly comparable for each target key**. Mixing independent OMS and carrier sequences into one key without an agreed total order is invalid. If events come from different authoritative streams, materialize separately and reconcile via a separately defined semantic contract.

**Practical choice:** Use AUTO CDC for an eligible feed where its sequencing and delete contract matches requirements. Use manually controlled MERGE when custom reconciliation/upsert logic demands it, knowing the team now owns out-of-order logic, idempotency, history and tombstone correctness. Neither provides cross-system exactly-once business actions automatically.

### 11.10.2 Q18 · Delta CDF, initial snapshot and a 30-day replay: what can go wrong?

Delta Change Data Feed must be enabled; it captures **only changes after enablement** and adheres to retention limits. CDC bootstrap must reconcile a consistent initial snapshot with a clearly positioned continuation offset to avoid omissions/duplication. A “replay 30 days” request is **not possible by assumption** merely because CDF exists; retention and archival policy determine the feasible window.

```text
initial snapshot at source boundary S
→ watermark/checkpoint at S
→ durable source event log (with retention contract)
→ AUTO CDC or idempotent MERGE
→ expected source/target reconciliation
→ backfill uses pinned source range + code version + target overwrite strategy
```

Treat `event_id`, `source_version`, `operation`, `source_offset` as separate columns; tombstone deletes should not be silently dropped by a malformed `is_deleted` filter. Audit raw evidence retention separately from CDF retention. Databricks documentation supports once flows for initial hydration and later CDC processing.

### 11.10.3 Q19 · Spark join is slow. What do you inspect before changing partitions?

```python
# Notebook / Databricks example (not runnable in the standalone stdlib demo).
from pyspark.sql import functions as F

orders = spark.table("ops.gold.orders").select(
    "tenant_id", "order_id", "customer_id", "status")
customers = spark.table("ops.gold.customers").select(
    "tenant_id", "customer_id", "region")

joined = orders.join(
    customers, on=["tenant_id", "customer_id"], how="left")
joined.explain("formatted")
```

First read scan sizes and filter/projection pushdown; then join strategy, **both** join keys including tenant, shuffle exchange, spill/skew, file counts, AQE settings and output cardinality. If a customer dimension is genuinely small, an explicit `broadcast(customers)` can eliminate some shuffle overhead; do not broadcast just because someone says it is faster. A non-unique join key can cause a row explosion that looks like a Spark tuning problem but is actually a data-contract failure.

| Observation | Hypothesis | Evidence/next action |
|---|---|---|
| Many small files | scan scheduling overhead | inspect partition/file statistics; compact according to engine |
| One huge straggler | hot-key/skew | key distribution, AQE skew handling, possible salting |
| Shuffle dominates | large join/groupBy on wrong partitioning | inspect plan, broadcast feasibility, join keys |
| Cache growing | reuse assumption false / large persisted data | compare recomputation vs storage; unpersist |
| Too many output rows | accidental many-to-many join | confirm primary and foreign key cardinality |

**Never** benchmark only a single execution time; compare same data snapshot and query with representative concurrency, p95 and cost, and understand warm-cache differences.

### 11.10.4 Q20 · Structured Streaming watermark: does it delete all old data?

No. Watermarks express the processing system's tolerance for **late event-time records** and allow certain **stateful operations** to bound old state under operator-specific semantics. They do **not** mean all input records older than a threshold are automatically deleted or that checkpointing is unnecessary.

```python
from pyspark.sql import functions as F
events = spark.readStream.table("ops.silver.order_changes")
counts = (
    events.withWatermark("event_time", "15 minutes")
    .groupBy(F.window("event_time", "5 minutes"), "tenant_id")
    .count()
)
# sink/output mode, checkpoint and late-event handling are deployment contracts
```

Pick lateness from observed source distribution and loss-risk tolerance. For stream-stream joins, watermarks and event-time bounds constrain which state can be cleaned; exact behavior depends on join type and engine/output mode. Define a late-data side path/backfill and capture how many updates are excluded. A “15 minutes” number here is illustrative, **not** a recommended default.

### 11.10.5 Q21 · Why is this SQL query fast but business-wrong?

```sql
-- WRONG whenever deletions or source versions are material:
SELECT tenant_id, order_id, MAX(event_time) AS latest_event
FROM ops.silver.order_events
GROUP BY tenant_id, order_id;
```

It returns the last *timestamp*, not the authoritative state; it ignores source precedence, delete semantics, clock drift, and the event type.

For an already-normalized single-source version stream:

```sql
WITH ranked AS (
    SELECT tenant_id, order_id, source_version, event_type,
           event_time, is_deleted,
           ROW_NUMBER() OVER (
               PARTITION BY tenant_id, order_id
               ORDER BY source_version DESC, source_event_id DESC
           ) AS rn
    FROM ops.silver.canonical_order_events
)
SELECT tenant_id, order_id, source_version, event_type
FROM ranked
WHERE rn = 1 AND is_deleted = false;
```

**Preconditions:** `source_version` must be monotonic **within a unique canonical order stream**, each source event ID is stable, a tie policy exists, and `is_deleted` correctly encodes tombstones. Otherwise the query is still wrong. Use **point-in-time SCD2 joins** for facts as known at event time rather than joining to a future customer state. **Gaps-and-islands** questions require specifying what “consecutive” means (calendar days, business days or bounded minutes).

### 11.10.6 Q22 · Are Unity Catalog row filters sufficient for Text-to-SQL security?

**No single layer is sufficient.** Identity source, object-level grants, row/column restrictions, query parser/policy, result caps, redaction and audit must cooperate.

Databricks Unity Catalog supports **table-level row filters/masks** and **ABAC policies** over governed tags. **Neither grants base table access on its own**; GRANTs are separate. ABAC can apply policy at catalog/schema scope and is useful for central enforcement, but it introduces feature and compute-version constraints, rule conflicts, and performance implications. As of documented 2026 AWS requirements, ABAC requires serverless or supported DBR configurations (e.g. 16.4+ for standard; fine-grained config for dedicated) and tags take time to propagate; treat these as version-specific product facts, not universal SQL rules.

```text
SSO/identity → trusted session/entitlements
  → allowlisted semantic schema and SELECT-only policy
  → SQL AST / query budget / read-only execution identity
  → UC object GRANT + applicable ABAC/RLS/mask enforcement
  → result limit / PII redaction / audit trace
  → response with source timestamp
```

If an agent uses a highly privileged service principal for all customers, **do not assume the end user's Unity Catalog policy applies**: analyze effective query identity and use a documented secure delegation or broker pattern. Never let an LLM-supplied `tenant_id` redefine the trusted request scope.

### 11.10.7 Q23 · Ontology, Metric Views and Text-to-SQL: who defines “late shipment rate”?

A natural-language query “show late shipment rate last week” is ambiguous unless a semantic contract defines:

```text
late_shipment_rate = late_shipments / eligible_shipments
late = first actual carrier handoff time > promised cutoff
window = customer-approved time zone and effective week
eligibility = noncancelled shipments with known promised cutoff
tenant_scope = trusted policy context
data_version = source status snapshot + metric definition revision
```

These are **illustrative business rules**, not a universally correct metric. A reusable semantic layer/metric view should centrally define numerator, denominator, join keys, time zone and update semantics so dashboards and agents query the same logic. Databricks metric views can define fields/measures and reusable metrics through versioned YAML/SQL, but **do not automatically establish** policy semantics, trusted customer identity or all ontology relations.

**Interview answer:** “I would not ask the LLM to generate the meaning of the KPI. I would ask the business owner to approve a versioned metric contract, implement it in the governed semantic layer, evaluate SQL against golden cases, and have the agent query only an authorized interface.”

### 11.10.8 Databricks-specific debugging scenario and interview rubric

Customer reports: “After CDC cutover our daily delivered count increased by 12% even though our carrier totals haven't moved.” **This is a hypothetical incident, not a reproduced Databricks bug.**

Investigation sequence:

1. Identify snapshot/cutover `source_offset`; check initial-history overlap and duplicate source IDs.
2. Compare source records versus Bronze event counts by tenant/source/version.
3. Verify AUTO CDC `KEYS` and `SEQUENCE BY`: a cross-carrier sequence collision may create history errors.
4. Inspect whether `DELETE` and correction events were applied; reconstruct expected SCD2 intervals.
5. Check `delivered_count` semantic definition (order entity vs event occurrences, date window/time zone).
6. Check SQL joins for one-to-many row explosions and whether a cached view is stale.
7. Use an independent source reconciliation before deciding to replay, backfill or rollback.
8. Add minimal reproducible cases to CDC pipeline and SQL regression suite, with incident owner and freshness SLO.

| What interviewers should hear | Weak answer | Strong diagnostic |
|---|---|---|
| Data identity | “Spark bug, repartition it” | stable event key, authoritative source, sequence contract |
| Execution performance | “increase partitions” | `explain`, shuffle/skew/cardinality, AQE and cost |
| Semantics | “LLM can calculate it” | versioned numerator/denominator, time zone, golden SQL |
| Governance | “WHERE tenant_id=...” | trusted identity, UC GRANT + RLS/ABAC, negative tests |
| Reliability | “streaming is exactly once” | checkpoints, replay, sink idempotency and cross-system caveats |

**First-party references (checked 2026-10-08):**
- [Databricks AUTO CDC](https://docs.databricks.com/aws/en/ldp/cdc) and [Lakeflow Python `create_auto_cdc_flow`](https://docs.databricks.com/aws/en/ldp/developer/ldp-python-ref-apply-changes) — pipeline-only CDC APIs, sequencing and SCD2 requirements.
- [Databricks CDC and snapshots](https://docs.databricks.com/aws/en/ldp/what-is-change-data-capture) — initial load/once flow and snapshot semantics.
- [Delta Change Data Feed](https://docs.delta.io/delta-change-data-feed/) — opt-in and finite retention.
- [Databricks ABAC vs row filters](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm), [ABAC requirements](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/requirements), [row filters and masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks) — capability, identity and compute limits.
- [Databricks metric view YAML](https://docs.databricks.com/aws/en/uc-semantics/metric-views/yaml-reference) and [metric view feature availability](https://docs.databricks.com/aws/en/uc-semantics/metric-views/feature-availability).
- [Apache Spark performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html) and [Structured Streaming guide](https://spark.apache.org/docs/latest/streaming/index.html) — Spark plan, AQE and stateful-stream semantics.

**Canonical ownership:** CH11 owns data engineering, operational SQL and metric correctness. CH10 owns platform security and operational SLOs. CH12 owns customer discovery and delivery acceptance.


## 11.11 FDE Coding & Engineering Craft: Big-O, dirty parsing, windows and the GIL (Q34–Q37)

> **Source boundary (2026-10-08):** Independently authored from the public FDE topics, not a proprietary question bank. Python stdlib contracts are grounded in the documentation linked below. Working examples and **unittest** negative cases live in examples/fde-interview-engineering; no customer data or external API is required.

### 11.11.1 Q34 · Big-O That Actually Matters + Heaps and Top-K：100M 条候选只留前 20 个怎么办？

You must name **N**, **K**, the memory limit, tie policy, and whether items arrive in a stream. Sorting the entire set costs O(N log N) comparisons and generally O(N) materialization if input is not already stored. A bounded min-heap costs O(N log K) time and O(K) extra memory when maintaining K best scores, useful when K ≪ N. Python heapq.nlargest is designed for small N-of-largest outputs; for K near N a full sort may be faster in practice. Compare benchmark cases instead of universalizing complexity formulas.

~~~~python
import heapq
def top_k(scores, k):
    if k < 0:
        raise ValueError("k cannot be negative")
    return heapq.nlargest(k, scores)  # handles k=0
~~~~

For real RAG retrieval, exact heap selection occurs **after an upstream candidate generator** and cannot improve the missing-candidate recall of an ANN search. A top-20 score list does not guarantee top-20 authorized documents; **permission filter must precede eligibility**. With highly dynamic streams, tie-breaking is part of result determinism (e.g. use stable document ID after score).

**Complexity nuance:** map O(N)/O(K) to workload geometry, skew, data serialization and network/IO. Repeated vector scoring against millions of documents is usually a more expensive bottleneck than heap maintenance; therefore optimize the right layer first.

### 11.11.2 Q35 · Parsing Messy, Real-World Data：为什么简单 split(',') 危险？

CSV allows quoted commas, embedded newlines and escaped quotes; naive string.split(',') cannot implement that grammar. Parse using Python csv.DictReader/open(newline=''), **validate exactly expected headers and required fields**, quarantine malformed rows, and retain source row numbers. Invalid timestamps, duplicate keys, unknown enum values and empty tenant IDs must **not** silently coerce to valid business facts.

~~~~text
raw CSV / JSON → schema & field count → type/UTC time check
→ tenant + source ID/uniqueness → quarantine with reason
→ accepted rows + lineage → canonical source table
~~~~

If one invalid carrier status row is skipped without an observable dead-letter record, the resulting Gold order chronology can be wrong even though every downstream model behaves correctly. Parse errors and business-rule violations are different categories: the parser may succeed structurally but yield an unknown carrier status.

**Tests:** comma inside quoted field, empty tenant, unexpected extra column, missing timestamp, duplicate source key with conflicting values, UTF-8 text and timezone-naive event time. Use a positive control to prove the parser does not reject every row. A CSV fixture that is syntactically valid but missing required columns should fail **by policy**, not a fragile string split exception.

### 11.11.3 Q36 · Sliding Window and Two Pointers：分析近 15 分钟错误率怎么做？

For **already sorted** event timestamps, a two-pointer/deque window can maintain recent events in amortized O(N) time while processing the stream once (each event enters and leaves at most once). For unsorted arrival, first establish event-time sorting/watermark/retraction semantics; a simple deque on arrival order is **not** a correct event-time streaming aggregator.

~~~~python
from collections import deque
from datetime import timedelta

window = deque()
for event in already_sorted_events:
    window.append(event)
    cutoff = event.event_time - timedelta(minutes=15)
    while window and window[0].event_time < cutoff:
        window.popleft()
    # derive count, errors and denominator for this exact event_time window
~~~~

When error rate = failures/eligible requests, specify the denominator (e.g., tenant-scoped authorized investigations), how gaps/duplicate requests are handled, and whether intervals are [start,end] or (start,end]. For large Spark streaming/stateful workloads, use supported window aggregations and checkpointing rather than a single-process Python deque.

### 11.11.4 Q37 · Concurrency and the GIL：异步、线程、进程分别解决什么？

| Technique | Good for | Trap |
|---|---|---|
| asyncio | many I/O waits; explicit cooperative scheduling | synchronous blocking CPU work stalls event loop |
| ThreadPoolExecutor | I/O-bound call overlap in standard CPython | typical GIL-limited pure-Python CPU threads do not scale linearly |
| ProcessPoolExecutor | CPU-bound Python workloads when serialization overhead justified | startup, pickling, memory and process management |
| Task queue / distributed workers | durable long work and fault recovery | at-least-once delivery, idempotency and queue admission required |

**Version-sensitive fact:** Python 3.13+ supports an **optional free-threaded CPython build**, and relevant extensions may reenable the GIL; it is **incorrect** to claim “Python threads can never execute CPU code in parallel” without specifying runtime. In standard GIL-enabled CPython only one thread executes Python bytecode at once; native extensions and processes change this picture.

**Failure injection:** a ThreadPoolExecutor with a worker that waits for another task submitted to a fully occupied pool can deadlock; Python docs explicitly warn about nested Future waits. Do not assume max_workers automatically fixes deadlocks or thread safety. Set bounded concurrency, timeouts, cancellation/retry ownership and monitor event-loop delay, queue depth and p95 completion.

**Interview convergence:** A production data application should choose the *least complex execution model* that satisfies workload needs and correctness: single-process parse for small datasets, Spark/DataFrame for distributed heavy joins, separate worker queues for durable integration calls, and explicit performance testing before tuning.

**First-party sources (2026-10-08):**
- [Python heapq](https://docs.python.org/3/library/heapq.html) — min heap, nlargest and small-K guidance.
- [Python csv](https://docs.python.org/3/library/csv.html) — DictReader and newline behavior.
- [Python threading](https://docs.python.org/3/library/threading.html), [free-threading support](https://docs.python.org/3/howto/free-threading-python.html) — GIL and version-specific free-threaded builds.
- [Python concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html) — Executor semantics and deadlock examples.
- [Spark Structured Streaming](https://spark.apache.org/docs/latest/streaming/index.html) — stateful event-time windowing beyond a stdlib deque.

**Canonical ownership:** CH11 owns data parsing, correctness-oriented algorithms, windows and Python/SQL processing; CH02 owns production retrieval ANN/heap eligibility; CH08 owns workflow execution, dependency boundaries and DAG orchestration.


## 11.12 FDE Feature Store and SQL vs NoSQL contracts (Q56–Q57)

> **First-party verified (2026-10-08):** Databricks Feature Store feature engineering, point-in-time lookups and Model Registry links follow Databricks docs. Storage recommendations below are workload-specific engineering synthesis, not a measured customer benchmark.

### Q56 · Feature Stores：为什么只有 Delta Table 还不够？

A **feature store** defines reusable, discoverable, governed features with provenance plus training/serving lookup contracts. A normal Delta table can hold feature values but does **not automatically** guarantee point-in-time correctness, training-serving parity, a feature-spec contract or latency suitable for online inference.

```text
events/CDC → feature calculation/versioning → governed offline table
                           ↓
  training example (entity, label_time)
    → AS-OF feature lookup (feature_time <= label_time)
                           ↓
             model registry / signature
                           ↓
  batch / online feature lookup under approved identity
```

**Time-series leakage trap**: for a churn label observed at 2026-10-08 12:00, a feature computed using 13:00 customer activity is future information. Joining on customer_id alone leaks it. If a timestamp is merely an ordinary key rather than declared as a time-series key, **do not assume** point-in-time lookup behavior: Databricks docs distinguish time-series columns and point-in-time joins.

| Contract | Required test | Violation |
|---|---|---|
| Entity identity | tenant_id + entity_id + feature_definition_version | tenant-mixed feature |
| Observation time | feature_available_at <= label_as_of | future label leakage |
| Offline/online | same logical feature definition and window | training-serving skew |
| Freshness | observed source-to-serving lag | stale signal masquerading as live |
| Deletion/consent | revoke PII features and invalidate online copies | unauthorized retained feature |

For time-dependent data, a robust as-of join may need both *event time* and *availability time* constraints: a late-arriving event may claim an earlier timestamp but not have been available to the model at its historical prediction time. State which historical question you are evaluating: “what actually happened” or “what could the model know then.” This bitemporal distinction is a general data-engineering design beyond any one Feature Store API.

Databricks offers **Feature Views** (public preview as of the reviewed documentation) and table-based feature authoring; reference availability and runtime/version restrictions rather than assuming every workspace supports the same API.

### Q57 · SQL vs NoSQL: Choosing a Data Store：什么时候换数据库反而更危险？

Start with query patterns, consistency and transaction boundaries:

| Workload | Candidate | Why | Counterexample |
|---|---|---|---|
| Authoritative order/payment rows | transactional SQL with constraints | joins, transactions, unique IDs | eventually consistent cache is not payment system of record |
| Aggregation / analytics / governed AI data | Lakehouse/warehouse | batch history, SQL windows, lineage | transaction updates need explicit CDC/reconciliation |
| Unstructured document retrieval | lexical/vector index | search ranking and embeddings | search index must not assign official financial status |
| High-volume sparse key-value state | NoSQL/KV with documented guarantees | predictable keyed access, scaling | cross-record invariant may be difficult without transactions |
| Relationship-heavy explanation | graph view/store if justified | multi-hop relations | graph doesn't grant user access to the linked resources |

**FDE trade-off:** SQL versus NoSQL is not binary good/bad. “NoSQL scales better” ignores partition key skew, transaction model and operational consistency. “SQL cannot scale” ignores partitioning and managed distributed databases. Choose from actual cardinality, read/write shape, required atomicity, global presence, cost and tested operational expertise.

**Failure injection:** the query cache returns stale order status while the transactional ledger has committed a refund reversal. The host must consult the source of record before any write or irreversible advice; annotate read-model freshness for customer explanations.

**Primary verification:** [Databricks Feature Store overview](https://docs.databricks.com/aws/en/machine-learning/feature-store), [Feature Store point-in-time lookup semantics](https://docs.databricks.com/aws/en/machine-learning/feature-store/concepts), [Model lifecycle in UC](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/). Storage choice matrix is handbook synthesis and must be validated with a workload benchmark.

**Cross-chapter:** CH10 owns serving, model registry and transactions; CH11 owns features, point-in-time SQL and source ownership; CH02 owns document retrieval indexes.
