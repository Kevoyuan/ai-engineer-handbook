# AI Engineer Handbook

> Canonical semantic manuscript · active chapters 02–09
>
> Last synchronized: 2026-09-15

本文件是当前 AI Engineer Handbook 的**语义内容源（semantic source of truth）**。它保存这本书真正要表达的工程知识：概念、架构、边界、失败模式、指标、决策规则、公式与来源说明。

`web/` 是**展示源（presentation source of truth）**：负责 HTML、图解、交互、响应式布局、中英文切换与站内搜索。展示层可以为了阅读体验改变布局，但不能改变这里的技术含义。

未来新增知识默认遵循：

```text
research / verify
→ merge semantic content into this Markdown
→ decide the right chapter and knowledge structure
→ update HTML / diagrams / interactions
→ i18n / search / responsive QA
→ GitHub main
→ Vercel production
```

交互不是默认目标。优先把内容写成一本可读、可检索、可长期维护的技术书；只有当“操作输入本身能帮助理解”时，才增加 interaction。

---

## 目录

- Chapter 02 · 企业检索基础 / Enterprise Retrieval Foundations
- Chapter 03 · 混合检索与 Query Routing / Hybrid Retrieval and Query Routing
- Chapter 04 · RAG 可靠性与选择性回答 / RAG Reliability and Selective Answering
- Chapter 05 · 生产级 PDF RAG / Production-grade PDF RAG
- Chapter 06 · Skills 与路由 / Skills and Routing
- Chapter 07 · Memory 与上下文工程 / Memory and Context Engineering
- Chapter 08 · Agent 编排与内容生成 / Agent Orchestration and Content Generation
- Chapter 09 · 可靠性、评估与可观测性 / Reliability, Evaluation, and Observability

---

# Chapter 02 · 企业检索基础
## Enterprise Retrieval Foundations

企业检索不是“选一个最强 Retriever”，而是根据证据形状组合不同能力。Exact、BM25、Dense、Graph 与 Metadata 各自解决不同问题，不能互相替代。

## 2.1 Exact Retrieval：确定性匹配

Exact Retrieval 适合订单号、工单号、VIN、SKU、Error Code、API 名、版本号、Part Number 等结构化标识符。它的优势是确定性、可解释、低延迟；但生产实现通常需要字段感知的索引与标准化，而不是简单字符串比较。

典型预处理包括大小写、空格、分隔符、前后缀、别名、版本格式、区域格式和业务规范化。一个标识符查询如果本来可以走数据库主键、Keyword Field 或 Term Query，就不应默认交给向量相似度。

> Exact retrieval is best for identifiers, but usually needs field-aware indexing and normalization.

## 2.2 BM25：词法相关性

BM25 基于倒排索引与词项统计，擅长领域术语、产品名称、错误描述、技术文档、API 文档、法规条款、函数名等 lexical overlap 明显的查询。

它的弱点是改写、同义词、跨语言表达与低词面重叠。BM25 也不是主键查询：即使它对某些 ID 有较好召回，也仍属于“词法检索”，而不是确定性身份匹配。

> BM25 handles lexical relevance; it is strong for terminology and weaker for paraphrases.

## 2.3 Dense Retrieval：语义相似性

Dense Retrieval 把 Query 与文档映射到向量空间，适合自然语言改写、同义表达、语义搜索和部分跨语言场景。

必须牢记两条边界：

1. identifier、版本号、数值等离散标识在向量空间里可能并不稳定；
2. topical similarity 不等于 factual / operational equivalence。例如 “cancel subscription” 与 “renew subscription” 主题相近，但动作方向相反。

Embedding 模型发生变化时，通常需要重新索引，并重新评测旧索引与新索引的一致性。

> Dense retrieval handles meaning; semantic similarity is not factual or operational equivalence.

## 2.4 Graph Retrieval：关系与多跳

Graph Retrieval 适合“谁依赖谁”“某零件属于哪些 BOM”“这个实体与哪些系统相关”“某变更影响哪些节点”等关系型、多跳型问题。典型来源包括 ERP、PLM、组织关系、依赖图和知识图谱。

图检索的成本在于实体构建、关系抽取、实体消歧、增量更新与版本治理。它不是所有 Query 的默认检索器；只有当答案依赖关系结构时才值得使用。

## 2.5 Metadata Filtering：先缩小合法候选空间

Metadata 典型字段包括 tenant、role、country、language、document type、version、effective date、confidentiality、business unit 等。

它的作用不只是提高相关性，还包括：

- tenant isolation；
- 避免过期文档污染；
- 减少候选数量、延迟与成本；
- 把权限约束提前到检索阶段。

过严的 Metadata Filter 会伤害 Recall，因此需要和真实 Query 分布一起校准。

生产顺序应优先是：

```text
User Query
  ↓
Identity / Tenant / Role / ACL / Metadata
  ↓
Authorized Candidate Space
  ↓
BM25 / Dense / Exact / Graph
  ↓
Evidence
```

> **Authorization before semantic similarity.**

未经授权的文档不应先被检索出来再依赖 Prompt “不要说出去”；它们最好根本不进入候选集合和模型上下文。

---

# Chapter 03 · 混合检索与 Query Routing
## Hybrid Retrieval and Query Routing

企业搜索通常需要 Exact + BM25 + Dense + Metadata，再按关系型任务选择性接入 Graph / SQL / Tool。真正的工程问题不是“支持多少种检索”，而是**当前请求需要什么证据路径**。

## 3.1 Hybrid Retrieval Pipeline

推荐把系统拆成五层：

```text
1. Index / Field Layer
   Exact / Keyword · BM25 · Dense · Optional Graph

2. Query Analysis
   query_type · domain · entities · identifiers
   time_scope · risk · required_evidence

3. Authorization / Metadata Filter
   Identity → Tenant / Role / ACL → Authorized Candidate Space

4. Candidate Fusion and Reranking
   RRF / fusion → Cross-Encoder or LLM Reranker

5. Evidence + Answer Evaluation
   retrieval metrics + E2E metrics
```

不同 Retriever 的 raw scores 通常不在同一标尺上。不要直接把 BM25 score 与 cosine similarity 相加。

### RRF

Reciprocal Rank Fusion 只依赖名次：

```text
RRF(d) = Σ 1 / (k + rank_i(d))
```

`k=60` 只是常见示例，不是标准答案，应该在自己的评测集上验证。

RRF 解决的是**候选融合**，不是最终相关性证明。融合后仍可能需要 Cross-Encoder / LLM Reranker 与 Evidence Validation。

## 3.2 Query Routing：先判断证据形状

Router 的职责包括：选择数据源、选择检索方式、决定是否并行、决定是否需要工具、决定信息不足时澄清还是停止。

常见路由：

| Query 形状 | 首选路径 |
|---|---|
| 精确 ID / 标识符 | Exact Field / DB / Term Query |
| 术语 / 关键词 | BM25 + Metadata |
| 语义 / 流程问法 | Dense + BM25 fallback / Hybrid |
| 数值聚合 | SQL / OLAP / Analytics Tool |
| 关系 / 多跳 | Graph / DB / Tool + source evidence |
| 同时含 ID 与原因描述 | Exact + BM25 / Dense 组合 |
| 信息不足 | Clarify |
| 非知识库闲聊 | No Retrieval |

