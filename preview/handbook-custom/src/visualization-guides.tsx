"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import "./visualization-guides.css";

type Copy = readonly [string, string];
type Stage = { title: Copy; detail: Copy; state: "pass" | "hold" | "stop" };
type Scenario = {
  label: Copy;
  input: Copy;
  result: Copy;
  reason: Copy;
  stages: readonly Stage[];
};
const text = (pair: Copy, en: boolean) => pair[en ? 1 : 0];

const kvCases: readonly (Scenario & {
  a: readonly string[];
  b: readonly string[];
  matched: number;
})[] = [
  {
    label: ["相同前缀", "Compatible prefix"],
    input: ["两次请求的公共 System / Tools / Policy token 一致，位于同一授权缓存命名空间。",
      "Both requests have identical common System / Tools / Policy tokens in an authorized cache namespace."],
    a: ["System", "Tools", "Policy", "Agent A"],
    b: ["System", "Tools", "Policy", "Agent B"],
    matched: 3,
    result: ["可复用共享前缀的已计算 KV，分叉后的 suffix 仍要计算。",
      "Computed KV for the common prefix may be reused; the divergent suffix still needs Prefill."],
    reason: ["示例假设模型、tokenizer、adapter、cache key 兼容且缓存未被驱逐。",
      "Assumes compatible model, tokenizer, adapter and cache key, and that cached blocks have not been evicted."],
    stages: [
      { title: ["匹配 token 前缀", "Match token prefix"], detail: ["公共 token IDs 一致。", "Common token IDs are identical."], state: "pass" },
      { title: ["缓存命中（条件满足时）", "Cache hit (if available)"], detail: ["复用已有 prefix KV blocks。", "Reuse existing prefix KV blocks."], state: "pass" },
      { title: ["计算不同的 suffix", "Prefill divergent suffix"], detail: ["只对未缓存部分执行 Prefill。", "Prefill only uncached tokens."], state: "hold" },
      { title: ["独立 Decode", "Independent Decode"], detail: ["输出 token 仍逐步计算。", "Output tokens are still decoded separately."], state: "hold" },
    ],
  },
  {
    label: ["提前分叉", "Earlier divergence"],
    input: ["公共 System / Tools 之后，两个请求的角色策略不同。",
      "The requests diverge in role policy after a common System / Tools prefix."],
    a: ["System", "Tools", "Agent A", "Task A"],
    b: ["System", "Tools", "Agent B", "Task B"],
    matched: 2,
    result: ["只可能复用分叉之前的共同 token 前缀。",
      "Only the exact prefix before the divergence may be reused."],
    reason: ["角色上下文不能为了提高命中率而随意合并。", "Role semantics must not be merged just to improve cache reuse."],
    stages: [
      { title: ["匹配 token 前缀", "Match token prefix"], detail: ["公共长度缩短。", "The common prefix is shorter."], state: "pass" },
      { title: ["部分命中（若已缓存）", "Partial hit (if cached)"], detail: ["复用仅覆盖前面的兼容 blocks。", "Only earlier compatible blocks can be reused."], state: "pass" },
      { title: ["各自计算角色上下文", "Prefill each role suffix"], detail: ["分叉部分不能复用。", "Divergent tokens cannot be reused."], state: "hold" },
      { title: ["独立 Decode", "Independent Decode"], detail: ["Decode 不因前缀复用而消失。", "Decode is still required."], state: "hold" },
    ],
  },
  {
    label: ["租户隔离", "Isolation boundary"],
    input: ["token 看起来相同，但可信服务为两次请求分配了不同的 cache namespace / salt。",
      "Tokens appear identical, but the trusted service assigns different cache namespaces / salts."],
    a: ["System", "Tools", "Policy", "Tenant A"],
    b: ["System", "Tools", "Policy", "Tenant B"],
    matched: 0,
    result: ["隔离策略阻止跨边界复用；每个请求独立计算自身前缀。",
      "The isolation policy prevents cross-boundary KV reuse; each request computes its own prefix."],
    reason: ["共享策略是安全决策，不是只看文本相似度的性能开关。",
      "Sharing policy is a security decision, not a text-similarity performance toggle."],
    stages: [
      { title: ["核对 token 与身份", "Check tokens and identity"], detail: ["token 相同不代表 cache key 相同。", "Identical tokens do not imply identical cache keys."], state: "hold" },
      { title: ["隔离边界拒绝共享", "Isolation blocks reuse"], detail: ["salt / namespace 不兼容。", "Salt / namespace differs."], state: "stop" },
      { title: ["独立 Prefill", "Separate Prefill"], detail: ["两次请求各自计算。", "Both requests compute independently."], state: "hold" },
      { title: ["独立 Decode", "Independent Decode"], detail: ["仍在受控上下文内执行。", "Decode remains inside each authorized context."], state: "hold" },
    ],
  },
];

