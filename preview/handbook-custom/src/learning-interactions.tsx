import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Copy } from "./learning-content";

type Question = { prompt: Copy; options: Copy[]; answer: number; explanation: Copy };
const questions: Record<string, Question[]> = {
  "dg2-query-routing": [
    { prompt: ["问题包含精确错误码 E4307，哪条路径更合适？", "A query contains the exact error code E4307. Which path fits best?"], options: [["只用语义相似度", "Semantic similarity alone"], ["优先 Exact，再用 BM25 补充", "Exact matching first, supplemented by BM25"], ["先忽略错误码", "Ignore the error code first"]], answer: 1, explanation: ["稳定编号适合精确匹配，BM25 补充术语。Dense 相似度不能保证编号匹配；所有路径仍须限定权限与版本。", "Stable identifiers suit exact matching, with BM25 for terminology. Dense similarity does not guarantee an identifier match. All paths remain access- and version-scoped."] },
    { prompt: ["供应商与产品的关系图里没有一条边，能得出什么结论？", "A supplier-to-product edge is missing from a graph. What can you conclude?"], options: [["关系证据不足，需要核对来源", "Relationship evidence is incomplete; check sources"], ["供应商一定不影响该产品", "The supplier definitely does not affect the product"], ["可跳过授权扩大搜索", "You can skip authorization to broaden search"]], answer: 0, explanation: ["缺失关系不等于不存在关系。核对图谱覆盖和支持文档，不能为补齐证据绕过权限。", "A missing edge does not prove absence. Check graph coverage and supporting documents without bypassing authorization."] },
  ],
  "fig-4-1": [
    { prompt: ["两份有效来源相互冲突，系统应该怎样回应？", "Two valid sources conflict. How should the system respond?"], options: [["选择排名更高的并直接回答", "Answer from the higher-ranked source"], ["把两份结论拼接", "Merge both conclusions"], ["揭示冲突，澄清或转交复核", "Disclose the conflict; clarify or request review"]], answer: 2, explanation: ["相似度排名不是事实裁决。保留冲突和出处，必要时澄清或复核，不能悄悄替读者选一个结论。", "Similarity ranking does not settle facts. Preserve conflicting sources and clarify or request review rather than silently choosing a conclusion."] },
    { prompt: ["检索命中很多段落，但缺少关键条件的依据。下一步是什么？", "Many passages were retrieved, but a key condition has no support. What next?"], options: [["说明证据缺口，不给出无依据结论", "Explain the gap; avoid an unsupported conclusion"], ["命中数量多就可以回答", "The number of hits is enough to answer"], ["用模型常识补成政策", "Fill the policy gap from model knowledge"]], answer: 0, explanation: ["证据覆盖取决于是否支持所需判断，不取决于段落数量。关键条件缺证据时应补检索、澄清或拒答。", "Coverage depends on support for the required claim, not passage count. Retrieve more evidence, clarify or abstain when a key condition lacks support."] },
  ],
  "capability-architecture-title": [
    { prompt: ["技能匹配成功，但没有读取目标文件的权限，应该怎么做？", "A skill matches, but file access is denied. What should happen?"], options: [["先执行，之后补审批", "Execute first and request approval later"], ["换一个工具绕过限制", "Use another tool to bypass the restriction"], ["停止执行，说明授权边界", "Stop execution and explain the access boundary"]], answer: 2, explanation: ["Skill Match ≠ Authorization。权限来自可信授权系统；技能指令、名称匹配或工具切换都不能授予权限。", "Skill Match ≠ Authorization. Permission comes from trusted authorization, not skill instructions, matching or a different tool."] },
    { prompt: ["为什么不把所有技能和参考文档一次性放入上下文？", "Why avoid loading every skill and reference into context at once?"], options: [["技能正文永远不会被读取", "Skill instructions are never read"], ["按需加载减少无关内容，也保留能力边界", "On-demand loading limits irrelevant content and preserves boundaries"], ["加载后不再需要工具", "Loading eliminates the need for tools"]], answer: 1, explanation: ["先通过摘要找候选，再在需要时加载相关指令与资料。这样减少 Token 与注意力负担；工具仍负责操作，权限仍独立校验。", "Find candidates through summaries, then load relevant instructions and references as needed. This limits token and attention costs. Tools still act and authorization remains separate."] },
  ],
  "cross-session-memory-title": [
    { prompt: ["记忆中的规则很相关，但已被新版本替代，能直接使用吗？", "A relevant remembered rule has been superseded. Can it be used directly?"], options: [["不能，应排除旧版本并核对有效来源", "No; exclude the old version and check a valid source"], ["能，相关性足够高就有效", "Yes; high relevance proves validity"], ["能，长期保存的内容不会过期", "Yes; long-term storage never expires"]], answer: 0, explanation: ["相关性不代表有效性。长期记忆需要来源、范围、版本和有效期；找不到可靠的新来源时应说明缺口。", "Relevance is not validity. Long-term memory needs source, scope, version and validity metadata. Explain the gap when no reliable current source is available."] },
    { prompt: ["用户偏好中文，但本次明确要求英文报告，该用哪种语言？", "The user prefers Chinese but explicitly requests English this time. Which language applies?"], options: [["永远遵循长期偏好", "Always follow the stored preference"], ["遵循本次明确要求，使用英文", "Follow this request and use English"], ["混用两种语言", "Mix both languages"]], answer: 1, explanation: ["稳定偏好是默认值，不能覆盖当前明确要求。将与任务相关、有效且不冲突的记忆加入上下文。", "A stable preference is a default, not an override for an explicit current request. Include memories that are relevant, valid and consistent with the task."] },
  ],
  "fig-8-loop-vs-graph": [
    { prompt: ["任务尚未完成，执行预算已经耗尽，应该怎么办？", "The task is incomplete and the execution budget is exhausted. What next?"], options: [["继续重试直到成功", "Retry until it succeeds"], ["把未完成记录为成功", "Record incomplete work as success"], ["停止自动执行，保存状态并交接", "Stop automatic execution, preserve state and hand off"]], answer: 2, explanation: ["预算是循环边界。退出时保留状态、失败原因和下一步，使人工或后续流程能够接手。", "Budget bounds the loop. Preserve state, failure reasons and next steps so a person or later workflow can resume."] },
    { prompt: ["工具返回“已完成”，是否足以结束任务？", "A tool says “done”. Is that enough to finish the task?"], options: [["是，工具返回就是验收", "Yes; a tool response is acceptance"], ["还需验证结果是否满足验收条件", "Check the result against acceptance criteria"], ["无论结果如何都继续循环", "Keep looping regardless of the result"]], answer: 1, explanation: ["工具反馈是证据输入，任务完成依赖验证后的验收条件。满足就停止，否则在权限和预算范围内修正或交接。", "Tool feedback is evidence input. Completion requires verified acceptance. Stop when criteria are met; otherwise revise or hand off within access and budget limits."] },
  ],
};