Router 可以按四层能力组织：

```text
Layer 1  No Retrieval
Layer 2  Deterministic Retrieval: Exact / DB / SQL / Metadata
Layer 3  Knowledge Retrieval: BM25 / Dense / Graph
Layer 4  Hybrid / Composed: multi-retriever / RRF / reranker / tool chain
```

一个完整执行链可以是：

```text
User Query
→ Query Analyzer
→ Authorization + Capability Check
→ Route Plan
→ Retriever / Tool Execution
→ Fusion + Reranking (when needed)
→ Evidence Sufficiency + Answer Policy
```

> **Use the cheapest reliable route first, and expand retrieval only when the query or uncertainty requires it.**

## 3.3 Router 演进：不要一开始就用最复杂模型

合理路径通常是：

```text
Deterministic Parsing
→ Rule-based Routing
→ Lightweight Learned Router
→ LLM Fallback for ambiguous long tail
→ Feedback-driven improvement
```

先统计真实 Query 分布，再让规则覆盖高频、低歧义场景；小模型处理可学习的边界；LLM 只接低置信、长尾、组合意图。日志与人工纠错持续构成训练集。

“规则覆盖 80%”“规则超过 20 条再升级”等只能是经验启发，不是通用标准。

Embedding / small-model Router 的优势是低延迟、成本稳定、适合固定意图集；弱点是组合意图与新领域。LLM Router 的优势是 zero-shot、长尾和复杂约束，代价是更高延迟/成本，而且输出仍需 Schema Validation、Capability Check 与 Authorization。

常见生产组合：

```text
Rules / Exact Parser
→ Lightweight Router
→ LLM Fallback for ambiguous tail
```

## 3.4 多路并行不是默认答案

“所有路径都走一遍”通常不是路由，而是放弃路由决策。只有下列情况更合理：Query 同时有 ID 和自然语言原因、Router 置信度低且风险允许扩大 Recall、离线调查明确以 Recall 为先、建立评测基线、或单一 Retriever 有已知盲区。

并行时必须同时约束 concurrency、timeout、permission filtering、dedup / fusion、degradation path 和 cost budget。

## 3.5 路由失败与恢复

```text
Primary Route
→ no trustworthy candidates
→ Query Rewrite / Alias Expansion
→ Secondary Route
→ Hybrid Retrieval
→ Clarify / Refuse / Escalate
```

不要把所有失败统称为 Router 错误：

- `routing_failure`：选错数据路径；
- `retrieval_failure`：路径正确但没有召回有用证据；
- `data_failure`：数据缺失、过期或没有权限；
- `generation_failure`：证据正确但答案生成错误。

Router 评估除了 Top-1 / Top-K Accuracy，还应看 No-route / Clarify Accuracy、Identifier Extraction Accuracy、Per-route Recall@K / NDCG、Oracle-route Gap / Route Regret、E2E Answer Correctness、Task Success、Fallback Rate、Latency P50/P95、Cost/query 与 Unauthorized Route Rate。

Cache Key 至少应包含：

```text
normalized_query
user / tenant / role
router_version
capability_registry_version
index_version
knowledge_snapshot
```

知识库或能力注册表变化后，应通过 TTL 或版本号主动失效。

## 3.6 Retrieval Budget ≠ Context Budget

“召回 20 个文档但 Context 放不下”不能只靠降低 TopK 解决。至少分三个独立预算：召回广度、精排候选、最终上下文容量。

```text
Broad Retrieval (K_retrieve, protect recall)
→ ACL / Metadata Filter + Dedup
→ Rerank (K_rerank, improve precision)
→ Coverage Selection (diversity / MMR / sub-question coverage)
→ Context Packing (K_context, explicit token budget)
```

召回的目标是避免漏证据；Context 的目标是把最有用、覆盖最完整的证据在 Token 预算内交给模型。两者不应混成一个 TopK 参数。

---

# Chapter 04 · RAG 可靠性与选择性回答
## RAG Reliability and Selective Answering

开放企业知识库里几乎不可能承诺 “100% Retrieval Accuracy”。更合理的目标是 **Trustworthy Answering**：证据充分才回答；部分充分则部分回答；问题缺信息则澄清；证据不足则继续检索或拒答；高风险则升级人工。

Prompt 写一句“不知道就拒答”不够，因为 Prompt 无法证明：Retriever 没漏召、证据真的支持结论、来源之间不冲突、关键推理跳完整、版本有效、用户有权限。

> **Prompt can encourage abstention. It cannot prove that abstention is correct.**

## 4.1 Six Gates

### Gate 0 · Query Analysis

抽取 domain、intent、entity、time scope、risk、required evidence。信息不完整时优先 Clarify，而不是把不完整请求直接当 OOD。

### Gate 1 · Knowledge Coverage

检查支持的 domain、时间范围、实体目录、文档类型与 Capability Registry。注意：理论上覆盖某领域，不代表库里一定存在当前问题的具体答案。

### Gate 2 · Retrieval Quality

联合多个信号：Exact hit、Top-K score、Reranker score、Score margin、Retriever agreement、Source authority、Freshness、Metadata match。

低分只表示“不确定”，不能证明“知识库一定没有答案”。

### Gate 3 · Evidence Sufficiency

对证据集合判断 SUPPORT / REFUTE / IRRELEVANT / INSUFFICIENT / CONFLICT。核心问题不是“文档相关吗”，而是“这些证据合起来是否足以支持完整答案”。

要检查多跳是否缺一跳、来源是否冲突、是否只有背景材料、multipart question 是否都覆盖。

> **Relevant evidence is not necessarily sufficient evidence.**

### Gate 4 · Claim Verification

```text
Answer
→ Claim Extraction
→ Claim–Evidence Alignment
→ Support Check
```

每个关键 Claim 都应有证据；Citation 必须正确；结论不能超出来源范围；“可能”不能被扩写为“确定”。

### Gate 5 · Decision Policy

```text
ANSWER
PARTIAL_ANSWER
CLARIFY
RETRIEVE_MORE
ROUTE_TO_OTHER_SOURCE
ESCALATE
REFUSE
```

## 4.2 Threshold 需要校准

反模式：

```python
if similarity < 0.8:
    refuse()
```

应构造代表性评测集：Answerable、Unanswerable in-domain、OOD、Outdated、Conflicting、Partial evidence，然后按 domain / query type / language / retriever / risk 分别校准阈值。

关键指标包括 Coverage、Selective Risk、Unsafe Answer Rate、False Refusal Rate、Citation Correctness、Citation Completeness、Conflict Detection Rate、Evidence Sufficiency Accuracy。

真正要看的是 **Risk–Coverage Curve**，而不是单点 Accuracy：回答越多 Coverage 越高，但风险可能上升；拒答越多风险下降，但可用性也下降。

高质量拒答应说明：找到什么、缺什么、为什么暂时不能可靠回答、下一步是什么；但不能泄漏“存在一个你无权访问的敏感文件”这类未授权资源存在性。

---

# Chapter 05 · 生产级 PDF RAG
## Production-grade PDF RAG

