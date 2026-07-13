# Task 3 Report: 牌型评估 handEval

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/engine/handEval.ts` | Created |
| `src/engine/__tests__/handEval.test.ts` | Created |

## API
- `HandRankCategory`: `0` 高牌 … `9` 皇家同花顺
- `HandValue`: `{ category, ranks, bestFive, name }`
- `evaluateSeven(cards)`: 5–7 张取最佳五张；`<5` throw
- `compareHandValues(a, b)`: `>0` a 胜，`0` 平，`<0` b 胜
- `handNameZh(category)`: 中文牌型名

## Algorithm
1. 枚举 C(n,5) 所有五张组合
2. 单组评分：rank 频次 + 同花 + 顺子（含 wheel A-5，高牌记 5）
3. 皇家同花顺 = 同花顺且 straightHigh === 14（A-K-Q-J-T）
4. `ranks` 为踢脚比较向量；`compare` 先 category 再 ranks

## Commits
- `083de6e` feat(engine): evaluate 7-card hands with Chinese names

## Tests
```
npm test
✓ deck.test.ts (3)
✓ handEval.test.ts (8)
Total: 11 passed
```

Coverage includes: royal flush, wheel A-5, quads > boat, pair kickers, flush > straight, handNameZh map, <5 throw, equal hands.

## Concerns
- 同花顺非 A 高时 category=8；仅 A 高同花顺记皇家（标准 T-A）。
- `bestFive` 按 rank 降序排列，非原始输入顺序。
- 未单独测同花顺 / 两对 / 葫芦边界；现有组合覆盖主要 category 比较路径。
