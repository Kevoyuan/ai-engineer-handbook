"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import "./jev-flow-comparison.css";

type Copy = [string, string];
type Stage = {
  number: string;
  left: Copy;
  right: Copy;
  leftDetail: Copy;
  rightDetail: Copy;
  note: Copy;
};

const stages: Stage[] = [
  {
    number: "01 · INPUT",
    left: ["User / Agent State", "User / Agent State"],
    right: ["User / Agent State", "User / Agent State"],
    leftDetail: ["用户输入与当前任务状态。", "User input and current task state."],
    rightDetail: ["同一份输入和当前任务状态。", "The same input and current task state."],
    note: ["两种执行路径可以拿到相同输入；差别在于输出契约与推理机制。", "Both paths can read identical input; the output contract and execution mechanism differ."],
  },
  {
    number: "02 · CONTRACT",
    left: ["Prompt + JSON Schema", "Prompt + JSON Schema"],
    right: ["Defined Decision Questions", "Defined Decision Questions"],
    leftDetail: ["要求生成符合 schema 的答案文本。", "Ask the model to generate an answer conforming to a schema."],
    rightDetail: ["事先声明 Choice / Noul / Score。", "Define Choice / Noul / Score before inference."],
    note: ["给生成模型加 schema 仍是约束文本生成；决策模型的输出空间在调用前已经封闭。", "Constraining an LLM with a schema still involves generation; the decision model starts with a bounded answer space."],
  },
  {
    number: "03 · INFERENCE",
    left: ["Sequential Token Decode", "Sequential Token Decode"],
    right: ["Independent Decisions", "Independent Decisions"],
    leftDetail: ["按 token 顺序形成输出。", "Construct the output sequentially, token by token."],
    rightDetail: ["互不依赖的问题可在一次决策调用中共同求值。", "Independent questions can be evaluated together in one decision call."],
    note: ["Jev 的并行指同一状态下互不依赖的判断；若问题 B 依赖问题 A 的新结果，仍必须遵守数据依赖。", "Parallel Jev decisions refer to independent judgments over the same state; true dependencies between A and B remain sequential."],
  },
  {
    number: "04 · RESPONSE",
    left: ["Generated JSON Text", "Generated JSON Text"],
    right: ["Typed Values + Probabilities", "Typed Values + Probabilities"],
    leftDetail: ["返回 JSON 字符串或受约束的结构化输出。", "Return JSON text or constrained structured output."],
    rightDetail: ["返回候选结果、概率和相应决策字段。", "Return typed candidates, probabilities and decision fields."],
    note: ["Typed output 更容易直接接入代码分支，但合法类型不等于判断一定正确。", "Typed output integrates directly with branches, but a valid type is not a guarantee of correct judgment."],
  },
  {
    number: "05 · APPLICATION",
    left: ["Validate → Convert to Decision", "Validate → Convert to Decision"],
    right: ["Threshold → Select Branch", "Threshold → Select Branch"],
    leftDetail: ["验证结构与业务语义后，转为可执行决策。", "Validate structure and business meaning before converting to a software decision."],
    rightDetail: ["根据概率校准与业务阈值，选择路径或升级处理。", "Use locally evaluated thresholds and calibration to select or escalate."],
    note: ["最终授权、审批与副作用执行始终由 Runtime 决定，而不是由任意模型的输出直接决定。", "Final authorization, approvals and side effects stay with the runtime, not either model output."],
  },
];