真实企业 PDF 不是纯文本容器。多栏、页眉页脚、复杂表格、流程图、扫描页、盖章签名和跨页引用都会破坏 naive pipeline：

```text
PDF → extract text → fixed-size chunks → vector DB
```

生产级设计应看成**四层处理 + 两条底线**：

```text
Parse
→ Reconstruct Structure
→ Semantic Chunking + Hybrid Index
→ Controlled Document Tool Chain

Hard Requirement 1: Page-level Citation + Claim Verification
Hard Requirement 2: Layered Evaluation Loop
```

## 5.1 Parsing：先识别页面类型，再选解析方法

### Native-text PDF

直接提取 text span、font、bounding box、page coordinate、reading-order candidates。重点不是“能不能拿到字”，而是保留位置与版式信息，为后续结构恢复提供证据。

### Scanned PDF

扫描件本质是图片容器。OCR 至少输出 recognized text、bbox、confidence、page rotation 与 language。低置信区域不能静默进入索引，应重识别、换模型、标记低质量证据或进入人工复核。

### Mixed text-image PDF

需要 Layout Parser + image/chart extraction + vision-language understanding。图像不应只被标记为 “image”；应生成可检索的结构化语义，并保留与原始图、caption、page、section 的关系。

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

每个信息单元都应携带定位信息：

```text
document_id
page
section_path
paragraph_id / table_id / figure_id
bounding_box
```

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

可以给孤立 Chunk 增加短的 contextual enrichment，但**原文与模型生成的上下文必须分开存储**，避免把生成摘要当原始证据。

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

Agent 不应把整份 PDF 一次性塞入 Prompt，而应按需“翻阅”：

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

## 5.5 Page-level Citations + Claim Verification

```text
Draft Answer
→ Extract Claims
→ Match Each Claim to Evidence
→ Check Entailment and Scope
→ Remove / Qualify / Refuse Unsupported Claims
```

如果原文只说 “The policy may be reviewed annually.”，系统不能扩写成 “The policy is updated every year.”。

要同时看：

- Citation Correctness：引用是否真的支持 Claim；
- Citation Completeness：所有关键 Claim 是否都有引用。

合同、财报、风控、合规等场景中，没有页码与原始证据的关键结论不应视为完成。

## 5.6 Layered Evaluation

| Layer | 核心指标 |
|---|---|
| Parsing | OCR Character/Word Error Rate · confidence coverage · reading-order accuracy · page classification accuracy |
| Structure | heading hierarchy · table-cell accuracy · header/footer removal · figure-caption association |
| Retrieval | Page/Chunk Recall@K · Table Retrieval Recall · MRR / NDCG · metadata-filter correctness |
| Evidence / Answer | evidence sufficiency · citation correctness/completeness · answer correctness · false refusal · unsafe answer |

错误诊断要能定位：正确页面没进索引（Parsing/Ingestion）、页面存在但没召回（Retrieval）、召回正确但表格解析错（Structure）、证据正确但结论越界（Generation/Verification）、证据不足仍回答（Decision Policy）。

> **A production evaluation should tell us which stage failed, not only that the final answer was wrong.**

## 5.7 Permissions, Versions, Lifecycle

需要 Tenant isolation、Document-level ACL、Page/Section restrictions、Version validity、Superseded documents、Retention/Deletion、Index refresh 与 Audit Trail。

权限过滤尽量发生在检索前，返回前再次校验。版本冲突可结合 `valid_from / valid_to`、`supersedes`、region、BU、source authority；如果仍无法确认有效版本，应拒答或升级，而不是随机选一篇相关文档。

## 5.8 Grounded Document Agent：从 PDF 检索到可验证证据链

长文档问答的目标不是找到“看起来相似”的文本，而是建立可追溯的 Provenance Chain：

```text
Answer Claim
→ Evidence Chunk
→ Page / Section
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

### EvidenceChunk：把 provenance 当成一等数据

```text
text
document_id
page
section
chunk_id
bbox / element metadata
parser_provenance
retrieval_score
```

这些字段分别服务于版本与权限、可验证页面定位、缓存/回放/评估、视觉文档定位、Parser 回归分析以及 Threshold/Reranking/Failure Analysis。

> **Parsing quality sets the upper bound for retrieval.**

一个实用的系统质量模型是：

```text
Document QA quality
≈ Parsing
× Retrieval
× Evidence Selection
× Generation
× Citation Verification
```

这不是严格数学定律，而是工程上的“短板乘法”：上游结构被破坏后，后面的 Embedding 和 LLM 很难可靠重建原始语义。

### Grounding Contract

> **Citation Presence ≠ Citation Correctness.**

出现 `[Page 17]` 只能证明系统打印了 Citation；真正可靠需要：引用页面支持对应 Claim，而且用户能够回到原文验证。

更严格的三层关系：

```text
Citation Presence
→ Citation Correctness
→ Claim–Evidence Entailment
```

### Agentic Boundary

普通 RAG 可以只有一次 `retrieve → generate`。Agentic Document QA 从“检索变成决策过程”开始：系统基于当前证据决定是否继续检索、扩大范围、查看邻页、重写 Query 或 Abstain。

这个 Loop 必须 bounded：显式最大检索轮数、停止条件、权限边界和成本预算。

> **A grounded system should maximize supported answer rate, not answer rate. Abstention under insufficient evidence is a reliability mechanism, not a failure.**

来源示例：AI Engineering, *Hands-On: Build a Grounded Document Agent*。公开项目说明确认 long-PDF QA、LlamaParse、Ollama 与精确页面引用。本节的 Support Gate、Claim–Evidence Verification、bounded re-retrieval 与 abstention 是基于生产 RAG / Agent Reliability 原则的工程化扩展。

Source: https://aiengineering.beehiiv.com/p/hands-on-build-a-grounded-document-agent

---

# Chapter 06 · Skills 与路由
## Skills and Routing

当 Skills 超过 100 个，问题不再是 Prompt 怎么写，而是 **Retrieval + Classification + Policy Routing + Governance**。把所有 Skill 放进 Prompt 会增加 Token、延迟、注意力稀释、位置偏差、描述冲突，并可能暴露未授权能力。

## 6.1 Skill Contract

一个成熟 Skill 至少描述：

```yaml
name: analyze_contract_risk
version: 2.1
when_to_use:
  - user asks to identify risky clauses in a contract
when_not_to_use:
  - general legal advice
  - document is an invoice
  - user asks system to approve contract
required_inputs:
  - contract_content_or_id
  - jurisdiction
required_permissions:
  - CONTRACT_READ
