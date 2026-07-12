# 德州扑克（赛博霓虹赌场）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建浏览器本地 6 人无限注德州扑克：玩家 vs 5 AI，完整一手流程与边池，赛博霓虹 UI，教程与练习提示。

**Architecture:** 纯 TypeScript `engine/`（牌组、牌型评估、状态机、边池、AI）与 React `ui/` + `store/` 分离；`dispatch(action)` 单向更新不可变 `GameState`；CSS 变量实现霓虹主题与动效。

**Tech Stack:** Vite + React 18 + TypeScript、Vitest、CSS Modules / 全局 tokens、`localStorage`、可选 Web Audio

## Global Constraints

- 规格文档：`docs/superpowers/specs/2026-07-12-texas-holdem-design.md`
- 人数 6、开局筹码 10000、盲注 50/100、无限注
- 中文 UI；不做联机/账号/真钱
- 进行中牌局不持久化；仅偏好与教程进度进 `localStorage`
- 尊重 `prefers-reduced-motion`
- engine 无 React/DOM 依赖；非法 action 拒绝并保持状态
- 测试：Vitest 覆盖 engine（牌型、边池优先）

---

## File Structure

```
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
index.html
src/main.tsx
src/App.tsx
src/vite-env.d.ts
src/engine/types.ts
src/engine/deck.ts
src/engine/handEval.ts
src/engine/pots.ts
src/engine/game.ts
src/engine/ai.ts
src/engine/hints.ts
src/store/gameStore.tsx
src/store/settings.ts
src/ui/StartScreen.tsx
src/ui/Table.tsx
src/ui/Seat.tsx
src/ui/Card.tsx
src/ui/ChipStack.tsx
src/ui/ActionBar.tsx
src/ui/Tutorial.tsx
src/ui/SettingsPanel.tsx
src/ui/ShowdownModal.tsx
src/ui/HandRankGuide.tsx
src/styles/tokens.css
src/styles/global.css
src/styles/animations.css
src/styles/table.module.css
src/styles/card.module.css
src/styles/actionBar.module.css
src/audio/sfx.ts
src/engine/__tests__/deck.test.ts
src/engine/__tests__/handEval.test.ts
src/engine/__tests__/pots.test.ts
src/engine/__tests__/game.test.ts
src/engine/__tests__/ai.test.ts
```

---

### Task 1: 项目脚手架与设计 tokens

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/animations.css`

**Interfaces:**
- Consumes: 无
- Produces: 可 `npm run dev` 的空壳；CSS 变量 `--void`, `--felt`, `--magenta`, `--cyan`, `--gold`, `--smoke`

- [ ] **Step 1: 初始化 Vite React-TS 项目**

在仓库根目录（已有 `docs/` 与 `.git`）执行：

```bash
npm create vite@latest . -- --template react-ts
```

若提示目录非空，选择覆盖/合并；保留 `docs/` 与已有 git 历史。然后：

```bash
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: 配置 Vitest**

在 `vite.config.ts` 中：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`package.json` scripts 增加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: 写入 design tokens 与全局样式**

`src/styles/tokens.css`:

```css
:root {
  --void: #07060b;
  --felt: #0b1f1a;
  --felt-edge: #050f0c;
  --magenta: #ff2bd6;
  --cyan: #2de2e6;
  --gold: #f5c542;
  --smoke: #a8a4b8;
  --text: #f2f0f7;
  --danger: #ff4d6d;
  --radius-lg: 24px;
  --font-display: "Orbitron", "Rajdhani", system-ui, sans-serif;
  --font-body: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --glow-magenta: 0 0 12px rgba(255, 43, 214, 0.65), 0 0 28px rgba(255, 43, 214, 0.35);
  --glow-cyan: 0 0 12px rgba(45, 226, 230, 0.65), 0 0 28px rgba(45, 226, 230, 0.35);
  --glow-gold: 0 0 10px rgba(245, 197, 66, 0.55);
}
```

`src/styles/global.css`：引入 Google Fonts（Orbitron、Noto Sans SC、JetBrains Mono）、`body` 背景 `--void`、中文默认 `font-family: var(--font-body)`、全屏 `#root` 布局。

`src/styles/animations.css`：预留 `@keyframes deal-in`, `chip-fly`, `pulse-ring`, `neon-flow`；并加：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: 最小 App 壳**

