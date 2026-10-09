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
import { BookIcon, BookmarkIcon, ArrowRightIcon } from "@/components/icons";
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
    if (!data || !diagramReady || !(hasConceptDiagram(chapter.slug) || hasVisualGuide(chapter.slug) || hasStructuralGuide(chapter.slug))) return;
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
            <nav
              className="reader-bottom"
              aria-label={t("章节翻页", "Chapter pagination")}
            >
              {index > 0 ? (
                <Button asChild variant="outline">
                  <a href={chapterHref(index - 1)}>
                    <span aria-hidden="true">←</span>
                    {t("上一章", "Previous")}
                  </a>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <a href="#home">{t("返回目录", "Contents")}</a>
                </Button>
              )}
              <span className="chapter-page-count">
                {index + 1} / {chapters.length}
              </span>
              {index < chapters.length - 1 ? (
                <Button asChild>
                  <a href={chapterHref(index + 1)}>
                    {t("下一章", "Next")}
                    <ArrowRightIcon />
                  </a>
                </Button>
              ) : (
                <Button asChild>
                  <a href="#home">
                    {t("返回目录", "Contents")}
                    <BookIcon />
                  </a>
                </Button>
              )}
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
