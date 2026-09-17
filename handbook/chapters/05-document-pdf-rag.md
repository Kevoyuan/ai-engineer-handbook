# Chapter 05 · 生产级 PDF / Document RAG
## Production-grade Document / PDF RAG

> Canonical semantic chapter.

真实企业 PDF 不是纯文本容器。多栏、页眉页脚、复杂表格、流程图、扫描页、盖章签名和跨页引用都会破坏 naive pipeline：

```text
PDF → extract text → fixed-size chunks → vector DB
```

生产级设计应看成四层处理 + 两条底线：

```text
Parse
→ Reconstruct Structure
→ Semantic Chunking + Hybrid Index
→ Controlled Document Tool Chain

Hard Requirement 1: Resolvable Citation + Claim Verification
Hard Requirement 2: Layered Evaluation Loop
```

## 5.1 Parsing：按页面类型选择方法

### Native-text PDF

直接提取 text span、font、bounding box、page coordinate、reading-order candidates。重点不是“能不能拿到字”，而是保留位置与版式信息，为后续结构恢复提供证据。

### Scanned PDF

扫描件本质是图片容器。OCR 至少输出 recognized text、bbox、confidence、page rotation 与 language。低置信区域不能静默进入索引，应重识别、换模型、标记低质量证据或进入人工复核。

### Mixed text-image PDF

需要 Layout Parser + image/chart extraction + vision-language understanding。图像不应只被标记为 `image`；应生成可检索的结构化语义，并保留与原始图、caption、page、section 的关系。

> **Choose the extraction method by document and page type; do not force every PDF through one parser.**

## 5.2 Structure Reconstruction：恢复文档语义

推荐逻辑树：

```text
Document
├── Chapter
│   ├── Section
│   │   ├── Paragraph
│   │   ├── Table
│   │   └── Figure
│   └── Footnote
└── Appendix
```

每个信息单元都应携带最细稳定定位信息。PDF 中典型为：

```text
document_id
page
section_path
paragraph_id / table_id / figure_id
bounding_box
```

更通用的规则是：**每个重要 Claim 都应能解析回该来源所支持的最细稳定 provenance granularity。** 对 PDF 可以是 page + bbox；对网页、数据库或 API 则可能是 section、record key、row id、timestamp 或 version。

结构恢复包括：

- 多栏阅读顺序；
- 标题层级与正文附着；
- 重复页眉页脚检测与正文去污染；
- 表格 row / column / header / merged cell / unit / caption / cross-page continuation；
- figure number / caption / surrounding paragraphs / page / section / vision description 绑定。

表格可额外存为 Markdown / CSV / JSON / DB rows，以支持精确查询、范围过滤、数值比较和聚合。

> **Structure reconstruction turns page objects into traceable document semantics.**

## 5.3 Semantic Chunking + Hybrid Index

Chunk 应顺着文档结构，而不是固定字符数：同标题下连续段落形成语义 Chunk；完整条款尽量不切断；表格独立结构化；图 + caption + description 绑定；超长 section 再按子标题/段落切分。

太小会缺上下文、导致碎片化召回；太大会降低 Recall precision、增加 Context 成本。

可以给孤立 Chunk 增加短 contextual enrichment，但**原文与模型生成的上下文必须分开存储**，避免把生成摘要当原始证据。

不同信息类型应走不同索引：

| 信息类型 | 推荐索引路径 |
|---|---|
| 自然语言段落 | Dense + BM25 |
| 合同条款 / 术语 | BM25 + Dense |
| 编号 / 日期 / 版本 | Exact / Keyword fields |
| 结构化表格 | SQL / structured storage + lexical retrieval |
| Section / Page / Permission | Metadata filter |
| 跨实体关系 | Optional graph index |

> **Do not embed everything in the same way. Index according to the information type and the expected query operation.**

## 5.4 Controlled Document Tools

Agent 不应默认把整份 PDF 一次性塞入 Prompt，而应按需“翻阅”：

```text
Analyze required evidence
→ search_pdf(query, filters)
→ read_page / read_section
→ extract_table / analyze_chart
→ quote_source(chunk_id)
→ Generate Answer
→ Claim Verification
```

这样能缩小 Context、降低成本，让表格和图表走专业工具，也让 Tool Call 可记录、回放并定位失败点。