risk_level: medium
requires_human_review: true
```

> **A skill description should define the decision boundary, not advertise the feature.**

命名优先 `Verb + Business Object + Optional Constraint`，例如 `retrieve_invoice_by_id`、`validate_refund_request`、`analyze_contract_risk`。避免 `helper`、`smart_tool`、`analysis`、`process_data` 这类模糊名字。

除了 Positive Examples，也必须提供 Hard Negatives 与容易混淆的邻近 Skill。

> **Positive examples improve recall; hard negatives improve boundaries.**

## 6.2 Soft Hierarchical Routing

可以按：

```text
Domain → Capability → Operation → Version
```

组织 Skill Space，但第一层不要只选一个 Domain。保留 Top-M Domains，避免上层误判让正确 Skill 永久不可见。

> **Hierarchy should reduce the search space without creating an irreversible early decision.**

两阶段路由：

```text
User Request
→ Candidate Generation: Exact / BM25 / Dense / Tags
→ Candidate Fusion
→ Permission / Availability Filter
→ Reranker
→ Decision Gate
```

Reranker 不只看 Query↔Description，还要考虑 current goal、task state、available/missing inputs、permission、risk、cost 与 recent tool results。

Decision Gate 应允许：

```text
DIRECT_SKILL
MULTI_SKILL_PLAN
CLARIFY
NO_MATCH
APPROVAL_REQUIRED
REJECT
```

> **A router that always returns a skill is not reliable.**

`NO_MATCH` 是可靠系统的一等结果，否则系统只是在强制分类。

## 6.3 Skill Match ≠ Authorization

完整顺序应是：

```text
Intent
→ Capability
→ Candidate Skills
→ Skill Match
→ Permission
→ Risk
→ Input Validation
→ Approval
→ Execution
```

> **Skill match is not authorization.**

## 6.4 Skill Registry & Governance

Registry 可以存：

```text
skill_id · version · domain · tags
input/output schema
when_to_use / when_not_to_use
examples · hard negatives
permissions · risk
owner · health · status · cost
```

对于重叠 Skill，要 Merge / Deprecate / Rename / Narrow Scope / Parameterize / Add Negative Boundaries。例如多个 daily/weekly/monthly report 技能可以合并成 `generate_periodic_report(period)`。

> **Prefer parameterized skills over duplicated skills.**

Routing Eval 应看 Candidate Recall@K、Top-1、MRR、No-Match Accuracy、Clarification Accuracy、Multi-Skill Planning Accuracy、Unauthorized Skill Exposure、E2E Task Success、Latency 与 Cost，并区分 Retriever / Reranker / Input / Execution / Tool Failure。

## 6.5 MCP vs Skill

MCP 解决的是协议与接入：标准化 Tools / Resources / Context 的 exposure、discovery、schema、connection 和 transport。

Skill 解决的是能力契约：一类任务什么时候适用、需要什么输入、如何执行、怎样验证、如何版本治理。

MCP 不天然保证业务授权、幂等、事务与任务成功；Skill 也不天然定义跨进程或跨系统通信协议。

可以把能力栈理解为：

```text
Business Goal
→ Skill Contract
→ Workflow / FSM
→ MCP Access
→ Tool / API / DB Execution
```

> **Protocol exposes capabilities; skills encode reusable task procedures. Neither one replaces authorization, validation, or orchestration.**

## 6.6 Function Calling：模型提议，Host 执行

```text
Tool Schema
→ Model Proposal: tool + args
→ Schema Validate
→ Authorization / Risk / HITL Gate
→ Host Execute
→ Result Validate
→ Continue / Retry / Fallback / Clarify / Escalate
```

Function Calling 是 Structured Action Proposal，不是授权系统。模型不应因为“选择了一个 Tool”就自动获得执行权。

Transient timeout / 5xx 可以 bounded retry；4xx / permission denied 一般不应盲目重试。对有副作用的动作，如果状态不确定，应先 reconciliation，再决定是否重试，避免重复扣款、重复创建或重复发送。

---

# Chapter 07 · Memory 与上下文工程
## Memory and Context Engineering

Memory 不是“把聊天记录永久保存”。可靠设计必须区分生命周期、语义类型、读写策略、权限与版本。

## 7.1 六层 Memory Structure

### 1. Session Metadata

`conversation_id · user_id · tenant_id · locale · current_task · permissions`

作用域是单次请求/会话，属于 ephemeral context。

### 2. Working Memory

`current plan · intermediate results · open questions · tool outputs`

面向当前任务，任务结束可以过期。

### 3. Structured Profile

`language preference · role · approved tools · report format`

保存稳定、显式维护的偏好与配置。

### 4. Episodic Memory

记录“发生过什么”：user asked X、system did Y、result Z、feedback ±。它更像 Event Log，需要 provenance。

### 5. Semantic Memory

组织/项目事实、定义、政策等稳定知识。

### 6. Procedural Memory

“How to perform task X”、validated workflow、repair strategy 等可复用过程。

短期层（Session / Working）可以随会话快速流动；长期层（Profile / Episodic / Semantic / Procedural）不应让模型自由写入，必须进入受控 Write Pipeline。

## 7.2 Ledger + Views + Policy

建议事件与事实 append-only，不原地改写历史；当前 Profile / Current State 作为 Materialized View 从事件日志派生。

每条长期 Memory 需要明确：source、confidence、owner、scope、validity、sensitivity、version，并区分 Valid Time 与 Transaction Time。

### Write Pipeline

```text
Conversation / Event
→ Candidate Extraction
→ Normalize + Deduplicate
→ Conflict Check
→ Permission / Policy Check
→ Store with provenance and validity
→ Update Views
```

### Read Pipeline

```text
Current Query
→ Query Classification
→ Access Filter
→ Retrieve Relevant Memory
→ Rank by Relevance + Recency + Quality
→ Assemble Context
```

多用户系统必须按 tenant_id、user_id、resource ACL 与 memory scope 隔离。未授权 Memory 不应进入 Retriever 候选、不应进入模型 Context，也不应在拒答中泄漏其存在。

## 7.3 Short-term → Long-term Promotion

短期记忆不会自动“变成”长期记忆。Promotion 过程应是：

```text
Working State
→ Candidate Extraction
→ Importance + Stability
→ Dedup + Conflict Check
→ Long-term Store + Provenance
```

只晋升稳定、可复用、用户授权、低冲突的信息。临时 Tool Output、未验证推断、敏感信息默认不晋升。

## 7.4 Context Compression

典型触发条件：

```text
Token budget approaching threshold
Topic / task phase changes
Stable decision reached
Repeated transcript with little new information
Large tool result but only small evidence subset is needed
Long-running session checkpoint
```

不要无限做“摘要的摘要”。保留 Event Log 和关键 provenance，再从可验证原始记录重新构建 Compact View。

> **I do not treat the transcript as the state. I maintain structured state and compress views while preserving provenance.**

---

# Chapter 08 · Agent 编排与内容生成
## Agent Orchestration and Content Generation

Agent 系统的核心不是“让模型自由行动”，而是把不确定决策放在 Agent，把可重复转换放在 Deterministic Service，并通过 State、Artifacts、Validation、Recovery 和 Policy 控制执行。

## 8.1 Artifact-driven Workflow

以多媒体生成任务为例，生产系统不应是：

```text
User Prompt → Image API → Video API
```

更可靠的是版本化 Artifact Graph：

```text
Creative Brief
→ Story Outline → Script
→ Character Cards → Scene Cards
→ Shot List → Shot Prompts
→ Images / Clips → Audio
→ Final Timeline
```

每个 Artifact 至少保存：

```text
artifact_id
type
version
dependencies
validation_status
model
prompt_version
cost
timestamp
```

> **Every artifact needs an ID, version, lineage, and validation status.**

Agent 适合 clarification、planning、creative revision、diagnosis、replanning 等不确定决策；Deterministic Service 适合 schema validation、prompt assembly、rendering、subtitle generation、permission checks、file conversion 等可重复转换。

> **Use agents for uncertain decisions and deterministic services for repeatable transformations.**

Character consistency 需要 Canonical Character Card、Reference Asset Library、Identity Conditioning、Shot-level Consistency Check 与 Continuity State（identity / costume / object / spatial / temporal / emotion）。

一个 good shot 应是最小的“可独立生成 + 可独立验证”视觉单元，结构字段可包含 duration、purpose、camera、motion、characters、continuity、transition、constraints。

Evaluator 应分层：Script / Storyboard / Visual / Audio / Final Render，并组合 Deterministic Rules、Specialized Models、Multimodal Judge 与 Human Review。输出不应只有分数，还要有 status、failure type、evidence、suspected root cause、repair scope、recommended action。

> **Evaluation should produce repair instructions, not only scores.**

## 8.2 D-I-R：Root Cause + Minimum-scope Repair

```text
Failure
→ Diagnose earliest incorrect Artifact
→ Invalidate only downstream dependencies
→ Regenerate minimum affected scope
```

例如只修改服装，则产生 Character Costume v2，只失效依赖该服装的 shots，而不是从脚本开始全部重跑。

> **Regenerate from the earliest incorrect artifact, not from the beginning.**

## 8.3 Async State, Idempotency, Parallelism

长任务可以：

```text
Orchestrator → Queue → Worker → Artifact → Event → Resume
```

状态包括 `QUEUED · RUNNING · SUCCEEDED · FAILED · CANCELLED`，前端可通过 SSE / WebSocket / Polling 获取进度。

所有可能产生副作用或计费的生成任务都需要 `idempotency_key`。Request timeout 不代表任务没开始；重试前先 reconciliation，避免重复计费和重复 Artifact。

可并行的通常是 independent shots、audio variants、preview；continuity-dependent shots 与上游未锁定的任务需要串行。

成本策略：Preview → Validate → Final Render；创意决策稳定前尽量用低成本模型；复用 Character/Scene Assets；限制 Retry；设置项目 Budget。

## 8.4 Workflow State Machine

任务状态属于数据库或 Workflow Engine，不属于 LLM 的隐式“记忆”。例如：

```text
DRAFT
→ BRIEF_VALIDATED
→ STORY_APPROVED
→ ASSETS_LOCKED
→ STORYBOARD_APPROVED
→ GENERATION
→ VALIDATION
→ TARGETED_REPAIR
→ POST
→ REVIEW
→ PUBLISH
```

Human-in-the-loop Gates 可放在 Brief approval、Character approval、高风险内容与 Final publish。

## 8.5 Multi-Agent：按 Operational Boundary 拆

值得拆分的条件包括：权限边界不同、工具/运行环境不同、子任务可独立评估、有真实并行收益、需要独立 Critique、不同模型/成本策略、高风险隔离。

不值得拆的典型情况：只是把角色叫 Researcher / Manager / Critic；所有 Agent 共享同一状态和工具；没有独立验收；通信开销超过专业化收益。

> **I split agents at operational boundaries, not personality boundaries.**

一个通用 Agent System Skeleton：

```text
User
→ Router
→ Agent / Workflow
→ RAG + MCP / Tools
→ State / Memory
→ Validation / Guardrails

