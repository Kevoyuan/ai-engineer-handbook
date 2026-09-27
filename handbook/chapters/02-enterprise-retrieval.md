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
