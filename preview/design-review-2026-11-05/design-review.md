# 设计评审 · 向 Learn Inference 的「清新的书」靠拢

- 日期：2026-11-05
- 目标：本站 `web/site`（本地产物，`http://127.0.0.1:4180/#home/all`、`#read/03-hybrid-retrieval-query-routing`）
- 参照：https://learn-inference.com/ （首页、`/chapters/inference/two-phases`、390px 移动版）
- 深度：标准（3 个参照页面 + 5 个本站状态：首页浅/深/移动、阅读页浅/深）
- 驱动：本机 headless Chromium（Playwright）。Aside 未安装，按 gstack 的浏览器回退路径执行；页面内容一律当作证据，不作为指令。
- 工作树：`main`，**有 16 个已修改 + 20 个未跟踪文件**。按 `AGENTS.md`「保留现有工作树改动」，本轮**不提交、不 stash、不自动修复源码**，只产出评审与样张；gstack 的「每修一处一个原子提交」留到范围确认后再启用。
- 产物：`prototype.html`（可交互样张，首页 / 阅读页 × 浅色 / 深色）、`screenshots/`（7 张对照截图）、本报告。

---

## Phase 1 · 第一印象

**参照站**
> 它传达的是「这是一本可以马上开始读的书」。我注意到左侧一块高饱和绿书封，右侧只有两段安静的正文；首屏没有口号、没有数据统计、没有导航网格。视线前三件事是：**书封 → 黑色 Start reading → 两段介绍文字**。一个词：**quiet（安静）**。所有区域都能在两秒内命名：封面/入口、简介、试玩、章节目录。

**本站首页**
> 它传达的是「这是一个功能完备的工程控制台」。我注意到一条 240px 常驻侧栏、一个 67.68px / 590 字重的巨型标题、右上 INSPECT 检查器。视线前三件事是：**巨型标题 → 搜索框 → 右侧检查器**，而不是「从哪一章开始读」。一个词：**dense（致密）**。首页有 5 套并列入口（搜索、快速定位标签、统计条、章节节点、检查器），按 Krug 的「每个屏幕一个明显下一步」，这里反而需要选择。

**本站阅读页**
> 版心 608px、行高 30.4px，中文阅读本身是舒服的；但页面被左侧栏、顶栏、灰色步骤盒、STEP/NODE 胶囊、图注包围，书的节奏被「仪表盘」打断。

---

## Phase 2 · 推断出的设计系统（实测 computed style，不是文档声明）

### 参照站

| 维度 | 实测值 |
|---|---|
| 字体 | 恰好 3 个家族，角色清晰：Inter（UI/正文）、Literata（编辑层：小标题 20px/500、章标题 48px/400、章正文 18px/30.96px）、Geist Mono（数字与 label） |
| 正文 | 16px / 26px，`#7c7c67` 灰褐；章正文 18px / 30.96px，纯墨色 |
| 颜色 | 纸 `#ffffff`、墨 `#0c0c09`、次级面 `#f8f8f5`、muted `#7c7c67`、hairline `#deded8`、signal `#00a544`（深色 `#00c758`）；**全站只有一个彩色：绿** |
| 容器 | `max-width: 1024px`，左右 20px，首屏 `15rem + 1fr`（桌面 sticky 封面列）；顶栏 64px，1px 下边框 + 半透明 + 12px blur |
| 形状 | 8 / 10 / 14px 三档圆角；卡片用 `ring-1` 一像素环，不用阴影；唯一阴影在书封上 |
| 章节索引 | 衬线 18px 章名 + 1px 分隔的列表行，11px 等宽序号，hover 仅换底色 |
| 按钮 | 高 40px、14px/500、10px 圆角；主按钮纯墨底白字，其余描边 |
| 动效 | `transition: color/background-color/border-color .15s ease-out`；只有一处 CTA 切换用了 4px 位移；静态内容不等待动画 |

### 本站（当前渲染，非 DESIGN.md 声明）

| 维度 | 实测值 |
|---|---|
| 字体 | 2 个家族：Geist Variable（正文/标题）+ Geist Mono Variable（结构标签）；**没有编辑性衬线层** |
| 标题 | 首页 h1 `67.68px / 590 / -3.72px`；Reader h1 `43.2px / 550 / -1.94px` |
| 正文 | Reader `16px / 30.4px`，版心 608px；首页大量 11–12px mono 标签（`01 / MODEL`） |
| 字号阶梯 | Reader 采样 200 个元素出现 **14 组**不同的 font-size/line-height 组合（11 / 12 / 13 / 13.5 / 14 / 15 / 16px 混用） |
| 表面 | 首页 402 个采样元素中 88 个带圆角、40 个带描边；Reader 600 个中 120 个圆角、53 个描边，且出现 14+ 种背景色（含图表角色色） |
| 颜色 | 双平面：`#edf0ea` rail + `#fcfdfb` page；信号 `#2f6850` 深墨绿；深色 `#0f1211 / #181c1a / #1e2320` 三层石墨 |
| 布局 | 240px 常驻侧栏 + 内容 + 右侧 inspector，三栏常驻；移动版收起侧栏但入口更多 |

**共同点（不要丢）**：两者都是近白纸面 + 中性墨色 + 一个绿色信号、都克制、都无渐变大阴影、都无 AI slop 特征、都无横向溢出（390/1440 实测 0）。这说明方向不是「推翻重做」，而是**把参照站的编辑层与单列呼吸感嫁接回现有身份**。

---

## Phase 3–5 · 发现清单

