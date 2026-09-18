# Agent / RAG Resume Guide
## 从关键词堆砌到可验证工程证据

> Interview-only reference. Core engineering knowledge remains in `handbook/chapters/`.

Agent 简历不是把热门词全部写上去，而是让招聘者快速看懂：

```text
你做了什么系统？
→ 你负责哪一层？
→ 你解决了什么工程问题？
→ 你怎么验证它真的变好了？
→ 哪些部分可以继续追问？
```

> **Keyword → Engineering action → Evidence → Outcome → Follow-up depth**

## 1. 核心关键词地图

### 1.1 Knowledge Base / RAG

可以覆盖：知识库搭建、Document ingestion、PDF/图片/文本解析、Chunking、Metadata/Provenance、Query Rewrite、BM25、Dense/Hybrid Retrieval、RRF/Rerank、Top-K、Context Packing、Grounding/Citation、知识刷新和离线检索 Eval。

不要只写“熟悉 RAG、向量数据库、BM25、Rerank”。更好的表达：

> 负责企业文档 RAG 检索链路，针对 ID/关键词类 Query 与语义问题分别引入 BM25 + Dense Hybrid Retrieval，并通过 Rerank 与 Query Rewrite 优化候选结果；构建固定离线评估集，对 Recall@K、MRR、引用完整性与最终回答正确率进行版本回归。

追问准备：为什么 Hybrid？Query Rewrite 什么时候会害你？Chunk size 怎么定？Retrieval budget 和 context budget 有什么区别？Rerank 提升什么？怎么证明答案来自正确文档？

### 1.2 Skills / Tools / MCP

关键词：Skill Registry、Skill Contract、when_to_use / when_not_to_use、Tool Schema、Function Calling、Structured Outputs、Tool Selection、Timeout/Retry、Idempotency、Permission/Approval、MCP、Capability Routing、Result Validation。

推荐写法：

> 设计 Tool / Skill 分层：Tool 负责单一外部能力，Skill 固化可复用任务流程；为工具定义结构化输入输出、超时与错误模型，并在执行前增加参数校验与权限 Gate；通过 MCP / Function Calling 接入搜索、数据库与文件能力，同时记录 Tool 参数、返回结果、失败原因和执行耗时，支持调用链排障。

追问准备：Skill 和 Tool 区别？MCP 和 Function Calling 区别？模型选中 Tool 后为什么还不能直接执行？Timeout 后能否直接 Retry？有副作用 Tool 怎么防重复执行？

### 1.3 Agent Architecture / Orchestration

关键词：Single Agent、ReAct、Plan & Execute、Router + Skill、Multi-Agent、Supervisor/Worker、Handoff、Shared State、Graph Workflow、LangGraph、Checkpoint、HITL、Retry/Fallback、State Machine。

不要只列框架名。应写为什么选：

> 根据任务控制复杂度拆分 Workflow 与 Agent：确定性流程由状态机 / Graph 编排，不确定判断交给 LLM 节点；在检索不足、工具失败和输出校验不通过时设计显式 Retry / Fallback 路径，并通过 Checkpoint 保存执行状态，支持中断恢复和 Human-in-the-loop。

Multi-Agent 只有真实边界存在时再写，例如：

> 按 Tool、权限、Context 与独立 Eval 边界拆分 Research / Analysis / Execution 子 Agent，由 Supervisor 负责任务分配与结果汇总，而不是仅按角色名称拆分。

关于 A2A：只有真实实现或使用了 Agent-to-Agent 协议 / 通信机制才写具体 A2A 名称。如果实际只是 Supervisor 调 Worker，就写“实现 Supervisor → Worker 的任务委派与结构化结果回传”。

### 1.4 Context / State / Memory

关键词：Conversation State、Working State、Short-term Memory、Long-term Memory、Thread State、Entity State、Context Pruning、Summarization、Memory Write Policy、Conflict Resolution、Freshness。

推荐写法：

> 将完整聊天历史与可执行 State 分离，维护当前任务、关键实体、已填槽位和 Workflow Position；针对长对话进行历史裁剪与摘要，仅将跨任务稳定偏好和经过验证的信息写入长期 Memory，并设计更新、冲突和过期策略，降低上下文污染与无效 Token 开销。

### 1.5 Test / Eval / Production Iteration

关键词：Unit Test、Integration Test、Eval Dataset、Golden Set、Online Eval、LLM-as-a-Judge、Rubric、Human Annotation、Trace、Regression、A/B Testing、User Feedback、Task Success、Latency/Cost、Observability。

推荐写法：

> 建立 Test + Eval 双层验证：Unit / Integration Test 检查 Tool、Schema 和状态流转，固定真实业务样本作为版本化 Eval Set，结合人工标注与 LLM-as-a-Judge 对事实性、Tool 选择、任务完成率和输出结构进行评分；将线上失败 Trace 脱敏后沉淀为 Regression Case，用于模型、Prompt 和 Workflow 变更后的持续回归。

## 2. Agent Runtime Modules

来源材料中的 Intent、Planner、Actor、Memory、Reflector 可以作为功能模块描述，但不是所有项目都必须有五个类。

| Module | 真实职责 |
|---|---|
| Intent / Router | 判断 Task Shape / Capability Candidate |
| Planner | 拆解任务、依赖和下一阶段 |
| Actor / Executor | 调用 Retriever / Tool / Service |
| State / Memory | 保存运行状态与长期信息 |
| Validator / Reflector | 校验当前结果，决定继续、修复、回退或结束 |

如果所谓 Reflector 实际只是输出校验节点，就写 Result Validator / Evaluator，不要包装成“自反思 Agent”。

## 3. 进阶关键词：只有做过才写

### 3.1 Skill 自迭代

