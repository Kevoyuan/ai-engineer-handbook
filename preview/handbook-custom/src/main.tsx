import React, { useState, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
} from "@/components/ui/sidebar";
import {
  BookIcon,
  SearchIcon,
  ArrowRightIcon,
  SunLightIcon,
  HalfMoonIcon,
  MenuIcon,
  CancelIcon,
  LanguageIcon,
  BookmarkIcon,
  GithubIcon,
} from "@/components/icons";
import chapters from "./chapters.json";
type SearchEntry = {
  titleZh: string;
  titleEn: string;
  textZh: string;
  textEn: string;
  href: string;
};
import { Reader, chapterHref, currentChapter } from "./reader";
import { Architecture } from "./architecture";
import "./content-base.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import "./handbook.css";
import "./architecture.css";
const groups = [
  {
    id: "model",
    label: "MODEL",
    zh: "模型基础",
    en: "Model foundations",
    descriptionZh: "理解模型、API 与上下文的基本约束。",
    descriptionEn: "Understand the constraints of models, APIs, and context.",
    range: [0, 1],
  },
  {
    id: "retrieval",
    label: "RETRIEVAL",
    zh: "检索与 RAG",
    en: "Retrieval & RAG",
    descriptionZh: "从检索路径进入可靠、可追溯的知识系统。",
    descriptionEn: "Move from retrieval paths to reliable, traceable knowledge systems.",
    range: [1, 5],
  },
  {
    id: "agent",
    label: "AGENT",
    zh: "Agent 工程",
    en: "Agent engineering",
    descriptionZh: "组织工具、记忆与执行循环，让智能行为可控。",
    descriptionEn: "Coordinate tools, memory, and execution loops into controlled behavior.",
    range: [5, 8],
  },
  {
    id: "production",
    label: "PRODUCTION",
    zh: "评估与生产",
    en: "Evaluation & production",
    descriptionZh: "用评估、观测与平台能力把系统送进生产。",
    descriptionEn: "Move systems into production with evaluation, observability, and platform controls.",
    range: [8, 10],
  },
];
const interactiveChapterNumbers = new Set(["03", "04", "06", "07", "08"]);
const descriptions = [
  [
    "理解 Generation、Token、Context、Sampling、Embedding、Adaptation 与模型迁移。",
    "Understand generation, tokens, context, sampling, embeddings, adaptation, and model migration.",
  ],
  [
    "理解 Exact、BM25、Dense、Graph 与元数据过滤的边界。",
    "Understand Exact, BM25, Dense, Graph and metadata filtering.",
  ],
  [
    "组合词法与语义检索，为不同问题选择合适的路径。",
    "Combine lexical and semantic retrieval with query routing.",
  ],
  [
    "衡量证据质量，在回答与拒答之间做可靠决策。",
    "Assess evidence and decide when to answer or abstain.",
  ],
  [
    "从解析、分块到引用，构建可追溯的文档问答。",
    "Build traceable document Q&A from parsing to citations.",
  ],
  [
    "组织可复用能力，让任务找到合适的工具与执行方式。",
    "Organize reusable skills, tools and task routing.",
  ],
  [
    "管理工作状态、长期记忆与上下文预算。",
    "Manage working state, long-term memory and context budgets.",
  ],
  [
    "设计执行循环、工作流与多 Agent 协作。",
    "Design execution loops, workflows and multi-agent collaboration.",
  ],
  [
    "用评估、追踪与监控验证系统的真实表现。",
    "Verify system behavior through evaluation, tracing and monitoring.",
  ],
  [
    "理解推理服务、缓存、隔离与生产控制面。",
    "Explore serving, caching, isolation and production control planes.",
  ],
];
const terms = [
  "Tokenization",
  "Context Window",
  "Structured Output",
  "BM25",
  "Hybrid Search",
  "Query Routing",
  "RAG",
  "Memory",
  "Agent",
  "Evaluation",
  "KV Cache",
];
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function App() {
  const [en, setEn] = useState(() => read("preview-locale", false)),
    [dark, setDark] = useState(() =>
      read("preview-theme", matchMedia("(prefers-color-scheme: dark)").matches),
    );
  const [page, setPage] = useState(() =>
    location.hash.startsWith("#read")
      ? "reader"
      : location.hash === "#map"
        ? "map"
        : "home",
  );
  const [chapterIndex, setChapterIndex] = useState(currentChapter);
  useEffect(() => {
    if (matchMedia("(max-width: 767px)").matches)
      document.querySelector(".workspace")?.scrollTo({ top: 0 });
  }, [page, chapterIndex]);
  const [focus, setFocus] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    read("handbook-sidebar-collapsed", false),
  );
  useEffect(() => {
    document.documentElement.classList.toggle(
      "sidebar-collapsed",
      sidebarCollapsed,
    );
    save("handbook-sidebar-collapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);
  useEffect(() => {
    const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const reveal = (event: Event) => {
      const element =
        event.target instanceof HTMLElement
          ? event.target
          : (document.scrollingElement as HTMLElement | null);
      if (!element) return;
      element.dataset.scrolling = "true";
      clearTimeout(timers.get(element));
      timers.set(
        element,
        setTimeout(() => {
          delete element.dataset.scrolling;
          timers.delete(element);
        }, 1000),
      );
    };
    document.addEventListener("scroll", reveal, true);
    return () => {
      document.removeEventListener("scroll", reveal, true);
      for (const [element, timer] of timers) {
        clearTimeout(timer);
        delete element.dataset.scrolling;
      }
    };
  }, []);
  const [filter, setFilter] = useState(() =>
      location.hash.split("/")[0] === "#home"
        ? location.hash.split("/")[1] || "all"
        : "all",
    ),
    [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]),
    [indexStatus, setIndexStatus] = useState<
      "idle" | "loading" | "ready" | "error"
    >("idle");
  const [saved, setSaved] = useState<string[]>(() =>
    read("preview-bookmarks", []),
  );
  const [resultLimit, setResultLimit] = useState(15);
  useEffect(() => setResultLimit(15), [query]);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const t = (zh: string, enText: string) => (en ? enText : zh);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    save("preview-theme", dark);
  }, [dark]);
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "zh-CN";
    document.documentElement.dataset.lang = en ? "en" : "zh";
    save("preview-locale", en);
  }, [en]);
  useEffect(() => {
    const hash = () => {
      setPage(
        location.hash.startsWith("#read")
          ? "reader"
          : location.hash === "#map"
            ? "map"
            : "home",
      );
      setChapterIndex(currentChapter());
      if (location.hash.startsWith("#home"))
        setFilter(location.hash.split("/")[1] || "all");
      setMenu(false);
    };
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !e.isComposing) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const navigate = (p: string) => {
    location.hash = p === "reader" ? "read" : "home";
    setPage(p);
    setMenu(false);
    document.querySelector(".catalog-scroll")?.scrollTo({ top: 0 });
    document.querySelector(".chapter-body")?.scrollTo({ top: 0 });
  };
  const openChapter = (i: number) => {
    location.hash = chapterHref(i);
    setMenu(false);
  };
  useEffect(() => {
    const title =
      page === "reader"
        ? chapters[chapterIndex]
          ? en
            ? chapters[chapterIndex].en
            : chapters[chapterIndex].zh
          : t("找不到章节", "Chapter not found")
        : page === "map"
          ? t("知识地图", "Knowledge map")
          : filter === "saved"
            ? t("我的收藏", "Saved chapters")
            : t("手册目录", "Contents");
    document.title =
      title + " · " + t("AI 工程图谱", "AI Engineering Atlas");
    document.documentElement.classList.toggle(
      "focus-reading",
      focus && page === "reader",
    );
  }, [page, chapterIndex, en, filter, focus]);
  const toggleSave = (slug: string) => {
    const next = saved.includes(slug)
      ? saved.filter((x) => x !== slug)
      : [...saved, slug];
    setSaved(next);
    const persisted = save("preview-bookmarks", next);
    setNoticeError(!persisted);
    setNotice(
      persisted
        ? next.includes(slug)
          ? t("已收藏章节", "Chapter saved")
          : t("已取消收藏", "Chapter removed from saved")
        : t(
            "当前浏览器无法保存收藏；本次访问仍可使用。",
            "This browser cannot save bookmarks. They remain available during this visit.",
          ),
    );
  };
  const searchRequest = useRef<AbortController | null>(null);
  const loadSearchIndex = () => {
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setIndexStatus("loading");
    fetch("/content/search-index.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Search unavailable");
        return response.json();
      })
      .then((entries: SearchEntry[]) => {
        if (controller.signal.aborted) return;
        setSearchIndex(entries);
        setIndexStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setIndexStatus("error");
      });
  };
  useEffect(() => {
    if (searchOpen && indexStatus === "idle") loadSearchIndex();
  }, [searchOpen]);
  useEffect(() => () => searchRequest.current?.abort(), []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? searchIndex.filter((x) =>
          (x.titleZh + " " + x.titleEn + " " + x.textZh + " " + x.textEn)
            .toLowerCase()
            .includes(q),
        )
      : [];
  }, [query, searchIndex]);
  const search = (q = "") => {
    setQuery(q);
    setSearchOpen(true);
  };
  const nav = (
    <Sidebar className="chapter-sidebar">
      <SidebarHeader>
        <a className="brand" href="#home" onClick={() => navigate("home")}>
          <span className="brand-mark">
            <BookIcon />
          </span>
          <span>
            {t("AI 工程图谱", "AI Engineering Atlas")}
            <span className="brand-en">
              {t("工程知识系统", "Engineering knowledge system")}
            </span>
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarItem
            active={page === "home" && filter !== "saved"}
            onClick={() => {
              location.hash = "home/all";
            }}
          >
            <BookIcon />
            {t("知识图谱", "Atlas")}
          </SidebarItem>
          <SidebarItem
            active={page === "home" && filter === "saved"}
            onClick={() => {
              location.hash = "home/saved";
            }}
          >
            <BookmarkIcon />
            {t("笔记", "Notebook")}
            {saved.length > 0 && (
              <span className="ml-auto">{saved.length}</span>
            )}
          </SidebarItem>
        </SidebarGroup>
        {groups.map((g) => (
          <SidebarGroup key={g.en}>
            <SidebarGroupLabel>{en ? g.en : g.zh}</SidebarGroupLabel>
            {chapters.slice(...(g.range as [number, number])).map((ch) => (
              <SidebarItem
                key={ch.slug}
                active={
                  page === "reader" && chapters[chapterIndex]?.slug === ch.slug
                }
                onClick={() => openChapter(chapters.indexOf(ch))}
              >
                <span className="chapter-num">{ch.number}</span>
                <span>{en ? ch.en : ch.zh}</span>
              </SidebarItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <a href="#map" className="preview-caption">
          {t("系统架构", "System architecture")}
        </a>
      </SidebarFooter>
    </Sidebar>
  );
  return (
    <>
      <a href="#content" className="skip">
        {t("跳到正文", "Skip to content")}
      </a>
      <div
        className={noticeError ? "bookmark-status" : "sr-only"}
        role="status"
        aria-live="polite"
      >
        {notice}
      </div>
      <div className="desktop-nav" id="desktop-chapter-nav">
        {nav}
      </div>
      <div className="workspace">
        <header className="topbar">
          <div className="top-location">
            <Button
              variant="ghost"
              size="icon"
              className="desktop-sidebar-toggle"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-controls="desktop-chapter-nav"
              aria-expanded={!sidebarCollapsed}
              aria-label={
                sidebarCollapsed
                  ? t("展开侧边栏", "Expand sidebar")
                  : t("收起侧边栏", "Collapse sidebar")
              }
              title={
                sidebarCollapsed
                  ? t("展开侧边栏", "Expand sidebar")
                  : t("收起侧边栏", "Collapse sidebar")
              }
            >
              <MenuIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              onClick={() => setMenu(true)}
              aria-label={t("打开章节导航", "Open chapter navigation")}
            >
              <MenuIcon />
            </Button>
            <span>
              {page === "home"
                ? filter === "saved"
                  ? t("笔记", "Notebook")
                  : t("知识图谱", "Atlas")
                : page === "map"
                  ? t("系统架构", "System architecture")
                  : chapters[chapterIndex]
                    ? en
                      ? chapters[chapterIndex].en
                      : chapters[chapterIndex].zh
                    : t("找不到章节", "Chapter not found")}
            </span>
            {page === "reader" && (
              <>
                <span className="crumb-slash">/</span>
                <span>{chapters[chapterIndex]?.number}</span>
              </>
            )}
          </div>
          <div className="top-actions">
            <Button
              variant="ghost"
              className="header-search"
              aria-label={t("搜索知识系统", "Search the atlas")}
              onClick={() => search()}
            >
              <SearchIcon />
              <span>{t("搜索图谱", "Search atlas")}</span>
              <kbd>⌘ K</kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark(!dark)}
              aria-label={
                dark
                  ? t("切换浅色模式", "Switch to light mode")
                  : t("切换深色模式", "Switch to dark mode")
              }
              title={t("切换明暗主题", "Toggle theme")}
            >
              {dark ? <SunLightIcon /> : <HalfMoonIcon />}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEn(!en)}
              aria-label={en ? "切换为中文" : "Switch to English"}
            >
              <LanguageIcon />
              {en ? "中文" : "EN"}
            </Button>
            <Button asChild variant="ghost" size="icon">
              <a
                href="https://github.com/kevoyuan/ai-engineer-handbook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("在 GitHub 上查看", "View on GitHub")}
                title={t("在 GitHub 上查看", "View on GitHub")}
              >
                <GithubIcon aria-hidden="true" />
              </a>
            </Button>
          </div>
        </header>
        {page === "home" ? (
          filter === "saved" ? (
            <main id="content" className="notebook-page" tabIndex={-1}>
              <div className="notebook-shell">
                <header className="notebook-header">
                  <p className="atlas-eyebrow">NOTEBOOK / SAVED KNOWLEDGE</p>
                  <h1>{t("笔记", "Notebook")}</h1>
                  <p>
                    {t(
                      "把需要反复查阅的章节留在这里。第一阶段保留章节级收藏，后续再扩展到段落与概念。",
                      "Keep the chapters you return to here. Phase one preserves chapter bookmarks; section and concept saves come next.",
                    )}
                  </p>
                </header>
                {saved.length === 0 ? (
                  <div className="empty notebook-empty">
                    <BookmarkIcon />
                    <h3>{t("还没有收藏", "Nothing saved yet")}</h3>
                    <p>
                      {t(
                        "在 Atlas 或 Reader 中收藏章节，它会出现在这里。",
                        "Save a chapter from the Atlas or Reader and it will appear here.",
                      )}
                    </p>
                    <Button asChild variant="outline">
                      <a href="#home/all">{t("返回 Atlas", "Back to Atlas")}</a>
                    </Button>
                  </div>
                ) : (
                  <div className="notebook-groups">
                    {groups.map((g) => {
                      const list = chapters
                        .slice(...(g.range as [number, number]))
                        .filter((ch) => saved.includes(ch.slug));
                      if (!list.length) return null;
                      return (
                        <section className="notebook-group" key={g.id}>
                          <header>
                            <span>{g.label}</span>
                            <h2>{en ? g.en : g.zh}</h2>
                          </header>
                          <div>
                            {list.map((ch) => {
                              const i = chapters.indexOf(ch);
                              return (
                                <div className="notebook-row" key={ch.slug}>
                                  <a href={chapterHref(i)}>
                                    <span>{ch.number}</span>
                                    <strong>{en ? ch.en : ch.zh}</strong>
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="is-saved"
                                    onClick={() => toggleSave(ch.slug)}
                                    aria-label={t(
                                      `取消收藏 ${ch.zh}`,
                                      `Remove ${ch.en} from notebook`,
                                    )}
                                  >
                                    <BookmarkIcon />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          ) : (
            <main id="content" className="atlas-page" tabIndex={-1}>
              <div className="atlas-shell">
                <header className="atlas-intro">
                  <p className="atlas-eyebrow">AI ENGINEERING / SYSTEM MAP</p>
                  <h1>
                    {t(
                      "把 AI 工程当作一个系统来理解。",
                      "Understand AI engineering as a system.",
                    )}
                  </h1>
                  <p className="atlas-lede">
                    {t(
                      "不是按顺序翻完十章，而是看清模型、检索、Agent 与生产系统之间为什么会连在一起。",
                      "Do not just read ten chapters in order. See why models, retrieval, agents, and production systems connect.",
                    )}
                  </p>
                  <div className="atlas-search">
                    <div className="search-button">
                      <SearchIcon />
                      <button
                        type="button"
                        className="entry-search-trigger"
                        onClick={() => search()}
                        aria-label={t("搜索知识系统", "Search the atlas")}
                      >
                        <span>
                          {t(
                            "搜索概念、方法或工程问题…",
                            "Search concepts, methods, or engineering questions…",
                          )}
                        </span>
                      </button>
                      <kbd>⌘ K</kbd>
                    </div>
                    <div className="popular">
                      <span>{t("快速定位", "Quick find")}</span>
                      {["BM25", "RAG", "Agent", "Memory"].map((q) => (
                        <Button
                          variant="link"
                          size="sm"
                          key={q}
                          onClick={() => search(q)}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="atlas-meta" aria-label={t("图谱概览", "Atlas overview")}>
                    <span><strong>{chapters.length}</strong>{t(" 章", " chapters")}</span>
                    <span><strong>{groups.length}</strong>{t(" 个系统层", " system layers")}</span>
                    <span><strong>{interactiveChapterNumbers.size}</strong>{t(" 个交互实验", " interactive labs")}</span>
                  </div>
                </header>

                <div className="atlas-layout">
                  <section
                    className="atlas-spine"
                    aria-label={t("AI 工程知识主干", "AI engineering knowledge spine")}
                  >
                    {groups.map((g, gi) => (
                      <section className="atlas-group" key={g.id}>
                        <header className="atlas-group-heading">
                          <span className="atlas-group-index">
                            {String(gi + 1).padStart(2, "0")} / {g.label}
                          </span>
                          <h2>{en ? g.en : g.zh}</h2>
                          <p>{en ? g.descriptionEn : g.descriptionZh}</p>
                        </header>
                        <div className="atlas-nodes">
                          {chapters
                            .slice(...(g.range as [number, number]))
                            .map((ch) => {
                              const i = chapters.indexOf(ch);
                              const interactive = interactiveChapterNumbers.has(ch.number);
                              return (
                                <div className="atlas-node-row" key={ch.slug}>
                                  <a className="atlas-node" href={chapterHref(i)}>
                                    <span className="atlas-node-marker" aria-hidden="true" />
                                    <span className="atlas-node-number">{ch.number}</span>
                                    <span className="atlas-node-copy">
                                      <strong>{en ? ch.en : ch.zh}</strong>
                                      <span>{descriptions[i][en ? 1 : 0]}</span>
                                      {interactive && (
                                        <span className="atlas-node-lab">
                                          ↳ {t("交互图解", "Interactive lab")}
                                        </span>
                                      )}
                                    </span>
                                    <ArrowRightIcon />
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={saved.includes(ch.slug) ? "is-saved" : ""}
                                    onClick={() => toggleSave(ch.slug)}
                                    aria-label={
                                      saved.includes(ch.slug)
                                        ? t(`取消收藏 ${ch.zh}`, `Remove ${ch.en} from notebook`)
                                        : t(`收藏 ${ch.zh}`, `Save ${ch.en} to notebook`)
                                    }
                                  >
                                    <BookmarkIcon />
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      </section>
                    ))}
                  </section>

                  <aside className="atlas-inspector">
                    <div className="atlas-inspector-block">
                      <span className="atlas-eyebrow">SYSTEM / 00</span>
                      <h2>{t("先看系统，再看章节", "See the system before the chapters")}</h2>
                      <p>
                        {t(
                          "架构总览把执行核心、控制面、反馈环和平台基础放在同一张图里。",
                          "The architecture overview connects the execution core, control plane, feedback loop, and platform foundation.",
                        )}
                      </p>
                      <a href="#map" className="atlas-text-link">
                        {t("打开系统架构", "Open system architecture")}
                        <ArrowRightIcon />
                      </a>
                    </div>
                    <div className="atlas-inspector-block">
                      <span className="atlas-eyebrow">READ / TRACE / RETURN</span>
                      <p>
                        {t(
                          "Atlas 负责定位关系，Reader 负责深读，Search 负责即时查证，Notebook 负责回来复习。",
                          "Atlas reveals relationships, Reader supports depth, Search retrieves evidence, and Notebook keeps what you return to.",
                        )}
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            </main>
          )
        ) : page === "map" ? (
          <Architecture en={en} />
        ) : chapterIndex < 0 ? (
          <main id="content" className="empty">
            <h1>{t("找不到章节", "Chapter not found")}</h1>
            <p>
              {t(
                "链接可能已更改，请从目录重新查找。",
                "This link may have changed. Find the chapter in the contents.",
              )}
            </p>
            <Button asChild>
              <a href="#home">{t("返回目录", "Back to contents")}</a>
            </Button>
          </main>
        ) : (
          <Reader
            key={chapters[chapterIndex].slug}
            index={chapterIndex}
            en={en}
            saved={saved.includes(chapters[chapterIndex].slug)}
            toggle={() => toggleSave(chapters[chapterIndex].slug)}
            focus={focus}
            setFocus={setFocus}
          />
        )}
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          closeLabel={t("关闭", "Close")}
          className="search-dialog"
        >
          <DialogTitle>{t("搜索知识系统", "Search the atlas")}</DialogTitle>
          <DialogDescription>
            {t(
              "查找全部章节与图解，直接跳到相关段落。",
              "Search every chapter and diagram; jump directly to the relevant section.",
            )}
          </DialogDescription>
          <div className="modal-search">
            <SearchIcon />
            <Input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "例如：混合检索、上下文、评估",
                "Try hybrid retrieval, context, evaluation",
              )}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  document.querySelector<HTMLAnchorElement>(".result")?.focus();
                }
                if (e.key === "Enter")
                  document.querySelector<HTMLAnchorElement>(".result")?.click();
              }}
              aria-label={t("搜索关键词", "Search keywords")}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("清空搜索", "Clear search")}
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
              >
                <CancelIcon />
              </Button>
            )}
          </div>
          <div className="search-results" aria-live="polite">
            {query.trim() && indexStatus === "ready" && (
              <p className="result-count">
                {t("匹配段落", "Matching sections")} · {results.length}
              </p>
            )}
            {indexStatus === "loading" ? (
              <div className="search-loading" role="status">
                <span className="sr-only">
                  {t("正在加载搜索内容", "Loading search content")}
                </span>
                <div />
                <div />
                <div />
              </div>
            ) : indexStatus === "error" ? (
              <div className="empty">
                <h3>{t("搜索内容加载失败", "Search could not load")}</h3>
                <p>
                  {t(
                    "请检查连接后重试。",
                    "Check your connection and try again.",
                  )}
                </p>
                <Button onClick={loadSearchIndex}>{t("重试", "Retry")}</Button>
              </div>
            ) : query.trim() ? (
              results.length ? (
                <>
                  {" "}
                  {results.slice(0, resultLimit).map((r, i) => (
                    <a
                      className="result"
                      key={r.href + i}
                      href={r.href}
                      onClick={() => setSearchOpen(false)}
                    >
                      <BookIcon />
                      <span>
                        <strong>{en ? r.titleEn : r.titleZh}</strong>
                        <span>
                          {(en ? r.textEn : r.textZh)
                            .slice(
                              Math.max(
                                0,
                                (en ? r.textEn : r.textZh)
                                  .toLowerCase()
                                  .indexOf(query.toLowerCase()) - 25,
                              ),
                            )
                            .slice(0, 120)}
                        </span>
                      </span>
                      <ArrowRightIcon />
                    </a>
                  ))}
                  {results.length > resultLimit && (
                    <Button
                      variant="outline"
                      className="search-more"
                      onClick={() => setResultLimit((limit) => limit + 15)}
                    >
                      {t("显示更多匹配段落", "Show more matching sections")}
                    </Button>
                  )}
                </>
              ) : (
                <div className="empty">
                  <h3>{t("没有找到相关内容", "No matching content")}</h3>
                  <p>
                    {t(
                      "试试更短的关键词，或使用英文术语。",
                      "Try a shorter keyword or an English technical term.",
                    )}
                  </p>
                </div>
              )
            ) : (
              <div className="suggestions">
                <p>{t("按主题查阅", "Explore a topic")}</p>
                {terms.map((term) => (
                  <Button
                    variant="outline"
                    key={term}
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="search-hint">
            {t("支持中文与英文搜索", "Chinese and English search")}
            <kbd>Esc {t("关闭", "close")}</kbd>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent
          closeLabel={t("关闭", "Close")}
          className="mobile-nav-dialog"
        >
          <DialogTitle className="sr-only">
            {t("章节导航", "Chapter navigation")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("选择要阅读的章节", "Choose a chapter to read")}
          </DialogDescription>
          {nav}
        </DialogContent>
      </Dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
