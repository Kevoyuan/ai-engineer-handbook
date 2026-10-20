# Chapter 02 · 企业检索基础
## Enterprise Retrieval Foundations

> Canonical semantic chapter. `handbook/chapters/` owns chapter meaning; `web/` owns presentation.

企业检索不是“选一个最强 Retriever”，而是根据证据形状组合不同能力。Exact、BM25、Dense、Graph 与 Metadata 各自解决不同问题，不能互相替代。

## 2.1 Exact Retrieval：确定性匹配

Exact Retrieval 适合订单号、工单号、VIN、SKU、Error Code、API 名、版本号、Part Number 等结构化标识符。它的优势是确定性、可解释、低延迟；但生产实现通常需要字段感知的索引与标准化，而不是简单字符串比较。

典型预处理包括大小写、空格、分隔符、前后缀、别名、版本格式、区域格式和业务规范化；只有业务规则确认等价时才做这些转换，并保留原始值，避免把不同 ID 合并。一个标识符查询如果本来可以走数据库主键、Keyword Field 或 Term Query，就不应默认交给向量相似度。

> **Exact retrieval is best for identifiers, but usually needs field-aware indexing and normalization.**

## 2.2 BM25：词法相关性

BM25 基于倒排索引与词项统计，擅长领域术语、产品名称、错误描述、技术文档、API 文档、法规条款、函数名等 lexical overlap 明显的查询。

它的弱点是改写、同义词、跨语言表达与低词面重叠。BM25 也不是主键查询：即使它对某些 ID 有较好召回，也仍属于词法检索，而不是确定性身份匹配。

> **BM25 handles lexical relevance; it is strong for terminology and weaker for paraphrases.**

## 2.3 Dense Retrieval：语义相似性

Dense Retrieval 把 Query 与文档映射到向量空间，适合自然语言改写、同义表达、语义搜索和部分跨语言场景。

必须牢记两条边界：

1. identifier、版本号、数值等离散标识在向量空间里可能并不稳定；
2. topical similarity 不等于 factual / operational equivalence。例如 `cancel subscription` 与 `renew subscription` 主题相近，但动作方向相反。

Embedding 模型发生变化时，通常需要重新索引，并重新评测旧索引与新索引的一致性。

> **Dense retrieval handles meaning; semantic similarity is not factual or operational equivalence.**

## 2.4 Graph Retrieval：关系与多跳

Graph Retrieval 适合“谁依赖谁”“某零件属于哪些 BOM”“这个实体与哪些系统相关”“某变更影响哪些节点”等关系型、多跳型问题。典型来源包括 ERP、PLM、组织关系、依赖图和知识图谱。

图检索的成本在于实体构建、关系抽取、实体消歧、增量更新与版本治理。它不是所有 Query 的默认检索器；当答案依赖关系结构，或图上的社区摘要能改善全局主题查询时，才值得评估其收益；GraphRAG 的聚合摘要检索不等同于实体多跳遍历。

## 2.5 Metadata Filtering：先缩小合法候选空间

Metadata 典型字段包括 tenant、role、country、language、document type、version、effective date、confidentiality、business unit 等。

它的作用不只是提高相关性，还包括：

- tenant isolation；
- 避免过期文档污染；
- 减少候选数量、延迟与成本；
- 把权限约束提前到检索阶段。

过严的相关性 Metadata Filter 会伤害 Recall，因此需要和真实 Query 分布一起校准。Tenant / ACL 是不可放宽的授权约束，不能为了提高 Recall 而取消；业务筛选条件和安全过滤必须分开治理。

生产顺序优先是：

```text
User Query
  ↓
Identity / Tenant / Role / ACL / Metadata
  ↓
Authorized Candidate Space
  ↓
Exact / BM25 / Dense / Graph
  ↓
Evidence
```

> **Authorization before semantic similarity.**

未经授权的文档不应先被检索出来再依赖 Prompt “不要说出去”；它们最好根本不进入候选集合和模型上下文。

## 2.6 Selection mental model

