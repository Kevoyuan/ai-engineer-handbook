/**
 * Optional explanation of *branching*, not a second canonical lesson.
 * CH03/04/08 models follow handbook/chapters/{03,04,08}-*.md;
 * current scenario/step is owned by the existing ConceptDiagram player.
 */
import "./decision-traces.css";

type Copy = readonly [string, string];
type State = "selected" | "inactive" | "future" | "current" | "passed" | "issue" | "blocked" | "decision";
type Props = { anchor: string; scenario: number; step: number; last: boolean; en: boolean };
const txt = (copy: Copy, en: boolean) => copy[en ? 1 : 0];
const stateCopy: Record<State, Copy> = {
  selected: ["选中", "Selected"],
  inactive: ["不选", "Not selected"],
  future: ["待检查", "Not checked"],
  current: ["当前", "Current"],
  passed: ["已检查", "Checked"],
  issue: ["证据异常", "Evidence issue"],
  blocked: ["不能直接通过", "Cannot pass"],
  decision: ["策略决策", "Policy decision"],
};

const routeLanes: ReadonlyArray<{ name: string; role: Copy }> = [
  { name: "Exact", role: ["匹配稳定标识符", "Stable identifier matching"] },
  { name: "BM25", role: ["词法召回和术语", "Lexical terms and keywords"] },
  { name: "Dense", role: ["语义改写召回", "Semantic paraphrase recall"] },
  { name: "Graph", role: ["实体关系遍历", "Entity relationship traversal"] },
  { name: "Documents", role: ["关系出处验证", "Supporting source documents"] },
];
const routeCases: ReadonlyArray<{
  selected: readonly number[];
  reason: Copy;
  combine: Copy;
  fallback: Copy;
}> = [
  {
    selected: [0, 1],
    reason: ["问题包含 E4307 稳定编号：Exact 负责编号命中，BM25 补充排障术语。", "E4307 is a stable identifier: Exact finds the ID and BM25 adds troubleshooting terms."],
    combine: ["Exact 命中 + 词法补充 → 来源和版本核对", "Exact hit + lexical support → verify sources and versions"],
    fallback: ["无可信编号结果 → 检查别名与版本 → 再次检索或澄清", "No trustworthy ID hit → inspect aliases/version → retry or clarify"],
  },
  {
    selected: [1, 2],
    reason: ["“拿回已经付的钱”是退款意图的改写：词法与语义各有盲区。", "“Get my money back” paraphrases refund intent: lexical and semantic paths have different blind spots."],
    combine: ["BM25 + Dense → RRF 按排名融合 → 重排和证据检查", "BM25 + Dense → rank-based RRF → rerank and validate evidence"],
    fallback: ["覆盖不足 → 约束内扩展检索；RRF 分数不等于事实支持", "Coverage gap → broaden within policy; an RRF score does not prove support"],
  },
  {
    selected: [3, 4],
    reason: ["需要 Supplier → Material → Product 的关系链；必须有可靠的关系图和出处。", "The query needs Supplier → Material → Product links, with a reliable graph and provenance."],
    combine: ["Graph 遍历 + 文档证据 → 核对关系来源", "Graph traversal + supporting documents → verify provenance"],
    fallback: ["关系缺失 → 说明图谱覆盖边界；缺边不证明不存在", "Missing edge → report graph coverage limits; absence of an edge does not prove absence"],
  },
];

