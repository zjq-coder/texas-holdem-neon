# 霓虹德州 · CYBER HOLD'EM

浏览器本地可玩的 **6 人无限注德州扑克**：你 vs 5 个 AI，赛博霓虹赌场风格界面，含教程与练习提示。

**在线仓库：** [zjq-coder/texas-holdem-neon](https://github.com/zjq-coder/texas-holdem-neon)

---

## 功能特性

- **完整一手 NLHE**：盲注、翻前/翻牌/转牌/河牌、加注与全下、摊牌比牌
- **边池**：多层全下时按资格分池，筹码守恒
- **6 人桌**：Hero + VEX / NOVA / GHOST / PULSE / HEX（三档 AI：紧 / 标准 / 松）
- **赛博霓虹 UI**：电弧牌桌、发牌与筹码动效、行动座位光环
- **教程与练习**：分步引导、牌型速查、本手操作提示（不代打）
- **设置**：AI 难度、音效、动画速度、提示开关（`localStorage` 持久化）
- **会话终局**：破产 / 独赢后可重新开始

> 纯前端单机，无联机、无真钱。

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+（建议 20+）
- npm 9+

### 安装与运行

```bash
# 克隆
git clone https://github.com/zjq-coder/texas-holdem-neon.git
cd texas-holdem-neon

# 建议使用功能分支（完整实现）
git checkout feature/texas-holdem

# 安装依赖
npm install

# 开发服务器
npm run dev
```

浏览器打开终端提示的本地地址（一般为 `http://localhost:5173`）。

### 其他命令

```bash
npm test          # 运行引擎单元测试
npm run build     # 生产构建 → dist/
npm run preview   # 预览生产构建
```

---

## 玩法说明

| 项目 | 默认值 |
|------|--------|
| 人数 | 6（1 玩家 + 5 AI） |
| 起始筹码 | 10,000 |
| 盲注 | 小盲 50 / 大盲 100 |
| 结构 | 无限注（No-Limit） |

1. 开局页选择 **开始牌局** 或 **教程模式**
2. 轮到你时：弃牌 / 过牌·跟注 / 加注（滑条与 1/2 池、满池、全下）
3. 一手结束后可 **再来一手**；筹码归零或独赢时按提示 **重新开始**

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vite + React 18 + TypeScript |
| 样式 | CSS 变量（霓虹 tokens）+ CSS Modules |
| 状态 | React Context + `useReducer` 风格 store |
| 测试 | Vitest（engine 单元测试） |
| 音效 | Web Audio API 短合成音 |

---

## 目录结构

```
src/
  engine/       # 纯逻辑：牌组、牌型、边池、状态机、AI、提示
  store/        # 游戏状态、设置、AI 自动行动
  ui/           # 牌桌、手牌、操作栏、教程、设置、结算
  styles/       # tokens、全局样式、动画
  audio/        # 音效
docs/
  superpowers/
    specs/      # 设计规格
    plans/      # 实现计划
```

**架构要点：** `engine` 不依赖 React/DOM；UI 只通过 `dispatch` 提交动作；非法操作由引擎拒绝。

---

## 测试

引擎层覆盖洗牌、牌型评估（含 A-5 顺子）、多层边池、街间推进、全下与会话终局等：

```bash
npm test
```

当前约 **47** 条用例全部通过。

---

## 设计文档

- 规格：[`docs/superpowers/specs/2026-07-12-texas-holdem-design.md`](docs/superpowers/specs/2026-07-12-texas-holdem-design.md)
- 计划：[`docs/superpowers/plans/2026-07-12-texas-holdem.md`](docs/superpowers/plans/2026-07-12-texas-holdem.md)
- PR：[#1 feat: 赛博霓虹德州扑克完整实现](https://github.com/zjq-coder/texas-holdem-neon/pull/1)

---

## 许可

个人学习与演示项目。若需开源许可证，可后续补充 LICENSE。
