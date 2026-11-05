"use client";

import { useState } from "react";
import "./parameterized-labs.css";

type Copy = [string, string];
type RouteName = "Exact" | "BM25" | "Dense" | "Graph" | "SQL";
type RouteCase = {
  id: string;
  label: Copy;
  query: Copy;
  need: Copy;
  priority: readonly RouteName[];
  required: readonly RouteName[];
  // A scenario that cannot be resolved to a search target must not launch tools.
  clarify?: boolean;
};

const ROUTES: readonly RouteName[] = ["Exact", "BM25", "Dense", "Graph", "SQL"];
const ROUTE_CASES: readonly RouteCase[] = [
  {
    id: "identifier",
    label: ["精确编号", "Exact identifier"],
    query: ["查找工单 TKT-82", "Find ticket TKT-82"],
    need: ["准确的工单记录", "The exact ticket record"],
    priority: ["Exact", "BM25", "Dense"],
    required: ["Exact"],
  },
  {
    id: "semantic",
    label: ["流程问法", "Semantic process question"],
    query: ["回滚部署失败后如何恢复？", "How do I recover from a failed rollback?"],
    need: ["能解释操作步骤的原文", "Source text covering the recovery steps"],
    priority: ["Dense", "BM25", "Exact"],
    required: ["BM25"],
  },
  {
    id: "relation",
    label: ["关系追溯", "Relationship traversal"],
    query: ["零件 P-17 影响哪些供应商？", "Which suppliers are linked to part P-17?"],
    need: ["关系链 + 零件标识的核对", "Relation traversal plus an exact part match"],
    priority: ["Graph", "Exact", "BM25"],
    required: ["Graph", "Exact"],
  },
  {
    id: "mixed",
    label: ["编号 + 原因", "Identifier + explanation"],
    query: ["TKT-82 为什么触发错误 E17？", "Why did ticket TKT-82 trigger E17?"],
    need: ["原始工单 + 错误解释", "Original ticket plus the error explanation"],
    priority: ["Exact", "BM25", "Dense", "Graph"],
    required: ["Exact", "BM25"],
  },
  {
    id: "aggregate",
    label: ["数值聚合", "Numeric aggregation"],
    query: ["统计本季度故障工单数量", "Count incident tickets this quarter"],
    need: ["授权的结构化聚合结果", "An authorized structured aggregate"],
    priority: ["SQL", "Exact"],
    required: ["SQL"],
  },
  {
    id: "clarify",
    label: ["指代不明", "Missing referent"],
    query: ["帮我查一下那个。", "Can you check that one?"],
    need: ["先恢复明确实体和上下文", "Resolve the missing referent before retrieval"],
    priority: [],
    required: [],
    clarify: true,
  },
];

const describe: Record<RouteName, Copy> = {
  Exact: ["精确字段 / ID", "Exact field / ID"],
  BM25: ["关键词与文档术语", "Keywords / literal terms"],
  Dense: ["语义相近内容", "Semantic similarity"],
  Graph: ["实体和关系边", "Entity relationships"],
  SQL: ["结构化数据 / 聚合", "Structured records / aggregation"],
};

export function routeBudgetPlan(caseId: string, maxRoutes: number) {
  const current = ROUTE_CASES.find((item) => item.id === caseId) ?? ROUTE_CASES[0];
  const planned = current.clarify ? [] : current.priority.slice(0, maxRoutes);
  const missing = current.required.filter((route) => !planned.includes(route));
  return {
    current,
    planned,
    missing,
    satisfied: !current.clarify && missing.length === 0,
    clarify: Boolean(current.clarify),
  };
}