function FlowColumn({
  kind,
  en,
  step,
  reduce,
}: {
  kind: "llm" | "jev";
  en: boolean;
  step: number;
  reduce: boolean;
}) {
  const isLLM = kind === "llm";
  const t = (value: Copy) => value[en ? 1 : 0];

  return (
    <div className={"jev-dfc-path " + (isLLM ? "jev-dfc-path--llm" : "jev-dfc-path--typed")} aria-label={isLLM ? "Generative LLM flow" : "Jev decision model flow"}>
      <header className="jev-dfc-path-head">
        <span className="jev-dfc-path-id">{isLLM ? "PATH A / GENERATION" : "PATH B / DECISION"}</span>
        <strong>{isLLM ? "Generative LLM" : "Jev / System One"}</strong>
        <small>{isLLM
          ? t(["按 token 生成，再转为软件决策", "Generate tokens, then recover a decision"])
          : t(["定义问题，直接返回类型化判断", "Ask bounded questions, receive typed decisions"])}</small>
      </header>
      <div className="jev-dfc-stack">
        {stages.map((stage, index) => (
          <div key={stage.number} className="jev-dfc-stage-wrap">
            {index > 0 && (
              <div className={"jev-dfc-connector" + (step >= index ? " is-complete" : "")} aria-hidden="true">
                <span className="jev-dfc-connector-line" />
                <span className="jev-dfc-connector-arrow">↓</span>
              </div>
            )}
            <motion.div
              className={"jev-dfc-stage" + (step === index ? " is-current" : "") + (step > index ? " is-complete" : "")}
              initial={false}
              animate={reduce ? {} : { opacity: step === index ? 1 : 0.84, scale: step === index ? 1 : 0.997 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-current={step === index ? "step" : undefined}
            >
              <span className="jev-dfc-stage-id">{stage.number}</span>
              <strong>{t(isLLM ? stage.left : stage.right)}</strong>
              <small>{t(isLLM ? stage.leftDetail : stage.rightDetail)}</small>
              {step === 2 && index === 2 && (
                <div className="jev-dfc-example" aria-label={isLLM ? "Illustrative sequential tokens" : "Illustrative independent judgments"}>
                  {(isLLM ? ["{", '"intent"', ":", '"refund"', "}"] : ["Choice", "Noul", "Score"]).map((word, token) => (
                    <motion.span
                      key={word}
                      initial={reduce ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.18, delay: isLLM ? token * 0.26 : 0.14 }}
                    >{word}</motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Comparison({ en }: { en: boolean }) {
  const t = (value: Copy) => value[en ? 1 : 0];
  const reduce = Boolean(useReducedMotion());
  const root = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = step === stages.length - 1;

  useEffect(() => {
    if (reduce && playing) setPlaying(false);
  }, [reduce, playing]);
  useEffect(() => {
    if (!playing || reduce || last) return;
    const id = window.setTimeout(() => setStep((value) => Math.min(stages.length - 1, value + 1)), 2800);
    return () => window.clearTimeout(id);
  }, [playing, reduce, step, last]);
  useEffect(() => {
    if (last && playing) setPlaying(false);
  }, [last, playing]);
  useEffect(() => {
    const stop = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", stop);
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) setPlaying(false);
    }, { threshold: 0.06 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);

  function play() {
    if (reduce) return;
    if (last) setStep(0);
    setPlaying(true);
  }
  function move(next: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(stages.length - 1, next)));
  }
  return (
    <section className="jev-dfc-root" ref={root} aria-labelledby="jev-dfc-title">
      <div className="jev-dfc-heading">
        <div>
          <span className="jev-dfc-eyebrow">FIG.6.C4 · DUAL EXECUTION PATHS</span>
          <h3 id="jev-dfc-title">{t(["相同决策任务，两条不同执行路径", "The same decision task, two execution paths"])}</h3>
          <p>{t(["对比「生成答案文本」与「直接给出类型化决策」，观察哪一步发生了改变。", "Compare generating an answer string with returning typed decisions, and inspect exactly where the execution paths diverge."])}</p>
        </div>
        <div className="jev-dfc-controls" role="group" aria-label={t(["流程演示控制", "Flow playback controls"])}>
          <button type="button" onClick={() => move(step - 1)} disabled={step === 0} aria-label={t(["上一步", "Previous step"])}>←</button>
          <button type="button" className="jev-dfc-primary" onClick={playing ? () => setPlaying(false) : play} disabled={reduce && !playing} aria-label={playing ? t(["暂停演示", "Pause demonstration"]) : last ? t(["重播演示", "Replay demonstration"]) : t(["播放演示", "Play demonstration"])}>
            {reduce ? t(["逐步浏览", "Step manually"]) : playing ? t(["暂停", "Pause"]) : last ? t(["重播", "Replay"]) : t(["播放", "Play"])}
          </button>
          <button type="button" onClick={() => move(step + 1)} disabled={last} aria-label={t(["下一步", "Next step"])}>→</button>
        </div>
      </div>
      <div className="jev-dfc-progress" role="group" aria-label={t(["演示阶段选择", "Choose a demonstration stage"])}>
        {stages.map((stage, index) => (
          <button key={stage.number} type="button" className={step === index ? "is-current" : ""} onClick={() => move(index)} aria-label={t(["跳至阶段 ", "Jump to stage "]) + String(index + 1)} aria-current={step === index ? "step" : undefined} title={stage.number}>
            <span />
          </button>
        ))}
      </div>
      <div className="jev-dfc-grid">
        <FlowColumn kind="llm" en={en} step={step} reduce={reduce} />
        <FlowColumn kind="jev" en={en} step={step} reduce={reduce} />
      </div>
      <div className="jev-dfc-explanation" role="status" aria-live={playing ? "off" : "polite"} aria-atomic="true">
        <span>{stages[step].number}</span>
        <p>{t(stages[step].note)}</p>
      </div>
      <div className="jev-dfc-control-plane">
        <span className="jev-dfc-rule" aria-hidden="true">↓</span>
        <strong>SHARED RUNTIME · Authorization / Policy / Host</strong>
        <p>{t(["两条路径都不能绕过权限、确定性业务约束与执行验证。", "Neither route bypasses authorization, deterministic business constraints, or execution validation."])}</p>
      </div>
      <p className="jev-dfc-caption">{t([
        "概念示意，非性能实测。Jev 的并行判断仅适用于相互独立的问题；类型合法不保证语义正确。减少动态效果模式支持手动逐步阅读。",
        "Conceptual comparison, not a performance benchmark. Parallel Jev judgments require independent questions; type-valid does not guarantee semantic correctness. Reduced-motion mode supports manual stepping.",
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
