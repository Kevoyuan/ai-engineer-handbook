# Agent Memory Layering · Interview Card

> Interview-only recall. Canonical engineering semantics: [Chapter 07 §7.1](../../handbook/chapters/07-memory-context-engineering.md) (六层结构), §7.10 (cross-session), §7.14 (retention / forgetting). Original source: [inbox processed](../../handbook/inbox/processed/怎么设计Agent记忆机制？.md).

## Original question

2026 年 Agent 应用开发面试：

> “我们做的 Agent 要长期服务客户，你怎么保证它记住客户几年前说过的事？怎么设计记忆机制？”

## 30-second answer

> 我不会把记忆当成“把历史对话丢进向量库”。先分存储层次：当前上下文里的工作记忆、会话级的 thread 状态与摘要视图、跨会话的 profile / episodic / semantic / procedural。再分生命周期：写什么、按什么召回、冲突怎么处理、什么该过期或删除。最关键的判断是 scope——同一句话是任务约束、项目约束还是用户稳定偏好，决定它能不能跨会话存活。冲突不用“新的覆盖旧的”，而是用来源权威、scope 和有效期生成新版本并保留 lineage。

## 90-second answer

> 第一层是工作记忆：system prompt、最近若干轮、任务状态和工具结果，容量有限，超限用滑动窗口或压缩，但压缩是 context view，不是记忆。
> 第二层是会话内状态：thread checkpoint 加结构化摘要（目标、已完成动作、约束、未决问题）。它属于同一个任务的短期持久化，不是跨会话记忆。
> 第三层是跨会话记忆，内部按语义类型拆：事实与偏好（结构化优先，可加向量索引）、情景事件（带 provenance 的 event log）、程序性经验（可复用的流程与修复策略）。
> 生命周期四件事：写入要经过候选抽取、scope 判定、去重、冲突检查、权限门；召回先做权限和有效期过滤，再按相关性、权威、新近度排序；冲突生成新版本 supersede 旧版本；遗忘分过期、衰减、淘汰、删除四种动作，不能混为一谈。权限永远不来自记忆，按请求向授权系统重新校验。

## Follow-up rehearsal

| 追问 | 回答要点 |
|---|---|
| 滑动窗口和摘要压缩怎么选？ | 窗口实现简单、适合短对话和频繁交互；压缩适合长任务，但会丢细节、影响前缀缓存命中，需要按保真度评测。两者都只作用于 context view。 |
| 结构化库和向量库怎么分工？ | 确定的实体、约束、偏好放关系库做精确查询；模糊经验和情景片段做语义召回。检索可以混合，但写入与权限边界不分层就会失控。 |
| 客户三年前说寄上海、今年说搬杭州，信哪条？ | 不是“新的赢”。看 scope 是否同一、来源是否显式、有效期与业务系统权威；正确做法是新版本 supersede 旧版本、保留 lineage，而不是两条一起交给模型判断。 |
| 遗忘会不会丢掉有用信息？ | 默认是降级：过期退出召回、衰减降权、淘汰迁到冷层留指针。真正的删除是合规动作，要覆盖索引、摘要和缓存。权威约束不因闲置而衰减。 |

## Common traps

| 说法 | 问题 | Canonical |
|---|---|---|
| “记忆就是向量库” | 结构化事实、程序性经验和权限边界不适合只靠相似度 | §7.1、§7.2 |
| “新时间戳优先” | 推断比显式约束更新时仍然不能覆盖它 | §7.10.7 |
| “冲突时直接改写原记录” | 丢失 provenance，无法复盘 | §7.10.7 |
| “遗忘 = 删除” | 过期、衰减、淘汰、删除是四件事 | §7.14 |
| “重要度让模型自己打分” | 模型会高估自己刚写的推断；分数只影响排序 | §7.14.3 |
| “三层记忆是标准架构” | 只是教学模型，各家 runtime taxonomy 不一致 | §7.10.2 |

## Layer mapping

| 面试口径 | Handbook 对应 |
|---|---|
| 工作记忆 | Session + Working State（§7.1） |
| 中期会话摘要 | Thread persistence + compressed conversation view（§7.10.5） |
| 长期记忆 | Structured Profile + Episodic + Semantic + Procedural（§7.1） |

> 面试可以讲三层，工程上必须能说清 scope、有效期、权限和冲突处理——层数不是设计。