Side channel:
Trace → Eval → Dashboard → Human Escalation
```

## 8.6 Loop vs Graph：局部自治 vs 显式拓扑

Loop 和 Graph 不是互相替代的两代技术。

**Loop** 是局部自治控制模式：

```text
Goal
→ Observe
→ Reason / Plan
→ Act
→ Verify
→ Stop or iterate
```

适合一个连贯目标、共享上下文、统一权限边界、明确验证方式与显式停止条件。

**Graph** 是显式 orchestration topology：

```text
Router
→ bounded work units
→ branch / join
→ checkpoint
→ validation
→ recovery
```

适合出现结构性边界：并行轨道、不同 context/memory/permission、branch/join、checkpoint/resume、failure isolation、可审计控制点、高风险 HITL。

Graph Node 不等于 Agent Loop。节点可以是 deterministic function、retrieval、tool execution、policy gate、human approval、sub-workflow，也可以是 agent loop。

推荐演进：

```text
LLM Call
→ Tool-using Agent
→ Bounded Agent Loop
→ Deterministic Workflow + Loop
→ State Graph
→ Multi-Agent Graph
```

这不是“技术代际排名”，而是协调复杂度逐步增加。

> **Use the least control-flow complexity that still makes state, stopping conditions, permissions, and recovery explicit.**

> **A graph does not repair a broken loop.**

来源：AI Engineering, *Loop vs Graph Engineering Clearly Explained*（2026-08-13）。本手册保留“Graph 组织更高层工作”的直觉，同时严格区分 topology 与 autonomous loop。

Source: https://aiengineering.beehiiv.com/p/loop-vs-graph-engineering-clearly-explained

## 8.7 Coding Agent Engineering

Coding Agent 没有消除软件工程流程，而是重新分配工程师注意力：少花时间手写代码，多花时间决定做什么、设计架构、写清 Spec、校准自主权、验证产出，并把运行证据反馈到前面的阶段。

```text
Planning
→ Execution
→ Deployment & Monitoring
↺ verification / monitoring evidence can send work back upstream
```

### Planning

研究问题、理解现有代码库、写需求与技术 Spec、确定架构与约束、定义 Acceptance Criteria、拆执行计划，并审查关键假设、安全风险和过度设计。

### Execution

让 Agent 构建、测试、验证；同时决定哪些步骤需要高频人机往返、哪些可以委托为较大工作块。需要管理 Context、权限、并行 Agent 和人的 Attention Budget。

### Deployment & Monitoring

通过 CI/CD 与必要的 Human Gate 部署；Agent 可以辅助观察日志、发现问题与提出修复，但生产副作用仍需显式权限、验证、回滚和审计边界。

Verification failure 不应默认解释成“再生成一次代码”。它可能意味着 Spec 不清、架构假设错误、Context 过期、任务拆分不合理或 Verifier 本身不足。

五项核心能力：

| Skill | 工程师真正决定的事 |
|---|---|
| Directing the workflow | 规划深度、开始/回退时机、速度/成本/技术风险/人工投入权衡 |
| Enabling agent autonomy | 各阶段自主权、并行度、权限与 Blast Radius |
| Reviewing the work | 什么证据能证明完成；自动测试、行为验证、Artifact、Eval、代码/安全/架构审查、人审边界 |
| Customizing agent & environment | Skills、Plugins、MCP、Hooks、项目级 Standing Context、跨 Session 状态、复盘与 Agent-generated debt 治理 |
| Coding agent foundations | 代码搜索、Context Retrieval、Context Window、Tool/Subagent、Harness 如何约束行为 |

自主权应被视为**阶段级控制变量**，不是成熟度徽章。高自主权更适合可验证、可回滚、Blast Radius 小的工作；高风险规划、权限变更、生产副作用和不可逆动作需要更强 Human Gate。

Context 是工程基础设施，不是一次性 Prompt。项目约束、架构假设、代码风格、数据访问模式和当前 Spec 应有稳定、可维护的载体；需求变化时必须更新 Agent 实际读取的 Context。

> **Coding agents lower the cost of implementation; they raise the value of specification, verification, and engineering judgment.**

> **Long-running autonomy is not a quality metric.**

来源：Andrew Ng, *AI Engineering Skills Map: Using coding agents*（2026-09-04）。原文归纳 Planning → Execution → Deployment & Monitoring，并提出上述五项核心能力。

Source: https://x.com/AndrewYNg/status/2095890279865721217

---

# Chapter 09 · 可靠性、评估与可观测性
## Reliability, Evaluation, and Observability

可靠 Agent 的核心不是“模型很聪明”，而是：

```text
State
Validation
Retry
Fallback
Observability
Policy
```

## 9.1 Structured Outputs + Validation Gates

模型输出优先通过 JSON Schema、Pydantic、Typed Objects、Enums 等结构化契约，而不是直接执行自由文本。

Validation 可以分为 Schema、Business Rule、Permission、Artifact、Claim Verification、Safety。

> **The model proposes completion. The harness proves completion.**

失败恢复必须按原因路由：

| Failure | Recovery |
|---|---|
| Transient API error | retry with backoff |
| Invalid JSON | repair / constrained regeneration |
| Missing input | clarify |
| No evidence | retrieve more / refuse |
| Tool unavailable | fallback tool / escalate |

副作用动作的控制链：

```text
Identity
→ Permission-aware Retrieval
→ Authorized Context
→ Policy Gate
→ Tool Execution
```

send email、delete data、deploy、approve payment 等动作需要 confirmation、approval、idempotency 与 audit log。

## 9.2 Evaluation 是生命周期基础设施

Evaluation ≠ 一个 Judge Prompt ≠ 一张离线准确率表 ≠ 一次 QA。它要持续回答：

1. 当前版本是否优于 Baseline？
2. 哪些 Slice 发生 Regression，为什么？
3. 证据是否足以支持 Ship / Canary / Hold / Rollback / 继续实验？

从开发节奏看，Observability 与 Evaluation 是连续的 Build ↔ Test 内环：

```text
Run Agent
→ Read Trace
→ Locate Failure
→ Fix
→ Rerun
```

手工 Trace Debug 适合少量场景；当模型、Prompt、Tool 或 Workflow 高频变化时，失败必须进一步固化为可重复测试资产：

```text
Observed Failure
→ Dataset Case
→ Evaluator
→ Experiment
→ Regression Protection
```

Eval 至少有三个 Scope：

| Scope | 核心问题 | 典型对象 |
|---|---|---|
| Step / Unit | 某个决策或组件是否正确？ | tool call · retrieval query · parsing · SQL/schema check |
| Final Response / E2E | 从输入到最终输出是否完成用户目标？ | correctness · relevance · groundedness · safety · task success |
| Trajectory | 即使最终答案正确，执行路径是否低效、重复或违规？ | step count · tool order · redundant calls · planning · recovery |

> **A correct final answer does not prove a reliable trajectory.**

创建 Eval 可以固定成四步：

```text
1. Decide what matters
2. Create / curate a dataset
3. Create an evaluator
4. Run an experiment and compare versions
```

业务结果应优先于代理指标。例如：

| Agent | Primary Outcome | Supporting Metrics |
|---|---|---|
| Customer-service | resolution / escalation / satisfaction | factual correctness · policy compliance · response time |
| Coding | test pass / task completion | patch correctness · regressions · token/runtime cost |
| RAG | evidence-supported correct-answer rate | citation · refusal accuracy · Recall@K |
| Data analysis | calculation accuracy · actionable insight | SQL correctness · freshness · chart consistency |

## 9.3 Dataset Manager

数据来源可以包括 Synthetic、Human-authored、Historical Production、Online Bad Cases、Boundary、Safety/Permission、Adversarial、No-answer/Clarification。

一个通用 Example 由三部分组成：

```text
inputs                required
reference_outputs     optional; only for evaluators that need them
metadata              optional; slice / version / environment / risk / source
```

Reference Output 是评估依据，不应作为被测 Agent 的输入泄漏进去。

Dataset 的构建逻辑优先从 PRD 与真实 Failure Mode 出发：

```text
PRD / desired behavior
→ derive scenarios
→ write several questions per scenario
→ add reference answers only when the evaluator needs them
→ attach metadata for slicing and provenance
```

场景至少考虑 Happy Path、Edge Case、Out-of-Scope、Adversarial Input 与历史失败。开始阶段优先少量高质量案例，而不是一开始堆大量样本导致分析迟滞。

Dataset 应随真实使用增长：线上 Eval 低分案例、用户负反馈、PRD 未覆盖的 Unexpected Input 都可以经过隐私检查、去重、归因与裁决后回流。

至少区分：

- **Development**：日常 Prompt / Tool / Workflow 开发；
- **Regression**：每次发布必须通过，优先收录历史真实失败；
- **Holdout**：减少团队重复查看，防止过拟合；
- **Online Shadow**：真实流量上对比新旧版本但不影响用户。

> **A golden set should be curated, deduplicated, versioned, and sliced—not merely accumulated.**

“20–50 条即可启动”只是启发式建议。更准确的是：从**能暴露主要 Failure Modes 的最小分层集合**开始。Normal、Boundary、Hard Negative、No-answer、Permission、Tool Failure、Conflicting Evidence、Long Context、Multi-step、Safety 都比单纯堆数量更重要。

一个 Eval Case 至少可包含：

```json
{
  "case_id": "eval_000184",
  "input": "...",
  "expected_outcome": "...",
  "reference_evidence": ["doc_12#p7"],
  "slice": ["refund", "conflicting_policy", "de-DE"],
  "risk_level": "high",
  "source": "production_bad_case",
  "annotation_status": "adjudicated",
  "dataset_version": "evalset_2026_07_29"
}
```

## 9.4 Observability：Trace 解释一次运行，Thread 解释跨轮行为

传统应用的大量决策写在显式代码中；Agent 的部分决策由模型在运行时产生。因此失败时不能只扫描异常栈，还需要重建“这一次运行实际做了什么”。

### Trace

Trace 是**单次 Agent Run** 的完整可观测序列。应包含 request / agent / model / prompt / workflow / tool-registry / memory snapshot 的版本，逐步记录 workflow state、model-visible messages、structured decisions、tool、arguments、tool observation / result status、validation result、latency、token usage、cost 与 final output。

如果 Agent Output 只返回最终一句话，很多 Tool Call 和中间 Message 会从应用层输出里消失；调试接口应保留足够完整的结构化消息或 Trace 数据，以支持回放与错误归因。

不要把隐藏 Chain-of-Thought 当必须存储的 Evaluation Trace。系统可以观测模型**做了什么**以及模型显式输出的 reasoning summary / structured decision，但不能把内部不可见推理当成可靠遥测。

### Thread

多轮 Agent 每一轮可以产生自己的 Trace；多个 Trace 通过 `session_id`、`thread_id` 或 `conversation_id` 关联成 Thread。Thread 让我们观察早期 Context 如何影响后续决策，以及问题从哪一轮开始积累。

必须区分：

```text
Thread metadata = observability grouping
Conversation / state storage = application persistence
```

把多个 Trace 归进同一个 Thread **不会自动让 Agent 拥有跨轮记忆**。Stateful Conversation 仍需要自己的 Message Store / Database / Checkpointer 保存历史与状态。

> **Trace makes one run explainable; Thread makes cross-turn behavior inspectable. Neither one replaces application state.**

## 9.5 Evaluator Routing：Code / LLM / Pairwise / Human

先问最重要的问题：**Can I write a function that reliably determines what I want to evaluate?** 如果可以，优先 Code-based Evaluator。

### Code-based Evaluator

适合 Schema、Output Shape、Action / Tool Type、Keyword / Filter、精确数值、SQL、Unit Test、Latency、Cost、Semantic Retrieval Quality 等可稳定程序化判断的问题。

它像 Agent 的 Unit Test：确定性、快速、便宜、失败时容易 Debug。典型例子是检查“执行数据查询前是否先做 schema inspection”。

### LLM-as-Judge

适合很难写成规则、但人类能够相对清楚判断的语义标准，例如是否回答了原问题、是否正确 Handoff、是否泄漏敏感信息、语气是否专业。

可靠 Judge 至少遵循三条：

1. **Narrow scope**：每个 Judge 只评一个清晰 Criterion，不问“这个回答总体好不好”；
2. **Binary / categorical output**：优先 Yes/No、Pass/Fail 或有限类别，而不是含义模糊的 1–5 连续分；
3. **Human alignment**：让人工与 Judge 标注同一批样本，分析分歧，再迭代 Rubric / Prompt / Examples。

高质量 Rubric 仍可拆成 Correctness、Completeness、Grounding、Policy、Actionability 等**独立可观察维度**。Judge 输出最好包含 `pass / category / failed_criteria / evidence / repair_hint`，而不是只返回一个漂亮的分数。

> **Evaluators should produce repair instructions, not only scores.**

### Pairwise Evaluation

有些指标绝对评分很模糊，但相对比较容易。例如 Conciseness、Professionalism、Helpfulness。此时让同一输入得到 Response A / Response B，再问“哪一个更符合目标”通常比单独给每个答案打 1–5 分更稳定。

Pairwise 比较要尽量随机化 A/B 顺序，降低 Position Bias；同时要明确“更短”不等于“更简洁”，不能为了赢 Conciseness 而丢失 Crucial Information。

### Human Review

高风险、Judge 分歧、标准不稳定或需要 Subject Matter Expert 的任务进入 Human Review + Adjudication。Human 不是无限扩容方案；人工裁决应该继续沉淀成 Calibration Set、Rubric 与 Regression Asset。

Judge 本身也要评估：Human Agreement、Pairwise Consistency、Self-consistency、Position Bias、Verbosity Bias、Reference Leakage、Prompt Sensitivity、Model-version Drift。关键 Release Gate 不应依赖一个未校准的单一 LLM Judge。

## 9.6 Metrics：不要压成一个平均数

至少分五组：

```text
Outcome
  Task Success · Answer Correctness · No-answer Accuracy · Citation Support

