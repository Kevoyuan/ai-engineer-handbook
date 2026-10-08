"use client";

import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import "./jev-flow-comparison.css";

type Copy = readonly [string, string];

type Responsibility = {
  id: "generation" | "decision" | "runtime";
  title: string;
  subtitle: Copy;
  tasks: readonly Copy[];
  takeaway: Copy;
  boundary: Copy;
};

const responsibilities: readonly Responsibility[] = [
  {
    id: "generation",
    title: "Generative Model",
    subtitle: ["负责开放式工作", "For open-ended work"],
    tasks: [
      ["编程", "Coding"],
      ["规划", "Planning"],
      ["研究", "Research"],
      ["开放式生成", "Open-ended generation"],
    ],
    takeaway: ["擅长创意、推理与复杂任务", "For creative, reasoning and complex tasks"],
    boundary: [
      "需要自由生成代码、文章或计划时，交给 Generative Model。它也能提出动作，但提出动作不等于获得执行权限。",
      "Use a generative model for code, writing and plans with open answer spaces. Proposing an action does not grant permission to execute it.",
    ],
  },
  {
    id: "decision",
    title: "Jev",
    subtitle: ["负责边界明确的判断", "For bounded decisions"],
    tasks: [
      ["模型路由", "Model routing"],
      ["工具 / 风险检查", "Tool / risk checks"],
      ["进度判断", "Progress"],
      ["完成判断", "Completion"],
    ],
    takeaway: ["类型化判断 + 概率", "Typed decisions + probabilities"],
    boundary: [
      "Jev 处理预先定义答案空间的判断（例如 Choice / Noul / Score），返回候选与概率。概率与类型有效不代表判断正确；是否通过由策略与阈值决定。",
      "Jev handles bounded Choice / Noul / Score decisions and produces typed candidates and probabilities. These are not proof of correctness; policy and evaluated thresholds determine the branch.",
    ],
  },
  {
    id: "runtime",
    title: "Runtime",
    subtitle: ["负责安全执行", "For safe execution"],
    tasks: [
      ["权限", "Permissions"],
      ["开销上限", "Spend limits"],
      ["允许列表", "Allowlist"],
      ["执行 / 拦截 / 重试", "Execute / block / retry"],
    ],
    takeaway: ["执行确定性硬约束", "Enforces hard constraints"],
    boundary: [
      "Runtime 才是最终的执行和授权边界。无论动作建议来自 LLM 还是 Jev，都必须经过权限、预算、审批与验证。",
      "Runtime owns execution and authorization. Actions suggested by an LLM or Jev still pass permissions, budgets, approvals and validation.",
    ],
  },
];

const beforeTasks: readonly Copy[] = [
  ["规划", "Plan"],
  ["写代码", "Write code"],
  ["模型路由", "Route model"],
  ["研究", "Research"],
  ["结果评分", "Score result"],
  ["工具审批？", "Tool approval?"],
  ["任务完成？", "Task complete?"],
  ["仍有进展？", "Still making progress?"],
];

