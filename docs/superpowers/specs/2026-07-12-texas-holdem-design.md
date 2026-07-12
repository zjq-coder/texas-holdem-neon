# 德州扑克（赛博霓虹赌场）— 设计规格

**日期**：2026-07-12  
**状态**：已确认（用户通过架构 / 界面 / 玩法）  
**产品形态**：浏览器本地单页应用，单人对战 AI + 练习/教程

---

## 1. 目标与成功标准

### 1.1 目标

开发一款界面炫酷的无限注德州扑克（No-Limit Hold'em）：玩家与 5 个 AI 同桌，支持完整一手牌流程、教程引导与牌局内练习辅助。视觉方向为「赛博霓虹赌场」。

### 1.2 验收标准

1. 能完整打完至少一手（含摊牌收池或弃牌收池）。
2. 有人全下时边池计算正确。
3. 呈现赛博霓虹牌桌，具备发牌、筹码飞入、翻牌等动效。
4. 教程可走完；牌局内提示可开关。
5. 中文 UI 为主。

### 1.3 明确不做（YAGNI）

- 在线联机、账号系统、真钱
- 锦标赛结构 / 涨盲表（可后续扩展）
- 多桌、旁观、聊天
- GTO 求解器级 AI

---

## 2. 技术选型

| 项 | 选择 | 理由 |
|----|------|------|
| 框架 | Vite + React 18 + TypeScript | 状态机友好、迭代快、类型安全 |
| 样式 | CSS 变量（design tokens）+ CSS Modules / 全局主题 | 霓虹辉光与动画可控，无重依赖 |
| 状态 | `useReducer` + React Context（或等价轻量 store） | 游戏状态单向数据流清晰 |
| 后端 | 无 | 本地单机即可满足需求 |
| 持久化 | `localStorage`（仅偏好与教程进度） | 进行中的一手不持久化 |

---

## 3. 架构

### 3.1 目录结构

```
src/
  engine/           # 纯逻辑，无 React、无 DOM
    deck.ts         # 52 张牌、洗牌、发牌
    handEval.ts     # 7 选 5 牌型评估与比牌
    rules.ts        # 盲注、行动顺序、最小加注、边池
    game.ts         # 一局状态机
    ai.ts           # AI 决策
    types.ts        # 共享类型
  ui/
    Table.tsx       # 椭圆牌桌与座位环
    Card.tsx        # 牌面与翻转动效
    ChipStack.tsx   # 筹码与飞入动效
    ActionBar.tsx   # 弃牌 / 过牌·跟注 / 加注
    Tutorial.tsx    # 引导遮罩与牌型速查
    StartScreen.tsx # 开局与入口
    Settings.tsx    # 设置面板
    Showdown.tsx    # 结算层
  store/
    gameStore.tsx   # dispatch / state 上下文
  styles/
    tokens.css      # 色板、字体、间距
    animations.css  # keyframes
    global.css
  App.tsx
  main.tsx
```

### 3.2 分层原则

- **engine**：纯函数 + 不可变状态更新；输入 `GameState` + `Action`，输出新 `GameState`（或错误）。
- **ui**：只负责渲染与收集用户意图；不实现比牌或边池算法。
- **store**：连接 engine 与 ui；处理 AI 思考延迟（`setTimeout`）、教程标志位。

### 3.3 数据流

1. engine 产出完整 `GameState`（座位、底池/边池、公共牌、当前行动者、合法操作列表）。
2. UI 根据 state 渲染；玩家点击 → `dispatch(PlayerAction)` → engine 归约下一状态。
3. 轮到 AI：store 在延迟后调用 `ai.decide(state, seatIndex, difficulty)`，再 `dispatch` 同一套 action。
4. 一手结束 → 结算 UI → 可选「再来一手」（重置一手，保留筹码与庄家轮转）。

### 3.4 一局生命周期

```
新一手 → 收盲 → 发底牌 → 翻前下注
  → 翻牌(3) → 下注 → 转牌(1) → 下注 → 河牌(1) → 下注
  → 摊牌 / 仅一人存活 → 分池 → 淘汰 0 筹码座位
  → 你归零则本局结束，否则可继续下一手
```

---

## 4. 领域模型（核心类型）