const dataCases: readonly Scenario[] = [
  {
    label: ["正常更新", "Valid update"],
    input: ["同一个订单的新版本状态事件，源 ID 与版本号有效。", "A newer order-state event with valid source ID and version."],
    result: ["Gold 状态更新，经授权的下游消费者可以读取。", "Gold state is updated and becomes available to authorized consumers."],
    reason: ["状态的正确性还依赖来源顺序、schema、契约和刷新时间。", "Correctness still depends on source order, schema, contracts and freshness."],
    stages: [
      { title: ["Capture → Bronze", "Capture → Bronze"], detail: ["保留原始事件、来源与 offset。", "Retain raw event, provenance and offset."], state: "pass" },
      { title: ["Validate → Silver", "Validate → Silver"], detail: ["检查 schema、事件 ID 和版本顺序。", "Check schema, event ID and version order."], state: "pass" },
      { title: ["Materialize → Gold", "Materialize → Gold"], detail: ["按定义好的状态规则更新视图。", "Update views under declared state rules."], state: "pass" },
      { title: ["Authorized consumer", "Authorized consumer"], detail: ["按租户策略读取并记录来源时间。", "Read under tenant policy with source timestamp."], state: "pass" },
    ],
  },
  {
    label: ["重复事件", "Duplicate delivery"],
    input: ["至少一次投递导致相同 source event ID 再次出现。", "At-least-once delivery repeats the same source event ID."],
    result: ["原始事件可以留痕，但不应重复产生业务变更。", "Raw delivery can remain auditable but must not cause a duplicate business effect."],
    reason: ["重复判断依赖稳定事件 ID / 业务操作键，不应使用任意 ingestion time。", "Deduplicate by stable event/business keys, not arbitrary ingestion time."],
    stages: [
      { title: ["Capture → Bronze", "Capture → Bronze"], detail: ["记录重复投递以便审计。", "Record repeated delivery for audit."], state: "pass" },
      { title: ["Deduplicate → Silver", "Deduplicate → Silver"], detail: ["匹配已处理事件 ID，不重复合并。", "Recognize the processed event ID; do not merge again."], state: "stop" },
      { title: ["Gold unchanged", "Gold unchanged"], detail: ["既有正确状态保持不变。", "Previously valid state remains unchanged."], state: "hold" },
      { title: ["Consumer unchanged", "Consumer unchanged"], detail: ["没有第二次业务副作用。", "No second business effect."], state: "hold" },
    ],
  },
  {
    label: ["旧版本迟到", "Stale late arrival"],
    input: ["同一个实体的较旧版本在新版本处理后才到达。", "An older version arrives after a newer version of the same entity."],
    result: ["保留迟到证据；在明确版本契约下，不允许旧版本覆盖新状态。", "Preserve the late evidence; do not overwrite newer state under an explicit version contract."],
    reason: ["是否进入隔离区、重放或修正，取决于业务时间语义与冲突策略。", "Quarantine, replay or correction depends on business-time semantics and conflict policy."],
    stages: [
      { title: ["Capture → Bronze", "Capture → Bronze"], detail: ["记录原始版本与事件时间。", "Retain original version and event time."], state: "pass" },
      { title: ["Version guard → Silver", "Version guard → Silver"], detail: ["比较来源版本和 tombstone 规则。", "Compare source versions and tombstone rules."], state: "stop" },
      { title: ["Gold protected", "Gold protected"], detail: ["较旧状态不能静默覆盖。", "Older state cannot silently overwrite."], state: "hold" },
      { title: ["Audit / reconcile", "Audit / reconcile"], detail: ["检查缺口并按契约处置。", "Investigate gaps under the declared contract."], state: "hold" },
    ],
  },
  {
    label: ["未授权读取", "Unauthorized query"],
    input: ["数据已经正确更新，但查询身份无权读取另一租户的记录。", "Data is correct, but the query identity cannot read another tenant's rows."],
    result: ["数据库执行层的行策略拒绝访问，不返回跨租户数据。", "Database-enforced row policy denies access; cross-tenant data is not returned."],
    reason: ["LLM 提示词与检索过滤不能替代 DB 身份或 row-level policy。", "An LLM prompt or retrieval filter cannot replace DB identity and row-level policy."],
    stages: [
      { title: ["Ingest → Bronze", "Ingest → Bronze"], detail: ["数据摄取正常。", "Data ingestion proceeds normally."], state: "pass" },
      { title: ["Validate → Silver", "Validate → Silver"], detail: ["数据正确性不意味着公开可读。", "Correct data is not automatically public."], state: "pass" },
      { title: ["Governed → Gold", "Governed → Gold"], detail: ["视图必须保留身份边界。", "Views preserve identity boundaries."], state: "pass" },
      { title: ["RLS denies read", "RLS denies read"], detail: ["在数据库执行时拒绝不授权的行。", "Database execution rejects unauthorized rows."], state: "stop" },
    ],
  },
];