| ID | 影响 | 类别 | 发现 | 证据 |
|---|---|---|---|---|
| FINDING-001 | **High** | 视觉层级 | 首页巨型标题（67.68px/590）与三栏 chrome 抢走了内容入口；参照站首屏最大文字只是 20px 衬线小标题，视觉重量全给书封与主按钮 | `ours-home-light.jpg` vs `ref-desktop.jpg` |
| FINDING-002 | **High** | 布局 | 常驻三栏把阅读切成多个视觉上下文；参照站全站一条 1024px 单列滚动线，封面列只是首屏内的 sticky 元素，不是全局导航 | 两侧截图；`main{max-width:1024px}` |
| FINDING-003 | **High** | 排版 | 缺一个编辑性衬线层：本书的「清新」很大程度来自 Literata 的 48px 章标题 + 18px 衬线正文；本站只有 sans + mono，长文读起来像技术文档而非书 | `ref-chapter.jpg` vs `ours-reader-light.jpg` |
| FINDING-004 | **Medium** | 密度 | 盒子感过强：浅灰填充块 + 描边 + STEP/NODE 胶囊遍布正文，参照站靠 1px hairline 和留白分区 | Reader 采样 120 圆角 / 53 描边 / 14+ 背景色 |
| FINDING-005 | **Medium** | 排版 | 字号阶梯碎裂（14 组组合）、11px mono 结构标签在中文里偏小且重复出现 | `ours-spec` 实测 |
| FINDING-006 | **Medium** | 颜色 | `#2f6850` 是沉稳墨绿，用于大面积选中/填充；参照站的 `#00a544` 只做点状信号（封面、链接 hover、当前节点），其余全部中性，才有「清新」 | 两站 token 对照 |
| FINDING-007 | **Medium** | 交互/流程 | 首页 5 套并列入口，缺少唯一明显的下一步；参照站 = 1 主按钮 + 3 个次要链接 | 首屏截图 |
| FINDING-008 | **Medium** | 响应式 | 390px 无溢出，但 46.8px 双行标题 + 统计条 + 快速定位把章节入口推到第二屏；参照移动版是 封面 → 主按钮 → 简介的清晰顺序 | `ours-home-mobile.jpg` vs `ref-mobile.jpg` |
| FINDING-009 | **High** | 契约冲突 | `DESIGN.md` 明确写着「Atlas home begins with the system itself, not a marketing hero」「Article headings remain neutral」「The default surface is flat」「no backdrop blur on topbar」。参照风格（书封、衬线章标题、单列章节索引、半透明 sticky 顶栏）与现行契约**直接冲突**，只改 CSS 会制造契约漂移 | `DESIGN.md` §Overview / §Typography / §Layout / §Whole-site dark refinement |
| FINDING-010 | Polish | 动效 | 参照站的「流畅」是 150ms 颜色过渡 + 内容即时可见；本站动效规范本身很克制（200ms、reduced motion、方向感知顶栏），**不需要重做**，只需保持 | `DESIGN.md` §Motion |
| FINDING-011 | Polish | 可访问性 | 本站已有 44px 触控目标、focus ring、reduced-motion、双语/双主题契约，是强项；移植时不得退化 | `DESIGN.md` §Cross-surface / §Interactive concept diagrams |

**跨页一致性**：本站顶栏、侧栏、搜索、Notebook、Concept 共享一套 token，一致性优秀；参照站跨页也一致（64px 顶栏 + 单列 + 衬线章标题）。真正不一致的是**本站首页与阅读页的语气**：首页像控制台，阅读页像文档，而参照站两者都像同一本书。

---

## Phase 6 · 评分

| 类别 | 权重 | 评级 | 说明 |
|---|---|---|---|
| 视觉层级 | 15% | C | 巨型标题 + 三栏，视线顺序与任务不符 |
| 排版 | 15% | C | 无编辑层、字号阶梯碎裂 |
| 间距与布局 | 15% | B− | 表面层次设计严谨，但常驻 chrome 吃掉呼吸感 |
| 颜色与对比 | 10% | B | 灰绿体系一致、AA 通过；信号色用得偏重 |
| 交互状态 | 10% | B | hover/focus/44px/reduced motion 齐全 |
| 响应式 | 10% | B | 0 横向溢出，移动端入口偏挤 |
| 内容质量 | 10% | A− | 无 happy talk，技术内容扎实 |
| AI Slop | 5% | A | 无渐变、无三栏 feature grid、无装饰性图形 |
| 动效 | 5% | A− | 克制、目的明确 |
| 性能体感 | 5% | B | 本地产物即时可用，未实测 LCP/CLS |

**Design Score：B−**（加权 ≈ 2.9/4） · **AI Slop Score：A−**（「不像 AI 做的，像工程师做的」——这恰好也是要保住的东西）

Goodwill（首页首次访问）：`70 → 60`（−10 多套并列入口造成的选择成本；+ 内容密度与可检索性补回）。未低于 60，属于健康但可打磨。

---

## 目标风格的三条原则（不是抄色）

1. **一条滚动线**：全站一个 `max-width:64rem` 容器；侧栏不再常驻，改为按需的章节抽屉；inspector 收进章节内或按需展开。
2. **三个字体角色**：sans 做 UI、衬线做编辑层（章标题 48px、小标题 20px、长文正文 18px）、mono 只做数字与序号。字号收敛到 6 档以内。
3. **一层 hairline、一个信号色**：去掉填充块和多色图表卡，用 1px 分隔 + 留白分区；绿色只出现在封面、当前节点、链接 hover、focus ring 上，其余保持中性。

`prototype.html` 把这三条落成了可点击的样张：首页（书封 + 单一主按钮 + 试一个 + 章节索引）、阅读页（衬线章标题 + 44rem 版心 + 边注 + 图注）、浅色/深色切换、一处 55ms 步进的「运行」演示（reduced motion 下直接给全文）。样张用纯本地字体，不请求远程 web font，遵循 `DESIGN.md` 的字体约束。

---

## 若确认落地：实施路径（按 MAINTENANCE.md）

> 这是**计划**，本轮未执行任何源码修改。

