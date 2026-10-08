import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingUnderlineIndicator } from "@/components/ui/ix-onboarding-stepper-underline";
import { ArrowRightIcon } from "@/components/icons";
import { KnowledgeCheck, SkillContextInspector } from "./learning-interactions";
import { ArchifyOverview } from "./archify-overview";
import type { Lesson } from "./learning-content";
import { usePretextLayout } from "./use-pretext-layout";

/** A teaching simulation: no real files, model calls, tokens or authorization. */
export function SkillSimulator({
  lesson,
  en,
  rootRef,
}: {
  lesson: Lesson;
  en: boolean;
  rootRef: RefObject<HTMLElement | null>;
}) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [scenario, setScenario] = useState(0);
  const [phase, setPhase] = useState(-1);
  const [running, setRunning] = useState(false);
  const reduced = useReducedMotion();
  usePretextLayout(rootRef);
  const terminal = useRef<HTMLDivElement>(null);
  const stream = useRef<HTMLDivElement>(null);
  const example = lesson.examples[scenario];
  const permitted = scenario === 0;
  const lastPhase = permitted ? 4 : 1;
  const done = phase === lastPhase;
  const labels = [
    t("发现", "Discovery"),
    t("边界检查", "Boundaries"),
    t("指令注入", "Instructions"),
    t("参考加载", "References"),
    t("执行验证", "Execution"),
  ];
  const steps = labels.map((label, i) => ({
    id: String(i),
    label: `${i + 1}. ${label}`,
    title: label,
  }));
  const SIMULATION_FLOW = [
    {
      kind: "process",
      title: "SKILL DISCOVERY",
      text: example.frames[0].text[en ? 1 : 0],
      log: t(
        "发现候选技能；仅加载能力摘要。",
        "Candidate found; only the summary is loaded.",
      ),
      tokens: 320,
      asset: "catalog / summary",
    },
    {
      kind: permitted ? "process" : "blocked",
      title: "AUTHORIZATION & INPUT",
      text: example.frames[1].text[en ? 1 : 0],
      log: permitted
        ? t(
            "输入完整 · report.pdf 读取权限已确认。",
            "Input complete · report.pdf read access confirmed.",
          )
        : example.frames[3].text[en ? 1 : 0],
      tokens: 420,
      asset: null,
    },
    {
      kind: "instruction",
      title: "SKILL.md",
      text: example.frames[2].text[en ? 1 : 0],
      log: "Read → skills/pdf-extract/SKILL.md",
      tokens: 780,
      asset: "skills/pdf-extract/SKILL.md",
    },
    {
      kind: "reference",
      title: "REFERENCES / PDF",
      text: t(
        "按需读取 PDF 解析参考：文本型 PDF 提取文本层；扫描页先 OCR，再检查阅读顺序。",
        "Load the PDF reference on demand: extract text layers; use OCR for scans, then check reading order.",
      ),
      log: "Read → references/pdf-parsing.md",
      tokens: 1120,
      asset: "references/pdf-parsing.md",
    },
    {
      kind: "result",
      title: "TOOL RESULT · VERIFIED",
      text: example.frames[3].text[en ? 1 : 0],
      log: "extract_text(report.pdf) → verify pages & text → done",
      tokens: 1380,
      asset: "report.txt · simulated",
    },
  ];
  const runState =
    phase < 0
      ? "idle"
      : done
        ? permitted
          ? "complete"
          : scenario === 1
            ? "needs-input"
            : "blocked"
        : running
          ? "running"
          : "paused";
  const visible = SIMULATION_FLOW.slice(0, phase + 1);
  const tokens = phase < 0 ? 0 : SIMULATION_FLOW[phase].tokens;
  const state =
    phase < 0
      ? t("等待指令", "Idle")
      : done
        ? permitted
          ? t("已完成", "Complete")
          : scenario === 1
            ? t("等待补充输入", "Needs input")
            : t("权限拒绝", "Access denied")
        : running
          ? t("运行中", "Running")
          : t("已暂停", "Paused");
  function reset(next = scenario) {
    setRunning(false);
    setPhase(-1);
    setScenario(next);
  }
  function run() {
    if (done) {
      setPhase(0);
    } else if (phase < 0) {
      setPhase(0);
    }
    setRunning(true);
  }
  useEffect(() => {
    if (!running) return;
    if (done) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setPhase((p) => p + 1), 2100);
    return () => window.clearTimeout(timer);
  }, [running, phase, done]);
  useEffect(() => {
    for (const ref of [terminal, stream])
      ref.current?.scrollTo({
        top: ref.current.scrollHeight,
        behavior: reduced ? "instant" : "smooth",
      });
  }, [phase, reduced]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pause);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setRunning(false);
    });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      document.removeEventListener("visibilitychange", pause);
      observer.disconnect();
    };
  }, [rootRef]);
  return (
    <section
      ref={rootRef}
      id="concept-demo"
      className="concept-demo skill-terminal"
      data-run-state={runState}
      aria-labelledby="concept-title"
    >
      <style>{`
      .chapter-body .skill-terminal {
        --sim-canvas:#101112; --sim-terminal:#0b0c0d; --sim-panel:#191b1e; --sim-raised:#202326;
        --sim-border:#33373b; --sim-ink:#edeae3; --sim-muted:#aab0b5; --sim-accent:#d97757;
        --sim-blue:#a8c5e5; --sim-gold:#ddc28b; --sim-violet:#c6b4e3; --sim-rose:#e2afc1;
        --primary:var(--sim-accent); --primary-foreground:#16110f; --foreground:var(--sim-ink);
        --muted-foreground:var(--sim-muted); --background:var(--sim-terminal); --card:var(--sim-panel);
        --border:var(--sim-border); --ring:#e9ad91; --ring-inverted:#e9ad91; --secondary:var(--sim-raised);
        --secondary-foreground:var(--sim-ink); --accent:#30231e; --accent-foreground:#f1b69c;
        --input:var(--sim-raised); --muted:var(--sim-raised); --success:#a0cbb0; --destructive:#edafa5;
        padding:1.25rem; border:.0625rem solid var(--sim-border); border-radius:1rem;
        color:var(--sim-ink); background:var(--sim-canvas);
        box-shadow:inset 0 .0625rem 0 #ffffff08, 0 .75rem 2rem #0000000d;
      }
      .skill-terminal * { min-width:0; }
      .dark .chapter-body .skill-terminal {
        --sim-canvas:#25292c; --sim-terminal:#191d20; --sim-panel:#2b3033; --sim-raised:#343a3e;
        --sim-border:#41484d; --sim-ink:#e7e9e7; --sim-muted:#b4bbbe; --sim-accent:#dda082;
        --sim-blue:#b6cbdc; --sim-gold:#dbca9d; --sim-violet:#c4bbd7; --sim-rose:#d9b9c6;
        --accent:#3d332e; --accent-foreground:#edbea4; --ring:#d3b09d; --ring-inverted:#d3b09d;
        --primary-foreground:#261c17;
        box-shadow:inset 0 .0625rem 0 #ffffff0a, 0 .5rem 1.5rem #00000014;
      }
      .dark .chapter-body .skill-terminal h3 { font-family:var(--font-sans); font-size:1.5rem; font-weight:550; letter-spacing:-.035em; }
      .dark .skill-terminal .sim-panel { box-shadow:inset 0 .0625rem 0 #ffffff08; }
      .dark .skill-terminal .sim-message { background:var(--sim-panel); border-color:var(--sim-border); }
      .dark .skill-terminal .sim-message[data-current=true] { background:var(--sim-raised); border-color:color-mix(in srgb,var(--message-color) 42%,var(--sim-border)); }
      .dark .skill-terminal .sim-progress { background:var(--sim-canvas); }
      .dark .skill-terminal .sim-run:hover { background:#e6af94; }
      .chapter-body .skill-terminal p { margin:0; }
      .chapter-body .skill-terminal h3 { margin:0; color:var(--sim-ink); font-family:Georgia,"Noto Serif SC",serif; font-size:1.5rem; font-weight:500; line-height:1.35; letter-spacing:-.02em; }
      .skill-terminal .sim-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding-bottom:.875rem; margin-bottom:1rem; border-bottom:.0625rem solid var(--sim-border); }
      .skill-terminal .sim-header p { margin-top:.375rem; max-width:34rem; color:var(--sim-muted); font-size:.875rem; line-height:1.7; text-wrap:pretty; }
      .skill-terminal .sim-scenarios { height:auto; display:flex; flex-wrap:wrap; gap:.25rem; padding:.25rem; border:.0625rem solid var(--sim-border); border-radius:.625rem; background:var(--sim-terminal); box-shadow:inset 0 .0625rem .25rem #00000040; }
      .skill-terminal .sim-scenarios button { height:auto; min-height:2.75rem; border:.0625rem solid transparent; background:transparent; color:var(--sim-muted); border-radius:.375rem; padding:.5rem .75rem; box-shadow:none; font-size:.8125rem; font-weight:500; }
      .skill-terminal .sim-scenarios button[data-state=active] { background:var(--accent); border-color:#745344; color:var(--accent-foreground); box-shadow:inset 0 .0625rem 0 #ffffff0a; }
      .skill-terminal .sim-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.9fr); gap:.875rem; }
      .skill-terminal .sim-panel { display:flex; flex-direction:column; border:.0625rem solid var(--sim-border); border-radius:.75rem; overflow:hidden; background:var(--sim-panel); }
      .skill-terminal .sim-titlebar { display:flex; align-items:center; justify-content:space-between; gap:1rem; min-height:3.5rem; padding:.75rem 1rem; border-bottom:.0625rem solid var(--sim-border); background:var(--sim-panel); }
      .skill-terminal .sim-window-title { display:flex; align-items:center; gap:.5rem; color:var(--sim-ink); font-family:var(--font-mono); font-size:.75rem; font-weight:500; letter-spacing:.04em; }
      .skill-terminal .sim-window-prefix { color:var(--sim-accent); font-size:1rem; line-height:1; }
      .skill-terminal .sim-window-caption { display:block; margin-top:.375rem; color:var(--sim-muted); font-size:.6875rem; line-height:1.5; }
      .skill-terminal .sim-terminal { flex:1; height:16rem; min-height:14rem; max-height:18rem; overflow:auto; scrollbar-gutter:stable; padding:1rem; background:var(--sim-terminal); font-family:var(--font-mono); font-size:.8125rem; line-height:1.9; overflow-wrap:anywhere; }
      .skill-terminal .sim-pending { padding-bottom:1rem; margin-bottom:1rem; border-bottom:.0625rem solid var(--sim-border); }
      .skill-terminal .sim-pending-label { display:block; color:var(--sim-muted); font-size:.6875rem; margin-bottom:1rem; }
      .skill-terminal .sim-request { display:grid; grid-template-columns:auto 1fr; gap:.75rem; align-items:baseline; color:var(--sim-ink); }
      .chapter-body .skill-terminal .sim-request p { font-size:.9375rem; line-height:1.9; }
      .skill-terminal .sim-prompt { color:var(--sim-accent); }
      .skill-terminal .sim-cursor { display:flex; align-items:center; gap:.5rem; color:var(--sim-muted); font-size:.75rem; }
      .skill-terminal .sim-caret { display:inline-block; width:.375rem; height:.875rem; background:var(--sim-accent); }
      .skill-terminal .sim-log { margin-bottom:1.25rem; white-space:pre-wrap; }
      .skill-terminal .sim-log small { display:flex; gap:.5rem; align-items:center; color:var(--sim-muted); font-size:.6875rem; margin-bottom:.5rem; }
      .skill-terminal .sim-log small::before { content:""; width:.25rem; height:.25rem; background:currentColor; flex:none; }
      .skill-terminal .sim-log.user { color:var(--sim-ink); }
      .skill-terminal .sim-log.process { color:#b8bfc4; }
      .skill-terminal .sim-log.result { color:var(--success); }
      .skill-terminal .sim-log.blocked { color:var(--destructive); }
      .skill-terminal .sim-controls { padding:.75rem; display:grid; grid-template-columns:1fr auto; gap:.5rem; border-top:.0625rem solid var(--sim-border); background:var(--sim-panel); }
      .skill-terminal .sim-controls button { border-radius:.5rem; font-size:.8125rem; min-height:2.75rem; min-width:4rem; cursor:pointer; }
      .skill-terminal .sim-controls .sim-run { grid-column:1/-1; min-height:3rem; color:var(--primary-foreground); background:var(--sim-accent); box-shadow:inset 0 .0625rem 0 #ffffff24, 0 .125rem .25rem #00000030; font-weight:600; }
      .skill-terminal .sim-run svg { width:1rem; height:1rem; flex:none; }
      .skill-terminal .sim-controls button:not(.sim-run) { background:var(--sim-raised); color:var(--sim-ink); border-color:var(--sim-border); box-shadow:inset 0 .0625rem 0 #ffffff06; }
      .skill-terminal button:disabled { cursor:default; opacity:.45; }
      .skill-terminal .sim-progress { padding:0 1.25rem; border-bottom:.0625rem solid var(--sim-border); background:var(--sim-terminal); }
      .skill-terminal .sim-progress [data-progress-style] { min-height:2.75rem; gap:.5rem; align-items:center; }
      .skill-terminal .sim-progress span { font-family:var(--font-mono); font-size:.6875rem; }
      .skill-terminal .sim-progress [data-step-state] { padding:.75rem 0; }
      .skill-terminal .sim-progress [data-step-state=current] { color:var(--accent-foreground); }
      .skill-terminal .sim-stream { height:15rem; overflow:auto; scrollbar-gutter:stable; padding:1rem; display:flex; flex-direction:column; gap:.75rem; }
      .skill-terminal .sim-message { --message-color:var(--sim-blue); padding:.75rem; border:.0625rem solid color-mix(in srgb,var(--message-color) 18%,var(--sim-border)); border-radius:.5rem; background:color-mix(in srgb,var(--message-color) 5%,var(--sim-panel)); flex:none; }
      .skill-terminal .sim-message strong { display:flex; align-items:center; justify-content:space-between; gap:.5rem; color:var(--message-color); font-family:var(--font-mono); font-size:.6875rem; font-weight:500; letter-spacing:.04em; margin-bottom:.5rem; }
      .skill-terminal .sim-message-index { color:var(--sim-muted); font-variant-numeric:tabular-nums; letter-spacing:0; }
      .chapter-body .skill-terminal .sim-message p { font-family:var(--font-sans); font-size:.875rem; line-height:1.8; color:#c5c9cb; }
      .skill-terminal .sim-message.tools { --message-color:var(--sim-gold); }
      .skill-terminal .sim-message.instruction { --message-color:var(--sim-rose); }
      .skill-terminal .sim-message.reference { --message-color:var(--sim-violet); }
      .skill-terminal .sim-message.result { --message-color:var(--success); }
      .skill-terminal .sim-message.blocked { --message-color:var(--destructive); }
      .skill-terminal .sim-message[data-current=true] { border-color:color-mix(in srgb,var(--message-color) 45%,var(--sim-border)); box-shadow:inset 0 .0625rem 0 #ffffff06; }
      .skill-terminal .sim-assets { display:grid; grid-template-columns:1fr 1fr; margin-top:auto; background:var(--sim-terminal); border-top:.0625rem solid var(--sim-border); min-height:6rem; }
      .skill-terminal .sim-assets > div { padding:.875rem; }
      .skill-terminal .sim-assets > div+div { border-left:.0625rem solid var(--sim-border); }
      .chapter-body .skill-terminal .sim-assets h4 { font-family:var(--font-sans); font-size:.75rem; line-height:1.5; color:var(--sim-muted); margin:0 0 .75rem; font-weight:500; }
      .skill-terminal .sim-assets p { font-family:var(--font-mono); font-size:.6875rem; line-height:1.8; color:var(--sim-muted); overflow-wrap:anywhere; }
      .skill-terminal .sim-scope { display:inline-block; border:.0625rem solid var(--sim-border); padding:.25rem .5rem; border-radius:.25rem; font-family:var(--font-mono); font-size:.6875rem; margin-right:.5rem; margin-bottom:.5rem; color:var(--sim-ink); background:var(--sim-raised); }
      .skill-terminal .sim-asset-row { display:flex; gap:.5rem; align-items:baseline; margin-bottom:.25rem; }
      .skill-terminal .sim-asset-row::before { content:"+"; color:var(--success); }
      .skill-terminal .sim-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; border-top:.0625rem solid var(--sim-border); padding:.875rem 0 0; margin-top:1rem; }
      .skill-terminal .sim-metrics > div+div { border-left:.0625rem solid var(--sim-border); padding-left:1rem; }
      .skill-terminal .sim-metrics dt { font-family:var(--font-sans); font-size:.6875rem; color:var(--sim-muted); }
      .skill-terminal .sim-metrics dd { margin:.5rem 0 0; font-family:var(--font-mono); font-size:.875rem; color:var(--sim-ink); font-variant-numeric:tabular-nums; }
      .skill-terminal .sim-metrics > div:first-child dd { font-size:1.25rem; line-height:1.3; }
      .skill-terminal .sim-status { min-height:1.75rem; padding:.25rem .5rem; gap:.5rem; font-size:.6875rem; border-radius:.375rem; flex:none; font-variant-numeric:tabular-nums; }
      .skill-terminal .sim-status::before { content:""; width:.3125rem; height:.3125rem; border-radius:50%; background:currentColor; }
      .skill-terminal[data-run-state=needs-input] .sim-status { color:var(--sim-gold); }
      .skill-terminal .sim-status-count { opacity:.85; }
      .skill-terminal details { border-top:.0625rem solid var(--sim-border); padding-top:1rem; margin-top:1rem; }
      .skill-terminal summary { cursor:pointer; color:var(--sim-muted); font-size:.8125rem; min-height:2.75rem; display:flex; align-items:center; gap:.75rem; }
      .skill-terminal summary::before { content:"+"; color:var(--sim-accent); font-family:var(--font-mono); font-size:1rem; }
      .skill-terminal details[open] > summary::before { content:"−"; }
      .skill-terminal .sim-detail { padding-top:1rem; }
      .skill-terminal .knowledge-check { border-color:var(--sim-border); }
      .chapter-body .skill-terminal .knowledge-feedback strong { color:var(--sim-ink); }
      .chapter-body .skill-terminal:focus-visible,.skill-terminal button:focus-visible,.skill-terminal a:focus-visible,.skill-terminal summary:focus-visible { outline:.125rem solid var(--ring); outline-offset:.1875rem; }
      .skill-terminal .sim-tabs-panel { margin:0; }
      .chapter-body .skill-terminal .sim-json { margin:.75rem 0 0; border:0; background:transparent; padding:0; color:var(--success); font-size:.75rem; white-space:pre-wrap; overflow-wrap:anywhere; overflow:visible; }
      @media (hover:hover) and (pointer:fine) {
        .skill-terminal .sim-controls .sim-run:hover { background:#e59170; }
        .skill-terminal .sim-controls button:not(.sim-run):hover { background:#2a2e32; border-color:#687078; }
        .skill-terminal .sim-scenarios button:not([data-state=active]):hover { background:var(--sim-raised); color:var(--sim-ink); }
        .skill-terminal summary:hover { color:var(--sim-ink); }
      }
      @media (prefers-reduced-motion:no-preference) { .skill-terminal .sim-message[data-current=true] { animation:sim-arrive 180ms ease-out; } @keyframes sim-arrive { from {opacity:.5;transform:translateY(.25rem)} to {opacity:1;transform:translateY(0)} } }
      @media (prefers-reduced-motion:reduce) { .skill-terminal button { transition:none; transform:none; } }
      @container (max-width:1050px) { .skill-terminal .sim-header { align-items:flex-start; flex-direction:column; gap:.75rem; } }
      @container (max-width:760px) {
        .chapter-body .skill-terminal { padding:1rem; }
        .skill-terminal .sim-grid { grid-template-columns:1fr; gap:1rem; }
        .skill-terminal .sim-terminal { height:11rem; min-height:11rem; max-height:11rem; flex:auto; }
        .skill-terminal .sim-stream { height:13rem; }
        .skill-terminal .sim-metrics { grid-template-columns:1fr 1fr; gap:.875rem; }
        .skill-terminal .sim-metrics > div:nth-child(3) { border-left:0; padding-left:0; }
        .skill-terminal .sim-scenarios { width:100%; }
        .skill-terminal .sim-scenarios button { flex:1; padding:.5rem; white-space:normal; }
        .skill-terminal .sim-titlebar { padding:1rem; }
        .skill-terminal .sim-stream,.skill-terminal .sim-terminal { padding:1rem; }
        .skill-terminal .sim-progress { padding:0 1rem; }
        .skill-terminal .sim-progress [data-progress-style] { flex-wrap:wrap; justify-content:flex-start; gap:0 1rem; padding:.5rem 0; }
        .skill-terminal .sim-progress [data-step-state] { padding:.5rem 0; }
        .skill-terminal .sim-assets > div { padding:1rem; }
      }
      @container (max-width:400px) { .chapter-body .skill-terminal { padding:1rem; } .chapter-body .skill-terminal h3 { font-size:1.625rem; } .skill-terminal .sim-scenarios button { font-size:.75rem; } .skill-terminal .sim-titlebar { gap:.5rem; } .skill-terminal .sim-window-title { font-size:.6875rem; } }
    `}</style>
      <Tabs
        value={String(scenario)}
        onValueChange={(value) => reset(Number(value))}
      >
        <header className="sim-header">
          <div>
            <h3 id="concept-title">
              {t("生命周期交互模拟器", "Skill lifecycle simulator")}
            </h3>
            <p>
              {t(
                "选择场景，观察指令、上下文与工具如何协作。所有操作均为教学模拟。",
                "Choose a scenario to watch instructions, context and tools work together. All actions are simulated.",
              )}
            </p>
          </div>
          <TabsList
            className="sim-scenarios"
            aria-label={t("选择模拟场景", "Choose simulation scenario")}
          >
            {lesson.examples.map((s, i) => (
              <TabsTrigger
                value={String(i)}
                key={i}
                aria-label={
                  t(`场景 ${i + 1}：`, `Case ${i + 1}: `) + s.label[en ? 1 : 0]
                }
              >
                {s.label[en ? 1 : 0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </header>
        <TabsContent
          value={String(scenario)}
          className="sim-tabs-panel"
          tabIndex={-1}
        >
          <div className="sim-grid grid gap-5">
            <div className="sim-panel">
              <div className="sim-titlebar">
                <div>
                  <div className="sim-window-title">
                    <span className="sim-window-prefix" aria-hidden="true">
                      ›_
                    </span>
                    USER TERMINAL
                  </div>
                  <span className="sim-window-caption">
                    {t(
                      "用户可见 · 请求与执行日志",
                      "User view · request and execution log",
                    )}
                  </span>
                </div>
              </div>
              <div
                ref={terminal}
                className="sim-terminal"
                role="region"
                aria-label={t("终端日志", "Terminal log")}
                tabIndex={0}
              >
                {phase < 0 ? (
                  <div>
                    <div className="sim-pending">
                      <span className="sim-pending-label">
                        {t("待发送的任务", "Pending request")}
                      </span>
                      <div className="sim-request">
                        <span className="sim-prompt" aria-hidden="true">
                          ›
                        </span>
                        <p>{example.input[en ? 1 : 0]}</p>
                      </div>
                    </div>
                    <div className="sim-cursor">
                      <span className="sim-caret" aria-hidden="true" />
                      {t("等待发送指令…", "Waiting for command…")}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sim-log user">
                      <small>USER / REQUEST</small>
                      {example.input[en ? 1 : 0]}
                    </div>
                    {visible.map((item, i) => (
                      <div className={`sim-log ${item.kind}`} key={i}>
                        <small>
                          {String(i + 1).padStart(2, "0")} / {labels[i]}
                        </small>
                        {item.log}
                      </div>
                    ))}
                    {done && (
                      <div
                        className={`sim-log ${permitted ? "result" : "blocked"}`}
                      >
                        <small>RESPONSE</small>
                        {example.route[en ? 1 : 0]}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="sim-controls">
                <Button
                  className="sim-run"
                  onClick={running ? () => setRunning(false) : run}
                >
                  <ArrowRightIcon />
                  {running
                    ? t("暂停模拟", "Pause simulation")
                    : done
                      ? t("重新运行", "Run again")
                      : phase < 0
                        ? t("发送指令", "Send command")
                        : t("继续模拟", "Resume simulation")}
                </Button>
                <Button
                  variant="outline"
                  disabled={done || running}
                  onClick={() => setPhase((p) => Math.min(lastPhase, p + 1))}
                >
                  {t("单步执行", "Step forward")}
                </Button>
                <Button
                  variant="outline"
                  disabled={phase < 0}
                  onClick={() => reset()}
                >
                  {t("重置", "Reset")}
                </Button>
              </div>
            </div>
            <div className="sim-panel">
              <div className="sim-titlebar">
                <div>
                  <div className="sim-window-title">INTERNAL CONTEXT</div>
                  <span className="sim-window-caption">
                    {t(
                      "教学示意 · 非模型思维记录",
                      "Illustrative · not model reasoning",
                    )}
                  </span>
                </div>
                <Badge
                  variant={
                    done && permitted
                      ? "success"
                      : done && scenario === 2
                        ? "destructive"
                        : running
                          ? "accent"
                          : "outline"
                  }
                  className="sim-status"
                  role="status"
                  aria-atomic="true"
                >
                  {state}
                  <span className="sim-status-count">{phase + 1} / 5</span>
                </Badge>
              </div>
              <div className="sim-progress">
                <OnboardingUnderlineIndicator
                  steps={steps}
                  index={phase < 0 ? -1 : phase}
                  labelMode="all"
                  transition={{ duration: 0 }}
                />
              </div>
              <div
                ref={stream}
                className="sim-stream"
                role="region"
                aria-label={t("内部上下文流", "Internal context stream")}
                tabIndex={0}
              >
                <div className="sim-message process">
                  <strong>SYSTEM PROMPT</strong>
                  <p>
                    {t(
                      "根据当前任务加载相关技能；独立检查输入、权限与结果。",
                      "Load relevant skills for the task. Independently check inputs, permissions and results.",
                    )}
                  </p>
                </div>
                <div className="sim-message tools">
                  <strong>AVAILABLE TOOLS</strong>
                  <p>
                    Tools: [Read, extract_text]
                    <br />
                    Skill:{" "}
                    {t(
                      "仅载入能力描述，正文按需读取",
                      "Summary only; instructions load on demand",
                    )}
                  </p>
                </div>
                {visible.map((item, i) => (
                  <div
                    key={`${scenario}-${i}`}
                    className={`sim-message ${item.kind}`}
                    data-current={i === phase}
                  >
                    <strong>
                      {item.title}
                      <span className="sim-message-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </strong>
                    <p>{item.text}</p>
                    {done && !permitted && i === 1 && (
                      <p>
                        {example.frames[2].text[en ? 1 : 0]}
                        <br />
                        {example.frames[3].text[en ? 1 : 0]}
                      </p>
                    )}
                    {i === 4 && (
                      <pre className="sim-json">
                        {
                          '{ "status": "verified", "source": "report.pdf", "page_numbers": true }'
                        }
                      </pre>
                    )}
                  </div>
                ))}
              </div>
              <div className="sim-assets">
                <div>
                  <h4>{t("工具权限 / PERMISSIONS", "PERMISSIONS / SCOPES")}</h4>
                  <span className="sim-scope">Read</span>
                  <span className="sim-scope">extract_text</span>
                  <p>
                    {phase < 1
                      ? t(
                          "待核对目标文件授权",
                          "Target file access not yet checked",
                        )
                      : permitted
                        ? "report.pdf · read: allowed"
                        : scenario === 1
                          ? t(
                              "输入缺失 · 不调用工具",
                              "Missing input · no tool call",
                            )
                          : "tenant: other · access: denied"}
                  </p>
                </div>
                <div>
                  <h4>{t("已加载资料 / ASSETS", "LOADED ASSETS")}</h4>
                  {visible
                    .filter((item) => item.asset)
                    .map((item) => (
                      <p className="sim-asset-row" key={item.asset}>
                        {item.asset}
                      </p>
                    ))}
                  {phase < 0 && <p>{t("尚未加载资料", "No assets loaded")}</p>}
                </div>
              </div>
            </div>
          </div>
          <dl className="sim-metrics">
            <div>
              <dt>{t("上下文 TOKENS · 示意", "CONTEXT TOKENS · DEMO")}</dt>
              <dd>{tokens.toLocaleString(en ? "en-US" : "zh-CN")}</dd>
            </div>
            <div>
              <dt>{t("模型 / MODEL", "MODEL")}</dt>
              <dd>{t("教学模拟器", "Teaching simulator")}</dd>
            </div>
            <div>
              <dt>{t("缓存 / CACHE", "CACHE")}</dt>
              <dd>
                {phase < 0
                  ? "—"
                  : phase >= 2
                    ? "MISS · on-demand"
                    : "HIT · catalog"}
              </dd>
            </div>
            <div>
              <dt>{t("费用 / COST", "COST")}</dt>
              <dd>{t("无真实 API 调用", "No real API calls")}</dd>
            </div>
          </dl>
        </TabsContent>
      </Tabs>
      <KnowledgeCheck key={scenario} anchor={lesson.anchor} en={en} />
      <details>
        <summary>
          {t(
            "查看完整上下文与架构全景",
            "Inspect context layers and architecture map",
          )}
        </summary>
        <div className="sim-detail">
          <SkillContextInspector
            key={scenario}
            example={scenario}
            step={phase < 0 ? 0 : phase}
            en={en}
          />
          <p>{lesson.takeaway[en ? 1 : 0]}</p>
          <ArchifyOverview anchor={lesson.anchor} en={en} />
        </div>
      </details>
    </section>
  );
}
