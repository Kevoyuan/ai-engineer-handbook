"use client";

/**
 * Visual mental models derived from canonical chapters 01/02/07/11.
 * Distinct forms: allocation / authorization pipeline / read-write ledgers / CDC timeline.
 * Scenario content is hypothetical. Nothing executes against user data.
 */
import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import "./concept-atlas-guides.css";

type Copy = readonly [string, string];
type State = "pass" | "hold" | "block" | "idle";
type Scenario = {label:Copy; premise:Copy; result:Copy; rationale:Copy};
const tr=(x:Copy,en:boolean)=>x[en?1:0];
const states:Record<State,Copy>={
  pass:["已核对","Checked"],hold:["需确认","Review"],block:["阻断","Blocked"],idle:["未进入","Not reached"],
};
function Controls({items,current,onSelect,en}:{
  items:readonly Scenario[];current:number;onSelect:(n:number)=>void;en:boolean;
}){
  return <div className="atlas-examples" role="group" aria-label={en?"Teaching scenarios":"教学情景"}>
    {items.map((item,i)=><button key={i} type="button" onClick={()=>onSelect(i)}
      aria-pressed={i===current}>{tr(item.label,en)}</button>)}
  </div>;
}
function Title({code,heading,about,en}: {code:string;heading:Copy;about:Copy;en:boolean}){
  return <header className="atlas-mental-head"><span className="atlas-mental-kicker">{code}</span>
    <h3>{tr(heading,en)}</h3><p>{tr(about,en)}</p></header>;
}
function Conclusion({c,en}: {c:Scenario;en:boolean}){
  return <div className="atlas-mental-outcome" aria-live="polite" aria-atomic="true">
    <span className="atlas-mental-kicker">{en?"ENGINEERING DECISION":"工程决策"}</span>
    <strong>{tr(c.result,en)}</strong><p>{tr(c.rationale,en)}</p>
  </div>;
}
function Legend({en}: {en:boolean}) {
  return <div className="atlas-mental-legend" aria-label={en?"State labels":"状态说明"}>
    {(["pass","hold","block","idle"] as const).map(s=><span key={s} data-state={s}>{tr(states[s],en)}</span>)}
  </div>;
}