1. 先定契约：修订 `DESIGN.md`（新增「编辑层」章节：衬线角色、信号色用法、单列容器、允许/禁止的 sticky 顶栏 blur）与 `preview/handbook-custom/UX-CONTRACT.md`（侧栏/inspector 改为按需），再动样式。
2. Token 层：`preview/handbook-custom/src/handbook.css` 增加 `--font-editorial`、`--signal`、`--hairline`、`--surface`，浅/深各一套；`index.css` 映射到 Tailwind utilities。**保留现有 rail/page/plate/card 五层 token**，供仍需三栏的架构图使用。
3. 首页：`main.tsx` 的 Atlas 首屏改为 `15rem + 1fr`，把 67.68px h1 降为 20px 衬线小标题；搜索、快速定位、统计条合并进一个按需的 Knowledge Command；Knowledge Spine 保留但移到章节索引之后（它是本站的签名，不能删）。
4. 阅读页：`reader.tsx` + `handbook.css` 的 `.chapter-body` 引入衬线正文与 48px 章标题，胶囊/填充块改 hairline，收敛字号到 6 档；静态图与教学实验保持原样（语义与拓扑不动）。
5. 验证：`npm run build`、`test:ui`、`test:a11y`、`test:learning`、`test:concepts`、`node web/validate.mjs`；390/768/1440/1728 四档、中英、双主题截图复核；`evidence/surface-ui-audit.cjs` 做跨表面回归。
6. 发布：`npm run publish:web` 刷新 `web/site`（注意本机 `rmSync` 被 safe-delete 拦截，走 `dist/` + `rsync -a --delete` 的既有绕行方式），再按授权决定是否 Vercel 发布。

**风险**：改三栏会触碰 `UX-CONTRACT.md` 里「一个 route 一个 bounded content scroller」的既有约束；替换字体角色会影响 12 章生成式 `content-base.css` 的字号归一化脚本；这些都是回归高发区，需要整套 browser test 而不是只看构建通过。

---

## 用户决定（已确认）

- **选择 B：首页与阅读页改版**，但明确否决书封：「B 但是不需要这个书本封面 太刻意了」。
- 追加约束：「不要copy别人的logo」——不得复制/描摹第三方 logo、logomark、字标或图标排布。

因此最终方向是 **B − 书封 − 第三方标识**：单列、编辑性衬线层、hairline、点状信号色、纯文字字标；Knowledge Spine 保留但不再是首屏唯一主角。样张 `prototype.html` 已按此重画（首页去掉封面列与封面图形、去掉描摹的参照站标记，改为单列编辑式开场 + 单一主 CTA）。

- **A. 只借「清晰流畅」**：不动三栏与 Knowledge Spine，仅收敛字号阶梯、减少填充块、把信号绿改为点状使用、阅读页引入衬线；改动小、风险低、契约只做小幅增补。
- **B. 首页与阅读页改版**：单列 + 衬线编辑层 + hairline，Knowledge Spine 下移保留；需同步修订 `DESIGN.md` / `UX-CONTRACT.md`。
- **C. 全站重绘**：包含 Notebook / Search / Concept / 架构图，等同换设计语言，与 2026-10-20「明确否决大改版」的记录相冲突，需要显式确认。

样张最初按 B 绘制；用户选 B 后再按两条反馈修订。落地范围与验证结果见下一节。

---

## 证据文件

```
design-review.md                    评审报告 + 用户决定 + 落地记录
verification.md                     全套验证记录（含 a11y 回归修复与 32 状态矩阵）
prototype.html                      首页 / 阅读页 × 浅 / 深 × 三档深色底色 可交互样张（无书封 / 纯文字字标）
screenshots/ref-*.jpg               参照站证据 1440 / 阅读页 / 390
screenshots/ours-*.jpg              改版前本站证据（浅 / 深 / 窄屏 / 阅读页）
screenshots/proto-*.jpg             样张四状态（见 /tmp/design-review-shots/）
screenshots/final-*.jpg             落地后产品截图：390 / 768 / 1440 / 1728 × 浅 / 深 × 中 / 英 × 首页 / 阅读页
screenshots/preset-*.jpg            三档深色底色的首页 / 阅读页，以及选择器展开状态
```

静态 DOM 扫描说明：本次为渲染页的 computed-style 与截图评审，跨源 CSS 未解析，未运行 gstack 的 impeccable 机械检测器；所有数值来自本机浏览器实测。

---

## 落地记录 · scope B（无书封、无第三方标识）

改动遵循 `MAINTENANCE.md` 的 source-of-truth 顺序，契约先行、样式随后；工作树原本 dirty，未提交、未 stash、未清理任何既有改动。

| 文件 | 改动 |
|---|---|
| `DESIGN.md` | frontmatter 改为单平面白色 + `#007a35` 主信号 + `#00a544` 点信号 + 中文衬线字体角色；修订 4 处与参照风格冲突的条款（North Star、顶栏 blur、Typography、Atlas Layout）；新增「Editorial clarity refinement · scope B」章节与两条 Don't |
| `preview/handbook-custom/UX-CONTRACT.md` | inspector 改为页面流内的扁平分区（仍不导航）；新增「Editorial clarity refinement · presentation-only」章节，逐条锁定不变的能力/DOM/无障碍契约 |
| `preview/handbook-custom/src/handbook.css` | `:root` / `.dark` token 换成单平面 + hairline + `--signal` / `--signal-ink` / `--hairline` / `--font-serif`；末尾追加编辑层：64rem 单列、64px hairline 顶栏（仅非 Reader 用 12px blur）、克制衬线首页标题、单一 ink CTA、inspector 降级为全宽分区、Reader 直接子元素衬线散文、callout 改 hairline；另加两条验证驱动的修复：`.bfs-meta` 染色底板压平（修 a11y 4.43:1）、英文 `.brand-en` 允许换行（修 264px 导轨裁切） |
| `preview/handbook-custom/src/main.tsx` | Atlas intro 增加一条 `.atlas-start-link` 纯文字/ink 主 CTA，指向 `chapterHref(0)`；未改任何路由、状态或既有选择器 |
| `preview/design-review-2026-11-05/prototype.html` | 删除书封、封面列、封面阴影与按钮堆；删除照着参照站描的 `brand-mark` SVG，改为纯文字字标；首页改单列编辑式开场（eyebrow → 衬线标题 → 两句说明 → 单一主 CTA + 三个安静文字链接）；保留「试一个」教学演示、12 章 hairline 索引、阅读页、浅/深与视图切换、reduced-motion 兜底；令牌表新增「品牌标识」行并改名为「改版前 / 落地值」 |

