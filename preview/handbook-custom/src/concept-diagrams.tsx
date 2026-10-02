"use client";

import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

type Copy = [string, string];
type Frame = { node: number; title: Copy; text: Copy };
type Example = { label: Copy; input: Copy; route: Copy; frames: Frame[] };
type Lesson = {
  anchor: string;
  title: Copy;
  intro: Copy;
  nodes: Copy[];
  examples: Example[];
  takeaway: Copy;
};
const f = (node: number, title: Copy, text: Copy): Frame => ({
  node,
  title,
  text,
});
const lessons: Record<string, Lesson> = {
  "03-hybrid-retrieval-query-routing": {
    anchor: "dg2-query-routing",
    title: [
      "同一个 Router，不同的检索路径",
      "One router, different retrieval paths",
    ],
    intro: [
      "切换问题，看证据形状如何决定检索路径。",
      "Change the question to see how evidence shape guides retrieval.",
    ],
    nodes: [
      ["分析问题", "Analyze query"],
      ["限定权限", "Scope access"],
      ["选择路径", "Choose route"],
      ["返回证据", "Return evidence"],
    ],
    examples: [
      {
        label: ["精确编号", "Identifier"],
        input: [
          "错误码 E4307 的处理方式是什么？",
          "How do I resolve error E4307?",
        ],
        route: ["Exact + BM25", "Exact + BM25"],
        frames: [
          f(
            0,
            ["识别稳定标识符", "Recognize a stable identifier"],
            [
              "E4307 是错误码。规范化编号，但保留其业务含义与版本边界。",
              "E4307 is an error code. Normalize its format while preserving meaning and version boundaries.",
            ],
          ),
          f(
            1,
            ["先限定可见文档", "Restrict visible documents first"],
            [
              "用租户、角色、ACL 与版本过滤候选空间；相似度不能绕过授权。",
              "Filter candidates by tenant, role, ACL and version. Similarity never bypasses authorization.",
            ],
          ),
          f(
            2,
            ["优先匹配编号", "Prioritize identifier matching"],
            [
              "Exact 找到对应编号，BM25 补充术语和排障说明。Dense 不是编号匹配的保证。",
              "Exact matches the identifier; BM25 adds terminology and troubleshooting text. Dense similarity does not guarantee identifier matching.",
            ],
          ),
          f(
            3,
            ["交付可追溯证据", "Return traceable evidence"],
            [
              "返回相关段落及来源、版本，供后续验证。检索命中本身还不是最终答案。",
              "Return passages with sources and versions for validation. A retrieval hit is not yet an answer.",
            ],
          ),
        ],
      },
      {
        label: ["语义改写", "Paraphrase"],
        input: ["怎样拿回已经付的钱？", "How can I get my money back?"],
        route: ["BM25 + Dense → RRF", "BM25 + Dense → RRF"],
        frames: [
          f(
            0,
            ["识别语义意图", "Identify semantic intent"],
            [
              "问题没有直接使用“退款”一词，需要同时考虑词面和语义。",
              "The question does not say “refund”. Consider both wording and meaning.",
            ],
          ),
          f(
            1,
            ["先限定可见文档", "Restrict visible documents first"],
            [
              "只在已授权、适用地区与有效版本的政策中检索。",
              "Search only authorized policies for the applicable region and version.",
            ],
          ),
          f(
            2,
            ["两路召回后融合", "Fuse two retrieval paths"],
            [
              "BM25 匹配词法，Dense 捕捉改写。RRF 合并排名，不直接相加不同尺度的分数。",
              "BM25 matches wording; Dense captures paraphrases. RRF combines ranks rather than adding scores with different scales.",
            ],
          ),
          f(
            3,
            ["重排与证据打包", "Rerank and pack evidence"],
            [
              "重排候选，在上下文预算内保留支持政策判断的片段。",
              "Rerank candidates and retain policy-supporting passages within the context budget.",
            ],
          ),
        ],
      },
      {
        label: ["关系追溯", "Relationships"],
        input: [
          "供应商 A 影响了哪些产品？",
          "Which products depend on supplier A?",
        ],
        route: ["Graph + 文档检索", "Graph + document retrieval"],
        frames: [
          f(
            0,
            ["识别关系问题", "Recognize a relationship query"],
            [
              "答案需要供应商、材料和产品之间的连接，不能只找相似段落。",
              "The answer needs connections between suppliers, materials and products, not just similar passages.",
            ],
          ),
          f(
            1,
            ["关系也受权限约束", "Relationships are permission-scoped"],
            [
              "实体和关系的遍历同样限制在已授权空间。",
              "Entity and relationship traversal stays within the authorized space.",
            ],
          ),
          f(
            2,
            ["按关系遍历", "Traverse relationships"],
            [
              "若有可靠的关系图，沿 Supplier → Material → Product 遍历，再检索支持文档。",
              "When a reliable graph is available, traverse Supplier → Material → Product and retrieve supporting documents.",
            ],
          ),
          f(
            3,
            ["验证连接与来源", "Verify connections and sources"],
            [
              "保留关系链与出处；图谱缺失时说明边界，不把缺失关系当成不存在。",
              "Keep the relationship chain and sources. Missing graph edges do not prove that no relationship exists.",
            ],
          ),
        ],
      },
    ],
    takeaway: [
      "先看问题需要什么证据，再选路径；授权始终先于相似度。",
      "Choose a path from the evidence needed. Authorization always precedes similarity.",
    ],
  },
  "04-rag-reliability-selective-answering": {
    anchor: "fig-4-1",
    title: [
      "检索到内容，为什么还不能直接回答？",
      "Why a retrieval hit is not enough to answer",
    ],
    intro: [
      "这是六层 Gate 的简化示意，比较三种证据状态。",
      "A simplified view of the six gates, comparing three evidence states.",
    ],
    nodes: [
      ["明确问题", "Clarify query"],
      ["授权检索", "Scoped retrieval"],
      ["验证证据", "Validate evidence"],
      ["选择回应", "Choose response"],
    ],
    examples: [
      {
        label: ["证据充分", "Supported"],
        input: [
          "订阅取消后，可以退款吗？",
          "Can I get a refund after cancelling?",
        ],
        route: ["引用依据后回答", "Answer with citations"],
        frames: [
          f(
            0,
            ["确认适用范围", "Establish scope"],
            [
              "确认订阅类型、地区与时间，避免把不适用的政策当成答案。",
              "Establish subscription type, region and date to avoid using an inapplicable policy.",
            ],
          ),
          f(
            1,
            ["检索有效政策", "Retrieve valid policies"],
            [
              "在已授权文档中找当前有效版本，而不只是相似度最高的段落。",
              "Find current policies in authorized documents, not merely the most similar passage.",
            ],
          ),
          f(
            2,
            ["核对支持关系", "Check support for the claim"],
            [
              "来源有效、条款不冲突，且覆盖所需条件，才支持这个结论。",
              "Valid sources, consistent terms and covered conditions support the conclusion.",
            ],
          ),
          f(
            3,
            ["回答并保留限定条件", "Answer with conditions"],
            [
              "给出有引用的结论，并明确政策适用条件。示意不代表真实退款政策。",
              "Give a cited conclusion and its applicable conditions. This illustration is not a real refund policy.",
            ],
          ),
        ],
      },
      {
        label: ["证据冲突", "Conflicting"],
        input: [
          "两份政策对退款期限的描述不同。",
          "Two policies disagree on the refund window.",
        ],
        route: ["核对版本或升级人工", "Resolve versions or escalate"],
        frames: [
          f(
            0,
            ["识别同一政策范围", "Identify the policy scope"],
            [
              "先确认两份文档是否适用于同一产品、地区与时间。",
              "Check whether both documents apply to the same product, region and date.",
            ],
          ),
          f(
            1,
            ["保留双方来源", "Keep both sources"],
            [
              "检索结果保留版本和有效期，不只保留排名第一的片段。",
              "Keep versions and effective dates instead of only the top-ranked passage.",
            ],
          ),
          f(
            2,
            ["冲突不能被分数抹平", "Scores do not resolve conflicts"],
            [
              "高相似度不能证明哪份政策具有权威性。核对来源与生效关系。",
              "High similarity does not establish authority. Check provenance and effective versions.",
            ],
          ),
          f(
            3,
            ["先消解冲突", "Resolve the conflict first"],
            [
              "若权威版本仍不明确，说明冲突并升级人工，而不拼接一个确定答案。",
              "If the authoritative version remains unclear, explain the conflict and escalate rather than inventing certainty.",
            ],
          ),
        ],
      },
      {
        label: ["证据不足", "Insufficient"],
        input: [
          "找到了取消订阅说明，但没有退款条款。",
          "Cancellation instructions were found, but no refund terms.",
        ],
        route: ["继续检索或拒绝下结论", "Retrieve more or abstain"],
        frames: [
          f(
            0,
            ["区分问题与相邻主题", "Separate the question from nearby topics"],
            [
              "“如何取消”与“能否退款”是不同问题，需要不同证据。",
              "“How to cancel” and “Am I eligible for a refund?” require different evidence.",
            ],
          ),
          f(
            1,
            ["相关不等于支持", "Relevant does not mean supporting"],
            [
              "取消说明可能与问题相关，却没有证明退款资格。",
              "Cancellation instructions may be relevant without proving refund eligibility.",
            ],
          ),
          f(
            2,
            ["找出缺失的证据", "Identify missing evidence"],
            [
              "需要退款条件、期限与例外，不能让模型用常识补齐。",
              "Refund conditions, time limits and exceptions are needed. The model must not fill gaps with assumptions.",
            ],
          ),
          f(
            3,
            ["明确证据边界", "State the evidence boundary"],
            [
              "在预算内补充检索；仍不足时说明无法确认。检索无结果不等于政策不存在。",
              "Retrieve more within budget; if still insufficient, say it cannot be confirmed. No search results do not prove a policy does not exist.",
            ],
          ),
        ],
      },
    ],
    takeaway: [
      "是否回答取决于证据能否支持结论，不只取决于相似度分数。",
      "Answerability depends on evidence support, not just similarity scores.",
    ],
  },
  "08-agent-orchestration": {
    anchor: "fig-8-loop-vs-graph",
    title: ["Agent 的循环，靠什么结束？", "What makes an agent loop stop?"],
    intro: [
      "观察工具反馈如何改变下一次决策。示例不会调用真实工具。",
      "See how tool feedback changes the next decision. No real tools are called.",
    ],
    nodes: [
      ["制定计划", "Plan"],
      ["执行工具", "Act"],
      ["观察结果", "Observe"],
      ["检查边界", "Check limits"],
    ],
    examples: [
      {
        label: ["验证通过", "Verified"],
        input: [
          "修复一处错误，并用测试验证。",
          "Fix an error and verify it with a test.",
        ],
        route: ["验证通过 → 停止", "Verified → stop"],
        frames: [
          f(
            0,
            ["定义完成条件", "Define completion"],
            [
              "计划要包含验收条件：修改正确，且相关测试通过。",
              "The plan includes acceptance criteria: a correct change and passing relevant tests.",
            ],
          ),
          f(
            1,
            ["执行受控操作", "Perform a controlled action"],
            [
              "在明确权限和范围内修改，再运行验证工具。",
              "Make the scoped, authorized change and run the validation tool.",
            ],
          ),
          f(
            2,
            ["读取真实反馈", "Read actual feedback"],
            [
              "观察工具退出状态与测试结果。Agent 自述完成不是完成证据。",
              "Read the tool exit status and test results. An agent saying “done” is not completion evidence.",
            ],
          ),
          f(
            3,
            ["满足条件后结束", "Stop after acceptance"],
            [
              "验证满足预先定义的条件，记录结果并结束循环。",
              "Validation satisfies the predefined criteria. Record the result and stop.",
            ],
          ),
        ],
      },
      {
        label: ["修正后重试", "Revise and retry"],
        input: [
          "第一次测试失败，但还有执行预算。",
          "The first test fails, with execution budget remaining.",
        ],
        route: ["观察 → 修正计划 → 再验证", "Observe → revise → verify again"],
        frames: [
          f(
            0,
            ["提出可验证的修复", "Plan a verifiable fix"],
            [
              "根据已有信息制定计划，不预设第一次操作一定成功。",
              "Plan from the available evidence without assuming the first attempt will succeed.",
            ],
          ),
          f(
            1,
            ["执行并测试", "Act and test"],
            [
              "执行最小范围修改，并读取测试工具返回值。",
              "Make the smallest scoped change and read the test tool result.",
            ],
          ),
          f(
            2,
            ["失败成为新证据", "Failure becomes new evidence"],
            [
              "测试失败暴露了遗漏条件，反馈必须进入下一次决策。",
              "A failed test reveals a missed condition. Feed that observation into the next decision.",
            ],
          ),
          f(
            3,
            ["检查重试预算", "Check retry budget"],
            [
              "预算与权限仍允许，才进入下一轮；不能无限重复同一操作。",
              "Continue only while budget and authorization allow. Do not repeat the same action indefinitely.",
            ],
          ),
          f(
            0,
            ["修正计划", "Revise the plan"],
            [
              "根据失败原因调整方案，这是反馈闭环，不是重复 Prompt。",
              "Revise from the failure cause. This is a feedback loop, not repeated prompting.",
            ],
          ),
          f(
            1,
            ["执行修正", "Apply the revision"],
            [
              "执行有针对性的修复，再次验证。",
              "Apply a targeted revision and validate again.",
            ],
          ),
          f(
            2,
            ["验证新的结果", "Validate the new result"],
            [
              "新的工具结果满足验收条件，才形成完成证据。",
              "The new tool result meets the acceptance criteria and provides completion evidence.",
            ],
          ),
          f(
            3,
            ["记录并停止", "Record and stop"],
            [
              "结束循环，保留操作与验证记录以供追溯。",
              "Stop the loop and retain action and validation records.",
            ],
          ),
        ],
      },
      {
        label: ["预算耗尽", "Budget exhausted"],
        input: [
          "任务仍未完成，但已经达到执行上限。",
          "The task is incomplete, but the execution limit is reached.",
        ],
        route: ["保存状态 → 交接", "Save state → hand off"],
        frames: [
          f(
            0,
            ["任务有明确预算", "Define a bounded task"],
            [
              "执行前定义步数、成本或时间上限，以及交接方式。",
              "Define step, cost or time limits and a handoff path before execution.",
            ],
          ),
          f(
            1,
            ["执行允许的操作", "Perform allowed actions"],
            [
              "每次工具调用都消耗预算，关键副作用需要权限与记录。",
              "Every tool call consumes budget. Significant side effects need authorization and records.",
            ],
          ),
          f(
            2,
            ["识别未完成状态", "Recognize incomplete work"],
            [
              "反馈表明任务尚未满足验收条件，不把未完成包装成成功。",
              "Feedback shows the acceptance criteria are not met. Do not report incomplete work as success.",
            ],
          ),
          f(
            3,
            ["有边界地退出", "Exit within bounds"],
            [
              "停止自动执行，保存状态与失败原因，交接给人或可恢复流程。",
              "Stop automatic execution, preserve state and failure reasons, and hand off to a person or resumable workflow.",
            ],
          ),
        ],
      },
    ],
    takeaway: [
      "工具反馈推动下一轮决策；验收条件、权限与预算共同限定循环。",
      "Tool feedback drives the next decision. Acceptance, authorization and budget bound the loop.",
    ],
  },
};
export const ConceptDiagram = memo(function ConceptDiagram({
  slug,
  en,
  pane,
  onReady,
}: {
  slug: string;
  en: boolean;
  pane: RefObject<HTMLDivElement | null>;
  onReady: (ready: boolean) => void;
}) {
  const lesson = lessons[slug];
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const anchor = pane.current?.querySelector("#" + lesson.anchor);
    if (!anchor) return;
    const slot = document.createElement("div");
    slot.className = "concept-slot";
    anchor.after(slot);
    setHost(slot);
    return () => slot.remove();
  }, [lesson, pane, en]);
  useLayoutEffect(() => {
    onReady(Boolean(host));
  }, [host, onReady]);
  return host
    ? createPortal(
        <LessonPlayer key={slug + en} lesson={lesson} en={en} />,
        host,
      )
    : null;
});

