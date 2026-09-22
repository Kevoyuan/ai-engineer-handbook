# 科大讯飞 AI 产品经理面试准备包
## Public-source synthesis, not a transcript

> 本文不是“讯飞 AI 产品经理 1h36min 面试全过程”的逐字稿。当前可获得的信息来自公开面经与科大讯飞官方产品资料，适合用作面试准备框架，不应被描述为某一次具体面试的完整复盘。

## 1. 证据边界

公开面经能较稳定支持的结论：

- 产品经理面试会深挖个人项目、用户/市场调研、跨团队协作与产品价值判断；
- AI 产品岗位还会追问大模型、知识库/RAG、Agent、幻觉、上下文等技术理解；
- 问题常继续追问到“你本人做了什么”“为什么这样设计”“怎么验证结果”。

不应写成固定事实：

- 固定 3 轮；
- 每轮固定 45/30/20 分钟；
- 所有 AI 产品岗位都使用同一流程；
- 必然存在压力面。

> **公开面经显示，讯飞产品/AI 产品岗位常见考察维度包括项目深挖、产品方法、AI 技术理解、业务落地、协作与职业动机；具体轮次和时长因岗位、业务线和招聘批次而异。**

## 2. 五层能力模型

~~~text
01 Product Judgment
→ 你是否知道该做什么、不该做什么

02 AI Technical Literacy
→ 你是否知道模型 / RAG / Agent 的能力边界

03 Delivery
→ 你是否能把需求推进成上线结果

04 Evaluation
→ 你是否知道怎么证明产品真的有效

05 Ownership
→ 这些事情到底哪些是你做的
~~~

> **AI 产品经理的价值，是把不确定的模型能力翻译成可定义、可评估、可上线、可迭代的产品行为。**

## 3. 简历 / 项目深挖

至少准备：为什么做、用户是谁、成功标准、你的职责、为什么选这个技术方案、怎么 Eval、上线结果、最大失败、重做会改什么。

推荐回答链：

~~~text
Business Problem
→ User
→ Goal / Success Metric
→ Product Decision
→ Technical Constraint
→ Your Ownership
→ Experiment / Eval
→ Result
→ Failure / Next Iteration
~~~

不要从“我们用了 LangGraph + RAG + Milvus”开始；先讲用户问题、成功标准和业务约束。

## 4. AI 技术理解

### 4.1 Token / Context / Cost

至少能解释：Prompt、retrieved context、tool schema、output 都消耗 token；长 Context 不一定更好，会增加 latency、cost、噪声与信息稀释。

### 4.2 RAG vs Fine-tuning

~~~text
RAG
→ 解决运行时需要什么外部知识
→ 知识可更新
→ 可保留来源

Fine-tuning / SFT
→ 解决模型形成什么行为 / 格式 / 专门能力
→ 参数层适配
→ 更新与发布成本更高
~~~

知识经常变化或要求可追溯时优先考虑 RAG；格式/行为高度稳定且有训练数据时才讨论 Fine-tuning。两者可以组合。

### 4.3 Agent

不要死背固定“五件套”。更稳定的系统视图：

~~~text
Goal / Task
→ Router / Planner
→ State / Context
→ Model
→ Tools / Skills
→ Workflow / Recovery
→ Validation / Policy
→ Trace / Eval
~~~

### 4.4 Plan 模式

不要只说“LLM 先拆步骤再执行”。可以区分：

~~~text
One-shot Plan-and-Execute
Replanning / Reflective Planning
Search-based Planning
Constrained Planning / Workflow / FSM
~~~

选择标准是任务结构是否稳定、执行中信息是否持续变化、是否需要探索多个候选方案、以及业务流程能否允许模型自由规划。

## 5. 产品思维题

如果让你设计教育 AI 产品，不要直接列功能。先走：

~~~text
User
→ Problem
→ Frequency / Severity
→ Existing workflow
→ AI advantage
→ Failure risk
→ MVP
→ Eval
→ Business model
~~~

例如教师备课：AI 可以帮助检索、生成和结构化整理，但产品必须同时设计错误事实、课程标准不一致、教师编辑确认等 failure path。

AI 产品指标建议分四层：

| Layer | Example |
|---|---|
| Model / Task Quality | accuracy · groundedness · hallucination · tool selection |
| UX | completion · edit · retry · abandonment |
| Business | conversion · retention · productivity · revenue |
| System | latency · cost · availability · safety |

> **离线 Eval 证明版本有没有变好；线上指标证明用户是否真的获得价值。**

## 6. 讯飞产品研究

面试前至少选择 1–2 个当前官方产品做真实拆解，而不是只说“我用过讯飞星火”。

| Dimension | Questions |
|---|---|
| User | 谁在什么场景使用？ |
| Job to be done | 用户真正要完成什么？ |
| AI capability | ASR / OCR / LLM / Agent / multimodal 分别解决什么？ |
| UX | AI 如何进入原工作流？ |
| Risk | 错误结果会造成什么后果？ |
| Feedback | 用户如何纠错？ |
| Metric | 怎么证明价值？ |
| Moat | 数据、渠道、模型、硬件、场景闭环分别有什么优势？ |