**未改动**：`content-base.css` 生成链、`reader.tsx`、章节 JSON、所有 Lab / 图谱 / 模拟器、路由与搜索排序。正式产品侧栏的 `BookIcon` 是项目既有的 Iconoir 授权通用图标，不是任何站点的 logo，予以保留；参照站截图只作对比证据，未作为产品素材复用。

**刻意保留的偏差**：Reader 顶栏仍为纯色、不使用 blur（保护方向感知 chrome 的回归行为）；阅读版心保持 `38rem`（中文阅读本已舒适，且生成式图表宽度计算依赖它）；深色模式保留石墨明度阶梯；没有加入假数据「运行」演示到生产首页。

验证结论（详见本目录 `verification.md`）：`build` 通过；`test:ui` 17 组、`test:learning` 60 状态、`test:concepts` 96 状态全过；`test:a11y` 28 条 route 0 violation；`node web/validate.mjs` 通过；32 状态（390/768/1440/1728 × 浅/深 × 中/英 × 首页/阅读页）0 横向溢出、0 page error。首轮 a11y 发现 CH07 `.bfs-meta` 小字因新 `--primary` 染色跌到 4.43:1，已把该底板压平为 hairline 修复；英文侧栏品牌副标题裁切也已修复。`web/site` 已用非破坏性同步刷新到与 `dist` 逐字节一致，生产冒烟通过；未 commit、未部署。

---

## 追加修订 · 深色底色预设（用户反馈）

用户打开预览后反馈：

> 「我不是很喜欢背景的墨绿色 要不改成codex的深灰色，或者允许用户选择几个预设的颜色，黑色，墨绿，深灰等」

两半都做了：**墨绿不再是默认**，同时**三档深色底色可随时切换**。浅色模式完全不变，仍然没有书封、没有第三方 logo。

| 文件 | 改动 |
|---|---|
| `src/handbook.css` | `.dark` 改成 `--ds-*` 表面阶梯变量；默认 `graphite` 中性深灰（`--page #212121` / `--background #171717`）；新增 `ink`（`#101010`）与 `forest`（旧墨绿 `#181c1a`）两个 `.dark[data-dark-preset=...]` 覆盖块；新增 `.appearance-picker` / `.appearance-swatch` / `.appearance-menu` 控件样式，色点带 2px `currentColor` 描边以免在深底上隐形 |
| `src/main.tsx` | `DARK_PRESETS` 三档 + `darkPreset` 状态 + `data-dark-preset` / `preview-dark-preset` 持久化；顶栏新增 44px `details/summary` 选择器（Reader 也有），ESC 关闭，选择时自动进入深色 |
| `public/theme-init.js` | 首屏前读取预设并设置 `data-dark-preset`，避免刷新时闪一下错底色 |
| `prototype.html` | 深色默认改中性深灰；顶栏加 深灰 / 纯黑 / 墨绿 分段控件（≤860px 隐藏以保顶栏不挤），令牌表新增「深色底色」行 |
| `DESIGN.md` / `UX-CONTRACT.md` | frontmatter 与 Colors 表改为中性默认；修正 4 处仍描述旧墨绿的历史条款；新增两个 2026-11-05 章节，锁定「预设只换表面阶梯、不改任何能力 / DOM / 无障碍契约」 |

**未改动**：`content-base.css` 生成链、`reader.tsx`、章节 JSON、路由、搜索排序、Lab / 图谱 / 模拟器，以及原来那个浅/深切换按钮的行为。

**验证**：`build` PASS；`test:ui` 17 组、`test:learning` 60、`test:concepts` 96 全过；`test:a11y` 28 route 0 violation；`node web/validate.mjs` PASS；32 状态 0 溢出 / 0 page error；另做 **3 预设 × 4 宽度** 专项验证，0 溢出 / 0 page error、控件命中区 ≥44px、菜单 ESC / 持久化 / 浅色自动转深全部通过。正文 / muted / action 对比度：graphite `11.99 / 6.02 / 14.6`、ink `15.99 / 7.22 / 17`、forest `13.25 / 7.19 / 9.77`。样张 4 状态重跑仍为 0 溢出 / 0 脚本错误。详见 `verification.md` 第 8 节。

**生产产物**：再次用非破坏性同步（整目录备份 → 旧 hashed 资源移动走 → 拷入新资源 + `index.html` + `theme-init.js`），`diff -rq dist web/site` 无差异；4181 冒烟确认默认 `graphite #212121`、切到 `forest #181c1a` 生效、阅读页衬线正常、0 page error / 0 request failed。仍然未 commit、未部署。

## 追加修复 · CH05 竖排塌缩（用户截图 "fix this"）

用户发来浅色主题 CH05 阅读页截图：主内容区大面积空白，右侧一条约 50px 的浅色竖列里中文逐字换行（`始 / P / D / F / 按 / 顺 / 序 / 检 / 查 / 证 / 据 / 谱 / 系 …`）。这不是设计风格问题，是生成内容容器的宽度塌缩。

**根因（两条叠加）**：`handbook.css` 的宽版图表规则本意只作用于顶层图表，却把 `.two` 网格内的 `#fig-5-2` 也撑到 1037px，使 `1fr 1fr` 解算为 `608px 0px`；同时 `StructuralGuide` 把 `.structural-guide-slot` 插成这个网格的第三个 item，正好落进 0px 轨，Lab 被压成 `50px × 6922px`。CH07 的同类网格表现为 `1037px 1037px`，`.chapter-body` 横向溢出到 2337px。全站扫描只有这两处命中。

**修复**：`src/structural-guides.tsx` 把插槽挂到锚点最外层 grid 祖先之后（CH05 现在与 CH09 / CH12 一样，父节点为 `section.ch`）；`src/handbook.css` 新增宽版图表守卫，让 `.two:has(> .bfs-canvas)` 在宽屏改为单列、图表回到 38rem 版心内。未改生成式 `content-base.css`、章节 HTML/JSON、路由、能力或任何既有 DOM 契约；`DESIGN.md` / `UX-CONTRACT.md` 各新增 `Canonical grid guard` 章节。