function RoutingTrace({scenario, step, en}: Omit<Props,"anchor"|"last">) {
  const cfg = routeCases[scenario] ?? routeCases[0];
  const phases: Copy[] = [["查询解析", "Analyze"], ["权限 / ACL", "Access gate"], ["路径执行", "Execute route"], ["证据检验", "Evidence check"]];
  return <div className="decision-trace decision-trace-routing" data-trace="query-routing" data-scenario={scenario} data-step={step}>
    <header className="trace-head">
      <span className="trace-kicker">03 / ROUTE TO EVIDENCE</span>
      <h4>{en ? "Selected paths, not every retriever" : "按证据形状选路，不是所有检索器都跑"}</h4>
    </header>
    <ol className="trace-phase-track" aria-label={en ? "Query execution phases" : "查询处理阶段"}>
      {phases.map((phase,i) => <li key={i} data-state={step===i?"current":step>i?"passed":"future"}>
        <span>{String(i+1).padStart(2,"0")}</span><strong>{txt(phase,en)}</strong>
      </li>)}
    </ol>
    <div className="trace-auth" data-state={step>=1?"passed":"future"}>
      <span>{step>=1?"✓":"○"}</span>
      <p><strong>{en?"Authorized candidate space first":"先划定授权候选空间"}</strong>
      <small>{step>=1
        ? en?"Illustrative tenant / role / ACL / version checks precede retrieval.":"示例中租户、角色、ACL 与版本约束先于检索。"
        : en?"Retriever routes are planned only; permission checks come first.":"当前只是路径计划，必须先检查访问权限。"}</small></p>
    </div>
    <div className="trace-route-grid" role="list" aria-label={en?"Retrieval routes and supporting evidence sources":"检索路径与支持证据来源"}>
      {routeLanes.map((lane,i) => {
        const active=cfg.selected.includes(i),executed=step>=2;
        return <div role="listitem" className="trace-route" key={lane.name}
          data-state={active?(executed?"selected":"future"):"inactive"}>
          <div className="trace-route-top"><strong>{lane.name}</strong><span>
            {active?(executed?en?"Selected":"已选择":en?"Planned":"待执行"):en?"Skipped":"未选择"}
          </span></div>
          <p>{txt(lane.role,en)}</p>
        </div>;
      })}
    </div>
    <div className="trace-decision" data-state={step>=2?"selected":"future"}>
      <span className="trace-label">{en?"ROUTE RATIONALE":"选路依据"}</span>
      <p>{txt(cfg.reason,en)}</p>
      <strong>{step >= 2 ? txt(cfg.combine,en) :
        en ? "Planned path — not executed yet" : "已规划路径，尚未执行检索"}</strong>
    </div>
    <div className="trace-recovery" data-state={step===3?"current":"future"}>
      <span className="trace-label">{en?"IF EVIDENCE FAILS":"若证据检验未通过"}</span>
      <p>{txt(cfg.fallback,en)}</p>
    </div>
    <p className="trace-source">{en?"Teaching illustration · CH03 §§3.1–3.5 · No live retrieval.":"教学示意 · CH03 §3.1–3.5 · 未执行真实检索。"}</p>
  </div>;
}

