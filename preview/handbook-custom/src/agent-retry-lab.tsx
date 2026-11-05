"use client";

import { useState } from "react";
import "./parameterized-labs.css";

type Copy = [string, string];
type AgentCase = {
  id: string;
  label: Copy;
  explanation: Copy;
  successOn: number | null;
  permission: "allowed" | "approval-required";
};

const SCENARIOS: readonly AgentCase[] = [
  {
    id: "first-pass",
    label: ["首轮验证通过", "Verified on first attempt"],
    explanation: ["首轮操作已有验收证据，立即停止，不消耗剩余预算。", "The first attempt produces acceptance evidence, so the loop stops without exhausting the budget."],
    successOn: 1,
    permission: "allowed",
  },
  {
    id: "recoverable",
    label: ["定向修复后通过", "Verified after a targeted retry"],
    explanation: ["第一轮测试失败，第二轮修正后才产生可验证成功结果。", "The first attempt fails; only the revised second attempt can pass verification."],
    successOn: 2,
    permission: "allowed",
  },
  {
    id: "persistent",
    label: ["持续失败", "Persistent failure"],
    explanation: ["每次允许的执行仍然不满足验收条件，达到任一上限就停止并交接。", "Every permitted attempt fails acceptance; the loop exits at the first binding limit."],
    successOn: null,
    permission: "allowed",
  },
  {
    id: "approval",
    label: ["需要人工审批", "Human approval required"],
    explanation: ["高风险副作用尚未得到审批，预算充足也不能开始工具调用。", "A high-risk action has no approval; spare budget cannot authorize execution."],
    successOn: null,
    permission: "approval-required",
  },
];

const ATTEMPT_UNITS = 3;

export function agentBudgetPlan(caseId: string, maxAttempts: number, workBudget: number) {
  const scenario = SCENARIOS.find((item) => item.id === caseId) ?? SCENARIOS[1];
  const permitted = scenario.permission === "allowed"
    ? Math.min(maxAttempts, Math.floor(workBudget / ATTEMPT_UNITS))
    : 0;
  const executed = scenario.successOn === null ? permitted : Math.min(permitted, scenario.successOn);
  const verified = scenario.permission === "allowed"
    && scenario.successOn !== null
    && executed >= scenario.successOn;
  return {
    scenario,
    executed,
    verified,
    remaining: workBudget - executed * ATTEMPT_UNITS,
    used: executed * ATTEMPT_UNITS,
    retries: Math.max(0, executed - 1),
    terminal: scenario.permission !== "allowed" ? "approval" : verified ? "verified" : "handoff",
  } as const;
}

