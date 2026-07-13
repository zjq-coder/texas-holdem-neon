# Task 6 Report: AI 决策

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/engine/ai.ts` | Created |
| `src/engine/__tests__/ai.test.ts` | Created |

## API
- `export type AiDifficulty = 'tight' | 'standard' | 'loose'`
- `export function decideAction(state, difficulty, rng?): PlayerAction`
- Helpers (testable): `preflopStrength`, `postflopStrength`

## Behavior
1. Uses **only** `seats[actionSeatIndex].holeCards` + `communityCards` (no peeking)
2. Preflop: simplified Chen → strength `0..1`
3. Postflop: `evaluateSeven` category map; flush/OESD draw **+0.15** on weak made hands
4. Thresholds: tight higher fold line; loose lower; medium → call/check
5. Strong + raise legal: `min` / `min*2` / all-in (small prob); amount clamped to bounds
6. Weak: check if free, else fold
7. Output always legal action type; raise amounts within `getRaiseBounds`

## Commits
- `feat(engine): difficulty-tiered AI decisions`

## Tests
```
npm test
✓ deck.test.ts (3)
✓ pots.test.ts (5)
✓ handEval.test.ts (8)
✓ game.test.ts (18)
✓ ai.test.ts (7)
Total: 41 passed
```

### ai.test.ts cases
- returns a legal action (brief Step 1)
- all difficulties × many rng seeds stay legal (raise bounds checked)
- free check never forces fold-only path
- preflop AA > 72o
- postflop category strength (royal vs air)
- flush draw +0.15
- other seats’ holeCards masked → still decides legally

## Concerns
- AI is rule-based (not GTO); intentional per design.
- Draw detection is coarse (4-flush / 4-straight window); gutshots not boosted.
- Random noise ±0.05 on strength; deterministic when rng fixed.
- `legal` empty → `{ type: 'fold' }` fallback (should not occur mid-hand).
