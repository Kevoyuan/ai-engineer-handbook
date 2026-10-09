"use client";

/**
 * Source-grounded chapter-local teaching diagrams. These are deliberately
 * illustrative states, never observed document/trace/order records.
 * Source owners: handbook/chapters/05, 09 and 12.
 */
import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import "./structural-guides.css";

type Copy = readonly [string, string];
type State = "pass" | "hold" | "block" | "idle";
type DiagramCase = {
  label: Copy;
  input: Copy;
  decision: Copy;
  why: Copy;
};
const t = (pair: Copy, en: boolean) => pair[en ? 1 : 0];
const status: Record<State, Copy> = {
  pass: ["已验证", "Verified"],
  hold: ["待核对", "Review"],
  block: ["停止", "Blocked"],
  idle: ["未选择", "Not selected"],
};

function Selector({cases, current, onChange, en}: {
  cases: readonly DiagramCase[]; current: number; onChange: (index: number) => void; en: boolean;
}) {
  return <div className="struct-scenarios" role="group" aria-label={en ? "Select a teaching scenario" : "选择教学场景"}>
    {cases.map((item, index) =>
      <button type="button" key={index} aria-pressed={current === index}
        onClick={() => onChange(index)}>{t(item.label, en)}</button>)}
  </div>;
}
function Header({eyebrow, title, summary, en}: {
  eyebrow: string; title: Copy; summary: Copy; en: boolean;
}) {
  return <header className="struct-head">
    <span className="struct-kicker">{eyebrow}</span>
    <h3 id="struct-guide-title">{t(title, en)}</h3>
    <p>{t(summary, en)}</p>
  </header>;
}
function Outcome({item, en}: {item: DiagramCase; en: boolean}) {
  return <div className="struct-decision" aria-live="polite" aria-atomic="true">
    <div className="struct-kicker">{en ? "DECISION / EVIDENCE" : "决策 / 证据"}</div>
    <strong>{t(item.decision, en)}</strong>
    <p>{t(item.why, en)}</p>
  </div>;
}
function ProvenanceGuide({en}: {en:boolean}) {
  const [selected,setSelected] = useState(0);
  const examples: readonly (DiagramCase & {stageStates: readonly State[]; focus: Copy})[] = [
    {
      label:["可核对引用","Verifiable citation"],
      input:["教学案例：一个 Claim 来自可定位的原生 PDF 条款。","Teaching case: a claim comes from a locatable native-PDF clause."],
      decision:["可附带引用回答","Answer with verifiable citation"],
      why:["必须核对页面定位、原文片段与 Claim 的语义蕴含；仅有引用标记还不够。","Check page locator, original passage and claim entailment. A citation badge alone is not evidence."],
      stageStates:["pass","pass","pass","pass","pass"],
      focus:["Claim 能回到具体的原始信息单元","Claim resolves to the source information unit"],
    },
    {
      label:["跨页表格缺结构","Broken table structure"],
      input:["教学案例：跨页表格的续表缺少表头和行列对应关系。","Teaching case: a continued table loses its header and row/column alignment."],
      decision:["暂停结论，修复表格结构","Hold answer; repair table structure"],
      why:["相似度命中单元格文本不证明数值所属列、单位或版本正确。需要原页复核与重建。","A matching cell string does not prove column, unit or version. Reinspect original pages and reconstruct."],
      stageStates:["pass","block","idle","idle","idle"],
      focus:["失败边界：Structure Reconstruction","Failure boundary: Structure Reconstruction"],
    },
    {
      label:["扫描页证据缺失","Unresolved scanned page"],
      input:["教学案例：扫描页只得到无法可靠定位的 OCR 片段。","Teaching case: OCR from a scanned page lacks a reliable source locator."],
      decision:["回看原页；不足则拒绝断言","Review original page; otherwise abstain"],
      why:["应记录 OCR / 布局的不确定性；无法确认原始位置时不能生成精确页码或强行引用。","Track OCR/layout uncertainty. Never invent a precise page citation without source verification."],
      stageStates:["hold","block","idle","idle","idle"],
      focus:["失败边界：可验证的原页来源","Failure boundary: verifiable page provenance"],
    },
  ];
  const example=examples[selected];
  const pipeline: readonly {tag:string; title:Copy; detail:Copy}[] = [
    {tag:"01",title:["原始文档","Original document"],detail:["版本 · 页 · 坐标","Version · page · bbox"]},
    {tag:"02",title:["结构恢复","Structure"],detail:["表头 · 单元格 · 图注","Header · cell · caption"]},
    {tag:"03",title:["证据片段","Evidence chunk"],detail:["段落 / 表格 ID · 来源","Paragraph / table ID · locator"]},
    {tag:"04",title:["证据对齐","Claim alignment"],detail:["支持 / 冲突 / 缺失","Support / conflict / missing"]},
    {tag:"05",title:["可核验的引用","Resolvable citation"],detail:["引用有效 ≠ 仅有引用","Correct, not merely present"]},
  ];
  return <section className="structural-guide struct-provenance" id="concept-demo"
    data-structural-version="3" data-chapter="05" data-scenario={selected} aria-labelledby="struct-guide-title">
    <Header eyebrow="05 / DOCUMENT PROVENANCE" en={en}
      title={["从 Claim 追踪到原始 PDF","Trace a claim back to its PDF source"]}
      summary={["按顺序检查证据谱系。对表格、扫描页和跨页信息，结构定位比相似度分数更关键。",
        "Follow source lineage. For tables and scanned pages, resolvable structure matters more than a similarity score."]}/>
    <Selector cases={examples} current={selected} onChange={setSelected} en={en}/>
    <p className="struct-input"><span>{en?"INPUT":"输入"}</span>{t(example.input,en)}</p>
    <div className="struct-caption">{en?"CLAIM → SOURCE LINEAGE":"CLAIM → SOURCE 证据谱系"}</div>
    <ol className="struct-lineage" aria-label={en?"Source provenance stages":"来源溯源检查阶段"}>
      {pipeline.map((node,index)=> <li key={node.tag} data-state={example.stageStates[index]}>
        <span className="struct-step">{node.tag}</span>
        <div><strong>{t(node.title,en)}</strong><small>{t(node.detail,en)}</small></div>
        <span className="struct-status">{t(status[example.stageStates[index]],en)}</span>
      </li>)}
    </ol>
    <div className="struct-focus"><span className="struct-kicker">{en?"EARLIEST FAILURE / SOURCE":"最早的失败 / 来源"}</span>
      <strong>{t(example.focus,en)}</strong></div>
    <Outcome item={example} en={en}/>
    <p className="struct-note">{en?"CH05 §§5.1–5.8 · Illustrated teaching cases, not live PDF parsing. Page IDs are requirements, not invented evidence.":
      "对应 CH05 §5.1–5.8 · 教学示意，并未解析真实 PDF；页码定位是验证要求，不是虚构证据。"}</p>
  </section>;
}