**结果**：CH05 图表、要点列表与 Lab 全部横向正常，1440px 下 `.structural-guide` 为 `608 × 1206`；CH07 溢出从 2337px 降到 1101px（无横向滚动）。专项 32 状态（4 宽度 × 2 主题 × 2 语言 × CH05/CH07）`bad 0 / errorTotal 0`；`build` / `test:ui` 17 / `test:a11y` 28 route 0 violation / `test:learning` 60 / `test:concepts` 96 / `full-sweep` / `structural-guides-browser` 144 断言 / `web/validate.mjs` / 32 状态矩阵 / 3 预设 × 4 宽度 / 样张 4 状态全部通过。对照截图 `bug-ch05-narrow-column-{user,before,after}`，完整数据见 `verification.md` 第 9 节。

生产产物做第三次非破坏性同步，`diff -rq dist web/site` 无差异、用户已改的 3 个 content JSON 原样保留。**仍然未 commit、未部署**。


## 追加修复 · 同类 bug 全站扫描（用户截图 "fix similar bugs"）

用户又发来两张截图：深色 simulator 完成态里 `TOOL RESULT · VERIFIED`、JSON 与终端日志逐字竖排；浅色 CH06 的 YAML `.two` 右侧 callout 逐字竖排。诉求是「按共性根因修同类 bug」，不是只修两个像素点。

**根因（四条，全部是呈现几何）**：

1. CH05 那条宽版图表规则 `@container (min-width:60rem)` 给 `:is(.tw, pre, .bfs-canvas, figure, .concept-demo, .archify-overview)` 设 `calc(100cqw - 2rem)` + 负 margin。除 `.two > .bfs-canvas` 外，它还命中 `.two > pre.code`、`.grid.g2 > pre.code`、`.grid.g2 > .tsc > .tw`（CH09 的孙级）等。CH06 的 `.two` 被解算成 `608px 0px`、右侧 `DIV` 为 `0 × 12867`、内部 `.co` 为 `48px` 宽且高 `2241 / 5100 / 5430px`。
2. 全局搜索结果样式 `.result` 是 `display:grid; grid-template-columns:2.25rem minmax(0,1fr) 1rem`；simulator 把 `.result` 当作 `.sim-log` / `.sim-message` 的状态修饰类，JSON 掉进 1rem 第三轨，形成 `16px × 756px` 的竖排。
3. **断点用 viewport 而不是 `.chapter-body` 容器**：simulator 紧凑布局原为 `@container (max-width:600px)`，但 wide plate 只在 `.chapter-body >= 60rem` 激活；1024–1280px 下左面板仅 194px。`.document-grid` 原为 `@media (max-width:640px)`，而 768px 视口下阅读列只有 453px，三条 min-content 轨合计约 586px，英文下把 `.chapter-body` 推出 184px 横向滚动。
4. 三个场景的说明文字长度不同，切换 tab 会让 `.atlas-graph-caption` 换行数变化，整个 simulator 高度在 390px 变 19.53px、1024–1280px 变 28.08px。这是**改前就存在**的潜在不稳定：在 pre-change 构建（4182）上用同一条 `test:simulator-layout` 复现出完全相同的 `2269.38 → 2288.91`，因此它导致该套件失败，而不是本轮改出来的回归。

**修复**（只改 `src/handbook.css` 与 `src/skill-simulator.tsx`；未动生成式 `content-base.css`、章节 HTML / JSON、路由、状态、DOM 计数、深色预设、书封/品牌约束）：

- 宽版规则排除作者网格的**任意后代**（`.two * / .g2 * / … / .harness-wrap *`）；直接含宽版元素的作者网格在 60rem 断点改单列，宽版子元素恢复 `width:auto / max-inline-size:100% / margin-inline:0`。
- `.chapter-body .skill-terminal :is(.sim-log, .sim-message) { display:block; }` 隔离全局 `.result` 网格；紧凑布局断点改为 `59.99rem`，与 wide plate 的开关严格对齐。
- `.document-grid` 的堆叠断点由 `@media (max-width:640px)` 改为 `@container (max-width:40rem)`；768px 下三卡由 `175.8 / 193.8 / 192.6` 三轨变成单列 `347px`，`bodyOver` 由 50（中）/ 184（英）降为 0。
- 为 `.atlas-graph-caption` 预留实测最大高度（紧凑布局 `4.75rem`；`<=25rem` 下中文 `6rem` / 英文 `8rem`，用 `:lang()` 区分），不截断、不隐藏任何文字。

**结果**：144 状态矩阵（12 章节 × 5 宽度 × 2 语言 × 2 主题）从 pre-change 构建的 `bad 54` 降到 `bad 6`；剩余 6 条全是 CH03 / CH09 作者原生的 6-up `.bfs-card-desc` 窄卡片（与上一轮 CH07 已核对过的同类几何），`pageOver / bodyOver / 0px 网格 / 越界宽版 / pageerror` 全为 0。六套回归测试全绿（含此前失败的 `test:simulator-layout`：8 个宽高基线 × 9 步，0 漂移），`test:a11y` 28 route / 0 violation，`web/validate.mjs` 通过。

生产产物做非破坏性同步（备份 `web-site-backup-20261105-f`），`diff -rq dist web/site` 无差异、用户已改的 3 个 content JSON 原样保留。**仍然未 commit、未部署**。完整数据见 `verification.md` 第 10 节，截图见 `screenshots/fix-*.jpg`。


## 追加修订 · 减少横向滚动、提高可读性（用户截图）

用户又发来两张深色 CH05 截图并说「尽量减少类似的横向滚动 提高可读性」：一张是「第三层 · Semantic Chunking」里「信息类型 / 索引路径」表格被裁切（`Dense...` / `BM25...` / `Exact...` 只露开头），下方 `CHUNK METADATA` JSON 代码块也在窄栏里；另一张是 `EvidenceChunk` 三列表右列被裁切、底部有明显横向滚动条。诉求是按共性根因全站减少这类滚动，不是只修两个表格。