const gates: ReadonlyArray<{ id: number; name: Copy; description: Copy; at: number }> = [
  {id:0,name:["Query Analysis","Query Analysis"],description:["范围、风险和证据需求","Scope, risk and evidence need"],at:0},
  {id:1,name:["Knowledge Coverage","Knowledge Coverage"],description:["知识与能力覆盖边界","Knowledge/capability coverage"],at:1},
  {id:2,name:["Retrieval Quality","Retrieval Quality"],description:["召回质量、来源和版本","Recall quality, provenance, version"],at:1},
  {id:3,name:["Evidence Sufficiency","Evidence Sufficiency"],description:["SUPPORT / CONFLICT / INSUFFICIENT","SUPPORT / CONFLICT / INSUFFICIENT"],at:2},
  {id:4,name:["Claim Verification","Claim Verification"],description:["Claim–Evidence 对齐检查","Claim–evidence alignment"],at:3},
  {id:5,name:["Decision Policy","Decision Policy"],description:["回答、澄清、补检或升级","Answer, clarify, retrieve, escalate"],at:3},
];
const evidenceCases: ReadonlyArray<{signal:string; decision:string; decisionZh: string; detail:Copy; label:Copy}> = [
  {signal:"SUPPORT",decision:"ANSWER",decisionZh:"附条件回答",
    detail:["核对生效范围与每条 Claim 的引用；回答必须保留限定条件。","Verify applicable conditions and claim-level citations; preserve qualifications."],
    label:["证据与 Claim 对齐","Evidence supports claims"]},
  {signal:"CONFLICT",decision:"RESOLVE / ESCALATE",decisionZh:"核对权威版本 / 必要时升级",
    detail:["比较版本、生效期、权威来源与地区；不能用检索排名代替冲突消解。","Compare versions, effective dates, authority and regions; rank does not resolve conflict."],
    label:["权威版本未消解","Authority unresolved"]},
  {signal:"INSUFFICIENT",decision:"RETRIEVE_MORE / ABSTAIN",decisionZh:"补检索 / 无法确认",
    detail:["相关的取消说明不等于退款资格证据；补检索仍不足就明确边界。","Cancellation guidance may be relevant but not sufficient for refund eligibility; disclose gaps after bounded retrieval."],
    label:["缺少关键退款条款","Missing refund terms"]},
];
function gateStatus(index:number, scenario:number, step:number): State {
  const at=gates[index].at;
  if (step<at) return "future";
  if (index===3 && scenario>0) return "issue";
  if (index===4 && scenario>0 && step>=3) return "blocked";
  if (index===5 && step>=3) return "decision";
  if (step===at) return "current";
  return "passed";
}
function EvidenceTrace({scenario,step,en}:Omit<Props,"anchor"|"last">) {
  const c=evidenceCases[scenario]??evidenceCases[0];
  return <div className="decision-trace decision-trace-evidence" data-trace="evidence-gates" data-scenario={scenario} data-step={step}>
    <header className="trace-head"><span className="trace-kicker">04 / SIX GATES</span>
      <h4>{en?"Which gate prevents an unsupported claim?":"哪一道 Gate 阻止缺证据的结论？"}</h4></header>
    <ol className="trace-gates">
      {gates.map(g=>{
        const status=gateStatus(g.id,scenario,step);
        return <li key={g.id} data-state={status}>
          <div className="trace-gate-id">G{g.id}</div>
          <div className="trace-gate-content"><strong>{txt(g.name,en)}</strong><p>{txt(g.description,en)}</p></div>
          <span className="trace-gate-status">{status==="issue"?c.signal:status==="blocked"?(en?"HOLD":"待确认"):txt(stateCopy[status],en)}</span>
        </li>;
      })}
    </ol>
    <div className="trace-evidence-signal" data-state={step>=2?(scenario===0?"selected":"issue"):"future"}>
      <span className="trace-label">G3 / EVIDENCE STATE</span>
      <strong>{step>=2?c.signal:en?"Not assessed":"尚未评估"}</strong>
      <small>{step >= 2 ? txt(c.label,en) :
        en ? "Evaluate source relevance, authority and full claim support at Gate 3." :
          "到 Gate 3 再判断来源是否相关、权威及能否完整支持结论。"}</small>
    </div>
    <div className="trace-policy-options" role="list" aria-label={en?"Possible policy outcomes":"可能的决策出口"}>
      {(["ANSWER","RESOLVE / ESCALATE","RETRIEVE_MORE / ABSTAIN"] as const).map((name,i)=>
        <div role="listitem" key={name} data-state={i===scenario&&step>=3?"selected":"inactive"}>
          <span>{name}</span><strong>{i===scenario&&step>=3?en?"Chosen":"选中":en?"Not chosen":"未选"}</strong>
        </div>)}
    </div>
    <div className="trace-decision">
      <span className="trace-label">G5 / DECISION POLICY</span>
      <strong>{step>=3?(en?c.decision:c.decisionZh):(en?"Await evidence and claim checks":"等待证据与 Claim 检查")}</strong>
      <p>{step >= 3 ? txt(c.detail,en) :
        en ? "This scenario is still under review; a policy outcome has not been selected." :
          "当前仍在检查证据，尚未作出最终策略决策。"}</p>
    </div>
    <p className="trace-source">{en?"Teaching illustration · CH04 §4.1, 4.3–4.5 · Six Gates are an engineering policy, not a proof.":"教学示意 · CH04 §4.1、4.3–4.5 · Six Gates 是工程策略，不是正确性的证明。"}</p>
  </div>;
}

