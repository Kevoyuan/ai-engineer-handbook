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


## 2.8 Enterprise Indexing：优化 Token 从 Evidence Supply 开始

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

