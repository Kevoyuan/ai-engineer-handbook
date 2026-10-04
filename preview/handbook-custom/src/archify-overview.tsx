import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";
import previewSizes from "./archify-preview-sizes.json";

/** Preview images come from the exact checked Archify HTML, not a second diagram. */
export function ArchifyOverview({ anchor, en }: { anchor: string; en: boolean }) {
  const kind = anchor === "capability-architecture-title" ? "skills" : anchor === "cross-session-memory-title" ? "memory" : null;
  if (!kind) return null;
  const language = kind === "skills" && en ? "en" : "zh";
  const source = `/diagrams/${kind}-${language}`;
  const dimensions = previewSizes[`${kind}-${language}` as keyof typeof previewSizes];
  const title = kind === "skills"
    ? (en ? "From intent to governed execution" : "从任务意图到受控执行")
    : (en ? "From memory to valid context · Chinese diagram" : "从历史记忆到有效上下文");
  const summary = kind === "skills"
    ? (en ? "Follow the main path and inspect where authorization stops execution." : "沿主线看执行过程，沿分支看授权边界与按需加载。")
    : (en ? "See which memories enter context and which are excluded." : "看清哪些记忆能进入上下文，哪些必须被排除。")
  return <figure className="archify-overview" aria-label={title}>
    <div className="archify-overview-heading">
      <div><span className="archify-kicker">{en ? "VISUAL MAP" : "可视化全景"}</span><h4>{title}</h4></div>
      <Button asChild variant="outline"><a href={source + ".html"} target="_blank" rel="noopener noreferrer">{en ? "Explore map" : "打开全景图"}<ArrowRightIcon /><span className="sr-only">{en ? " (new tab)" : "（新标签页）"}</span></a></Button>
    </div>
    <a className="archify-poster" href={source + ".html"} target="_blank" rel="noopener noreferrer" aria-label={en ? `Explore ${title} in a new tab` : `在新标签页探索${title}`}>
      <img className="archify-light" src={source + "-light.png"} alt={title} width={dimensions[0]} height={dimensions[1]} loading="lazy" />
      <img className="archify-dark" src={source + "-dark.png"} alt={title} width={dimensions[0]} height={dimensions[1]} loading="lazy" />
    </a>
    <figcaption><p>{summary}</p><span>{en ? "Open to zoom, inspect connections and export." : "打开后可缩放、查看节点关系并导出。"}</span></figcaption>
  </figure>;
}