如果写“Skill 自动迭代”，至少要能回答：什么会变化？谁评估？搜索空间是什么？怎么防回归？谁批准晋升？怎么回滚？

真实做过时可写：

> 基于线上失败 Case 和离线 Eval 构建 Skill 优化闭环，自动生成候选 Skill 配置并在固定回归集上评估，仅在任务成功率、成本与安全约束满足 Release Gate 后晋升新版本。

如果只是“让 LLM 改 Prompt”，不要写成 Skill 自进化 / 自迭代框架。

### 3.2 SFT / RL / Post-training

写 SFT 前应能说明 base model、training dataset、data format、objective、LoRA/full fine-tune、train/val split、eval、为什么不用 Prompt/RAG、如何部署。

写 RL 前应明确 RL 方法、reward signal、policy/reference、environment、offline/online，以及训练后哪项指标变化。

不要把 Prompt Optimization、Few-shot、LLM-as-Judge 写成 RL。

## 4. 简历表达公式

项目 Bullet 可以用：

```text
Context / Problem
+ Personal Ownership
+ Engineering Action
+ Validation
+ Outcome
```

压缩成一句：**为了解决 X，我负责 Y，通过 Z，并用 M 验证，最终得到 R。**

没有真实数字时不要编造“提升 30%”。可以写“建立可重复评估”“降低某类已知失败”“支持某业务流程上线”“让问题可定位到具体层”，但面试时要有 Case。

## 5. STAR 不必机械写成四段

STAR 更适合作为写作检查表：S=问题背景，T=你的责任，A=工程动作，R=证据/结果。最终 Bullet 通常 1–2 句即可。

原始表达：

> 做了一个 RAG Agent，支持知识库、数据库、文件等工具，优化了检索效果。

改成：

> 在 RAG 问答基础上扩展 Capability Routing，根据 Query 类型选择知识库检索、数据库查询和文件解析；为 Tool 定义结构化参数与失败记录，并通过 Hybrid Retrieval、Rerank 与固定离线 Eval Set 对检索 Recall、答案 Grounding 和 Tool Selection 进行版本回归。

## 6. 个人贡献边界

少写“项目实现了 / 系统支持 / 团队搭建”，多写“负责 / 主导 / 设计并实现 / 参与 / 协助”，并让责任强度与事实一致。

例如：

> 负责 LangGraph Workflow 的状态 Schema、Conditional Routing 与失败恢复节点设计；Research Agent 由另一位同事负责，我负责其输入输出 Contract 与 Workflow 集成。

这比“项目使用 LangGraph 构建 Multi-Agent 系统”信息价值高得多。

## 7. 可直接套用的 Agent 项目经历模板

```text
项目名称｜[业务场景] AI Agent / RAG System
技术栈｜Python · [LLM] · LangGraph · [Vector DB] · [Observability]

背景：
面向 [用户/业务]，解决 [核心问题]。

个人职责：
负责 [明确模块]，包括 [2–4 项真实 ownership]。

核心工作：
• 设计 [RAG / Router / Workflow / Tool / Memory] 链路，解决 [具体 failure mode]；
• 实现 [Hybrid Retrieval / Query Rewrite / Rerank / Tool Calling / State / Checkpoint]；
• 为 [Tool / Skill / Agent] 定义结构化输入输出、错误处理与验证边界；
• 构建版本化 Eval Set，覆盖 [主要业务 slices]，评估 [真实 metrics]；
• 接入 Trace / Logging / Cost / Latency 监控，将线上失败 Case 沉淀为 Regression Test。

结果：
• [真实任务结果 / 指标变化 / 覆盖场景 / 上线规模]
• [成本、延迟、稳定性或可维护性结果]
```

## 8. RAG 项目成稿示例

> **企业知识库 RAG Agent｜Python · LangGraph · Hybrid Retrieval · Rerank**
>
> 面向内部知识查询场景，负责 Retrieval 与 Agent Tool Routing 模块。在 Dense Retrieval 基础上增加 BM25 与 Query Routing，针对订单号/文档编号等精确 Query 走 lexical/exact path，自然语言问题走 Dense/Hybrid Retrieval，并通过 Rerank 控制最终 Evidence Set；扩展数据库查询、文件解析等 Tool，为 Tool Call 记录结构化参数、返回结果、延迟和失败原因，支持 Agent 决策链排障。
>
> 建立覆盖事实查询、精确 ID、跨文档综合和 No-answer 场景的固定 Eval Set，分别评估 Recall@K、MRR、答案 Grounding、Tool Selection 和端到端 Task Success；将线上失败 Trace 脱敏后加入 Regression Dataset，用于 Query Rewrite、Chunking、Top-K 和 Prompt 版本变更后的持续回归。

## 9. ATS 关键词 ≠ 面试能力

对简历上的每个关键词都问：Can I define it? Why did I use it? What is its failure mode? What alternative did I reject? How did I evaluate it? What exactly did I implement?

如果两项以上答不上来，建议删除或降低措辞强度。

> **A resume keyword is useful only when it opens a technical conversation you can finish.**

## 10. 最终检查表

- [ ] 每个项目先写业务任务，而不是框架名
- [ ] 每个 Bullet 能看出个人 ownership
- [ ] RAG 不只写 Vector DB，也写 retrieval / rerank / eval
- [ ] Tool / Skill / MCP 不混成同一层
- [ ] Agent / Workflow 分工清楚
- [ ] Memory 与普通聊天历史区分
- [ ] Test 与 Eval 区分
- [ ] LLM-as-Judge 有 Rubric / calibration 逻辑
- [ ] 有 Trace / failure attribution / regression
- [ ] 量化数字有真实证据
- [ ] SFT / RL / Self-improving Skill 只有真实做过才写
- [ ] 每个关键词都准备至少一个 failure case 和一个 trade-off
