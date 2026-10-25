> **状态**：已处理 · 2026-10-22
> **原文 SHA-256**：`65e2a20f2336d76f671e2d44f23e7eb0895a576c8d1578c78a39f22e788e9c84`
> **正式章节**：[第 9 章](../chapters/09-reliability-evaluation-observability.md) §9.21.21（Harness 层面的自我改进）；交叉引用 [第 8 章](../chapters/08-agent-orchestration.md) §8.14.13
> **处理报告**：[2026-10-22-inbox-harness2](../verification/2026-10-22-inbox-harness2.md)
> **来源状态**：通讯稿（beehiiv），无作者与发布日期。`EXPERIENCE.md` 在 README 中不存在；三个 benchmark 分数为作者自报，未独立复现。

## 原始材料（逐字保留）

When an agent repeatedly makes the same mistake, you usually inspect the trace and change its instructions or tools. The model stays the same, but the setup around it gets another revision.

Google Research just open-sourced [Harness²](https://github.com/google-research/harness2?utm_source=aiengineering.beehiiv.com&utm_medium=referral&utm_campaign=google-open-sources-a-framework-for-self-improving-agent-harness), a framework that lets agents improve their own harnesses. For each new task, it proposes edits, tests candidate versions, and combines changes supported by the execution results. The model’s weights stay unchanged.

The framework also saves lessons from those experiments, so future revisions can draw on earlier work.

#### Change the Setup Before Repeating the Task

Retrying an agent with the same instructions can produce a different answer without addressing the behavior that caused the failure.

Harness² changes the execution setup before trying again. Its editable components include:

- **Instructions and guardrails:** How the agent should approach the work.
    
- **Memory and skills:** Information and procedures available during execution.
    
- **Tool guidance and scripts:** How the agent uses its environment.
    
- **Subagents and plugins:** How work is delegated and the runtime is extended.
    

For example, an agent preparing a report might repeatedly write conclusions before checking its sources. A candidate harness could introduce a source-checking procedure, then rerun the task to see whether that procedure changes the agent’s behavior.

#### Compare Runs Without a Ground-Truth Answer

Harness² organizes refinement into three steps:

- **Propose:** Inspect a reference run, identify weaknesses, and create candidate edits.
    
- **Probe:** Execute the candidates on the same task under matched conditions.
    
- **Compose:** Retain or combine edits supported by differences between the runs.
    

The comparison considers execution traces and deliverables. It doesn’t require a known correct answer during refinement.

But comparing runs doesn’t verify correctness. Two executions can share the same mistaken assumption. The comparison provides evidence about how an edit changed behavior, rather than proving the final answer is right.

For the report example, the revised agent might check an additional source and catch a contradiction. That gives the editor a concrete reason to retain the checking procedure.

#### Carry the Lessons Into the Next Task

A procedure that helps with one report may be unnecessary for another task. Harness² therefore doesn’t automatically reuse the previous task’s final harness unchanged.

Each new task starts from a common base harness. During refinement, the system can consult a persistent library containing adopted harnesses and an `EXPERIENCE.md` file describing when their changes helped.

Earlier components can then be reused or adapted selectively. The library preserves the evidence behind a revision, not just the final configuration.

#### More Refinement Requires More Execution

The researchers tested Gemini 3.5 Flash and GLM-5 through OpenCode and Codex on professional-work benchmarks. One refinement step improved every evaluated model–harness configuration.

The reported gains reached:

- **WorkBuddy-Bench:** 11.5 points.
    
- **JobBench:** 4.5 points.
    
- **LAB:** 11.8 percentage points on its partial pass rate.
    

Larger budgets allowed several candidates to be explored in parallel or successive revisions to be tested sequentially. Additional refinement produced further gains, but required more task executions.

Harness² makes harness changes inspectable experiments. Each revision comes with candidate runs and a record of why particular edits were retained.

Instead of judging a prompt change from one retry, you can examine what changed in execution and whether that change is useful on later tasks.

[Harness² on GitHub →](https://github.com/google-research/harness2?utm_source=aiengineering.beehiiv.com&utm_medium=referral&utm_campaign=google-open-sources-a-framework-for-self-improving-agent-harness)