科大讯飞官方当前仍在教育场景持续提供基于星火大模型的教师助手、智能批阅和校园/教学解决方案，因此教育 AI 是适合提前准备的真实产品域。

## 7. 产品与算法团队协作

低质量回答是“我提需求，算法同学实现”。更完整的协作链：

~~~text
Product
→ define user task
→ define acceptance criteria
→ define error taxonomy
→ prepare eval slices

Algorithm / Engineering
→ propose model / RAG / Agent design
→ instrument traces
→ produce baseline

Together
→ analyze failures
→ decide product vs retrieval vs prompt vs model fix
→ regression eval
→ release
~~~

AI 产品经理应该能回答：什么错误最不可接受、什么情况可以 fallback、什么情况必须人工确认、什么结果应该进入 regression set。

## 8. 90 秒项目回答模板

~~~text
背景：面向 [用户] 解决 [问题]。

目标：核心指标是 [指标]，同时受 [成本 / 延迟 / 安全] 约束。

我的职责：我负责 [明确 ownership]。

方案：我把任务拆成 [产品链路]，
AI 部分使用 [RAG / Agent / classifier / tool / workflow]，
原因是 [trade-off]。

验证：离线用 [eval set / metric]，线上看 [product metric]。

结果：[真实结果]

最大问题：[失败案例]

下一步：优先优化 [next bottleneck]。
~~~

## 9. Mock Interview Rubric

每道题按 0–3 分：

| Dimension | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Structure | 无结构 | 能答完 | 有框架 | 框架简洁且因果清楚 |
| Product Judgment | 功能堆砌 | 有用户视角 | 有取舍 | 能解释不做什么 |
| AI Understanding | 术语错误 | 会定义 | 会选型 | 会讲 failure mode / eval |
| Ownership | 全是“我们” | 能说部分职责 | 清楚边界 | 能解释关键个人决策 |
| Evidence | 无指标 | 有结果描述 | 有数据/Eval | 有 baseline / regression |
| Trade-off | 无 | 泛泛而谈 | 能比较方案 | 能结合业务约束决策 |

该评分仅用于自我练习，不代表科大讯飞官方评分体系。

## 10. 高频 Mock Questions

### Project

1. 介绍你最有代表性的 AI 项目。
2. 为什么这个问题必须用 AI？
3. 你具体负责什么？
4. 最严重的失败是什么？
5. 如果删除 LLM，这个产品还能不能成立？
6. 技术成本增加 2 倍，你怎么改方案？

### AI

7. RAG 和 Fine-tuning 怎么选？
8. Agent 为什么需要 Memory？
9. Plan 模式有哪些实现？
10. Tool Calling 怎么做安全控制？
11. 幻觉怎么评估？
12. Context 太长怎么办？

### Product

13. 设计一个教师 AI 助手。
14. 设计一个 AI 学习产品的 MVP。
15. 如何验证 AI 功能不是“看起来很酷但没人用”？
16. 用户说 AI 经常错，你怎么排查？
17. 产品效果变差，你怎么判断是模型、数据还是 UX？

### Business / Motivation

18. AI 教育产品如何商业化？
19. To B / To G AI 产品与 C 端产品设计有什么区别？
20. 为什么科大讯飞？
21. 为什么 AI 产品经理？
22. 未来三年想积累什么？

## 11. “为什么讯飞”

不要背公司介绍。用：

~~~text
Company capability
× Product / industry fit
× Your experience
~~~

示例结构：讯飞长期把语音/OCR/大模型等能力放进教育、办公、硬件等真实工作流；结合自己做过的 AI 项目，说明你希望继续积累“AI 能力如何被产品化、评估和交付”的能力。面试前必须根据实际应聘业务线改写。

## 12. Source boundary

本文不是原始面试视频还原。

用户提供的二次总结包括：可能的三轮流程；简历深挖、AI 技术、产品思维、行业洞察、职业规划五类题；STAR、产品案例、技术储备和压力面建议。

公开资料核验后：

- 保留简历/项目深挖、产品方法、AI 技术理解、Agent/RAG、业务落地与协作作为高频准备维度；
- 不把“三轮、固定时长、压力面”写成讯飞统一制度；
- 增加近期公开面经中的用户调研、MVP、PRD、Agent、幻觉、知识库和上下文等问题类型；
- 增加当前官方产品调研要求；
- 把准备方式改成可重复的 Mock Interview Rubric。

Public references:

- https://www.nowcoder.com/feed/main/detail/efc599d387ea4bc1a3f91cb862466d1f
- https://www.nowcoder.com/discuss/784364785662955520
- https://www.nowcoder.com/feed/main/detail/34830c071cf5444193be6030b48db7d0
- https://www.nowcoder.com/feed/main/detail/f3737bb8245d40c39d3885915d6baacf
- https://edu.iflytek.com/
- https://edu.iflytek.com/solution/school/teachers-assistant
- https://edu.iflytek.com/solution/school/the-spark-ai-grader

## Canonical interview rules

> **Do not memorize an AI answer; memorize the decision logic behind it.**

> **AI product interviews reward candidates who can connect user value, technical constraints, evaluation evidence, and delivery ownership.**

> **A company-specific question should be answered with current product evidence, not a generic industry speech.**