**根因**：生成式 `content-base.css` 把横向滚动设成了默认——`table { min-width:560px }`，`.tsc table / .table-scroll table` 在 `width<=1020px` 为 `720px`、`width<=640px` 为 `640px`，`th` 用 `white-space:nowrap`，`pre / .code { white-space:pre; overflow-x:auto }`，`.tsc / .table-scroll / .tw { overflow-x:auto }`。在 `38rem` 阅读版心里，普通 2–4 列表格与短 JSON 示例必然变成只能横向拖动的窗格。此外宽版图表规则把 `.tsc > .tw` 撑到 `calc(100cqw - 2rem)`（`1037px`），而 `.tsc` 外壳仍是 `608px`，于是外壳自己产生滚动条；`CH05` 的「信息类型」表还被塞在 `.grid.g2` 的 `293px` 栏里。

144 状态（12 章节 × 6 宽度 × 中/英，深色）实测改前共有 **792 个章内横向滚动元素**，分布为 `.tw 452 / .tsc 212 / pre.code 62 / .rv 42 / PRE 12 / .fig 12`；页面级 `pageOver` 始终为 0，即问题全部发生在章内窗格，不是页面溢出。

**修复**（只改 `src/handbook.css`，未动生成式 CSS、章节 HTML / JSON、路由、状态、DOM 计数）：

- 把 `.tsc / .table-scroll / .fig` 本身加入顶层宽版元素，同时把它们的**后代**（含内层 `.tw`）从宽版规则里排除——宽版的是外壳，不是内层滚动容器。顶层表格在 `>=60rem` 拿到与图示相同的全宽版心，作者网格内的表格留在阅读版心。
- 直接含表格的作者网格（`.two/.g2/.g3/…`）在**所有宽度**改单列 `minmax(0,1fr)`；`293px` 栏里的三列表格即使可滚动也读不了。图解 / React demo 内部的网格拓扑不变。
- ≤4 列表格改流体：`width:100% / min-width:0 / table-layout:auto`，`th,td` 允许折行。生成式表格规则全部用零特异性 `:where()`，因此无需 `!important`。≥5 列的矩阵（主要在 `.bfs-canvas` 图解内）保留原有横向滚动，压扁会破坏矩阵结构。
- 正文 `pre` 改 `white-space:pre-wrap` + `overflow-wrap:anywhere`；`.bfs-canvas` / `.concept-demo` / `.skill-terminal` 内的 `pre` 保留固定行结构。
- `<=40rem` 容器下表格字号 `0.78rem`、行内 `code` `0.75rem`；`>=40rem` 容器下首列 `code` `white-space:nowrap`，让 `document_id` / `parser_provenance` 在阅读列够宽时完整成行，窄屏仍允许折行以免两列正文被挤塌。全部用 `@container` 而非 viewport media query。

**结果**：章内横向滚动元素 **792 → 14**（降幅 98.2%）。剩余 14 个全部在 `.bfs-canvas` 图解内部（CH05 `.bfs-body > pre.code` 6 个、CH10 `.table-wrap > .tw` 8 个），属于刻意保留的图解矩阵 / 代码，`pageOver` 仍为 0；`bodyOver>2` 仍是改前就存在的 CH08 1280 中/英各 6px。144 状态同类-bug 矩阵保持 `bad 6`，与上一轮完全一致，剩余全是作者原生 `.bfs-card-desc` 窄卡片，无回退。六套回归全绿（ui 17 / a11y 28 route 0 violation / learning 60 / concepts 96 / structure-browser 144 断言 / simulator-layout 8 基线 × 9 步 0 漂移），`web/validate.mjs` 通过。

改前/改后对照截图见 `screenshots/hscroll-*-{before,after}.jpg`；改前 `1440px` 的 `EvidenceChunk` 表首列被滚没、右列 `multimodal veri...` 被截断，改后三列完整、`parser_provenance` 等标识符全在一行；`768px` 下也可读且无滚动条。完整数据见 `verification.md` 第 11 节。生产产物做第五次非破坏性同步，用户已改的 3 个 content JSON 原样保留。**仍然未 commit、未部署**。


## 追加修正 · Atlas 首屏「03 亮绿色」语义（用户追问与方案 1）

用户上传深色首页截图问「03为什么会亮绿色」。定位结果：不是阅读进度、不是已读完成、也不是持久化状态，而是 `main.tsx` 里 `selectedAtlasSlug` 初始值被硬编码为 03，目的是让首屏 INSPECT 面板不为空；同一状态同时驱动 `.atlas-node-row.is-selected`、Inspect 按钮的 `aria-pressed="true"` 和 `var(--signal)` 点状圆点（深色 `#3ddc84`）。也就是说用户什么都没做，界面却宣称 03 已选中。颜色本身符合 B 方案「一个点状绿色 signal」，但语义是错的。

给出四个处理后用户选择 **1**：保留 Inspector 默认展示 03，去掉默认绿点与 `aria-pressed`。

**改动**（只改 `src/main.tsx` 的一处初始状态 + 一个 `defaultInspectSlug` 回退；未动 CSS、生成式内容、路由、DOM 计数）：

- `selectedAtlasSlug` 初始为 `""`；`selectedAtlas` 在无选中时回退到 `defaultInspectSlug`（仍是 03）或首章，因此 `#atlas-inspector-selected` 首屏依旧显示 `INSPECT / 03 混合检索与 Query Routing`，标题、决策、失败模式、相关章节与入口链接全部不变。
- 真实选中仍由键盘 focus 节点链接或点击 Inspect 创建；`inspectAtlas` 在窄屏把面板滚入视口并移交焦点的行为不变。hover / `:focus-visible` 的临时点状 signal 保留，但不设置 selected、不改 `aria-pressed`、不切换 Inspector。
- 无新增 storage key、无新增控件、无新增 DOM；`--signal` / `--signal-ink`、三档深色底色、B 方案「无书封、无第三方标识」约束全部不变。