`src/App.tsx` 渲染居中标题「霓虹德州」与副标题「CYBER HOLD'EM」，背景全屏 void。`main.tsx` 引入 `tokens.css` / `global.css` / `animations.css`。

- [ ] **Step 5: 验证与提交**

```bash
npm run dev
npm test
```

Expected: 页面可开；测试 0 个也可通过。

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src
git commit -m "chore: scaffold Vite React TS with neon design tokens"
```

---

### Task 2: engine 类型与牌组

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/deck.ts`
- Create: `src/engine/__tests__/deck.test.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `export type Suit = 's' | 'h' | 'd' | 'c'`
  - `export type Rank = 2|3|4|5|6|7|8|9|10|11|12|13|14`
  - `export interface Card { rank: Rank; suit: Suit }`
  - `export function createDeck(): Card[]`
  - `export function shuffle(deck: Card[], rng?: () => number): Card[]`
  - `export function cardId(c: Card): string` // e.g. "As", "Td"
  - `export function parseCard(id: string): Card`

- [ ] **Step 1: 写失败测试**

`src/engine/__tests__/deck.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, parseCard, cardId } from '../deck'

describe('deck', () => {
  it('createDeck has 52 unique cards', () => {
    const d = createDeck()
    expect(d).toHaveLength(52)
    const ids = new Set(d.map(cardId))
    expect(ids.size).toBe(52)
  })

  it('shuffle preserves multiset', () => {
    const d = createDeck()
    const s = shuffle(d, () => 0.5)
    expect(s).toHaveLength(52)
    expect(new Set(s.map(cardId)).size).toBe(52)
  })

  it('parseCard roundtrips', () => {
    expect(cardId(parseCard('As'))).toBe('As')
    expect(cardId(parseCard('Td'))).toBe('Td')
    expect(parseCard('2c')).toEqual({ rank: 2, suit: 'c' })
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npm test
```

Expected: FAIL cannot find module `../deck`

- [ ] **Step 3: 实现 types + deck**

`types.ts` 按规格定义 `Suit`, `Rank`, `Card`，以及后续会用到的：

```ts
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handOver'

export type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn'

export interface PlayerAction {
  type: PlayerActionType
  /** raise: 本街总投入目标（含已投入）；allIn 可省略 */
  amount?: number
}

export interface Seat {
  id: string
  name: string
  isHero: boolean
  isAI: boolean
  stack: number
  holeCards: Card[] | null
  betThisStreet: number
  totalBetThisHand: number
  folded: boolean
  allIn: boolean
  sittingOut: boolean
}

export interface Pot {
  amount: number
  eligibleSeatIds: string[]
}

export interface WinnerInfo {
  seatId: string
  amount: number
  handName?: string
  bestFive?: Card[]
}

export interface GameState {
  seats: Seat[]
  communityCards: Card[]
  deck: Card[]
  street: Street
  pots: Pot[]
  /** 当前街需要跟到的本街下注额 */
  currentBet: number
  /** 本街最小加注增量 */
  minRaise: number
  actionSeatIndex: number | null
  dealerIndex: number
  sbIndex: number
  bbIndex: number
  handNumber: number
  smallBlind: number
  bigBlind: number
  winners: WinnerInfo[] | null
  lastActionLog: string[]
  /** 本手是否已发过手牌 */
  holeCardsDealt: boolean
}
```

`deck.ts`：`RANKS`, `SUITS` 生成 52 张；Fisher–Yates `shuffle`；`cardId` 用 `A,K,Q,J,T,9..2` + suit 字符。

- [ ] **Step 4: 测试通过并提交**

```bash
npm test
git add src/engine
git commit -m "feat(engine): add card types and shuffleable deck"
```

---

### Task 3: 牌型评估 handEval

**Files:**
- Create: `src/engine/handEval.ts`
- Create: `src/engine/__tests__/handEval.test.ts`

**Interfaces:**
- Consumes: `Card` from `types.ts` / `parseCard` from `deck.ts`
- Produces:
  - `export type HandRankCategory = 0|1|2|3|4|5|6|7|8|9` // high..royal
  - `export interface HandValue { category: HandRankCategory; ranks: number[]; bestFive: Card[]; name: string }`
  - `export function evaluateSeven(cards: Card[]): HandValue` // 5–7 张均可，取最佳 5
  - `export function compareHandValues(a: HandValue, b: HandValue): number` // >0 a 胜
  - `export function handNameZh(category: HandRankCategory): string`

牌型 category：`9` 皇家同花顺 … `0` 高牌（实现内固定映射表）。

- [ ] **Step 1: 写失败测试（覆盖关键边界）**

```ts
import { describe, it, expect } from 'vitest'
import { parseCard } from '../deck'
import { evaluateSeven, compareHandValues } from '../handEval'

const C = (...ids: string[]) => ids.map(parseCard)

describe('handEval', () => {
  it('detects royal flush', () => {
    const h = evaluateSeven(C('As', 'Ks', 'Qs', 'Js', 'Ts', '2d', '3c'))
    expect(h.name).toMatch(/皇家同花顺/)
  })

  it('detects wheel straight A-5', () => {
    const h = evaluateSeven(C('As', '2d', '3c', '4h', '5s', '9d', '9c'))
    expect(h.name).toMatch(/顺子/)
  })

  it('four of a kind beats full house', () => {
    const quads = evaluateSeven(C('Ah', 'Ad', 'Ac', 'As', 'Kd', '2c', '3h'))
    const boat = evaluateSeven(C('Kh', 'Kd', 'Kc', 'Qs', 'Qd', '2c', '3h'))
    expect(compareHandValues(quads, boat)).toBeGreaterThan(0)
  })

  it('pair kicker decides', () => {
    const a = evaluateSeven(C('Ah', 'Kd', '2c', '2s', '3h', '7d', '9c'))
    const b = evaluateSeven(C('Qh', 'Jd', '2c', '2s', '3h', '7d', '9c'))
    // 公共对2，比踢脚 — 用各自7张
    expect(compareHandValues(a, b)).toBeGreaterThan(0)
  })

  it('flush beats straight', () => {
    const flush = evaluateSeven(C('2h', '5h', '9h', 'Jh', 'Kh', '3c', '4d'))
    const straight = evaluateSeven(C('6c', '7d', '8s', '9h', 'Td', '2c', '3h'))
    expect(compareHandValues(flush, straight)).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npm test -- src/engine/__tests__/handEval.test.ts
```

Expected: FAIL module not found

- [ ] **Step 3: 实现 evaluateSeven**

算法要点：
1. 若 `cards.length < 5` throw。
2. 枚举所有 5 张组合（C(7,5)=21），对每组打分取最大。
3. 单组 5 张评分：统计 rank 频次与同花；顺子含 A-2-3-4-5（wheel，高牌记 5）。
4. `ranks` 为比较向量（先 category，再主牌，再踢脚）。
5. `name` 用中文：`handNameZh`。

- [ ] **Step 4: 测试通过并提交**

```bash
npm test
git add src/engine/handEval.ts src/engine/__tests__/handEval.test.ts
git commit -m "feat(engine): evaluate 7-card hands with Chinese names"
```

---

### Task 4: 边池 pots

**Files:**
- Create: `src/engine/pots.ts`
- Create: `src/engine/__tests__/pots.test.ts`

**Interfaces:**
- Consumes: `Seat`, `Pot` from `types.ts`
- Produces:
  - `export function computePots(seats: Pick<Seat,'id'|'totalBetThisHand'|'folded'>[]): Pot[]`
  - 规则：按 `totalBetThisHand` 分层；弃牌者的筹码进入池但 `eligibleSeatIds` 不含弃牌者；`amount` 为该层总筹码。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import { computePots } from '../pots'

describe('computePots', () => {
  it('single main pot when even contributions', () => {
    const pots = computePots([
      { id: 'a', totalBetThisHand: 100, folded: false },
      { id: 'b', totalBetThisHand: 100, folded: false },
    ])
    expect(pots).toEqual([{ amount: 200, eligibleSeatIds: ['a', 'b'] }])
  })

  it('side pot when one all-in short', () => {
    // a 全下 50, b/c 各 100
    const pots = computePots([
      { id: 'a', totalBetThisHand: 50, folded: false },
      { id: 'b', totalBetThisHand: 100, folded: false },
      { id: 'c', totalBetThisHand: 100, folded: false },
    ])
    expect(pots).toHaveLength(2)
    expect(pots[0]).toEqual({ amount: 150, eligibleSeatIds: ['a', 'b', 'c'] })
    expect(pots[1]).toEqual({ amount: 100, eligibleSeatIds: ['b', 'c'] })
  })

  it('folded player chips in pot but not eligible', () => {
    const pots = computePots([
      { id: 'a', totalBetThisHand: 100, folded: true },
      { id: 'b', totalBetThisHand: 100, folded: false },
      { id: 'c', totalBetThisHand: 100, folded: false },
    ])
    expect(pots[0].amount).toBe(300)
    expect(pots[0].eligibleSeatIds).toEqual(['b', 'c'])
  })
})
```

- [ ] **Step 2–4: 实现、测通、提交**

实现：收集所有正投入档位排序去重，逐层计算 delta × 仍有资格的投入人数（含已弃但投入≥该层者贡献金额）。

```bash
npm test
git add src/engine/pots.ts src/engine/__tests__/pots.test.ts
git commit -m "feat(engine): compute main and side pots"
```

---

### Task 5: 游戏状态机 game.ts

**Files:**
- Create: `src/engine/game.ts`
- Create: `src/engine/__tests__/game.test.ts`

**Interfaces:**
- Consumes: `types`, `deck`, `handEval`, `pots`
- Produces:
  - `export const DEFAULT_STACK = 10_000`
  - `export const DEFAULT_SB = 50`
  - `export const DEFAULT_BB = 100`
  - `export function createInitialTable(heroName?: string): GameState` — 6 座，Hero 为 index 0 或底部约定 index 3；建议 **Hero 固定 seats[0]**，UI 再映射到底座。
  - `export function startHand(state: GameState, rng?: () => number): GameState`
  - `export function getLegalActions(state: GameState): PlayerAction[]` — 对 `actionSeatIndex`；raise 用可选 amount 范围元数据：同时 export `export function getRaiseBounds(state): { min: number; max: number } | null` 其中 min/max 为本街总投入目标。
  - `export function applyAction(state: GameState, action: PlayerAction): GameState`
  - `export function isHeroTurn(state: GameState): boolean`

**行为细节（必须遵守）：**

1. `startHand`：移除 `stack===0` 为 `sittingOut`；庄家位 `dealerIndex = (prev+1)%n`（跳过 sittingOut）；设 sb/bb；收盲（不足则 all-in）；洗牌发每人 2 张；`street=preflop`；`currentBet=bb`；`minRaise=bb`；行动人为 bb 下一位未弃未坐出。
2. `applyAction`：校验合法；更新 stack/bet；若街结束则发公共牌或进入 showdown。
3. 街结束条件：每位未弃非 all-in 玩家本街 `betThisStreet === currentBet` 且都已行动至少一次（大盲翻前期权：若无人加注，大盲还可 check/raise —— 用 `playersActedThisStreet` Set 或 `pendingToAct` 计数实现）。
4. 全员 all-in 或只剩 ≤1 人可行动：跑完公共牌至 5 张 → showdown。
5. 只剩 1 人未弃：直接 `handOver`，该玩家赢全部 `pots`（用 `computePots`）。
6. showdown：对每个 pot，在 eligible 中 `evaluateSeven` 比牌；平分时奇数筹码给最靠庄家左侧的获胜者（从 dealer 下一位起扫）。
7. 非法 action：`return state`（引用相等或深等均可，测试用结果字段判断未变）。

- [ ] **Step 1: 写失败测试（核心路径）**

```ts
import { describe, it, expect } from 'vitest'
import {
  createInitialTable,
  startHand,
  applyAction,
  getLegalActions,
  DEFAULT_BB,
} from '../game'

// 固定 RNG：总是返回 0，使 shuffle 可重复（或注入已洗牌状态的测试辅助）
function rngSeq(values: number[]) {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('game', () => {
  it('createInitialTable has 6 seats and hero', () => {
    const s = createInitialTable('你')
    expect(s.seats).toHaveLength(6)
    expect(s.seats.filter((x) => x.isHero)).toHaveLength(1)
    expect(s.seats.every((x) => x.stack === 10_000)).toBe(true)
  })

  it('startHand posts blinds and deals 2 cards', () => {
    let s = createInitialTable()
    s = startHand(s, () => 0.1)
    expect(s.street).toBe('preflop')
    expect(s.seats.every((x) => x.holeCards?.length === 2)).toBe(true)
    const sb = s.seats[s.sbIndex]!
    const bb = s.seats[s.bbIndex]!
    expect(sb.betThisStreet).toBe(s.smallBlind)
    expect(bb.betThisStreet).toBe(s.bigBlind)
  })

  it('fold folds hero and may end hand if all others fold chain', () => {
    let s = startHand(createInitialTable(), () => 0.2)
    // 将行动转到 hero：循环 fold AI until hero or hand over
    for (let i = 0; i < 12; i++) {
      if (s.street === 'handOver') break
      const seat = s.actionSeatIndex
      if (seat === null) break
      if (s.seats[seat]!.isHero) {
        s = applyAction(s, { type: 'fold' })
        expect(s.seats[seat]!.folded).toBe(true)
        break
      }
      const legal = getLegalActions(s)
      const fold = legal.find((a) => a.type === 'fold')
      s = applyAction(s, fold ?? legal[0]!)
    }
  })

  it('check/call path reaches flop when all call bb', () => {
    let s = startHand(createInitialTable(), () => 0.3)
    // 所有人 call 或 check 直到翻牌
    for (let guard = 0; guard < 40; guard++) {
      if (s.street !== 'preflop') break
      if (s.actionSeatIndex === null) break
      const legal = getLegalActions(s)
      const call = legal.find((a) => a.type === 'call')
      const check = legal.find((a) => a.type === 'check')
      s = applyAction(s, call ?? check ?? legal[0]!)
    }
    expect(s.street).toBe('flop')
    expect(s.communityCards).toHaveLength(3)
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npm test -- src/engine/__tests__/game.test.ts
```

- [ ] **Step 3: 实现 game.ts**

建议内部辅助：
- `nextActiveSeat(state, fromExclusive): number | null`
- `activeContenders(state)` — 未弃牌且未 sittingOut
- `canStillAct(seat)` — 未弃未 all-in 未 sittingOut
- `streetComplete` / `advanceStreet` / `runoutAndShowdown` / `awardPots`

AI 名字固定：`['VEX','NOVA','GHOST','PULSE','HEX']`。

- [ ] **Step 4: 测通并提交**

```bash
npm test
git add src/engine/game.ts src/engine/__tests__/game.test.ts
git commit -m "feat(engine): NLHE hand state machine with blinds and streets"
```

---

### Task 6: AI 决策

**Files:**
- Create: `src/engine/ai.ts`
- Create: `src/engine/__tests__/ai.test.ts`

**Interfaces:**
- Consumes: `GameState`, `PlayerAction`, `getLegalActions`, `getRaiseBounds`, `evaluateSeven`
- Produces:
  - `export type AiDifficulty = 'tight' | 'standard' | 'loose'`
  - `export function decideAction(state: GameState, difficulty: AiDifficulty, rng?: () => number): PlayerAction`
  - 仅使用 `state.seats[actionSeatIndex]` 的底牌 + 公共牌；禁止读取其他座位 holeCards。

**决策大纲：**

1. 取 `legal = getLegalActions(state)`。
2. 翻前：用简化 chen 分或对子/高张表得 `strength 0..1`。
3. 翻后：`evaluateSeven(hole+board)` 的 category 映射 strength；听牌粗略（同花抽/两头顺抽）+0.15。
4. 阈值随 difficulty：tight 更高弃牌线；loose 更低。
5. 若 strength 高且可 raise：以 `min` 或 `min*2` 或 all-in（小概率）。
6. 中等：call/check；低：fold（可 check 则 check）。
7. 输出必须是 legal 中的 action（raise 的 amount 夹在 bounds 内）。

- [ ] **Step 1: 测试**

```ts
import { describe, it, expect } from 'vitest'
import { createInitialTable, startHand, getLegalActions } from '../game'
import { decideAction } from '../ai'

describe('ai', () => {
  it('returns a legal action', () => {
    let s = startHand(createInitialTable(), () => 0.42)
    // 若非 AI 行动，fold/call 直到 AI
    for (let i = 0; i < 10; i++) {
      const idx = s.actionSeatIndex
      if (idx !== null && s.seats[idx]!.isAI) break
      const legal = getLegalActions(s)
      s = applyActionNeeded(s, legal) // 测试内联：优先 check/call
    }
    const idx = s.actionSeatIndex!
    expect(s.seats[idx]!.isAI).toBe(true)
    const action = decideAction(s, 'standard', () => 0.5)
    const legal = getLegalActions(s)
    expect(legal.some((a) => a.type === action.type)).toBe(true)
  })
})
```

实现测试辅助时直接 import `applyAction`。

- [ ] **Step 2–4: 实现、测通、提交**

```bash
npm test
git commit -m "feat(engine): difficulty-tiered AI decisions"
```

---

### Task 7: 提示 hints + settings 持久化

**Files:**
- Create: `src/engine/hints.ts`
- Create: `src/store/settings.ts`

**Interfaces:**
- Produces:
  - `export function suggestHint(state: GameState): string` — 一句中文建议
  - `export interface Settings { difficulty: AiDifficulty; sfx: boolean; animationSpeed: 'slow'|'normal'|'fast'; hintsEnabled: boolean; tutorialDone: boolean; playerName: string }`
  - `export const defaultSettings: Settings`
  - `export function loadSettings(): Settings`
  - `export function saveSettings(s: Settings): void` — key `poker.settings` 与 `poker.tutorialDone` 可合并进一个 JSON

- [ ] **Step 1–3: 实现 hints（基于手牌强度文案）与 settings 读写；无强制单测；手动在 node 中可测 load 默认值**

```ts
// settings.ts 核心
const KEY = 'poker.settings'
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/engine/hints.ts src/store/settings.ts
git commit -m "feat: practice hints and localStorage settings"
```

---

### Task 8: React store 与可玩循环

**Files:**
- Create: `src/store/gameStore.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces context：
  - `state: GameState`
  - `settings: Settings`
  - `phase: 'start' | 'tutorial' | 'playing' | 'showdown'`
  - `dispatchPlayerAction(action: PlayerAction): void`
  - `startNewHand(): void`
  - `startGame(fromTutorial?: boolean): void`
  - `updateSettings(partial: Partial<Settings>): void`
  - `markTutorialDone(): void`

**AI 循环：** `useEffect` 依赖 `state.actionSeatIndex` + street；若当前座是 AI 且 `street` 非 `handOver`/`showdown` 展示期，则 `delay = base * speedMul` 后 `decideAction` + `applyAction`。Hero 行动不自动。

- [ ] **Step 1: 实现 GameProvider**

```tsx
// 伪代码结构
function reduce(state, action) { return applyAction(state, action) }

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(loadSettings)
  const [table, setTable] = useState(() => createInitialTable())
  const [phase, setPhase] = useState<'start' | 'tutorial' | 'playing'>('start')
  // ...
}
```

- [ ] **Step 2: App 接入 Provider；临时调试 UI：显示 street、底池、合法按钮纯文字**

确保无样式也能：开始 → startHand → 点 call/fold → AI 自动走完翻前。

- [ ] **Step 3: 手动验证 + 提交**

```bash
npm run dev
# 手动打完一手
git add src/store/gameStore.tsx src/App.tsx
git commit -m "feat: wire game store with AI auto-act loop"
```

---

### Task 9: 牌桌 UI 组件（结构）

**Files:**
- Create: `src/ui/Card.tsx`, `src/ui/Seat.tsx`, `src/ui/ChipStack.tsx`, `src/ui/ActionBar.tsx`, `src/ui/Table.tsx`
- Create: `src/styles/card.module.css`, `src/styles/table.module.css`, `src/styles/actionBar.module.css`
- Modify: `src/App.tsx` — playing 相位渲染 `Table` + `ActionBar`

**Interfaces:**
- `CardView({ card: Card | null; faceDown?: boolean; highlight?: boolean; className?: string })`
- `SeatView({ seat: Seat; isActing: boolean; showCards: boolean })` — showCards 当 hero 或 showdown
- `ActionBar({ state, onAction })` — 仅 `isHeroTurn` 时启用；加注滑条用 `getRaiseBounds`
- `Table({ state })` — 椭圆桌、6 座绝对定位、中央 community + pot 总额

**座位几何（CSS）：** 容器 `position: relative; aspect-ratio: 16/10`；座位用百分比 top/left，Hero 底部中央。

牌面：CSS 绘制 rank/suit（红心方块用 `#ff4d6d`，黑桃梅花用近白）；背面用品红青网格。

- [ ] **Step 1: 实现 Card / Seat / ChipStack / ActionBar / Table**
- [ ] **Step 2: 接线 App，去掉临时调试按钮**
- [ ] **Step 3: 浏览器验收布局 + 提交**

```bash
git commit -m "feat(ui): poker table seats cards and action bar"
```

---

### Task 10: 赛博霓虹视觉与动效

**Files:**
- Modify: `src/styles/*`, `src/ui/Table.tsx`, `src/ui/Card.tsx`, `src/ui/Seat.tsx`
- Create: 如需 `src/ui/NeonRail.tsx` 桌沿光带

**要求对照规格：**

1. 电弧桌沿：`conic-gradient` 或 `border` + `neon-flow` 动画。
2. 行动座位 `pulse-ring`。
3. Hero 手牌 `box-shadow: var(--glow-cyan)`。
4. 发牌 `deal-in`（transform）；翻牌 `rotateY`。
5. 底池数字 Display 字体金色辉光。
6. reduced-motion 已在 Task 1 全局处理。

- [ ] **Step 1: 打磨 CSS 至「夜店赌场」观感**
- [ ] **Step 2: 截图/目视验收**
- [ ] **Step 3: 提交**

```bash
git commit -m "style: cyber neon table glow and card animations"
```

---

### Task 11: 开始屏、设置、摊牌、教程

**Files:**
- Create: `src/ui/StartScreen.tsx`, `src/ui/SettingsPanel.tsx`, `src/ui/ShowdownModal.tsx`, `src/ui/Tutorial.tsx`, `src/ui/HandRankGuide.tsx`
- Modify: `src/store/gameStore.tsx`, `src/App.tsx`

**行为：**

- StartScreen：标题「霓虹德州」、按钮「开始牌局」「教程模式」。
- Tutorial：4 步遮罩，`step` 0..3，完成/跳过 → `markTutorialDone` + `startGame`。
- SettingsPanel：难度、音效、动画速度、提示开关、关闭按钮。
- HandRankGuide：可折叠九种牌型。
- ShowdownModal：当 `state.street === 'handOver' && winners` 显示结果；「再来一手」→ `startNewHand`。
- 提示条：`settings.hintsEnabled && isHeroTurn` 时显示 `suggestHint(state)`。

- [ ] **Step 1: 实现上述组件并接入 phase 切换**
- [ ] **Step 2: 走通教程四步 + 完整一手结算**
- [ ] **Step 3: 提交**

```bash
git commit -m "feat(ui): start screen tutorial settings and showdown"
```

---

### Task 12: 音效与最终验收

**Files:**
- Create: `src/audio/sfx.ts`
- Modify: store 在发牌/下注/赢池时调用（可用 engine 的 `lastActionLog` 或 action 钩子）

**sfx.ts：** 使用 Web Audio API 短合成音（无需外部 mp3），`settings.sfx === false` 时 no-op。

- [ ] **Step 1: 实现 playDeal / playChip / playWin**
- [ ] **Step 2: 对照规格验收清单**

验收：

1. 完整一手（摊牌或弃牌收池）  
2. 人为构造全下边池（可临时在测试中已覆盖；UI 上可 all-in）  
3. 霓虹桌 + 动效  
4. 教程与提示开关  
5. 中文 UI  

```bash
npm test
npm run build
```

Expected: 全部测试 PASS；`vite build` 成功。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: sfx and final acceptance polish"
```

---

## Spec Coverage Checklist

| 规格章节 | 任务 |
|----------|------|
| Vite React TS | Task 1 |
| engine 分层 | Task 2–6 |
| 牌型 / 边池 | Task 3–4 |
| 状态机 / 盲注 / 街 | Task 5 |
| AI 三档 | Task 6 |
| 提示 / localStorage | Task 7 |
| store + AI 延迟 | Task 8 |
| 6 座 UI / ActionBar | Task 9 |
| 赛博霓虹 / 动效 / reduced-motion | Task 1, 10 |
| 教程 / 设置 / 结算 | Task 11 |
| 音效 | Task 12 |
| 验收标准 | Task 12 |
| 不做联机等 | 全局约束，无任务 |

---

## Self-Review Notes

- 无 TBD 占位；raise 语义统一为「本街总投入目标」。
- Hero 固定 `seats[0]`，与 UI 底座位映射在 Table 内完成。
- `GameState` 字段与规格一致并补充 `sittingOut` / `holeCardsDealt` / 盲注数值字段以便实现。
- 边池奇数筹码规则在 Task 5 写死为「庄家左侧优先」。
