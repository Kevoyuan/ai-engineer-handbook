import { ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import diagrams from "./architecture-content.json";
import "./architecture-base.css";

export function Architecture({ en }: { en: boolean }) {
  const t = (zh: string, english: string) => (en ? english : zh);
  return (
    <main
      className="knowledge-map architecture-overview"
      id="content"
      tabIndex={-1}
    >
      <header className="map-intro">
        <span className="map-eyebrow">
          AI ENGINEERING · REFERENCE ARCHITECTURE
        </span>
        <h1>{t("架构总览", "Architecture overview")}</h1>
        <p>
          {t(
            "先看整个系统如何协作，再深入一次 Agent 执行。",
            "See how the system works together, then zoom into an Agent execution.",
          )}
        </p>
        <nav
          className="architecture-jumps"
          aria-label={t("架构图导航", "Diagram navigation")}
        >
          {diagrams.map((diagram, index) => (
            <Button
              key={diagram.id}
              variant="outline"
              size="sm"
              onClick={() =>
                document
                  .getElementById(diagram.id)
                  ?.scrollIntoView({ block: "start" })
              }
            >
              {index === 0
                ? t("01 · 系统总框架", "01 · System framework")
                : t("02 · Agent 运行架构", "02 · Agent runtime")}
            </Button>
          ))}
        </nav>
      </header>
      {diagrams.map((diagram) => (
        <div
          key={diagram.id + en}
          dangerouslySetInnerHTML={{ __html: diagram[en ? "en" : "zh"] }}
        />
      ))}
      <footer className="map-footer">
        <p>
          {t(
            "从图中模块进入相关章节，查看原理、实现与工程边界。",
            "Open a chapter from its system module to explore principles, implementation and engineering boundaries.",
          )}
        </p>
        <a href="#home">
          {t("查看全部章节", "Browse all chapters")}
          <ArrowRightIcon />
        </a>
      </footer>
    </main>
  );
}