| Evidence shape | Preferred capability | Common failure if misused |
|---|---|---|
| Identifier / exact key | Exact field / DB / term query | Dense similarity confuses near-identical IDs |
| Terminology / error text | BM25 / lexical | Misses paraphrases |
| Natural-language meaning | Dense | Similar topic ≠ same operational intent |
| Relationship / multi-hop | Graph / relational source | High maintenance if relation structure is not needed |
| Tenant / version / region | Metadata / ACL filter | Over-filtering hurts recall |

The production goal is not to maximize one retriever's benchmark score. It is to route each evidence shape to the cheapest reliable retrieval mechanism while preserving authorization, freshness, and provenance.


## Verification boundary · 2026-09-28

Exact 规范化必须保留业务身份差异；ACL 不可为 Recall 放宽。Dense 的相对表现依赖数据域与模型；GraphRAG 还可利用社区摘要回答全局问题。

核对依据：[BEIR](https://arxiv.org/abs/2104.08663)。完整范围、逐节结论与未验证项见 [本次审计](../verification/2026-09-28.md)。

补充一手资料（仅支持对应概念/实现，不证明整章方案普遍最优）：

- [Exact term query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-term-query)
- [BM25 implementation](https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity)
- [DPR](https://arxiv.org/abs/2004.04906)
- [GraphRAG](https://arxiv.org/abs/2404.16130)


## 2.7 FDE verified answers · Permission-Aware RAG

> **Provenance (2026-10-08).** The public FDEInterviews Concepts curriculum names Permission-Aware RAG, but its gated answer is not available to us. Questions Q1–Q3 below are **independently authored engineering interview prompts**, not a transcript, leaked answer, or endorsed official solution. Azure AI Search primary documentation is used to verify product-specific filtering and permission behavior; vendor-neutral design and tests are handbook synthesis.

### Q1 · How do you prevent a RAG assistant from leaking another employee's documents?

**Interview answer:** Start with an authenticated caller identity, resolve its tenant and entitlements through trusted infrastructure, and enforce an authorized-document predicate **before any text enters prompts, rerankers, logs or caches**. Match permissions at the retrieval boundary; where possible recheck the underlying resource authorization when opening a document, because indexed ACLs may be stale. Never ask the LLM to decide whether a document is confidential.

```text
trusted identity + tenant → permission snapshot / policy
    → authorized search predicate / native ACL query
    → top-k within legal candidate set
    → rerank only authorized documents
    → evidence sufficiency / response / citations
    → tenant-scoped cache + redacted trace
```

- **Evidence:** Azure AI Search documents both (a) native document-level ACL/RBAC enforcement, with identity claims checked against indexed permission metadata, and (b) security trimming using string filters. The latter is *not* an independent authentication mechanism: the app must supply trusted identity information. Native mechanisms may be preview/version/source dependent.
- **Failure mode:** A user-supplied `tenant_id`, shared embedding-result cache, retrieval without ACL filter, or stale ACL index can allow data to cross a trust boundary.
- **Tests:** two tenants with overlapping vocabulary; documents sharing embeddings but different ACLs; revoke access after ingestion; principal/group changes; cached result replay after logout; reranker prompt/log inspection. Assert **zero unauthorized chunks in candidates, rerank input, answer, citations and traces**. A zero observed leak rate is test evidence, not proof of universal security.

### Q2 · Pre-filter or post-filter in vector retrieval?

**Interview answer:** For permission-sensitive candidate selection, apply a *trusted* authorization predicate as part of retrieval rather than computing an unrestricted global top-k and hiding disallowed results afterward. Search algorithm filtering order also changes recall and latency; it cannot supply identity provenance by itself.

Consider 1,000 documents; only 10 are visible to this user. Global unfiltered top-5 might contain zero authorized documents even though relevant permitted documents exist. Returning zero after post-filtering is a **false negative**, not evidence that the authorized corpus has no answer.

| Strategy | Retrieval property | Cost / failure |
|---|---|---|
| Pre-filter | Candidate selection searches within authorized subset | More graph traversal may raise CPU / latency at highly selective filters |
| Post-filter | ANN search happens first, filter is applied later | Can miss authorized relevant results for small k or selective policies |
| Strict global post-filter | Filter after global top-k | Highest false-negative risk at small k; engine/version specific |

**Evidence:** Microsoft documents `preFilter`, `postFilter` and preview `strictPostFilter` modes for Azure AI Search, with recall/latency trade-offs. **Security rule:** Avoid using an untrusted request-supplied filter as authorization. Some hybrid/vector targeted-filter features can override a global filter; permission predicates must be carried to every relevant search branch.

### Q3 · Source ACL changed: is a previous index permission still trustworthy?

**Interview answer:** No. A copied ACL snapshot is only as current as its propagation. Define a permission-revocation SLO and choose a mechanism: synchronous resource check on fetch, an index invalidation/update stream, or enforced query-time native ACL support where the documented synchronization guarantees are sufficient. Fail closed for sensitive sources when an ACL version cannot be established.

```text
source access change → ACL sync / index update / cache invalidation
                   → ensure query sees current effective rights
                   → optionally verify at document fetch
```

- **SLO / metric:** revocation-to-denial latency; stale-ACL window; number of permission-denied retrieval attempts; cross-tenant denial rate; authorized recall@k.
- **Drill:** give Alice and Bob similar document sets, revoke Alice from one document between search and fetch, repeat through semantic caches and async jobs; require no content disclosure.
- **Boundary:** an index-side filter does not automatically revoke a cached generated answer or prevent a downstream tool with independent credentials from reopening a forbidden document.

**Official verification sources:**

- [Microsoft: Document-level access control](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) — native ACL/RBAC versus security filter, permission synchronization and preview limitations.
- [Microsoft: Security filter pattern](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search) — string comparison is not itself authentication.
- [Microsoft: Vector filtering modes](https://learn.microsoft.com/en-us/azure/search/vector-search-filters) — pre/post/strict filtering and recall-cost consequences.
- [Microsoft: Targeted hybrid filters](https://learn.microsoft.com/en-us/azure/search/hybrid-search-how-to-query) — per-vector filter overrides can replace a global filter.
- [FDEInterviews concept inventory](https://www.fdeinterviews.com/concepts) — topic inspiration only.

**Cross-chapter:** CH06 owns capability execution permissions; CH09 owns retrieval and leakage evals; CH10 owns trusted tenant identity and storage-level enforcement.


## 2.8 FDE Retrieval production contracts · Vector Index, Drift, Freshness and ColBERT (Q40–Q43)

> **2026-10-08 provenance.** Original engineering interview prompts based on the public FDE topic inventory; not paywalled answers. Algorithm explanations follow the first-party Azure AI Search documentation and the original ColBERT paper. Example tenant/document IDs, version numbers and SLOs are illustrative, not measured deployment results.

### Q40 · Vector Databases：既然有 SQL，为什么还需要向量库？

A vector index stores vectors and supports nearest-neighbor search (often ANN) plus metadata filters and, on some engines, hybrid lexical/dense retrieval. It is useful when evidence is semantic text; it is **not** the authoritative database for precise order IDs, identity or transaction commits.

```text
authoritative source (orders, docs, ACL)
 → chunk/embedding versioned build
 → index with source ID, version, tenant, permission metadata
 → trusted identity + filter → ANN/hybrid candidates
 → exact document authorization at appropriate boundary
 → evidence freshness + re-rank + grounded answer
```

| Choice | Use when | Do not assume |
|---|---|---|
| SQL exact/structured lookup | known order IDs, joins, authoritative state | embeddings improve unique-ID correctness |
| lexical/BM25 | exact terms, identifiers, uncommon error codes | embedding replacement preserves rare strings |
| ANN vector index | paraphrases, semantic policies, multilingual meaning | nearest neighbor implies business truth or permission |
| hybrid/fusion | varied query classes | extra branches automatically improve recall after ACL |

**Failure injection:** customer-specific private document receives a high similarity score. Verify the document never enters the *authorized candidate set* for another tenant. An application metadata filter is not an identity authority; permission and index sync are separate contracts (CH02 §2.7). In multi-tenant deployment, document/index version and permission scope must be carried to every search branch.

### Q41 · Embedding Versions and Drift：换 Embedding Model 为什么不能直接沿用旧索引？

Embedding spaces are **model and preprocessing version dependent**. Vectors from different encoders and changed normalization/tokenization policies cannot be presumed metrically compatible even when dimensions match; a same-dimension vector does **not** imply semantically interchangeable geometry. Even a valid new model can lower retrieval for IDs, minority locales or customer jargon.

**Version contract**:

```text
index_manifest = {source_snapshot, chunker_revision,
  embedding_model_version, normalization, metric,
  ACL_snapshot/reconciliation_version, build_time}
retrieval_request → pinned active_index_revision
rollback → prior validated revision + compatible query encoder
```

- Build a separate shadow index; backfill from a pinned source snapshot. Keep **query encoder matched to that index's document encoder**.
- Compare authorized Recall@k, nDCG/MRR, zero-hit rate, downstream grounded task success, index freshness and p95 query latency across tenant/language/source slices.
- Canary with immutable `index_revision` and an atomic alias/routing switch; rollback means switch **both query encoder and index** rather than only the index name.
- **Staleness caveat:** an old index alias may restore embeddings but also restore old permissions/documents. Permission revocation must still be enforced by a current authority. Rolling back retrieval quality may not roll back ACL policy.

**Counterexample:** a new embedding model produces 1536-dimensional vectors just like the old model. The mixed index returns many “top matches” but lower reference evidence recall. Dimension equality was not a compatibility guarantee.

### Q42 · Index Freshness and Staleness Windows：CDC 已成功是否等于 RAG 已最新？

No. Track separate timepoints: source commit, ingestion/CDC, enrichment+embedding, index visible, permission effective, cache invalidated. Query-time index visibility can lag ingestion success; “eventual consistency” is **not a quantified freshness guarantee**.

```text
source_commit → CDC_ack → embedding_completed → index_visible
                                    ↘ metadata/ACL sync
                     → authorized query + source recheck
                     → cache invalidation / trace
```

Set explicitly negotiated **source-to-query freshness SLI** and **revocation-to-denial SLI**; these are different. For sensitive authorization changes, fail closed or recheck source at fetch when index freshness cannot be proven.

**Fault drill:** revoke employee access immediately after vector retrieval but before fetching a paragraph. Require refusal at evidence fetch/prompt boundary, including previously cached results; log permission version and no forbidden evidence. **Do not** use search quality metrics to conclude access-control security is correct.

### Q43 · Late-Interaction Retrieval (ColBERT)：它比普通 Dense Retrieval 多了什么？

Classical single-vector dense retrieval represents a passage as one vector. ColBERT independently encodes query and document **at token level**, then performs late interaction (e.g. MaxSim across document token representations per query token). This preserves finer-grained term interactions while allowing document encoding offline, but raises index/storage and scoring complexity versus one vector per document.

```text
query tokens:   q1, q2, q3  → encoder → token vectors
doc tokens:     d1 ... dn   → offline encoder → token vectors
score(q,d) ≈ Σ over query tokens [max over d_j similarity(q_i,d_j)]
```

**When to test:** rare terminology or multi-concept evidence that single-vector compression misses. **When not default:** if exact IDs, permission filters, data freshness or lexical synonyms already explain the error; use simpler routes first. Evaluate authorized recall/nDCG, index size, CPU/GPU cost, search p95 and evidence-support rate. Published paper benchmark speedups apply to its measured setup; no universal production improvement is claimed here.

**Sources and boundary:** [Azure vector filtering](https://learn.microsoft.com/en-us/azure/search/vector-search-filters) and [document permissions](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) are provider-specific. [ColBERT original paper](https://arxiv.org/abs/2004.12832) defines late interaction and comparative experiments. Architecture tests above are design recommendations, not a verified enterprise rollout.


## 2.9 Graph Retrieval Runtime：Cypher 安全与多跳成本治理

> 触发材料：用户提供的“币安远程 AI Agent 岗位三面核心考察内容”搜索整理稿（未提供面试原始记录）。本节只抽取可复用的图查询工程问题，不宣称它们是币安真实面试原题。技术实现边界依据 Neo4j 官方 Cypher / Operations / Java Driver 文档核实（2026-10-11）。

### 2.9.1 先定义查询权力：Graph Query 不等于自由生成 Cypher

高风险反例：

~~~text
User text / retrieved document
  → LLM freely generates Cypher
  → general-purpose database credential
  → unrestricted MATCH / CALL / WRITE
  → graph data returned directly to LLM
~~~

生产的可信控制路径应是：

~~~text
User request
  ↓
Trusted tenant / actor / purpose
  ↓
Intent + query-template selection
  ↓
Server-owned schema allowlist / query AST policy
  ↓
Bind value parameters
  ↓
Tenant / ACL predicate (trusted, non-removable)
  ↓
Query budget: hop / rows / timeout / fan-out / bytes
  ↓
Dedicated least-privilege graph principal
  ↓
Neo4j read transaction
  ↓
Redaction / provenance / bounded result
  ↓
Evidence for Agent
~~~

**Trust boundary:** Model 只能提出要找的关系和条件；可信服务拥有查询模板、schema policy、权限上下文、参数绑定、资源预算和最终执行。不要让模型决定 tenant_id、凭据、能否绕过 ACL 或是否升级为写操作。

Neo4j 的 built-in reader 角色默认可读多个数据库的图数据，未必足够符合单租户最小授权；PUBLIC 的默认 procedure/function 权限也须核对。生产中应检查当前版本、Edition、默认角色与自定义权限，并通过受限身份与测试证明真正可达的数据范围。

**参数化不等于完整安全。** 值参数可以防止把用户数据拼进查询文本；schema 动态元素、procedure 调用、路径形状及资源消耗仍需单独治理。不同 Cypher 版本对动态 label / relationship type 的表达能力不同，不能简单说“label 永远不能参数化”。最稳健的业务路径是 server-owned query template 或受约束的 AST / schema allowlist，再对值做参数绑定。

也不能仅靠字符串黑名单拦截 MERGE / DELETE / CALL：注释、大小写、子查询、动态构造和 procedure 行为可能绕过文本规则。**权限应由数据库 + 执行层强制**，查询结构由解析器或已批准模板控制，黑名单最多是 defense-in-depth。

Java / LangGraph 节点实现示意（伪代码，接口与策略需按实际库版本适配）：

~~~java
GraphQueryNode.run(TrustedContext ctx, GraphLookupRequest request) {
    QueryTemplate template = registry.getApproved(request.intent());
    validateSchemaAndHopBudget(template, request);
    Map<String,Object> values = bindValues(request);
    values.put("tenantId", ctx.tenantId()); // never use model-supplied tenant

    return graphDriver.withScopedReadPrincipal(ctx).executeRead(
        template.cypherWithMandatoryScope(),
        values,
        timeoutPolicy.forTenant(ctx.tenantId())
    ).map(result -> validateBoundedEvidence(result, ctx));
}
~~~

这里 executeRead 是**路由/事务意图，不是授权边界**：Neo4j 官方 Java Driver 文档明确提醒，read access mode 本身不是数据修改防护的安全保证。真正的防护是数据库凭据权限、schema/AST policy、资源预算及每条分支的访问控制。

一个有边界的查询形状：

~~~cypher
MATCH (a:Service {tenantId: $tenantId, serviceId: $serviceId})
MATCH (a)-[:DEPENDS_ON*1..2]->(b:Service {tenantId: $tenantId})
RETURN DISTINCT b.serviceId AS dependency
LIMIT 50
~~~

仅为 Neo4j/Cypher 查询示例：应用必须对每个节点/边和返回属性落实真实 ACL；WHERE tenantId 过滤本身并不代表完整租户授权。建议把合法查询形状限制在经过审核的模板集合，避免把任意可变长度、路径类型、返回列交给 LLM 自由拼接。

### 2.9.2 图数据库慢在哪里：先找起点，再看扩张率

多跳遍历可能发生指数级候选扩张。粗略思路：

~~~text
degree ≈ b
hop depth = d
explored candidates can grow toward O(b^d)
~~~

这是没有严格剪枝时的直观风险模型，不是任意 Neo4j 查询的实际复杂度承诺。

排查顺序：

1. **Anchor selectivity**：是否先通过 tenant + 高选择性的 ID / entity index 锚定小集合？还是从大范围 label scan 开始？
2. **Topology**：关系类型、方向、跳数是否受限？是否出现高出度 hub、重复路径、cycle 或 path explosion？
3. **Predicate pushdown**：实体、边属性及时间有效性约束能否在遍历中剪枝，而非所有路径枚举完成后再过滤？
4. **Plan evidence**：EXPLAIN 看估计计划，PROFILE 在隔离测试环境观察 Rows、DB Hits、Memory、Page Cache、Expand / Eager / Sort。**PROFILE 会执行查询，写语句也可能真的修改数据**。
5. **Result shaping**：返回是否只取所需属性、是否去重及分页，输出 bytes 与 evidence budget 是否受控？LIMIT 只限制返回行数，不保证此前扫描/展开成本小。
6. **Ingestion consistency**：区分 source commit、CDC / stream ack、graph write applied、index online、query visibility；写入滞后不是“再调大搜索 TopK”能解决的。
7. **Capacity**：连接池、活跃事务、CPU、I/O、page cache 与写放大是否到瓶颈？是否有高并发查询互相挤占？

**预算约束**包括 hop、expand fan-out、visited nodes、候选行、timeout、返回字节、并发和 tenant quota。具体实现层不同，可通过模板预审、事务超时、队列与应用端截断等组合，不应把 LIMIT 当成唯一控制。

### 2.9.3 什么时候不该用图查询？

~~~text
订单号查订单状态
→ authoritative API / exact lookup

问“退款条款怎么理解”
→ lexical / semantic retrieval

问“服务 A 会通过哪些依赖影响部署 B”
→ graph relationship traversal

问“我是否有权限执行交易”
→ policy / authorization engine
  (not LLM or graph similarity judgment)
~~~

Graph Retrieval 输出的**路径**只是证据，需要 provenance、版本、权限与业务约束校验，不能直接升级成动作授权。

### 2.9.4 Graph Query Evaluation 与 Failure Injection

**功能质量**：实体链接正确率、关系边有效率、查询路由精确率、证据路径可追溯性、grounded answer accuracy。

**可靠性与成本**：P50/P95/P99 read latency、Rows / DB Hits、扩张节点数、timeout/cancel rate、graph freshness lag、index-online lag、connection-pool saturation、tenant-level throughput/cost。

**安全测试**：prompt injection 想扩展 hop / label / procedure；跨租户实体同名；动态 schema；绕过 tenant predicate；CALL/写能力越权；高出度节点导致 OOM；Graph index stale；凭据错误配置。要求系统 fail closed 或显式走受控降级。

### 2.9.5 Source boundary

**来源整理稿的考点**：Cypher 只读权限、白名单、参数化、注入拦截、结果数量/跳数限制，以及 Neo4j 多跳查询慢/写入滞后。

**Handbook 补充的工程抽象**：Query-Template/AST Policy、Trusted Context、真实数据库权限与资源配额、PROFILE 的执行风险、读路径与 ingest freshness 分离、图检索结果不是授权。

**Neo4j 官方依据**（核对 2026-10-11）：

- https://neo4j.com/docs/operations-manual/current/authentication-authorization/built-in-roles/
- https://neo4j.com/docs/operations-manual/current/authentication-authorization/privileges-reads/
- https://neo4j.com/docs/java-manual/current/transactions/
- https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-paths/
- https://neo4j.com/docs/cypher-manual/current/planning-and-tuning/execution-plans/
- https://neo4j.com/docs/cypher-manual/current/indexes/performance-indexes/using-indexes/
- https://neo4j.com/docs/cypher-manual/current/clauses/match/

**不要把本节示例数字（2 hops、50 rows）解释成币安参数或 Neo4j 官方建议值。**

## 2.10 Enterprise Indexing：优化 Token 从 Evidence Supply 开始

**来源事实**：[Your Token Problem Is an Indexing Problem (2026-08-07)](https://aiengineering.beehiiv.com/p/your-token-problem-is-an-indexing-problem) 归纳了 Glean 的企业索引主张：跨系统覆盖（breadth）、保留结构/权限/活动信号（depth）、按资料类型组织的专用检索路径。其上游为 [Glean 官方说明 (2026-07-29)](https://www.glean.com/blog/enterprise-ai-indexing-context)。**注意：这是供应商提出的产品/架构主张，不是跨企业受控实验。**

### 在 ingestion 做实体链接，但不要在 ingestion 固化不可更新的事实

典型客服查询：同一客户的 CRM Account、Ticket、Call Note、Contract 分属四个系统。分别取 top-k 然后交给 LLM 解决身份、时间和权限冲突，会消耗上下文，也容易把同名客户误合并。

~~~text
Sources: CRM | Tickets | Docs | Code | Calendar
                 ↓
Connectors + CDC / refresh policy
                 ↓
Normalize identifiers, retain raw IDs + source pointers
                 ↓
Entity resolution (confidence, aliases, merge / unmerge provenance)
                 ↓
Field / ACL / tenant / time / lineage / activity index
                 ↓
Logical retrieval fabric
  ├─ Exact / lexical: IDs, filenames, error codes
  ├─ Dense / semantic: paraphrase, natural language
  ├─ Structured query: CRM status, owner, amounts
  ├─ Graph / relations: customer ↔ project ↔ incident
  └─ Live federation: high-freshness or non-indexable data
                 ↓
Authorized candidates → rerank → sufficiency check
                 ↓
Compact evidence packet with citations → LLM
~~~

**设计修正：统一视图不要求“只有一个物理索引”。** 可以使用多个专用索引 + 统一身份映射、租户过滤、版本和协调层；反而把所有内容拍成一张向量表会丢失结构化语义。此处的 Graph/Entity Resolution 不等同于 GraphRAG 的社区摘要。

最小 Evidence Record 应包含：

~~~text
source_system, source_record_id, entity_id, entity_link_confidence
tenant_scope, acl_version / authorization_source
field_name / relationship, source_updated_at, indexed_at
document_version, provenance_url / raw_pointer, deletion_state
retrieval_method, retrieval_score, evidence_span
~~~

执行时使用可信 Caller Identity 在候选生成或读取时强制授权；ACL 镜像可能滞后，敏感系统要在 fetch / action 边界重新核验有效权限。活动信号可以帮助排序，**不能代替事实正确性**；浏览量高的旧文档也可能是错的。

### 为什么更好的 Index 可能省 Token

~~~text
Bad indexing → duplicate near-misses + identity reconciliation in prompt
Good indexing → narrower, source-complete and permissioned evidence
              → fewer irrelevant input tokens and re-retrieval turns
~~~

但“更好的索引必然更省 token”不成立：Recall/Sufficiency 可能要求补充证据，查询时的 live federation 也有计算/网络成本。尤其**未检索到并不等于不存在**；部分召回的答案可能被模型自信补齐，必须交给 CH04 的 Evidence Sufficiency / Abstention Gates 处理。

### 生产验收：不要只看 Top-k 相似度

| 维度 | 测量 | 不可跳过的坏例 |
|---|---|---|
| 跨系统覆盖 | authorized answer-evidence recall / required-source coverage | CRM 找到，合同例外条款漏掉 |
| 实体解析 | precision / false-merge rate / unresolved rate | 同名客户跨 tenant 误连接 |
| 时效和权限 | ingest lag / revocation-to-denial latency | 删除或撤权后依旧召回 |
| Evidence Packet | citation correctness / sufficiency / input tokens | 相关但不充分的片段被拼成确定回答 |
| 端到端 | task success / latency / cost per success | token 下降但错误决策上升 |

**本手册综合**：先提高被授权的 Evidence Supply 质量，再调 Context Packing；二者是互补杠杆，不应互相替代。CH03 负责查询路由与 Retrieval Budget，CH04 负责 Evidence Sufficiency，CH07 负责压缩，CH09 负责端到端评估。
