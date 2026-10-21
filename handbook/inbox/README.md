# 原始材料收件箱

把新文字保存为本目录下的 Markdown 文件，一份材料一篇。尽量写明来源链接、作者、发布日期；没有来源时注明“来源待补”，不要把转载或面试宣传当作已核实事实。

处理顺序：阅读原文 → 核对正式章节 → 验证并纠错 → 合入原有章节 → 同步阅读内容 → 检查 → 标记并归档。

已处理的原文保留在 `processed/`，顶部记录状态、日期、原文 SHA-256、正式章节和处理报告。`processed` 表示已完成阅读与提炼，不表示原文全部正确或已经发布。

## 已处理 · 2026-10-21

- [Agent 记忆机制面试稿](processed/怎么设计Agent记忆机制？.md) → [第 7 章](../chapters/07-memory-context-engineering.md) §7.14（Retention 与 Forgetting）。分层与生命周期部分与 §7.1、§7.10 重合，未新增语义；面试口述版移入 [archive/interview](../../archive/interview/agent-memory-layering-interview.md)。
- [纠错与验证记录](../verification/2026-10-21-inbox-agent-memory.md)。

## 已处理 · 2026-10-20

- [Agent 上下文预算](processed/Agent%20上下文快要撑满了，该怎么办？.md) → [第 7 章](../chapters/07-memory-context-engineering.md) §7.13。
- [Rerank 面试材料](processed/Rerank面试非常重要.md) → [第 3 章](../chapters/03-hybrid-retrieval-query-routing.md) §3.1.1–3.1.2。
- [纠错与验证记录](../verification/2026-10-20-inbox-rerank-context.md)。

部分处理的材料留在收件箱，并注明尚未解决的问题。重复或未采用的材料也记录理由，不自动删除原文。正式章节通过审核并提交到 main 后，再单独更新 GBrain；inbox 和 processed 均不在当前导出范围内。