export function AgentRetryBudgetLab({ en }: { en: boolean }) {
  const [caseId, setCaseId] = useState("recoverable");
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [workBudget, setWorkBudget] = useState(9);
  const plan = agentBudgetPlan(caseId, maxAttempts, workBudget);
  const t = (copy: Copy) => copy[en ? 1 : 0];
  const outcome = plan.terminal === "verified"
    ? t(["STOP · 验证通过", "STOP · verified"])
    : plan.terminal === "approval"
      ? t(["BLOCKED · 等待审批", "BLOCKED · approval required"])
      : t(["HANDOFF · 未完成", "HANDOFF · incomplete"]);

  return (
    <section className="parameter-lab" id="agent-budget-lab" aria-labelledby="agent-budget-title">
      <header className="parameter-lab-heading">
        <h4 id="agent-budget-title">{t(["Agent 何时应该停止重试？", "When should an agent stop retrying?"])}</h4>
        <p>{t(["改变最大执行轮次与抽象工作预算，观察验证、重试、权限与终止状态如何变化。这个示例不会实际运行 Agent 或工具。", "Adjust the maximum attempts and abstract work budget. Observe how verification, retries and permission gates determine the exit. No agent or tool actually runs."])}</p>
      </header>
      <div className="parameter-lab-controls">
        <div className="parameter-lab-field">
          <label htmlFor="agent-case-select">{t(["反馈 / 权限情景", "Observed feedback / authorization"])}</label>
          <select id="agent-case-select" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            {SCENARIOS.map((item) => <option key={item.id} value={item.id}>{t(item.label)}</option>)}
          </select>
        </div>
        <div className="parameter-lab-field">
          <div className="parameter-lab-control-line">
            <label htmlFor="agent-attempt-limit">{t(["最大执行轮次", "Maximum attempts"])}</label>
            <output htmlFor="agent-attempt-limit">{maxAttempts}</output>
          </div>
          <input id="agent-attempt-limit" type="range" min={1} max={4} step={1}
            value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))}
            aria-valuetext={t(["最多 " + maxAttempts + " 轮", "At most " + maxAttempts + " attempts"])} />
        </div>
        <div className="parameter-lab-field">
          <div className="parameter-lab-control-line">
            <label htmlFor="agent-work-budget">{t(["抽象工作预算", "Abstract work budget"])}</label>
            <output htmlFor="agent-work-budget">{workBudget} / 12</output>
          </div>
          <input id="agent-work-budget" type="range" min={0} max={12} step={1}
            value={workBudget} onChange={(e) => setWorkBudget(Number(e.target.value))}
            aria-valuetext={t(["预算 " + workBudget + " 工作单位", "Budget " + workBudget + " work units"])} />
        </div>
      </div>
      <div className="parameter-lab-gate">
        <strong>{plan.scenario.permission === "allowed"
          ? t(["工具权限：示例允许", "Tool authorization: assumed granted"])
          : t(["工具权限：等待人工批准", "Tool authorization: pending human approval"])}</strong>
        <p>{t(plan.scenario.explanation)}</p>
        <p>{t(["每轮固定消耗 3 个虚构工作单位。轮次上限和剩余预算必须同时满足才能执行下一轮。", "Each attempt uses exactly 3 invented work units. Both the attempt limit and remaining work budget must permit the next attempt."])}</p>
      </div>
      <div className="parameter-lab-output" role="status" aria-live="polite" aria-atomic="true">
        <div><span>{t(["已执行轮次", "Executed attempts"])}</span><strong>{plan.executed} / {maxAttempts}</strong></div>
        <div><span>{t(["已消耗 / 剩余", "Used / remaining"])}</span><strong>{plan.used} / {plan.remaining}</strong></div>
        <div><span>{t(["最终出口", "Terminal state"])}</span><strong className="parameter-lab-outcome">{outcome}</strong></div>
      </div>
      <div className="parameter-lab-ledger parameter-lab-attempts">
        <h5>{t(["执行序列与验收证据", "Execution sequence and acceptance evidence"])}</h5>
        <ol>
          {Array.from({ length: 4 }, (_, index) => {
            const number = index + 1;
            const executed = number <= plan.executed;
            const verified = executed && plan.scenario.successOn === number;
            const state = executed ? verified ? "verified" : "failed" : "not-run";
            const summary = !executed
              ? plan.terminal === "approval" ? t(["未执行 · 待审批", "Not run · permission pending"]) : t(["未执行 · 已停止", "Not run · stopped"])
              : verified ? t(["验收通过 · STOP", "Acceptance passed · STOP"])
                : t(["验收未通过 · 记录反馈", "Acceptance failed · feedback recorded"]);
            return (
              <li key={number} data-state={state}>
                <span className="parameter-lab-attempt-number">{t(["第 " + number + " 轮", "Attempt " + number])}</span>
                <span className="parameter-lab-attempt-sequence">{executed
                  ? t(["Plan → Act → Observe → Verify", "Plan → Act → Observe → Verify"])
                  : "—"}</span>
                <strong>{summary}</strong>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="parameter-lab-recovery">
        <strong>{t(["停止条件", "Stop / recovery rule"])}</strong>
        {" · "}
        {plan.terminal === "verified"
          ? t(["只有验收证据通过才 STOP；不因为仍有预算就继续调用工具。", "STOP only after acceptance evidence; unused budget is not a reason to keep calling tools."])
          : plan.terminal === "approval"
            ? t(["先取得明确授权。不能通过调高上限绕过审批，更不能把阻断视为成功。", "Obtain explicit authorization first. Raising budgets cannot bypass approval or turn blocking into success."])
            : t(["仍未满足验收条件。停止自动执行，保存失败记录与状态，HANDOFF 给人或可恢复流程。", "Acceptance remains unmet. Stop automatic execution; preserve failure evidence and state for human or resumable handoff."])}
      </p>
      <div className="parameter-lab-actions">
        <span>{t(["已允许的重试次数：", "Retries actually permitted: "])}<strong>{plan.retries}</strong></span>
        <button type="button" onClick={() => { setCaseId("recoverable"); setMaxAttempts(3); setWorkBudget(9); }}>
          {t(["恢复默认实验", "Reset experiment"])}
        </button>
      </div>
      <p className="parameter-lab-disclaimer">
        {t(["工程边界：这是一条固定的教学反馈序列，不是实际模型成功率、成本、token 消耗或 LangGraph 的执行记录。外部副作用重试前仍需状态对账、幂等 / 去重、权限核验及必要的人工审批；Checkpoint 不保证外部事务性。", "Engineering boundary: this fixed teaching sequence is not measured model success, cost, token use or a LangGraph execution trace. Before retrying external side effects, reconcile state, deduplicate / enforce idempotency and recheck authorization; checkpointing does not make outside effects transactional."])}
      </p>
    </section>
  );
}
