# Task 4 Report: 边池 pots

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/engine/pots.ts` | Created |
| `src/engine/__tests__/pots.test.ts` | Created |

## API
- `computePots(seats: Pick<Seat,'id'|'totalBetThisHand'|'folded'>[]): Pot[]`
- 规则：按 `totalBetThisHand` 正投入档位升序分层；每层 `amount = delta × 投入≥该层人数`（含弃牌）；`eligibleSeatIds` 不含 `folded`。

## Algorithm
1. 收集 `totalBetThisHand > 0` 去重排序为 levels
2. 对每个 level：`delta = level - prev`
3. `amount = delta * contributors.length`（contributors = 投入 ≥ level）
4. `eligibleSeatIds` = contributors 中 `!folded` 的 id

## Commits
- `f7c8916` feat(engine): compute main and side pots

## Tests
```
npm test
✓ pots.test.ts (3)
✓ deck.test.ts (3)
✓ handEval.test.ts (8)
Total: 14 passed
```

Coverage: even main pot; short all-in side pot; folded chips in amount but not eligible.

## Concerns
- 若某层仅弃牌者投入，`eligibleSeatIds` 为空但 pot 仍入列表（金额需在 showdown/uncontested 分发时处理）。
- 未覆盖多层全下（>2 档）与零投入座位；算法已支持多层，零投入自然被 filter 掉。
- 未做 TDD 红灯提交；实现与测试同批落地。

---

## Follow-up: multi-level side pots test (Important finding)

### Status
**DONE**

### Work
- Added unit test for 3-tier side pots (contributions 30/50/100, three non-folded players).
- Asserts pot amounts: 90 / 40 / 50 and `eligibleSeatIds`: `['a','b','c']` / `['b','c']` / `['c']`.
- Asserts total chips conserved (sum of pots === sum of contributions).

### File
- `src/engine/__tests__/pots.test.ts` only (implementation already supported N tiers).

### Commit
- `41ac7b1` test(engine): cover multi-level side pots

### Tests
```
npm test
✓ pots.test.ts (4)
✓ deck.test.ts (3)
✓ handEval.test.ts (8)
Total: 15 passed
```