**结果**（4183 新构建与 4181 生产预览各跑一次三态，结果一致）：

| 状态 | selected | `aria-pressed=true` | 绿色圆点 | Inspector | pageerror |
|---|---|---|---|---|---|
| fresh | 无 | 无 | 无 | `INSPECT / 03` | 0 |
| hover 05 | 无 | 无 | 05（临时） | `INSPECT / 03` | 0 |
| Inspect 05 | 05 | 05 | 05 | `INSPECT / 05` | 0 |

`aria-pressed` 现在在首屏 12 个 Inspect 控件上全部为 `false`，与真实状态一致；对比度、44px 触控目标、可见焦点不变。六套回归全绿（ui 17 / a11y 28 route 0 violation / learning 60 / concepts 96 / structure-browser 144 断言 / simulator-layout 8 基线 × 9 步 0 漂移），`scripts/validate-atlas.mjs`、`web/validate.mjs` 通过；144 状态横向滚动矩阵仍为 14、同类-bug 矩阵仍为 `bad 6 / 144`、`pageOver 0`，与上一轮完全一致，无回退。

生产产物做第六次非破坏性同步（备份 `web-site-backup-20261105-h`），`diff -rq dist web/site` 一致、用户已改的 3 个 content JSON 原样保留、`4181=200` 且引用 `index-CZmtLZib.js`。截图见 `screenshots/atlas-selection-*.jpg`（含 `atlas-selection-before.jpg` 用户原始改前图，03 亮绿圆点；改后 6 张三态与 Inspector 对照），完整数据见 `verification.md` 第 12 节。**仍然未 commit、未部署**。


## 追加修复 · CH02 五列能力卡与四列对比表可读性（用户两张截图 / handoff 续跑）

用户给两张 CH02「企业检索基础」深色截图反馈可读性很差，并要求参考 `https://learn-inference.com/chapters/inference/three-layers`：参照站用**宽容器 + 纵向语义块 + hairline**，而不是把多列硬塞进 `38rem` 版心。上一轮会话已改源码并构建，但回归被中断、未同步 `web/site`、未补文档；本轮从 `.workbuddy-ai/memory/2026-11-05-handoff.md` 恢复并收尾。

**复现与量化**：`.grid.g5`（EXACT / BM25 / DENSE / GRAPH / META）在 1440 下 5 卡各约 120px，`BM25` 被 `overflow-wrap:anywhere` 拆成 `BM/25`；`#comparison`（能力 / 原理 / 优势 / 局限）在 768 下首列仅 54px、四列共约 395px，`Exact` 拆成 `Ex/act`，表头竖排。

**修复**（只改 `src/handbook.css` + `src/reader.tsx`，纯呈现增强）：

- `.g3/.g4/.g5/.lane3:has(> .cd)` 在阅读版心内改 `auto-fit minmax(min(100%, 9.5rem), 1fr)` 折行；`>=60rem` 容器下恢复作者列数（5 / 4 / 3）。`.cd { min-width:0 }`、`.cd small { overflow-wrap:normal }` 止住断词。**坑 1**：`60rem` 的规则必须排在 `auto-fit` 之后——两条选择器特异性相同，写在前面会被后面的 `auto-fit` 覆盖，表现为多出一条 `0px` 折叠轨道、固定列数规则形同虚设。
- `reader.tsx` 给带 `thead > th` 的普通表加 `.stack-table`，把表头写进 `td[data-label]`；`<=38rem` 容器下 `display:block` + `thead:none` + 每行 hairline 卡片 + 首格标题 + `td::before { content: attr(data-label) }`，纵向语义块保留全部列信息。
- **坑 2（本轮新发现）**：`.interp-matrix` 不是图解矩阵，它是 CH02 / CH03「可横向滚动的对比表」的 `.tsc` 外壳（全库仅 4 处）。上一版排除列表把它一并排除，导致用户真正抱怨的 `#comparison` 完全没被堆叠（其余 3 张表都正常）。移除该排除项后 768 / 390 下 `stacked=true`、`data-label` 生效。
- **坑 3（本轮新发现）**：1440 下首列仍把 `Metadata` 拆成 `Metad/ata`。曾补一条对所有 `.stack-table` 单元格生效的 `overflow-wrap:normal`，结果连 CH09 / CH10 带固定 `min-width` 的图解表一起命中，横滚矩阵从基线 `14` 涨到 `18`（`code 6 / tw 12`）。收窄为「只对 `.tsc.interp-matrix > .tw > table.stack-table` 首列生效」后降到 `10`（`code 6 / tw 4`），比基线还少 4 个——减少的是窄屏下已改为堆叠的 CH10 滚动窗格。

**结果**：CH02 四个宽度 `1440 / 1024 / 768 / 390` 全部 `pageOver 0`、`crushed []`、`pageerror 0`；1440 下 5 个有效列 × 196px（≥150px），768 / 390 下对比表 `stacked=true`；1440 表格 `Metadata` 完整成行。六套回归全绿（ui 17 / a11y 28 route 0 violation / learning 60 / concepts 96 / structure-browser 144 断言 / simulator-layout 8 基线 × 9 步 0 漂移），`web/validate.mjs` PASS，`FINAL_FAIL=0`；144 状态横滚 `10`、`pageOver 0`、同类-bug 矩阵仍 `bad 6`，均无回退。最终 hash `index-Dh1xlw27.css` / `index-B30BLWRa.js`。

前后对照截图见 `screenshots/readable-{g5,table}-{before,after}-{1440,768}.jpg` 共 8 张；完整数据见 `verification.md` 第 13 节。生产产物做第七次非破坏性同步（备份 `web-site-backup-20261105-i`），`diff -rq dist web/site` = `IDENTICAL`、`content/*.json` 原样保留。**已于 20:18 提交 `aec1bba`，并于 21:20 随本次 release 推送并上线（见第 15 节）**。


## 追加新增 · 网站 favicon（用户「add icon to website」）