function LessonPlayer({ lesson, en }: { lesson: Lesson; en: boolean }) {
  const t = (c: Copy) => c[en ? 1 : 0];
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [example, setExample] = useState(0),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false);
  const scenario = lesson.examples[example],
    frame = scenario.frames[step];
  const captions: Copy[] =
    lesson.anchor === "dg2-query-routing"
      ? [
          ["标识符 / 意图", "Identifier / Intent"],
          ["租户 / ACL", "Tenant / ACL"],
          scenario.route,
          ["来源 / 版本", "Source / Version"],
        ]
      : lesson.anchor === "fig-4-1"
        ? [
            ["范围 / 风险", "Scope / Risk"],
            ["ACL / 版本", "ACL / Version"],
            ["支持 / 冲突", "Support / Conflict"],
            ["回答 / 拒答", "Answer / Abstain"],
          ]
        : [
            ["目标 / 验收", "Goal / Criteria"],
            ["工具 / 权限", "Tool / Permission"],
            ["结果 / 反馈", "Result / Feedback"],
            ["完成 / 重试 / 停止", "Accept / Retry / Stop"],
          ];
  const last = step === scenario.frames.length - 1;
  useLayoutEffect(() => {
    // Lazy diagram insertion must not displace a requested chapter anchor.
    const section = location.hash.split("/")[2];
    if (!section || !root.current) return;
    let id: string;
    try {
      id = decodeURIComponent(section);
    } catch {
      id = section;
    }
    const pane = root.current.closest<HTMLElement>(".chapter-body");
    const target = pane?.querySelector<HTMLElement>(
      '[id="' + CSS.escape(id) + '"]',
    );
    const scroller = matchMedia("(max-width: 767px)").matches
      ? pane?.closest<HTMLElement>(".workspace")
      : pane;
    if (target && scroller)
      scroller.scrollTop +=
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        16;
  }, []);
  useEffect(() => {
    if (!playing || reduce) return;
    const timer = window.setTimeout(() => {
      if (last) setPlaying(false);
      else setStep((s) => s + 1);
    }, 2800);
    return () => clearTimeout(timer);
  }, [playing, step, last, reduce]);
  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    if (root.current) observer.observe(root.current);
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  const seek = (next: number) => {
    setPlaying(false);
    setStep(next);
  };
  return (
    <section
      ref={root}
      id="concept-demo"
      className="concept-demo"
      aria-labelledby="concept-title"
      data-bd-group="concept-demo"
    >
      <header className="concept-heading">
        <h3 id="concept-title">{t(lesson.title)}</h3>
        <p>{t(lesson.intro)}</p>
      </header>
      <div className="concept-examples">
        <label htmlFor="concept-example">
          {en ? "Choose an example" : "选择示例"}
        </label>
        <select
          id="concept-example"
          value={example}
          onChange={(e) => {
            setExample(Number(e.target.value));
            seek(0);
          }}
        >
          {lesson.examples.map((e, i) => (
            <option key={i} value={i}>
              {t(e.label)}
            </option>
          ))}
        </select>
      </div>
      <div className="concept-input">
        <span>{en ? "Example" : "示例"}</span>
        <p>{t(scenario.input)}</p>
      </div>
      <div
        className="concept-flow"
        role="group"
        aria-label={en ? "Select a node to inspect" : "选择节点查看解释"}
      >
        {lesson.nodes.map((node, i) => (
          <div className="concept-node-wrap" key={i}>
            <button
              type="button"
              className="concept-node"
              data-current={frame.node === i}
              aria-pressed={frame.node === i}
              onClick={() =>
                seek(scenario.frames.findIndex((f) => f.node === i))
              }
            >
              <span className="concept-node-status">
                {frame.node === i
                  ? en
                    ? "Current"
                    : "当前"
                  : scenario.frames.slice(0, step).some((f) => f.node === i)
                    ? en
                      ? "Visited"
                      : "已经过"
                    : en
                      ? "Inspect"
                      : "查看"}
              </span>
              <strong>{t(node)}</strong>
              <span>{t(captions[i])}</span>
              {frame.node === i && (
                <motion.span
                  aria-hidden="true"
                  className="concept-node-marker"
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                />
              )}
            </button>
            {i < lesson.nodes.length - 1 && (
              <span className="concept-connector" aria-hidden="true">
                <ArrowRightIcon />
                {!reduce && frame.node === i && playing && (
                  <motion.span
                    className="concept-packet"
                    key={example + ":" + step}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1.5] }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      {lesson.anchor === "fig-8-loop-vs-graph" && (
        <div className="concept-loop" data-return={step >= 4}>
          <span aria-hidden="true">↶</span>
          {en
            ? "Feedback returns to planning while budget allows."
            : "预算允许时，反馈回到计划，进入下一轮。"}
        </div>
      )}
      <div
        className="concept-explanation"
        aria-live={playing ? "off" : "polite"}
        aria-atomic="true"
      >
        <motion.div
          key={example + ":" + step}
          initial={reduce ? false : { opacity: 0.4, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <h4>{t(frame.title)}</h4>
          <p>{t(frame.text)}</p>
        </motion.div>
      </div>
      <div className="concept-controls">
        <div className="concept-transport">
          {!reduce && (
            <Button
              onClick={() => {
                if (last && !playing) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              {playing
                ? en
                  ? "Pause"
                  : "暂停"
                : last
                  ? en
                    ? "Replay"
                    : "重播"
                  : en
                    ? "Play"
                    : "播放"}
            </Button>
          )}
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => seek(step - 1)}
          >
            {en ? "Previous" : "上一步"}
          </Button>
          <Button
            variant="outline"
            disabled={last}
            onClick={() => seek(step + 1)}
          >
            {en ? "Next" : "下一步"}
          </Button>
        </div>
        <span className="concept-position" role="status">
          {step + 1} / {scenario.frames.length}
          {last ? (en ? " · Complete" : " · 完成") : ""}
        </span>
      </div>
      <div className="concept-outcome">
        <span>{en ? "This example ends with" : "本例最终走向"}</span>
        <strong>{t(scenario.route)}</strong>
      </div>
      <p className="concept-takeaway">{t(lesson.takeaway)}</p>
    </section>
  );
}