工具必须有 input schema、permission checks、maximum calls、allowed scope、timeout、logging 与 idempotency。

> **The agent decides what evidence it needs; deterministic document tools control how that evidence is retrieved.**

## 5.5 Grounding Contract

```text
Draft Answer
→ Extract Claims
→ Match Each Claim to Evidence
→ Check Entailment and Scope
→ Remove / Qualify / Refuse Unsupported Claims
```

例如原文只说 `The policy may be reviewed annually.`，系统不能扩写成 `The policy is updated every year.`。

同时看：

- Citation Correctness：引用是否真的支持 Claim；
- Citation Completeness：所有关键 Claim 是否都有引用。

合同、财报、风控、合规等场景中，没有可解析来源和原始证据的关键结论不应视为完成。

> **Citation Presence ≠ Citation Correctness.**

## 5.6 Layered Evaluation

| Layer | 核心指标 |
|---|---|
| Parsing | OCR Character/Word Error Rate · confidence coverage · reading-order accuracy · page classification accuracy |
| Structure | heading hierarchy · table-cell accuracy · header/footer removal · figure-caption association |
| Retrieval | Page/Chunk Recall@K · Table Retrieval Recall · MRR / NDCG · metadata-filter correctness |
| Evidence / Answer | evidence sufficiency · citation correctness/completeness · answer correctness · false refusal · unsafe answer |

错误诊断要能定位：

```text
correct page never entered index → Parsing / Ingestion
page exists but was not recalled → Retrieval
correct page recalled but table parsed wrong → Structure
correct evidence but conclusion overreaches → Generation / Verification
insufficient evidence but system still answered → Decision Policy
```

> **A production evaluation should tell us which stage failed, not only that the final answer was wrong.**

## 5.7 Permissions, Versions, Lifecycle

需要：

```text
Tenant isolation
Document-level ACL
Page / Section restrictions
Version validity
Superseded documents
Retention / Deletion
Index refresh
Audit trail
```

权限过滤尽量发生在检索前，返回前再次校验。版本冲突可结合 `valid_from / valid_to`、`supersedes`、region、business unit、source authority；如果仍无法确认有效版本，应拒答或升级，而不是随机选一篇相关文档。

## 5.8 Grounded Document Agent

长文档问答的目标不是找到“看起来相似”的文本，而是建立可追溯 Provenance Chain：

```text
Answer Claim
→ Evidence Chunk
→ Page / Section / Element
→ Source Document
```

推荐流程：

```text
Parse Structure
→ Index with Provenance
→ Retrieve Evidence Bundle
→ Support Gate
   ├─ insufficient → rewrite / widen / inspect neighbors / abstain
   └─ sufficient
        ↓
      Answer from Evidence Bundle
        ↓
      Citation / Claim Verification
```

### EvidenceChunk

```text
text
document_id
page / section / element locator
chunk_id
bbox / element metadata
parser_provenance
retrieval_score
```

这些字段服务于版本与权限、可验证定位、缓存/回放/评估、视觉文档定位、Parser 回归分析以及 Threshold / Reranking / Failure Analysis。

> **Parsing quality sets the upper bound for retrieval.**

工程上可以把质量理解成短板乘法：

```text
Document QA quality
≈ Parsing
× Retrieval
× Evidence Selection
× Generation
× Citation Verification
```

这不是严格数学定律，而是提醒：上游结构被破坏后，后面的 Embedding 和 LLM 很难可靠重建原始语义。

### Agentic boundary

普通 RAG 可以只有一次 `retrieve → generate`。Agentic Document QA 从“检索变成决策过程”开始：系统基于当前证据决定是否继续检索、扩大范围、查看邻页、重写 Query 或 Abstain。

这个 Loop 必须 bounded：显式最大检索轮数、停止条件、权限边界和成本预算。

> **A grounded system should maximize supported answer rate, not answer rate. Abstention under insufficient evidence is a reliability mechanism, not a failure.**

## Source notes

Grounded Document Agent 的公开实现示例曾使用 AI Engineering, *Hands-On: Build a Grounded Document Agent* 作为来源之一。框架和具体 parser/tool 只是实现样例；本章 canonical 规则是 provenance-first parsing、controlled evidence access、support gate、claim verification、bounded re-retrieval 与 abstention。

Source: https://aiengineering.beehiiv.com/p/hands-on-build-a-grounded-document-agent