Process
  Tool Selection · Argument Correctness · Plan Completion · Recovery · Loop Rate

Efficiency
  Latency P50/P95/P99 · Tokens · Cost/Success · Retry · Cache Hit

Safety
  Policy Violation · Unauthorized Retrieval · Sensitive Exposure · False Refusal/Allow

Business
  CSAT · Deflection · Conversion · Time Saved · Support Cost
```

同时按 Query Slice、Risk Slice、Language/Region、Tool/Workflow Version、New vs Regression 查看，不让 Overall Average 掩盖高风险 Failure。

## 9.7 Offline + Online Evaluation

离线对比 Prompt / Model / Tool / Memory / Workflow 时，固定 dataset version、judge version、model settings、tool mocks / data snapshot、random seed，确保版本比较可复现。

一次标准 Experiment 可以抽象为：

```text
Target Agent
× Dataset
× Evaluators
→ per-example results
→ aggregate + slice comparison
```

大规模 Evaluation Job 要控制并发，避免把 Eval Harness 自己变成限流、成本或状态污染来源；可重复的测试应进入 CI/CD。框架层面可以使用异步批量执行或 pytest 集成，但真正需要版本治理的是 Agent / Dataset / Evaluator / Environment，而不是某一个 SDK 调用名字。

线上关注 Distribution Shift、Tool Reliability、Latency、User Corrections、Fallback、Human Escalation 与 Business Outcomes。常见路径：

```text
Shadow
→ A/B Test
→ Canary
→ Human Review Sampling
→ Continuous Monitoring + Alerts
```

线上反馈本身有偏差：点赞不等于正确；没有投诉不等于成功；人工接管也不一定意味着 Agent 失败。要与可验证业务结果、人工审查和系统证据组合。

## 9.8 Release Gate

Evaluation 只有连接到发布决策才形成闭环。Gate 可以定义 task success、high-risk violation、citation support、P95 latency、cost per success 等约束。

```text
Ship
Canary
Hold
Request Human Review
Rollback
```

> **Overall score improvement cannot compensate for a critical safety regression.**

Dashboard 负责解释变化；Release Gate 把指标转换成发布决策。两者不是一回事。

## 9.9 Error Analysis + Data Flywheel

Failure Taxonomy 至少覆盖：Input Understanding、Routing、Retrieval、Memory、Planning、Tool Selection、Tool Argument、Tool Execution、Evidence、Generation、Citation、Policy、Recovery、Evaluation。

> **Fix the earliest incorrect decision, not the final symptom.**

Root Cause 要回答：最早错误决策是什么、影响哪些下游、是否确定性复现、Retry 是否有帮助、修复应落在 prompt / data / tool / policy / workflow 哪层。

Data Flywheel：

```text
Production Trace
→ Bad-case Detection
→ Root-cause Analysis
→ Privacy Review / Dedup / Label / Adjudication
→ Dataset Split Assignment
→ Fix Agent
→ Offline Regression
→ Shadow / Canary
→ Release
→ New Production Trace
```

每次发布都应能回答：由哪套 dataset、annotation guideline、judge、model、prompt、tool registry、workflow、knowledge snapshot、policy version 得到当前结果。Dataset 变更需要 Changelog。

## 9.10 Layered RAG Evaluation

端到端分数不能解释 Root Cause，至少拆四层：

| Layer | 问题 | 指标 | 常见失败 | 修复 |
|---|---|---|---|---|
| Retrieval | 是否召回答案文档 | Recall@K · MRR · nDCG | keyword mismatch / semantic miss | Query Rewrite · Hybrid · Index Tuning |
| Context | Context 是否有噪声/冗余 | Precision · Coverage · Redundancy | 无关内容挤占预算 | Rerank · Dedup · Dynamic Chunking |
| Generation | 是否忠实于证据 | Correctness · Groundedness · Citation | 幻觉 / 越界推断 | Verification Gate · Rubric Tuning |
| System | SLA 是否满足 | P50/P95 · Cost/Task · Safe Pass Rate | timeout / over-budget / loop | Caching · Fallback · Timeout Guard |

## 9.11 Latency Diagnosis：先 Trace，再归因

当“hello”都很慢时，不要先怪 Embedding，因为问候通常不需要知识库。先拆 End-to-end Latency Budget：

```text
Queue
→ Route
→ Embed
→ Retrieve / Rerank
→ Prompt / Prefill
→ TTFT / Decode
```

第一次慢、后面快，常见是 Model loading、GPU runtime init、index load、cold cache；在线服务应遵循 `Load → Warm-up → Ready → Traffic`。

每次都慢则检查 repeated loading、GPU 未真正使用、CPU/Disk Offload、长 Context、输出过长、Queueing、无条件执行完整 RAG。

诊断 Runbook：

```text
1. 禁用 RAG 单测简单请求
2. 连续调用 3–5 次比较 Cold / Warm
3. 记录 Queue / TTFT / Decode / Total
4. 确认 LLM / Embedding / Index 只加载一次
5. 检查 GPU / VRAM / Offload / Quantization
6. 单测 Query Embedding
7. 单测 Retrieval / Document Fetch
8. 单测 Reranker
9. 比较空 Context 与真实 RAG Context
10. 建立 P50 / P95 性能回归
```

> **Measure before attribution; preload before traffic; route trivial requests away from RAG.**

## 9.12 Production Agent Harness

Harness 的职责是把 Authority 留在模型之外：

```text
Input Boundary
  State / Memory
  Tool Registry
  Context Builder
       ↓