function ScenarioButtons({cases, current, onChange, en}: {
  cases: readonly Scenario[]; current: number; onChange: (value: number) => void; en: boolean;
}) {
  return <div className="v2-scenarios" role="group" aria-label={en ? "Choose a teaching scenario" : "选择教学场景"}>
    {cases.map((item, index) =>
      <button key={index} type="button" aria-pressed={current === index}
        className={"v2-scenario" + (current === index ? " selected" : "")}
        onClick={() => onChange(index)}>{text(item.label, en)}</button>)}
  </div>;
}
function Stages({scenario, en}: {scenario: Scenario; en: boolean}) {
  return <ol className="v2-stages">
    {scenario.stages.map((stage, index) => (
      <li className={"v2-stage v2-stage-" + stage.state} key={index}>
        <span className="v2-stage-number">{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{text(stage.title, en)}</strong><span>{text(stage.detail, en)}</span></div>
        <span className="v2-stage-symbol" aria-hidden="true">
          {stage.state === "stop" ? "×" : stage.state === "pass" ? "✓" : "·"}
        </span>
      </li>
    ))}
  </ol>;
}
function PrefixTokens({name, tokens, matched}: {name: string; tokens: readonly string[]; matched: number}) {
  return <div className="v2-token-request">
    <span className="v2-token-name">{name}</span>
    <div className="v2-token-sequence">
      {tokens.map((token, index) =>
        <span className={"v2-token" + (index < matched ? " reused" : "")} key={index}>
          {token}
        </span>)}
    </div>
  </div>;
}

function PrefixGuide({en}: {en:boolean}) {
  const [selected, setSelected] = useState(0);
  const scenario = kvCases[selected];
  return <section id="concept-demo" className="v2-guide" aria-labelledby="v2-guide-title" data-viz-version="2">
    <div className="v2-guide-header">
      <span className="v2-eyebrow">10 / SERVING / DECISION LAB</span>
      <h3 id="v2-guide-title">{en ? "When is prefix KV reusable?" : "什么条件下可以复用 Prefix KV？"}</h3>
      <p>{en ? "Compare compatible, diverging and isolated requests. This is a decision model, not a live inference-engine trace."
        : "对比兼容、提前分叉与租户隔离的请求。这是机制教学图，不是真实推理引擎 Trace。"}</p>
    </div>
    <ScenarioButtons cases={kvCases} current={selected} onChange={setSelected} en={en}/>
    <div className="v2-guide-layout">
      <div className="v2-main">
        <div className="v2-diagram-label">{en ? "TWO REQUESTS · COMMON PREFIX" : "两个请求 · 前缀对齐"}</div>
        <div className="v2-token-panel">
          <PrefixTokens name="A" tokens={scenario.a} matched={scenario.matched}/>
          <PrefixTokens name="B" tokens={scenario.b} matched={scenario.matched}/>
        </div>
        <div className="v2-legend"><span className="v2-swatch"/> {en ? "Eligible shared prefix tokens (subject to cache key)" : "可匹配的共同前缀（仍需符合 cache key）"}</div>
        <div className="v2-insight" aria-live="polite" aria-atomic="true" key={selected}>
          <span>{en ? "DECISION" : "决策结果"}</span>
          <strong>{text(scenario.result,en)}</strong>
          <p>{text(scenario.reason,en)}</p>
        </div>
      </div>
      <div className="v2-trace"><span className="v2-diagram-label">{en ? "LOOKUP / EXECUTION" : "查找 / 执行阶段"}</span><Stages scenario={scenario} en={en}/></div>
    </div>
    <p className="v2-source-note">{en ? "Based on CH10 §§10.2–10.8. Prefix reuse never means sharing mutable Agent session state or skipping Decode."
      : "对应 CH10 §10.2–10.8：Prefix 复用不代表共享可变 Agent 会话，也不意味着跳过 Decode。"}</p>
  </section>;
}

function DataGuide({en}: {en:boolean}) {
  const [selected, setSelected] = useState(0);
  const scenario = dataCases[selected];
  return <section id="concept-demo" className="v2-guide" aria-labelledby="v2-guide-title" data-viz-version="2">
    <div className="v2-guide-header">
      <span className="v2-eyebrow">11 / DATA PLANE / CORRECTNESS LAB</span>
      <h3 id="v2-guide-title">{en ? "Where does the data contract hold?" : "数据正确性在哪一道边界得到保证？"}</h3>
      <p>{en ? "Follow an event through Bronze, Silver, Gold and the authorized read. Outcomes are illustrative policies, not a running pipeline."
        : "观察事件经过 Bronze、Silver、Gold 与授权读取时的不同结果。仅为策略示意，不执行真实数据管道。"}</p>
    </div>
    <ScenarioButtons cases={dataCases} current={selected} onChange={setSelected} en={en}/>
    <div className="v2-guide-layout">
      <div className="v2-main">
        <div className="v2-diagram-label">{en ? "EVENT / READ REQUEST" : "事件 / 读取请求"}</div>
        <p className="v2-case-input">{text(scenario.input,en)}</p>
        <div className="v2-insight" aria-live="polite" aria-atomic="true" key={selected}>
          <span>{en ? "CONTRACT OUTCOME" : "契约结果"}</span>
          <strong>{text(scenario.result,en)}</strong>
          <p>{text(scenario.reason,en)}</p>
        </div>
      </div>
      <div className="v2-trace"><span className="v2-diagram-label">{en ? "BOUNDARIES / CHECKS" : "系统边界 / 检查"}</span><Stages scenario={scenario} en={en}/></div>
    </div>
    <p className="v2-source-note">{en ? "Based on CH11 §§11.1–11.8. Bronze/Silver/Gold names responsibilities; they do not guarantee exactly-once effects or authorized SQL execution."
      : "对应 CH11 §11.1–11.8：Bronze/Silver/Gold 是责任分层，不自动保证 exactly-once 业务效果或 SQL 授权。"}</p>
  </section>;
}

/** Optional, chapter-local enhancement. Canonical chapter HTML remains independent. */
export function VisualizationGuide({slug, en, pane, onReady}: {
  slug: string; en: boolean; pane: RefObject<HTMLDivElement | null>; onReady:(ready:boolean)=>void;
}) {
  const isServing = slug === "10-serving-deployment-ai-platform";
  const isData = slug === "11-data-sql-engineering";
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!isServing && !isData) return;
    const anchor = pane.current?.querySelector(isServing ? "#fig-10-1" : "#data-plane");
    if (!anchor) return;
    const slot = document.createElement("div");
    slot.className = "v2-guide-slot";
    // Preserve the authored CH11 lead-in and pipeline example before the teaching decision.
    const firstParagraph = anchor.nextElementSibling;
    const nextBlock = firstParagraph?.nextElementSibling;
    const insertionPoint = isData && nextBlock?.tagName === "PRE" ? nextBlock : anchor;
    insertionPoint.after(slot);
    setHost(slot);
    return () => slot.remove();
  }, [slug, pane, en, isServing, isData]);
  useLayoutEffect(() => {
    onReady(Boolean(host));
    return () => onReady(false);
  }, [host, onReady]);
  return host ? createPortal(isServing ? <PrefixGuide en={en}/> : <DataGuide en={en}/>, host) : null;
}
