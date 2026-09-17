# Chapter 04 · RAG 可靠性与选择性回答
## RAG Reliability and Selective Answering

> Canonical semantic chapter.

开放企业知识库里几乎不可能承诺“100% Retrieval Accuracy”。更合理的目标是 **Trustworthy Answering**：证据充分才回答；部分充分则部分回答；问题缺信息则澄清；证据不足则继续检索或拒答；高风险则升级人工。

Prompt 写一句“不知道就拒答”不够，因为 Prompt 无法证明：Retriever 没漏召、证据真的支持结论、来源之间不冲突、关键推理跳完整、版本有效、用户有权限。

> **Prompt can encourage abstention. It cannot prove that abstention is correct.**

## 4.1 Six Gates

### Gate 0 · Query Analysis

抽取 domain、intent、entity、time scope、risk、required evidence。信息不完整时优先 Clarify，而不是把不完整请求直接当 OOD。

### Gate 1 · Knowledge Coverage

检查支持的 domain、时间范围、实体目录、文档类型与 Capability Registry。理论上覆盖某领域，不代表库里一定存在当前问题的具体答案。

### Gate 2 · Retrieval Quality

联合多个信号：Exact hit、Top-K score、Reranker score、Score margin、Retriever agreement、Source authority、Freshness、Metadata match。

低分只表示“不确定”，不能证明“知识库一定没有答案”。

### Gate 3 · Evidence Sufficiency

对证据集合判断：

```text
SUPPORT
REFUTE
IRRELEVANT
INSUFFICIENT
CONFLICT
```

核心问题不是“文档相关吗”，而是“这些证据合起来是否足以支持完整答案”。要检查多跳是否缺一跳、来源是否冲突、是否只有背景材料、multipart question 是否都覆盖。

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

单一相似度阈值既不能证明“无答案”，也不能代表跨 domain / language / retriever / risk 的统一安全边界。

应构造代表性评测集：

```text
Answerable
Unanswerable in-domain
OOD
Outdated
Conflicting
Partial evidence
```

并按 domain / query type / language / retriever / risk 分别校准。

关键指标包括：

```text
Coverage
Selective Risk
Unsafe Answer Rate
False Refusal Rate
Citation Correctness
Citation Completeness
Conflict Detection Rate
Evidence Sufficiency Accuracy
```

真正要看的是 **Risk–Coverage Curve**，而不是单点 Accuracy：回答越多 Coverage 越高，但风险可能上升；拒答越多风险下降，但可用性也下降。

## 4.3 High-quality abstention

高质量拒答不是只说“我不知道”。它应该说明：

```text
what evidence was found
what is missing
why the answer is not yet trustworthy
what the next safe action is
```

同时不能泄漏未授权资源的存在，例如“有一份你无权访问的敏感文件包含答案”。

## 4.4 Evidence conflict

当来源冲突时，不应让生成模型随机挑一段最像答案的文本。需要把冲突本身提升为显式信号：

```text
Conflicting Sources
→ check version / effective date / authority / region / tenant
→ resolve if deterministic
→ otherwise qualify / clarify / escalate
```

版本、有效期、region、business unit 和 source authority 应进入 Evidence Policy，而不是留给 Prompt 猜测。

## 4.5 Claim–evidence contract

Grounded answer 至少要满足三层关系：

```text
Citation Presence
→ Citation Correctness
→ Claim–Evidence Entailment
```

“出现引用”不等于“引用支持结论”。关键 Claim 如果没有足够证据，就应删除、限定语气、继续检索或拒答。

## 4.6 Layered failure diagnosis

最终答案错了，不代表问题发生在生成阶段。至少区分：

```text
query_analysis_failure
routing_failure
retrieval_failure
data_failure
reranking_failure
evidence_sufficiency_failure
claim_verification_failure
decision_policy_failure
generation_failure
```

> **Fix the earliest incorrect decision, not the final symptom.**

## 4.7 Release criteria

RAG 可靠性不能只靠一个平均分。发布前应至少按风险 Slice 检查：

- answerable vs unanswerable；
- high-risk vs normal-risk；
- current vs outdated/conflicting evidence；
- permission-sensitive requests；
- multilingual queries；
- partial-evidence questions。

关键安全回归不能被总体平均分提升抵消。

## Canonical rules

> **Evidence relevance ≠ evidence sufficiency.**

> **Citation presence ≠ citation correctness.**

> **Prompt can encourage abstention; evaluation and evidence policy must prove when abstention is appropriate.**

> **Overall score improvement cannot compensate for a critical safety regression.**