function EvaluationGuide({en}: {en:boolean}) {
  const [selected,setSelected] = useState(0);
  const examples: readonly (DiagramCase & {origin: string; release:Copy; action:Copy})[] = [
    {
      label:["检索漏证据","Retrieval miss"],
      input:["教学案例：相关文档未进入授权候选/上下文，生成器无法得到充分证据。","Teaching case: relevant authorized evidence never reaches the answer context."],
      decision:["定位检索层，补测试后再考虑发布","Repair retrieval and evaluate before release"],
      why:["先核对分层 Recall、过滤、重排和索引版本；不是先改最终 Prompt。","Inspect slice Recall, filters, reranking and index version before changing the final prompt."],
      origin:"retrieval",release:["HOLD · 缺少回归证据","HOLD · Regression evidence needed"],
      action:["重新构造该风险分组的数据与测试","Add slice-specific evidence and tests"],
    },
    {
      label:["工具超时","Tool timeout"],
      input:["教学案例：工具超时后发生重试；系统必须辨认是否已产生副作用。","Teaching case: a tool times out during a retry-sensitive operation."],
      decision:["核对工具状态和副作用，限制重试","Reconcile tool state; bound retries"],
      why:["Timeout 不证明工具没有执行。记录 Trace，核对操作账本和重试 / 幂等策略。","Timeout does not prove non-execution. Check the trace, operation ledger and retry/idempotency policy."],
      origin:"tool",release:["HOLD · 先通过故障注入测试","HOLD · Fault-injection evidence required"],
      action:["故障注入与重复副作用回归","Fault injection and duplicate-effect regression"],
    },
    {
      label:["租户越权","Tenant policy leak"],
      input:["教学案例：出现跨租户查询授权违规信号，属于关键安全回归。","Teaching case: a cross-tenant authorization violation is detected."],
      decision:["阻断发布，隔离问题并修复策略边界","Block release and repair the authorization boundary"],
      why:["高风险安全违规不能被总体平均分的提升抵消。应有可复现负向用例。","A critical safety violation cannot be offset by improved average scores. Require a reproducible negative case."],
      origin:"policy",release:["BLOCK · 安全门禁","BLOCK · Critical safety gate"],
      action:["隔离事件 → 权限回归 → 人工审查","Isolate → access regression → human review"],
    },
  ];
  const spans: readonly {id:string; title:Copy; detail:Copy}[]=[
    {id:"llm",title:["LLM Run","LLM Run"],detail:["候选结论与版本","Proposed output & version"]},
    {id:"retrieval",title:["Retriever Run","Retriever Run"],detail:["候选 / 元数据 / 来源","Candidates / ACL / provenance"]},
    {id:"tool",title:["Tool Run","Tool Run"],detail:["调用 / 反馈 / 副作用","Call / feedback / side effects"]},
    {id:"policy",title:["Validator / Policy Run","Validator / Policy Run"],detail:["输出检查 / 权限决策","Validation / authorization"]},
  ];
  const example=examples[selected];
  return <section className="structural-guide struct-evaluation" id="concept-demo"
    data-structural-version="3" data-chapter="09" data-scenario={selected} aria-labelledby="struct-guide-title">
    <Header eyebrow="09 / TRACE → EVAL → RELEASE" en={en}
      title={["先找最早错误，再决定能否发布","Find the first wrong decision before release"]}
      summary={["Root Run 展开为可观察的子 Run；离线数据集和真实执行轨迹不是同一个数据面。",
        "A root run contains observable child runs. Offline datasets and runtime trajectories are different data planes."]}/>
    <Selector cases={examples} current={selected} onChange={setSelected} en={en}/>
    <p className="struct-input"><span>{en?"OBSERVED CASE · ILLUSTRATION":"示例故障"}</span>{t(example.input,en)}</p>
    <div className="struct-eval-grid">
      <div>
        <div className="struct-caption">{en?"RUNTIME TRACE · DIAGNOSTIC TREE":"RUNTIME TRACE · 故障树"}</div>
        <div className="struct-trace-root"><span className="struct-kicker">ROOT RUN</span>
          <strong>{en?"Single request execution":"一次请求的执行记录"}</strong></div>
        <ol className="struct-trace-tree">
          {spans.map(s=><li key={s.id} data-state={s.id===example.origin?"block":"idle"}>
            <span className="struct-trace-branch" aria-hidden="true">└─</span>
            <div><strong>{t(s.title,en)}</strong><small>{t(s.detail,en)}</small></div>
            {s.id===example.origin&&<span className="struct-trace-flag">{en?"INVESTIGATE":"重点排查"}</span>}
          </li>)}
        </ol>
      </div>
      <div>
        <div className="struct-caption">{en?"EVALUATION & RELEASE CONTROL":"评估与发布决策"}</div>
        <ol className="struct-eval-cycle">
          <li><strong>{en?"Trace triage":"Trace 分诊"}</strong><small>{en?"Identify earliest wrong decision":"定位最早错误节点"}</small></li>
          <li><strong>{en?"Privacy review / label":"脱敏审核 / 标注"}</strong><small>{en?"Curated cases, not raw trace copying":"受审案例，不是直接复制原始 Trace"}</small></li>
          <li><strong>{en?"Offline regression":"离线回归"}</strong><small>{t(example.action,en)}</small></li>
          <li data-state={selected===2?"block":"hold"}><strong>{en?"Release policy":"发布门禁"}</strong><small>{t(example.release,en)}</small></li>
        </ol>
      </div>
    </div>
    <div className="struct-eval-return"><span aria-hidden="true">↶</span>
      {en?"Only verified changes may proceed to shadow / canary; new traces feed the next review.":"只有验证通过的变更才能进入 Shadow / Canary；新 Trace 回流下一轮评估。"}</div>
    <Outcome item={example} en={en}/>
    <p className="struct-note">{en?"CH09 §§9.4–9.15 · Hypothetical failure paths. A trace is an observation record; evaluation and rollout are separate gates.":
      "对应 CH09 §9.4–9.15 · 假设的故障路径。Trace 是观察记录；评估和发布是独立门禁。"}</p>
  </section>;
}