const loopStages: ReadonlyArray<Copy> = [
  ["Plan / 验收", "Plan / criteria"],["Act / 授权", "Act / permission"],
  ["Observe / 测试", "Observe / evidence"],["Check / 边界", "Check / boundaries"],
];
const loopCases: ReadonlyArray<{observations:readonly Copy[]; conclusion:Copy; next:Copy}> = [
  {observations:[["工具验证满足验收条件","Tool evidence meets acceptance"],["无需再次执行","No second cycle needed"]],
   conclusion:["STOP · 验收通过","STOP · Verified"],next:["保留测试结果与操作记录，结束循环。","Keep test evidence and stop the loop."]},
  {observations:[["第一轮验证失败","Round one test fails"],["基于失败原因修正，再次验证通过","Revise from failure and verify in round two"]],
   conclusion:["STOP · 第二轮验证通过","STOP · Verified in round two"],next:["只有权限与预算仍允许时才回到 Plan；第二轮通过后停止。","Return to Plan only within budget and authorization; stop after second-round verification."]},
  {observations:[["验收仍未通过","Acceptance still unmet"],["达到预算上限，不能继续工具调用","Budget exhausted: no further tool calls"]],
   conclusion:["HANDOFF · 未完成","HANDOFF · Incomplete"],next:["保留状态和失败证据，交给人工或可恢复的流程。","Preserve state and failure evidence for human or resumable workflow."]},
];
function AgentTrace({scenario,step,last,en}:Omit<Props,"anchor">) {
  const cfg=loopCases[scenario]??loopCases[0];
  const rounds=scenario===1?2:1;
  const retryAvailable=scenario===1&&step===3;
  const retryCompleted=scenario===1&&step>=4;
  const terminal=scenario===2?"HANDOFF":"STOP";
  return <div className="decision-trace decision-trace-agent" data-trace="agent-loop" data-scenario={scenario} data-step={step}>
    <header className="trace-head"><span className="trace-kicker">08 / BOUNDED LOOP</span>
      <h4>{en?"Feedback determines the next transition":"工具反馈决定下一条转移边"}</h4></header>
    <div className="trace-loop-rounds">
      {Array.from({length:rounds},(_,round)=>(
        <div className="trace-loop-round" key={round} data-state={step>=round*4?"visited":"future"}>
          <div className="trace-round-head"><span>{en?"ROUND":"轮次"} {String(round+1).padStart(2,"0")}</span>
            <strong>{step >= round*4+2
              ? txt(cfg.observations[round],en)
              : en ? "Awaiting tool evidence" : "等待工具验证证据"}</strong></div>
          <ol className="trace-loop-steps">
            {loopStages.map((stage,index)=>{
              const position=round*4+index;
              const state:State=step===position?"current":step>position?"passed":"future";
              return <li key={index} data-state={state}>
                <span>{String(index+1).padStart(2,"0")}</span><strong>{txt(stage,en)}</strong>
                <small>{txt(stateCopy[state],en)}</small>
              </li>;
            })}
          </ol>
          {scenario===1 && round===0 && <div className="trace-return-edge"
            data-state={retryAvailable ? "selected" : retryCompleted ? "passed" : "future"}>
            <span aria-hidden="true">↶</span>
            <strong>{en?"RETRY → revise Plan":"RETRY → 修正计划"}</strong>
            <small>{en?"Only if permission and remaining budget allow":"仅在权限与剩余预算允许时回环"}</small>
          </div>}
        </div>
      ))}
    </div>
    <div className="trace-loop-exits" role="list" aria-label={en?"Terminal and retry transitions":"终止与重试转移"}>
      {(["STOP","RETRY","HANDOFF"] as const).map(path=>{
        const selected=(path===terminal&&last) || (path==="RETRY"&&retryAvailable);
        const passed=path==="RETRY"&&retryCompleted;
        return <div role="listitem" key={path} data-state={selected?"selected":passed?"passed":"inactive"}>
          <strong>{path}</strong>
          <span>{selected ? (en?"Current transition":"当前转移") :
            passed ? (en?"Traversed":"已经过") : (en?"Alternative":"其他出口")}</span>
        </div>;
      })}
    </div>
    <div className="trace-decision" data-state={last?"selected":"future"}>
      <span className="trace-label">{en?"TERMINAL CONDITION":"终止条件"}</span>
      <strong>{last?txt(cfg.conclusion,en):en?"Not yet at a terminal state":"当前尚未到达终态"}</strong>
      <p>{last ? txt(cfg.next,en) :
        en ? "Await observed results, authorization and budget checks before choosing a terminal transition." :
          "先核对真实反馈、执行权限与预算，再选择终止或重试路径。"}</p>
    </div>
    <p className="trace-source">{en?"Teaching illustration · CH08 §8.6 · A local Agent loop is not automatically a multi-agent graph.":"教学示意 · CH08 §8.6 · 局部 Agent Loop 不等于多 Agent Graph。"}</p>
  </div>;
}

export function DecisionTrace({anchor,scenario,step,last,en}:Props) {
  if (anchor==="dg2-query-routing") return <RoutingTrace scenario={scenario} step={step} en={en}/>;
  if (anchor==="fig-4-1") return <EvidenceTrace scenario={scenario} step={step} en={en}/>;
  if (anchor==="fig-8-loop-vs-graph") return <AgentTrace scenario={scenario} step={step} last={last} en={en}/>;
  return null;
}
