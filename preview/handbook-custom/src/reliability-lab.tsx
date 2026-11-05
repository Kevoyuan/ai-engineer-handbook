"use client";

import { useState } from "react";
import "./reliability-lab.css";

type Case = {
  id: string;
  zh: string;
  en: string;
  score: number;
  correct: boolean;
};

/**
 * Fixed, invented teaching fixture. The scores are intentionally NOT calibrated
 * probabilities, retrieval similarity benchmarks, or live model outputs.
 * "correct" is the known reference label for the illustrative answer.
 */
const CASES: readonly Case[] = [
  { id: "01", zh: "政策适用范围", en: "Policy applicability", score: 96, correct: true },
  { id: "02", zh: "错误码 E4307", en: "Error code E4307", score: 90, correct: true },
  { id: "03", zh: "旧版本兼容性", en: "Old-version compatibility", score: 83, correct: false },
  { id: "04", zh: "引用是否支持结论", en: "Citation supports claim", score: 78, correct: true },
  { id: "05", zh: "传感器单位换算", en: "Sensor unit conversion", score: 71, correct: true },
  { id: "06", zh: "跨文档因果关系", en: "Cross-document causality", score: 65, correct: false },
  { id: "07", zh: "过期数据的影响", en: "Stale-data impact", score: 54, correct: false },
  { id: "08", zh: "证据缺口的描述", en: "Describing an evidence gap", score: 38, correct: true },
];

type Metrics = {
  answered: number;
  errors: number;
  coverage: number;
  risk: number | null;
};

export function riskCoverage(threshold: number): Metrics {
  const selected = CASES.filter((item) => item.score >= threshold);
  const errors = selected.filter((item) => !item.correct).length;
  return {
    answered: selected.length,
    errors,
    coverage: (100 * selected.length) / CASES.length,
    // Selective risk is undefined when no request receives an answer.
    risk: selected.length ? (100 * errors) / selected.length : null,
  };
}

const CURVE = [...new Set(CASES.map((item) => item.score))]
  .sort((a, b) => b - a)
  .map(riskCoverage);

function pct(value: number) {
  return value.toFixed(1).replace(/\.0$/, "") + "%";
}

function RiskCoverageFigure({
  metrics,
  en,
}: {
  metrics: Metrics;
  en: boolean;
}) {
  const x = (coverage: number) => 52 + coverage * 4.3;
  const y = (risk: number) => 174 - risk * 1.33;
  const points = CURVE.filter((item) => item.risk !== null);
  const line = points
    .map((item, index) => `${index === 0 ? "M" : "L"} ${x(item.coverage)} ${y(item.risk!)}`)
    .join(" ");
  return (
    <figure className="risk-lab-figure">
      <figcaption>{en ? "Risk–Coverage curve · fixed fixture" : "风险–覆盖率曲线 · 固定示例"}</figcaption>
      <svg
        viewBox="0 0 530 221"
        role="img"
        aria-label={
          en
            ? `Risk coverage plot: coverage ${pct(metrics.coverage)}, selective risk ${metrics.risk === null ? "undefined" : pct(metrics.risk)}.`
            : `风险覆盖率图：回答覆盖率 ${pct(metrics.coverage)}，选择性风险 ${metrics.risk === null ? "未定义" : pct(metrics.risk)}。`
        }
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick} className="risk-lab-grid">
            <line x1={x(0)} x2={x(100)} y1={y(tick)} y2={y(tick)} />
            <line x1={x(tick)} x2={x(tick)} y1={y(0)} y2={y(100)} />
            <text x={41} y={y(tick) + 4} textAnchor="end">{tick}</text>
            <text x={x(tick)} y={193} textAnchor="middle">{tick}</text>
          </g>
        ))}
        <path className="risk-lab-curve" d={line} />
        {points.map((point) => (
          <circle
            key={point.answered}
            className="risk-lab-curve-node"
            cx={x(point.coverage)}
            cy={y(point.risk!)}
            r={3}
          />
        ))}
        {metrics.risk !== null && (
          <g className="risk-lab-selected">
            <circle cx={x(metrics.coverage)} cy={y(metrics.risk)} r={9} />
            <circle cx={x(metrics.coverage)} cy={y(metrics.risk)} r={3} />
          </g>
        )}
        <text className="risk-lab-axis" x="267" y="215" textAnchor="middle">
          {en ? "Coverage (%)" : "回答覆盖率 (%)"}
        </text>
        <text className="risk-lab-axis" x="52" y="19">
          {en ? "Selective risk (%)" : "选择性风险 (%)"}
        </text>
      </svg>
      <p className="risk-lab-figure-note">
        {en
          ? "Each point adds one eligible example. Risk may rise or fall as coverage grows."
          : "每个点代表多接受一个示例；覆盖率上升时，风险可能升高，也可能降低。"}
      </p>
    </figure>
  );
}