const budgets:readonly (Scenario&{status:readonly State[];watch:Copy})[]=[
  {
    label:["预算不足","Budget pressure"],
    premise:["System、Tools、历史、检索文档与输出预留同时竞争有限上下文。","System, tools, history, retrieved sources and output reservation compete for context."],
    result:["先保留约束与输出预算，再精简重复和低价值信息","Protect constraints and output budget; remove low-value material first"],
    rationale:["去重、重排、分步检索和结构化 State 可以减压，但压缩可能损失证据出处。","Dedup, rerank, staged retrieval and structured state may help, but compression can lose provenance."],
    status:["pass","hold","hold","pass","pass"],
    watch:["容量 ≠ 有效可用上下文","Capacity ≠ usable evidence context"],
  },
  {
    label:["证据埋在中间","Evidence buried"],
    premise:["同一条有效证据在不同上下文位置出现，但并非总能被模型稳定使用。","The same relevant evidence appears at different positions but is not always used reliably."],
    result:["对目标模型做位置敏感性与引用支持评估","Evaluate evidence-position sensitivity and citation support on the target model"],
    rationale:["不能把“Lost in the Middle”误讲成所有模型必然失败，或统一把证据放两端。","Lost-in-the-middle effects are model/task-dependent; placing all evidence at the ends is not a universal solution."],
    status:["pass","pass","hold","hold","pass"],
    watch:["位置与证据利用必须评估","Position effects require empirical evaluation"],
  },
  {
    label:["压缩丢失约束","Compression loss"],
    premise:["长历史被摘要后，稳定业务约束或文档来源丢失。","Compression of a long history drops a durable constraint or source locator."],
    result:["恢复可核验的关键状态与出处，再组装 Context","Reconstruct verified constraints and provenance before assembling context"],
    rationale:["摘要不是事实来源；应保留结构化 State 与出处，必要时回查原始记录。","A summary is not the source of truth. Preserve structured state and source links."],
    status:["pass","block","hold","hold","pass"],
    watch:["摘要 ≠ 权威状态","Summary ≠ authoritative state"],
  },
];
const budgetParts:readonly {id:string;name:Copy;responsibility:Copy}[]=[
  {id:"constraints",name:["系统约束","System / policy"],responsibility:["不可随意删减","Protected"]},
  {id:"history",name:["历史记录","History"],responsibility:["筛选与去重","Prune / dedup"]},
  {id:"evidence",name:["检索证据","Retrieved evidence"],responsibility:["按任务选择","Route / rerank"]},
  {id:"state",name:["工作状态","Working state"],responsibility:["结构化保留","Structured view"]},
  {id:"output",name:["输出预留","Output reservation"],responsibility:["留足空间","Reserve capacity"]},
];
function ContextBudget({en}:{en:boolean}){
  const [choice,setChoice]=useState(0);const c=budgets[choice];
  return <section className="atlas-mental atlas-context" id="concept-demo" data-mental-chapter="01"
    data-scenario={choice} aria-label={en?"Context budget and evidence utilization lab":"上下文预算与证据利用实验"}>
    <Title code="01 / CONTEXT · ALLOCATION" en={en}
      heading={["上下文容量不等于可靠使用","Context capacity is not reliable evidence use"]}
      about={["按任务决定什么必须保留、什么可以压缩、什么需要重检索。以下不表示具体 token 占比。",
        "Separate required, compressible and on-demand context. These cards are not measured token shares."]}/>
    <Controls items={budgets} current={choice} onSelect={setChoice} en={en}/>
    <p className="atlas-mental-input"><strong>{en?"CONSTRAINT":"问题"}</strong>{tr(c.premise,en)}</p>
    <div className="atlas-mental-label">{en?"CONTEXT BUDGET · RESPONSIBILITY, NOT PERCENTAGES":"CONTEXT BUDGET · 责任分配而非百分比"}</div>
    <div className="atlas-budget-rail" role="list" aria-label={en?"Context allocation responsibilities":"上下文构成与处理边界"}>
      {budgetParts.map((p,i)=><div role="listitem" key={p.id} data-state={c.status[i]}>
        <span>{tr(p.name,en)}</span><strong>{tr(p.responsibility,en)}</strong>
        <small>{tr(states[c.status[i]],en)}</small></div>)}
    </div>
    <div className="atlas-mental-focus"><span>{en?"RELIABILITY BOUNDARY":"可靠性边界"}</span><strong>{tr(c.watch,en)}</strong></div>
    <Legend en={en}/>
    <Conclusion c={c} en={en}/>
    <p className="atlas-mental-source">{en?"CH01 §§1.4–1.4.2 and CH07 §7.4 · Conceptual allocation, not a quantitative benchmark.":
      "来源：CH01 §1.4–1.4.2、CH07 §7.4。仅示意职责，不是定量基准测试。"}</p>
  </section>;
}
const authorization:readonly (Scenario&{checks:readonly State[];scope:Copy})[]=[
  {
    label:["正常的授权证据","Authorized evidence"],
    premise:["可信登录身份请求本租户有权限查看、版本适用的文档。","A trusted identity asks for in-scope, authorized, currently applicable evidence."],
    result:["先缩小合法候选空间，再选择检索能力","Filter to authorized candidates before ranking or routing"],
    rationale:["候选权限范围、证据来源与文档取用权限均须可验证；相关性分数不能替代 ACL。","Candidate scope, provenance and fetch authorization must hold; relevance does not override ACL."],
    checks:["pass","pass","pass","pass","pass"],
    scope:["允许范围内的检索","Authorized retrieval scope"],
  },
  {
    label:["索引 ACL 已过期","Stale indexed ACL"],
    premise:["索引仍保留旧权限，但源系统刚撤销文档授权。","Indexed permissions are stale after the source document's ACL was revoked."],
    result:["重新验证源文档权限；拒绝返回或缓存泄露","Recheck source permission and suppress unauthorized content/cache exposure"],
    rationale:["预过滤可缩小风险，但索引权限快照不一定新鲜；读取原文时要重新授权。","Prefiltering alone is not enough when ACL snapshots become stale; reauthorize at fetch."],
    checks:["pass","hold","pass","block","idle"],
    scope:["拒绝过期授权的读取","Reject revoked document fetch"],
  },
  {
    label:["跨租户索取","Cross-tenant access"],
    premise:["用户尝试请求另一租户的订单或文档，即使 ID 和相似度匹配。","A user requests another tenant's order/doc even if the key or vector matches."],
    result:["在授权候选集入口拒绝跨租户访问","Reject cross-tenant candidates at the authorization boundary"],
    rationale:["越权资源不应进入排名、Prompt、日志或共享缓存，也不能靠模型“不要泄露”。","Unauthorized data must not reach rerankers, prompts, logs or shared caches; never rely on a model refusal alone."],
    checks:["pass","block","idle","idle","idle"],
    scope:["合法候选空间为空","No authorized candidates"],
  },
];
const authorizeStages:readonly {code:string;label:Copy;detail:Copy}[]=[
  {code:"01",label:["可信身份","Trusted identity"],detail:["SSO / Tenant / Role","SSO / tenant / role"]},
  {code:"02",label:["候选权限","Candidate ACL"],detail:["预过滤 / 版本","Prefilter / version"]},
  {code:"03",label:["检索与重排","Retrieve & rerank"],detail:["Exact / BM25 / Dense / Graph","Exact / BM25 / Dense / Graph"]},
  {code:"04",label:["来源权限复核","Fetch recheck"],detail:["实时授权 / 资源","Current resource policy"]},
  {code:"05",label:["证据入 Context","Context entry"],detail:["可追溯 / 可回答","Grounded, approved evidence"]},
];
function RetrievalBoundary({en}:{en:boolean}){
  const [choice,setChoice]=useState(0);const c=authorization[choice];
  return <section className="atlas-mental atlas-retrieval" id="concept-demo" data-mental-chapter="02"
    data-scenario={choice} aria-label={en?"Permission aware retrieval lab":"授权检索边界实验"}>
    <Title code="02 / RETRIEVAL · TRUST BOUNDARY" en={en}
      heading={["先取得合法候选集，再讨论相似度","Authorization precedes retrieval relevance"]}
      about={["对比授权正常、权限撤销和跨租户请求，观察不同阶段哪里必须阻断。",
        "Compare authorized, revoked and cross-tenant requests to locate security gates."]}/>
    <Controls items={authorization} current={choice} onSelect={setChoice} en={en}/>
    <p className="atlas-mental-input"><strong>{en?"QUERY":"请求"}</strong>{tr(c.premise,en)}</p>
    <div className="atlas-mental-label">{en?"TRUSTED EXECUTION BOUNDARY":"受信执行边界"}</div>
    <ol className="atlas-auth-funnel">
      {authorizeStages.map((stage,i)=><li key={stage.code} data-state={c.checks[i]}>
        <span className="atlas-mental-index">{stage.code}</span>
        <div><strong>{tr(stage.label,en)}</strong><small>{tr(stage.detail,en)}</small></div>
        <span className="atlas-mental-state">{tr(states[c.checks[i]],en)}</span>
      </li>)}
    </ol>
    <div className="atlas-mental-focus"><span>{en?"LEGAL CANDIDATES":"合法候选范围"}</span><strong>{tr(c.scope,en)}</strong></div>
    <Legend en={en}/>
    <Conclusion c={c} en={en}/>
    <p className="atlas-mental-source">{en?"CH02 §§2.1–2.7 · ACL is a host/data-plane contract, not an LLM instruction. No live access checks.":
      "来源：CH02 §2.1–2.7。ACL 属于受信系统/数据面的契约，而不是 LLM Prompt；未执行真实授权检查。"}</p>
  </section>;
}
const memoryCases:readonly (Scenario&{path:"write"|"read"|"correction";write:readonly State[];read:readonly State[];focus:Copy})[]=[
  {label:["稳定约束晋升","Promote durable constraint"],
   premise:["用户明确给出项目预算约束；候选记录必须确认所有者、稳定性、作用域与保存许可。","An explicit project budget may become durable only after owner, stability, scope and consent checks."],
   result:["通过写入 Policy Gate 后保存版本化约束","Persist a versioned constraint only after write policy checks"],
   rationale:["短期状态并不自动成为跨线程记忆；保留来源和有效期以支持纠正、失效和审计。","Working state is not automatically cross-thread memory. Preserve origin and validity for correction."],
   path:"write",write:["pass","pass","pass","pass"],read:["idle","idle","idle","idle"],
   focus:["写入晋升门禁","Write promotion gate"]},
  {label:["无权跨作用域读取","Unauthorized read"],
   premise:["当前任务尝试召回另一用户或租户的长期记忆。","The current task asks to recall another user's or tenant's durable memory."],
   result:["在 Scope / ACL 层阻断，不能检索后再靠 Prompt 拒答","Block at scope/ACL before retrieval or prompt assembly"],
   rationale:["记忆读取按当前决策、租户、用户与有效期过滤，不能全局相似度搜索全部历史。","Memory read is decision-scoped, permission-filtered and validity-aware; no global memory search."],
   path:"read",write:["idle","idle","idle","idle"],read:["pass","block","idle","idle"],
   focus:["读取授权边界","Read authorization boundary"]},
  {label:["显式纠正旧事实","Authoritative correction"],
   premise:["原来预算是 5000；用户在适当权限范围内明确改为 7000。数字仅为教学示例。","A user explicitly corrects an old project budget from 5000 to 7000 (illustrative values)."],
   result:["新版本取代当前视图，旧记录按保留策略处理","Create a new authoritative version; invalidate the old materialized view"],
   rationale:["更新的模型猜测不等于用户纠正；优先级取决于来源、作用域、权威性及有效时间。","A newer model inference is not a correction. Authority, scope and validity control supersession."],
   path:"correction",write:["pass","pass","pass","pass"],read:["pass","pass","pass","pass"],
   focus:["纠正 → 版本化 → View 失效 / 重建","Correction → version → view invalidation"]},
];
const memoryWrite:readonly Copy[]=[
  ["候选提取","Extract candidate"],["稳定性 / 价值","Stability & value"],["冲突 / 写入许可","Conflict & write policy"],["版本 / 来源保存","Versioned, sourced store"],
];
const memoryRead:readonly Copy[]=[
  ["当前任务路由","Decision routing"],["Scope / ACL / 有效期","Scope, ACL, validity"],["受控检索 / 解决冲突","Retrieve / resolve conflict"],["组装 Context View","Assemble context view"],
];
function MemoryLifecycle({en}:{en:boolean}){
  const [choice,setChoice]=useState(0);const c=memoryCases[choice];
  const lanes=[{key:"WRITE",name:["写入 / 晋升","Write / promotion"],parts:memoryWrite,states:c.write},
    {key:"READ",name:["读取 / 上下文","Read / context"],parts:memoryRead,states:c.read}];
  return <section className="atlas-mental atlas-memory" id="concept-extension" data-mental-chapter="07"
    data-scenario={choice} aria-label={en?"Memory lifecycle and policy map":"记忆生命周期与策略地图"}>
    <Title code="07 / MEMORY · LEDGER & VIEWS" en={en}
      heading={["Memory 写入和读取，是两条受治理的通道","Memory write and read are two governed lanes"]}
      about={["从候选晋升到长期保存，以及按决策取回上下文；纠正不能悄悄覆盖历史证据。",
        "Separate durable promotion from scoped context retrieval. Corrections preserve provenance."]}/>
    <Controls items={memoryCases} current={choice} onSelect={setChoice} en={en}/>
    <p className="atlas-mental-input"><strong>{en?"TURN":"会话"}</strong>{tr(c.premise,en)}</p>
    <div className="atlas-memory-lanes">
      {lanes.map(l=><div className="atlas-memory-lane" key={l.key}>
        <div className="atlas-memory-lane-label"><span>{l.key}</span><strong>{tr(l.name,en)}</strong></div>
        <ol>{l.parts.map((part,i)=><li key={i} data-state={l.states[i]}>
          <span className="atlas-mental-index">{String(i+1).padStart(2,"0")}</span>
          <strong>{tr(part,en)}</strong><small>{tr(states[l.states[i]],en)}</small>
        </li>)}</ol>
      </div>)}
    </div>
    <div className="atlas-mental-focus"><span>{en?"DECISIVE BOUNDARY":"决定性边界"}</span><strong>{tr(c.focus,en)}</strong></div>
    <Legend en={en}/>
    <Conclusion c={c} en={en}/>
    <p className="atlas-mental-source">{en?"CH07 §§7.2–7.10 · Append-only ledger is a proposed audit design, not a requirement for every memory system.":
      "来源：CH07 §7.2–7.10。Append-only Ledger 是建议的审计设计，并非所有 Memory 系统必需。"}</p>
  </section>;
}
type CdcCase=Scenario&{
  expected:readonly string[];
  arrival:readonly string[];
  effect:Copy;
  history:readonly string[];
  stages:readonly State[];
};
const cdcCases:readonly CdcCase[]=[
  {label:["顺序到达","Ordered source changes"],
   premise:["订单在同一源内的 seq 1、2、3 顺序到达，业务版本定义明确。","Per-entity source seq 1, 2 and 3 arrive in logical order."],
   result:["按声明的 source sequence 构造当前状态与历史版本","Derive current state and SCD2 history from declared source sequence"],
   rationale:["SCD2 版本区间可在声明的排序域上定义；并非自动等于真实事件发生时间。","SCD2 version intervals follow the declared sequence domain, not necessarily physical event time."],
   expected:["seq 1","seq 2","seq 3"],arrival:["seq 1","seq 2","seq 3"],
   effect:["三个变更按序应用","Three changes in sequence"],
   history:["[1, 2)","[2, 3)","[3, ∞)"],stages:["pass","pass","pass","pass"]},
  {label:["旧事件迟到","Out-of-order arrival"],
   premise:["seq 3 先入库，seq 1、2 随后到达；ingested_at 不能当业务排序主键。","Source seq 3 arrives before seq 1 and 2; ingest time is not the truth ordering."],
   result:["依据源序列和版本契约协调乱序，禁止旧变更覆盖当前新版本","Reconcile by source version/sequence; do not let late older changes overwrite current state"],
   rationale:["处理方式依引擎契约、保留与回放能力决定；历史重建需要验证序列完整性。","Implementation depends on sequencing, retention and replay contracts; reconcile missing versions."],
   expected:["seq 1","seq 2","seq 3"],arrival:["seq 3","seq 1","seq 2"],
   effect:["旧 seq 不得覆盖 seq 3","Older seq must not overwrite seq 3"],
   history:["[1, 2)","[2, 3)","[3, ∞)"],stages:["pass","hold","pass","hold"]},
  {label:["重复交付","Duplicate delivery"],
   premise:["同一 source event ID 对应的 seq 2 被重复发送，at-least-once 不意味着可以重复产生业务效果。","Source seq 2 with the same event ID is delivered twice. At-least-once must not duplicate effects."],
   result:["按稳定事件 ID 去重，同一业务效果只应用一次","Deduplicate stable event IDs; apply a business effect at most once"],
   rationale:["冲突 payload 不能当作相同重试静默吞掉；应隔离、记录并核对。","Conflicting payloads under one event ID require quarantine and review, not silent dedup."],
   expected:["seq 1","seq 2"],arrival:["seq 1","seq 2","seq 2"],
   effect:["第二个 seq 2 不再产生效果","Second seq 2 has no additional effect"],
   history:["[1, 2)","[2, ∞)"],stages:["pass","hold","pass","pass"]},
  {label:["删除 / Tombstone","Delete / tombstone"],
   premise:["后续 delete 在源系统中有明确版本和操作语义，不能简单选最后一条非空值。","A later delete carries a source version and a declared operation contract."],
   result:["将 Tombstone 纳入版本合并和消费契约","Honor tombstones during version merge and downstream consumption"],
   rationale:["删除是否终止历史区间、是否需要保留审计凭据、读请求能否看到记录均取决于业务契约。","History closure, evidence retention and read visibility follow the deletion and retention contract."],
   expected:["seq 1","seq 2","seq 3 / DELETE"],arrival:["seq 1","seq 2","seq 3 / DELETE"],
   effect:["最新状态标记删除 / 不可见","Latest view is deleted or unavailable"],
   history:["[1, 2)","[2, 3)","DELETE ≥ 3"],stages:["pass","pass","pass","hold"]},
];
const cdcStages:readonly Copy[]=[
  ["原始事件 / Offset","Raw + offset"],["重复 / 冲突检查","Dedup / conflict"],
  ["序列化合并","Version merge"],["授权消费视图","Authorized read"],
];
function CdcTimeline({en}:{en:boolean}){
  const [choice,setChoice]=useState(0);const c=cdcCases[choice];
  return <section className="atlas-mental atlas-cdc" id="concept-extension"
    data-mental-chapter="11" data-scenario={choice}
    aria-label={en?"CDC ordering and SCD Type 2 lab":"CDC 乱序与 SCD Type 2 交互时间线"}>
    <Title code="11 / CDC · SCD TYPE 2" en={en}
      heading={["源序列、到达顺序、历史区间是三件事","Source sequence, arrival order and history differ"]}
      about={["对比乱序、重复与删除。SCD2 区间仅示意使用源序列的排序域，不代表真实墙钟时间。",
        "Compare late, duplicate and delete events. Example SCD2 intervals use source sequence—not wall-clock time."]}/>
    <Controls items={cdcCases} current={choice} onSelect={setChoice} en={en}/>
    <p className="atlas-mental-input"><strong>{en?"EVENT":"事件"}</strong>{tr(c.premise,en)}</p>
    <div className="atlas-cdc-tracks">
      <div className="atlas-cdc-track"><span className="atlas-mental-label">{en?"DECLARED SOURCE ORDER":"SOURCE ORDER · 源声明序列"}</span>
        <div role="list" aria-label={en?"Source logical sequence":"源逻辑顺序"}>
          {c.expected.map((x,i)=><span role="listitem" key={i}>{x}</span>)}
        </div></div>
      <div className="atlas-cdc-track"><span className="atlas-mental-label">{en?"OBSERVED ARRIVAL ORDER":"INGESTION ORDER · 实际到达顺序"}</span>
        <div role="list" aria-label={en?"Observed ingestion sequence":"实际入库顺序"}>
          {c.arrival.map((x,i)=><span role="listitem" key={i}
            data-state={choice===1&&i===0||choice===2&&i===2?"hold":"pass"}>{x}</span>)}</div></div>
      <div className="atlas-cdc-track"><span className="atlas-mental-label">{en?"ILLUSTRATIVE SCD2 VERSION INTERVALS":"SCD2 · 示例版本区间（seq 域）"}</span>
        <div role="list" aria-label={en?"Historical version intervals":"历史版本区间"}>
          {c.history.map((x,i)=><span role="listitem" key={i}>{x}</span>)}</div></div>
    </div>
    <ol className="atlas-cdc-gates" aria-label={en?"Event processing checks":"事件处理边界"}>
      {cdcStages.map((stage,i)=><li key={i} data-state={c.stages[i]}>
        <strong>{tr(stage,en)}</strong><small>{tr(states[c.stages[i]],en)}</small></li>)}
    </ol>
    <div className="atlas-mental-focus"><span>{en?"EFFECT / CURRENT VIEW":"效果 / 当前视图"}</span><strong>{tr(c.effect,en)}</strong></div>
    <Legend en={en}/>
    <Conclusion c={c} en={en}/>
    <p className="atlas-mental-source">{en?"CH11 §§11.2–11.5 and §11.10.1 · Teaching sequence IDs only; actual SCD2 ordering, replay and delete semantics depend on source and platform contracts.":
      "来源：CH11 §11.2–11.5、§11.10.1。序列号仅作教学；实际 SCD2 的顺序、回放和删除语义取决于来源及平台契约。"}</p>
  </section>;
}