function DeliveryGuide({en}: {en:boolean}) {
  const [selected,setSelected] = useState(0);
  const examples: readonly (DiagramCase & {gates:readonly State[]; focus:Copy})[] = [
    {
      label:["正常调查","Authorized investigation"],
      input:["教学案例：授权的用户调查本租户订单，数据新鲜且证据完整；最终建议仍由人审。","An authorized order investigation with fresh, complete evidence; a human reviews the recommendation."],
      decision:["展示有来源的调查结果，进入人工审核","Show grounded findings for human review"],
      why:["模型只能提出解释；订单事实来自可信数据面，关键写操作仍需 Host / 人工权限。","The model proposes explanations. Trusted data owns facts; writes remain behind host/human gates."],
      gates:["pass","pass","pass","pass","pass","pass","pass"],
      focus:["授权 + 证据 + 人审均满足","Authorization + evidence + review satisfied"],
    },
    {
      label:["跨租户读取","Cross-tenant request"],
      input:["教学案例：用户请求另一租户的订单，不能由 Prompt 或缓存授权。","A user requests an order belonging to another tenant; prompts and caches cannot grant access."],
      decision:["在受信权限边界拒绝读取","Deny read at the trusted authorization boundary"],
      why:["检索前收紧候选集，读取时重新核验 RLS / ACL；不能透露无权资源存在。","Scope candidates first and recheck RLS/ACL at fetch; do not reveal forbidden records."],
      gates:["pass","pass","idle","block","idle","idle","idle"],
      focus:["B4 · Tenant-scoped read","B4 · 租户权限读取"],
    },
    {
      label:["未经审批的写入","Unapproved write"],
      input:["教学案例：模型生成“退款已批准”，但用户未授权执行写操作。","The model writes “refund approved” without authorization for a real side effect."],
      decision:["将输出视为草稿，阻止工具写入","Treat output as draft; block the tool write"],
      why:["LLM 文本不是系统操作权限。必须由 Host Gate、业务状态与人工审批控制副作用。","LLM text conveys no execution authority. The host, business state and human approval control side effects."],
      gates:["pass","pass","pass","pass","pass","block","idle"],
      focus:["B6 · Human / Host write approval","B6 · 人工 / Host 写入审批"],
    },
  ];
  const planes:readonly {id:string; title:Copy; description:Copy}[]=[
    {id:"customer",title:["客户 / 工作流平面","Customer / workflow"],description:["真实用户 · SSO · 审批 UI","User · SSO · approval UI"]},
    {id:"control",title:["控制平面","Control"],description:["策略 · 工具白名单 · 预算","Policy · allowlist · budget"]},
    {id:"data",title:["数据平面","Data"],description:["CDC → Bronze / Silver / Gold","CDC → Bronze / Silver / Gold"]},
    {id:"execution",title:["执行平面","Execution"],description:["路由 · SQL / Exact · 证据判断","Router · SQL / Exact · evidence"]},
    {id:"operations",title:["证据与运维平面","Evidence / operations"],description:["Trace · Eval · Canary / Rollback","Trace · Eval · Canary / rollback"]},
  ];
  const boundaries:readonly {id:string; title:Copy}[]=[
    {id:"B1",title:["可信身份和会话","Trusted identity and session"]},
    {id:"B2",title:["工具权限 / 成本约束","Tool authorization and budget"]},
    {id:"B3",title:["CDC / 事件状态契约","CDC and event correctness"]},
    {id:"B4",title:["租户隔离的读取","Tenant-scoped read"]},
    {id:"B5",title:["证据充分性 / 可追溯性","Evidence sufficiency and provenance"]},
    {id:"B6",title:["写操作审批","Write-action approval"]},
    {id:"B7",title:["评估 / 灰度 / 回滚","Eval, canary and rollback"]},
  ];
  const example=examples[selected];
  return <section className="structural-guide struct-delivery" id="concept-demo"
    data-structural-version="3" data-chapter="12" data-scenario={selected} aria-labelledby="struct-guide-title">
    <Header eyebrow="12 / FDE · SYSTEM RESPONSIBILITY" en={en}
      title={["五个责任平面，七个显式边界检查","Five responsibility planes, seven explicit checks"]}
      summary={["对齐 CH12 案例的五个责任平面，并把七项架构审查点明确列出；不是某个框架的官方标准。",
        "Maps CH12's five named responsibility planes to seven authored review checks; not a framework standard."]}/>
    <Selector cases={examples} current={selected} onChange={setSelected} en={en}/>
    <p className="struct-input"><span>{en?"CASE":"场景"}</span>{t(example.input,en)}</p>
    <div className="struct-caption">{en?"FDE SYSTEM · RESPONSIBILITY PLANES":"FDE SYSTEM · 责任平面拓扑"}</div>
    <div className="struct-planes" role="list" aria-label={en?"Five responsibility planes":"五个责任平面"}>
      {planes.map(p=><div role="listitem" key={p.id} data-plane={p.id}>
        <span>{p.id.toUpperCase()}</span><strong>{t(p.title,en)}</strong><small>{t(p.description,en)}</small>
      </div>)}
    </div>
    <div className="struct-caption">{en?"ARCHITECTURE REVIEW CHECKS · B1–B7":"架构审查边界 · B1–B7"}</div>
    <ol className="struct-boundaries">
      {boundaries.map((gate,index)=><li key={gate.id} data-state={example.gates[index]}>
        <span className="struct-step">{gate.id}</span>
        <strong>{t(gate.title,en)}</strong><small>{t(status[example.gates[index]],en)}</small>
      </li>)}
    </ol>
    <div className="struct-focus"><span className="struct-kicker">{en?"DECISIVE CHECK":"决定性边界"}</span>
      <strong>{t(example.focus,en)}</strong></div>
    <Outcome item={example} en={en}/>
    <p className="struct-note">{en?"CH12 §12.11.2–12.11.8 · Planes come from the authored capstone. B1–B7 are an explicit teaching checklist, not formal platform interfaces.":
      "对应 CH12 §12.11.2–12.11.8 · 平面来自原章节综合案例，B1–B7 是教学审查清单，不是平台官方接口。"}</p>
  </section>;
}