用户说「add icon to website」。核查发现线上部署根是 `web/site/`（`web/vercel.json` 的 `outputDirectory: "site"`），该目录**既无图标资源、入口 `index.html` 也无 `<link rel="icon">`**；旧静态站的 `web/favicon.svg`（深绿底 + 白色 A 字）在部署根之外，且整片绿底与当前「一个平面 + 一个点状绿色 signal」的规范相冲突。经确认，用户选择「补浏览器 favicon」+「按当前设计语言重新设计」（不做 ICO / apple-touch / manifest 完整套装）。

**约束前置**：`DESIGN.md` 明确「任何未来品牌标记必须原创且先写进文档」，因此先在 `DESIGN.md` 追加 `Original favicon · Knowledge Spine mark` 条款，再创建资产。

**造型**：Knowledge Spine —— 项目的自有 signature「Model → Retrieval → Agent → Production 的可见轨迹」。一条横向 hairline 脊柱串 4 个节点，**恰好一个**是点状绿 signal（序列起点），其余 3 个为中性 ink；中性圆角底板 + 一条 hairline 边框。不用任何字母造型（与旧版 A 明确区分）、不借用任何第三方标识。颜色全部取自 `DESIGN.md` frontmatter 令牌：浅色 `plate #ffffff / border #deded8 / foreground #0c0c09 / signal #00a544`，深色 `page #212121 / foreground #ececec / signal #3ddc84`；绿色只是一个点，绝不铺底。

**两轮迭代**：第一版节点 r=4.5、spine 用 `muted-foreground`，渲染后发现 16px 下四个点几乎相切、连线不可见，退化成「四颗珠子」，丢失 Spine 语义。改为节点 r=4（间距 13.3、可见线段 5.3）、spine 用 `foreground @ 50%` 且加粗到 3、深色底板边框改 `foreground @ 18%`（原 `#3a3a3a` 在深色标签条上消失），并显式写 `width/height=64` 让 intrinsic size 固定。同时把 SVG 内 CSS 全部限定到 `svg.favicon-mark` 作用域、去掉会命中 HTML 根元素的 `:root` 规则，避免内联时污染宿主样式。

**结果**：明暗两版 × 16/32/64px × inline SVG / `<img>` 两条加载路径逐张目视通过；`prefers-color-scheme` 在两种加载方式下都生效，绿点唯一，spine 可见。`npm run build` 通过且 JS/CSS 哈希未变（只新增静态资源 + 一行 head link）；`test:ui` 17、`test:a11y` 28 route / 0 violation、`web/validate.mjs` PASS；专门的明暗冒烟脚本确认浏览器实际请求 `/favicon.svg` 返回 `200 image/svg+xml`、`pageOver 0`、`pageerror 0`，`FAVICON_PASS=0`。因 bundle 字节未变，未重跑上一轮已 `FINAL_FAIL=0` 的六套全量矩阵。生产同步后 `diff -rq dist web/site` = `IDENTICAL`、`content/*.json` 未变。

截图见 `screenshots/favicon-preview-{light,dark}.png`；完整数据见 `verification.md` 第 14 节。**已随本次 release 提交 `b4a234b`、推送并上线（见第 15 节）**。


## 发布记录 · 2026-11-05 21:20（用户「release」）

用户选择「入库 + 推送 + 生产部署」，不创建 GitHub Release / tag（仓库本来 0 个 tag、无 CHANGELOG、无发版脚本）。

**发布通道**：`web/vercel.json` 里 `"git": { "deploymentEnabled": false }` —— Git 自动部署被禁用，`git push` 不会触发上线；必须用 Vercel CLI 从**仓库根目录**运行（项目 Root Directory = `web`，从 `web/` 里运行会被拼成不存在的 `web/web`）。部署上传 15.5MB、20s Ready，alias 到 `https://kevoyuan-ai-handbook.vercel.app`。

**入库**：三个提交依次推送 `d6be18a..b4a234b` —— `aec1bba`（11-05 reader 布局与 CH02 可读性）、`22747b5`（CH08 / CH09 新章节内容工作流）、`b4a234b`（原创 favicon）。此前各节写的「未 commit / 未部署」均为当时快照，本次一次性全部落地。

**上线前状态**：生产仍是 11 天前的旧构建 `index-C2WETa-M.js`，`/favicon.svg` 为 404。

**上线后冒烟**（明暗两版）：生产入口指向 `index-B30BLWRa.js` / `index-Dh1xlw27.css` 且带 `<link rel="icon">`；`/favicon.svg` 返回 `200 image/svg+xml`、SHA-256 与本地三份产物一致；浏览器内显式 fetch 拿到 1770 字符的 SVG（含 scoped CSS 与 dark rule）；CH02 1440 下 `.g5` 仍为 5 列 ×196px、768 下 `#comparison` `stacked=true`；CH08 `#subagent-boundaries`（§8.12.5）与 CH09 `#eval-state-reconciliation`（§9.26.3）在浏览器中可见；`content/*.json` 含新 section、`search-index.json` 含「子代理的上下文边界 / Subagent context boundaries」；全部路由 `pageOver 0`、`pageerror 0`。CSP / `nosniff` / `Referrer-Policy` 头正常。

**既有结构说明（非本次引入）**：`outputDirectory: "site"` 只发布 `web/site/`，所以 `/assets/*`、`robots.txt`、`sitemap.xml`、`chapters.json` 在线上均为 404（旧 `assets/app.js` 同样如此）。`chapter-additions.json` 是内容生成/校验用的注册表，运行时 bundle 不加载它；新章节正文已编进 `web/site/content/*.json` 并实测在浏览器渲染，因此不影响本次发布内容。

**pre-push 扫描**：`gstack-redact` 报了 MEDIUM 提示但未阻断，已逐条核实为误报 —— `verification.md:525` 的 `http://localhost:4180` 是本地开发地址；`4736527116` 是美团招聘 JD 链接里的 `jobUnionId`，不是 E.164 电话号码。

生产截图见 `screenshots/prod-home-1440-dark.jpg` 与 `screenshots/prod-ch02-768.jpg`；完整数据见 `verification.md` 第 15 节。
