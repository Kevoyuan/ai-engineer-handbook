import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookIcon } from "@/components/icons";
import chapters from "./chapters.json";
import {
  advanceScrollChrome,
  makeScrollChromeState,
  resetScrollChrome,
} from "./reader-scroll-intent";
const JevFlowComparison = lazy(() =>
  import("./jev-flow-comparison").then((module) => ({
    default: module.JevFlowComparison,
  })),
);
const ConceptDiagram = lazy(() =>
  import("./concept-diagrams").then((module) => ({
    default: module.ConceptDiagram,
  })),
);
const VisualizationGuide = lazy(() =>
  import("./visualization-guides").then((module) => ({
    default: module.VisualizationGuide,
  })),
);
const StructuralGuide = lazy(() =>
  import("./structural-guides").then((module) => ({
    default: module.StructuralGuide,
  })),
);
const ConceptAtlasGuide = lazy(() =>
  import("./concept-atlas-guides").then((module) => ({
    default: module.ConceptAtlasGuide,
  })),
);
const hasConceptAtlasGuide = (slug: string) =>
  ["01-model-api-context-foundations", "02-enterprise-retrieval",
    "07-memory-context-engineering", "11-data-sql-engineering"].includes(slug);
const hasNewAtlasLab = (slug: string) =>
  slug === "01-model-api-context-foundations" || slug === "02-enterprise-retrieval";
const hasStructuralGuide = (slug: string) =>
  [
    "05-document-pdf-rag",
    "09-reliability-evaluation-observability",
    "12-fde-customer-delivery",
  ].includes(slug);
const hasVisualGuide = (slug: string) =>
  slug === "10-serving-deployment-ai-platform" || slug === "11-data-sql-engineering";
const hasConceptDiagram = (slug: string) =>
  [
    "03-hybrid-retrieval-query-routing",
    "04-rag-reliability-selective-answering",
    "06-skills-routing",
    "07-memory-context-engineering",
    "08-agent-orchestration",
  ].includes(slug);
