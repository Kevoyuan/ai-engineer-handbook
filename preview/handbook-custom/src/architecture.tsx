import { BookIcon, ArrowRightIcon } from "@/components/icons";
import { chapterHref } from "./reader";
import chapters from "./chapters.json";
const lanes = [
  {
    zh: "让知识可检索",
    en: "Make knowledge retrievable",
    description: [
      "先建立检索边界，再组合检索、验证证据、处理真实文档。",
      "Establish retrieval boundaries, combine methods, verify evidence, then work with real documents.",
    ],
    items: [0, 1, 2, 3],
    note: [
      "检索 → 路由 → 证据 → 文档",
      "Retrieval → routing → evidence → documents",
    ],
  },
  {
    zh: "让 Agent 可控",
    en: "Make agents controllable",
    description: [
      "从能力与工具出发，管理上下文，再组织执行与协作。",
      "Start with skills and tools, manage context, then coordinate execution and collaboration.",
    ],
    items: [4, 5, 6],
    note: ["能力 → 状态 → 编排", "Capabilities → state → orchestration"],
  },
  {
    zh: "让系统可交付",
    en: "Make systems production-ready",
    description: [
      "用评估与观测形成反馈，再确定部署、隔离和生产边界。",
      "Close the feedback loop through evaluation and observability; define deployment, isolation and production boundaries.",
    ],
    items: [7, 8],
    note: ["评估 → 反馈 → 生产", "Evaluation → feedback → production"],
  },
];
export function Architecture({ en }: { en: boolean }) {
  const t = (zh: string, e: string) => (en ? e : zh);
  return (
    <main className="knowledge-map" id="content" tabIndex={-1}>
      <div className="map-intro">
        <span className="map-eyebrow">AI ENGINEERING · 02—10</span>
        <h1>{t("把章节放回系统里", "See how the chapters connect")}</h1>
        <p>
          {t(
            "按工程问题组织知识。沿着一条路径学习，或直接进入需要查阅的环节。",
            "Follow a learning path, or open the part of the system you need to reference.",
          )}
        </p>
      </div>
      <div className="map-lanes">
        {lanes.map((lane, i) => (
          <section className="map-lane" key={lane.en}>
            <div className="map-lane-header">
              <span className="map-lane-index">
                {["RETRIEVE", "COORDINATE", "OPERATE"][i]}
              </span>
              <h2>{en ? lane.en : lane.zh}</h2>
              <p>{lane.description[en ? 1 : 0]}</p>
            </div>
            <div className="map-track">
              {lane.items.map((index, j) => (
                <div className="map-step" key={index}>
                  <a href={chapterHref(index)}>
                    <span className="chapter-number">
                      {chapters[index].number}
                    </span>
                    <span>{en ? chapters[index].en : chapters[index].zh}</span>
                    <ArrowRightIcon />
                  </a>
                  {j < lane.items.length - 1 && (
                    <div className="map-connector" aria-hidden="true">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="map-caption">{lane.note[en ? 1 : 0]}</p>
          </section>
        ))}
      </div>
      <div className="map-footer">
        <BookIcon />
        <p>
          {t(
            "这些路径相互连接。生产评估会反过来改进检索、上下文与 Agent 的设计。",
            "These paths connect: production evaluation feeds back into retrieval, context and agent design.",
          )}
        </p>
        <a href="#home">
          {t("查看全部章节", "Browse all chapters")}
          <ArrowRightIcon />
        </a>
      </div>
    </main>
  );
}
