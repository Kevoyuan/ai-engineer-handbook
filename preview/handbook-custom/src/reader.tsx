import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookIcon, BookmarkIcon, ArrowRightIcon } from "@/components/icons";
import chapters from "./chapters.json";
type Section = { id: string; zh: string; en: string };
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
}: {
  index: number;
  en: boolean;
  saved: boolean;
  toggle: () => void;
  focus: boolean;
  setFocus: (value: boolean) => void;
}) {
  const t = (zh: string, e: string) => (en ? e : zh);
  const chapter = chapters[index];
  const pane = useRef<HTMLDivElement>(null);
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
  const [data, setData] = useState<ChapterContent | null>(null),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0),
    [tocOpen, setTocOpen] = useState(false),
    [active, setActive] = useState(""),
    [size, setSize] = useState(() =>
      readPreference("handbook-reading-size", 16),
    );
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(false);
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
        16;
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
    const w = window as unknown as { initHandbookInteractions?: () => void };
    w.initHandbookInteractions?.();
    const onHash = () => {
      const id = location.hash.split("/")[2];
      if (id) jump(decodeSection(id));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [data, en, chapter.slug, mobile]);
  useEffect(() => {
    try {
      localStorage.setItem("handbook-reading-size", JSON.stringify(size));
    } catch {}
  }, [size]);
  useEffect(() => {
    if (!data || !pane.current) return;
    const el = scrollPane();
    if (!el) return;
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
    };
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", update);
    };
  }, [data, chapter.slug, mobile]);
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
      <article className="reader">
        <div className="reader-heading">
          <div className="reader-eyebrow">
            <span>
              {t("第 " + chapter.number + " 章", "Chapter " + chapter.number)}
            </span>
          </div>
          <h1>{en ? chapter.en : chapter.zh}</h1>
          <div className="reader-actions">
            <div className="reader-tools">
              <Button
                variant="outline"
                className="reader-toc-button"
                onClick={() => setTocOpen(true)}
              >
                <BookIcon />
                {t("本页目录", "On this page")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSize((s) => Math.max(14, s - 1))}
                disabled={size <= 14}
                aria-label={t("缩小字号", "Decrease text size")}
              >
                A−
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSize((s) => Math.min(20, s + 1))}
                disabled={size >= 20}
                aria-label={t("放大字号", "Increase text size")}
              >
                A+
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocus(!focus)}
                aria-pressed={focus}
              >
                {focus ? t("退出专注", "Exit focus") : t("专注阅读", "Focus")}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-pressed={saved}
            >
              <BookmarkIcon />
              {saved ? t("已收藏", "Saved") : t("收藏章节", "Save chapter")}
            </Button>
          </div>
        </div>
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
      <nav className="toc" aria-label={t("本页目录", "On this page")}>
        <h2>{t("本页目录", "On this page")}</h2>
        {data?.sections.map(sectionLink)}
        <Button
          variant="ghost"
          onClick={() => {
            if (pane.current) pane.current.scrollTo({ top: 0 });
          }}
        >
          {t("回到顶部 ↑", "Back to top ↑")}
        </Button>
      </nav>
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
        </DialogContent>
      </Dialog>
    </main>
  );
}