/** CH01/02 have a primary Atlas lab. CH07/11 already have primary labs;
 * this mounts a second, distinct supplemental diagram at #concept-extension.
 * No extra live fetch, no replaced canonical text and no second #concept-demo.
 */
export function ConceptAtlasGuide({slug,en,pane,onReady}:{
  slug:string;en:boolean;pane:RefObject<HTMLDivElement|null>;onReady?:(ready:boolean)=>void;
}){
  const chapter=slug.slice(0,2);
  const [host,setHost]=useState<HTMLElement|null>(null);
  useLayoutEffect(()=>{
    const anchors:Record<string,string>={
      "01":"#context-budget","02":"#fig-2-1",
      "07":"#memory-promotion-compaction","11":"#data-etl-cdc",
    };
    const anchor=pane.current?.querySelector(anchors[chapter]||"#absent");
    if(!anchor)return;
    const slot=document.createElement("div");
    slot.className="atlas-mental-slot";
    // CH01/02 attach to an authored anchor; CH07/11 keep the existing lesson
    // but present the supplemental view within the same section.
    anchor.after(slot);
    setHost(slot);
    return ()=>slot.remove();
  },[chapter,en,pane]);
  useLayoutEffect(()=>{
    onReady?.(Boolean(host));
    return ()=>onReady?.(false);
  },[host,onReady]);
  if(!host)return null;
  return createPortal(chapter==="01"?<ContextBudget en={en}/>:
    chapter==="02"?<RetrievalBoundary en={en}/>:
    chapter==="07"?<MemoryLifecycle en={en}/>:<CdcTimeline en={en}/>,host);
}