/**
 * Mount after the relevant canonical artifact instead of rewriting
 * source HTML or introducing an alternative full-page design system.
 */
export function StructuralGuide({slug,en,pane,onReady}:{
  slug:string; en:boolean; pane:RefObject<HTMLDivElement|null>; onReady:(ready:boolean)=>void;
}) {
  const chapter = slug.slice(0,2);
  const [host,setHost] = useState<HTMLElement|null>(null);
  useLayoutEffect(()=>{
    const selector = chapter==="05" ? "#fig-5-2" : chapter==="09" ? "#fig-9-1" : chapter==="12" ? "#fde-framework" : null;
    if(!selector)return;
    const anchor=pane.current?.querySelector(selector);
    if(!anchor)return;
    const slot=document.createElement("div");
    slot.className="structural-guide-slot";
    const insertion=chapter==="12"&&anchor.nextElementSibling?.tagName==="P" ? anchor.nextElementSibling : anchor;
    insertion.after(slot);
    setHost(slot);
    return ()=>{slot.remove();setHost(null);};
  },[chapter,en,pane]);
  useLayoutEffect(()=>{onReady(Boolean(host));return ()=>onReady(false);},[host,onReady]);
  if(!host)return null;
  return createPortal(chapter==="05" ? <ProvenanceGuide en={en}/> :
    chapter==="09" ? <EvaluationGuide en={en}/> : <DeliveryGuide en={en}/>,host);
}