function Comparison({ en }: { en: boolean }) {
  const t = (value: Copy) => value[en ? 1 : 0];
  const [selected, setSelected] = useState<Responsibility["id"]>("decision");
  const [playing, setPlaying] = useState(false);
  const reducedMotion = Boolean(useReducedMotion());
  const root = useRef<HTMLElement | null>(null);
  const current = responsibilities.find((role) => role.id === selected)!;

  // Only play on an explicit click, once. There is no perpetual React animation loop.
  useEffect(() => {
    if (!playing) return;
    const stop = () => { if (document.hidden) setPlaying(false); };
    const timeout = window.setTimeout(() => setPlaying(false), 3800);
    document.addEventListener("visibilitychange", stop);
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) setPlaying(false);
    }, { threshold: 0.06 });
    if (root.current) observer.observe(root.current);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", stop);
      observer.disconnect();
    };
  }, [playing]);

  useEffect(() => {
    if (reducedMotion && playing) setPlaying(false);
  }, [reducedMotion, playing]);

  return (
    <section
      className={"jev-dfc-root" + (playing ? " is-playing" : "")}
      ref={root}
      aria-labelledby="jev-dfc-title"
    >
      <header className="jev-dfc-heading">
        <span className="jev-dfc-eyebrow">FIG.6.C4 · RESPONSIBILITY SPLIT</span>
        <h3 id="jev-dfc-title">Jev vs. Generative LLMs</h3>
        <p>{t([
          "重点不是把 LLM 替换成 Jev，而是把生成、决策与执行放在不同层。",
          "The point is not to replace the LLM with Jev, but to separate generation, decisions and execution.",
        ])}</p>
        <div className="jev-dfc-flow-controls">
          <button
            type="button"
            className="jev-dfc-play"
            disabled={reducedMotion || playing}
            onClick={() => setPlaying(true)}
            aria-label={t(["演示职责流转", "Animate responsibility handoff"])}
          >
            <span aria-hidden="true">▶</span>
            {playing
              ? t(["演示中…", "Animating…"])
              : t(["演示箭头流转", "Animate arrows"])}
          </button>
          <span>{reducedMotion
            ? t(["已启用减少动态效果；箭头仍可静态查看", "Reduced motion: static connectors remain visible"])
            : t(["单次 3.8 秒 · 非固定调用顺序", "One 3.8s illustration · not a mandatory call order"])}
          </span>
        </div>
      </header>

      <div className="jev-dfc-compare">
        <section className="jev-dfc-before" aria-labelledby="jev-dfc-before-title">
          <header className="jev-dfc-side-head">
            <span className="jev-dfc-label jev-dfc-label--before">Before</span>
            <h4 id="jev-dfc-before-title">{t([
              "用一个生成式模型处理所有事情",
              "Generative model for everything",
            ])}</h4>
            <p>{t([
              "同一个 LLM 同时承担开放式任务和 Agent 决策。",
              "One LLM handles both open-ended work and agent decisions.",
            ])}</p>
          </header>

          <div className="jev-dfc-before-visual" aria-label={t([
            "所有任务集中在同一个 LLM",
            "All responsibilities concentrated in one LLM",
          ])}>
            <div className="jev-dfc-task-grid">
              {beforeTasks.slice(0, 4).map((task) => (
                <span className="jev-dfc-task" key={task[1]}>{t(task)}</span>
              ))}
            </div>
            <div className="jev-dfc-before-link jev-dfc-before-link--down" aria-hidden="true">
              <span className="jev-dfc-arrow-track" />
            </div>
            <div className="jev-dfc-single-model">
              <strong>Single LLM</strong>
              <span>{t(["处理所有事情", "for everything"])}</span>
            </div>
            <div className="jev-dfc-before-link jev-dfc-before-link--up" aria-hidden="true">
              <span className="jev-dfc-arrow-track" />
            </div>
            <div className="jev-dfc-task-grid">
              {beforeTasks.slice(4).map((task) => (
                <span className="jev-dfc-task" key={task[1]}>{t(task)}</span>
              ))}
            </div>
          </div>

          <p className="jev-dfc-verdict jev-dfc-verdict--before">{t([
            "一个生成模型同时承担开放任务与边界明确的判断。",
            "One generative model handles both open-ended work and bounded decisions.",
          ])}</p>
        </section>

        <section className="jev-dfc-after" aria-labelledby="jev-dfc-after-title">
          <header className="jev-dfc-side-head">
            <span className="jev-dfc-label jev-dfc-label--after">After</span>
            <h4 id="jev-dfc-after-title">{t([
              "把职责分开",
              "Separate the responsibilities",
            ])}</h4>
            <p>{t([
              "生成、决策与执行由不同的组件负责。",
              "Specialized components for generation, decision-making and execution.",
            ])}</p>
          </header>

          <div className="jev-dfc-roles" role="group" aria-label={t([
            "选择要查看的职责层",
            "Choose a responsibility to inspect",
          ])}>
            {responsibilities.map((role, index) => (
              <Fragment key={role.id}>
                {index > 0 && (
                  <div className={"jev-dfc-handoff jev-dfc-handoff--" + role.id} aria-hidden="true">
                    <span className="jev-dfc-arrow-track" />
                    <span className="jev-dfc-handoff-label">
                      {role.id === "decision"
                        ? t(["按需进行边界决策", "Bounded decision if needed"])
                        : t(["执行前策略与权限校验", "Policy and permission gate"])}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={"jev-dfc-role jev-dfc-role--" + role.id + (selected === role.id ? " is-selected" : "")}
                  aria-label={t(["查看 ", "Inspect "]) + role.title}
                  aria-pressed={selected === role.id}
                  aria-controls="jev-dfc-insight"
                  onClick={() => setSelected(role.id)}
                >
                  <span className="jev-dfc-role-top">
                    <span className="jev-dfc-role-icon" aria-hidden="true">
                      {role.id === "generation" ? "G" : role.id === "decision" ? "J" : "R"}
                    </span>
                    <span className="jev-dfc-role-name">
                      <strong>{role.title}</strong>
                      <small>{t(role.subtitle)}</small>
                    </span>
                  </span>
                  <span className="jev-dfc-role-tasks">
                    {role.tasks.map((task) => (
                      <span key={task[1]}>{t(task)}</span>
                    ))}
                  </span>
                  <span className="jev-dfc-role-takeaway">{t(role.takeaway)}</span>
                </button>
              </Fragment>
            ))}
          </div>

          <p className="jev-dfc-verdict jev-dfc-verdict--after">{t([
            "生成、决策和执行分别由合适的层负责。",
            "Separate generation, decisions and execution.",
          ])}</p>
        </section>
      </div>

      <div className="jev-dfc-insight" id="jev-dfc-insight" aria-live="polite" aria-atomic="true">
        <span className="jev-dfc-insight-label">{t(["职责边界", "RESPONSIBILITY BOUNDARY"])} · {current.title}</span>
        <p>{t(current.boundary)}</p>
      </div>
      <p className="jev-dfc-caption">{t([
        "箭头演示一种可能的 Agent 职责交接，并非所有请求都必须依次调用三层，也不是性能基准。Jev 的概率需要校准；类型化输出不等于判断正确；最终审批和副作用由 Runtime 控制。",
        "Arrows illustrate one possible agent handoff, not a mandatory three-stage call order or a performance benchmark. Jev probabilities require calibration; typed outputs do not guarantee correctness; Runtime controls final approval and side effects.",
      ])}</p>
    </section>
  );
}

export const JevFlowComparison = memo(function JevFlowComparison({
  en,
  pane,
}: {
  en: boolean;
  pane: RefObject<HTMLDivElement | null>;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = pane.current?.querySelector<HTMLElement>("#jev-dual-flow-slot");
    setHost(node || null);
    return () => setHost(null);
  }, [pane, en]);
  return host ? createPortal(<Comparison key={en ? "en" : "zh"} en={en} />, host) : null;
});