export function KnowledgeCheck({ anchor, en }: { anchor: string; en: boolean }) {
  const quiz = questions[anchor];
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [checked, setChecked] = useState(false);
  const t = (c: Copy) => c[en ? 1 : 0];
  if (!quiz) return null;
  const question = quiz[index];
  function move(next: number) {
    setIndex(next); setChoice(""); setChecked(false);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  return <Collapsible open={open} onOpenChange={setOpen} className="knowledge-check">
    <CollapsibleTrigger asChild><Button variant="outline" className="knowledge-trigger">{open ? (en ? "Hide practice" : "收起练习") : (en ? "Test your understanding · 2 questions" : "检验理解 · 2 道练习")}</Button></CollapsibleTrigger>
    <CollapsibleContent>
      <div className="knowledge-content">
        <span className="learning-caption">{en ? "Question" : "题目"} {index + 1} / {quiz.length}</span>
        <h4 ref={heading} tabIndex={-1} id={id + "-question"}>{t(question.prompt)}</h4>
        <RadioGroup value={choice} onValueChange={(value) => { setChoice(value); setChecked(false); }} aria-labelledby={id + "-question"} className="knowledge-options">
          {question.options.map((option, i) => <label key={i} htmlFor={id + "-" + i} className="knowledge-option" data-selected={choice === String(i)}>
            <RadioGroupItem value={String(i)} id={id + "-" + i} /><span>{t(option)}</span>
          </label>)}
        </RadioGroup>
        <div className="knowledge-feedback" role="status" aria-atomic="true">
          {checked ? <><strong>{Number(choice) === question.answer ? (en ? "Correct" : "回答正确") : (en ? "Try another answer" : "再想一想")}</strong><p>{t(question.explanation)}</p></> : <p>{en ? "Choose an answer, then check the explanation. Your answers are not saved." : "选择答案，再查看解析。练习答案不会保存。"}</p>}
        </div>
        <div className="learning-actions">
          <Button disabled={!choice} onClick={() => setChecked(true)}>{en ? "Check answer" : "检查答案"}</Button>
          <Button variant="outline" disabled={!checked} onClick={() => move((index + 1) % quiz.length)}>{index === quiz.length - 1 ? (en ? "Start again" : "重新练习") : (en ? "Next question" : "下一题")}</Button>
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>;
}

export function SkillContextInspector({ example, step, en }: { example: number; step: number; en: boolean }) {
  const t = (zh: string, english: string) => en ? english : zh;
  // This pure stage mapping models the example, never grants runtime access.
  const loaded = [true, example === 0 && step >= 2, example === 0 && step >= 3];
  const files = [
    { name: "catalog", label: t("能力摘要", "Summary"), text: t("pdf-extract：提取 PDF 文字并保留页码。\nanalyze_contract_risk：需要合同和适用地区。\nexport_customers：仅处理已获授权的客户数据。", "pdf-extract: extract PDF text with page numbers.\nanalyze_contract_risk: requires a contract and jurisdiction.\nexport_customers: authorized customer data only.") },
    { name: "skill", label: "SKILL.md", text: t("1. 检查文件可读与输入完整性。\n2. 使用提取工具，保留页码和来源。\n3. 对照输入核验结果，不把工具返回当作验收。", "1. Check read access and input completeness.\n2. Use extraction tools, keeping page numbers and sources.\n3. Validate output against input; a tool response is not acceptance.") },
    { name: "reference", label: "references/", text: t("PDF 解析参考（示例）：\n文本型 PDF 先提取文本层。\n扫描页需要 OCR，再检查阅读顺序和页码。", "PDF parsing reference (illustrative):\nExtract the text layer from text-based PDFs.\nScanned pages need OCR, followed by reading-order and page-number checks.") },
  ];
  return <div className="skill-inspector">
    <div className="skill-context-heading"><strong>{t("当前上下文", "Current context")}</strong><span className="learning-caption">{loaded.filter(Boolean).length} / 3 {t("层已加载", "layers loaded")}</span></div>
    <Tabs defaultValue="catalog">
      <TabsList aria-label={t("查看上下文层", "Inspect context layers")} className="skill-file-tabs">
        {files.map((file, i) => <TabsTrigger value={file.name} key={file.name}>{file.label}<span className="skill-load-state">{loaded[i] ? t("已加载", "Loaded") : t("未加载", "Unloaded")}</span></TabsTrigger>)}
      </TabsList>
      {files.map((file, i) => <TabsContent value={file.name} key={file.name} className="skill-file-content">
        <p className="learning-caption">{loaded[i] ? t("已进入本例上下文 · 内容为示意", "In this example's context · illustrative content") : t("尚未进入上下文", "Not in context yet")}</p>
        {loaded[i] ? <pre>{file.text}</pre> : <p>{example === 0 ? t("推进到对应步骤后，才会加载这一层。点击标签仅查看状态，不会触发加载。", "Advance to the corresponding step to load this layer. Selecting a tab only inspects its state.") : t("本例在输入或权限检查处退出，不加载技能正文与参考资料。", "This example exits at the input or access gate. Full instructions and references are not loaded.")}</p>}
      </TabsContent>)}
    </Tabs>
    <p className="learning-caption" role="status">{step < 3 ? t("尚未调用工具", "No tool called yet") : example === 0 ? t("模拟调用：extract_text(report.pdf) → 返回带页码的文字", "Simulated call: extract_text(report.pdf) → text with page numbers") : t("工具调用已阻止", "Tool call blocked")}</p>
  </div>;
}
