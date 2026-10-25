# 原始材料收件箱

把新文字保存为本目录下的 Markdown 文件，一份材料一篇。尽量写明来源链接、作者、发布日期；没有来源时注明“来源待补”，不要把转载或面试宣传当作已核实事实。

处理顺序：阅读原文 → 核对正式章节 → 验证并纠错 → 合入原有章节 → 同步阅读内容 → 检查 → 标记并归档。

已处理的原文保留在 `processed/`，顶部记录状态、日期、原文 SHA-256、正式章节和处理报告。`processed` 表示已完成阅读与提炼，不表示原文全部正确或已经发布。

## 已处理 · 2026-10-25

- [Agent Todo List](processed/Agent%20的%20Todo%20List%20有什么用？.md) → [第 8 章 §8.14.20](../chapters/08-agent-orchestration.md)。核对 DeepSeek 源码与 Manus 原文后，保留单会话清单与共享任务板的所有权边界。
- [RAG 知识时效](processed/如何从根源上保障RAG系统的知识时效性.md) → [第 2 章 §2.11](../chapters/02-enterprise-retrieval.md)。补充索引新鲜度与业务有效期的区别；无原始出处的“工业基线”说法未采纳。
- [Agent 评测岗位](processed/Agent评测岗位.md) → 已审阅，技术内容与[第 9 章](../chapters/09-reliability-evaluation-observability.md)重合；薪酬、招聘趋势和雇主案例未核验，未写入正式章节。
- [本轮核验记录](../verification/2026-10-25-inbox-todo-eval-freshness.md)。正式章节经审核合入 `main` 后，才可按 GBrain runbook 更新外部索引。

## 已处理 · 2026-10-22

- [Harness²（Google Research 自我改进 Harness 框架）](processed/Google%20Open-Sources%20a%20Framework%20for%20Self-Improving%20Agent%20Harness.md) → [第 9 章](../chapters/09-reliability-evaluation-observability.md) §9.21.21（Harness 层面的自我改进），并在 [第 8 章](../chapters/08-agent-orchestration.md) §8.14.13 留交叉引用。
- [纠错与验证记录](../verification/2026-10-22-inbox-harness2.md)。通讯稿所说的 `EXPERIENCE.md` 在 README 中不存在；三个 benchmark 分数为作者自报，未独立复现；README 自述的“网络访问不受限 / Codex 关闭 sandbox”作为评估有效性边界一并记录。

## 已处理 · 2026-10-21

- [Agent 记忆机制面试稿](processed/怎么设计Agent记忆机制？.md) → [第 7 章](../chapters/07-memory-context-engineering.md) §7.14（Retention 与 Forgetting）。分层与生命周期部分与 §7.1、§7.10 重合，未新增语义；面试口述版移入 [archive/interview](../../archive/interview/agent-memory-layering-interview.md)。
- [纠错与验证记录](../verification/2026-10-21-inbox-agent-memory.md)。

## 已处理 · 2026-10-20

- [Agent 上下文预算](processed/Agent%20上下文快要撑满了，该怎么办？.md) → [第 7 章](../chapters/07-memory-context-engineering.md) §7.13。
- [Rerank 面试材料](processed/Rerank面试非常重要.md) → [第 3 章](../chapters/03-hybrid-retrieval-query-routing.md) §3.1.1–3.1.2。
- [纠错与验证记录](../verification/2026-10-20-inbox-rerank-context.md)。

部分处理的材料留在收件箱，并注明尚未解决的问题。重复或未采用的材料也记录理由，不自动删除原文。正式章节通过审核并提交到 main 后，再单独更新 GBrain；inbox 和 processed 均不在当前导出范围内。