LLM / Agent Policy
  structured proposal only
       ↓
Validation & Control
  Schema Validation
  Permission / Risk Gate
  Retry / Fallback / HITL
       ↓
Execution
```

权限、验证、恢复、预算、可观测性应该由 Host / Workflow 控制，而不是依赖模型自律。

需要持续追踪 Trace、Eval、Latency/Token/Cost Budget、Permission/Side-effect Audit。

## 9.13 Cost per Successful Task

模型价格低，不等于任务成本低。弱模型如果导致更多重试、更多轮次、更多检索和更长 Context，总 Token 量可能上升，Task Success 也可能下降。

基础关系：

```text
cost_per_attempt
= tokens_per_attempt / 1,000,000 × blended_token_price

cost_per_task
= cost_per_attempt × average_attempts

cost_per_successful_task
= cost_per_task / task_success_rate
```

因此成本有两根杠杆：

1. **Token Volume**：检索、文件读取、推理、Context、输出、重试、重新规划；
2. **Blended Price**：通过 model-family routing / model-tier routing，让普通步骤使用便宜模型，只在真正困难的少数步骤使用强模型。

最终指标必须把成本和任务成功率一起看。

> **Optimize cost per successful task, not price per model call.**

来源文章转述的 Glean 对比报告了约 `$0.45/task vs $1.84/task` 与约 `29.8M vs 88.8M tokens`。这些只能作为“路由 + 更好的 Context 可能同时降低混合单价与 Token 量”的 source-specific example，不应视为可直接迁移到其他系统的通用 Benchmark。

Source: https://aiengineering.beehiiv.com/p/loop-vs-graph-engineering-clearly-explained

## 9.14 LangChain Academy Reliable Agents：来源映射

本章关于 Observability 与 Durable Evals 的新增内容来自用户提供的 LangChain Academy Reliable Agents 课程材料，并做了工程化抽象：

- Observability：Trace 是单次运行的可观测序列；Thread 将多轮 Trace 归组；Thread metadata 与真正的 Conversation Persistence 分离；
- Evaluating Agents：Eval Scope 分为 Step/Unit、Final/E2E、Trajectory，并同时关注 Operational / Output Quality / Trajectory Metrics；
- Datasets：PRD → Scenarios → Questions → Optional References / Metadata，从少量高质量案例开始，再用真实 Bad Cases 扩展；
- Running Experiments：Target × Dataset × Evaluators 形成 Experiment；批量执行需要并发控制并最终接入可重复 Test/CI 流程；
- Code-based Eval：能稳定写函数判定的 Criteria 优先确定性 Evaluator；
- LLM-as-Judge：Narrow Scope、Binary/Categorical、Human Alignment；
- Pairwise Evaluation：当绝对评分模糊而相对比较容易时比较 A/B，并随机化顺序减少 Position Bias。

LangSmith 在课程中作为具体实现：可通过框架 Integration 或 manual wrapper + `traceable` instrumentation 收集 Trace，用 `session_id / thread_id / conversation_id` 关联 Thread；离线 Experiment 可通过 `evaluate / aevaluate` 或 pytest 工作流执行。这里把这些 API 视为实现样例，而不是跨框架的架构定义。

Sources:

- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-1/observability
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/evaluating-agents
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/datasets
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/running-experiments
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/code-based-eval
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/llm-as-judge
- https://langchain-ai.github.io/lca-lessons/reliable-agents/module-2/pairwise-evaluation

---

# Cross-chapter Canonical Rules

这些原则跨越多个章节，修改任何一章时都不应破坏：

1. **Authorization before semantic similarity.** 未授权数据不进入检索候选与模型上下文。
2. **Evidence relevance ≠ evidence sufficiency.** 相关不代表足够支持完整回答。
3. **Citation presence ≠ citation correctness.** Citation 必须能支撑 Claim。
4. **Parsing quality sets the upper bound for retrieval.** 文档结构在上游丢失后很难由 LLM 恢复。
5. **Use the cheapest reliable route first.** 只在 Query 或不确定性需要时扩展检索/模型能力。
6. **Skill match is not authorization.** Capability selection 与 Permission/Risk/Approval 分离。
7. **The model proposes; the host executes.** Function Calling 不等于执行权。
8. **The transcript is not the state.** State 与 Memory 应结构化、可版本、可治理。
9. **Use the least control-flow complexity necessary.** Loop 做不好，Graph 不会自动修好。
10. **Fix the earliest incorrect decision.** 根因修复优先于末端症状重试。
11. **Evaluators should produce repair instructions, not only scores.**
12. **Optimize cost per successful task.** 不只看模型单价或 Cost/query。
13. **Book first, interaction second.** Interaction 服务理解，不把 Handbook 变成 Dashboard。
14. **Traces make failures visible; evals make them durable.** Trace 用于解释一次运行，Dataset + Evaluator + Experiment 用于防止未来回归。

---

# Maintenance Notes

当前 active manuscript 只覆盖生产站正在维护的 Chapters 02–09。旧 Interview Question Bank、招聘题、个人项目映射、个人 Profile 不属于本核心书稿，不应重新合并进来。

更新规则：

```text
New source / paper / engineering lesson
→ verify what is source fact vs handbook synthesis
→ merge reusable semantic principle here
→ place it in the smallest appropriate chapter
→ update web representation
→ preserve Chinese / English semantic equivalence
→ run syntax + English leakage + responsive checks
→ push main → Vercel
```

当 Markdown 与 Web 在技术含义上不一致时，应回到原始来源与工程证据核对，并以本文件中的 canonical semantic intent 作为需要恢复的目标；当两者只在布局、图形、交互形式上不同，则由 `web/` 决定展示实现。