/**
 * A parameterized teaching experiment attached to the existing CH04 evidence
 * lesson. Does not replace its six independent verification gates.
 */
export function ReliabilityLab({ en }: { en: boolean }) {
  const [threshold, setThreshold] = useState(70);
  const metrics = riskCoverage(threshold);
  const abstained = CASES.length - metrics.answered;
  const t = (zh: string, english: string) => (en ? english : zh);

  return (
    <section className="reliability-lab" id="risk-coverage-lab" aria-labelledby="risk-lab-title">
      <header className="risk-lab-header">
        <h4 id="risk-lab-title">{t("调节拒答阈值，观察风险与覆盖率", "Change an abstention threshold; observe risk and coverage")}</h4>
        <p>{t(
          "拖动阈值，只让得分不低于阈值的示例进入回答集合。下方曲线和逐案例结果同时更新。",
          "Move the gate. Only examples scoring at or above the threshold are answered; the curve and per-case decisions update together."
        )}</p>
      </header>

      <div className="risk-lab-controls">
        <div className="risk-lab-control-heading">
          <label htmlFor="risk-lab-threshold">{t("示例回答阈值", "Illustrative answer threshold")}</label>
          <output htmlFor="risk-lab-threshold">{(threshold / 100).toFixed(2)}</output>
        </div>
        <input
          id="risk-lab-threshold"
          className="risk-lab-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
          aria-valuetext={t("阈值 " + (threshold / 100).toFixed(2), "Threshold " + (threshold / 100).toFixed(2))}
        />
        <div className="risk-lab-limits">
          <span>{t("低阈值 · 多回答", "Lower · answer more")}</span>
          <button type="button" onClick={() => setThreshold(70)}>
            {t("恢复 0.70", "Reset to 0.70")}
          </button>
          <span>{t("高阈值 · 多拒答", "Higher · abstain more")}</span>
        </div>
      </div>

      <div className="risk-lab-measures" role="status" aria-live="polite" aria-atomic="true">
        <div><span>{t("回答覆盖率", "Coverage")}</span><strong>{pct(metrics.coverage)}</strong><small>{metrics.answered} / {CASES.length}</small></div>
        <div><span>{t("选择性风险", "Selective risk")}</span><strong>{metrics.risk === null ? "—" : pct(metrics.risk)}</strong><small>{metrics.risk === null ? t("无回答，未定义", "No answers · undefined") : t("错误 / 已回答", "Errors / answered")}</small></div>
        <div><span>{t("拒答数量", "Abstentions")}</span><strong>{abstained}</strong><small>{t("不代表正确修正", "Not corrected answers")}</small></div>
      </div>

      <div className="risk-lab-content">
        <RiskCoverageFigure metrics={metrics} en={en} />
        <div className="risk-lab-ledger">
          <h5>{t("逐案例决策", "Per-case decisions")}</h5>
          <ol aria-label={t("八个教学示例的回答状态", "Answer decisions for eight teaching examples")}>
            {CASES.map((item) => {
              const answered = item.score >= threshold;
              const outcome = answered
                ? item.correct ? t("回答 · 正确", "Answered · correct") : t("回答 · 错误", "Answered · incorrect")
                : t("拒答", "Abstained");
              return (
                <li key={item.id} data-state={answered ? item.correct ? "correct" : "incorrect" : "abstained"}>
                  <span className="risk-lab-case-id">{item.id}</span>
                  <span className="risk-lab-case-name">{en ? item.en : item.zh}</span>
                  <span className="risk-lab-case-score">{(item.score / 100).toFixed(2)}</span>
                  <strong>{outcome}</strong>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="risk-lab-boundary">
        <strong>{t("工程边界", "Engineering boundary")}</strong>
        <p>{t(
          "这 8 条得分和正确性标签均为人工构造的固定教学数据，不是校准置信度、系统实测或生产策略。阈值不能代替 ACL、来源版本、证据支持、冲突检查和高风险人工复核；零回答时 Selective Risk 未定义。提高阈值不保证风险单调下降。",
          "All eight scores and correctness labels are invented teaching data—not calibrated confidence, measured accuracy, or a production policy. A score gate never replaces ACL, version checks, evidence support, conflict handling, or human review for high-risk cases. Selective risk is undefined with zero answers; higher thresholds do not guarantee monotonically lower risk."
        )}</p>
      </div>
    </section>
  );
}
