# Changelog

本文档记录 [texas-holdem-neon](https://github.com/zjq-coder/texas-holdem-neon) 的重要变更。  
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循语义化意图（功能里程碑，非严格 semver 发包）。

---

## [Unreleased]

（开发中尚未合入 `master` 的内容将记在此处。）

---

## [0.3.0] — 2026-07-13

**主题：中式金框牌桌布局与底牌体验**

### Added

- **左侧资源栏**：当前街次、我方筹码进度、AI 对阵列表、底池/公共牌/在局人数、练习提示
- **底部手牌托盘**：英雄底牌扇形展示 + 操作栏
- **右侧快捷键栏**
  - `F` 弃牌 · `C`/`空格` 过牌/跟注 · `R` 最小加注 · `A` 全下
  - `1`/`2` 半池/满池 · `H` 牌型速查 · `S` 设置 · `T` 教程
- **桌边雕花**：四角金饰、铆钉点缀、内圈雕花环、桌心徽章
- 底牌 **xl** 超大尺寸；**悬停上浮**、**点击选中/取消** 动效（尊重 `prefers-reduced-motion`）

### Changed

- 视觉由赛博霓虹改为 **中式豪华绿毡金框**（暗木大厅、米白牌面、金色主按钮、宋体标题）
- 对局页 **一屏 `100dvh` 布局**，降低底栏高度，减少滚动
- 底牌由左侧贴边改为 **正中大号扇形** 突出显示
- 操作栏嵌在底牌下方（紧凑横排）

### Fixed

- **牌型速查**浮层改到右上角向下弹出，避免挡住底部手牌；支持点击外部 / `Esc` 关闭
- 底栏与牌桌高度约束，预留上浮空间避免裁切

### Related

- PR: [#3](https://github.com/zjq-coder/texas-holdem-neon/pull/3)、[#4](https://github.com/zjq-coder/texas-holdem-neon/pull/4)
- 分支：`feature/texas-holdem`

---

## [0.2.0] — 2026-07-12

**主题：完整可玩 + 产品壳**

### Added

- 完整 **6 人无限注德州扑克** 引擎
  - 牌组 / Fisher–Yates 洗牌
  - 7 选 5 牌型评估（中文牌型名，含 A-5 顺子）
  - 主池与多层边池；空资格池退还；未跟注多余退回
  - 街间推进、BB 期权、加注重开、全下 runout
- **AI 三档**：紧 / 标准 / 松（不偷看对手底牌）
- React **GameProvider**：AI 延迟行动、设置持久化
- **牌桌 UI**：座位环、公共牌、ActionBar（弃/过·跟/加/全下 + 滑条）
- 开局屏、**教程**四步引导、**设置**面板、**摊牌/终局**弹层
- **牌型速查**、本手提示、Web Audio 音效
- 会话终局：英雄破产 / 独赢 → 重新开始
- 摊牌最佳五张高亮、轻量筹码动效
- 文档：设计规格、实现计划、README
- 引擎单测（约 47 条）：牌组、牌型、边池、状态机、AI

### Changed

- 初始视觉：赛博霓虹主题（后续 0.3.0 已替换）

### Related

- PR: [#1](https://github.com/zjq-coder/texas-holdem-neon/pull/1)
- 规格：`docs/superpowers/specs/2026-07-12-texas-holdem-design.md`
- 计划：`docs/superpowers/plans/2026-07-12-texas-holdem.md`

---

## [0.1.0] — 2026-07-12

**主题：脚手架与设计定稿**

### Added

- Vite + React 18 + TypeScript + Vitest 脚手架
- Design tokens 与全局样式
- 产品规格与实现计划文档

---

## 链接

- 仓库：https://github.com/zjq-coder/texas-holdem-neon
- 默认开发分支（完整 UI）：`feature/texas-holdem`
- 运行：`npm install` → `npm run dev`