```ts
type Suit = 's' | 'h' | 'd' | 'c';
type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 14 = Ace

interface Card {
  rank: Rank;
  suit: Suit;
}

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handOver';

type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn';

interface PlayerAction {
  type: PlayerActionType;
  amount?: number; // raise 目标注额或 all-in 总额语义在 engine 内统一
}

interface Seat {
  id: string;
  name: string;
  isHero: boolean;
  isAI: boolean;
  stack: number;
  holeCards: Card[] | null; // 未发牌 / 弃牌后对他人可隐藏
  betThisStreet: number;
  totalBetThisHand: number;
  folded: boolean;
  allIn: boolean;
  isDealer: boolean;
}

interface Pot {
  amount: number;
  eligibleSeatIds: string[];
}

interface GameState {
  seats: Seat[];
  communityCards: Card[];
  deck: Card[];
  street: Street;
  pots: Pot[];
  currentBet: number;
  minRaise: number;
  actionSeatIndex: number | null;
  sbIndex: number;
  bbIndex: number;
  handNumber: number;
  winners?: { seatId: string; amount: number; handName?: string }[];
  lastActionLog: string[];
}
```

实现时可微调字段名，但语义保持一致。

---

## 5. 玩法规则

### 5.1 桌型与初始参数

| 参数 | 值 |
|------|-----|
| 人数 | 6（Hero + 5 AI） |
| 开局筹码 | 每人 10,000 |
| 小盲 / 大盲 | 50 / 100 |
| 下注结构 | 无限注（No-Limit） |

### 5.2 行动与顺序

- 庄家按钮（D）每手顺时针移动一席。
- 翻前：小盲、大盲之后，从大盲下一位开始；翻后：从小盲位起（若已弃则下一位未弃牌者）。
- 合法操作：弃牌、过牌（当前街无人下注且无需跟注时）、跟注、加注（加注增量 ≥ 最小加注）、全下。
- 最小加注：至少为上一次加注的增量（标准 NLHE）；开局最小加注为大盲。

### 5.3 边池

- 当一名或多名玩家全下时，按投入额分层构建主池与边池。
- 仅对该池有资格的玩家参与比牌分配。
- 未弃牌且有资格者平分时，奇数筹码按惯例分给最接近庄家左侧的获胜者（实现时写清并固定一种规则）。

### 5.4 比牌

- 每位未弃牌玩家用 2 张底牌 + 最多 5 张公共牌，取最佳 5 张。
- 牌型从高到低：皇家同花顺、同花顺、四条、葫芦、同花、顺子、三条、两对、一对、高牌。
- 同牌型比踢脚；完全相同则平分该池。

### 5.5 淘汰与终局

- 一手结束后筹码为 0 的 AI 标记为淘汰，不再参与后续手。
- Hero 筹码为 0：本局结束，提供「重新开始」。
- 仅剩 Hero 一人有筹码：宣布胜利，可重开。

---

## 6. AI

### 6.1 原则

- 不看 Hero 底牌；仅用自己底牌、公共牌、底池赔率粗估、位置与历史行动风格。
- 决策带随机扰动，避免完全可预测。

### 6.2 难度

| 档位 | 行为 |
|------|------|
| 紧 | 弱牌高弃牌率；强牌加注；诈唬少 |
| 标准（默认） | 中等牌可跟注/小加注；少量半诈唬 |
| 松 | 进池多；更爱跟注与诈唬 |

### 6.3 节奏

- 思考延迟约 400–1200ms，随「动画速度」设置缩放。
- AI 昵称固定赛博风（如 VEX、NOVA、GHOST、PULSE、HEX）；头像为几何霓虹图标。

### 6.4 决策输入（概念）

- 翻前：起手牌强度分桶（高/中/低）。
- 翻后：手牌类别（成牌 / 听牌 / 空气）+ 相对牌力粗分。
- 结合 `toCall / pot`、是否位置有利、难度档位阈值表输出 fold / check / call / raise / allIn。

---

## 7. 教程与练习

### 7.1 教程模式（首次引导）

分 4 步遮罩高亮：

1. 庄家按钮与盲注位  
2. Hero 手牌  
3. 操作栏含义（弃 / 过·跟 / 加）  
4. 公共牌与摊牌概念  

可跳过；完成后写入 `localStorage`，之后默认进入「开始牌局」。

### 7.2 牌局内辅助（可开关）