export function QueryRouteBudgetLab({ en }: { en: boolean }) {
  const [caseId, setCaseId] = useState("semantic");
  const [maxRoutes, setMaxRoutes] = useState(1);
  const { current, planned, missing, satisfied, clarify } = routeBudgetPlan(caseId, maxRoutes);
  const t = (copy: Copy) => copy[en ? 1 : 0];
  const status = clarify
    ? t(["先澄清 · 不检索", "Clarify first · no retrieval"])
    : satisfied
      ? t(["已覆盖示例所需证据路径", "Fixture paths cover the evidence need"])
      : t(["示例证据路径未覆盖 · 需补救", "Fixture evidence gap · recovery required"]);

  return (
    <section className="parameter-lab" id="route-budget-lab" aria-labelledby="route-budget-title">
      <header className="parameter-lab-heading">
        <h4 id="route-budget-title">{t(["检索路径越多，证据就越充分吗？", "Do more retrieval routes guarantee better evidence?"])}</h4>
        <p>{t(["选择问题类型并改变最多可规划的检索路径数。观察哪些路径真正满足这个问题的证据需求，哪些只是增加工作量。", "Choose a query and limit the number of planned retrieval paths. Inspect which paths actually cover the teaching fixture's evidence need."])}</p>
      </header>
      <div className="parameter-lab-controls">
        <div className="parameter-lab-field">
          <label htmlFor="route-case-select">{t(["问题 / 证据形状", "Query / evidence shape"])}</label>
          <select id="route-case-select" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            {ROUTE_CASES.map((item) => <option value={item.id} key={item.id}>{t(item.label)}</option>)}
          </select>
        </div>
        <div className="parameter-lab-field">
          <div className="parameter-lab-control-line">
            <label htmlFor="route-budget-range">{t(["最多规划路径", "Max planned retrieval routes"])}</label>
            <output htmlFor="route-budget-range">{maxRoutes}</output>
          </div>
          <input id="route-budget-range" type="range" min={1} max={5} step={1}
            value={maxRoutes} onChange={(e) => setMaxRoutes(Number(e.target.value))}
            aria-valuetext={t(["最多 " + maxRoutes + " 路", "Up to " + maxRoutes + " routes"])} />
        </div>
      </div>
      <div className="parameter-lab-question">
        <span>{t(["请求", "Request"])}</span>
        <strong>{t(current.query)}</strong>
        <span>{t(["必要证据", "Evidence needed"])}</span>
        <p>{t(current.need)}</p>
      </div>
      <div className="parameter-lab-gate">
        <strong>{t(["先验证权限", "Authorize first"])}</strong>
        <p>{t(["Identity → Tenant / Role / ACL → 授权候选域 → 路径规划。这个示例假设授权已通过；增大路径上限不能扩大用户可访问范围。", "Identity → Tenant / Role / ACL → authorized candidate scope → route plan. This teaching example assumes permission passed; raising the route limit never broadens access."])}</p>
      </div>
      <div className="parameter-lab-output" role="status" aria-live="polite" aria-atomic="true">
        <div>
          <span>{t(["计划路径", "Planned routes"])}</span>
          <strong>{planned.length} / {ROUTES.length}</strong>
        </div>
        <div>
          <span>{t(["必要路径覆盖", "Fixture paths covered"])}</span>
          <strong>{clarify ? "—" : (current.required.length - missing.length) + " / " + current.required.length}</strong>
        </div>
        <div>
          <span>{t(["教学示例判定", "Fixture outcome"])}</span>
          <strong className="parameter-lab-outcome">{status}</strong>
        </div>
      </div>
      <div className="parameter-lab-ledger">
        <h5>{t(["路径决策 / 为什么选择或跳过", "Route decisions / why selected or skipped"])}</h5>
        <ul>
          {ROUTES.map((route) => {
            const index = planned.indexOf(route);
            const eligible = current.priority.includes(route);
            const isNeeded = current.required.includes(route);
            const state = clarify ? "clarify" : index >= 0 ? "planned" : "skipped";
            const decision = clarify
              ? t(["等待澄清", "Await clarification"])
              : index >= 0
                ? isNeeded ? t(["已计划 · 有必要证据", "Planned · needed evidence"]) : t(["已计划 · 本例无必要证据", "Planned · not needed here"])
                : eligible ? t(["未计划 · 超出路径上限", "Skipped · route limit"]) : t(["未计划 · 与本例不匹配", "Skipped · mismatched"]);
            return (
              <li key={route} data-state={state}>
                <strong>{route}</strong>
                <span className="parameter-lab-route-detail">{t(describe[route])}</span>
                <span className="parameter-lab-route-state">{decision}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="parameter-lab-recovery">
        <strong>{t(["下一步策略", "Next decision"])}</strong>
        {" · "}
        {clarify
          ? t(["先澄清指代，再做授权与检索；不能将含混请求默认扩展成五路检索。", "Clarify the referent before authorization and retrieval; do not fan out an ambiguous request."])
          : satisfied
            ? t(["继续候选去重、排序与证据充分性检查；有路径命中不等于答案正确。", "Proceed to deduplication, ranking and evidence validation. A route hit is not an answer guarantee."])
            : t(["若已授权且预算允许，可以改写查询或选择互补路径；否则澄清、拒答或升级人工。尚未实际执行补救。", "If authorized and within budget, consider query rewrite or a complementary route; otherwise clarify, abstain or escalate. No recovery has been executed."])}
      </p>
      <p className="parameter-lab-disclaimer">
        {t(["工程边界：所有路径命中与必要证据关系均为固定教学设定，不是实际召回、准确率或延迟测试。控制的是规划路径数量，不代表真正并行运行；ACL、来源复核和 CH04 证据门控始终独立。", "Engineering boundary: all path/evidence relationships are a fixed teaching fixture, not measured recall, quality or latency. This control changes planned paths, not parallel execution. ACL, source rechecks and CH04 evidence gates remain separate."])}
      </p>
    </section>
  );
}
