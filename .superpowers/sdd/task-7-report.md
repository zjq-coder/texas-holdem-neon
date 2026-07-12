# Task 7 Report: 提示 hints + settings 持久化

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/engine/hints.ts` | Created |
| `src/store/settings.ts` | Created |

## API
- `export function suggestHint(state: GameState): string` — 一句中文练习建议
- `export interface Settings { difficulty; sfx; animationSpeed; hintsEnabled; tutorialDone; playerName }`
- `export const defaultSettings: Settings`
- `export function loadSettings(): Settings`
- `export function saveSettings(s: Settings): void` — key `poker.settings`（含 `tutorialDone`）

## Behavior
### hints
1. 使用 Hero 底牌 + 公共牌；复用 `preflopStrength` / `postflopStrength`（不偷看他人）
2. 仅在 `isHeroTurn` 时结合 `getLegalActions` 给出 弃/看/跟/加 建议
3. 强度分桶：≥0.72 强 / ≥0.5 较好 / ≥0.32 一般 / 更低 弱
4. 摊牌/结束、已弃牌、未发牌有固定文案；只建议不操作

### settings
1. 默认：`standard` / sfx on / normal 动画 / hints on / tutorialDone false / 名「你」
2. `loadSettings`：merge JSON over defaults；缺 key、解析失败、无 `localStorage` 均回默认
3. `saveSettings`：整对象写入 `poker.settings`；无 storage 或写失败静默忽略

## Commits
- `feat: practice hints and localStorage settings`

## Smoke
```
npx tsx -e "…loadSettings / suggestHint…"
defaults match true
hint sample works on started hand
npm test → 41 passed (no new forced unit tests)
```

## Concerns
- 提示为规则分桶，非 GTO；强度阈值与 AI standard 大致对齐。
- 非 Hero 行权时只给牌力倾向（无合法动作列表）。
- `tsc -p tsconfig.app.json` 仍有既有 `ai.ts` Rank 类型告警（与本任务无关）。