- **牌型速查**：九种牌型中文名 + 简短说明。
- **本手提示**：根据 Hero 底牌与公共牌给一句建议（弃/看/跟/加），**不自动操作**。
- **摊牌**：高亮参与比牌的最佳五张，显示牌型中文名。

### 7.3 持久化键（建议）

- `poker.tutorialDone: boolean`
- `poker.settings: { difficulty, sfx, animationSpeed, hintsEnabled, playerName? }`

进行中的 `GameState` **不**写入 `localStorage`（刷新即新局）。

---

## 8. 界面与视觉

### 8.1 方向

赛博霓虹赌场：深空黑背景、品红/电青霓虹、金色筹码高光、发光椭圆牌桌。

### 8.2 色板

| 名称 | Hex | 用途 |
|------|-----|------|
| Void | `#07060B` | 页面背景 |
| Felt | `#0B1F1A`（边缘更暗） | 桌面 |
| Neon Magenta | `#FF2BD6` | 主强调、按钮、边框辉光 |
| Neon Cyan | `#2DE2E6` | 次强调、公共牌区、提示 |
| Gold | `#F5C542` | 筹码、底池、Dealer 钮 |
| Smoke | `#A8A4B8` | 次要文字 |

### 8.3 字体

- Display：`Orbitron` 或 `Rajdhani` — 标题、底池、按钮  
- Body：`Noto Sans SC` — 中文说明、教程  
- Mono：`JetBrains Mono` — 筹码数字  

### 8.4 布局

- 桌面优先，兼顾平板宽度。
- 6 座沿椭圆排布；Hero 在正下方，手牌更大更亮。
- 顶栏：Logo、盲注显示、教程入口、设置。
- 桌心：公共牌 + 底池金额。
- 底栏：ActionBar（弃牌 / 过牌·跟注 / 加注滑条 + 快捷 1/2 池、满池、All-in）。

### 8.5 签名视觉

**电弧牌桌**：椭圆桌沿品红→青色缓慢流动的霓虹光带；当前行动座位脉冲光环；Hero 手牌细青光描边。其它装饰克制。

### 8.6 动效

1. 发牌：从中央牌堆飞到座位，轻旋转。  
2. 下注：筹码弧线入池。  
3. 翻开公共牌：3D 翻转 + 短暂霓虹闪。  
4. 赢池：筹码飞回赢家 + 短金色爆发。  
5. 按钮 hover 霓虹外扩。  

必须尊重 `prefers-reduced-motion: reduce`（减弱或关闭非必要动画）。

### 8.7 辅助界面

- 开局屏：「开始牌局」「教程模式」。
- 设置：音效、AI 难度、动画快慢、提示开关。
- 结算弹层：赢家、牌型、金额、「再来一手」。

### 8.8 音效

轻量短音效（发牌、下注、赢池）；默认可开，设置可关。不做强制 BGM。

---

## 9. 错误处理与边界

- engine 对非法 action 拒绝并保持状态不变（UI 只展示合法按钮，双保险）。
- 全员 all-in 后提前发完公共牌至摊牌，跳过无效下注轮。
- 仅两人且一方 all-in：跑完公共牌比牌。
- 洗牌使用 Fisher–Yates + `crypto.getRandomValues`（可用处）或高质量 PRNG。

---

## 10. 测试策略

| 层级 | 内容 |
|------|------|
| 单元测试（engine） | 牌型评估样例、同花顺 A-5、边池多层级、行动顺序、盲注 |
| 手工验收 | 完整一手、全下边池、教程四步、提示开关、reduced-motion |

比牌与边池为最高优先级测试；UI 动效以手工验收为主。

---

## 11. 实现阶段建议（供后续 plan 拆分）

1. 脚手架（Vite React TS）+ tokens + 空牌桌壳  
2. engine：牌组、评估、状态机、边池  
3. store 接线 + 最小可玩（无动画）  
4. AI + 多座位 UI  
5. 霓虹视觉与动效打磨  
6. 教程 / 提示 / 设置 / 音效  
7. 测试与验收对照第 1.2 节  

---

## 12. 决策记录

| 决策 | 选择 |
|------|------|
| 玩法模式 | 单人 + AI + 练习/教程 |
| 视觉 | 赛博霓虹赌场 |
| 规模 | 6 人精品完整一局 |
| 技术 | Vite + React + TypeScript，纯 CSS 动画 |
| 联机 | 不做 |
| 进行中牌局刷新 | 不恢复，开新局 |