class DiagramBoundary extends Component<
  { en: boolean; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="empty" role="alert">
        <p>
          {this.props.en
            ? "Interactive diagram could not load. The article remains available."
            : "交互图解暂时无法加载，正文仍可阅读。"}
        </p>
        <Button variant="outline" onClick={() => location.reload()}>
          {this.props.en ? "Reload" : "重新加载"}
        </Button>
      </div>
    );
  }
}
type Section = { id: string; zh: string; en: string };
export type ReadingContext = {
  sectionId: string;
  sectionTitle: string;
  progress: number;
  sectionIndex: number;
  sectionCount: number;
};
type ChapterContent = {
  zh: string;
  en: string;
  sections: Section[];
  supplements: string[];
};
function decodeSection(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
export function chapterHref(index: number, section = "") {
  return "#read/" + chapters[index].slug + (section ? "/" + section : "");
}
export function currentChapter() {
  const slug = location.hash.split("/")[1];
  return location.hash === "#read" || location.hash.startsWith("#read-")
    ? 0
    : chapters.findIndex((c) => c.slug === slug);
}
export function readPreference<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function Reader({
  index,
  en,
  saved,
  toggle,
  focus,
  setFocus,
  onReadingContext,
  onChromeVisible,
  chromeVisible,
  onToggleTheme,
  dark,
  darkPreset,
  onSetDarkPreset,
}: {
  index: number;
  en: boolean;
  saved: boolean;
  toggle: () => void;
  focus: boolean;
  setFocus: (value: boolean) => void;
  onReadingContext?: (value: ReadingContext) => void;
  onChromeVisible?: (visible: boolean) => void;
  chromeVisible: boolean;
  onToggleTheme: () => void;
  dark: boolean;
  darkPreset: "graphite" | "ink" | "forest";
  onSetDarkPreset: (preset: "graphite" | "ink" | "forest") => void;
}) {
  const t = (zh: string, e: string) => (en ? e : zh);
  const chapter = chapters[index];
  const pane = useRef<HTMLDivElement>(null);
  const chromeMotion = useRef(makeScrollChromeState());
  const [moreOpen, setMoreOpen] = useState(false);
  const [topActionsTarget, setTopActionsTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTopActionsTarget(document.getElementById("reader-top-actions"));
  }, []);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function scrollPane() {
    return mobile
      ? pane.current?.closest<HTMLElement>(".workspace")
      : pane.current;
  }
  // The app shell can reveal chrome via keyboard focus or pointer entry.
  // Synchronize that external change without reinstalling a scroll listener.
  useEffect(() => {
    if (chromeMotion.current.visible !== chromeVisible) {
      resetScrollChrome(
        chromeMotion.current,
        scrollPane()?.scrollTop ?? 0,
        chromeVisible,
        performance.now(),
      );
    }
  }, [chromeVisible]);
  const [data, setData] = useState<ChapterContent | null>(null),
    [diagramReady, setDiagramReady] = useState(false),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0),
    [tocOpen, setTocOpen] = useState(false),
    [active, setActive] = useState(""),
    [progress, setProgress] = useState(0),
    [size, setSize] = useState(() =>
      readPreference("handbook-reading-size", 16),
    );
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setDiagramReady(false);
    setError(false);
    setActive("");
    setProgress(0);
    resetScrollChrome(chromeMotion.current, 0, true, performance.now());
    onChromeVisible?.(true);
    fetch("/content/" + chapter.slug + ".json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Chapter unavailable");
        return r.json();
      })
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [chapter.slug, attempt]);
  const html = useMemo(() => data?.[en ? "en" : "zh"] || "", [data, en]);
  // Concept-card grids and comparison tables are authored at fixed column
  // counts that crush each cell inside the reading measure. Without touching
  // the chapter JSON we annotate plain header-row tables so the stylesheet can
  // stack them into labeled semantic records on narrow containers, and let
  // card grids wrap. Only real diagram matrices are excluded: .interp-matrix
  // is a scrollable comparison-table wrapper (CH02/CH03), not a diagram, so it
  // must be stacked too. This is presentation-only: no new storage key, route,
  // or content change. Header text is read from the locale-correct DOM.
  useEffect(() => {
    const root = pane.current?.querySelector<HTMLElement>(".canonical-content");
    if (!root) return;
    root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      if (table.closest(".dg2-matrix, .dg2-pyramid, .bfs-g3, .bfs-g4, .bfs-g5, .bfs-g6, .cv-stats"))
        return;
      const thead = table.querySelector("thead");
      const headers = thead
        ? Array.from(thead.querySelectorAll<HTMLTableCellElement>("th"))
        : [];
      if (!headers.length) return;
      table.classList.add("stack-table");
      const body = table.querySelector("tbody") ?? table;
      body.querySelectorAll<HTMLTableRowElement>("tr").forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll<HTMLTableCellElement>("td"));
        cells.forEach((cell, i) => {
          const label = (headers[Math.min(i, headers.length - 1)]?.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
          if (label && !cell.getAttribute("data-label")) cell.setAttribute("data-label", label);
        });
      });
    });
  }, [html, data, en, chapter.slug]);
  function jump(id: string) {
    const target = pane.current?.querySelector<HTMLElement>(
      '[id="' + CSS.escape(id) + '"]',
    );
    const scroller = scrollPane();
    if (target && scroller) {
      scroller.scrollTop +=
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        (mobile ? 60 : 64);
      // Programmatic jumps are not a swipe; start new intent from this offset.
      resetScrollChrome(chromeMotion.current, scroller.scrollTop, true, performance.now());
      onChromeVisible?.(true);
      setActive(id);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
  useEffect(() => {
    if (!data) return;
    const restore = () => {
      const section = location.hash.startsWith("#read-")
        ? location.hash.replace(/^#read-/, "")
        : location.hash.split("/")[2] || "";
      if (location.hash.includes("/") && section) jump(decodeSection(section));
      else if (location.hash.startsWith("#read-")) jump(section);
      else scrollPane()?.scrollTo({ top: 0 });
    };
    restore();
    const restoreFrame = requestAnimationFrame(restore);
    const w = window as unknown as { initHandbookInteractions?: () => void };
    w.initHandbookInteractions?.();
    const onHash = () => {
      const id = location.hash.split("/")[2];
      if (id) jump(decodeSection(id));
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(restoreFrame);
      window.removeEventListener("hashchange", onHash);
    };
  }, [data, en, chapter.slug, mobile]);
  // The interactive lesson mounts asynchronously after chapter HTML.
  // A direct Atlas link must resolve only after the concept-demo anchor exists.
  useEffect(() => {
    if (!data || !diagramReady || !(hasConceptDiagram(chapter.slug) || hasVisualGuide(chapter.slug) || hasStructuralGuide(chapter.slug) || hasNewAtlasLab(chapter.slug))) return;
    if (location.hash.split("/")[2] !== "concept-demo") return;
    const frame = requestAnimationFrame(() => jump("concept-demo"));
    return () => cancelAnimationFrame(frame);
  }, [data, diagramReady, chapter.slug, mobile]);
  useEffect(() => {
    try {
      localStorage.setItem("handbook-reading-size", JSON.stringify(size));
    } catch {}
  }, [size]);
  useEffect(() => {
    if (!data || !pane.current) return;
    const el = scrollPane();
    if (!el) return;
    // Viewport breakpoint/dialog changes can switch scroll owners.
    resetScrollChrome(
      chromeMotion.current,
      el.scrollTop,
      chromeMotion.current.visible,
      performance.now(),
    );
    const update = () => {
      let current = data.sections[0]?.id || "";
      for (const s of data.sections) {
        const node = el.querySelector<HTMLElement>(
          '[id="' + CSS.escape(s.id) + '"]',
        );
        if (
          node &&
          node.getBoundingClientRect().top <=
            el.getBoundingClientRect().top + 80
        )
          current = s.id;
      }
      setActive(current);
      const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
      const nextProgress = Math.max(
        0,
        Math.min(100, Math.round((el.scrollTop / maxScroll) * 100)),
      );
      setProgress((value) => (value === nextProgress ? value : nextProgress));
      const nextVisible = advanceScrollChrome(
        chromeMotion.current,
        el.scrollTop,
        performance.now(),
        moreOpen || tocOpen,
      );
      if (nextVisible !== null) onChromeVisible?.(nextVisible);
    };
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", update);
    };
  }, [data, chapter.slug, mobile, moreOpen, tocOpen, onChromeVisible]);
  useEffect(() => {
    if (moreOpen || tocOpen) onChromeVisible?.(true);
  }, [moreOpen, tocOpen, onChromeVisible]);
  useEffect(() => {
    if (!data || !onReadingContext) return;
    const sectionIndex = Math.max(
      0,
      data.sections.findIndex((section) => section.id === active),
    );
    const section = data.sections[sectionIndex];
    onReadingContext({
      sectionId: active,
      sectionTitle: section ? (en ? section.en : section.zh) : "",
      progress,
      sectionIndex,
      sectionCount: data.sections.length,
    });
  }, [active, progress, data, en, onReadingContext]);
  const sectionLink = (s: Section) => (
    <a
      key={s.id}
      href={chapterHref(index, s.id)}
      aria-current={active === s.id ? "location" : undefined}
      onClick={() => {
        setTocOpen(false);
        jump(s.id);
      }}
    >
      {en ? s.en : s.zh}
    </a>
  );
  return (
    <main id="content" className="reader-layout" tabIndex={-1}>
      {topActionsTarget &&
        createPortal(
          <>
            <Button
              variant="ghost"
              size="icon"
              className="reader-toc-top"
              onClick={() => { onChromeVisible?.(true); setTocOpen(true); }}
              aria-label={t("本页目录", "On this page")}
              title={t("本页目录", "On this page")}
            >
              <BookIcon />
            </Button>
            <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("更多阅读设置", "More reading controls")}
                  title={t("更多阅读设置", "More reading controls")}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="reader-overflow-menu">
                <DropdownMenuLabel>{t("阅读设置", "Reading settings")}</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={size <= 14}
                  onSelect={() => setSize((value) => Math.max(14, value - 1))}
                >
                  {t("缩小字号", "Decrease text size")} · A−
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={size >= 20}
                  onSelect={() => setSize((value) => Math.min(20, value + 1))}
                >
                  {t("放大字号", "Increase text size")} · A+
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFocus(!focus)}>
                  {focus ? t("退出专注", "Exit focus") : t("专注阅读", "Focus reading")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toggle}>
                  {saved ? t("取消收藏章节", "Remove chapter bookmark") : t("收藏章节", "Save chapter")}
                </DropdownMenuItem>
                {(hasConceptDiagram(chapter.slug) || hasVisualGuide(chapter.slug)) && (
                  <DropdownMenuItem
                    disabled={!diagramReady}
                    onSelect={() => { onChromeVisible?.(true); jump("concept-demo"); }}
                  >
                    {t("交互图解", "Interactive diagram")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onToggleTheme}>
                  {dark ? t("浅色模式", "Light theme") : t("深色模式", "Dark theme")}
                </DropdownMenuItem>
                {mobile && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t("深色底色", "Dark surface")}</DropdownMenuLabel>
                    {([
                      ["graphite", "深灰", "Graphite"],
                      ["ink", "纯黑", "Ink black"],
                      ["forest", "墨绿", "Evergreen"],
                    ] as const).map(([preset, zh, english]) => (
                      <DropdownMenuItem key={preset} onSelect={() => onSetDarkPreset(preset)}>
                        {t(zh, english)}{dark && darkPreset === preset ? " ✓" : ""}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="https://github.com/kevoyuan/ai-engineer-handbook"
                         target="_blank" rel="noopener noreferrer">
                        {t("在 GitHub 上查看", "View on GitHub")}
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>,
          topActionsTarget,
        )}
      <article className="reader">
        <h1 className="sr-only">{en ? chapter.en : chapter.zh}</h1>
        <div
          ref={pane}
          className="chapter-body"
          tabIndex={0}
          role="region"
          aria-label={t("章节正文", "Chapter content")}
          style={{ fontSize: size / 16 + "rem" }}
        >
          {error ? (
            <div className="empty" role="alert">
              <h2>{t("章节加载失败", "Chapter could not load")}</h2>
              <p>
                {t(
                  "请检查连接后重试。",
                  "Check your connection and try again.",
                )}
              </p>
              <Button onClick={() => setAttempt((x) => x + 1)}>
                {t("重试", "Retry")}
              </Button>
            </div>
          ) : !data ? (
            <div className="chapter-loading" role="status">
              <span className="loading-dot" />
              {t("正在加载章节…", "Loading chapter…")}
            </div>
          ) : (
            <div
              className="canonical-content"
              key={chapter.slug + (en ? "en" : "zh")}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
          {data && !error && chapter.slug === "06-skills-routing" && (
            <DiagramBoundary key={"jev-" + en} en={en}>
              <Suspense fallback={null}>
                <JevFlowComparison en={en} pane={pane} />
              </Suspense>
            </DiagramBoundary>
          )}
          {data && !error && hasConceptDiagram(chapter.slug) && (
            <DiagramBoundary key={chapter.slug + en} en={en}>
              <Suspense fallback={null}>
                <ConceptDiagram
                  key={chapter.slug + en}
                  slug={chapter.slug}
                  en={en}
                  pane={pane}
                  onReady={setDiagramReady}
                />
              </Suspense>
            </DiagramBoundary>
          )}
          {data && !error && hasVisualGuide(chapter.slug) && (
            <DiagramBoundary key={"visual-guide-" + chapter.slug + en} en={en}>
              <Suspense fallback={null}>
                <VisualizationGuide
                  key={chapter.slug + en}
                  slug={chapter.slug}
                  en={en}
                  pane={pane}
                  onReady={setDiagramReady}
                />
              </Suspense>
            </DiagramBoundary>
          )}
          {data && !error && hasConceptAtlasGuide(chapter.slug) && (
            <DiagramBoundary key={"concept-atlas-" + chapter.slug + en} en={en}>
              <Suspense fallback={null}>
                <ConceptAtlasGuide
                  key={chapter.slug + en}
                  slug={chapter.slug}
                  en={en}
                  pane={pane}
                  onReady={hasNewAtlasLab(chapter.slug) ? setDiagramReady : undefined}
                />
              </Suspense>
            </DiagramBoundary>
          )}
          {data && !error && hasStructuralGuide(chapter.slug) && (
            <DiagramBoundary key={"structural-guide-" + chapter.slug + en} en={en}>
              <Suspense fallback={null}>
                <StructuralGuide
                  key={chapter.slug + en}
                  slug={chapter.slug}
                  en={en}
                  pane={pane}
                  onReady={setDiagramReady}
                />
              </Suspense>
            </DiagramBoundary>
          )}
          {data && !error && (
            <nav className="reader-bottom" aria-label={t("章节翻页", "Chapter pagination")}>
              <div className="reader-bottom-caption">
                <span>{t("阅读路径 / 章节导航", "READING PATH / CHAPTERS")}</span>
                <span className="chapter-page-count" aria-label={t(
                  `第 ${index + 1} 章，共 ${chapters.length} 章`,
                  `Chapter ${index + 1} of ${chapters.length}`,
                )}>
                  {String(index + 1).padStart(2, "0")}
                  <span aria-hidden="true"> / </span>
                  {String(chapters.length).padStart(2, "0")}
                </span>
              </div>
              <div className="reader-bottom-links">
                <a
                  className="reader-bottom-link reader-bottom-prev"
                  href={index > 0 ? chapterHref(index - 1) : "#home/all"}
                  aria-label={index > 0
                    ? t(`上一章：${chapters[index - 1].zh}`, `Previous chapter: ${chapters[index - 1].en}`)
                    : t("返回知识图谱", "Back to Atlas")}
                >
                  <span className="reader-bottom-arrow" aria-hidden="true">←</span>
                  <span className="reader-bottom-copy">
                    <span className="reader-bottom-direction">
                      {index > 0 ? t("上一章", "Previous chapter") : t("返回目录", "Back to contents")}
                    </span>
                    <strong className="reader-bottom-title">
                      {index > 0
                        ? en ? chapters[index - 1].en : chapters[index - 1].zh
                        : "Atlas"}
                    </strong>
                  </span>
                </a>
                <a
                  className="reader-bottom-link reader-bottom-next"
                  href={index < chapters.length - 1 ? chapterHref(index + 1) : "#home/all"}
                  aria-label={index < chapters.length - 1
                    ? t(`下一章：${chapters[index + 1].zh}`, `Next chapter: ${chapters[index + 1].en}`)
                    : t("返回知识图谱", "Back to Atlas")}
                >
                  <span className="reader-bottom-copy">
                    <span className="reader-bottom-direction">
                      {index < chapters.length - 1 ? t("下一章", "Next chapter") : t("返回目录", "Back to contents")}
                    </span>
                    <strong className="reader-bottom-title">
                      {index < chapters.length - 1
                        ? en ? chapters[index + 1].en : chapters[index + 1].zh
                        : "Atlas"}
                    </strong>
                  </span>
                  <span className="reader-bottom-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </nav>
          )}
        </div>
      </article>
      <Dialog open={tocOpen} onOpenChange={setTocOpen}>
        <DialogContent
          closeLabel={t("关闭", "Close")}
          className="reader-toc-dialog"
        >
          <DialogTitle>{t("本页目录", "On this page")}</DialogTitle>
          <DialogDescription>
            {t(
              "选择段落，直接定位到正文。",
              "Choose a section to jump to its content.",
            )}
          </DialogDescription>
          <nav>{data?.sections.map(sectionLink)}</nav>
          <Button
            variant="ghost"
            onClick={() => {
              setTocOpen(false);
              scrollPane()?.scrollTo({ top: 0 });
            }}
          >
            {t("回到顶部", "Back to top")}
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
